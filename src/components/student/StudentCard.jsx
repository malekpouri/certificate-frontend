import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import studentService from '../../services/studentService';
import '../../styles/Student.css';

const StudentCard = ({ student, onUpdate, onDelete }) => {
    const [isLoading, setIsLoading] = useState(false);

    // Removed handleToggleStatus as is_active status is not supported by backend definition

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

    // Removed getAvatarUrl as avatar is not supported by backend definition

    return (
        <div className="student-card">
            <div className="student-card-header">
                <div className="student-avatar">
                    {/* Removed getAvatarUrl() logic, only placeholder remains */}
                    <div className="avatar-placeholder">
                        {getFullName().charAt(0).toUpperCase()}
                    </div>
                </div>

                <div className="student-basic-info">
                    <h3 className="student-name">{getFullName()}</h3>
                    {student.student_id && (
                        <p className="student-id">شماره دانشجویی: {student.student_id}</p>
                    )}
                    {/* Removed student-status display as is_active is not supported by backend definition */}
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

                    {/* Removed phone info-item */}

                    {student.date_of_birth && ( // Changed from birth_date
                        <div className="info-item">
                            <span className="info-icon">🎂</span>
                            <span className="info-value">تولد: {formatDate(student.date_of_birth)}</span> {/* Changed from birth_date */}
                        </div>
                    )}

                    <div className="info-item">
                        <span className="info-icon">📅</span>
                        <span className="info-value">عضویت: {formatDate(student.created_at)}</span>
                    </div>

                    {/* Removed certificates_count info-item */}
                </div>

                {/* Removed student-address display */}
            </div>

            <div className="student-card-actions">
                <Link
                    to={`/dashboard/students/${student.id}`} // Adjusted for dashboard nesting
                    className="btn btn-primary btn-sm"
                >
                    مشاهده
                </Link>

                <Link
                    to={`/dashboard/students/${student.id}/edit`} // Adjusted for dashboard nesting
                    className="btn btn-outline btn-sm"
                >
                    ویرایش
                </Link>

                {/* Removed toggle status button */}

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