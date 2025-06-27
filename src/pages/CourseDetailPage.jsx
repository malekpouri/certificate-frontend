import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CourseForm from '../components/course/CourseForm';
import courseService from '../services/courseService';
import useAuth from '../hooks/useAuth';
import '../styles/Course.css';

const CourseDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const [course, setCourse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        loadCourseData();
    }, [id]);

    const loadCourseData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const courseResult = await courseService.getCourse(id);

            if (courseResult.success) {
                setCourse(courseResult.data);
            } else {
                setError(courseResult.message);
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
        return `${hours} ساعت`;
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
                        <div className="course-header-details">
                            <h1>{course.name}</h1> {/* Changed from course.title */}
                            <div className="header-meta">
                                <span className="create-date">ایجاد: {formatDate(course.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="header-actions">
                    <button onClick={() => navigate('/dashboard/courses')} className="btn btn-secondary"> {/* مسیر را اصلاح کردم */}
                        بازگشت به لیست دوره‌ها
                    </button>

                    {isAdmin() && (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn btn-secondary"
                            >
                                ویرایش
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
                <div className="tab-content">
                    <div className="course-info-tab">
                        <div className="info-cards-grid">
                            <div className="info-card">
                                <h3>اطلاعات کلی</h3>
                                <div className="info-grid">
                                    {course.duration && (
                                        <div className="info-item">
                                            <span className="info-label">مدت زمان:</span>
                                            <span className="info-value">{formatDuration(course.duration)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="info-card">
                                <h3>تاریخ‌ها</h3>
                                <div className="info-grid">
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;