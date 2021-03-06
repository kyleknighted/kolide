import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { isEqual, noop } from 'lodash';

import Kolide from 'kolide';
import targetInterface from 'interfaces/target';
import { formatSelectedTargetsForApi } from 'kolide/helpers';
import Input from './SelectTargetsInput';
import Menu from './SelectTargetsMenu';

const baseClass = 'target-select';

class SelectTargetsDropdown extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    error: PropTypes.string,
    label: PropTypes.string,
    onFetchTargets: PropTypes.func,
    onSelect: PropTypes.func.isRequired,
    selectedTargets: PropTypes.arrayOf(targetInterface),
    targetsCount: PropTypes.number,
  };

  static defaultProps = {
    disabled: false,
    onFetchTargets: noop,
  };

  constructor (props) {
    super(props);

    this.mounted = true;

    this.state = {
      isEmpty: false,
      isLoadingTargets: false,
      moreInfoTarget: null,
      query: '',
      targets: [],
    };
  }

  componentDidMount () {
    this.fetchTargets();

    return false;
  }

  componentWillReceiveProps (nextProps) {
    const { selectedTargets } = nextProps;
    const { query } = this.state;

    if (!isEqual(selectedTargets, this.props.selectedTargets)) {
      this.fetchTargets(query, selectedTargets);
    }
  }

  componentWillUnmount () {
    this.mounted = false;
  }

  onInputClose = () => {
    this.setState({ moreInfoTarget: null, query: '' });

    return false;
  }

  onTargetSelectMoreInfo = (moreInfoTarget) => {
    return (evt) => {
      evt.preventDefault();

      const currentMoreInfoTarget = this.state.moreInfoTarget || {};

      if (isEqual(moreInfoTarget.display_text, currentMoreInfoTarget.display_text)) {
        return false;
      }

      const { target_type: targetType } = moreInfoTarget;

      if (targetType.toLowerCase() === 'labels') {
        return Kolide.getLabelHosts(moreInfoTarget.id)
          .then((hosts) => {
            this.setState({
              moreInfoTarget: { ...moreInfoTarget, hosts },
            });

            return false;
          });
      }

      this.setState({ moreInfoTarget });

      return false;
    };
  }

  onBackToResults = () => {
    this.setState({
      moreInfoTarget: null,
    });
  }

  fetchTargets = (query, selectedTargets = this.props.selectedTargets) => {
    const { onFetchTargets } = this.props;

    if (!this.mounted) {
      return false;
    }

    this.setState({ isLoadingTargets: true, query });

    return Kolide.getTargets(query, formatSelectedTargetsForApi(selectedTargets))
      .then((response) => {
        const {
          targets,
        } = response;

        if (!this.mounted) {
          return false;
        }

        if (targets.length === 0) {
          // We don't want the lib's default "No Results" so we fake it
          targets.push({});

          this.setState({ isEmpty: true });
        } else {
          this.setState({ isEmpty: false });
        }

        onFetchTargets(query, response);

        this.setState({ isLoadingTargets: false, targets });

        return query;
      })
      .catch((error) => {
        if (this.mounted) {
          this.setState({ isLoadingTargets: false });
        }

        throw error;
      });
  }

  renderLabel = () => {
    const { error, label, targetsCount } = this.props;

    const labelClassName = classnames(`${baseClass}__label`, {
      [`${baseClass}__label--error`]: error,
    });

    if (!label) {
      return false;
    }

    return (
      <p className={labelClassName}>
        <span className={`${baseClass}__select-targets`}>{error || label}</span>
        <span className={`${baseClass}__targets-count`}> {targetsCount} unique {targetsCount === 1 ? 'host' : 'hosts' }</span>
      </p>
    );
  }

  render () {
    const { isEmpty, isLoadingTargets, moreInfoTarget, targets } = this.state;
    const {
      fetchTargets,
      onBackToResults,
      onInputClose,
      onTargetSelectMoreInfo,
      renderLabel,
    } = this;
    const { disabled, onSelect, selectedTargets } = this.props;
    const menuRenderer = Menu(onTargetSelectMoreInfo, moreInfoTarget, onBackToResults);

    const inputClasses = classnames({
      'show-preview': moreInfoTarget,
      'is-empty': isEmpty,
    });

    return (
      <div className={baseClass}>
        {renderLabel()}
        <Input
          className={inputClasses}
          disabled={disabled}
          isLoading={isLoadingTargets}
          menuRenderer={menuRenderer}
          onClose={onInputClose}
          onTargetSelect={onSelect}
          onTargetSelectInputChange={fetchTargets}
          selectedTargets={selectedTargets}
          targets={targets}
        />
      </div>
    );
  }
}

export default SelectTargetsDropdown;
