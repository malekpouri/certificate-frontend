import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import useAuth from './hooks/useAuth';
import LoginPage from './pages/LoginPage.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import './App.css';

const HomePage = () => {
    const { isAuthenticated } = useAuth();

    const handleLoginClick = () => {
        window.location.href = '/login';
    };

    const handleDashboardClick = () => {
        window.location.href = '/dashboard';
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>سیستم مدیریت گواهی‌نامه</h1>
                <p>سیستم صدور و تأیید گواهی‌نامه‌های دیجیتال</p>
            </header>

            <main className="App-main">
                <div className="welcome-section">
                    <h2>خوش آمدید</h2>
                    <p>این سیستم امکان صدور، مدیریت و تأیید گواهی‌نامه‌های دیجیتال را فراهم می‌کند.</p>

                    <div className="features-grid">
                        <div className="feature-card">
                            <h3>🎓 مدیریت گواهی‌نامه</h3>
                            <p>صدور و مدیریت گواهی‌نامه‌های دیجیتال</p>
                        </div>

                        <div className="feature-card">
                            <h3>📱 کد QR</h3>
                            <p>تولید کد QR برای تأیید سریع گواهی‌نامه</p>
                        </div>

                        <div className="feature-card">
                            <h3>👥 مدیریت دانشجویان</h3>
                            <p>ثبت و مدیریت اطلاعات دانشجویان</p>
                        </div>

                        <div className="feature-card">
                            <h3>📚 مدیریت دوره‌ها</h3>
                            <p>ایجاد و مدیریت دوره‌های آموزشی</p>
                        </div>
                    </div>

                    <div className="action-buttons">
                        {isAuthenticated ? (
                            <button className="btn-primary" onClick={handleDashboardClick}>
                                ورود به داشبورد
                            </button>
                        ) : (
                            <button className="btn-primary" onClick={handleLoginClick}>
                                ورود به سیستم
                            </button>
                        )}
                        <button className="btn-secondary">مشاهده دمو</button>
                    </div>
                </div>
            </main>

            <footer className="App-footer">
                <p>&copy; 2025 سیستم مدیریت گواهی‌نامه. تمامی حقوق محفوظ است.</p>
            </footer>
        </div>
    );
};

const Dashboard = () => {
    const { user, logout } = useAuth();

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
            <main>
                <p>محتوای داشبورد در اینجا قرار خواهد گرفت</p>
            </main>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;