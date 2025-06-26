import React from 'react';
import './ChartWidget.css';

const ChartWidget = ({ 
    title, 
    data = [], 
    type = 'bar', 
    height = 300,
    showLegend = true 
}) => {
    // Calculate max value for scaling
    const maxValue = Math.max(...data.map(item => item.value), 1);

    const renderBarChart = () => {
        return (
            <div className="bar-chart" style={{ height: `${height}px` }}>
                <div className="chart-bars">
                    {data.map((item, index) => (
                        <div key={index} className="bar-wrapper">
                            <div className="bar-container">
                                <div 
                                    className="bar"
                                    style={{
                                        height: `${(item.value / maxValue) * 100}%`,
                                        backgroundColor: item.color || '#667eea'
                                    }}
                                >
                                    <span className="bar-value">{item.value}</span>
                                </div>
                            </div>
                            <span className="bar-label">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderLineChart = () => {
        return (
            <div className="line-chart" style={{ height: `${height}px` }}>
                <svg width="100%" height="100%" viewBox="0 0 500 300" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map(i => (
                        <line
                            key={i}
                            x1="0"
                            y1={60 + i * 60}
                            x2="500"
                            y2={60 + i * 60}
                            stroke="#e0e0e0"
                            strokeDasharray="5,5"
                        />
                    ))}
                    
                    {/* Line path */}
                    <polyline
                        fill="none"
                        stroke="#667eea"
                        strokeWidth="3"
                        points={data.map((item, index) => {
                            const x = (index / (data.length - 1)) * 500;
                            const y = 300 - ((item.value / maxValue) * 280);
                            return `${x},${y}`;
                        }).join(' ')}
                    />
                    
                    {/* Data points */}
                    {data.map((item, index) => {
                        const x = (index / (data.length - 1)) * 500;
                        const y = 300 - ((item.value / maxValue) * 280);
                        return (
                            <g key={index}>
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="5"
                                    fill="#667eea"
                                />
                                <text
                                    x={x}
                                    y={y - 10}
                                    textAnchor="middle"
                                    className="point-value"
                                >
                                    {item.value}
                                </text>
                            </g>
                        );
                    })}
                </svg>
                
                <div className="line-labels">
                    {data.map((item, index) => (
                        <span key={index} className="line-label">{item.label}</span>
                    ))}
                </div>
            </div>
        );
    };

    const renderPieChart = () => {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = 0;

        return (
            <div className="pie-chart" style={{ height: `${height}px` }}>
                <svg width="100%" height="100%" viewBox="0 0 200 200">
                    {data.map((item, index) => {
                        const percentage = (item.value / total) * 100;
                        const angle = (percentage * 360) / 100;
                        const startAngle = currentAngle;
                        currentAngle += angle;

                        const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
                        const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
                        const x2 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
                        const y2 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);

                        const largeArcFlag = angle > 180 ? 1 : 0;

                        return (
                            <g key={index}>
                                <path
                                    d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                    fill={item.color || `hsl(${index * 60}, 70%, 60%)`}
                                    stroke="white"
                                    strokeWidth="2"
                                />
                                <text
                                    x={100 + 50 * Math.cos(((startAngle + angle / 2) * Math.PI) / 180)}
                                    y={100 + 50 * Math.sin(((startAngle + angle / 2) * Math.PI) / 180)}
                                    textAnchor="middle"
                                    className="pie-value"
                                >
                                    {percentage.toFixed(0)}%
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {showLegend && (
                    <div className="pie-legend">
                        {data.map((item, index) => (
                            <div key={index} className="legend-item">
                                <span 
                                    className="legend-color" 
                                    style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 60%)` }}
                                ></span>
                                <span className="legend-label">{item.label}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderChart = () => {
        switch (type) {
            case 'line':
                return renderLineChart();
            case 'pie':
                return renderPieChart();
            case 'bar':
            default:
                return renderBarChart();
        }
    };

    return (
        <div className="chart-widget">
            {title && <h3 className="chart-title">{title}</h3>}
            {data.length > 0 ? (
                renderChart()
            ) : (
                <div className="chart-empty">
                    <p>داده‌ای برای نمایش وجود ندارد</p>
                </div>
            )}
        </div>
    );
};

export default ChartWidget;