import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import certificateService from '../../services/certificateService';
import '../../styles/Certificate.css';

const CertificateCard = ({ certificate, onUpdate, onDelete }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState(null);

    const handleDownload = async (format = 'pdf') => {
        setIsLoading(true);
        const result = await certificateService.downloadCertificate(certificate.id, format);

        if (!result.success) {
            alert(result.message);
        }

        setIsLoading(false);
    };

    const handleShowQR = async () => {
        if (showQR) {
            setShowQR(false);
            return;
        }

        setIsLoading(true);
        const result = await certificateService.getCertificateQRCode(certificate.id);

        if (result.success) {
            setQrCodeUrl(result.qrCodeUrl);
            setShowQR(true);
        } else {
            alert(result.message);
        }

        setIsLoading(false);
    };

    const handleDelete = async () => {
        if (!window.confirm('آیا از حذف این گواهی‌نامه اطمینان دارید؟')) {
            return;
        }

        setIsLoading(true);
        const result = await certificateService.deleteCertificate(certificate.id);

        if (result.success) {
            if (onDelete) {
                onDelete(certificate.id);
            }
            alert(result.message);
        } else {
            alert(result.message);
        }

        setIsLoading(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'نامشخص';
        return new Date(dateString).toLocaleDateString('fa-IR');
    };

    return (
        <div className="certificate-card">
            <div className="certificate-card-header">
                {/* عنوان کارت را از ID یا نام دانشجو/دوره می‌سازیم */}
                <h3 className="certificate-title">
                    {certificate.student?.full_name || certificate.id || 'بدون عنوان'}
                </h3>
                <div className="certificate-status">
          <span className={`status-badge ${certificate.status === 'active' ? 'active' : 'inactive'}`}>
            {certificate.status || 'نامشخص'}
          </span>
                </div>
            </div>

            <div className="certificate-card-body">
                <div className="certificate-info">
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

                    {/* completion_date و grade حذف شدند */}
                </div>

                {showQR && qrCodeUrl && (
                    <div className="qr-code-container">
                        <img src={qrCodeUrl} alt="QR Code" className="qr-code-image" />
                    </div>
                )}
            </div>

            <div className="certificate-card-actions">
                <Link
                    to={`/dashboard/certificates/${certificate.id}`}
                    className="btn btn-primary btn-sm"
                >
                    مشاهده
                </Link>

                <button
                    onClick={handleShowQR}
                    className="btn btn-secondary btn-sm"
                    disabled={isLoading}
                >
                    {showQR ? 'مخفی کردن QR' : 'نمایش QR'}
                </button>

                <div className="dropdown">
                    <button className="btn btn-outline btn-sm dropdown-toggle">
                        دانلود
                    </button>
                    <div className="dropdown-menu">
                        <button
                            onClick={() => handleDownload('pdf')}
                            disabled={isLoading}
                            className="dropdown-item"
                        >
                            PDF
                        </button>
                        <button
                            onClick={() => handleDownload('png')}
                            disabled={isLoading}
                            className="dropdown-item"
                        >
                            PNG
                        </button>
                    </div>
                </div>

                <Link
                    to={`/dashboard/certificates/${certificate.id}/edit`}
                    className="btn btn-outline btn-sm"
                >
                    ویرایش
                </Link>

                <button
                    onClick={handleDelete}
                    className="btn btn-danger btn-sm"
                    disabled={isLoading}
                >
                    حذف
                </button>
            </div>

            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
        </div>
    );
};

export default CertificateCard;