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

export const getCertificates = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (filters.search) queryParams.append('search', filters.search);
        if (filters.student) queryParams.append('student', filters.student);
        if (filters.course) queryParams.append('course', filters.course);
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
            message: error.message || 'خطا در دریافت گواهی‌نامه‌ها'
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
            message: error.message || 'خطا در دریافت گواهی‌نامه'
        };
    }
};

export const createCertificate = async (certificateData) => {
    try {
        const data = await apiRequest('/certificates/', {
            method: 'POST',
            body: JSON.stringify(certificateData),
        });

        return {
            success: true,
            data: data,
            message: 'گواهی‌نامه با موفقیت ایجاد شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در ایجاد گواهی‌نامه'
        };
    }
};

export const updateCertificate = async (id, certificateData) => {
    try {
        const data = await apiRequest(`/certificates/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(certificateData),
        });

        return {
            success: true,
            data: data,
            message: 'گواهی‌نامه با موفقیت بروزرسانی شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در بروزرسانی گواهی‌نامه'
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
            message: 'گواهی‌نامه با موفقیت حذف شد'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در حذف گواهی‌نامه'
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
        const data = await apiRequest('/certificates/validate/', {
            method: 'POST',
            body: JSON.stringify(validationData),
        });

        return {
            success: true,
            data: data,
            message: data.valid ? 'گواهی‌نامه معتبر است' : 'گواهی‌نامه معتبر نیست'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'خطا در بررسی گواهی‌نامه'
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
};

export default certificateService;