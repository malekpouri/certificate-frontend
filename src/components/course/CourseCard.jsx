import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import courseService from '../../services/courseService';
import '../../styles/Course.css';

const CourseCard = ({ course, onUpdate, onDelete, onDuplicate }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleToggleStatus = async () => {
        setIsLoading(true);

        const result = course.is_active
            ? await courseService.deactivateCourse(course.id)
            : await courseService.activateCourse(course.id);

        if (result.success) {
            if (onUpdate) {
                onUpdate(result.data);
            }
            alert(result.message);
        } else {
            alert(result.message);
        }

        setIsLoading(false);
    };

    const handleDelete = async () => {
        if (!window.confirm('آیا از حذف این دوره اطمینان دارید؟')) {
            return;
        }

        setIsLoading(true);
        const result = await courseService.deleteCourse(course.id);

        if (result.success) {
            if (onDelete) {
                onDelete(course.id);
            }
            alert(result.message);
        } else {
            alert(result.message);
        }

        setIsLoading(false);
    };

    const handleDuplicate = async () => {
        setIsLoading(true);
        const result = await courseService.duplicateCourse(course.id);

        if (result.success) {
            if (onDuplicate) {
                onDuplicate(result.data);
            }
            alert(result.message);
        } else {
            alert(result.message);
        }

        setIsLoading(false);
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

    const getImageUrl = () => {
        if (course.image) {
            return course.image.startsWith('http')
                ? course.image
                : `${import.meta.env.VITE_API_URL}${course.image}`;
        }
        return null;
    };

    const getDifficultyColor = (level) => {
        switch (level) {
            case 'beginner': return '#28a745';
            case 'intermediate': return '#ffc107';
            case 'advanced': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getDifficultyText = (level) => {
        switch (level) {
            case 'beginner': return 'مبتدی';
            case 'intermediate': return 'متوسط';
            case 'advanced': return 'پیشرفته';
            default: return 'نامشخص';
        }
    };

    return (
        <div className="course-card">
            <div className="course-card-image">
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

                <div className="course-card-overlay">
                    <div className="course-status">
            <span className={`status-badge ${course.is_active ? 'active' : 'inactive'}`}>
              {course.is_active ? 'فعال' : 'غیرفعال'}
            </span>
                    </div>

                    {course.difficulty_level && (
                        <div className="course-difficulty">
              <span
                  className="difficulty-badge"
                  style={{ backgroundColor: getDifficultyColor(course.difficulty_level) }}
              >
                {getDifficultyText(course.difficulty_level)}
              </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="course-card-content">
                <div className="course-card-header">
                    <h3 className="course-title">{course.title}</h3>
                    {course.category && (
                        <span className="course-category">{course.category}</span>
                    )}
                </div>

                <div className="course-description">
                    <p>{course.description || 'توضیحاتی برای این دوره ارائه نشده است.'}</p>
                </div>

                <div className="course-info">
                    {course.instructor && (
                        <div className="info-item">
                            <span className="info-icon">👨‍🏫</span>
                            <span className="info-text">مدرس: {course.instructor}</span>
                        </div>
                    )}

                    {course.duration_hours && (
                        <div className="info-item">
                            <span className="info-icon">⏱️</span>
                            <span className="info-text">مدت: {formatDuration(course.duration_hours)}</span>
                        </div>
                    )}

                    {course.start_date && (
                        <div className="info-item">
                            <span className="info-icon">📅</span>
                            <span className="info-text">شروع: {formatDate(course.start_date)}</span>
                        </div>
                    )}

                    {course.end_date && (
                        <div className="info-item">
                            <span className="info-icon">🏁</span>
                            <span className="info-text">پایان: {formatDate(course.end_date)}</span>
                        </div>
                    )}

                    {course.students_count !== undefined && (
                        <div className="info-item">
                            <span className="info-icon">👥</span>
                            <span className="info-text">{course.students_count} دانشجو</span>
                        </div>
                    )}

                    {course.certificates_count !== undefined && (
                        <div className="info-item">
                            <span className="info-icon">🎓</span>
                            <span className="info-text">{course.certificates_count} گواهی‌نامه</span>
                        </div>
                    )}
                </div>

                {course.prerequisites && course.prerequisites.length > 0 && (
                    <div className="course-prerequisites">
                        <span className="prerequisites-label">پیش‌نیازها:</span>
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

            <div className="course-card-footer">
                <div className="course-actions">
                    <Link
                        to={`/courses/${course.id}`}
                        className="btn btn-primary btn-sm"
                    >
                        مشاهده
                    </Link>

                    <Link
                        to={`/courses/${course.id}/edit`}
                        className="btn btn-outline btn-sm"
                    >
                        ویرایش
                    </Link>

                    <div className="dropdown">
                        <button className="btn btn-secondary btn-sm dropdown-toggle">
                            عملیات
                        </button>
                        <div className="dropdown-menu">
                            <button
                                onClick={handleToggleStatus}
                                disabled={isLoading}
                                className="dropdown-item"
                            >
                                {course.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                            </button>

                            <button
                                onClick={handleDuplicate}
                                disabled={isLoading}
                                className="dropdown-item"
                            >
                                کپی کردن
                            </button>

                            <hr className="dropdown-divider" />

                            <button
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="dropdown-item text-danger"
                            >
                                حذف
                            </button>
                        </div>
                    </div>
                </div>

                <div className="course-meta">
          <span className="created-date">
            ایجاد: {formatDate(course.created_at)}
          </span>
                </div>
            </div>

            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
        </div>
    );
};

export default CourseCard;