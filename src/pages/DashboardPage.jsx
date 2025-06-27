import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/App.css';

const DashboardPage = () => {
    const { user, logout, isAdmin } = useAuth();

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>داشبورد</h1>
                <div className="user-info">
                    <span>خوش آمدید، {user?.username}</span>
                    <button onClick={handleLogout} className="btn-secondary">
                        خروج
                    </button>
                </div>
            </header>
            <div className="dashboard-layout">
                <nav className="dashboard-sidebar">
                    <ul>
                        <li>
                            {/* این لینک به /dashboard اشاره می کند که مسیر اصلی داشبورد است */}
                            <Link to="/dashboard" className="sidebar-link">🏠 داشبورد اصلی</Link>
                        </li>
                        <li>
                            {/* مسیر نسبی: به /dashboard/students هدایت می کند */}
                            <Link to="students" className="sidebar-link">👥 دانشجویان</Link>
                        </li>
                        <li>
                            {/* مسیر نسبی: به /dashboard/courses هدایت می کند */}
                            <Link to="courses" className="sidebar-link">📚 دوره‌ها</Link>
                        </li>
                        <li>
                            {/* مسیر نسبی: به /dashboard/certificates هدایت می کند */}
                            <Link to="certificates" className="sidebar-link">🎓 گواهی‌نامه‌ها</Link>
                        </li>
                        <li>
                            {/* مسیر نسبی: به /dashboard/validate هدایت می کند */}
                            <Link to="validate" className="sidebar-link">✅ تأیید گواهی‌نامه</Link>
                        </li>
                    </ul>
                </nav>
                <main className="dashboard-main-content">
                    <Outlet />
                    {/* این شرط را کمی تغییر دادم تا با مسیرهای نسبی کار کند */}
                    {!window.location.pathname.includes('/dashboard/') &&
                        window.location.pathname === '/dashboard' && (
                            <div className="welcome-dashboard-section">
                                <h2>به داشبورد مدیریت گواهی‌نامه خوش آمدید!</h2>
                                <p>از منوی کناری برای دسترسی به بخش‌های مختلف سیستم استفاده کنید.</p>
                                <div className="dashboard-stats-overview">
                                    <div className="stat-card">
                                        <h3>تعداد دانشجویان</h3>
                                        <p>۲۵۰</p>
                                    </div>
                                    <div className="stat-card">
                                        <h3>تعداد دوره‌ها</h3>
                                        <p>۵۰</p>
                                    </div>
                                    <div className="stat-card">
                                        <h3>گواهی‌نامه‌های صادر شده</h3>
                                        <p>۸۰۰</p>
                                    </div>
                                </div>
                            </div>
                        )}
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;