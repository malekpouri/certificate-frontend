import React, { useState, useEffect } from 'react';
import CourseCard from './CourseCard';
import courseService from '../../services/courseService';
import '../../styles/Course.css';

const CourseList = ({
                        filters = {},
                        showFilters = true,
                        showPagination = true,
                        pageSize = 12
                    }) => {
    const [courses, setCourses] = useState([]);
    // Removed categories state as they are not supported by backend
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
        search: '', // Only basic search is supported
        ...filters
    });

    useEffect(() => {
        loadCourses();
    }, [pagination.page, searchFilters]);

    const loadCourses = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await courseService.getCourses({
                search: searchFilters.search, // Only search filter
                page: pagination.page,
                page_size: pageSize,
            });

            if (result.success) {
                setCourses(result.data);
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
            setError('خطا در بارگذاری دوره‌ها');
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
        loadCourses();
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleCourseUpdate = (updatedCourse) => {
        setCourses(prev =>
            prev.map(course =>
                course.id === updatedCourse.id ? updatedCourse : course
            )
        );
    };

    const handleCourseDelete = (deletedId) => {
        loadCourses(); // Re-fetch the list after deletion
    };

    const handleCourseDuplicate = (newCourse) => {
        setCourses(prev => [newCourse, ...prev]);
        setPagination(prev => ({
            ...prev,
            totalCount: prev.totalCount + 1,
            totalPages: Math.ceil((prev.totalCount + 1) / pageSize)
        }));
    };

    const resetFilters = () => {
        setSearchFilters({
            search: '',
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    if (error) {
        return (
            <div className="error-container">
                <h3>خطا در بارگذاری</h3>
                <p>{error}</p>
                <button onClick={loadCourses} className="btn btn-primary">
                    تلاش مجدد
                </button>
            </div>
        );
    }

    return (
        <div className="course-list-container">
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
                                    placeholder="جستجو در عنوان و توضیحات..."
                                    className="filter-input"
                                />
                            </div>

                            {/* Removed category, instructor, difficulty_level, is_active, ordering select inputs */}

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
            {pagination.totalCount} دوره
          </span>
                    {searchFilters.search && ( // Simplified active filters display
                        <div className="active-filters">
                            <span className="filter-label">فیلترهای فعال:</span>
                            <span className="filter-tag">
                                جستجو: {searchFilters.search}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>در حال بارگذاری دوره‌ها...</p>
                </div>
            ) : courses.length === 0 ? (
                <div className="empty-state">
                    <h3>دوره‌ای یافت نشد</h3>
                    <p>هیچ دوره‌ای با فیلترهای انتخابی شما یافت نشد.</p>
                </div>
            ) : (
                <>
                    <div className="courses-grid">
                        {courses.map(course => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                onUpdate={handleCourseUpdate}
                                onDelete={handleCourseDelete}
                                onDuplicate={handleCourseDuplicate}
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

export default CourseList;