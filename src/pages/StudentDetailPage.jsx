import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StudentForm from '../components/student/StudentForm';
// Removed CertificateList import as certificates tab is no longer supported
import studentService from '../services/studentService';
import useAuth from '../hooks/useAuth';
import '../styles/Student.css';

const StudentDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const [student, setStudent] = useState(null);
    // Removed statistics state as statistics functionality is no longer supported
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    // Removed activeTab state as only info tab will remain
    // Removed getAvatarUrl as avatar is not supported


    useEffect(() => {
        loadStudentData();
    }, [id]);

    const loadStudentData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Only fetch student details, as statistics/certificates are not supported by simplified backend
            const studentResult = await studentService.getStudent(id);

            if (studentResult.success) {
                setStudent(studentResult.data);
            } else {
                setError(studentResult.message);
            }
        } catch (error) {
            setError('خطا در دریافت اطلاعات دانشجو');
        }

        setIsLoading(false);
    };

    const handleDelete = async () => {
        if (!window.confirm('آیا از حذف این دانشجو اطمینان دارید؟')) {
            return;
        }

        const result = await studentService.deleteStudent(id);

        if (result.success) {
            alert(result.message);
            navigate('/dashboard/students'); // Adjusted for dashboard nesting
        } else {
            alert(result.message);
        }
    };

    // Removed handleToggleStatus as is_active status is not supported by backend definition

    const handleEditSuccess = (updatedStudent) => {
        setStudent(updatedStudent);
        setIsEditing(false);
        navigate('/dashboard/students'); // Navigate back to student list after successful edit
    };

    const handleEditCancel = () => {
        console.log("StudentDetailPage: handleEditCancel called. Hiding form."); // Debug log
        setIsEditing(false); // This will return to the detail view, which should now load correctly
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'نامشخص';
        return new Date(dateString).toLocaleDateString('fa-IR');
    };

    const getFullName = () => {
        if (!student) return '';
        return student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'نام نامشخص';
    };


    if (isLoading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="error-container">
                    <h3>خطا در بارگذاری</h3>
                    <p>{error}</p>
                    <div className="error-actions">
                        <button onClick={loadStudentData} className="btn btn-primary">
                            تلاش مجدد
                        </button>
                        <Link to="/dashboard/students" className="btn btn-secondary">
                            بازگشت به لیست
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (isEditing && isAdmin()) {
        return (
            <div className="page-container">
                <StudentForm
                    student={student}
                    onSubmit={handleEditSuccess}
                    onCancel={handleEditCancel}
                />
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="header-content">
                    <div className="student-header-info">
                        <div className="student-avatar-large">
                            {/* Avatar display removed as not supported by backend, only placeholder */}
                            <div className="avatar-placeholder">
                                {getFullName().charAt(0).toUpperCase()}
                            </div>
                        </div>

                        <div className="student-header-details">
                            <h1>{getFullName()}</h1>
                            {student.student_id && (
                                <p className="student-id">شماره دانشجویی: {student.student_id}</p>
                            )}
                            {/* Removed is_active status display */}
                            <span className="join-date">عضویت: {formatDate(student.created_at)}</span>
                        </div>
                    </div>
                </div>

                <div className="header-actions">
                    <Link to="/dashboard/students" className="btn btn-outline">
                        بازگشت به لیست
                    </Link>

                    {isAdmin() && (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn btn-secondary"
                            >
                                ویرایش
                            </button>

                            {/* Removed toggle status button */}

                            <button
                                onClick={handleDelete}
                                className="btn btn-danger"
                            >
                                حذف
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="page-content">
                <div className="student-detail-tabs">
                    <button
                        onClick={() => {/* setActiveTab('info') implicitly as it's the only tab */}}
                        className={`tab-button active`}
                    >
                        اطلاعات شخصی
                    </button>
                    {/* Removed Certificates and Statistics tabs as related services are not supported by backend */}
                </div>

                <div className="tab-content">
                    {/* activeTab check removed as only one tab remains */}
                    <div className="student-info-tab">
                        <div className="info-cards-grid">
                            <div className="info-card">
                                <h3>اطلاعات تماس</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">ایمیل:</span>
                                        <span className="info-value">{student.email || 'نامشخص'}</span>
                                    </div>
                                    {/* Removed phone info-item */}
                                </div>
                            </div>

                            <div className="info-card">
                                <h3>اطلاعات شخصی</h3>
                                <div className="info-grid">
                                    {student.date_of_birth && ( // Using date_of_birth from backend
                                        <div className="info-item">
                                            <span className="info-label">تاریخ تولد:</span>
                                            <span className="info-value">{formatDate(student.date_of_birth)}</span>
                                        </div>
                                    )}
                                    {/* Removed is_active info-item */}
                                    <div className="info-item">
                                        <span className="info-label">تاریخ ثبت‌سیستم:</span>
                                        <span className="info-value">{formatDate(student.created_at)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">آخرین بروزرسانی:</span>
                                        <span className="info-value">{formatDate(student.updated_at)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Removed address info-card */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailPage;