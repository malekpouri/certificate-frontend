import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import '../../styles/Dashboard.css';

const SystemOverview = () => {
    const [systemData, setSystemData] = useState(null);
    const [topPerformers, setTopPerformers] = useState({});
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadSystemData();
    }, []);

    const loadSystemData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [systemResult, studentsResult, coursesResult, eventsResult] = await Promise.all([
                dashboardService.getSystemOverview(),
                dashboardService.getTopPerformers('students', 5),
                dashboardService.getTopPerformers('courses', 5),
                dashboardService.getUpcomingEvents(5)
            ]);

            if (systemResult.success) {
                setSystemData(systemResult.data);
            }

            if (studentsResult.success && coursesResult.success) {
                setTopPerformers({
                    students: studentsResult.data,
                    courses: coursesResult.data
                });
            }

            if (eventsResult.success) {
                setUpcomingEvents(eventsResult.data);
            }
        } catch (error) {
            setError('خطا در بارگذاری اطلاعات سیستم');
        }

        setIsLoading(false);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fa-IR');
    };

    const getHealthStatus = (status) => {
        switch (status) {
            case 'excellent': return { text: 'عالی', color: 'success', icon: '🟢' };
            case 'good': return { text: 'خوب', color: 'info', icon: '🔵' };
            case 'warning': return { text: 'هشدار', color: 'warning', icon: '🟡' };
            case 'critical': return { text: 'بحرانی', color: 'danger', icon: '🔴' };
            default: return { text: 'نامشخص', color: 'secondary', icon: '⚪' };
        }
    };

    if (error) {
        return (
            <div className="system-overview">
                <div className="section-header">
                    <h3>نمای کلی سیستم</h3>
                </div>
                <div className="error-state">
                    <p>{error}</p>
                    <button onClick={loadSystemData} className="btn btn-primary">
                        تلاش مجدد
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="system-overview">
            <div className="section-header">
                <h3>نمای کلی سیستم</h3>
                <button
                    onClick={loadSystemData}
                    className="btn btn-sm btn-outline"
                    disabled={isLoading}
                >
                    {isLoading ? '...' : '🔄'}
                </button>
            </div>

            {isLoading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>در حال بارگذاری...</p>
                </div>
            ) : (
                <div className="overview-grid">
                    {/* System Health */}
                    {systemData && (
                        <div className="overview-card">
                            <div className="card-header">
                                <h4>وضعیت سیستم</h4>
                                <div className={`health-indicator ${getHealthStatus(systemData.health).color}`}>
                                    {getHealthStatus(systemData.health).icon}
                                    {getHealthStatus(systemData.health).text}
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="system-metrics">
                                    <div className="metric-item">
                                        <span className="metric-label">آپتایم:</span>
                                        <span className="metric-value">{systemData.uptime || 'نامشخص'}</span>
                                    </div>
                                    <div className="metric-item">
                                        <span className="metric-label">استفاده از دیسک:</span>
                                        <span className="metric-value">{systemData.diskUsage || 'نامشخص'}%</span>
                                    </div>
                                    <div className="metric-item">
                                        <span className="metric-label">استفاده از حافظه:</span>
                                        <span className="metric-value">{systemData.memoryUsage || 'نامشخص'}%</span>
                                    </div>
                                    <div className="metric-item">
                                        <span className="metric-label">آخرین بک‌آپ:</span>
                                        <span className="metric-value">
                      {systemData.lastBackup ? formatDate(systemData.lastBackup) : 'نامشخص'}
                    </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Top Students */}
                    {topPerformers.students && topPerformers.students.length > 0 && (
                        <div className="overview-card">
                            <div className="card-header">
                                <h4>برترین دانشجویان</h4>
                                <Link to="/students" className="view-all-link">مشاهده همه</Link>
                            </div>
                            <div className="card-body">
                                <div className="top-list">
                                    {topPerformers.students.map((student, index) => (
                                        <div key={student.id} className="top-item">
                                            <div className="rank">{index + 1}</div>
                                            <div className="avatar">
                                                {student.avatar ? (
                                                    <img src={student.avatar} alt={student.name} />
                                                ) : (
                                                    <div className="avatar-placeholder">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="info">
                                                <div className="name">{student.name}</div>
                                                <div className="score">{student.certificates_count} گواهی‌نامه</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Top Courses */}
                    {topPerformers.courses && topPerformers.courses.length > 0 && (
                        <div className="overview-card">
                            <div className="card-header">
                                <h4>محبوب‌ترین دوره‌ها</h4>
                                <Link to="/courses" className="view-all-link">مشاهده همه</Link>
                            </div>
                            <div className="card-body">
                                <div className="top-list">
                                    {topPerformers.courses.map((course, index) => (
                                        <div key={course.id} className="top-item">
                                            <div className="rank">{index + 1}</div>
                                            <div className="course-icon">📚</div>
                                            <div className="info">
                                                <div className="name">{course.title}</div>
                                                <div className="score">{course.students_count} دانشجو</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upcoming Events */}
                    {upcomingEvents.length > 0 && (
                        <div className="overview-card">
                            <div className="card-header">
                                <h4>رویدادهای آینده</h4>
                            </div>
                            <div className="card-body">
                                <div className="events-list">
                                    {upcomingEvents.map((event, index) => (
                                        <div key={index} className="event-item">
                                            <div className="event-date">
                                                <div className="date-day">
                                                    {new Date(event.date).getDate()}
                                                </div>
                                                <div className="date-month">
                                                    {new Date(event.date).toLocaleDateString('fa-IR', { month: 'short' })}
                                                </div>
                                            </div>
                                            <div className="event-info">
                                                <div className="event-title">{event.title}</div>
                                                <div className="event-description">{event.description}</div>
                                            </div>
                                            <div className="event-type">
                                                {event.type === 'course_start' && '🎯'}
                                                {event.type === 'course_end' && '🏁'}
                                                {event.type === 'deadline' && '⏰'}
                                                {event.type === 'maintenance' && '🔧'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Stats */}
                    <div className="overview-card">
                        <div className="card-header">
                            <h4>آمار سریع</h4>
                        </div>
                        <div className="card-body">
                            <div className="quick-stats">
                                <div className="stat-item">
                                    <div className="stat-icon">📈</div>
                                    <div className="stat-info">
                                        <div className="stat-value">
                                            {systemData?.todaysCertificates || 0}
                                        </div>
                                        <div className="stat-label">گواهی‌نامه امروز</div>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon">👥</div>
                                    <div className="stat-info">
                                        <div className="stat-value">
                                            {systemData?.onlineUsers || 0}
                                        </div>
                                        <div className="stat-label">کاربران آنلاین</div>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon">⚡</div>
                                    <div className="stat-info">
                                        <div className="stat-value">
                                            {systemData?.pendingActions || 0}
                                        </div>
                                        <div className="stat-label">اقدامات معلق</div>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon">🔔</div>
                                    <div className="stat-info">
                                        <div className="stat-value">
                                            {systemData?.notifications || 0}
                                        </div>
                                        <div className="stat-label">اعلان‌ها</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemOverview;