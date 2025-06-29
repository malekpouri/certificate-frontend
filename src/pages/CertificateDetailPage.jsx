import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import QRCodeDisplay from '../components/certificate/QRCodeDisplay';
import CertificateForm from '../components/certificate/CertificateForm';
import certificateService from '../services/certificateService';
import useAuth from '../hooks/useAuth';
import '../styles/Certificate.css';

const CertificateDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const [certificate, setCertificate] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        loadCertificate();
    }, [id]);

    const loadCertificate = async () => {
        setIsLoading(true);
        setError(null);
        console.log("CertificateDetailPage: Attempting to load certificate with ID:", id); // لاگ تشخیصی

        try {
            const result = await certificateService.getCertificate(id); // فراخوانی سرویس

            if (result.success) {
                setCertificate(result.data);
                console.log("CertificateDetailPage: Certificate loaded successfully. Data:", result.data); // لاگ تشخیصی
            } else {
                setError(result.message);
                console.error("CertificateDetailPage: Failed to load certificate. Error:", result.message); // لاگ تشخیصی
            }
        } catch (error) {
            setError('خطا در دریافت اطلاعات گواهی‌نامه');
            console.error("CertificateDetailPage: Error in loadCertificate catch block:", error); // لاگ تشخیصی
        }

        setIsLoading(false);
    };

    const handleDownload = async (format = 'pdf') => {
        const result = await certificateService.downloadCertificate(id, format);

        if (!result.success) {
            alert(result.message);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('آیا از حذف این گواهی‌نامه اطمینان دارید؟')) {
            return;
        }

        const result = await certificateService.deleteCertificate(id);

        if (result.success) {
            alert(result.message);
            navigate('/dashboard/certificates');
        } else {
            alert(result.message);
        }
    };

    const handleEditSuccess = (updatedCertificate) => {
        setCertificate(updatedCertificate);
        setIsEditing(false);
        navigate('/dashboard/certificates');
    };

    const handleEditCancel = () => {
        setIsEditing(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'نامشخص';
        return new Date(dateString).toLocaleDateString('fa-IR');
    };

    if (isLoading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="error-container">
                    <h3>خطا در بارگذاری</h3>
                    <p>{error}</p>
                    <div className="error-actions">
                        <button onClick={loadCertificate} className="btn btn-primary">
                            تلاش مجدد
                        </button>
                        <Link to="/dashboard/certificates" className="btn btn-secondary">
                            بازگشت به لیست
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // اگر certificate هنوز null باشد، به این معنی است که اطلاعات هنوز بارگذاری نشده یا خطا رخ داده
    // در این حالت، نمایش CertificateForm باعث خطا می‌شود
    if (!certificate && !isLoading) { // اگر loading تمام شده و certificate هنوز null است
        return (
            <div className="page-container">
                <div className="error-container">
                    <h3>اطلاعات گواهی‌نامه در دسترس نیست</h3>
                    <p>گواهی‌نامه مورد نظر یافت نشد یا مشکلی در بارگذاری اطلاعات آن پیش آمده است.</p>
                    <div className="error-actions">
                        <Link to="/dashboard/certificates" className="btn btn-secondary">
                            بازگشت به لیست
                        </Link>
                    </div>
                </div>
            </div>
        );
    }


    if (isEditing && isAdmin()) {
        return (
            <div className="page-container">
                <CertificateForm
                    certificate={certificate}
                    onSubmit={handleEditSuccess}
                    onCancel={handleEditCancel}
                />
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="header-content">
                    <h1>{certificate.id || 'نامشخص'}</h1> {/* از ID به عنوان عنوان اصلی استفاده شد */}
                    <div className="header-meta">
            <span className={`status-badge ${certificate.status === 'active' ? 'active' : 'inactive'}`}>
              {certificate.status || 'نامشخص'}
            </span>
                        <span className="certificate-id">شناسه: {certificate.id}</span>
                    </div>
                </div>

                <div className="header-actions">
                    <Link to="/dashboard/certificates" className="btn btn-outline">
                        بازگشت به لیست
                    </Link>

                    {isAdmin() && (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn btn-secondary"
                            >
                                ویرایش
                            </button>

                            <button
                                onClick={handleDelete}
                                className="btn btn-danger"
                            >
                                حذف
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="page-content">
                <div className="certificate-detail-grid">
                    <div className="certificate-info-section">
                        <div className="info-card">
                            <h3>اطلاعات گواهی‌نامه</h3>

                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">دانشجو:</span>
                                    <span className="info-value">
                                        {certificate.student?.full_name || 'نامشخص'}
                                    </span>
                                </div>

                                <div className="info-item">
                                    <span className="info-label">دوره:</span>
                                    <span className="info-value">
                                        {certificate.course?.name || 'نامشخص'}
                                    </span>
                                </div>

                                <div className="info-item">
                                    <span className="info-label">تاریخ صدور:</span>
                                    <span className="info-value">
                                        {formatDate(certificate.issue_date)}
                                    </span>
                                </div>

                                {certificate.expiry_date && (
                                    <div className="info-item">
                                        <span className="info-label">تاریخ انقضا:</span>
                                        <span className="info-value">
                                            {formatDate(certificate.expiry_date)}
                                        </span>
                                    </div>
                                )}

                                <div className="info-item">
                                    <span className="info-label">وضعیت:</span>
                                    <span className="info-value">
                                        {certificate.status || 'نامشخص'}
                                    </span>
                                </div>

                                {certificate.unique_code && (
                                    <div className="info-item">
                                        <span className="info-label">کد یکتا:</span>
                                        <span className="info-value">
                                            {certificate.unique_code}
                                        </span>
                                    </div>
                                )}

                                {certificate.created_by_email && (
                                    <div className="info-item">
                                        <span className="info-label">صادرکننده:</span>
                                        <span className="info-value">
                                            {certificate.created_by_email}
                                        </span>
                                    </div>
                                )}


                                <div className="info-item">
                                    <span className="info-label">تاریخ ایجاد:</span>
                                    <span className="info-value">
                                        {formatDate(certificate.created_at)}
                                    </span>
                                </div>

                                <div className="info-item">
                                    <span className="info-label">آخرین بروزرسانی:</span>
                                    <span className="info-value">
                                        {formatDate(certificate.updated_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="actions-card">
                            <h3>عملیات</h3>

                            <div className="action-buttons">
                                <button
                                    onClick={() => handleDownload('pdf')}
                                    className="btn btn-primary btn-block"
                                >
                                    دانلود PDF
                                </button>

                                <button
                                    onClick={() => handleDownload('png')}
                                    className="btn btn-secondary btn-block"
                                >
                                    دانلود تصویر
                                </button>

                                <Link
                                    to={`/validate?id=${certificate.id}`}
                                    className="btn btn-outline btn-block"
                                >
                                    تأیید گواهی‌نامه
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="qr-section">
                        <div className="qr-card">
                            <h3>QR Code</h3>
                            <QRCodeDisplay
                                certificateId={certificate.id}
                                size={250}
                                showDownload={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateDetailPage;