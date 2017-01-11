import * as React from 'react';
const classnames = require('classnames');

const baseClass = 'button';

interface IButtonProps {
  autofocus: boolean;
  children: React.ReactChild;
  className: string;
  disabled: boolean;
  onClick: (evt: React.MouseEvent<HTMLButtonElement>) => boolean;
  size: string;
  tabIndex: number;
  type: string;
  title: string;
  variant: string;
}

interface IButtonState {}

interface Inputs {
  button?: HTMLButtonElement;
}

class Button extends React.Component<IButtonProps, IButtonState> {
  inputs: Inputs = {};

  static defaultProps = {
    size: '',
    type: 'button',
    variant: 'default',
  };

  componentDidMount () {
    const { autofocus } = this.props;
    const { inputs: { button } } = this;

    if (autofocus && button) {
      button.focus();
    }

    return false;
  }

  handleClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
    const { disabled, onClick } = this.props;

    if (disabled) {
      return false;
    }

    if (onClick) {
      onClick(evt);
    }

    return false;
  }

  render () {
    const { handleClick } = this;
    const { children, className, disabled, size, tabIndex, type, title, variant } = this.props;
    const fullClassName = classnames(baseClass, `${baseClass}--${variant}`, className, {
      [`${baseClass}--disabled`]: disabled,
      [`${baseClass}--${size}`]: size,
    });

    return (
      <button
        className={fullClassName}
        disabled={disabled}
        onClick={handleClick}
        tabIndex={tabIndex}
        type={type}
        title={title}
        ref={(b) => this.inputs.button = b}
      >
        {children}
      </button>
    );
  }
}

export default Button;
