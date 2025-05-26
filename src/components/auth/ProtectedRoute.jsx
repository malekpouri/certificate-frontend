import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const ProtectedRoute = ({ children, adminOnly = false, redirectTo = '/login' }) => {
    const { isAuthenticated, isLoading, isAdmin } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>در حال بارگذاری...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    if (adminOnly && !isAdmin()) {
        return (
            <div className="access-denied-container">
                <h2>دسترسی محدود</h2>
                <p>شما دسترسی لازم برای مشاهده این صفحه را ندارید.</p>
                <button onClick={() => window.history.back()}>بازگشت</button>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;