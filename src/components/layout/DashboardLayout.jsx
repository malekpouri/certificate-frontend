import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const menuItems = [
        {
            title: 'داشبورد',
            path: '/dashboard',
            icon: '📊',
            exact: true
        },
        {
            title: 'گواهی‌نامه‌ها',
            path: '/certificates',
            icon: '🎓',
            badge: null
        },
        {
            title: 'دوره‌ها',
            path: '/courses',
            icon: '📚',
            badge: null
        },
        {
            title: 'دانشجویان',
            path: '/students',
            icon: '👥',
            badge: null
        },
        {
            title: 'تأیید گواهی‌نامه',
            path: '/validate',
            icon: '✅',
            badge: null
        }
    ];

    const adminMenuItems = [
        {
            title: 'تنظیمات',
            path: '/settings',
            icon: '⚙️'
        },
        {
            title: 'گزارشات',
            path: '/reports',
            icon: '📈'
        }
    ];

    const isActive = (path, exact = false) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="dashboard-layout">
            <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        {isSidebarOpen ? (
                            <h2>سیستم مدیریت</h2>
                        ) : (
                            <h2>س</h2>
                        )}
                    </div>
                    <button className="sidebar-toggle" onClick={toggleSidebar}>
                        {isSidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <ul className="nav-list">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`nav-link ${isActive(item.path, item.exact) ? 'active' : ''}`}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    {isSidebarOpen && (
                                        <>
                                            <span className="nav-text">{item.title}</span>
                                            {item.badge && (
                                                <span className="nav-badge">{item.badge}</span>
                                            )}
                                        </>
                                    )}
                                </Link>
                            </li>
                        ))}

                        {isAdmin() && (
                            <>
                                <li className="nav-divider"></li>
                                {adminMenuItems.map((item) => (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                                        >
                                            <span className="nav-icon">{item.icon}</span>
                                            {isSidebarOpen && (
                                                <span className="nav-text">{item.title}</span>
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </>
                        )}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {isSidebarOpen && (
                            <div className="user-details">
                                <p className="user-name">{user?.username || 'کاربر'}</p>
                                <p className="user-role">{isAdmin() ? 'مدیر' : 'کاربر'}</p>
                            </div>
                        )}
                    </div>
                    <button className="logout-btn" onClick={handleLogout} title="خروج">
                        🚪
                    </button>
                </div>
            </aside>

            <div className="main-content">
                <header className="top-header">
                    <div className="header-left">
                        <h1>{getPageTitle(location.pathname)}</h1>
                    </div>
                    <div className="header-right">
                        <button className="notification-btn" title="اعلان‌ها">
                            🔔
                            <span className="notification-badge">3</span>
                        </button>
                        <div className="header-user">
                            <span className="user-name">{user?.username}</span>
                            <div className="user-avatar-small">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

const getPageTitle = (pathname) => {
    const titles = {
        '/dashboard': 'داشبورد',
        '/certificates': 'مدیریت گواهی‌نامه‌ها',
        '/courses': 'مدیریت دوره‌ها',
        '/students': 'مدیریت دانشجویان',
        '/validate': 'تأیید گواهی‌نامه',
        '/settings': 'تنظیمات',
        '/reports': 'گزارشات'
    };

    for (const [path, title] of Object.entries(titles)) {
        if (pathname.startsWith(path)) {
            return title;
        }
    }

    return 'سیستم مدیریت';
};

export default DashboardLayout;