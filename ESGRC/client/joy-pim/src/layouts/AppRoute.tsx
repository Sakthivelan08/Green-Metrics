import React from 'react';
import { Route, Switch } from 'react-router-dom';
// import HomePage from './pages/HomePage';
// import AdminPage from './pages/AdminPage';
import NotFoundPage from '../pages/PageNotFound';
import AuthWrapper from '../components/AuthWrapper';
import SupplierQAForm from '../components/forms/SupplierForm';

export enum UserRole {
  Admin = 'admin',
  User = 'user',
}

interface RouteConfig {
  path: string;
  component: React.ComponentType;
  roles: UserRole[];
}

export const routes: RouteConfig[] = [
  { path: '/', component: SupplierQAForm, roles: [UserRole.Admin, UserRole.User] },
  { path: '/admin', component: SupplierQAForm, roles: [UserRole.Admin] },
];

interface AppRoutesProps {
  userRole: UserRole;
}

class AppRoutes extends React.Component<AppRoutesProps> {
  render() {
    const { userRole } = this.props;
    return (
      <Switch>
        {routes.map(({ path, component: Component, roles }) => (
          <Route
            key={path}
            path={path}
            render={() => (
              <AuthWrapper roles={roles} userRole={userRole}>
                <Component />
              </AuthWrapper>
            )}
          />
        ))}
        <Route path="*" component={NotFoundPage} />
      </Switch>
    );
  }
}

export default AppRoutes;
