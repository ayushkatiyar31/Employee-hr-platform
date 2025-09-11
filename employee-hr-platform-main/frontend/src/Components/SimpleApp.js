import React, { useState, useEffect } from 'react';
import ProfileSetup from './ProfileSetup';
import MainLayout from './MainLayout';
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

    return (
        <ErrorBoundary>
            <MainLayout user={user} onLogout={logout} />
        </ErrorBoundary>
    );
};

export default SimpleApp;