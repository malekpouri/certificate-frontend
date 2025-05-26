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
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.instructor) queryParams.append('instructor', filters.instructor);
        if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active);
        if (filters.duration_min) queryParams.append('duration_min', filters.duration_min);
        if (filters.duration_max) queryParams.append('duration_max', filters.duration_max);
        if (filters.page) queryParams.append('page', filters.page);
        if (filters.page_size) queryParams.append('page_size', filters.page_size);
        if (filters.ordering) queryParams.append('ordering', filters.ordering);

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
            body: JSON.stringify(courseData),
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
            body: JSON.stringify(courseData),
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

export const getCourseCertificates = async (id, filters = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (filters.page) queryParams.append('page', filters.page);
        if (filters.page_size) queryParams.append('page_size', filters.page_size);
        if (filters.student) queryParams.append('student', filters.student);

        const queryString = queryParams.toString();
        const url = queryString
            ? `/courses/${id}/certificates/?${queryString}`
            : `/courses/${id}/certificates/`;

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
            message: error.message || 'خطا در دریافت گواهی‌نامه‌های دوره'
        };
    }
};

export const getCourseStatistics = async (id) => {
    try {
        const data = await apiRequest(`/courses/${id}/statistics/`);

        return {
            success: true,
            data: data
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در دریافت آمار دوره'
        };
    }
};

export const activateCourse = async (id) => {
    try {
        const data = await apiRequest(`/courses/${id}/activate/`, {
            method: 'PATCH',
        });

        return {
            success: true,
            data: data,
            message: 'دوره فعال شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در فعال‌سازی دوره'
        };
    }
};

export const deactivateCourse = async (id) => {
    try {
        const data = await apiRequest(`/courses/${id}/deactivate/`, {
            method: 'PATCH',
        });

        return {
            success: true,
            data: data,
            message: 'دوره غیرفعال شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در غیرفعال‌سازی دوره'
        };
    }
};

export const uploadCourseImage = async (id, file) => {
    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${API_BASE_URL}/courses/${id}/image/`, {
            method: 'PATCH',
            headers: {
                ...getAuthHeader(),
            },
            body: formData,
        });

        const data = await handleResponse(response);

        return {
            success: true,
            data: data,
            message: 'تصویر دوره بروزرسانی شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در بروزرسانی تصویر دوره'
        };
    }
};

export const getCourseCategories = async () => {
    try {
        const data = await apiRequest('/courses/categories/');

        return {
            success: true,
            data: data
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در دریافت دسته‌بندی‌ها'
        };
    }
};

export const enrollStudent = async (courseId, studentId) => {
    try {
        const data = await apiRequest(`/courses/${courseId}/enroll/`, {
            method: 'POST',
            body: JSON.stringify({ student_id: studentId }),
        });

        return {
            success: true,
            data: data,
            message: 'دانشجو با موفقیت در دوره ثبت‌نام شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در ثبت‌نام دانشجو'
        };
    }
};

export const unenrollStudent = async (courseId, studentId) => {
    try {
        await apiRequest(`/courses/${courseId}/unenroll/`, {
            method: 'POST',
            body: JSON.stringify({ student_id: studentId }),
        });

        return {
            success: true,
            message: 'دانشجو از دوره حذف شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در حذف دانشجو از دوره'
        };
    }
};

export const duplicateCourse = async (id) => {
    try {
        const data = await apiRequest(`/courses/${id}/duplicate/`, {
            method: 'POST',
        });

        return {
            success: true,
            data: data,
            message: 'دوره با موفقیت کپی شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در کپی کردن دوره'
        };
    }
};

const courseService = {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseCertificates,
    getCourseStatistics,
    activateCourse,
    deactivateCourse,
    uploadCourseImage,
    getCourseCategories,
    enrollStudent,
    unenrollStudent,
    duplicateCourse,
};

export default courseService;