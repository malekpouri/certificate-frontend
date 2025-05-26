import React, { useState, useEffect } from 'react';
import courseService from '../../services/courseService';
import '../../styles/Course.css';

const CourseForm = ({ course = null, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        instructor: '',
        duration_hours: '',
        start_date: '',
        end_date: '',
        difficulty_level: 'beginner',
        prerequisites: '',
        max_students: '',
        price: '',
        is_active: true,
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title || '',
                description: course.description || '',
                category: course.category || '',
                instructor: course.instructor || '',
                duration_hours: course.duration_hours || '',
                start_date: course.start_date ? course.start_date.split('T')[0] : '',
                end_date: course.end_date ? course.end_date.split('T')[0] : '',
                difficulty_level: course.difficulty_level || 'beginner',
                prerequisites: Array.isArray(course.prerequisites)
                    ? course.prerequisites.join(', ')
                    : course.prerequisites || '',
                max_students: course.max_students || '',
                price: course.price || '',
                is_active: course.is_active !== undefined ? course.is_active : true,
            });

            if (course.image) {
                const imageUrl = course.image.startsWith('http')
                    ? course.image
                    : `${import.meta.env.VITE_API_URL}${course.image}`;
                setImagePreview(imageUrl);
            }
        }
    }, [course]);

    const loadInitialData = async () => {
        setIsLoadingData(true);

        try {
            const categoriesResult = await courseService.getCourseCategories();
            if (categoriesResult.success) {
                setCategories(categoriesResult.data);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    image: 'حجم فایل نباید بیشتر از 5 مگابایت باشد'
                }));
                return;
            }

            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({
                    ...prev,
                    image: 'فقط فایل‌های تصویری مجاز هستند'
                }));
                return;
            }

            setImageFile(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);

            if (errors.image) {
                setErrors(prev => ({
                    ...prev,
                    image: ''
                }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'عنوان دوره الزامی است';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'توضیحات دوره الزامی است';
        }

        if (formData.duration_hours && (isNaN(formData.duration_hours) || formData.duration_hours <= 0)) {
            newErrors.duration_hours = 'مدت زمان باید عدد مثبت باشد';
        }

        if (formData.max_students && (isNaN(formData.max_students) || formData.max_students <= 0)) {
            newErrors.max_students = 'حداکثر تعداد دانشجو باید عدد مثبت باشد';
        }

        if (formData.price && (isNaN(formData.price) || formData.price < 0)) {
            newErrors.price = 'قیمت باید عدد غیرمنفی باشد';
        }

        if (formData.start_date && formData.end_date) {
            const startDate = new Date(formData.start_date);
            const endDate = new Date(formData.end_date);

            if (endDate <= startDate) {
                newErrors.end_date = 'تاریخ پایان باید بعد از تاریخ شروع باشد';
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
            const submitData = {
                ...formData,
                duration_hours: formData.duration_hours ? parseFloat(formData.duration_hours) : null,
                max_students: formData.max_students ? parseInt(formData.max_students) : null,
                price: formData.price ? parseFloat(formData.price) : null,
                prerequisites: formData.prerequisites
                    ? formData.prerequisites.split(',').map(item => item.trim()).filter(item => item)
                    : [],
            };

            let result;
            if (course) {
                result = await courseService.updateCourse(course.id, submitData);
            } else {
                result = await courseService.createCourse(submitData);
            }

            if (result.success) {
                let finalCourse = result.data;

                if (imageFile && result.data.id) {
                    const imageResult = await courseService.uploadCourseImage(result.data.id, imageFile);
                    if (imageResult.success) {
                        finalCourse = imageResult.data;
                    }
                }

                if (onSubmit) {
                    onSubmit(finalCourse);
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

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
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
        <div className="course-form-container">
            <form onSubmit={handleSubmit} className="course-form">
                <h2 className="form-title">
                    {course ? 'ویرایش دوره' : 'ایجاد دوره جدید'}
                </h2>

                <div className="image-section">
                    <div className="image-preview">
                        {imagePreview ? (
                            <img src={imagePreview} alt="تصویر دوره" className="course-image-preview" />
                        ) : (
                            <div className="image-placeholder">
                                <span className="placeholder-icon">📚</span>
                                <span>بدون تصویر</span>
                            </div>
                        )}
                    </div>

                    <div className="image-controls">
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="image-input"
                            disabled={isLoading}
                        />
                        <label htmlFor="image" className="btn btn-outline btn-sm">
                            انتخاب تصویر
                        </label>

                        {imagePreview && (
                            <button
                                type="button"
                                onClick={removeImage}
                                className="btn btn-danger btn-sm"
                                disabled={isLoading}
                            >
                                حذف تصویر
                            </button>
                        )}
                    </div>
                    {errors.image && (
                        <span className="field-error">{errors.image}</span>
                    )}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="title">عنوان دوره *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={errors.title ? 'error' : ''}
                            placeholder="عنوان دوره را وارد کنید"
                            disabled={isLoading}
                        />
                        {errors.title && <span className="field-error">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">دسته‌بندی</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        >
                            <option value="">انتخاب کنید</option>
                            {categories.map(category => (
                                <option key={category.id || category} value={category.name || category}>
                                    {category.name || category}
                                </option>
                            ))}
                        </select>
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
                        <label htmlFor="instructor">مدرس</label>
                        <input
                            type="text"
                            id="instructor"
                            name="instructor"
                            value={formData.instructor}
                            onChange={handleInputChange}
                            placeholder="نام مدرس را وارد کنید"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="difficulty_level">سطح دشواری</label>
                        <select
                            id="difficulty_level"
                            name="difficulty_level"
                            value={formData.difficulty_level}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        >
                            <option value="beginner">مبتدی</option>
                            <option value="intermediate">متوسط</option>
                            <option value="advanced">پیشرفته</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="duration_hours">مدت زمان (ساعت)</label>
                        <input
                            type="number"
                            id="duration_hours"
                            name="duration_hours"
                            value={formData.duration_hours}
                            onChange={handleInputChange}
                            className={errors.duration_hours ? 'error' : ''}
                            placeholder="مدت زمان به ساعت"
                            min="0"
                            step="0.5"
                            disabled={isLoading}
                        />
                        {errors.duration_hours && <span className="field-error">{errors.duration_hours}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="max_students">حداکثر دانشجو</label>
                        <input
                            type="number"
                            id="max_students"
                            name="max_students"
                            value={formData.max_students}
                            onChange={handleInputChange}
                            className={errors.max_students ? 'error' : ''}
                            placeholder="حداکثر تعداد دانشجو"
                            min="1"
                            disabled={isLoading}
                        />
                        {errors.max_students && <span className="field-error">{errors.max_students}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="start_date">تاریخ شروع</label>
                        <input
                            type="date"
                            id="start_date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="end_date">تاریخ پایان</label>
                        <input
                            type="date"
                            id="end_date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleInputChange}
                            className={errors.end_date ? 'error' : ''}
                            disabled={isLoading}
                        />
                        {errors.end_date && <span className="field-error">{errors.end_date}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="price">قیمت (تومان)</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className={errors.price ? 'error' : ''}
                        placeholder="قیمت دوره به تومان (برای رایگان خالی بگذارید)"
                        min="0"
                        disabled={isLoading}
                    />
                    {errors.price && <span className="field-error">{errors.price}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="prerequisites">پیش‌نیازها</label>
                    <input
                        type="text"
                        id="prerequisites"
                        name="prerequisites"
                        value={formData.prerequisites}
                        onChange={handleInputChange}
                        placeholder="پیش‌نیازها را با کاما جدا کنید"
                        disabled={isLoading}
                    />
                    <small className="form-help">
                        پیش‌نیازهای دوره را با کاما (،) از هم جدا کنید
                    </small>
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