import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Dashboard.css';

const StatsCard = ({
                       title,
                       value,
                       icon,
                       color = 'primary',
                       trend = null,
                       linkTo = null,
                       subtitle = null,
                       isLoading = false
                   }) => {
    const getTrendIcon = () => {
        if (!trend) return null;
        if (trend.direction === 'up') return '📈';
        if (trend.direction === 'down') return '📉';
        return '➡️';
    };

    const getTrendColor = () => {
        if (!trend) return '';
        if (trend.direction === 'up') return 'trend-up';
        if (trend.direction === 'down') return 'trend-down';
        return 'trend-neutral';
    };

    const formatValue = (val) => {
        if (typeof val === 'number') {
            return val.toLocaleString('fa-IR');
        }
        return val;
    };

    const cardContent = (
        <div className={`stats-card ${color} ${isLoading ? 'loading' : ''}`}>
            <div className="stats-card-header">
                <div className="stats-icon">
                    {isLoading ? '⏳' : icon}
                </div>
                {trend && (
                    <div className={`stats-trend ${getTrendColor()}`}>
                        <span className="trend-icon">{getTrendIcon()}</span>
                        <span className="trend-value">{trend.value}%</span>
                    </div>
                )}
            </div>

            <div className="stats-card-body">
                <div className="stats-value">
                    {isLoading ? '...' : formatValue(value)}
                </div>
                <div className="stats-title">{title}</div>
                {subtitle && (
                    <div className="stats-subtitle">{subtitle}</div>
                )}
            </div>

            {trend && trend.description && (
                <div className="stats-card-footer">
                    <span className="trend-description">{trend.description}</span>
                </div>
            )}

            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
        </div>
    );

    if (linkTo && !isLoading) {
        return (
            <Link to={linkTo} className="stats-card-link">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
};

export default StatsCard;