import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CertificateList from '../components/certificate/CertificateList';
import CertificateForm from '../components/certificate/CertificateForm';
import useAuth from '../hooks/useAuth';
import '../styles/Certificate.css';

const CertificatesPage = () => {
    const { isAdmin } = useAuth();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [refreshList, setRefreshList] = useState(0);

    const handleCreateSuccess = (newCertificate) => {
        setShowCreateForm(false);
        setRefreshList(prev => prev + 1);
    };

    const handleCreateCancel = () => {
        setShowCreateForm(false);
    };

    if (showCreateForm) {
        return (
            <div className="page-container">
                <CertificateForm
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
                    <h1>مدیریت گواهی‌نامه‌ها</h1>
                    <p>لیست تمام گواهی‌نامه‌های صادر شده</p>
                </div>

                <div className="header-actions">
                    {isAdmin() && (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="btn btn-primary"
                        >
                            ایجاد گواهی‌نامه جدید
                        </button>
                    )}

                    <Link to="/validate" className="btn btn-secondary">
                        تأیید گواهی‌نامه
                    </Link>
                </div>
            </div>

            <div className="page-content">
                <CertificateList key={refreshList} />
            </div>
        </div>
    );
};

export default CertificatesPage;