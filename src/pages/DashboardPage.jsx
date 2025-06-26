import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import certificateService from '../services/certificateService';
import courseService from '../services/courseService';
import studentService from '../services/studentService';
import useAuth from '../hooks/useAuth';
import ChartWidget from '../components/charts/ChartWidget';
import './DashboardPage.css';

const DashboardPage = () => {
    const { user, isAdmin } = useAuth();
    const [statistics, setStatistics] = useState({
        totalCertificates: 0,
        activeCertificates: 0,
        totalCourses: 0,
        activeCourses: 0,
        totalStudents: 0,
        activeStudents: 0,
        recentCertificates: [],
        recentCourses: [],
        recentStudents: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            const [certificatesRes, coursesRes, studentsRes] = await Promise.all([
                certificateService.getCertificates({ page_size: 5 }),
                courseService.getCourses({ page_size: 5 }),
                studentService.getStudents({ page_size: 5 })
            ]);

            setStatistics({
                totalCertificates: certificatesRes.count || 0,
                activeCertificates: certificatesRes.data?.filter(c => c.is_active).length || 0,
                totalCourses: coursesRes.count || 0,
                activeCourses: coursesRes.data?.filter(c => c.is_active).length || 0,
                totalStudents: studentsRes.count || 0,
                activeStudents: studentsRes.data?.filter(s => s.is_active).length || 0,
                recentCertificates: certificatesRes.data?.slice(0, 5) || [],
                recentCourses: coursesRes.data?.slice(0, 5) || [],
                recentStudents: studentsRes.data?.slice(0, 5) || []
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
        setIsLoading(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'نامشخص';
        return new Date(dateString).toLocaleDateString('fa-IR');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'صبح بخیر';
        if (hour < 17) return 'ظهر بخیر';
        return 'عصر بخیر';
    };

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>در حال بارگذاری داشبورد...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Welcome Section */}
            <div className="welcome-section">
                <h2>{getGreeting()}، {user?.username || 'کاربر عزیز'}</h2>
                <p>به سیستم مدیریت گواهی‌نامه خوش آمدید</p>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card certificates">
                    <div className="stat-icon">🎓</div>
                    <div className="stat-content">
                        <h3>گواهی‌نامه‌ها</h3>
                        <div className="stat-number">{statistics.totalCertificates}</div>
                        <div className="stat-detail">
                            <span className="active">{statistics.activeCertificates} فعال</span>
                        </div>
                    </div>
                    <Link to="/certificates" className="stat-link">
                        مشاهده همه ←
                    </Link>
                </div>

                <div className="stat-card courses">
                    <div className="stat-icon">📚</div>
                    <div className="stat-content">
                        <h3>دوره‌ها</h3>
                        <div className="stat-number">{statistics.totalCourses}</div>
                        <div className="stat-detail">
                            <span className="active">{statistics.activeCourses} فعال</span>
                        </div>
                    </div>
                    <Link to="/courses" className="stat-link">
                        مشاهده همه ←
                    </Link>
                </div>

                <div className="stat-card students">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>دانشجویان</h3>
                        <div className="stat-number">{statistics.totalStudents}</div>
                        <div className="stat-detail">
                            <span className="active">{statistics.activeStudents} فعال</span>
                        </div>
                    </div>
                    <Link to="/students" className="stat-link">
                        مشاهده همه ←
                    </Link>
                </div>

                <div className="stat-card validate">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>تأیید گواهی‌نامه</h3>
                        <div className="stat-description">بررسی صحت گواهی‌نامه‌ها</div>
                    </div>
                    <Link to="/validate" className="stat-link">
                        تأیید کنید ←
                    </Link>
                </div>
            </div>

            {/* Quick Actions */}
            {isAdmin() && (
                <div className="quick-actions">
                    <h3>دسترسی سریع</h3>
                    <div className="actions-grid">
                        <Link to="/certificates/new" className="action-card">
                            <span className="action-icon">➕</span>
                            <span>صدور گواهی‌نامه جدید</span>
                        </Link>
                        <Link to="/courses/new" className="action-card">
                            <span className="action-icon">📝</span>
                            <span>ایجاد دوره جدید</span>
                        </Link>
                        <Link to="/students/new" className="action-card">
                            <span className="action-icon">👤</span>
                            <span>ثبت دانشجوی جدید</span>
                        </Link>
                        <Link to="/reports" className="action-card">
                            <span className="action-icon">📊</span>
                            <span>مشاهده گزارشات</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Recent Activities */}
            <div className="recent-activities">
                <div className="activity-section">
                    <div className="section-header">
                        <h3>گواهی‌نامه‌های اخیر</h3>
                        <Link to="/certificates" className="view-all">مشاهده همه</Link>
                    </div>
                    <div className="activity-list">
                        {statistics.recentCertificates.length > 0 ? (
                            statistics.recentCertificates.map(cert => (
                                <div key={cert.id} className="activity-item">
                                    <div className="activity-icon">🎓</div>
                                    <div className="activity-content">
                                        <h4>{cert.title}</h4>
                                        <p>
                                            {cert.student_name} - {cert.course_name}
                                        </p>
                                        <span className="activity-date">
                                            {formatDate(cert.issue_date)}
                                        </span>
                                    </div>
                                    <Link 
                                        to={`/certificates/${cert.id}`} 
                                        className="activity-link"
                                    >
                                        مشاهده
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">گواهی‌نامه‌ای موجود نیست</p>
                        )}
                    </div>
                </div>

                <div className="activity-section">
                    <div className="section-header">
                        <h3>دوره‌های اخیر</h3>
                        <Link to="/courses" className="view-all">مشاهده همه</Link>
                    </div>
                    <div className="activity-list">
                        {statistics.recentCourses.length > 0 ? (
                            statistics.recentCourses.map(course => (
                                <div key={course.id} className="activity-item">
                                    <div className="activity-icon">📚</div>
                                    <div className="activity-content">
                                        <h4>{course.title}</h4>
                                        <p>
                                            {course.instructor || 'بدون مدرس'} - 
                                            {course.duration_hours ? ` ${course.duration_hours} ساعت` : ' مدت نامشخص'}
                                        </p>
                                        <span className="activity-date">
                                            {formatDate(course.created_at)}
                                        </span>
                                    </div>
                                    <Link 
                                        to={`/courses/${course.id}`} 
                                        className="activity-link"
                                    >
                                        مشاهده
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">دوره‌ای موجود نیست</p>
                        )}
                    </div>
                </div>

                <div className="activity-section">
                    <div className="section-header">
                        <h3>دانشجویان جدید</h3>
                        <Link to="/students" className="view-all">مشاهده همه</Link>
                    </div>
                    <div className="activity-list">
                        {statistics.recentStudents.length > 0 ? (
                            statistics.recentStudents.map(student => (
                                <div key={student.id} className="activity-item">
                                    <div className="activity-icon">👤</div>
                                    <div className="activity-content">
                                        <h4>
                                            {student.full_name || `${student.first_name} ${student.last_name}`}
                                        </h4>
                                        <p>{student.email}</p>
                                        <span className="activity-date">
                                            {formatDate(student.created_at)}
                                        </span>
                                    </div>
                                    <Link 
                                        to={`/students/${student.id}`} 
                                        className="activity-link"
                                    >
                                        مشاهده
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">دانشجویی موجود نیست</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="charts-section">
                <div className="chart-card">
                    <ChartWidget
                        title="آمار گواهی‌نامه‌های صادر شده در ماه"
                        type="bar"
                        data={[
                            { label: 'فروردین', value: 15, color: '#3498db' },
                            { label: 'اردیبهشت', value: 23, color: '#2ecc71' },
                            { label: 'خرداد', value: 18, color: '#f39c12' },
                            { label: 'تیر', value: 32, color: '#e74c3c' },
                            { label: 'مرداد', value: 28, color: '#9b59b6' },
                            { label: 'شهریور', value: 35, color: '#1abc9c' },
                        ]}
                        height={250}
                    />
                </div>

                <div className="chart-card">
                    <ChartWidget
                        title="توزیع دانشجویان بر اساس وضعیت"
                        type="pie"
                        data={[
                            { label: 'فعال', value: statistics.activeStudents, color: '#2ecc71' },
                            { label: 'غیرفعال', value: statistics.totalStudents - statistics.activeStudents, color: '#e74c3c' },
                        ]}
                        height={250}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;