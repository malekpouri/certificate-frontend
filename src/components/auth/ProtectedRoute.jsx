// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const ProtectedRoute = ({ children, adminOnly = false, redirectTo = '/login' }) => {
    const { isAuthenticated, isLoading, isAdmin } = useAuth();
    const location = useLocation();

    // اضافه کردن لاگ‌های زیر برای اشکال‌زدایی
    console.log("ProtectedRoute: Rendering. isAuthenticated:", isAuthenticated, "isLoading:", isLoading, "Path:", location.pathname);


    if (isLoading) {
        console.log("ProtectedRoute: Showing loading state.");
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>در حال بارگذاری...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        console.log("ProtectedRoute: Not authenticated. Redirecting to login.");
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    if (adminOnly && !isAdmin()) {
        console.log("ProtectedRoute: Not admin. Showing access denied.");
        return (
            <div className="access-denied-container">
                <h2>دسترسی محدود</h2>
                <p>شما دسترسی لازم برای مشاهده این صفحه را ندارید.</p>
                <button onClick={() => window.history.back()}>بازگشت</button>
            </div>
        );
    }

    console.log("ProtectedRoute: Authenticated and authorized. Rendering children.");
    return children;
};

export default ProtectedRoute;