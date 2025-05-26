import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CourseList from '../components/course/CourseList';
import CourseForm from '../components/course/CourseForm';
import useAuth from '../hooks/useAuth';
import '../styles/Course.css';

const CoursesPage = () => {
    const { isAdmin } = useAuth();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [refreshList, setRefreshList] = useState(0);

    const handleCreateSuccess = (newCourse) => {
        setShowCreateForm(false);
        setRefreshList(prev => prev + 1);
    };

    const handleCreateCancel = () => {
        setShowCreateForm(false);
    };

    if (showCreateForm) {
        return (
            <div className="page-container">
                <CourseForm
                    onSubmit={handleCreateSuccess}
                    onCancel={handleCreateCancel}
                />
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="header-content">
                    <h1>مدیریت دوره‌ها</h1>
                    <p>لیست تمام دوره‌های آموزشی موجود در سیستم</p>
                </div>

                <div className="header-actions">
                    {isAdmin() && (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="btn btn-primary"
                        >
                            ایجاد دوره جدید
                        </button>
                    )}

                    <Link to="/courses/categories" className="btn btn-secondary">
                        مدیریت دسته‌ها
                    </Link>

                    <Link to="/courses/import" className="btn btn-outline">
                        ورود دسته‌ای
                    </Link>

                    <Link to="/courses/export" className="btn btn-outline">
                        خروجی Excel
                    </Link>
                </div>
            </div>

            <div className="page-content">
                <CourseList key={refreshList} />
            </div>
        </div>
    );
};

export default CoursesPage;