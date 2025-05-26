import React, { useState, useEffect } from 'react';
import certificateService from '../../services/certificateService';
import '../../styles/Certificate.css';

const QRCodeDisplay = ({ certificateId, size = 200, showDownload = true }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (certificateId) {
            loadQRCode();
        }
    }, [certificateId]);

    const loadQRCode = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await certificateService.getCertificateQRCode(certificateId);

            if (result.success) {
                setQrCodeUrl(result.qrCodeUrl);
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('خطا در دریافت QR Code');
        }

        setIsLoading(false);
    };

    const handleDownloadQR = () => {
        if (!qrCodeUrl) return;

        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `certificate-${certificateId}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopyLink = async () => {
        const validationUrl = `${window.location.origin}/validate/${certificateId}`;

        try {
            await navigator.clipboard.writeText(validationUrl);
            alert('لینک تأیید کپی شد');
        } catch (error) {
            const textArea = document.createElement('textarea');
            textArea.value = validationUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('لینک تأیید کپی شد');
        }
    };

    if (isLoading) {
        return (
            <div className="qr-loading">
                <div className="loading-spinner"></div>
                <p>در حال تولید QR Code...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="qr-error">
                <p className="error-message">{error}</p>
                <button onClick={loadQRCode} className="btn btn-sm btn-primary">
                    تلاش مجدد
                </button>
            </div>
        );
    }

    return (
        <div className="qr-code-display">
            <div className="qr-code-container">
                {qrCodeUrl && (
                    <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="qr-code-image"
                        style={{ width: size, height: size }}
                    />
                )}
            </div>

            <div className="qr-info">
                <p className="qr-description">
                    برای تأیید گواهی‌نامه، این QR Code را اسکن کنید
                </p>

                {showDownload && (
                    <div className="qr-actions">
                        <button
                            onClick={handleDownloadQR}
                            className="btn btn-outline btn-sm"
                            disabled={!qrCodeUrl}
                        >
                            دانلود QR Code
                        </button>

                        <button
                            onClick={handleCopyLink}
                            className="btn btn-secondary btn-sm"
                        >
                            کپی لینک تأیید
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRCodeDisplay;