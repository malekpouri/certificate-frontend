// Token management utilities
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * ذخیره token در localStorage
 */
export const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
};

/**
 * دریافت access token از localStorage
 */
export const getAccessToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * دریافت refresh token از localStorage
 */
export const getRefreshToken = () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * حذف همه token ها از localStorage
 */
export const removeTokens = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * بررسی اینکه آیا کاربر login شده یا نه
 */
export const isAuthenticated = () => {
    const token = getAccessToken();
    return token !== null && token !== undefined && token !== '';
};

/**
 * decode کردن JWT token برای دریافت اطلاعات کاربر
 */
export const decodeToken = (token) => {
    try {
        if (!token) return null;

        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

/**
 * بررسی اینکه آیا token منقضی شده یا نه
 */
export const isTokenExpired = (token) => {
    try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) return true;

        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true;
    }
};

/**
 * دریافت اطلاعات کاربر از token
 */
export const getUserFromToken = () => {
    const token = getAccessToken();
    if (!token || isTokenExpired(token)) {
        return null;
    }

    const decoded = decodeToken(token);
    return decoded ? {
        id: decoded.user_id,
        username: decoded.username,
        email: decoded.email,
        exp: decoded.exp,
        iat: decoded.iat
    } : null;
};

/**
 * ایجاد Authorization header برای API requests
 */
export const getAuthHeader = () => {
    const token = getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * بررسی اینکه آیا token به refresh نیاز دارد یا نه
 * (اگر کمتر از 5 دقیقه تا انقضا مانده باشد)
 */
export const shouldRefreshToken = () => {
    const token = getAccessToken();
    if (!token) return false;

    try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) return false;

        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = decoded.exp - currentTime;

        // اگر کمتر از 5 دقیقه (300 ثانیه) تا انقضا مانده باشد
        return timeUntilExpiry < 300 && timeUntilExpiry > 0;
    } catch (error) {
        console.error('Error checking if token should refresh:', error);
        return false;
    }
};