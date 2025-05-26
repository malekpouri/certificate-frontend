import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import studentService from '../../services/studentService';
import '../../styles/Student.css';

const StudentCard = ({ student, onUpdate, onDelete }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleToggleStatus = async () => {
        setIsLoading(true);

        const result = student.is_active
            ? await studentService.deactivateStudent(student.id)
            : await studentService.activateStudent(student.id);

        if (result.success) {
            if (onUpdate) {
                onUpdate(result.data);
            }
            alert(result.message);
        } else {
            alert(result.message);
        }

        setIsLoading(false);
    };

    const handleDelete = async () => {
        if (!window.confirm('آیا از حذف این دانشجو اطمینان دارید؟')) {
            return;
        }

        setIsLoading(true);
        const result = await studentService.deleteStudent(student.id);

        if (result.success) {
            if (onDelete) {
                onDelete(student.id);
            }
            alert(result.message);
        } else {
            alert(result.message);
        }

        setIsLoading(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'نامشخص';
        return new Date(dateString).toLocaleDateString('fa-IR');
    };

    const getFullName = () => {
        return student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'نام نامشخص';
    };

    const getAvatarUrl = () => {
        if (student.avatar) {
            return student.avatar.startsWith('http') ? student.avatar : `${import.meta.env.VITE_API_URL}${student.avatar}`;
        }
        return null;
    };

    return (
        <div className="student-card">
            <div className="student-card-header">
                <div className="student-avatar">
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

                <div className="student-basic-info">
                    <h3 className="student-name">{getFullName()}</h3>
                    {student.student_id && (
                        <p className="student-id">شماره دانشجویی: {student.student_id}</p>
                    )}
                    <div className="student-status">
            <span className={`status-badge ${student.is_active ? 'active' : 'inactive'}`}>
              {student.is_active ? 'فعال' : 'غیرفعال'}
            </span>
                    </div>
                </div>
            </div>

            <div className="student-card-body">
                <div className="student-info">
                    {student.email && (
                        <div className="info-item">
                            <span className="info-icon">📧</span>
                            <span className="info-value">{student.email}</span>
                        </div>
                    )}

                    {student.phone && (
                        <div className="info-item">
                            <span className="info-icon">📱</span>
                            <span className="info-value">{student.phone}</span>
                        </div>
                    )}

                    {student.birth_date && (
                        <div className="info-item">
                            <span className="info-icon">🎂</span>
                            <span className="info-value">تولد: {formatDate(student.birth_date)}</span>
                        </div>
                    )}

                    <div className="info-item">
                        <span className="info-icon">📅</span>
                        <span className="info-value">عضویت: {formatDate(student.created_at)}</span>
                    </div>

                    {student.certificates_count !== undefined && (
                        <div className="info-item">
                            <span className="info-icon">🎓</span>
                            <span className="info-value">{student.certificates_count} گواهی‌نامه</span>
                        </div>
                    )}
                </div>

                {student.address && (
                    <div className="student-address">
                        <span className="info-icon">📍</span>
                        <span className="address-text">{student.address}</span>
                    </div>
                )}
            </div>

            <div className="student-card-actions">
                <Link
                    to={`/students/${student.id}`}
                    className="btn btn-primary btn-sm"
                >
                    مشاهده
                </Link>

                <Link
                    to={`/students/${student.id}/edit`}
                    className="btn btn-outline btn-sm"
                >
                    ویرایش
                </Link>

                <button
                    onClick={handleToggleStatus}
                    className={`btn btn-sm ${student.is_active ? 'btn-warning' : 'btn-success'}`}
                    disabled={isLoading}
                >
                    {student.is_active ? 'غیرفعال' : 'فعال'}
                </button>

                <button
                    onClick={handleDelete}
                    className="btn btn-danger btn-sm"
                    disabled={isLoading}
                >
                    حذف
                </button>
            </div>

            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
        </div>
    );
};

export default StudentCard;