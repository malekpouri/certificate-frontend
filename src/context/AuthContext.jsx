import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
    isAuthenticated,
    getUserFromToken,
    removeTokens,
    shouldRefreshToken
} from '../utils/tokenHelper';
import authService from '../services/authService';

// ایجاد Context
const AuthContext = createContext();

// Action types برای reducer
const AUTH_ACTIONS = {
    LOGIN_START: 'LOGIN_START',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGOUT: 'LOGOUT',
    REGISTER_START: 'REGISTER_START',
    REGISTER_SUCCESS: 'REGISTER_SUCCESS',
    REGISTER_FAILURE: 'REGISTER_FAILURE',
    SET_USER: 'SET_USER',
    SET_LOADING: 'SET_LOADING',
    CLEAR_ERROR: 'CLEAR_ERROR',
    REFRESH_TOKEN_SUCCESS: 'REFRESH_TOKEN_SUCCESS',
    REFRESH_TOKEN_FAILURE: 'REFRESH_TOKEN_FAILURE',
};

// Initial state
const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    isLoginLoading: false,
    isRegisterLoading: false,
};

// Reducer function
const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_START:
            console.log("Auth Reducer: LOGIN_START"); // Debug log
            return {
                ...state,
                isLoginLoading: true,
                error: null,
            };

        case AUTH_ACTIONS.LOGIN_SUCCESS:
            console.log("Auth Reducer: LOGIN_SUCCESS", "User:", action.payload.user, "Authenticated:", !!action.payload.user); // Debug log
            return {
                ...state,
                user: action.payload.user,
                isAuthenticated: true,
                isLoginLoading: false,
                isLoading: false,
                error: null,
            };

        case AUTH_ACTIONS.LOGIN_FAILURE:
            console.log("Auth Reducer: LOGIN_FAILURE", "Error:", action.payload.error); // Debug log
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoginLoading: false,
                error: action.payload.error,
            };

        case AUTH_ACTIONS.REGISTER_START:
            console.log("Auth Reducer: REGISTER_START"); // Debug log
            return {
                ...state,
                isRegisterLoading: true,
                error: null,
            };

        case AUTH_ACTIONS.REGISTER_SUCCESS:
            console.log("Auth Reducer: REGISTER_SUCCESS"); // Debug log
            return {
                ...state,
                isRegisterLoading: false,
                error: null,
            };

        case AUTH_ACTIONS.REGISTER_FAILURE:
            console.log("Auth Reducer: REGISTER_FAILURE", "Error:", action.payload.error); // Debug log
            return {
                ...state,
                isRegisterLoading: false,
                error: action.payload.error,
            };

        case AUTH_ACTIONS.LOGOUT:
            console.log("Auth Reducer: LOGOUT"); // Debug log
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                error: null,
            };

        case AUTH_ACTIONS.SET_USER:
            console.log("Auth Reducer: SET_USER (initAuth/fallback)", "User:", action.payload.user, "Authenticated:", !!action.payload.user, "isLoading: false"); // Debug log
            return {
                ...state,
                user: action.payload.user,
                isAuthenticated: !!action.payload.user,
                isLoading: false,
            };

        case AUTH_ACTIONS.SET_LOADING:
            console.log("Auth Reducer: SET_LOADING", "isLoading:", action.payload.isLoading); // Debug log
            return {
                ...state,
                isLoading: action.payload.isLoading,
            };

        case AUTH_ACTIONS.CLEAR_ERROR:
            console.log("Auth Reducer: CLEAR_ERROR"); // Debug log
            return {
                ...state,
                error: null,
            };

        case AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS:
            console.log("Auth Reducer: REFRESH_TOKEN_SUCCESS"); // Debug log
            return {
                ...state,
                // user اطلاعات همان باقی می‌ماند، فقط token تجدید شده
            };

        case AUTH_ACTIONS.REFRESH_TOKEN_FAILURE:
            console.log("Auth Reducer: REFRESH_TOKEN_FAILURE"); // Debug log
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                error: 'نشست شما منقضی شده. لطفاً مجدداً وارد شوید.',
            };

        default:
            return state;
    }
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // بررسی وضعیت authentication هنگام load شدن اپلیکیشن
    useEffect(() => {
        const initAuth = async () => {
            console.log("AuthContext: Running initAuth..."); // Debug log
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { isLoading: true } });

            if (isAuthenticated()) {
                console.log("AuthContext: isAuthenticated() returns true initially."); // Debug log
                const userDataFromToken = getUserFromToken();
                console.log("AuthContext: getUserFromToken() result in initAuth:", userDataFromToken); // Debug log

                if (userDataFromToken) {
                    try {
                        const profileResult = await authService.getUserProfile();
                        if (profileResult.success) {
                            const fullUserData = { ...userDataFromToken, ...profileResult.user };
                            console.log("AuthContext: Full user data from profile API (initAuth):", fullUserData); // Debug log
                            dispatch({
                                type: AUTH_ACTIONS.SET_USER,
                                payload: { user: fullUserData },
                            });
                        } else {
                            // اگر پروفایل کاربر دریافت نشد، لاگ اوت نمی‌کنیم اما هشدار می‌دهیم
                            console.warn("AuthContext: Failed to fetch user profile in initAuth. User will be logged in without full profile data."); // Debug log
                            dispatch({
                                type: AUTH_ACTIONS.SET_USER,
                                payload: { user: userDataFromToken }, // فقط اطلاعات توکن را نگه می‌داریم
                            });
                        }
                    } catch (error) {
                        console.error("AuthContext: Error fetching user profile in initAuth:", error); // Debug log
                        // اگر خطایی رخ داد، لاگ اوت نمی‌کنیم اما هشدار می‌دهیم
                        dispatch({
                            type: AUTH_ACTIONS.SET_USER,
                            payload: { user: userDataFromToken }, // فقط اطلاعات توکن را نگه می‌داریم
                        });
                    }
                } else {
                    console.log("AuthContext: Token exists but getUserFromToken() returned null. Removing tokens."); // Debug log
                    removeTokens();
                    dispatch({
                        type: AUTH_ACTIONS.SET_USER,
                        payload: { user: null },
                    });
                }
            } else {
                console.log("AuthContext: isAuthenticated() returns false initially (no token)."); // Debug log
                dispatch({
                    type: AUTH_ACTIONS.SET_USER,
                    payload: { user: null },
                });
            }
        };

        initAuth();
    }, []);

    // Auto refresh token
    useEffect(() => {
        if (!state.isAuthenticated) {
            console.log("AuthContext: Auto refresh skipped, not authenticated."); // Debug log
            return;
        }
        console.log("AuthContext: Auto refresh effect active."); // Debug log

        const checkTokenRefresh = async () => {
            console.log("AuthContext: Checking if token needs refresh..."); // Debug log
            if (shouldRefreshToken()) {
                console.log("AuthContext: Token needs refresh. Calling refreshToken service..."); // Debug log
                const result = await authService.refreshToken();
                if (result.success) {
                    dispatch({ type: AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS });
                    console.log("AuthContext: Token refresh successful."); // Debug log
                } else {
                    dispatch({
                        type: AUTH_ACTIONS.REFRESH_TOKEN_FAILURE,
                    });
                    console.log("AuthContext: Token refresh failed."); // Debug log
                }
            } else {
                console.log("AuthContext: Token does not need refresh yet."); // Debug log
            }
        };

        // بررسی هر 5 دقیقه
        const interval = setInterval(checkTokenRefresh, 5 * 60 * 1000);

        // بررسی اولیه
        checkTokenRefresh();

        return () => {
            clearInterval(interval);
            console.log("AuthContext: Auto refresh interval cleared."); // Debug log
        };
    }, [state.isAuthenticated]);

    // Actions
    const login = async (credentials) => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START });
        console.log("AuthContext: Login action started for:", credentials.username); // Debug log

        try {
            const result = await authService.login(credentials);
            console.log("AuthContext: authService.login result:", result); // Debug log

            if (result.success) {
                const userDataFromToken = getUserFromToken(); // اطلاعات اولیه از توکن
                console.log("AuthContext: getUserFromToken() result after login success:", userDataFromToken); // Debug log

                if (userDataFromToken) {
                    try {
                        const profileResult = await authService.getUserProfile();
                        if (profileResult.success) {
                            const fullUserData = { ...userDataFromToken, ...profileResult.user };
                            console.log("AuthContext: Full user data from profile API (login success):", fullUserData); // Debug log
                            dispatch({
                                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                                payload: { user: fullUserData },
                            });
                        } else {
                            // اگر پروفایل کاربر دریافت نشد، لاگ اوت نمی‌کنیم اما هشدار می‌دهیم
                            console.warn("AuthContext: Failed to fetch user profile after login. User will be logged in without full profile data."); // Debug log
                            dispatch({
                                type: AUTH_ACTIONS.LOGIN_SUCCESS, // همچنان با SUCCESS ادامه می‌دهیم
                                payload: { user: userDataFromToken }, // فقط اطلاعات توکن را نگه می‌داریم
                            });
                        }
                    } catch (error) {
                        console.error("AuthContext: Error fetching user profile after login:", error); // Debug log
                        // اگر خطایی در فراخوانی API رخ داد، لاگ اوت نمی‌کنیم اما هشدار می‌دهیم
                        dispatch({
                            type: AUTH_ACTIONS.LOGIN_SUCCESS, // همچنان با SUCCESS ادامه می‌دهیم
                            payload: { user: userDataFromToken }, // فقط اطلاعات توکن را نگه می‌داریم
                        });
                    }
                } else {
                    console.log("AuthContext: Token obtained but getUserFromToken() returned null after login. Logging out user."); // Debug log
                    removeTokens();
                    dispatch({ type: AUTH_ACTIONS.LOGOUT });
                    return { success: false, message: 'توکن نامعتبر است' };
                }
                return { success: true, message: result.message };
            } else {
                dispatch({
                    type: AUTH_ACTIONS.LOGIN_FAILURE,
                    payload: { error: result.message },
                });
                return { success: false, message: result.message };
            }
        } catch (error) {
            const errorMessage = 'خطا در ورود به سیستم';
            console.error("AuthContext: Login action error:", error); // Debug log
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: { error: errorMessage },
            });
            return { success: false, message: errorMessage };
        }
    };

    const register = async (userData) => {
        dispatch({ type: AUTH_ACTIONS.REGISTER_START });
        console.log("AuthContext: Register action started."); // Debug log

        try {
            const result = await authService.register(userData);
            console.log("AuthContext: authService.register result:", result); // Debug log

            if (result.success) {
                dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS });
                return { success: true, message: result.message };
            } else {
                dispatch({
                    type: AUTH_ACTIONS.REGISTER_FAILURE,
                    payload: { error: result.message },
                });
                return { success: false, message: result.message };
            }
        } catch (error) {
            const errorMessage = 'خطا در ثبت‌نام';
            dispatch({
                type: AUTH_ACTIONS.REGISTER_FAILURE,
                payload: { error: errorMessage },
            });
            return { success: false, message: errorMessage };
        }
    };

    const logout = async () => {
        console.log("AuthContext: Logout action started."); // Debug log
        await authService.logout();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        console.log("AuthContext: Logout action completed."); // Debug log
    };

    const clearError = () => {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    };

    // Context value
    const value = {
        // State
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error,
        isLoginLoading: state.isLoginLoading,
        isRegisterLoading: state.isRegisterLoading,

        // Actions
        login,
        register,
        logout,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook برای استفاده از AuthContext
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;