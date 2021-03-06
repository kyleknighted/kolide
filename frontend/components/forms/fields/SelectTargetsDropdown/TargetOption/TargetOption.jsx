import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

import Icon from 'components/icons/Icon';
import targetInterface from 'interfaces/target';
import TargetIcon from './TargetIcon';

const baseClass = 'target-option';

class TargetOption extends Component {
  static propTypes = {
    onMoreInfoClick: PropTypes.func,
    onSelect: PropTypes.func,
    target: targetInterface.isRequired,
  };

  handleSelect = (evt) => {
    const { onSelect, target } = this.props;

    return onSelect(target, evt);
  }

  renderTargetDetail = () => {
    const { target } = this.props;
    const { count, ip, target_type: targetType } = target;

    if (targetType === 'hosts') {
      return (
        <span>
          <span className={`${baseClass}__delimeter`}>&bull;</span>
          <span className={`${baseClass}__ip`}>{ip}</span>
        </span>
      );
    }

    return <span className={`${baseClass}__count`}>{count} hosts</span>;
  }

  render () {
    const { onMoreInfoClick, target } = this.props;
    const { display_text: displayText, target_type: targetType } = target;
    const {
      handleSelect,
      renderTargetDetail,
    } = this;
    const wrapperClassName = classnames(`${baseClass}__wrapper`, {
      '--is-label': targetType === 'labels',
      '--is-host': targetType === 'hosts',
    });

    return (
      <div className={wrapperClassName}>
        <button className={`button button--unstyled ${baseClass}__add-btn`} onClick={handleSelect}>
          <Icon name="add-button" />
        </button>
        <button className={`button button--unstyled ${baseClass}__target-content`} onClick={onMoreInfoClick(target)}>
          <TargetIcon target={target} />
          <span className={`${baseClass}__label-label`}>{displayText}</span>
          {renderTargetDetail()}
        </button>
      </div>
    );
  }
}

export default TargetOption;
