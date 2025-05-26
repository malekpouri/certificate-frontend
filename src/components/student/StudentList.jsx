import React, { useState, useEffect } from 'react';
import StudentCard from './StudentCard';
import studentService from '../../services/studentService';
import '../../styles/Student.css';

const StudentList = ({
                         filters = {},
                         showFilters = true,
                         showPagination = true,
                         pageSize = 12
                     }) => {
    const [students, setStudents] = useState([]);
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
        email: '',
        student_id: '',
        is_active: '',
        ...filters
    });

    useEffect(() => {
        loadStudents();
    }, [pagination.page, searchFilters]);

    const loadStudents = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await studentService.getStudents({
                ...searchFilters,
                page: pagination.page,
                page_size: pageSize,
            });

            if (result.success) {
                setStudents(result.data);
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
            setError('خطا در بارگذاری دانشجویان');
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
        loadStudents();
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleStudentUpdate = (updatedStudent) => {
        setStudents(prev =>
            prev.map(student =>
                student.id === updatedStudent.id ? updatedStudent : student
            )
        );
    };

    const handleStudentDelete = (deletedId) => {
        setStudents(prev => prev.filter(student => student.id !== deletedId));
        setPagination(prev => ({
            ...prev,
            totalCount: prev.totalCount - 1,
            totalPages: Math.ceil((prev.totalCount - 1) / pageSize)
        }));
    };

    const resetFilters = () => {
        setSearchFilters({
            search: '',
            email: '',
            student_id: '',
            is_active: '',
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const getStatusText = (value) => {
        switch (value) {
            case 'true': return 'فعال';
            case 'false': return 'غیرفعال';
            default: return 'همه';
        }
    };

    if (error) {
        return (
            <div className="error-container">
                <h3>خطا در بارگذاری</h3>
                <p>{error}</p>
                <button onClick={loadStudents} className="btn btn-primary">
                    تلاش مجدد
                </button>
            </div>
        );
    }

    return (
        <div className="student-list-container">
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
                                    placeholder="جستجو در نام و نام خانوادگی..."
                                    className="filter-input"
                                />
                            </div>

                            <div className="filter-group">
                                <input
                                    type="email"
                                    name="email"
                                    value={searchFilters.email}
                                    onChange={handleFilterChange}
                                    placeholder="جستجو در ایمیل..."
                                    className="filter-input"
                                />
                            </div>

                            <div className="filter-group">
                                <input
                                    type="text"
                                    name="student_id"
                                    value={searchFilters.student_id}
                                    onChange={handleFilterChange}
                                    placeholder="شماره دانشجویی..."
                                    className="filter-input"
                                />
                            </div>

                            <div className="filter-group">
                                <select
                                    name="is_active"
                                    value={searchFilters.is_active}
                                    onChange={handleFilterChange}
                                    className="filter-select"
                                >
                                    <option value="">همه وضعیت‌ها</option>
                                    <option value="true">فعال</option>
                                    <option value="false">غیرفعال</option>
                                </select>
                            </div>

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
            {pagination.totalCount} دانشجو
          </span>
                    {Object.values(searchFilters).some(filter => filter) && (
                        <div className="active-filters">
                            <span className="filter-label">فیلترهای فعال:</span>
                            {searchFilters.search && (
                                <span className="filter-tag">
                  جستجو: {searchFilters.search}
                </span>
                            )}
                            {searchFilters.email && (
                                <span className="filter-tag">
                  ایمیل: {searchFilters.email}
                </span>
                            )}
                            {searchFilters.student_id && (
                                <span className="filter-tag">
                  شماره: {searchFilters.student_id}
                </span>
                            )}
                            {searchFilters.is_active && (
                                <span className="filter-tag">
                  وضعیت: {getStatusText(searchFilters.is_active)}
                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>در حال بارگذاری دانشجویان...</p>
                </div>
            ) : students.length === 0 ? (
                <div className="empty-state">
                    <h3>دانشجویی یافت نشد</h3>
                    <p>هیچ دانشجویی با فیلترهای انتخابی شما یافت نشد.</p>
                </div>
            ) : (
                <>
                    <div className="students-grid">
                        {students.map(student => (
                            <StudentCard
                                key={student.id}
                                student={student}
                                onUpdate={handleStudentUpdate}
                                onDelete={handleStudentDelete}
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

                            <div className="pagination-info">
                <span>
                  نمایش {((pagination.page - 1) * pageSize) + 1} تا {Math.min(pagination.page * pageSize, pagination.totalCount)} از {pagination.totalCount}
                </span>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentList;