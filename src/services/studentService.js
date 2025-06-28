import { getAuthHeader } from '../utils/tokenHelper';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorData = {};
        try {
            errorData = await response.json(); // Try to parse JSON error response
        } catch (e) {
            // If response is not JSON, use generic error
            errorData = { message: 'خطا در برقراری ارتباط با سرور یا پاسخ غیرقابل خواندن' };
        }

        // If it's a 400 Bad Request, it might contain field-specific errors
        if (response.status === 400) {
            // Return the full errorData if it's a 400, so form can display field errors
            const errorMessage = errorData.detail || Object.values(errorData).flat().join(' و ') || 'خطا در اطلاعات ارسالی';
            throw { status: 400, message: errorMessage, errors: errorData }; // Throw object with errors
        }

        throw new Error(errorData.message || errorData.detail || 'خطا در برقراری ارتباط با سرور');
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {};
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
            message: error.message?.message || error.message || 'خطا در دریافت دانشجویان', // Adjusted to handle thrown object
            errors: error.errors || {}
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
            message: error.message?.message || error.message || 'خطا در دریافت اطلاعات دانشجو', // Adjusted
            errors: error.errors || {}
        };
    }
};

export const createStudent = async (studentData) => {
    try {
        const data = await apiRequest('/students/', {
            method: 'POST',
            body: JSON.stringify({
                student_id: studentData.student_id,
                first_name: studentData.first_name,
                last_name: studentData.last_name,
                email: studentData.email,
                date_of_birth: studentData.date_of_birth,
            }),
        });

        return {
            success: true,
            data: data,
            message: 'دانشجو با موفقیت ایجاد شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message?.message || error.message || 'خطا در ایجاد دانشجو', // Adjusted
            errors: error.errors || {}
        };
    }
};

export const updateStudent = async (id, studentData) => {
    try {
        const data = await apiRequest(`/students/${id}/`, {
            method: 'PUT',
            body: JSON.stringify({
                student_id: studentData.student_id,
                first_name: studentData.first_name,
                last_name: studentData.last_name,
                email: studentData.email,
                date_of_birth: studentData.date_of_birth,
            }),
        });

        return {
            success: true,
            data: data,
            message: 'اطلاعات دانشجو با موفقیت بروزرسانی شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message?.message || error.message || 'خطا در بروزرسانی اطلاعات دانشجو', // Adjusted
            errors: error.errors || {}
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
            message: error.message?.message || error.message || 'خطا در حذف دانشجو', // Adjusted
            errors: error.errors || {}
        };
    }
};

// Removed other functions as per backend definition

const studentService = {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
};

export default studentService;