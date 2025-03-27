import React from 'react';
import { Redirect } from 'react-router-dom';
import { UserRole } from '../layouts/AppRoute';

interface AuthWrapperProps {
    roles: UserRole[];
    userRole: UserRole;
    children: React.ReactNode;
}

class AuthWrapper extends React.Component<AuthWrapperProps> {
    render () {
        const { roles, userRole, children } = this.props;
        return roles.includes(userRole) ? <>{ children }</> : <Redirect to="/not-found" />;
    }
}

export default AuthWrapper;
