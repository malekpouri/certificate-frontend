import { useAuthContext } from '../context/AuthContext.jsx';

/**
 * Custom hook برای راحت‌تر استفاده از AuthContext
 * این hook تمام functionality های مربوط به authentication را فراهم می‌کند
 */
const useAuth = () => {
    const authContext = useAuthContext();

    return {
        // User state
        user: authContext.user,
        isAuthenticated: authContext.isAuthenticated,
        isLoading: authContext.isLoading,

        // Loading states
        isLoginLoading: authContext.isLoginLoading,
        isRegisterLoading: authContext.isRegisterLoading,

        // Error state
        error: authContext.error,

        // Actions
        login: authContext.login,
        register: authContext.register,
        logout: authContext.logout,
        clearError: authContext.clearError,

        // Helper functions
        getUserId: () => authContext.user?.id || null,
        getUsername: () => authContext.user?.username || '',
        getUserEmail: () => authContext.user?.email || '',

        // Check if user has specific role (اختیاری - اگر در آینده نقش‌ها اضافه شود)
        hasRole: (role) => {
            if (!authContext.user || !authContext.user.roles) return false;
            return authContext.user.roles.includes(role);
        },

        // Check if user is admin (اختیاری)
        isAdmin: ()=>true,
        // isAdmin: () => {
        //     if (!authContext.user) return false;
        //     return authContext.user.is_staff || authContext.user.is_superuser || false;
        // },
    };
};

export default useAuth;