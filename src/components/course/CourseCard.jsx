import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import courseService from '../../services/courseService';
import '../../styles/Course.css';

const CourseCard = ({ course, onUpdate, onDelete }) => {
    const [isLoading, setIsLoading] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return 'نامشخص';
        return new Date(dateString).toLocaleDateString('fa-IR');
    };

    const formatDuration = (hours) => {
        if (!hours) return 'نامشخص';
        return `${hours} ساعت`;
    };

    return (
        <div className="course-card">
            <div className="course-card-content">
                <div className="course-card-header">
                    <h3 className="course-title">{course.name}</h3>
                </div>

                <div className="course-description">
                    <p>{course.description || 'توضیحاتی برای این دوره ارائه نشده است.'}</p>
                </div>

                <div className="course-info">
                    {course.duration && (
                        <div className="info-item">
                            <span className="info-icon">⏱️</span>
                            <span className="info-text">مدت: {formatDuration(course.duration)}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="course-card-footer">
                <div className="course-actions">
                    <Link
                        to={`/dashboard/courses/${course.id}`} // مسیر را اصلاح کردم
                        className="btn btn-primary btn-sm"
                    >
                        مشاهده
                    </Link>

                    <button
                        onClick={async () => {
                            if (!window.confirm('آیا از حذف این دوره اطمینان دارید؟')) {
                                return;
                            }
                            setIsLoading(true);
                            const result = await courseService.deleteCourse(course.id);
                            if (result.success) {
                                if (onDelete) onDelete(course.id);
                                alert(result.message);
                            } else {
                                alert(result.message);
                            }
                            setIsLoading(false);
                        }}
                        className="btn btn-danger btn-sm"
                        disabled={isLoading}
                    >
                        حذف
                    </button>
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