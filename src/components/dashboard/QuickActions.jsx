import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import '../../styles/Dashboard.css';

const QuickActions = () => {
    const { isAdmin } = useAuth();

    const actions = [
        {
            title: 'صدور گواهی‌نامه',
            description: 'ایجاد گواهی‌نامه جدید',
            icon: '🎓',
            link: '/certificates/create',
            color: 'primary',
            adminOnly: true
        },
        {
            title: 'ثبت دانشجو',
            description: 'اضافه کردن دانشجوی جدید',
            icon: '👤',
            link: '/students/create',
            color: 'success',
            adminOnly: true
        },
        {
            title: 'ایجاد دوره',
            description: 'تعریف دوره آموزشی جدید',
            icon: '📚',
            link: '/courses/create',
            color: 'info',
            adminOnly: true
        },
        {
            title: 'تأیید گواهی‌نامه',
            description: 'بررسی صحت گواهی‌نامه',
            icon: '✅',
            link: '/validate',
            color: 'warning',
            adminOnly: false
        },
        {
            title: 'جستجوی پیشرفته',
            description: 'جستجو در تمام بخش‌ها',
            icon: '🔍',
            link: '/search',
            color: 'secondary',
            adminOnly: false
        },
        {
            title: 'گزارش‌گیری',
            description: 'تولید گزارش‌های مختلف',
            icon: '📊',
            link: '/reports',
            color: 'dark',
            adminOnly: true
        }
    ];

    const visibleActions = actions.filter(action =>
        !action.adminOnly || (action.adminOnly && isAdmin())
    );

    return (
        <div className="quick-actions-container">
            <div className="section-header">
                <h3>اقدامات سریع</h3>
            </div>

            <div className="quick-actions-grid">
                {visibleActions.map((action, index) => (
                    <Link
                        key={index}
                        to={action.link}
                        className={`quick-action-card ${action.color}`}
                    >
                        <div className="action-icon">
                            {action.icon}
                        </div>
                        <div className="action-content">
                            <div className="action-title">
                                {action.title}
                            </div>
                            <div className="action-description">
                                {action.description}
                            </div>
                        </div>
                        <div className="action-arrow">
                            ←
                        </div>
                    </Link>
                ))}
            </div>

            <div className="additional-actions">
                <div className="action-group">
                    <h4>مدیریت سیستم</h4>
                    <div className="action-buttons">
                        {isAdmin() && (
                            <>
                                <Link to="/settings" className="btn btn-sm btn-outline">
                                    ⚙️ تنظیمات
                                </Link>
                                <Link to="/users" className="btn btn-sm btn-outline">
                                    👥 کاربران
                                </Link>
                                <Link to="/logs" className="btn btn-sm btn-outline">
                                    📋 لاگ‌ها
                                </Link>
                            </>
                        )}
                        <Link to="/help" className="btn btn-sm btn-outline">
                            ❓ راهنما
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickActions;