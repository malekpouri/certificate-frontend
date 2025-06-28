import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import StudentList from '../components/student/StudentList';
import StudentForm from '../components/student/StudentForm';
import useAuth from '../hooks/useAuth';
import '../styles/Student.css';

const StudentsPage = () => {
    const { isAdmin } = useAuth();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [refreshList, setRefreshList] = useState(0);

    const handleCreateSuccess = (newStudent) => {
        console.log("StudentsPage: handleCreateSuccess called. Hiding form and refreshing list."); // لاگ تشخیصی
        setShowCreateForm(false);
        setRefreshList(prev => prev + 1);
    };

    const handleCreateCancel = () => {
        console.log("StudentsPage: handleCreateCancel called. Hiding form."); // لاگ تشخیصی
        setShowCreateForm(false);
    };

    if (showCreateForm) {
        return (
            <div className="page-container">
                <StudentForm
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
                    <h1>مدیریت دانشجویان</h1>
                    <p>لیست تمام دانشجویان ثبت شده در سیستم</p>
                </div>

                <div className="header-actions">
                    {isAdmin() && (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="btn btn-primary"
                        >
                            ایجاد دانشجوی جدید
                        </button>
                    )}

                    <Link to="/students/import" className="btn btn-secondary">
                        ورود دسته‌ای
                    </Link>

                    <Link to="/students/export" className="btn btn-outline">
                        خروجی Excel
                    </Link>
                </div>
            </div>

            <div className="page-content">
                <StudentList key={refreshList} />
            </div>
        </div>
    );
};

export default StudentsPage;