import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CourseForm from '../components/course/CourseForm';
import CertificateList from '../components/certificate/CertificateList';
import courseService from '../services/courseService';
import useAuth from '../hooks/useAuth';
import '../styles/Course.css';

const CourseDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const [course, setCourse] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        loadCourseData();
    }, [id]);

    const loadCourseData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [courseResult, statsResult] = await Promise.all([
                courseService.getCourse(id),
                courseService.getCourseStatistics(id)
            ]);

            if (courseResult.success) {
                setCourse(courseResult.data);
            } else {
                setError(courseResult.message);
            }

            if (statsResult.success) {
                setStatistics(statsResult.data);
            }
        } catch (error) {
            setError('خطا در دریافت اطلاعات دوره');
        }

        setIsLoading(false);
    };

    const handleDelete = async () => {
        if (!window.confirm('آیا از حذف این دوره اطمینان دارید؟')) {
            return;
        }

        const result = await courseService.deleteCourse(id);

        if (result.success) {
            alert(result.message);
            navigate('/courses');
        } else {
            alert(result.message);
        }
    };

    const handleToggleStatus = async () => {
        const result = course.is_active
            ? await courseService.deactivateCourse(id)
            : await courseService.activateCourse(id);

        if (result.success) {
            setCourse(result.data);
            alert(result.message);
        } else {
            alert(result.message);
        }
    };

    const handleDuplicate = async () => {
        const result = await courseService.duplicateCourse(id);

        if (result.success) {
            alert(result.message);
            navigate(`/courses/${result.data.id}`);
        } else {
            alert(result.message);
        }
    };

    const handleEditSuccess = (updatedCourse) => {
        setCourse(updatedCourse);
        setIsEditing(false);
    };

    const handleEditCancel = () => {
        setIsEditing(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'نامشخص';
        return new Date(dateString).toLocaleDateString('fa-IR');
    };

    const formatDuration = (hours) => {
        if (!hours) return 'نامشخص';
        if (hours < 1) return `${Math.round(hours * 60)} دقیقه`;
        return `${hours} ساعت`;
    };

    const formatPrice = (price) => {
        if (!price || price === 0) return 'رایگان';
        return `${price.toLocaleString()} تومان`;
    };

    const getImageUrl = () => {
        if (course?.image) {
            return course.image.startsWith('http')
                ? course.image
                : `${import.meta.env.VITE_API_URL}${course.image}`;
        }
        return null;
    };

    const getDifficultyText = (level) => {
        switch (level) {
            case 'beginner': return 'مبتدی';
            case 'intermediate': return 'متوسط';
            case 'advanced': return 'پیشرفته';
            default: return 'نامشخص';
        }
    };

    const getDifficultyColor = (level) => {
        switch (level) {
            case 'beginner': return '#28a745';
            case 'intermediate': return '#ffc107';
            case 'advanced': return '#dc3545';
            default: return '#6c757d';
        }
    };

    if (isLoading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="error-container">
                    <h3>خطا در بارگذاری</h3>
                    <p>{error}</p>
                    <div className="error-actions">
                        <button onClick={loadCourseData} className="btn btn-primary">
                            تلاش مجدد
                        </button>
                        <Link to="/courses" className="btn btn-secondary">
                            بازگشت به لیست
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (isEditing && isAdmin()) {
        return (
            <div className="page-container">
                <CourseForm
                    course={course}
                    onSubmit={handleEditSuccess}
                    onCancel={handleEditCancel}
                />
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="header-content">
                    <div className="course-header-info">
                        <div className="course-image-large">
                            {getImageUrl() ? (
                                <img
                                    src={getImageUrl()}
                                    alt={course.title}
                                    className="course-image"
                                />
                            ) : (
                                <div className="course-image-placeholder">
                                    <span className="course-icon">📚</span>
                                </div>
                            )}
                        </div>

                        <div className="course-header-details">
                            <h1>{course.title}</h1>
                            {course.category && (
                                <p className="course-category">دسته‌بندی: {course.category}</p>
                            )}
                            <div className="header-meta">
               <span className={`status-badge ${course.is_active ? 'active' : 'inactive'}`}>
                 {course.is_active ? 'فعال' : 'غیرفعال'}
               </span>
                                {course.difficulty_level && (
                                    <span
                                        className="difficulty-badge"
                                        style={{ backgroundColor: getDifficultyColor(course.difficulty_level) }}
                                    >
                   {getDifficultyText(course.difficulty_level)}
                 </span>
                                )}
                                <span className="create-date">ایجاد: {formatDate(course.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="header-actions">
                    <Link to="/courses" className="btn btn-outline">
                        بازگشت به لیست
                    </Link>

                    {isAdmin() && (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn btn-secondary"
                            >
                                ویرایش
                            </button>

                            <button
                                onClick={handleDuplicate}
                                className="btn btn-info"
                            >
                                کپی کردن
                            </button>

                            <button
                                onClick={handleToggleStatus}
                                className={`btn ${course.is_active ? 'btn-warning' : 'btn-success'}`}
                            >
                                {course.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                            </button>

                            <button
                                onClick={handleDelete}
                                className="btn btn-danger"
                            >
                                حذف
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="page-content">
                <div className="course-detail-tabs">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
                    >
                        اطلاعات دوره
                    </button>
                    <button
                        onClick={() => setActiveTab('certificates')}
                        className={`tab-button ${activeTab === 'certificates' ? 'active' : ''}`}
                    >
                        گواهی‌نامه‌ها
                        {statistics?.certificates_count > 0 && (
                            <span className="tab-badge">{statistics.certificates_count}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('statistics')}
                        className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
                    >
                        آمار و ارقام
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'info' && (
                        <div className="course-info-tab">
                            <div className="info-cards-grid">
                                <div className="info-card">
                                    <h3>اطلاعات کلی</h3>
                                    <div className="info-grid">
                                        {course.instructor && (
                                            <div className="info-item">
                                                <span className="info-label">مدرس:</span>
                                                <span className="info-value">{course.instructor}</span>
                                            </div>
                                        )}
                                        {course.duration_hours && (
                                            <div className="info-item">
                                                <span className="info-label">مدت زمان:</span>
                                                <span className="info-value">{formatDuration(course.duration_hours)}</span>
                                            </div>
                                        )}
                                        <div className="info-item">
                                            <span className="info-label">قیمت:</span>
                                            <span className="info-value">{formatPrice(course.price)}</span>
                                        </div>
                                        {course.max_students && (
                                            <div className="info-item">
                                                <span className="info-label">ظرفیت:</span>
                                                <span className="info-value">{course.max_students} نفر</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="info-card">
                                    <h3>تاریخ‌ها</h3>
                                    <div className="info-grid">
                                        {course.start_date && (
                                            <div className="info-item">
                                                <span className="info-label">تاریخ شروع:</span>
                                                <span className="info-value">{formatDate(course.start_date)}</span>
                                            </div>
                                        )}
                                        {course.end_date && (
                                            <div className="info-item">
                                                <span className="info-label">تاریخ پایان:</span>
                                                <span className="info-value">{formatDate(course.end_date)}</span>
                                            </div>
                                        )}
                                        <div className="info-item">
                                            <span className="info-label">ایجاد:</span>
                                            <span className="info-value">{formatDate(course.created_at)}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">بروزرسانی:</span>
                                            <span className="info-value">{formatDate(course.updated_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                {course.description && (
                                    <div className="info-card full-width">
                                        <h3>توضیحات</h3>
                                        <div className="description-content">
                                            <p>{course.description}</p>
                                        </div>
                                    </div>
                                )}

                                {course.prerequisites && course.prerequisites.length > 0 && (
                                    <div className="info-card full-width">
                                        <h3>پیش‌نیازها</h3>
                                        <div className="prerequisites-list">
                                            {course.prerequisites.map((prereq, index) => (
                                                <span key={index} className="prerequisite-tag">
                         {prereq}
                       </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'certificates' && (
                        <div className="certificates-tab">
                            <CertificateList
                                filters={{ course: id }}
                                showFilters={false}
                            />
                        </div>
                    )}

                    {activeTab === 'statistics' && (
                        <div className="statistics-tab">
                            {statistics ? (
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-number">{statistics.total_students || 0}</div>
                                        <div className="stat-label">کل دانشجویان</div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-number">{statistics.active_students || 0}</div>
                                        <div className="stat-label">دانشجویان فعال</div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-number">{statistics.certificates_count || 0}</div>
                                        <div className="stat-label">گواهی‌نامه صادر شده</div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-number">{statistics.completion_rate || 0}%</div>
                                        <div className="stat-label">نرخ تکمیل</div>
                                    </div>

                                    {statistics.average_grade && (
                                        <div className="stat-card">
                                            <div className="stat-number">{statistics.average_grade.toFixed(2)}</div>
                                            <div className="stat-label">میانگین نمرات</div>
                                        </div>
                                    )}

                                    {statistics.last_certificate_date && (
                                        <div className="stat-card full-width">
                                            <div className="stat-label">آخرین گواهی‌نامه</div>
                                            <div className="stat-value">{formatDate(statistics.last_certificate_date)}</div>
                                        </div>
                                    )}

                                    {statistics.revenue && (
                                        <div className="stat-card full-width">
                                            <div className="stat-label">درآمد کل</div>
                                            <div className="stat-value">{statistics.revenue.toLocaleString()} تومان</div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="loading-container">
                                    <p>در حال بارگذاری آمار...</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;