import React, { useState, useEffect } from 'react'; // useEffect و useState را اضافه کنید
import { Link, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/App.css';

// سرویس‌های مورد نیاز برای آمار
import studentService from '../services/studentService';
import courseService from '../services/courseService';
import certificateService from '../services/certificateService';

const DashboardPage = () => {
    const { user, logout, isAdmin } = useAuth();
    const [studentCount, setStudentCount] = useState(0);
    const [courseCount, setCourseCount] = useState(0);
    const [certificateCount, setCertificateCount] = useState(0);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [statsError, setStatsError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoadingStats(true);
            setStatsError(null);
            try {
                const [studentsRes, coursesRes, certificatesRes] = await Promise.all([
                    studentService.getStudents({ page_size: 1 }), // فقط برای گرفتن count
                    courseService.getCourses({ page_size: 1 }), // فقط برای گرفتن count
                    certificateService.getCertificates({ page_size: 1 }), // فقط برای گرفتن count
                ]);

                if (studentsRes.success) setStudentCount(studentsRes.count);
                if (coursesRes.success) setCourseCount(coursesRes.count);
                if (certificatesRes.success) setCertificateCount(certificatesRes.count);

            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
                setStatsError("خطا در بارگذاری آمار داشبورد.");
            } finally {
                setIsLoadingStats(false);
            }
        };

        fetchStats();
    }, []); // فقط یک بار در mount

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>داشبورد</h1>
                <div className="user-info">
                    <span>خوش آمدید، {user?.username || user?.email || user?.id}</span> {/* نمایش username, email یا id */}
                    <button onClick={handleLogout} className="btn-secondary">
                        خروج
                    </button>
                </div>
            </header>
            <div className="dashboard-layout">
                <nav className="dashboard-sidebar">
                    <ul>
                        <li>
                            <Link to="/dashboard" className="sidebar-link">🏠 داشبورد اصلی</Link>
                        </li>
                        <li>
                            <Link to="students" className="sidebar-link">👥 دانشجویان</Link>
                        </li>
                        <li>
                            <Link to="courses" className="sidebar-link">📚 دوره‌ها</Link>
                        </li>
                        <li>
                            <Link to="certificates" className="sidebar-link">🎓 گواهی‌نامه‌ها</Link>
                        </li>
                        <li>
                            <Link to="/validate" className="sidebar-link">✅ تأیید گواهی‌نامه</Link> {/* مسیر را اصلاح کردم */}
                        </li>
                    </ul>
                </nav>
                <main className="dashboard-main-content">
                    <Outlet />
                    {!window.location.pathname.includes('/dashboard/') &&
                        window.location.pathname === '/dashboard' && (
                            <div className="welcome-dashboard-section">
                                <h2>به داشبورد مدیریت گواهی‌نامه خوش آمدید!</h2>
                                <p>از منوی کناری برای دسترسی به بخش‌های مختلف سیستم استفاده کنید.</p>
                                <div className="dashboard-stats-overview">
                                    {isLoadingStats ? (
                                        <div className="loading-container" style={{ gridColumn: '1 / -1' }}>
                                            <div className="loading-spinner"></div>
                                            <p>در حال بارگذاری آمار...</p>
                                        </div>
                                    ) : statsError ? (
                                        <div className="error-message" style={{ gridColumn: '1 / -1' }}>
                                            <p>{statsError}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="stat-card">
                                                <h3>تعداد دانشجویان</h3>
                                                <p>{studentCount}</p>
                                            </div>
                                            <div className="stat-card">
                                                <h3>تعداد دوره‌ها</h3>
                                                <p>{courseCount}</p>
                                            </div>
                                            <div className="stat-card">
                                                <h3>گواهی‌نامه‌های صادر شده</h3>
                                                <p>{certificateCount}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;