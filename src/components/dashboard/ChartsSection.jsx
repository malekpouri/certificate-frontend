import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dashboardService from '../../services/dashboardService';
import '../../styles/Dashboard.css';

const ChartsSection = () => {
    const [chartsData, setChartsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('30d');

    useEffect(() => {
        loadChartsData();
    }, [selectedPeriod]);

    const loadChartsData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await dashboardService.getChartsData(selectedPeriod);

            if (result.success) {
                setChartsData(result.data);
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('خطا در بارگذاری نمودارها');
        }

        setIsLoading(false);
    };

    const periodOptions = [
        { value: '7d', label: '7 روز اخیر' },
        { value: '30d', label: '30 روز اخیر' },
        { value: '90d', label: '3 ماه اخیر' },
        { value: '1y', label: '1 سال اخیر' }
    ];

    const colors = {
        primary: '#667eea',
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
        info: '#17a2b8',
        secondary: '#6c757d'
    };

    const pieColors = [colors.primary, colors.success, colors.warning, colors.danger, colors.info, colors.secondary];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="tooltip-value" style={{ color: entry.color }}>
                            {`${entry.name} : ${entry.value.toLocaleString('fa-IR')}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (error) {
        return (
            <div className="charts-section">
                <div className="section-header">
                    <h3>نمودارها و گزارش‌ها</h3>
                </div>
                <div className="error-state">
                    <p>{error}</p>
                    <button onClick={loadChartsData} className="btn btn-primary">
                        تلاش مجدد
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="charts-section">
            <div className="section-header">
                <h3>نمودارها و گزارش‌ها</h3>
                <div className="period-selector">
                    {periodOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setSelectedPeriod(option.value)}
                            className={`btn btn-sm ${selectedPeriod === option.value ? 'btn-primary' : 'btn-outline'}`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="charts-loading">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>در حال بارگذاری نمودارها...</p>
                    </div>
                </div>
            ) : chartsData ? (
                <div className="charts-grid">
                    {/* Certificate Trend Chart */}
                    {chartsData.certificateTrend && (
                        <div className="chart-container">
                            <div className="chart-header">
                                <h4>روند صدور گواهی‌نامه</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={chartsData.certificateTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="certificates"
                                        stroke={colors.primary}
                                        strokeWidth={2}
                                        name="گواهی‌نامه‌ها"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="students"
                                        stroke={colors.success}
                                        strokeWidth={2}
                                        name="دانشجویان"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="courses"
                                        stroke={colors.warning}
                                        strokeWidth={2}
                                        name="دوره‌ها"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            ) : (
                <div className="no-data-state">
                    <p>داده‌ای برای نمایش نمودار وجود ندارد</p>
                </div>
            )}
        </div>
    );
};

export default ChartsSection;