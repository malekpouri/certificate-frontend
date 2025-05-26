import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth';

// Auth Components
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Main Pages
import DashboardPage from './pages/DashboardPage';
import CertificatesPage from './pages/CertificatesPage';
import CertificateDetailPage from './pages/CertificateDetailPage';
import StudentsPage from './pages/StudentsPage';
import StudentDetailPage from './pages/StudentDetailPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';

// Components
import CertificateValidator from './components/certificate/CertificateValidator';

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

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/validate" element={<CertificateValidator />} />
                    <Route path="/validate/:id" element={<CertificateValidator />} />

                    {/* Protected Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Certificate Routes */}
                    <Route
                        path="/certificates"
                        element={
                            <ProtectedRoute>
                                <CertificatesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/certificates/create"
                        element={
                            <ProtectedRoute adminOnly={true}>
                                <CertificatesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/certificates/:id"
                        element={
                            <ProtectedRoute>
                                <CertificateDetailPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/certificates/:id/edit"
                        element={
                            <ProtectedRoute adminOnly={true}>
                                <CertificateDetailPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Student Routes */}
                    <Route
                        path="/students"
                        element={
                            <ProtectedRoute>
                                <StudentsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/students/create"
                        element={
                            <ProtectedRoute adminOnly={true}>
                                <StudentsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/students/:id"
                        element={
                            <ProtectedRoute>
                                <StudentDetailPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/students/:id/edit"
                        element={
                            <ProtectedRoute adminOnly={true}>
                                <StudentDetailPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Course Routes */}
                    <Route
                        path="/courses"
                        element={
                            <ProtectedRoute>
                                <CoursesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/courses/create"
                        element={
                            <ProtectedRoute adminOnly={true}>
                                <CoursesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/courses/:id"
                        element={
                            <ProtectedRoute>
                                <CourseDetailPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/courses/:id/edit"
                        element={
                            <ProtectedRoute adminOnly={true}>
                                <CourseDetailPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Placeholder Routes for Future Features */}
                    <Route
                        path="/search"
                        element={
                            <ProtectedRoute>
                                <div className="page-container">
                                    <div className="page-header">
                                        <h1>جستجوی پیشرفته</h1>
                                        <p>این بخش در حال توسعه است</p>
                                    </div>
                                </div>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/reports"
                        element={
                            <ProtectedRoute adminOnly={true}>
                                <div className="page-container">
                                    <div className="page-header">
                                        <h1>گزارش‌گیری</h1>
                                        <p>این بخش در حال توسعه است</p>
                                    </div>
                                </div>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute adminOnly={true}>
                                <div className="page-container">
                                    <div className="page-header">
                                        <h1>تنظیمات سیستم</h1>
                                        <p>این بخش در حال توسعه است</p>
                                    </div>
                                </div>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute adminOnly={true}>
                                <div className="page-container">
                                    <div className="page-header">
                                        <h1>مدیریت کاربران</h1>
                                        <p>این بخش در حال توسعه است</p>
                                    </div>
                                </div>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/logs"
                        element={
                            <ProtectedRoute adminOnly={true}>
                                <div className="page-container">
                                    <div className="page-header">
                                        <h1>لاگ‌های سیستم</h1>
                                        <p>این بخش در حال توسعه است</p>
                                    </div>
                                </div>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/help"
                        element={
                            <div className="page-container">
                                <div className="page-header">
                                    <h1>راهنما و پشتیبانی</h1>
                                    <p>این بخش در حال توسعه است</p>
                                </div>
                            </div>
                        }
                    />

                    {/* Catch All - Redirect to Dashboard or Home */}
                    <Route
                        path="*"
                        element={
                            <ProtectedRoute redirectTo="/">
                                <Navigate to="/dashboard" replace />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;