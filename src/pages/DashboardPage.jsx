import React, { useState, useEffect } from 'react';
import StatsCard from '../components/dashboard/StatsCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import QuickActions from '../components/dashboard/QuickActions';
import ChartsSection from '../components/dashboard/ChartsSection';
import SystemOverview from '../components/dashboard/SystemOverview';
import dashboardService from '../services/dashboardService';
import useAuth from '../hooks/useAuth';
import '../styles/Dashboard.css';

const DashboardPage = () => {
    const { user, isAdmin } = useAuth();
    const [dashboardStats, setDashboardStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    useEffect(() => {
        loadDashboardData();

        // Auto refresh every 5 minutes
        const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await dashboardService.getDashboardStats();

            if (result.success) {
                setDashboardStats(result.data);
                setLastRefresh(new Date());
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('خطا در بارگذاری داده‌های داشبورد');
        }

        setIsLoading(false);
    };

    const handleRefresh = async () => {
        const result = await dashboardService.refreshDashboardData();
        if (result.success) {
            await loadDashboardData();
            alert(result.message);
        } else {
            alert(result.message);
        }
    };

    const handleExport = async (format) => {
        const result = await dashboardService.exportDashboardData(format);
        if (!result.success) {
            alert(result.message);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'صبح بخیر';
        if (hour < 17) return 'ظهر بخیر';
        return 'عصر بخیر';
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div className="welcome-section">
                    <h1>{getGreeting()}، {user?.username || 'کاربر عزیز'}</h1>
                    <p>نمای کلی عملکرد سیستم مدیریت گواهی‌نامه</p>
                    <div className="last-update">
                        آخرین بروزرسانی: {lastRefresh.toLocaleTimeString('fa-IR')}
                    </div>
                </div>

                <div className="dashboard-actions">
                    <button
                        onClick={loadDashboardData}
                        className="btn btn-outline"
                        disabled={isLoading}
                    >
                        {isLoading ? '⏳' : '🔄'} بروزرسانی
                    </button>

                    {isAdmin() && (
                        <>
                            <button
                                onClick={handleRefresh}
                                className="btn btn-secondary"
                            >
                                🔄 بازسازی داده‌ها
                            </button>

                            <div className="dropdown">
                                <button className="btn btn-primary dropdown-toggle">
                                    📊 گزارش‌گیری
                                </button>
                                <div className="dropdown-menu">
                                    <button
                                        onClick={() => handleExport('excel')}
                                        className="dropdown-item"
                                    >
                                        Excel دانلود
                                    </button>
                                    <button
                                        onClick={() => handleExport('pdf')}
                                        className="dropdown-item"
                                    >
                                        PDF دانلود
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {error ? (
                <div className="dashboard-error">
                    <div className="error-container">
                        <h3>خطا در بارگذاری داشبورد</h3>
                        <p>{error}</p>
                        <button onClick={loadDashboardData} className="btn btn-primary">
                            تلاش مجدد
                        </button>
                    </div>
                </div>
            ) : (
                <div className="dashboard-content">
                    {/* Stats Cards */}
                    <div className="stats-section">
                        <div className="stats-grid">
                            <StatsCard
                                title="کل گواهی‌نامه‌ها"
                                value={dashboardStats?.totalCertificates}
                                icon="🎓"
                                color="primary"
                                trend={dashboardStats?.certificatesTrend}
                                linkTo="/certificates"
                                isLoading={isLoading}
                            />

                            <StatsCard
                                title="دانشجویان فعال"
                                value={dashboardStats?.activeStudents}
                                icon="👥"
                                color="success"
                                trend={dashboardStats?.studentsTrend}
                                linkTo="/students"
                                subtitle={`از ${dashboardStats?.totalStudents} دانشجو`}
                                isLoading={isLoading}
                            />

                            <StatsCard
                                title="دوره‌های فعال"
                                value={dashboardStats?.activeCourses}
                                icon="📚"
                                color="info"
                                trend={dashboardStats?.coursesTrend}
                                linkTo="/courses"
                                subtitle={`از ${dashboardStats?.totalCourses} دوره`}
                                isLoading={isLoading}
                            />

                            <StatsCard
                                title="گواهی‌نامه‌های امروز"
                                value={dashboardStats?.todaysCertificates}
                                icon="📈"
                                color="warning"
                                trend={dashboardStats?.todaysTrend}
                                isLoading={isLoading}
                            />

                            {isAdmin() && (
                                <>
                                    <StatsCard
                                        title="درآمد ماهانه"
                                        value={`${dashboardStats?.monthlyRevenue?.toLocaleString('fa-IR') || 0} تومان`}
                                        icon="💰"
                                        color="success"
                                        trend={dashboardStats?.revenueTrend}
                                        isLoading={isLoading}
                                    />

                                    <StatsCard
                                        title="نرخ تکمیل"
                                        value={`${dashboardStats?.completionRate || 0}%`}
                                        icon="✅"
                                        color="secondary"
                                        trend={dashboardStats?.completionTrend}
                                        isLoading={isLoading}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Main Dashboard Grid */}
                    <div className="dashboard-grid">
                        {/* Left Column */}
                        <div className="dashboard-left">
                            <QuickActions />
                            <RecentActivity limit={8} />
                        </div>

                        {/* Right Column */}
                        <div className="dashboard-right">
                            <SystemOverview />

                            {/* Performance Metrics */}
                            <div className="performance-section">
                                <div className="section-header">
                                    <h3>عملکرد سیستم</h3>
                                </div>
                                <div className="performance-grid">
                                    <div className="performance-item">
                                        <div className="perf-icon">⚡</div>
                                        <div className="perf-content">
                                            <div className="perf-label">سرعت پاسخ</div>
                                            <div className="perf-value">
                                                {dashboardStats?.responseTime || '0'}ms
                                            </div>
                                        </div>
                                    </div>

                                    <div className="performance-item">
                                        <div className="perf-icon">🎯</div>
                                        <div className="perf-content">
                                            <div className="perf-label">دقت سیستم</div>
                                            <div className="perf-value">
                                                {dashboardStats?.systemAccuracy || '100'}%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="performance-item">
                                        <div className="perf-icon">📊</div>
                                        <div className="perf-content">
                                            <div className="perf-label">بهره‌وری</div>
                                            <div className="perf-value">
                                                {dashboardStats?.efficiency || '95'}%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="performance-item">
                                        <div className="perf-icon">🔒</div>
                                        <div className="perf-content">
                                            <div className="perf-label">امنیت</div>
                                            <div className="perf-value">
                                                {dashboardStats?.securityScore || 'A+'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    {isAdmin() && (
                        <div className="charts-wrapper">
                            <ChartsSection />
                        </div>
                    )}

                    {/* Additional Info for Non-Admin Users */}
                    {!isAdmin() && (
                        <div className="user-dashboard-extra">
                            <div className="info-cards">
                                <div className="info-card">
                                    <h3>راهنمای سریع</h3>
                                    <ul>
                                        <li>برای صدور گواهی‌نامه از بخش "اقدامات سریع" استفاده کنید</li>
                                        <li>تأیید گواهی‌نامه‌ها از طریق اسکن QR Code امکان‌پذیر است</li>
                                        <li>لیست کامل دانشجویان و دوره‌ها در دسترس شماست</li>
                                    </ul>
                                </div>

                                <div className="info-card">
                                    <h3>اعلان‌های مهم</h3>
                                    <div className="notifications">
                                        {dashboardStats?.notifications?.length > 0 ? (
                                            dashboardStats.notifications.map((notif, index) => (
                                                <div key={index} className="notification-item">
                                                    <span className="notif-icon">🔔</span>
                                                    <span className="notif-text">{notif.message}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p>اعلان جدیدی وجود ندارد</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DashboardPage;