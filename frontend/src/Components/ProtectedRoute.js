import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Components/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="hr-loading-screen">Loading workspace...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to={user.role === 'employee' ? '/employee' : '/admin'} replace />;
    }

    return children;
};

export default ProtectedRoute;
