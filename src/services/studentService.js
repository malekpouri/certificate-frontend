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

export const getStudents = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (filters.search) queryParams.append('search', filters.search);
        if (filters.email) queryParams.append('email', filters.email);
        if (filters.student_id) queryParams.append('student_id', filters.student_id);
        if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active);
        if (filters.page) queryParams.append('page', filters.page);
        if (filters.page_size) queryParams.append('page_size', filters.page_size);

        const queryString = queryParams.toString();
        const url = queryString ? `/students/?${queryString}` : '/students/';

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
            message: error.message || 'خطا در دریافت دانشجویان'
        };
    }
};

export const getStudent = async (id) => {
    try {
        const data = await apiRequest(`/students/${id}/`);

        return {
            success: true,
            data: data
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در دریافت اطلاعات دانشجو'
        };
    }
};

export const createStudent = async (studentData) => {
    try {
        const data = await apiRequest('/students/', {
            method: 'POST',
            body: JSON.stringify(studentData),
        });

        return {
            success: true,
            data: data,
            message: 'دانشجو با موفقیت ایجاد شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در ایجاد دانشجو'
        };
    }
};

export const updateStudent = async (id, studentData) => {
    try {
        const data = await apiRequest(`/students/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(studentData),
        });

        return {
            success: true,
            data: data,
            message: 'اطلاعات دانشجو با موفقیت بروزرسانی شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در بروزرسانی اطلاعات دانشجو'
        };
    }
};

export const deleteStudent = async (id) => {
    try {
        await apiRequest(`/students/${id}/`, {
            method: 'DELETE',
        });

        return {
            success: true,
            message: 'دانشجو با موفقیت حذف شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در حذف دانشجو'
        };
    }
};

export const getStudentCertificates = async (id, filters = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (filters.page) queryParams.append('page', filters.page);
        if (filters.page_size) queryParams.append('page_size', filters.page_size);

        const queryString = queryParams.toString();
        const url = queryString
            ? `/students/${id}/certificates/?${queryString}`
            : `/students/${id}/certificates/`;

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
            message: error.message || 'خطا در دریافت گواهی‌نامه‌های دانشجو'
        };
    }
};

export const getStudentStatistics = async (id) => {
    try {
        const data = await apiRequest(`/students/${id}/statistics/`);

        return {
            success: true,
            data: data
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در دریافت آمار دانشجو'
        };
    }
};

export const activateStudent = async (id) => {
    try {
        const data = await apiRequest(`/students/${id}/activate/`, {
            method: 'PATCH',
        });

        return {
            success: true,
            data: data,
            message: 'دانشجو فعال شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در فعال‌سازی دانشجو'
        };
    }
};

export const deactivateStudent = async (id) => {
    try {
        const data = await apiRequest(`/students/${id}/deactivate/`, {
            method: 'PATCH',
        });

        return {
            success: true,
            data: data,
            message: 'دانشجو غیرفعال شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در غیرفعال‌سازی دانشجو'
        };
    }
};

export const uploadStudentAvatar = async (id, file) => {
    try {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch(`${API_BASE_URL}/students/${id}/avatar/`, {
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
            message: 'تصویر پروفایل بروزرسانی شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در بروزرسانی تصویر پروفایل'
        };
    }
};

const studentService = {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentCertificates,
    getStudentStatistics,
    activateStudent,
    deactivateStudent,
    uploadStudentAvatar,
};

export default studentService;