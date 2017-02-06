import expect, { restoreSpies, spyOn } from 'expect';

import * as Kolide from 'kolide';
import userActions from 'redux/nodes/entities/users/actions';

import { reduxMockStore } from 'test/helpers';
import { userStub } from 'test/stubs';

import {
  createLicense,
  getLicense,
  LICENSE_FAILURE,
  LICENSE_REQUEST,
  LICENSE_SUCCESS,
  performRequiredPasswordReset,
  PERFORM_REQUIRED_PASSWORD_RESET_REQUEST,
  PERFORM_REQUIRED_PASSWORD_RESET_FAILURE,
  PERFORM_REQUIRED_PASSWORD_RESET_SUCCESS,
  updateUser,
} from './actions';

const store = { entities: { invites: {}, users: {} } };
const user = { ...userStub, id: 1, email: 'zwass@kolide.co', force_password_reset: false };

describe('Auth - actions', () => {
  describe('#createLicense', () => {
    const license = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';
    afterEach(restoreSpies);

    describe('successful request', () => {
      beforeEach(() => {
        spyOn(Kolide.default.license, 'create').andReturn(Promise.resolve({ license }));
      });

      it('calls the API', () => {
        const mockStore = reduxMockStore(store);

        mockStore.dispatch(createLicense({ license }))
          .then(() => {
            expect(Kolide.default.license.create).toHaveBeenCalledWith(license);
          })
          .catch(() => {
            expect(Kolide.default.license.create).toHaveBeenCalledWith(license);
          });
      });

      it('dispatches the correct actions', () => {
        const mockStore = reduxMockStore(store);
        const expectedActions = [
          { type: LICENSE_REQUEST },
          {
            type: LICENSE_SUCCESS,
            payload: { license: { license } },
          },
        ];

        return mockStore.dispatch(createLicense({ license }))
          .then(() => {
            expect(mockStore.getActions()).toEqual(expectedActions);
          })
          .catch(() => {
            expect(mockStore.getActions()).toEqual(expectedActions);
          });
      });
    });

    describe('unsuccessful request', () => {
      const errors = [
        {
          name: 'base',
          reason: 'Unable to create license',
        },
      ];
      const errorResponse = {
        status: 422,
        message: {
          message: 'Unable to create license',
          errors,
        },
      };

      beforeEach(() => {
        spyOn(Kolide.default.license, 'create').andReturn(Promise.reject(errorResponse));
      });

      it('calls the API', () => {
        const mockStore = reduxMockStore(store);

        mockStore.dispatch(createLicense({ license }))
          .then(() => {
            expect(Kolide.default.license.create).toHaveBeenCalledWith(license);
          })
          .catch(() => {
            expect(Kolide.default.license.create).toHaveBeenCalledWith(license);
          });
      });

      it('dispatches the correct actions', () => {
        const mockStore = reduxMockStore(store);
        const expectedActions = [
          { type: LICENSE_REQUEST },
          {
            type: LICENSE_FAILURE,
            payload: { errors: { base: 'Unable to create license', http_status: 422 } },
          },
        ];

        return mockStore.dispatch(createLicense({ license }))
          .then(() => {
            expect(mockStore.getActions()).toEqual(expectedActions);
          })
          .catch(() => {
            expect(mockStore.getActions()).toEqual(expectedActions);
          });
      });
    });
  });

  describe('#getLicense', () => {
    const license = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';
    afterEach(restoreSpies);

    describe('successful request', () => {
      beforeEach(() => {
        spyOn(Kolide.default.license, 'load').andReturn(Promise.resolve({ license }));
      });

      it('calls the API', () => {
        const mockStore = reduxMockStore(store);

        mockStore.dispatch(getLicense())
          .then(() => {
            expect(Kolide.default.license.load).toHaveBeenCalled();
          })
          .catch(() => {
            expect(Kolide.default.license.load).toHaveBeenCalled();
          });
      });

      it('dispatches the correct actions', () => {
        const mockStore = reduxMockStore(store);
        const expectedActions = [
          { type: LICENSE_REQUEST },
          {
            type: LICENSE_SUCCESS,
            payload: { license: { license } },
          },
        ];

        return mockStore.dispatch(getLicense())
          .then(() => {
            expect(mockStore.getActions()).toEqual(expectedActions);
          })
          .catch(() => {
            expect(mockStore.getActions()).toEqual(expectedActions);
          });
      });
    });

    describe('unsuccessful request', () => {
      const errors = [
        {
          name: 'base',
          reason: 'Unable to get license',
        },
      ];
      const errorResponse = {
        status: 422,
        message: {
          message: 'Unable to get license',
          errors,
        },
      };

      beforeEach(() => {
        spyOn(Kolide.default.license, 'load').andReturn(Promise.reject(errorResponse));
      });

      it('calls the API', () => {
        const mockStore = reduxMockStore(store);

        mockStore.dispatch(getLicense())
          .then(() => {
            expect(Kolide.default.license.load).toHaveBeenCalled();
          })
          .catch(() => {
            expect(Kolide.default.license.load).toHaveBeenCalled();
          });
      });

      it('dispatches the correct actions', () => {
        const mockStore = reduxMockStore(store);
        const expectedActions = [
          { type: LICENSE_REQUEST },
          {
            type: LICENSE_FAILURE,
            payload: { errors: { base: 'Unable to get license', http_status: 422 } },
          },
        ];

        return mockStore.dispatch(getLicense())
          .then(() => {
            expect(mockStore.getActions()).toEqual(expectedActions);
          })
          .catch(() => {
            expect(mockStore.getActions()).toEqual(expectedActions);
          });
      });
    });
  });

  describe('dispatching the perform required password reset action', () => {
    describe('successful request', () => {
      beforeEach(() => {
        spyOn(Kolide.default, 'performRequiredPasswordReset').andCall(() => {
          return Promise.resolve({ ...user, force_password_reset: false });
        });
      });

      afterEach(restoreSpies);

      const resetParams = { password: 'foobar' };

      it('calls the resetFunc', () => {
        const mockStore = reduxMockStore(store);

        return mockStore.dispatch(performRequiredPasswordReset(resetParams))
          .then(() => {
            expect(Kolide.default.performRequiredPasswordReset).toHaveBeenCalledWith(resetParams);
          });
      });

      it('dispatches the correct actions', () => {
        const mockStore = reduxMockStore(store);

        const expectedActions = [
          { type: PERFORM_REQUIRED_PASSWORD_RESET_REQUEST },
          {
            type: PERFORM_REQUIRED_PASSWORD_RESET_SUCCESS,
            payload: { user: { ...user, force_password_reset: false } },
          },
        ];

        return mockStore.dispatch(performRequiredPasswordReset(resetParams))
          .then(() => {
            expect(mockStore.getActions()).toEqual(expectedActions);
          });
      });
    });

    describe('unsuccessful request', () => {
      const errors = [
        {
          name: 'base',
          reason: 'Unable to reset password',
        },
      ];
      const errorResponse = {
        status: 422,
        message: {
          message: 'Unable to perform reset',
          errors,
        },
      };
      const resetParams = { password: 'foobar' };

      beforeEach(() => {
        spyOn(Kolide.default, 'performRequiredPasswordReset').andCall(() => {
          return Promise.reject(errorResponse);
        });
      });

      afterEach(restoreSpies);

      it('calls the resetFunc', () => {
        const mockStore = reduxMockStore(store);

        return mockStore.dispatch(performRequiredPasswordReset(resetParams))
          .then(() => {
            throw new Error('promise should have failed');
          })
          .catch(() => {
            expect(Kolide.default.performRequiredPasswordReset).toHaveBeenCalledWith(resetParams);
          });
      });

      it('dispatches the correct actions', () => {
        const mockStore = reduxMockStore(store);

        const expectedActions = [
          { type: PERFORM_REQUIRED_PASSWORD_RESET_REQUEST },
          {
            type: PERFORM_REQUIRED_PASSWORD_RESET_FAILURE,
            payload: { errors: { base: 'Unable to reset password', http_status: 422 } },
          },
        ];

        return mockStore.dispatch(performRequiredPasswordReset(resetParams))
          .then(() => {
            throw new Error('promise should have failed');
          })
          .catch(() => {
            expect(mockStore.getActions()).toEqual(expectedActions);
          });
      });
    });
  });

  describe('#updateUser', () => {
    it('calls the user update action', () => {
      const updatedAttrs = { name: 'Jerry Garcia' };
      const updatedUser = { ...userStub, ...updatedAttrs };
      const mockStore = reduxMockStore(store);
      const expectedActions = [
        { type: 'UPDATE_USER_REQUEST' },
        { type: 'UPDATE_USER_SUCCESS', payload: { user: updatedUser } },
      ];

      spyOn(userActions, 'update').andReturn(() => Promise.resolve(updatedUser));

      return mockStore.dispatch(updateUser(userStub, updatedAttrs))
        .then(() => {
          expect(mockStore.getActions()).toEqual(expectedActions);
        })
        .catch(() => {
          throw new Error(`Expected ${mockStore.getActions()} to equal ${expectedActions}`);
        });
    });
  });
});
