import React from 'react';
import ProfileSetup from './ProfileSetup';
import EmployeeManagementApp from './EmployeeManagementApp';
import EmployeeSelfServiceApp from './EmployeeSelfServiceApp';
import ErrorBoundary from './ErrorBoundary';
import { useAuth } from './AuthContext';

const SimpleApp = () => {
    const { user, loading, login, logout } = useAuth();

    const handleProfileComplete = (userData) => {
        login(userData, 'demo-token-' + Date.now());
    };

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <ErrorBoundary>
                <ProfileSetup onComplete={handleProfileComplete} />
            </ErrorBoundary>
        );
    }

    const normalizedRole = (user.role || '').toLowerCase();
    const isEmployee = normalizedRole === 'employee';

    return (
        <ErrorBoundary>
            {isEmployee ? (
                <EmployeeSelfServiceApp user={user} onLogout={logout} />
            ) : (
                <EmployeeManagementApp user={user} onLogout={logout} />
            )}
        </ErrorBoundary>
    );
};

export default SimpleApp;
