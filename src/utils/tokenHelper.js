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
        if (!token) {
            console.log("Decode Token: No token provided."); // Debug log
            return null;
        }

        const base64Url = token.split('.')[1];
        if (!base64Url) {
            console.log("Decode Token: Invalid token format - no payload part."); // Debug log
            return null;
        }

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const decoded = JSON.parse(jsonPayload);
        console.log("Decode Token: Successfully decoded token:", decoded); // Debug log
        return decoded;
    } catch (error) {
        console.error('Error decoding token:', error); // Debug log
        return null;
    }
};

/**
 * بررسی اینکه آیا token منقضی شده یا نه
 */
export const isTokenExpired = (token) => {
    try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) {
            console.log("Is Token Expired: Decoded token or expiration (exp) missing."); // Debug log
            return true;
        }

        const currentTime = Date.now() / 1000;
        const expired = decoded.exp < currentTime;
        console.log(`Is Token Expired: Current time ${currentTime}, Token exp ${decoded.exp}. Expired: ${expired}`); // Debug log
        return expired;
    } catch (error) {
        console.error('Error checking token expiration:', error); // Debug log
        return true;
    }
};

/**
 * دریافت اطلاعات کاربر از token (فقط user_id را از توکن استخراج می‌کند)
 */
export const getUserFromToken = () => {
    const token = getAccessToken();
    console.log("getUserFromToken: Access Token:", token ? "Exists" : "Does Not Exist"); // Debug log
    if (!token) {
        return null;
    }

    if (isTokenExpired(token)) {
        console.log("getUserFromToken: Token is expired."); // Debug log
        return null;
    }

    const decoded = decodeToken(token);
    // فقط user_id را از توکن استخراج می‌کنیم، زیرا username و email در پیلود توکن نیستند.
    // این اطلاعات از طریق API پروفایل کاربر دریافت خواهند شد.
    return decoded ? {
        id: decoded.user_id,
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

        const needsRefresh = timeUntilExpiry < 300 && timeUntilExpiry > 0; // If less than 5 minutes (300 seconds) until expiration
        console.log(`Should Refresh Token: Time until expiry: ${timeUntilExpiry.toFixed(0)}s. Needs refresh: ${needsRefresh}`); // Debug log
        return needsRefresh;
    } catch (error) {
        console.error('Error checking if token should refresh:', error); // Debug log
        return false;
    }
};