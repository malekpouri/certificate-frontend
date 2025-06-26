import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import useAuth from './hooks/useAuth';

// Layout
import DashboardLayout from './components/layout/DashboardLayout.jsx';

// Pages
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CertificatesPage from './pages/CertificatesPage.jsx';
import CertificateDetailPage from './pages/CertificateDetailPage.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import CourseDetailPage from './pages/CourseDetailPage.jsx';
import StudentsPage from './pages/StudentsPage.jsx';
import StudentDetailPage from './pages/StudentDetailPage.jsx';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import CertificateValidator from './components/certificate/CertificateValidator.jsx';
import CertificateForm from './components/certificate/CertificateForm.jsx';
import CourseForm from './components/course/CourseForm.jsx';
import StudentForm from './components/student/StudentForm.jsx';

import './App.css';

// Public Home Page Component
const HomePage = () => {
    const { isAuthenticated } = useAuth();

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
                            <a href="/dashboard" className="btn-primary">
                                ورود به داشبورد
                            </a>
                        ) : (
                            <a href="/login" className="btn-primary">
                                ورود به سیستم
                            </a>
                        )}
                        <a href="/validate" className="btn-secondary">
                            تأیید گواهی‌نامه
                        </a>
                    </div>
                </div>
            </main>

            <footer className="App-footer">
                <p>&copy; 2025 سیستم مدیریت گواهی‌نامه. تمامی حقوق محفوظ است.</p>
            </footer>
        </div>
    );
};

// Dashboard Routes Component (with Layout)
const DashboardRoutes = () => {
    return (
        <DashboardLayout>
            <Routes>
                <Route path="/" element={<DashboardPage />} />
                
                {/* Certificate Routes */}
                <Route path="/certificates" element={<CertificatesPage />} />
                <Route path="/certificates/new" element={
                    <CertificateForm 
                        onSubmit={() => window.location.href = '/certificates'} 
                        onCancel={() => window.location.href = '/certificates'}
                    />
                } />
                <Route path="/certificates/:id" element={<CertificateDetailPage />} />
                <Route path="/certificates/:id/edit" element={<CertificateDetailPage />} />
                
                {/* Course Routes */}
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/courses/new" element={
                    <CourseForm 
                        onSubmit={() => window.location.href = '/courses'} 
                        onCancel={() => window.location.href = '/courses'}
                    />
                } />
                <Route path="/courses/:id" element={<CourseDetailPage />} />
                <Route path="/courses/:id/edit" element={<CourseDetailPage />} />
                
                {/* Student Routes */}
                <Route path="/students" element={<StudentsPage />} />
                <Route path="/students/new" element={
                    <StudentForm 
                        onSubmit={() => window.location.href = '/students'} 
                        onCancel={() => window.location.href = '/students'}
                    />
                } />
                <Route path="/students/:id" element={<StudentDetailPage />} />
                <Route path="/students/:id/edit" element={<StudentDetailPage />} />
                
                {/* Other Routes */}
                <Route path="/validate" element={<CertificateValidator />} />
                <Route path="/reports" element={
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <h2>گزارشات</h2>
                        <p>این صفحه در حال توسعه است...</p>
                    </div>
                } />
                <Route path="/settings" element={
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <h2>تنظیمات</h2>
                        <p>این صفحه در حال توسعه است...</p>
                    </div>
                } />
                
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </DashboardLayout>
    );
};

// Main App Component
function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/validate" element={<CertificateValidator />} />
                    
                    {/* Protected Dashboard Routes */}
                    <Route
                        path="/dashboard/*"
                        element={
                            <ProtectedRoute>
                                <DashboardRoutes />
                            </ProtectedRoute>
                        }
                    />
                    
                    {/* Redirects for old routes */}
                    <Route path="/certificates" element={<Navigate to="/dashboard/certificates" replace />} />
                    <Route path="/courses" element={<Navigate to="/dashboard/courses" replace />} />
                    <Route path="/students" element={<Navigate to="/dashboard/students" replace />} />
                    
                    {/* Catch all - redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;