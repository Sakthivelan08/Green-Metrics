import React, { Suspense } from 'react';
import AuthManagerService from '@/services/AuthManagerService';
import router from 'umi/router';
import ApiManager from '@/services/ApiManager';
import { withTranslation } from 'react-i18next';
import { AdalConfig, AuthenticationContext, runWithAdal } from 'react-adal';
import { LoginViewModel } from '@/services/ApiClient';

class Login extends React.Component<any, any> {

  authManager = new AuthManagerService();
  apiClient = new ApiManager().CreateApiClient();

  constructor(props: any) {
    super(props);
    this.state = {
      isRegistering: false,
      formType: null,
    };
  }

  async componentDidMount() {
    const isAuthenticated = this.authManager.isAuthenticated();
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      router.push('/overview');
    }
  }

  async login() {
    const appConfiguration: any = await this.apiClient.getAppConfig();
    const loginSite = appConfiguration?.result?.find((e: any) => e.name == "IdentityProvider")?.value;
    if (loginSite == 'AzureAD') {
      window.location.href = '/overview'
    }
    else if (loginSite == 'b2c') {
      this.authManager.gotoB2CSignIn();
    }
  }

  render() {
    this.login();
    return (
      <>
      </>
    );
  }

  private setUserIsRegistering(b: boolean) {
    this.setState({ isRegistering: b });
  }
}

const ComponentTranslated = withTranslation()(Login);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;