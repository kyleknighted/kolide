import React from 'react';
import expect, { createSpy, restoreSpies } from 'expect';
import { mount } from 'enzyme';
import { noop } from 'lodash';

import EditPackForm from 'components/forms/packs/EditPackForm';
import {
  fillInFormInput,
  itBehavesLikeAFormInputElement,
} from 'test/helpers';
import { packStub } from 'test/stubs';

describe('EditPackForm - component', () => {
  afterEach(restoreSpies);

  describe('form fields', () => {
    const form = mount(<EditPackForm formData={packStub} handleSubmit={noop} />);

    it('has the correct form fields', () => {
      itBehavesLikeAFormInputElement(form, 'name');
      itBehavesLikeAFormInputElement(form, 'description');
    });
  });

  describe('form submission', () => {
    it('submits the forms with the form data', () => {
      const spy = createSpy();
      const form = mount(<EditPackForm formData={packStub} handleSubmit={spy} />);

      const nameInput = form.find({ name: 'name' }).find('input');
      const descriptionInput = form.find({ name: 'description' }).find('input');

      fillInFormInput(nameInput, 'Updated pack name');
      fillInFormInput(descriptionInput, 'Updated pack description');
      form.simulate('submit');

      expect(spy).toHaveBeenCalledWith({
        ...packStub,
        name: 'Updated pack name',
        description: 'Updated pack description',
      });
    });
  });
});