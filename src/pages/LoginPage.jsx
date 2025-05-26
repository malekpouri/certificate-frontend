import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm.jsx';
import RegisterForm from '../components/auth/RegisterForm.jsx';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    const handleLoginSuccess = () => {
        navigate(from, { replace: true });
    };

    const handleRegisterSuccess = () => {
        setIsLogin(true);
        alert('ثبت‌نام با موفقیت انجام شد. لطفاً وارد شوید.');
    };

    const switchToRegister = () => {
        setIsLogin(false);
    };

    const switchToLogin = () => {
        setIsLogin(true);
    };

    return (
        <div className="login-page">
            {isLogin ? (
                <LoginForm
                    onSuccess={handleLoginSuccess}
                    onSwitchToRegister={switchToRegister}
                />
            ) : (
                <RegisterForm
                    onSuccess={handleRegisterSuccess}
                    onSwitchToLogin={switchToLogin}
                />
            )}
        </div>
    );
};

export default LoginPage;