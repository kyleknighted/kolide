import React, { Component, PropTypes } from 'react';
import { noop } from 'lodash';
import AceEditor from 'react-ace';
import classnames from 'classnames';

import hostHelpers from 'components/hosts/HostDetails/helpers';
import Icon from 'components/icons/Icon';
import PlatformIcon from 'components/icons/PlatformIcon';
import targetInterface from 'interfaces/target';

const baseClass = 'target-details';

class TargetDetails extends Component {
  static propTypes = {
    target: targetInterface,
    className: PropTypes.string,
    handleBackToResults: PropTypes.func,
  };

  static defaultProps = {
    handleBackToResults: noop,
  };

  onlineHosts = (labelBaseClass, online) => {
    if (online > 0) {
      return (
        <span className={`${labelBaseClass}__hosts-online`}> ({online}% ONLINE)</span>
      );
    }

    return false;
  };

  renderHost = () => {
    const { className, handleBackToResults, target } = this.props;
    const {
      display_text: displayText,
      ip,
      mac,
      memory,
      osqueryVersion,
      osVersion,
      platform,
      status,
    } = target;
    const hostBaseClass = 'host-target';
    const isOnline = status === 'online';
    const isOffline = status === 'offline';
    const statusClassName = classnames(
      `${hostBaseClass}__status`,
      { [`${hostBaseClass}__status--is-online`]: isOnline },
      { [`${hostBaseClass}__status--is-offline`]: isOffline },
    );

    return (
      <div className={`${hostBaseClass} ${className}`}>
        <button className={`button button--unstyled ${hostBaseClass}__back`} onClick={handleBackToResults}>
          <Icon name="chevronleft" />Back
        </button>

        <p className={`${hostBaseClass}__display-text`}>
          <Icon name="single-host" fw className={`${hostBaseClass}__icon`} />
          <span>{displayText}</span>
        </p>
        <p className={statusClassName}>
          {isOnline && <Icon name="success-check" fw className={`${hostBaseClass}__icon ${hostBaseClass}__icon--online`} />}
          {isOffline && <Icon name="offline" fw className={`${hostBaseClass}__icon ${hostBaseClass}__icon--offline`} />}
          <span>{status}</span>
        </p>
        <table className={`${baseClass}__table`}>
          <tbody>
            <tr>
              <th>IP Address</th>
              <td>{ip}</td>
            </tr>
            <tr>
              <th>MAC Address</th>
              <td><span className={`${hostBaseClass}__mac-address`}>{mac}</span></td>
            </tr>
            <tr>
              <th>Platform</th>
              <td>
                <PlatformIcon name={platform} />
                <span className={`${hostBaseClass}__platform-text`}> {platform}</span>
              </td>
            </tr>
            <tr>
              <th>Operating System</th>
              <td>{osVersion}</td>
            </tr>
            <tr>
              <th>Osquery Version</th>
              <td>{osqueryVersion}</td>
            </tr>
            <tr>
              <th>Memory</th>
              <td>{hostHelpers.humanMemory(memory)}</td>
            </tr>
          </tbody>
        </table>
        <div className={`${hostBaseClass}__labels-wrapper`}>
          <p className={`${hostBaseClass}__labels-header`}>
            <Icon name="label" fw className={`${hostBaseClass}__icon`} />
            <span>Labels</span>
          </p>
          <ul className={`${hostBaseClass}__labels-list`}>
            <li>Engineering</li>
            <li>DevOps</li>
            <li>ElCapDev</li>
            <li>Workstation</li>
          </ul>
        </div>
      </div>
    );
  }

  renderLabel = () => {
    const { onlineHosts } = this;
    const { handleBackToResults, className, target } = this.props;
    const {
      count,
      description,
      display_text: displayText,
      label_type: labelType,
      online,
      query,
    } = target;
    const labelBaseClass = 'label-target';

    return (
      <div className={`${labelBaseClass} ${className}`}>
        <button className={`button button--unstyled ${labelBaseClass}__back`} onClick={handleBackToResults}>
          <Icon name="chevronleft" /> Back
        </button>

        <p className={`${labelBaseClass}__display-text`}>
          <Icon name="label" fw className={`${labelBaseClass}__icon`} />
          <span>{displayText}</span>
        </p>

        <p className={`${labelBaseClass}__hosts`}>
          <span className={`${labelBaseClass}__hosts-count`}><strong>{count}</strong>HOSTS</span>
          { onlineHosts(labelBaseClass, online) }
        </p>

        <p className={`${labelBaseClass}__description`}>{description || 'No Description'}</p>

        {labelType !== 1 &&
          <div className={`${labelBaseClass}__editor`}>
            <AceEditor
              editorProps={{ $blockScrolling: Infinity }}
              mode="kolide"
              minLines={1}
              maxLines={20}
              name="label-query"
              readOnly
              setOptions={{ wrap: true }}
              showGutter={false}
              showPrintMargin={false}
              theme="kolide"
              value={query}
              width="100%"
              fontSize={14}
            />
          </div>
        }
      </div>
    );
  }

  render () {
    const { target } = this.props;

    if (!target) {
      return false;
    }

    const { target_type: targetType } = target;
    const { renderHost, renderLabel } = this;

    if (targetType === 'labels') {
      return renderLabel();
    }

    return renderHost();
  }
}

export default TargetDetails;
