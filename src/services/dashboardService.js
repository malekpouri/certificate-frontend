import { getAuthHeader } from '../utils/tokenHelper';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.detail || 'خطا در برقراری ارتباط با سرور');
    }

    return response.json();
};

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

export const getDashboardStats = async () => {
    try {
        const data = await apiRequest('/dashboard/stats/');

        return {
            success: true,
            data: data
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در دریافت آمار داشبورد'
        };
    }
};

export const getRecentActivity = async (limit = 10) => {
    try {
        const data = await apiRequest(`/dashboard/recent-activity/?limit=${limit}`);

        return {
            success: true,
            data: data
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در دریافت فعالیت‌های اخیر'
        };
    }
};

export const getChartsData = async (period = '30d') => {
    try {
        const data = await apiRequest(`/dashboard/charts/?period=${period}`);

        return {
            success: true,
            data: data
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در دریافت اطلاعات نمودار'
        };
    }
};

export const getSystemOverview = async () => {
    try {
        const data = await apiRequest('/dashboard/system-overview/');

        return {
            success: true,
            data: data
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در دریافت نمای کلی سیستم'
        };
    }
};

export const getTopPerformers = async (type = 'students', limit = 5) => {
    try {
        const data = await apiRequest(`/dashboard/top-performers/?type=${type}&limit=${limit}`);

        return {
            success: true,
            data: data
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در دریافت برترین‌ها'
        };
    }
};

export const getUpcomingEvents = async (limit = 5) => {
    try {
        const data = await apiRequest(`/dashboard/upcoming-events/?limit=${limit}`);

        return {
            success: true,
            data: data
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در دریافت رویدادهای آینده'
        };
    }
};

export const exportDashboardData = async (format = 'excel') => {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/export/?format=${format}`, {
            headers: {
                ...getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error('خطا در دانلود گزارش');
        }

        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `dashboard-report.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(downloadUrl);

        return {
            success: true,
            message: 'گزارش دانلود شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در دانلود گزارش'
        };
    }
};

export const refreshDashboardData = async () => {
    try {
        const data = await apiRequest('/dashboard/refresh/', {
            method: 'POST',
        });

        return {
            success: true,
            data: data,
            message: 'داده‌ها بروزرسانی شدند'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در بروزرسانی داده‌ها'
        };
    }
};

const dashboardService = {
    getDashboardStats,
    getRecentActivity,
    getChartsData,
    getSystemOverview,
    getTopPerformers,
    getUpcomingEvents,
    exportDashboardData,
    refreshDashboardData,
};

export default dashboardService;