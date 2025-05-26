import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import './AuthForms.css';

const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
    const { register, isRegisterLoading, error, clearError } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
    });

    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (error) {
            clearError();
        }
    }, [formData, clearError, error]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

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
        } else if (formData.username.length < 3) {
            errors.username = 'نام کاربری باید حداقل 3 کاراکتر باشد';
        }

        if (!formData.email.trim()) {
            errors.email = 'ایمیل الزامی است';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'فرمت ایمیل صحیح نیست';
        }

        if (!formData.password) {
            errors.password = 'رمز عبور الزامی است';
        } else if (formData.password.length < 8) {
            errors.password = 'رمز عبور باید حداقل 8 کاراکتر باشد';
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = 'تکرار رمز عبور الزامی است';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'رمز عبور و تکرار آن یکسان نیستند';
        }

        if (!formData.firstName.trim()) {
            errors.firstName = 'نام الزامی است';
        }

        if (!formData.lastName.trim()) {
            errors.lastName = 'نام خانوادگی الزامی است';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const result = await register({
            username: formData.username.trim(),
            email: formData.email.trim(),
            password: formData.password,
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
        });

        if (result.success) {
            if (onSuccess) {
                onSuccess();
            }
        }
    };

    return (
        <div className="auth-form-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2 className="form-title">ثبت‌نام در سیستم</h2>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="firstName">نام</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={formErrors.firstName ? 'error' : ''}
                            placeholder="نام خود را وارد کنید"
                            disabled={isRegisterLoading}
                        />
                        {formErrors.firstName && (
                            <span className="field-error">{formErrors.firstName}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastName">نام خانوادگی</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={formErrors.lastName ? 'error' : ''}
                            placeholder="نام خانوادگی خود را وارد کنید"
                            disabled={isRegisterLoading}
                        />
                        {formErrors.lastName && (
                            <span className="field-error">{formErrors.lastName}</span>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="username">نام کاربری</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={formErrors.username ? 'error' : ''}
                        placeholder="نام کاربری مورد نظر را وارد کنید"
                        disabled={isRegisterLoading}
                    />
                    {formErrors.username && (
                        <span className="field-error">{formErrors.username}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="email">ایمیل</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={formErrors.email ? 'error' : ''}
                        placeholder="ایمیل خود را وارد کنید"
                        disabled={isRegisterLoading}
                    />
                    {formErrors.email && (
                        <span className="field-error">{formErrors.email}</span>
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
                            disabled={isRegisterLoading}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isRegisterLoading}
                        >
                            {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>
                    {formErrors.password && (
                        <span className="field-error">{formErrors.password}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">تکرار رمز عبور</label>
                    <div className="password-input-container">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={formErrors.confirmPassword ? 'error' : ''}
                            placeholder="رمز عبور را مجدداً وارد کنید"
                            disabled={isRegisterLoading}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isRegisterLoading}
                        >
                            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>
                    {formErrors.confirmPassword && (
                        <span className="field-error">{formErrors.confirmPassword}</span>
                    )}
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isRegisterLoading}
                    >
                        {isRegisterLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
                    </button>
                </div>

                <div className="form-footer">
                    <p>
                        حساب کاربری دارید؟{' '}
                        <button
                            type="button"
                            className="link-button"
                            onClick={onSwitchToLogin}
                            disabled={isRegisterLoading}
                        >
                            وارد شوید
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;