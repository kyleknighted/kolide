import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

import Icon from 'components/Icon';
import targetInterface from 'interfaces/target';

const baseClass = 'target-option';

class TargetOption extends Component {
  static propTypes = {
    onMoreInfoClick: PropTypes.func,
    onRemoveMoreInfoTarget: PropTypes.func,
    onSelect: PropTypes.func,
    target: targetInterface.isRequired,
  };

  handleRemoveMoreInfoTarget = (evt) => {
    evt.preventDefault();

    const { onRemoveMoreInfoTarget } = this.props;

    return onRemoveMoreInfoTarget();
  }

  handleSelect = (evt) => {
    const { onSelect, target } = this.props;

    return onSelect(target, evt);
  }

  hostPlatformIconClass = () => {
    const { platform } = this.props.target;

    return platform === 'darwin' ? 'kolidecon-apple' : `kolidecon-${platform}`;
  }

  renderTargetDetail = () => {
    const { target } = this.props;
    const { count, ip, target_type: targetType } = target;

    if (targetType === 'hosts') {
      return <span className={`${baseClass}__ip`}>{ip}</span>;
    }

    return <span className={`${baseClass}__count`}>{count} hosts</span>;
  }

  render () {
    const { onMoreInfoClick, target } = this.props;
    const { display_text: displayText, target_type: targetType } = target;
    const {
      handleSelect,
      hostPlatformIconClass,
      renderTargetDetail,
    } = this;
    const wrapperClassName = classnames(`${baseClass}__wrapper`, {
      '--is-label': targetType === 'labels',
      '--is-host': targetType === 'hosts',
    });

    return (
      <div className={wrapperClassName}>
        <button className={`button button--unstyled ${baseClass}__add-btn`} onClick={handleSelect}>
          <i className="kolidecon-add-button" />
        </button>
        <button className={`button button--unstyled ${baseClass}__target-content`} onClick={onMoreInfoClick(target)}>
          {targetType === 'hosts' && <Icon iconName={hostPlatformIconClass()} className={`${baseClass}__icon`} />}
          {targetType === 'labels' && <Icon iconName="label" className={`${baseClass}__icon`} />}
          <span className={`${baseClass}__label-label`}>{displayText}</span>
          <span className={`${baseClass}__delimeter`}>&bull;</span>
          {renderTargetDetail()}
        </button>
      </div>
    );
  }
}

export default TargetOption;
