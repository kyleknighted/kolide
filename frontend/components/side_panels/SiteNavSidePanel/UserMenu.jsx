import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

import Icon from 'components/Icon';

class UserMenu extends Component {
  static propTypes = {
    isOpened: PropTypes.bool,
    user: PropTypes.shape({
      gravatarURL: PropTypes.string,
      name: PropTypes.string,
      position: PropTypes.string,
    }).isRequired,
  };

  static defaultProps = {
    isOpened: false,
  };

  render () {
    const {
      isOpened,
      user: {
        gravatarURL,
        name,
        position,
      },
    } = this.props;

    const toggleBaseClass = 'user-menu-toggle';
    const userMenuClass = classnames(
      toggleBaseClass,
      { [`${toggleBaseClass}--open`]: isOpened }
    );

    return (
      <div className={userMenuClass}>
        <img
          alt="User Avatar"
          src={gravatarURL}
          className={`${toggleBaseClass}__avatar`}
        />

        <p className={`${toggleBaseClass}__name`}>{ name }</p>
        <p className={`${toggleBaseClass}__position`}>{ position }</p>

        <nav className={`${toggleBaseClass}__nav`}>
          <ul className={`${toggleBaseClass}__nav-list`}>
            <li className={`${toggleBaseClass}__nav-item`}>
              <a href="#user-settings">
                <Icon name="user-settings" /><span>Account Settings</span>
              </a>
            </li>
            <li className={`${toggleBaseClass}__nav-item`}>
              <a href="#logout">
                <Icon name="logout" /><span>Log Out</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    );
  }
}

export default UserMenu;
