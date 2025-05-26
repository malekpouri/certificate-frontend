import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StudentForm from '../components/student/StudentForm';
import CertificateList from '../components/certificate/CertificateList';
import studentService from '../services/studentService';
import useAuth from '../hooks/useAuth';
import '../styles/Student.css';

const StudentDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const [student, setStudent] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        loadStudentData();
    }, [id]);

    const loadStudentData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [studentResult, statsResult] = await Promise.all([
                studentService.getStudent(id),
                studentService.getStudentStatistics(id)
            ]);

            if (studentResult.success) {
                setStudent(studentResult.data);
            } else {
                setError(studentResult.message);
            }

            if (statsResult.success) {
                setStatistics(statsResult.data);
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
            navigate('/students');
        } else {
            alert(result.message);
        }
    };

    const handleToggleStatus = async () => {
        const result = student.is_active
            ? await studentService.deactivateStudent(id)
            : await studentService.activateStudent(id);

        if (result.success) {
            setStudent(result.data);
            alert(result.message);
        } else {
            alert(result.message);
        }
    };

    const handleEditSuccess = (updatedStudent) => {
        setStudent(updatedStudent);
        setIsEditing(false);
    };

    const handleEditCancel = () => {
        setIsEditing(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'نامشخص';
        return new Date(dateString).toLocaleDateString('fa-IR');
    };

    const getFullName = () => {
        if (!student) return '';
        return student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'نام نامشخص';
    };

    const getAvatarUrl = () => {
        if (student?.avatar) {
            return student.avatar.startsWith('http')
                ? student.avatar
                : `${import.meta.env.VITE_API_URL}${student.avatar}`;
        }
        return null;
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
                        <Link to="/students" className="btn btn-secondary">
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
                            {getAvatarUrl() ? (
                                <img
                                    src={getAvatarUrl()}
                                    alt={getFullName()}
                                    className="avatar-image"
                                />
                            ) : (
                                <div className="avatar-placeholder">
                                    {getFullName().charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="student-header-details">
                            <h1>{getFullName()}</h1>
                            {student.student_id && (
                                <p className="student-id">شماره دانشجویی: {student.student_id}</p>
                            )}
                            <div className="header-meta">
                <span className={`status-badge ${student.is_active ? 'active' : 'inactive'}`}>
                  {student.is_active ? 'فعال' : 'غیرفعال'}
                </span>
                                <span className="join-date">عضویت: {formatDate(student.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="header-actions">
                    <Link to="/students" className="btn btn-outline">
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

                            <button
                                onClick={handleToggleStatus}
                                className={`btn ${student.is_active ? 'btn-warning' : 'btn-success'}`}
                            >
                                {student.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                            </button>

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
                        onClick={() => setActiveTab('info')}
                        className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
                    >
                        اطلاعات شخصی
                    </button>
                    <button
                        onClick={() => setActiveTab('certificates')}
                        className={`tab-button ${activeTab === 'certificates' ? 'active' : ''}`}
                    >
                        گواهی‌نامه‌ها
                        {statistics?.certificates_count > 0 && (
                            <span className="tab-badge">{statistics.certificates_count}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('statistics')}
                        className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
                    >
                        آمار و ارقام
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'info' && (
                        <div className="student-info-tab">
                            <div className="info-cards-grid">
                                <div className="info-card">
                                    <h3>اطلاعات تماس</h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="info-label">ایمیل:</span>
                                            <span className="info-value">{student.email || 'نامشخص'}</span>
                                        </div>
                                        {student.phone && (
                                            <div className="info-item">
                                                <span className="info-label">تلفن:</span>
                                                <span className="info-value">{student.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="info-card">
                                    <h3>اطلاعات شخصی</h3>
                                    <div className="info-grid">
                                        {student.birth_date && (
                                            <div className="info-item">
                                                <span className="info-label">تاریخ تولد:</span>
                                                <span className="info-value">{formatDate(student.birth_date)}</span>
                                            </div>
                                        )}
                                        <div className="info-item">
                                            <span className="info-label">وضعیت:</span>
                                            <span className="info-value">
                        {student.is_active ? 'فعال' : 'غیرفعال'}
                      </span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">تاریخ ثبت‌نام:</span>
                                            <span className="info-value">{formatDate(student.created_at)}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">آخرین بروزرسانی:</span>
                                            <span className="info-value">{formatDate(student.updated_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                {student.address && (
                                    <div className="info-card full-width">
                                        <h3>آدرس</h3>
                                        <p className="address-text">{student.address}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'certificates' && (
                        <div className="certificates-tab">
                            <CertificateList
                                filters={{ student: id }}
                                showFilters={false}
                            />
                        </div>
                    )}

                    {activeTab === 'statistics' && (
                        <div className="statistics-tab">
                            {statistics ? (
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-number">{statistics.certificates_count || 0}</div>
                                        <div className="stat-label">تعداد گواهی‌نامه</div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-number">{statistics.active_certificates || 0}</div>
                                        <div className="stat-label">گواهی‌نامه فعال</div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-number">{statistics.completed_courses || 0}</div>
                                        <div className="stat-label">دوره تکمیل شده</div>
                                    </div>

                                    {statistics.average_grade && (
                                        <div className="stat-card">
                                            <div className="stat-number">{statistics.average_grade.toFixed(2)}</div>
                                            <div className="stat-label">میانگین نمرات</div>
                                        </div>
                                    )}

                                    {statistics.last_certificate_date && (
                                        <div className="stat-card full-width">
                                            <div className="stat-label">آخرین گواهی‌نامه</div>
                                            <div className="stat-value">{formatDate(statistics.last_certificate_date)}</div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="loading-container">
                                    <p>در حال بارگذاری آمار...</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDetailPage;