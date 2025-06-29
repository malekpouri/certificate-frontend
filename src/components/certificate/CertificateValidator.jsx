import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import certificateService from '../../services/certificateService';
import '../../styles/Certificate.css';

const CertificateValidator = () => {
    const { id: idFromUrlPath } = useParams(); // گرفتن ID از مسیر URL (مثلا /validate/UUID)
    const location = useLocation(); // برای پارامترهای query (مثلا /validate?id=UUID)
    const [validationMethod, setValidationMethod] = useState('id'); // پیش‌فرض
    const [validationData, setValidationData] = useState({
        certificate_id: '',
        qr_code: '',
    });

    const [validationResult, setValidationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // تابع جدید برای فراخوانی اعتبارسنجی از URL
    const handleValidateFromUrl = async (value, method) => {
        let dataToValidate = {};
        if (method === 'id') {
            dataToValidate = { certificate_id: value };
        } else if (method === 'qr') {
            dataToValidate = { qr_code: value };
        } else {
            setError('روش تأیید نامعتبر است.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setValidationResult(null);

        try {
            const result = await certificateService.validateCertificate(dataToValidate);
            if (result.success) {
                setValidationResult(result);
            } else {
                let displayMessage = result.message;
                if (displayMessage && displayMessage.includes("Not found.")) {
                    displayMessage = "گواهی‌نامه با شناسه/کد وارد شده یافت نشد.";
                } else if (displayMessage && displayMessage.includes("خطا در دریافت اطلاعات گواهی‌نامه")) {
                    displayMessage = "مشکلی در دریافت اطلاعات گواهی‌نامه پیش آمده است.";
                }
                setError(displayMessage);
            }
        } catch (error) {
            setError(error.message || 'خطا در بررسی گواهی‌نامه');
        } finally {
            setIsLoading(false);
        }
    };


    // Effect برای خواندن پارامترها از URL هنگام بارگذاری صفحه یا تغییر URL
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const idFromQuery = queryParams.get('id');
        const qrCodeFromQuery = queryParams.get('qr_code');

        let initialValue = null;
        let initialMethod = 'id'; // پیش‌فرض

        if (idFromUrlPath) {
            initialValue = idFromUrlPath;
            initialMethod = 'id';
        } else if (idFromQuery) {
            initialValue = idFromQuery;
            initialMethod = 'id';
        } else if (qrCodeFromQuery) {
            initialValue = qrCodeFromQuery;
            initialMethod = 'qr';
        }

        // فقط اگر مقداری برای اعتبارسنجی از URL پیدا شد
        if (initialValue) {
            setValidationMethod(initialMethod);
            setValidationData(prev => ({ // وضعیت فرم را به‌روزرسانی کن
                ...prev,
                certificate_id: initialMethod === 'id' ? initialValue : '',
                qr_code: initialMethod === 'qr' ? initialValue : '',
            }));
            // فراخوانی تابع اعتبارسنجی با مقادیر مستقیماً از URL
            handleValidateFromUrl(initialValue, initialMethod);
        }
    }, [idFromUrlPath, location.search]); // وابسته به تغییرات ID در مسیر یا پارامترهای query

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setValidationData(prev => ({
            ...prev,
            [name]: value
        }));

        if (error) {
            setError(null);
        }
    };

    const handleMethodChange = (method) => {
        setValidationMethod(method);
        setValidationData({
            certificate_id: '',
            qr_code: '',
        });
        setValidationResult(null);
        setError(null);
    };

    // تابع handleValidate موجود برای زمانی که کاربر فرم را دستی سابمیت می‌کند
    const handleValidate = async (e) => {
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }

        let dataToValidate = {};

        switch (validationMethod) {
            case 'id':
                if (!validationData.certificate_id.trim()) {
                    setError('شناسه گواهی‌نامه الزامی است');
                    return;
                }
                dataToValidate = { certificate_id: validationData.certificate_id.trim() };
                break;

            case 'qr':
                if (!validationData.qr_code.trim()) {
                    setError('کد QR الزامی است');
                    return;
                }
                dataToValidate = { qr_code: validationData.qr_code.trim() };
                break;

            default:
                setError('روش تأیید نامعتبر است');
                return;
        }

        setIsLoading(true);
        setError(null);
        setValidationResult(null);

        try {
            const result = await certificateService.validateCertificate(dataToValidate);

            if (result.success) {
                setValidationResult(result);
            } else {
                let displayMessage = result.message;
                if (displayMessage && displayMessage.includes("Not found.")) {
                    displayMessage = "گواهی‌نامه با شناسه/کد وارد شده یافت نشد.";
                } else if (displayMessage && displayMessage.includes("خطا در دریافت اطلاعات گواهی‌نامه")) {
                    displayMessage = "مشکلی در دریافت اطلاعات گواهی‌نامه پیش آمده است.";
                }
                setError(displayMessage);
            }
        } catch (error) {
            setError(error.message || 'خطا در بررسی گواهی‌نامه');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'نامشخص';
        return new Date(dateString).toLocaleDateString('fa-IR');
    };

    return (
        <div className="certificate-validator">
            <div className="validator-header">
                <h2>تأیید گواهی‌نامه</h2>
                <p>برای تأیید صحت گواهی‌نامه، یکی از روش‌های زیر را انتخاب کنید:</p>
            </div>

            <div className="validation-methods">
                <button
                    onClick={() => handleMethodChange('id')}
                    className={`method-btn ${validationMethod === 'id' ? 'active' : ''}`}
                >
                    شناسه گواهی‌نامه
                </button>

                <button
                    onClick={() => handleMethodChange('qr')}
                    className={`method-btn ${validationMethod === 'qr' ? 'active' : ''}`}
                >
                    کد QR
                </button>

            </div>

            <form onSubmit={handleValidate} className="validation-form">
                {validationMethod === 'id' && (
                    <div className="form-group">
                        <label htmlFor="certificate_id">شناسه گواهی‌نامه</label>
                        <input
                            type="text"
                            id="certificate_id"
                            name="certificate_id"
                            value={validationData.certificate_id}
                            onChange={handleInputChange}
                            placeholder="شناسه گواهی‌نامه را وارد کنید"
                            disabled={isLoading}
                        />
                        <small className="form-help">
                            شناسه گواهی‌نامه معمولاً در انتهای گواهی‌نامه درج شده است
                        </small>
                    </div>
                )}

                {validationMethod === 'qr' && (
                    <div className="form-group">
                        <label htmlFor="qr_code">کد QR</label>
                        <textarea
                            id="qr_code"
                            name="qr_code"
                            value={validationData.qr_code}
                            onChange={handleInputChange}
                            placeholder="محتوای کد QR را اینجا وارد کنید"
                            rows="4"
                            disabled={isLoading}
                        />
                        <small className="form-help">
                            کد QR موجود در گواهی‌نامه را اسکن کرده و محتوای آن را وارد کنید (اسکن با وب‌کم در این نسخه پشتیبانی نمی‌شود)
                        </small>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                >
                    {isLoading ? 'در حال بررسی...' : 'تأیید گواهی‌نامه'}
                </button>
            </form>

            {validationResult && (
                <div className={`validation-result ${validationResult.valid ? 'valid' : 'invalid'}`}>
                    <div className="result-header">
                        <div className={`result-icon ${validationResult.valid ? 'success' : 'error'}`}>
                            {validationResult.valid ? '✅' : '❌'}
                        </div>
                        <h3>
                            {validationResult.valid ? 'گواهی‌نامه معتبر است' : 'گواهی‌نامه معتبر نیست'}
                        </h3>
                    </div>

                    {validationResult.valid && validationResult.certificate && (
                        <div className="certificate-details">
                            <h4>جزئیات گواهی‌نامه:</h4>

                            <div className="detail-grid">
                                <div className="info-item">
                                    <span className="info-label">شناسه:</span>
                                    <span className="info-value">{validationResult.certificate.id}</span>
                                </div>

                                <div className="info-item">
                                    <span className="info-label">دانشجو:</span>
                                    <span className="info-value">
                                        {validationResult.certificate.student?.full_name || 'نامشخص'}
                                    </span>
                                </div>

                                <div className="info-item">
                                    <span className="info-label">دوره:</span>
                                    <span className="info-value">
                                        {validationResult.certificate.course?.name || 'نامشخص'}
                                    </span>
                                </div>

                                <div className="info-item">
                                    <span className="info-label">تاریخ صدور:</span>
                                    <span className="info-value">
                                        {formatDate(validationResult.certificate.issue_date)}
                                    </span>
                                </div>

                                {validationResult.certificate.expiry_date && (
                                    <div className="info-item">
                                        <span className="info-label">تاریخ انقضا:</span>
                                        <span className="info-value">
                                            {formatDate(validationResult.certificate.expiry_date)}
                                        </span>
                                    </div>
                                )}

                                <div className="info-item">
                                    <span className="info-label">وضعیت:</span>
                                    <span className="info-value">
                                        {validationResult.certificate.status || 'نامشخص'}
                                    </span>
                                </div>

                                {validationResult.certificate.unique_code && (
                                    <div className="info-item">
                                        <span className="info-label">کد یکتا:</span>
                                        <span className="info-value">
                                            {validationResult.certificate.unique_code}
                                        </span>
                                    </div>
                                )}

                                {validationResult.certificate.created_by_email && (
                                    <div className="info-item">
                                        <span className="info-label">صادرکننده:</span>
                                        <span className="info-value">
                                            {validationResult.certificate.created_by_email}
                                        </span>
                                    </div>
                                )}

                                {validationResult.certificate.signature && (
                                    <div className="info-item">
                                        <span className="info-label">امضا:</span>
                                        <span className="info-value" style={{ wordBreak: 'break-all' }}>
                                            {validationResult.certificate.signature}
                                        </span>
                                    </div>
                                )}


                                <div className="info-item">
                                    <span className="info-label">تاریخ ایجاد:</span>
                                    <span className="info-value">
                                        {formatDate(validationResult.certificate.created_at)}
                                    </span>
                                </div>

                                <div className="info-item">
                                    <span className="info-label">آخرین بروزرسانی:</span>
                                    <span className="info-value">
                                        {formatDate(validationResult.certificate.updated_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {!validationResult.valid && validationResult.message && (
                        <div className="error-details">
                            <p>{validationResult.message}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CertificateValidator;