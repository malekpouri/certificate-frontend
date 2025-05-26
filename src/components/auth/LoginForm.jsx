import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import './AuthForms.css';

const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
    const { login, isLoginLoading, error, clearError } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    // پاک کردن خطا هنگام تغییر فرم
    useEffect(() => {
        if (error) {
            clearError();
        }
    }, [formData.username, formData.password, clearError, error]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // پاک کردن خطای مربوط به فیلد
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.username.trim()) {
            errors.username = 'نام کاربری الزامی است';
        }

        if (!formData.password) {
            errors.password = 'رمز عبور الزامی است';
        } else if (formData.password.length < 6) {
            errors.password = 'رمز عبور باید حداقل 6 کاراکتر باشد';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const result = await login({
            username: formData.username.trim(),
            password: formData.password,
        });

        if (result.success) {
            if (onSuccess) {
                onSuccess();
            }
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="auth-form-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2 className="form-title">ورود به سیستم</h2>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="username">نام کاربری یا ایمیل</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={formErrors.username ? 'error' : ''}
                        placeholder="نام کاربری یا ایمیل خود را وارد کنید"
                        disabled={isLoginLoading}
                    />
                    {formErrors.username && (
                        <span className="field-error">{formErrors.username}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="password">رمز عبور</label>
                    <div className="password-input-container">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={formErrors.password ? 'error' : ''}
                            placeholder="رمز عبور خود را وارد کنید"
                            disabled={isLoginLoading}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={togglePasswordVisibility}
                            disabled={isLoginLoading}
                        >
                            {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>
                    {formErrors.password && (
                        <span className="field-error">{formErrors.password}</span>
                    )}
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isLoginLoading}
                    >
                        {isLoginLoading ? 'در حال ورود...' : 'ورود'}
                    </button>
                </div>

                <div className="form-footer">
                    <p>
                        حساب کاربری ندارید؟{' '}
                        <button
                            type="button"
                            className="link-button"
                            onClick={onSwitchToRegister}
                            disabled={isLoginLoading}
                        >
                            ثبت‌نام کنید
                        </button>
                    </p>

                    <button
                        type="button"
                        className="link-button forgot-password"
                        disabled={isLoginLoading}
                    >
                        رمز عبور را فراموش کرده‌اید؟
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;