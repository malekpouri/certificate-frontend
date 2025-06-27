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

export const getCourses = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (filters.search) queryParams.append('search', filters.search);
        if (filters.page) queryParams.append('page', filters.page);
        if (filters.page_size) queryParams.append('page_size', filters.page_size);

        const queryString = queryParams.toString();
        const url = queryString ? `/courses/?${queryString}` : '/courses/';

        const data = await apiRequest(url);

        return {
            success: true,
            data: data.results || data,
            count: data.count || (Array.isArray(data) ? data.length : 0),
            next: data.next || null,
            previous: data.previous || null,
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در دریافت دوره‌ها'
        };
    }
};

export const getCourse = async (id) => {
    try {
        const data = await apiRequest(`/courses/${id}/`);

        return {
            success: true,
            data: data
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در دریافت اطلاعات دوره'
        };
    }
};

export const createCourse = async (courseData) => {
    try {
        const data = await apiRequest('/courses/', {
            method: 'POST',
            body: JSON.stringify({
                name: courseData.name, // Changed from title
                description: courseData.description,
                duration: courseData.duration, // Changed from duration_hours
            }),
        });

        return {
            success: true,
            data: data,
            message: 'دوره با موفقیت ایجاد شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در ایجاد دوره'
        };
    }
};

export const updateCourse = async (id, courseData) => {
    try {
        const data = await apiRequest(`/courses/${id}/`, {
            method: 'PUT',
            body: JSON.stringify({
                name: courseData.name, // Changed from title
                description: courseData.description,
                duration: courseData.duration, // Changed from duration_hours
            }),
        });

        return {
            success: true,
            data: data,
            message: 'اطلاعات دوره با موفقیت بروزرسانی شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در بروزرسانی اطلاعات دوره'
        };
    }
};

export const deleteCourse = async (id) => {
    try {
        await apiRequest(`/courses/${id}/`, {
            method: 'DELETE',
        });

        return {
            success: true,
            message: 'دوره با موفقیت حذف شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در حذف دوره'
        };
    }
};

const courseService = {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
};

export default courseService;