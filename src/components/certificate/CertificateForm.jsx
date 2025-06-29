import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useParams و useNavigate را اضافه کنید
import certificateService from '../../services/certificateService';
import JalaliDropdownDatePicker from '../common/JalaliDropdownDatePicker';

const CertificateForm = ({ certificate = null, onSubmit, onCancel }) => {
    const { id: certificateIdFromUrl } = useParams(); // گرفتن ID از URL برای حالت ویرایش
    const navigate = useNavigate();
    const isEditMode = !!certificateIdFromUrl; // تعیین اینکه آیا در حالت ویرایش هستیم

    const [formData, setFormData] = useState({
        student_id: '',
        course_id: '',
        issue_date: '',
        expiry_date: '',
        status: 'active',
    });

    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true); // وضعیت بارگذاری لیست‌های دانشجو/دوره
    const [isLoadingCertificate, setIsLoadingCertificate] = useState(isEditMode); // وضعیت بارگذاری خود گواهی‌نامه در حالت ویرایش

    useEffect(() => {
        // بارگذاری لیست دانشجویان و دوره‌ها
        loadInitialData();

        // اگر در حالت ویرایش هستیم و پراپ certificate نیامده یا null است، اطلاعات گواهی‌نامه را واکشی کن
        const fetchCertificateForEdit = async () => {
            if (isEditMode && !certificate) {
                setIsLoadingCertificate(true);
                const result = await certificateService.getCertificate(certificateIdFromUrl);
                if (result.success) {
                    setFormData({
                        student_id: result.data.student?.id || result.data.student_id || '',
                        course_id: result.data.course?.id || result.data.course_id || '',
                        issue_date: result.data.issue_date ? result.data.issue_date.split('T')[0] : '',
                        expiry_date: result.data.expiry_date ? result.data.expiry_date.split('T')[0] : '',
                        status: result.data.status || 'active',
                    });
                } else {
                    alert(result.message || "خطا در بارگذاری اطلاعات گواهی‌نامه برای ویرایش");
                    // اگر واکشی اطلاعات گواهی‌نامه شکست خورد، به لیست برگرد
                    navigate('/dashboard/certificates');
                }
                setIsLoadingCertificate(false);
            }
        };

        if (certificate) { // اگر certificate از طریق پراپ (از CertificateDetailPage) آمده است
            setFormData({
                student_id: certificate.student?.id || certificate.student_id || '',
                course_id: certificate.course?.id || certificate.course_id || '',
                issue_date: certificate.issue_date ? certificate.issue_date.split('T')[0] : '',
                expiry_date: certificate.expiry_date ? certificate.expiry_date.split('T')[0] : '',
                status: certificate.status || 'active',
            });
            setIsLoadingCertificate(false); // بارگذاری گواهی‌نامه تمام شده است
        } else {
            // اگر certificate از پراپ نیامده و در حالت ویرایش هستیم، باید آن را واکشی کنیم
            fetchCertificateForEdit();
        }
    }, [certificate, certificateIdFromUrl, isEditMode, navigate]); // navigate را به dependencies اضافه کنید


    const loadInitialData = async () => {
        setIsLoadingData(true);
        setErrors({});

        try {
            const [studentsResult, coursesResult] = await Promise.all([
                certificateService.getStudents(),
                certificateService.getCourses()
            ]);

            if (studentsResult.success) {
                setStudents(studentsResult.data);
            } else {
                setErrors(prev => ({ ...prev, students: studentsResult.message || 'خطا در دریافت لیست دانشجویان' }));
            }

            if (coursesResult.success) {
                setCourses(coursesResult.data);
            } else {
                setErrors(prev => ({ ...prev, courses: coursesResult.message || 'خطا در دریافت لیست دوره‌ها' }));
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
            setErrors(prev => ({ ...prev, general: 'خطا در بارگذاری اطلاعات اولیه' }));
        }

        setIsLoadingData(false);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleDateChange = (name, gregorianDateString) => {
        setFormData(prev => ({
            ...prev,
            [name]: gregorianDateString
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.student_id) {
            newErrors.student_id = 'انتخاب دانشجو الزامی است';
        }

        if (!formData.course_id) {
            newErrors.course_id = 'انتخاب دوره الزامی است';
        }

        if (!formData.issue_date) {
            newErrors.issue_date = 'تاریخ صدور الزامی است';
        }

        if (formData.expiry_date && formData.issue_date) {
            const issueDate = new Date(formData.issue_date);
            const expiryDate = new Date(formData.expiry_date);

            if (expiryDate <= issueDate) {
                newErrors.expiry_date = 'تاریخ انقضا باید بعد از تاریخ صدور باشد';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const submitData = {
                student_id: formData.student_id,
                course_id: formData.course_id,
                issue_date: formData.issue_date,
                expiry_date: formData.expiry_date,
                status: formData.status,
            };

            let result;
            if (certificate) { // از پراپ certificate استفاده می‌کنیم
                result = await certificateService.updateCertificate(certificate.id, submitData);
            } else { // اگر certificate null باشد، یعنی در حال ایجاد هستیم
                result = await certificateService.createCertificate(submitData);
            }

            if (result.success) {
                if (onSubmit) {
                    onSubmit(result.data); // فراخوانی onSubmit که ناوبری/پنهان کردن را در والد انجام می‌دهد
                }
                alert(result.message);
            } else {
                if (result.errors) {
                    setErrors(result.errors);
                    if (result.errors.non_field_errors) {
                        alert(result.errors.non_field_errors.join(', '));
                    } else if (result.message) {
                        alert(result.message);
                    }
                } else {
                    alert(result.message || 'خطا در ارسال فرم');
                }
            }
        } catch (error) {
            if (error.status === 400 && error.errors) {
                setErrors(error.errors);
                if (error.errors.non_field_errors) {
                    alert(error.errors.non_field_errors.join(', '));
                } else if (error.message) {
                    alert(error.message);
                }
            } else {
                alert(error.message || 'خطا در ارسال فرم');
            }
        }

        setIsLoading(false);
    };

    // وضعیت بارگذاری کلی فرم (هم لیست‌ها و هم خود گواهی‌نامه)
    if (isLoadingData || isLoadingCertificate) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>در حال بارگذاری فرم گواهی‌نامه...</p>
            </div>
        );
    }

    return (
        <div className="certificate-form-container">
            <form onSubmit={handleSubmit} className="certificate-form">
                <h2 className="form-title">
                    {isEditMode ? 'ویرایش گواهی‌نامه' : 'ایجاد گواهی‌نامه جدید'}
                </h2>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="student_id">دانشجو *</label>
                        <select
                            id="student_id"
                            name="student_id"
                            value={formData.student_id}
                            onChange={handleInputChange}
                            className={errors.student_id ? 'error' : ''}
                            disabled={isLoading || isEditMode}
                        >
                            <option value="">انتخاب کنید</option>
                            {students.map(student => (
                                <option key={student.id} value={student.id}>
                                    {student.full_name || `${student.first_name} ${student.last_name}`}
                                </option>
                            ))}
                        </select>
                        {errors.student_id && <span className="field-error">{errors.student_id}</span>}
                        {errors.students && <span className="field-error">{errors.students}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="course_id">دوره *</label>
                        <select
                            id="course_id"
                            name="course_id"
                            value={formData.course_id}
                            onChange={handleInputChange}
                            className={errors.course_id ? 'error' : ''}
                            disabled={isLoading}
                        >
                            <option value="">انتخاب کنید</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.name || course.title}
                                </option>
                            ))}
                        </select>
                        {errors.course_id && <span className="field-error">{errors.course_id}</span>}
                        {errors.courses && <span className="field-error">{errors.courses}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="issue_date">تاریخ صدور *</label>
                        <JalaliDropdownDatePicker
                            value={formData.issue_date}
                            onChange={(date) => handleDateChange('issue_date', date)}
                            className={`date-input-group ${errors.issue_date ? 'error' : ''}`}
                            placeholder="تاریخ صدور"
                            disabled={isLoading}
                        />
                        {errors.issue_date && <span className="field-error">{errors.issue_date}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="expiry_date">تاریخ انقضا</label>
                        <JalaliDropdownDatePicker
                            value={formData.expiry_date}
                            onChange={(date) => handleDateChange('expiry_date', date)}
                            className={`date-input-group ${errors.expiry_date ? 'error' : ''}`}
                            placeholder="تاریخ انقضا"
                            disabled={isLoading}
                        />
                        {errors.expiry_date && <span className="field-error">{errors.expiry_date}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="status">وضعیت</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        disabled={isLoading}
                    >
                        <option value="active">فعال</option>
                        <option value="inactive">غیرفعال</option>
                        <option value="pending">در انتظار</option>
                        <option value="expired">منقضی شده</option>
                        <option value="revoked">باطل شده</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? 'در حال ارسال...' : (certificate ? 'بروزرسانی' : 'ایجاد گواهی‌نامه')}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn btn-secondary"
                        disabled={isLoading}
                    >
                        لغو
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CertificateForm;