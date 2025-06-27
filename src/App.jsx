import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import useAuth from './hooks/useAuth';
import LoginPage from './pages/LoginPage.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import StudentsPage from './pages/StudentsPage.jsx';
import StudentDetailPage from './pages/StudentDetailPage.jsx';
import StudentForm from './components/student/StudentForm.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import CourseDetailPage from './pages/CourseDetailPage.jsx';
import CourseForm from './components/course/CourseForm.jsx';
import CertificatesPage from './pages/CertificatesPage.jsx';
import CertificateDetailPage from './pages/CertificateDetailPage.jsx';
import CertificateForm from './components/certificate/CertificateForm.jsx';
import CertificateValidator from './components/certificate/CertificateValidator.jsx';
import './styles/App.css';

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
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected Routes nested under DashboardPage */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    >
                        {/* Nested routes for managing students, courses, certificates */}
                        <Route index element={<div className="dashboard-content">محتوای داشبورد اصلی</div>} /> {/* Default content for /dashboard */}

                        <Route path="students" element={<StudentsPage />} />
                        <Route path="students/new" element={<StudentForm />} />
                        <Route path="students/:id" element={<StudentDetailPage />} />
                        <Route path="students/:id/edit" element={<StudentForm />} />

                        <Route path="courses" element={<CoursesPage />} />
                        <Route path="courses/new" element={<CourseForm />} />
                        <Route path="courses/:id" element={<CourseDetailPage />} />
                        <Route path="courses/:id/edit" element={<CourseForm />} />

                        <Route path="certificates" element={<CertificatesPage />} />
                        <Route path="certificates/new" element={<CertificateForm />} />
                        <Route path="certificates/:id" element={<CertificateDetailPage />} />
                        <Route path="certificates/:id/edit" element={<CertificateForm />} />

                        {/* Add other protected routes here */}
                    </Route>

                    <Route path="/validate" element={<CertificateValidator />} /> {/* This route will be /dashboard/validate */}
                    {/* Fallback for unmatched routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;