import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { hideBackgroundImage, showBackgroundImage } from 'redux/nodes/app/actions';
import LoginPage from 'pages/LoginPage';
import Footer from 'components/Footer';

export class LoginRoutes extends Component {
  static propTypes = {
    children: PropTypes.element,
    dispatch: PropTypes.func,
    isResetPassPage: PropTypes.bool,
    isForgotPassPage: PropTypes.bool,
    pathname: PropTypes.string,
    token: PropTypes.string,
  };

  componentWillMount () {
    const { dispatch } = this.props;

    dispatch(showBackgroundImage);
  }

  componentWillUnmount () {
    const { dispatch } = this.props;

    dispatch(hideBackgroundImage);
  }

  render () {
    const {
      children,
      isResetPassPage,
      isForgotPassPage,
      pathname,
      token,
    } = this.props;

    return (
      <div className="login-routes">
        {children ||
          <LoginPage
            pathname={pathname}
            token={token}
            isForgotPassPage={isForgotPassPage}
            isResetPassPage={isResetPassPage}
          />}
        <Footer />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { location: { pathname, query } } = ownProps;
  const { token } = query;

  const isForgotPassPage = pathname === '/login/forgot';
  const isResetPassPage = pathname === '/login/reset';

  return {
    isForgotPassPage,
    isResetPassPage,
    pathname,
    token,
  };
};

export default connect(mapStateToProps)(LoginRoutes);
