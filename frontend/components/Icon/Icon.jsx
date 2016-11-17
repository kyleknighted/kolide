import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

class Icon extends Component {

  static propTypes = {
    className: PropTypes.string,
    iconName: PropTypes.string.isRequired,
    title: PropTypes.string,
  };

  static defaultProps = {
    className: '',
    title: '',
  };

  render () {
    const { className, iconName, title } = this.props;
    const baseClass = 'kolidecon';

    const iconClasses = classnames(baseClass, className, `${baseClass}-${iconName}`);

    return (
      <i className={iconClasses} title={title} />
    );
  }
}

export default Icon;
