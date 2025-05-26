import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import '../../styles/Dashboard.css';

const RecentActivity = ({ limit = 10 }) => {
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadRecentActivity();
    }, [limit]);

    const loadRecentActivity = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await dashboardService.getRecentActivity(limit);

            if (result.success) {
                setActivities(result.data);
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('خطا در بارگذاری فعالیت‌های اخیر');
        }

        setIsLoading(false);
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'certificate_issued': return '🎓';
            case 'student_registered': return '👤';
            case 'course_created': return '📚';
            case 'course_updated': return '✏️';
            case 'student_updated': return '👥';
            case 'certificate_validated': return '✅';
            case 'user_login': return '🔑';
            case 'system_backup': return '💾';
            default: return '📝';
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'certificate_issued': return 'success';
            case 'student_registered': return 'info';
            case 'course_created': return 'primary';
            case 'course_updated': return 'warning';
            case 'student_updated': return 'info';
            case 'certificate_validated': return 'success';
            case 'user_login': return 'secondary';
            case 'system_backup': return 'dark';
            default: return 'light';
        }
    };

    const getActivityLink = (activity) => {
        switch (activity.type) {
            case 'certificate_issued':
            case 'certificate_validated':
                return activity.related_id ? `/certificates/${activity.related_id}` : null;
            case 'student_registered':
            case 'student_updated':
                return activity.related_id ? `/students/${activity.related_id}` : null;
            case 'course_created':
            case 'course_updated':
                return activity.related_id ? `/courses/${activity.related_id}` : null;
            default:
                return null;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'همین الان';
        if (diffInMinutes < 60) return `${diffInMinutes} دقیقه پیش`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} ساعت پیش`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} روز پیش`;

        return date.toLocaleDateString('fa-IR');
    };

    if (error) {
        return (
            <div className="recent-activity-container">
                <div className="section-header">
                    <h3>فعالیت‌های اخیر</h3>
                </div>
                <div className="error-state">
                    <p>{error}</p>
                    <button onClick={loadRecentActivity} className="btn btn-sm btn-primary">
                        تلاش مجدد
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="recent-activity-container">
            <div className="section-header">
                <h3>فعالیت‌های اخیر</h3>
                <button
                    onClick={loadRecentActivity}
                    className="btn btn-sm btn-outline"
                    disabled={isLoading}
                >
                    {isLoading ? '...' : '🔄'}
                </button>
            </div>

            <div className="activity-list">
                {isLoading ? (
                    <div className="loading-activities">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="activity-item loading">
                                <div className="activity-icon skeleton"></div>
                                <div className="activity-content">
                                    <div className="activity-text skeleton"></div>
                                    <div className="activity-time skeleton"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    <div className="empty-activities">
                        <p>فعالیت اخیری وجود ندارد</p>
                    </div>
                ) : (
                    activities.map((activity, index) => {
                        const linkTo = getActivityLink(activity);

                        const activityContent = (
                            <div className={`activity-item ${getActivityColor(activity.type)}`}>
                                <div className="activity-icon">
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div className="activity-content">
                                    <div className="activity-text">
                                        {activity.description}
                                    </div>
                                    <div className="activity-meta">
                    <span className="activity-time">
                      {formatDate(activity.created_at)}
                    </span>
                                        {activity.user && (
                                            <span className="activity-user">
                        توسط {activity.user}
                      </span>
                                        )}
                                    </div>
                                </div>
                                {linkTo && (
                                    <div className="activity-arrow">
                                        ←
                                    </div>
                                )}
                            </div>
                        );

                        return linkTo ? (
                            <Link key={index} to={linkTo} className="activity-link">
                                {activityContent}
                            </Link>
                        ) : (
                            <div key={index}>
                                {activityContent}
                            </div>
                        );
                    })
                )}
            </div>

            {activities.length > 0 && (
                <div className="activity-footer">
                    <Link to="/activities" className="btn btn-sm btn-outline">
                        مشاهده همه فعالیت‌ها
                    </Link>
                </div>
            )}
        </div>
    );
};

export default RecentActivity;