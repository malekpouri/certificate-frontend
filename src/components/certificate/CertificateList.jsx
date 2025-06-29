import React, { useState, useEffect } from 'react';
import CertificateCard from './CertificateCard';
import certificateService from '../../services/certificateService';
import '../../styles/Certificate.css';

const CertificateList = ({
                             filters = {},
                             showFilters = true,
                             showPagination = true,
                             pageSize = 12
                         }) => {
    const [certificates, setCertificates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrevious: false,
    });

    const [searchFilters, setSearchFilters] = useState({
        search: '',
        // Removed student, course, is_active filters based on backend GET example
        ...filters
    });

    useEffect(() => {
        loadCertificates();
    }, [pagination.page, searchFilters]);

    const loadCertificates = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await certificateService.getCertificates({
                search: searchFilters.search, // Only search filter is sent
                page: pagination.page,
                page_size: pageSize,
            });

            if (result.success) {
                setCertificates(result.data);
                setPagination(prev => ({
                    ...prev,
                    totalCount: result.count,
                    totalPages: Math.ceil(result.count / pageSize),
                    hasNext: !!result.next,
                    hasPrevious: !!result.previous,
                }));
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('خطا در بارگذاری گواهی‌نامه‌ها');
        }

        setIsLoading(false);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setSearchFilters(prev => ({
            ...prev,
            [name]: value
        }));

        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        loadCertificates();
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleCertificateUpdate = (updatedCertificate) => {
        setCertificates(prev =>
            prev.map(cert =>
                cert.id === updatedCertificate.id ? updatedCertificate : cert
            )
        );
    };

    const handleCertificateDelete = (deletedId) => {
        loadCertificates(); // Re-fetch the list after deletion
    };

    const resetFilters = () => {
        setSearchFilters({
            search: '',
            // Removed other filter fields
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    if (error) {
        return (
            <div className="error-container">
                <h3>خطا در بارگذاری</h3>
                <p>{error}</p>
                <button onClick={loadCertificates} className="btn btn-primary">
                    تلاش مجدد
                </button>
            </div>
        );
    }

    return (
        <div className="certificate-list-container">
            {showFilters && (
                <div className="filters-container">
                    <form onSubmit={handleSearch} className="filters-form">
                        <div className="filter-row">
                            <div className="filter-group">
                                <input
                                    type="text"
                                    name="search"
                                    value={searchFilters.search}
                                    onChange={handleFilterChange}
                                    placeholder="جستجو در عنوان یا توضیحات..."
                                    className="filter-input"
                                />
                            </div>

                            {/* Removed student, course, is_active filter select inputs */}

                            <div className="filter-actions">
                                <button type="submit" className="btn btn-primary btn-sm">
                                    جستجو
                                </button>
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="btn btn-secondary btn-sm"
                                >
                                    پاک کردن
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="list-header">
                <div className="list-info">
          <span className="total-count">
            {pagination.totalCount} گواهی‌نامه
          </span>
                </div>
            </div>

            {isLoading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>در حال بارگذاری گواهی‌نامه‌ها...</p>
                </div>
            ) : certificates.length === 0 ? (
                <div className="empty-state">
                    <h3>گواهی‌نامه‌ای یافت نشد</h3>
                    <p>هیچ گواهی‌نامه‌ای با فیلترهای انتخابی شما یافت نشد.</p>
                </div>
            ) : (
                <>
                    <div className="certificates-grid">
                        {certificates.map(certificate => (
                            <CertificateCard
                                key={certificate.id}
                                certificate={certificate}
                                onUpdate={handleCertificateUpdate}
                                onDelete={handleCertificateDelete}
                            />
                        ))}
                    </div>

                    {showPagination && pagination.totalPages > 1 && (
                        <div className="pagination-container">
                            <div className="pagination">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={!pagination.hasPrevious}
                                    className="btn btn-outline btn-sm"
                                >
                                    قبلی
                                </button>

                                <div className="page-numbers">
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                        .filter(page =>
                                            page === 1 ||
                                            page === pagination.totalPages ||
                                            Math.abs(page - pagination.page) <= 2
                                        )
                                        .map((page, index, array) => (
                                            <React.Fragment key={page}>
                                                {index > 0 && array[index - 1] !== page - 1 && (
                                                    <span className="page-dots">...</span>
                                                )}
                                                <button
                                                    onClick={() => handlePageChange(page)}
                                                    className={`btn btn-sm ${
                                                        page === pagination.page ? 'btn-primary' : 'btn-outline'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            </React.Fragment>
                                        ))}
                                </div>

                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={!pagination.hasNext}
                                    className="btn btn-outline btn-sm"
                                >
                                    بعدی
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CertificateList;