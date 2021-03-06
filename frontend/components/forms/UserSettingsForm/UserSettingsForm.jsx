import React, { Component, PropTypes } from 'react';

import Button from 'components/buttons/Button';
import Form from 'components/forms/Form';
import formFieldInterface from 'interfaces/form_field';
import InputField from 'components/forms/fields/InputField';

const formFields = ['email', 'name', 'position', 'username'];

const baseClass = 'manage-user';

class UserSettingsForm extends Component {
  static propTypes = {
    fields: PropTypes.shape({
      email: formFieldInterface.isRequired,
      name: formFieldInterface.isRequired,
      position: formFieldInterface.isRequired,
      username: formFieldInterface.isRequired,
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  render () {
    const { fields, handleSubmit, onCancel } = this.props;

    return (
      <form onSubmit={handleSubmit} className={baseClass}>
        <InputField
          {...fields.username}
          autofocus
          label="Username (required)"
        />
        <InputField
          {...fields.email}
          label="Email (required)"
        />
        <InputField
          {...fields.name}
          label="Full Name"
        />
        <InputField
          {...fields.position}
          label="Position"
        />
        <div className={`${baseClass}__button-wrap`}>
          <Button onClick={onCancel} variant="inverse">CANCEL</Button>
          <Button type="submit" variant="brand">UPDATE</Button>
        </div>
      </form>
    );
  }
}

export default Form(UserSettingsForm, { fields: formFields });
