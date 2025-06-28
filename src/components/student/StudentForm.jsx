import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import studentService from '../../services/studentService';
import '../../styles/Student.css';
import moment from 'moment-jalaali';


// کامپوننت JalaliDropdownDatePicker که شما ساخته‌اید
import JalaliDropdownDatePicker from '../common/JalaliDropdownDatePicker'; // مسیر را اصلاح کنید (اگر در common/JalaliDropdownDatePicker.jsx است)


const StudentForm = ({ student = null, onSubmit, onCancel }) => {
    const { id: studentIdFromUrl } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!studentIdFromUrl;

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        student_id: '',
        date_of_birth: '', // این تاریخ همیشه به صورت میلادی
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingInitialData, setIsLoadingInitialData] = useState(isEditMode && !student);

    useEffect(() => {
        const fetchStudentForEdit = async () => {
            if (isEditMode && !student) {
                setIsLoadingInitialData(true);
                const result = await studentService.getStudent(studentIdFromUrl);
                if (result.success) {
                    setFormData({
                        first_name: result.data.first_name || '',
                        last_name: result.data.last_name || '',
                        email: result.data.email || '',
                        student_id: result.data.student_id || '',
                        date_of_birth: result.data.date_of_birth ? result.data.date_of_birth.split('T')[0] : '',
                    });
                } else {
                    alert(result.message || "خطا در بارگذاری اطلاعات دانشجو برای ویرایش");
                    if (onCancel) onCancel();
                    else navigate('/dashboard/students');
                }
                setIsLoadingInitialData(false);
            }
        };

        if (student) {
            setFormData({
                first_name: student.first_name || '',
                last_name: student.last_name || '',
                email: student.email || '',
                student_id: student.student_id || '',
                date_of_birth: student.date_of_birth ? student.date_of_birth.split('T')[0] : '',
            });
            setIsLoadingInitialData(false);
        } else {
            fetchStudentForEdit();
        }
    }, [student, studentIdFromUrl, isEditMode, onCancel, navigate]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'date_of_birth') {
            const jDate = moment(value, 'jYYYY/jMM/jDD');
            if (jDate.isValid()) {
                setFormData(prev => ({
                    ...prev,
                    [name]: jDate.format('YYYY-MM-DD')
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }


        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };


    const validateForm = () => {
        const newErrors = {};

        if (!formData.first_name.trim()) {
            newErrors.first_name = 'نام الزامی است';
        }

        if (!formData.last_name.trim()) {
            newErrors.last_name = 'نام خانوادگی الزامی است';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'ایمیل الزامی است';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'فرمت ایمیل صحیح نیست';
        }

        if (!formData.student_id.trim()) {
            newErrors.student_id = 'شماره دانشجویی الزامی است';
        } else if (!/^\d{10}$/.test(formData.student_id)) {
            newErrors.student_id = 'شماره دانشجویی باید عددی و 10 رقمی باشد';
        }

        if (!formData.date_of_birth) {
            newErrors.date_of_birth = 'تاریخ تولد الزامی است';
        } else {
            const birthDateMoment = moment(formData.date_of_birth, 'YYYY-MM-DD');
            if (!birthDateMoment.isValid()) {
                newErrors.date_of_birth = 'فرمت تاریخ تولد نامعتبر است. (مثال: 1380/01/01 شمسی یا 2001-03-21 میلادی)';
            } else {
                const today = moment();
                const age = today.diff(birthDateMoment, 'years');

                if (age < 10 || age > 100) {
                    newErrors.date_of_birth = `سن نامعتبر است: ${age} سال. باید بین 10 تا 100 سال باشد.`;
                }
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
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                email: formData.email.trim(),
                date_of_birth: formData.date_of_birth,
            };

            let result;
            if (isEditMode) {
                result = await studentService.updateStudent(studentIdFromUrl, submitData);
            } else {
                result = await studentService.createStudent(submitData);
            }

            if (result.success) {
                console.log("StudentForm: Submission successful. Calling onSubmit."); // لاگ تشخیصی
                if (onSubmit) {
                    onSubmit(result.data);
                }
                alert(result.message);
            } else {
                console.log("StudentForm: Submission failed. Result:", result); // لاگ تشخیصی
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
            console.log("StudentForm: Submission caught error:", error); // لاگ تشخیصی
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

    if (isLoadingInitialData) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>در حال بارگذاری اطلاعات دانشجو...</p>
            </div>
        );
    }

    const handleCancelClick = () => {
        console.log("StudentForm: Cancel button clicked."); // لاگ تشخیصی
        if (isEditMode) {
            console.log("StudentForm: Navigating to student detail page:", `/dashboard/students/${studentIdFromUrl}`); // لاگ تشخیصی
            navigate(`/dashboard/students/${studentIdFromUrl}`);
        } else {
            if (onCancel) {
                console.log("StudentForm: Calling onCancel prop (for creation mode)."); // لاگ تشخیصی
                onCancel();
            } else {
                console.log("StudentForm: Navigating to student list (fallback for creation mode)."); // لاگ تشخیصی
                navigate('/dashboard/students');
            }
        }
    };

    return (
        <div className="student-form-container">
            <form onSubmit={handleSubmit} className="student-form">
                <h2 className="form-title">
                    {isEditMode ? 'ویرایش دانشجو' : 'ایجاد دانشجوی جدید'}
                </h2>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="first_name">نام *</label>
                        <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            className={errors.first_name ? 'error' : ''}
                            placeholder="نام را وارد کنید"
                            disabled={isLoading}
                        />
                        {errors.first_name && <span className="field-error">{errors.first_name}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="last_name">نام خانوادگی *</label>
                        <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            className={errors.last_name ? 'error' : ''}
                            placeholder="نام خانوادگی را وارد کنید"
                            disabled={isLoading}
                        />
                        {errors.last_name && <span className="field-error">{errors.last_name}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="email">ایمیل *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={errors.email ? 'error' : ''}
                            placeholder="ایمیل را وارد کنید"
                            disabled={isLoading}
                        />
                        {errors.email && <span className="field-error">{errors.email}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="student_id">شماره دانشجویی</label>
                        <input
                            type="text"
                            id="student_id"
                            name="student_id"
                            value={formData.student_id}
                            onChange={handleInputChange}
                            className={errors.student_id ? 'error' : ''}
                            placeholder="شماره دانشجویی را وارد کنید"
                            disabled={isLoading}
                        />
                        {errors.student_id && <span className="field-error">{errors.student_id}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="date_of_birth">تاریخ تولد</label>
                        <JalaliDropdownDatePicker
                            value={formData.date_of_birth}
                            onChange={handleInputChange} // استفاده از handleInputChange عمومی
                            className={`date-input-group ${errors.date_of_birth ? 'error' : ''}`}
                            placeholder="تاریخ تولد"
                            disabled={isLoading}
                        />
                        {errors.date_of_birth && <span className="field-error">{errors.date_of_birth}</span>}
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? 'در حال ارسال...' : (isEditMode ? 'بروزرسانی' : 'ایجاد دانشجو')}
                    </button>

                    <button
                        type="button"
                        onClick={handleCancelClick}
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

export default StudentForm;