import React, { useState, useEffect } from 'react';
import studentService from '../../services/studentService';
import '../../styles/Student.css';

const StudentForm = ({ student = null, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        student_id: '',
        birth_date: '',
        address: '',
        is_active: true,
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (student) {
            setFormData({
                first_name: student.first_name || '',
                last_name: student.last_name || '',
                email: student.email || '',
                phone: student.phone || '',
                student_id: student.student_id || '',
                birth_date: student.birth_date ? student.birth_date.split('T')[0] : '',
                address: student.address || '',
                is_active: student.is_active !== undefined ? student.is_active : true,
            });

            if (student.avatar) {
                const avatarUrl = student.avatar.startsWith('http')
                    ? student.avatar
                    : `${import.meta.env.VITE_API_URL}${student.avatar}`;
                setAvatarPreview(avatarUrl);
            }
        }
    }, [student]);

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

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    avatar: 'حجم فایل نباید بیشتر از 5 مگابایت باشد'
                }));
                return;
            }

            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({
                    ...prev,
                    avatar: 'فقط فایل‌های تصویری مجاز هستند'
                }));
                return;
            }

            setAvatarFile(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target.result);
            };
            reader.readAsDataURL(file);

            if (errors.avatar) {
                setErrors(prev => ({
                    ...prev,
                    avatar: ''
                }));
            }
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

        if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
            newErrors.phone = 'فرمت شماره تلفن صحیح نیست';
        }

        if (formData.birth_date) {
            const birthDate = new Date(formData.birth_date);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();

            if (age < 10 || age > 100) {
                newErrors.birth_date = 'تاریخ تولد نامعتبر است';
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

        try {
            let result;
            if (student) {
                result = await studentService.updateStudent(student.id, formData);
            } else {
                result = await studentService.createStudent(formData);
            }

            if (result.success) {
                let finalStudent = result.data;

                if (avatarFile && result.data.id) {
                    const avatarResult = await studentService.uploadStudentAvatar(result.data.id, avatarFile);
                    if (avatarResult.success) {
                        finalStudent = avatarResult.data;
                    }
                }

                if (onSubmit) {
                    onSubmit(finalStudent);
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

    const removeAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
    };

    return (
        <div className="student-form-container">
            <form onSubmit={handleSubmit} className="student-form">
                <h2 className="form-title">
                    {student ? 'ویرایش دانشجو' : 'ایجاد دانشجوی جدید'}
                </h2>

                <div className="avatar-section">
                    <div className="avatar-preview">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="آواتار" className="avatar-image" />
                        ) : (
                            <div className="avatar-placeholder">
                                <span>بدون تصویر</span>
                            </div>
                        )}
                    </div>

                    <div className="avatar-controls">
                        <input
                            type="file"
                            id="avatar"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="avatar-input"
                            disabled={isLoading}
                        />
                        <label htmlFor="avatar" className="btn btn-outline btn-sm">
                            انتخاب تصویر
                        </label>

                        {avatarPreview && (
                            <button
                                type="button"
                                onClick={removeAvatar}
                                className="btn btn-danger btn-sm"
                                disabled={isLoading}
                            >
                                حذف تصویر
                            </button>
                        )}
                    </div>

                    {errors.avatar && (
                        <span className="field-error">{errors.avatar}</span>
                    )}
                </div>

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

                    <div className="form-group">
                        <label htmlFor="phone">شماره تلفن</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={errors.phone ? 'error' : ''}
                            placeholder="شماره تلفن را وارد کنید"
                            disabled={isLoading}
                        />
                        {errors.phone && <span className="field-error">{errors.phone}</span>}
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
                            placeholder="شماره دانشجویی را وارد کنید"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="birth_date">تاریخ تولد</label>
                        <input
                            type="date"
                            id="birth_date"
                            name="birth_date"
                            value={formData.birth_date}
                            onChange={handleInputChange}
                            className={errors.birth_date ? 'error' : ''}
                            disabled={isLoading}
                        />
                        {errors.birth_date && <span className="field-error">{errors.birth_date}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="address">آدرس</label>
                    <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="آدرس را وارد کنید"
                        rows="3"
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group">
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

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? 'در حال ارسال...' : (student ? 'بروزرسانی' : 'ایجاد دانشجو')}
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

export default StudentForm;