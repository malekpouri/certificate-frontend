import { getAuthHeader } from '../utils/tokenHelper';

import studentService from './studentService';
import courseService from './courseService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorData = {};
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { message: 'خطا در برقراری ارتباط با سرور یا پاسخ غیرقابل خواندن' };
        }

        if (response.status === 400) {
            const errorMessage = errorData.detail || Object.values(errorData).flat().join(' و ') || 'خطا در اطلاعات ارسالی';
            throw { status: 400, message: errorMessage, errors: errorData };
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

export const getCertificates = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (filters.search) queryParams.append('search', filters.search);
        if (filters.page) queryParams.append('page', filters.page);
        if (filters.page_size) queryParams.append('page_size', filters.page_size);

        const queryString = queryParams.toString();
        const url = queryString ? `/certificates/?${queryString}` : '/certificates/';

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
            message: error.message?.message || error.message || 'خطا در دریافت گواهی‌نامه‌ها',
            errors: error.errors || {}
        };
    }
};

export const getCertificate = async (id) => {
    try {
        const data = await apiRequest(`/certificates/${id}/`);

        return {
            success: true,
            data: data
        };
    } catch (error) {
        return {
            success: false,
            message: error.message?.message || error.message || 'خطا در دریافت اطلاعات گواهی‌نامه',
            errors: error.errors || {}
        };
    }
};

export const createCertificate = async (certificateData) => {
    try {
        const payload = {
            student_id: certificateData.student_id,
            course_id: certificateData.course_id,
            issue_date: certificateData.issue_date,
            expiry_date: certificateData.expiry_date,
            status: certificateData.status,
        };

        const data = await apiRequest('/certificates/', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        return {
            success: true,
            data: data,
            message: 'گواهی‌نامه با موفقیت ایجاد شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message?.message || error.message || 'خطا در ایجاد گواهی‌نامه',
            errors: error.errors || {}
        };
    }
};

export const updateCertificate = async (id, certificateData) => {
    try {
        const payload = {
            student_id: certificateData.student_id,
            course_id: certificateData.course_id,
            issue_date: certificateData.issue_date,
            expiry_date: certificateData.expiry_date,
            status: certificateData.status,
        };
        const data = await apiRequest(`/certificates/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        return {
            success: true,
            data: data,
            message: 'اطلاعات گواهی‌نامه با موفقیت بروزرسانی شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message?.message || error.message || 'خطا در بروزرسانی اطلاعات گواهی‌نامه',
            errors: error.errors || {}
        };
    }
};

export const deleteCertificate = async (id) => {
    try {
        await apiRequest(`/certificates/${id}/`, {
            method: 'DELETE',
        });

        return {
            success: true,
            message: 'دانشجو با موفقیت حذف شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message?.message || error.message || 'خطا در حذف دانشجو',
            errors: error.errors || {}
        };
    }
};

export const getCertificateQRCode = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/certificates/${id}/qr-code/`, {
            headers: {
                ...getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error('خطا در دریافت QR Code');
        }

        const blob = await response.blob();
        const qrCodeUrl = URL.createObjectURL(blob);

        return {
            success: true,
            qrCodeUrl: qrCodeUrl
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در دریافت QR Code'
        };
    }
};

export const validateCertificate = async (validationData) => {
    try {
        let certificateId = validationData.certificate_id;
        if (validationData.qr_code && validationData.qr_code.includes('/validate/')) {
            const parts = validationData.qr_code.split('/');
            certificateId = parts[parts.length - 1];
        } else if (validationData.qr_code) {
            certificateId = validationData.qr_code;
        }

        if (!certificateId) {
            return {
                success: false,
                message: 'شناسه گواهی‌نامه یا محتوای QR معتبر نیست',
                valid: false
            };
        }

        const result = await getCertificate(certificateId); // فراخوانی getCertificate

        if (result.success) { // اگر getCertificate موفق بود
            return {
                success: true, // عملیات اعتبارسنجی (API call) موفق بود
                valid: true, // گواهی‌نامه معتبر است
                certificate: result.data,
                message: 'گواهی‌نامه معتبر است'
            };
        } else { // اگر getCertificate ناموفق بود (مثلاً 404)
            return {
                success: false, // عملیات اعتبارسنجی ناموفق بود (گواهی‌نامه پیدا نشد/خطا)
                valid: false,
                certificate: null,
                message: result.message || 'گواهی‌نامه معتبر نیست'
            };
        }
    } catch (error) {
        return {
            success: false,
            valid: false,
            message: error.message?.message || error.message || 'خطا در بررسی گواهی‌نامه',
            errors: error.errors || {}
        };
    }
};

export const downloadCertificate = async (id, format = 'pdf') => {
    try {
        const response = await fetch(`${API_BASE_URL}/certificates/${id}/download/?format=${format}`, {
            headers: {
                ...getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error('خطا در دانلود گواهی‌نامه');
        }

        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `certificate-${id}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(downloadUrl);

        return {
            success: true,
            message: 'گواهی‌نامه دانلود شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در دانلود گواهی‌نامه'
        };
    }
};

const certificateService = {
    getCertificates,
    getCertificate,
    createCertificate,
    updateCertificate,
    deleteCertificate,
    getCertificateQRCode,
    validateCertificate,
    downloadCertificate,
    getStudents: studentService.getStudents,
    getCourses: courseService.getCourses,
};

export default certificateService;