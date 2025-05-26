import React, { useState, useEffect } from 'react';
import certificateService from '../../services/certificateService';
import studentService from '../../services/studentService';
import courseService from '../../services/courseService';
import '../../styles/Certificate.css';

const CertificateForm = ({ certificate = null, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        student: '',
        course: '',
        issue_date: '',
        completion_date: '',
        grade: '',
        description: '',
        is_active: true,
    });

    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (certificate) {
            setFormData({
                title: certificate.title || '',
                student: certificate.student?.id || certificate.student || '',
                course: certificate.course?.id || certificate.course || '',
                issue_date: certificate.issue_date ? certificate.issue_date.split('T')[0] : '',
                completion_date: certificate.completion_date ? certificate.completion_date.split('T')[0] : '',
                grade: certificate.grade || '',
                description: certificate.description || '',
                is_active: certificate.is_active !== undefined ? certificate.is_active : true,
            });
        }
    }, [certificate]);

    const loadInitialData = async () => {
        setIsLoadingData(true);

        try {
            const [studentsResult, coursesResult] = await Promise.all([
                studentService.getStudents(),
                courseService.getCourses()
            ]);

            if (studentsResult.success) {
                setStudents(studentsResult.data);
            }

            if (coursesResult.success) {
                setCourses(coursesResult.data);
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
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

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'عنوان گواهی‌نامه الزامی است';
        }

        if (!formData.student) {
            newErrors.student = 'انتخاب دانشجو الزامی است';
        }

        if (!formData.course) {
            newErrors.course = 'انتخاب دوره الزامی است';
        }

        if (!formData.issue_date) {
            newErrors.issue_date = 'تاریخ صدور الزامی است';
        }

        if (formData.completion_date && formData.issue_date) {
            const issueDate = new Date(formData.issue_date);
            const completionDate = new Date(formData.completion_date);

            if (completionDate > issueDate) {
                newErrors.completion_date = 'تاریخ تکمیل نمی‌تواند بعد از تاریخ صدور باشد';
            }
        }

        if (formData.grade && (isNaN(formData.grade) || formData.grade < 0 || formData.grade > 20)) {
            newErrors.grade = 'نمره باید عددی بین 0 تا 20 باشد';
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

        try {
            const submitData = {
                ...formData,
                student: parseInt(formData.student),
                course: parseInt(formData.course),
                grade: formData.grade ? parseFloat(formData.grade) : null,
            };

            let result;
            if (certificate) {
                result = await certificateService.updateCertificate(certificate.id, submitData);
            } else {
                result = await certificateService.createCertificate(submitData);
            }

            if (result.success) {
                if (onSubmit) {
                    onSubmit(result.data);
                }
                alert(result.message);
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('خطا در ارسال فرم');
        }

        setIsLoading(false);
    };

    if (isLoadingData) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>در حال بارگذاری...</p>
            </div>
        );
    }

    return (
        <div className="certificate-form-container">
            <form onSubmit={handleSubmit} className="certificate-form">
                <h2 className="form-title">
                    {certificate ? 'ویرایش گواهی‌نامه' : 'ایجاد گواهی‌نامه جدید'}
                </h2>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="title">عنوان گواهی‌نامه *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={errors.title ? 'error' : ''}
                            placeholder="عنوان گواهی‌نامه را وارد کنید"
                            disabled={isLoading}
                        />
                        {errors.title && <span className="field-error">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="is_active">وضعیت</label>
                        <div className="checkbox-container">
                            <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleInputChange}
                                disabled={isLoading}
                            />
                            <label htmlFor="is_active" className="checkbox-label">فعال</label>
                        </div>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="student">دانشجو *</label>
                        <select
                            id="student"
                            name="student"
                            value={formData.student}
                            onChange={handleInputChange}
                            className={errors.student ? 'error' : ''}
                            disabled={isLoading}
                        >
                            <option value="">انتخاب کنید</option>
                            {students.map(student => (
                                <option key={student.id} value={student.id}>
                                    {student.full_name || `${student.first_name} ${student.last_name}`}
                                </option>
                            ))}
                        </select>
                        {errors.student && <span className="field-error">{errors.student}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="course">دوره *</label>
                        <select
                            id="course"
                            name="course"
                            value={formData.course}
                            onChange={handleInputChange}
                            className={errors.course ? 'error' : ''}
                            disabled={isLoading}
                        >
                            <option value="">انتخاب کنید</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                        {errors.course && <span className="field-error">{errors.course}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="issue_date">تاریخ صدور *</label>
                        <input
                            type="date"
                            id="issue_date"
                            name="issue_date"
                            value={formData.issue_date}
                            onChange={handleInputChange}
                            className={errors.issue_date ? 'error' : ''}
                            disabled={isLoading}
                        />
                        {errors.issue_date && <span className="field-error">{errors.issue_date}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="completion_date">تاریخ تکمیل</label>
                        <input
                            type="date"
                            id="completion_date"
                            name="completion_date"
                            value={formData.completion_date}
                            onChange={handleInputChange}
                            className={errors.completion_date ? 'error' : ''}
                            disabled={isLoading}
                        />
                        {errors.completion_date && <span className="field-error">{errors.completion_date}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="grade">نمره (0-20)</label>
                    <input
                        type="number"
                        id="grade"
                        name="grade"
                        value={formData.grade}
                        onChange={handleInputChange}
                        className={errors.grade ? 'error' : ''}
                        placeholder="نمره را وارد کنید"
                        min="0"
                        max="20"
                        step="0.25"
                        disabled={isLoading}
                    />
                    {errors.grade && <span className="field-error">{errors.grade}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="description">توضیحات</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="توضیحات اضافی (اختیاری)"
                        rows="4"
                        disabled={isLoading}
                    />
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