import React, { useState, useEffect } from 'react';
import courseService from '../../services/courseService';
import '../../styles/Course.css';

const CourseForm = ({ course = null, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '', // Changed from title
        description: '',
        duration: '', // Changed from duration_hours
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (course) {
            setFormData({
                name: course.name || '', // Changed from title
                description: course.description || '',
                duration: course.duration || '', // Changed from duration_hours
            });
        }
    }, [course]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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

        if (!formData.name.trim()) {
            newErrors.name = 'عنوان دوره الزامی است';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'توضیحات دوره الزامی است';
        }

        if (formData.duration && (isNaN(formData.duration) || formData.duration <= 0)) {
            newErrors.duration = 'مدت زمان باید عدد مثبت باشد';
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
                name: formData.name.trim(), // Changed from title
                description: formData.description.trim(),
                duration: formData.duration ? parseFloat(formData.duration) : null, // Changed from duration_hours
            };

            let result;
            if (course) {
                result = await courseService.updateCourse(course.id, submitData);
            } else {
                result = await courseService.createCourse(submitData);
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

    return (
        <div className="course-form-container">
            <form onSubmit={handleSubmit} className="course-form">
                <h2 className="form-title">
                    {course ? 'ویرایش دوره' : 'ایجاد دوره جدید'}
                </h2>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="name">عنوان دوره *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={errors.name ? 'error' : ''}
                            placeholder="عنوان دوره را وارد کنید"
                            disabled={isLoading}
                        />
                        {errors.name && <span className="field-error">{errors.name}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="description">توضیحات *</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className={errors.description ? 'error' : ''}
                        placeholder="توضیحات کامل دوره را وارد کنید"
                        rows="4"
                        disabled={isLoading}
                    />
                    {errors.description && <span className="field-error">{errors.description}</span>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="duration">مدت زمان (ساعت) *</label>
                        <input
                            type="number"
                            id="duration"
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            className={errors.duration ? 'error' : ''}
                            placeholder="مدت زمان به ساعت"
                            min="0"
                            step="0.5"
                            disabled={isLoading}
                        />
                        {errors.duration && <span className="field-error">{errors.duration}</span>}
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? 'در حال ارسال...' : (course ? 'بروزرسانی' : 'ایجاد دوره')}
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

export default CourseForm;