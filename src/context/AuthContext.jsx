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
            return {
                ...state,
                isLoginLoading: true,
                error: null,
            };

        case AUTH_ACTIONS.LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                isAuthenticated: true,
                isLoginLoading: false,
                error: null,
            };

        case AUTH_ACTIONS.LOGIN_FAILURE:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoginLoading: false,
                error: action.payload.error,
            };

        case AUTH_ACTIONS.REGISTER_START:
            return {
                ...state,
                isRegisterLoading: true,
                error: null,
            };

        case AUTH_ACTIONS.REGISTER_SUCCESS:
            return {
                ...state,
                isRegisterLoading: false,
                error: null,
            };

        case AUTH_ACTIONS.REGISTER_FAILURE:
            return {
                ...state,
                isRegisterLoading: false,
                error: action.payload.error,
            };

        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                error: null,
            };

        case AUTH_ACTIONS.SET_USER:
            return {
                ...state,
                user: action.payload.user,
                isAuthenticated: !!action.payload.user,
                isLoading: false,
            };

        case AUTH_ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload.isLoading,
            };

        case AUTH_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };

        case AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS:
            return {
                ...state,
                // user اطلاعات همان باقی می‌ماند، فقط token تجدید شده
            };

        case AUTH_ACTIONS.REFRESH_TOKEN_FAILURE:
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
        const initAuth = () => {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { isLoading: true } });

            if (isAuthenticated()) {
                const userData = getUserFromToken();
                if (userData) {
                    dispatch({
                        type: AUTH_ACTIONS.SET_USER,
                        payload: { user: userData },
                    });
                } else {
                    // اگر token نامعتبر است، آن را حذف کنیم
                    removeTokens();
                    dispatch({
                        type: AUTH_ACTIONS.SET_USER,
                        payload: { user: null },
                    });
                }
            } else {
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
        if (!state.isAuthenticated) return;

        const checkTokenRefresh = async () => {
            if (shouldRefreshToken()) {
                const result = await authService.refreshToken();
                if (result.success) {
                    dispatch({ type: AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS });
                } else {
                    dispatch({
                        type: AUTH_ACTIONS.REFRESH_TOKEN_FAILURE,
                    });
                }
            }
        };

        // بررسی هر 5 دقیقه
        const interval = setInterval(checkTokenRefresh, 5 * 60 * 1000);

        // بررسی اولیه
        checkTokenRefresh();

        return () => clearInterval(interval);
    }, [state.isAuthenticated]);

    // Actions
    const login = async (credentials) => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START });

        try {
            const result = await authService.login(credentials);

            if (result.success) {
                const userData = getUserFromToken();
                dispatch({
                    type: AUTH_ACTIONS.LOGIN_SUCCESS,
                    payload: { user: userData },
                });
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
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: { error: errorMessage },
            });
            return { success: false, message: errorMessage };
        }
    };

    const register = async (userData) => {
        dispatch({ type: AUTH_ACTIONS.REGISTER_START });

        try {
            const result = await authService.register(userData);

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
        await authService.logout();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
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