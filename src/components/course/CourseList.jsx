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
    const [categories, setCategories] = useState([]);
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
        category: '',
        instructor: '',
        difficulty_level: '',
        is_active: '',
        ordering: '-created_at',
        ...filters
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        loadCourses();
    }, [pagination.page, searchFilters]);

    const loadInitialData = async () => {
        try {
            const categoriesResult = await courseService.getCourseCategories();
            if (categoriesResult.success) {
                setCategories(categoriesResult.data);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadCourses = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await courseService.getCourses({
                ...searchFilters,
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
        setCourses(prev => prev.filter(course => course.id !== deletedId));
        setPagination(prev => ({
            ...prev,
            totalCount: prev.totalCount - 1,
            totalPages: Math.ceil((prev.totalCount - 1) / pageSize)
        }));
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
            category: '',
            instructor: '',
            difficulty_level: '',
            is_active: '',
            ordering: '-created_at',
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

    const getDifficultyText = (value) => {
        switch (value) {
            case 'beginner': return 'مبتدی';
            case 'intermediate': return 'متوسط';
            case 'advanced': return 'پیشرفته';
            default: return 'همه';
        }
    };

    const getOrderingText = (value) => {
        switch (value) {
            case 'title': return 'عنوان (الف-ی)';
            case '-title': return 'عنوان (ی-الف)';
            case 'created_at': return 'قدیمی‌ترین';
            case '-created_at': return 'جدیدترین';
            case 'start_date': return 'تاریخ شروع';
            case '-start_date': return 'تاریخ شروع (نزولی)';
            default: return 'مرتب‌سازی';
        }
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

                            <div className="filter-group">
                                <select
                                    name="category"
                                    value={searchFilters.category}
                                    onChange={handleFilterChange}
                                    className="filter-select"
                                >
                                    <option value="">همه دسته‌ها</option>
                                    {categories.map(category => (
                                        <option key={category.id || category} value={category.name || category}>
                                            {category.name || category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <input
                                    type="text"
                                    name="instructor"
                                    value={searchFilters.instructor}
                                    onChange={handleFilterChange}
                                    placeholder="نام مدرس..."
                                    className="filter-input"
                                />
                            </div>

                            <div className="filter-group">
                                <select
                                    name="difficulty_level"
                                    value={searchFilters.difficulty_level}
                                    onChange={handleFilterChange}
                                    className="filter-select"
                                >
                                    <option value="">همه سطوح</option>
                                    <option value="beginner">مبتدی</option>
                                    <option value="intermediate">متوسط</option>
                                    <option value="advanced">پیشرفته</option>
                                </select>
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

                            <div className="filter-group">
                                <select
                                    name="ordering"
                                    value={searchFilters.ordering}
                                    onChange={handleFilterChange}
                                    className="filter-select"
                                >
                                    <option value="-created_at">جدیدترین</option>
                                    <option value="created_at">قدیمی‌ترین</option>
                                    <option value="title">عنوان (الف-ی)</option>
                                    <option value="-title">عنوان (ی-الف)</option>
                                    <option value="start_date">تاریخ شروع</option>
                                    <option value="-start_date">تاریخ شروع (نزولی)</option>
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
            {pagination.totalCount} دوره
          </span>
                    {Object.values(searchFilters).some(filter => filter && filter !== '-created_at') && (
                        <div className="active-filters">
                            <span className="filter-label">فیلترهای فعال:</span>
                            {searchFilters.search && (
                                <span className="filter-tag">
                  جستجو: {searchFilters.search}
                </span>
                            )}
                            {searchFilters.category && (
                                <span className="filter-tag">
                  دسته: {searchFilters.category}
                </span>
                            )}
                            {searchFilters.instructor && (
                                <span className="filter-tag">
                  مدرس: {searchFilters.instructor}
                </span>
                            )}
                            {searchFilters.difficulty_level && (
                                <span className="filter-tag">
                  سطح: {getDifficultyText(searchFilters.difficulty_level)}
                </span>
                            )}
                            {searchFilters.is_active && (
                                <span className="filter-tag">
                  وضعیت: {getStatusText(searchFilters.is_active)}
                </span>
                            )}
                            {searchFilters.ordering && searchFilters.ordering !== '-created_at' && (
                                <span className="filter-tag">
                  مرتب‌سازی: {getOrderingText(searchFilters.ordering)}
                </span>
                            )}
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