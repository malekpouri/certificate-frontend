import React, { useState } from 'react';
import certificateService from '../../services/certificateService';
import '../../styles/Certificate.css';

const CertificateValidator = () => {
    const [validationMethod, setValidationMethod] = useState('id');
    const [validationData, setValidationData] = useState({
        certificate_id: '',
        qr_code: '',
        student_name: '',
        course_name: '',
    });

    const [validationResult, setValidationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

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
            student_name: '',
            course_name: '',
        });
        setValidationResult(null);
        setError(null);
    };

    const handleValidate = async (e) => {
        e.preventDefault();

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

            case 'info':
                if (!validationData.student_name.trim() || !validationData.course_name.trim()) {
                    setError('نام دانشجو و نام دوره الزامی است');
                    return;
                }
                dataToValidate = {
                    student_name: validationData.student_name.trim(),
                    course_name: validationData.course_name.trim()
                };
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
                setValidationResult(result.data);
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('خطا در بررسی گواهی‌نامه');
        }

        setIsLoading(false);
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

                <button
                    onClick={() => handleMethodChange('info')}
                    className={`method-btn ${validationMethod === 'info' ? 'active' : ''}`}
                >
                    اطلاعات دانشجو
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
                            کد QR موجود در گواهی‌نامه را اسکن کرده و محتوای آن را وارد کنید
                        </small>
                    </div>
                )}

                {validationMethod === 'info' && (
                    <>
                        <div className="form-group">
                            <label htmlFor="student_name">نام دانشجو</label>
                            <input
                                type="text"
                                id="student_name"
                                name="student_name"
                                value={validationData.student_name}
                                onChange={handleInputChange}
                                placeholder="نام کامل دانشجو"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="course_name">نام دوره</label>
                            <input
                                type="text"
                                id="course_name"
                                name="course_name"
                                value={validationData.course_name}
                                onChange={handleInputChange}
                                placeholder="نام دوره آموزشی"
                                disabled={isLoading}
                            />
                        </div>
                    </>
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
                                <div className="detail-item">
                                    <span className="detail-label">عنوان:</span>
                                    <span className="detail-value">{validationResult.certificate.title}</span>
                                </div>

                                <div className="detail-item">
                                    <span className="detail-label">دانشجو:</span>
                                    <span className="detail-value">{validationResult.certificate.student_name}</span>
                                </div>

                                <div className="detail-item">
                                    <span className="detail-label">دوره:</span>
                                    <span className="detail-value">{validationResult.certificate.course_name}</span>
                                </div>

                                <div className="detail-item">
                                    <span className="detail-label">تاریخ صدور:</span>
                                    <span className="detail-value">
                    {formatDate(validationResult.certificate.issue_date)}
                  </span>
                                </div>

                                {validationResult.certificate.completion_date && (
                                    <div className="detail-item">
                                        <span className="detail-label">تاریخ تکمیل:</span>
                                        <span className="detail-value">
                      {formatDate(validationResult.certificate.completion_date)}
                    </span>
                                    </div>
                                )}

                                {validationResult.certificate.grade && (
                                    <div className="detail-item">
                                        <span className="detail-label">نمره:</span>
                                        <span className="detail-value">{validationResult.certificate.grade}</span>
                                    </div>
                                )}
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