import {
    setTokens,
    getRefreshToken,
    removeTokens,
    getAuthHeader
} from '../utils/tokenHelper';

// Base URL برای API - باید با backend شما تطبیق داده شود
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Helper function برای handle کردن API responses
 */
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.detail || 'خطا در برقراری ارتباط با سرور');
    }

    return response.json();
};

/**
 * Helper function برای ایجاد API request
 */
const apiRequest = async (url, options = {}) => {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...defaultOptions,
        ...options,
    });

    return handleResponse(response);
};

/**
 * ورود کاربر
 */
export const login = async (credentials) => {
    try {
        const response = await fetch(`${API_BASE_URL}/token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: credentials.username,
                password: credentials.password,
            }),
        });

        const data = await handleResponse(response);

        // ذخیره token ها
        setTokens(data.access, data.refresh);

        return {
            success: true,
            user: data.user || null,
            message: 'ورود با موفقیت انجام شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در ورود به سیستم'
        };
    }
};

/**
 * ثبت‌نام کاربر جدید
 */
export const register = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: userData.username,
                email: userData.email,
                password: userData.password,
                first_name: userData.firstName || '',
                last_name: userData.lastName || '',
            }),
        });

        const data = await handleResponse(response);

        return {
            success: true,
            user: data.user || null,
            message: 'ثبت‌نام با موفقیت انجام شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در ثبت‌نام'
        };
    }
};

/**
 * خروج از سیستم
 */
export const logout = async () => {
    try {
        // اختیاری: می‌توانید درخواست logout به backend بفرستید
        // await apiRequest('/logout/', { method: 'POST' });

        // حذف token ها از localStorage
        removeTokens();

        return {
            success: true,
            message: 'خروج با موفقیت انجام شد'
        };
    } catch (error) {
        // حتی اگر API خطا بدهد، token ها را حذف کنیم
        removeTokens();

        return {
            success: true,
            message: 'خروج انجام شد'
        };
    }
};

/**
 * تجدید token با استفاده از refresh token
 */
export const refreshToken = async () => {
    try {
        const refresh = getRefreshToken();
        if (!refresh) {
            throw new Error('Refresh token not found');
        }

        const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refresh: refresh,
            }),
        });

        const data = await handleResponse(response);

        // ذخیره token جدید
        setTokens(data.access, refresh);

        return {
            success: true,
            token: data.access
        };
    } catch (error) {
        // اگر refresh token هم منقضی شده، کاربر را logout کنیم
        removeTokens();

        return {
            success: false,
            message: 'نشست شما منقضی شده. لطفاً مجدداً وارد شوید.'
        };
    }
};

/**
 * دریافت اطلاعات پروفایل کاربر
 */
export const getUserProfile = async () => {
    try {
        const data = await apiRequest('/user/profile/');

        return {
            success: true,
            user: data
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در دریافت اطلاعات کاربر'
        };
    }
};

/**
 * بروزرسانی اطلاعات پروفایل کاربر
 */
export const updateUserProfile = async (userData) => {
    try {
        const data = await apiRequest('/user/profile/', {
            method: 'PUT',
            body: JSON.stringify(userData),
        });

        return {
            success: true,
            user: data,
            message: 'اطلاعات با موفقیت بروزرسانی شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در بروزرسانی اطلاعات'
        };
    }
};

/**
 * تغییر رمز عبور
 */
export const changePassword = async (passwordData) => {
    try {
        await apiRequest('/user/change-password/', {
            method: 'POST',
            body: JSON.stringify({
                old_password: passwordData.oldPassword,
                new_password: passwordData.newPassword,
            }),
        });

        return {
            success: true,
            message: 'رمز عبور با موفقیت تغییر کرد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در تغییر رمز عبور'
        };
    }
};

// Export default object با تمام functions
const authService = {
    login,
    register,
    logout,
    refreshToken,
    getUserProfile,
    updateUserProfile,
    changePassword,
};

export default authService;