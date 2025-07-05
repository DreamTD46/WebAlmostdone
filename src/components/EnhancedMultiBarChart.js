'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { isEqual } from 'lodash';
import { PM_THRESHOLDS, getAirQualityColor, determineHourlyMeanPC01Status, determinePM25Status, determinePM10Status } from '../data/monitoring-data';

const EnhancedMultiBarChart = ({ data, pmType, getBarColor, onBarSelect }) => {
    const [hoveredBar, setHoveredBar] = useState(null);
    const [animationKey, setAnimationKey] = useState(0);
    const chartRef = useRef(null);
    const prevDataRef = useRef({ data, pmType });

    // Trigger animation only when data or pmType changes meaningfully
    useEffect(() => {
        const isFallbackData = data.length === 1 && data[0].pc01 === '0.00' && data[0].pm25 === '0.00' && data[0].pm10 === '0.00';
        if (!isFallbackData && (!isEqual(data, prevDataRef.current.data) || pmType !== prevDataRef.current.pmType)) {
            setAnimationKey(prev => prev + 1);
            prevDataRef.current = { data, pmType };
        }
    }, [data, pmType]);

    if (!data || data.length === 0) return <div className="text-center p-4">No data available</div>;

    // Memoize thresholds
    const thresholds = useMemo(() =>
        pmType === 'PM10' ? [
            0,
            PM_THRESHOLDS.PM10.Good, // 50
            PM_THRESHOLDS.PM10.Warning, // 80
            PM_THRESHOLDS.PM10['Affects health'], // 120
            PM_THRESHOLDS.PM10.Danger, // 180
            PM_THRESHOLDS.PM10.Danger * 2 // 360
        ] : pmType === 'PM2.5' ? [
            0,
            PM_THRESHOLDS.PM.Good, // 15
            PM_THRESHOLDS.PM.Warning, // 37.5
            PM_THRESHOLDS.PM['Affects health'], // 75
            PM_THRESHOLDS.PM.Danger, // 150
            PM_THRESHOLDS.PM.Danger * 2 // 300
        ] : [
            0,
            PM_THRESHOLDS.HourlyMeanPC01.Good, // 258
            PM_THRESHOLDS.HourlyMeanPC01.Warning, // 543
            PM_THRESHOLDS.HourlyMeanPC01['Affects health'], // 3616
            PM_THRESHOLDS.HourlyMeanPC01.Danger, // 6271
            PM_THRESHOLDS.HourlyMeanPC01.Hazardous // 20000
        ],
        [pmType]
    );

    // Memoize allValues and maxValue
    const allValues = useMemo(() =>
        data.map(item => parseFloat(item[pmType === 'PC0.1' ? 'pc01' : pmType === 'PM2.5' ? 'pm25' : 'pm10'] || 0)),
        [data, pmType]
    );
    const maxValue = useMemo(() => Math.max(...allValues, 1), [allValues]);

    const chartHeight = 200;
    const chartWidth = '100%';
    const barWidth = 40;
    const barSpacing = 20;

    const getBarHeight = useCallback((value) =>
        (value / (maxValue + 5)) * chartHeight,
        [maxValue, chartHeight]
    );

    const getYPosition = useCallback((value) =>
        ((maxValue + 5 - value) / (maxValue + 5)) * chartHeight,
        [maxValue, chartHeight]
    );

    const getStatus = useCallback((value) => {
        const val = parseFloat(value);
        return pmType === 'PC0.1'
            ? determineHourlyMeanPC01Status(val)
            : pmType === 'PM2.5'
                ? determinePM25Status(val)
                : determinePM10Status(val);
    }, [pmType]);

    const handleBarHover = useCallback((dataPoint, value, event) => {
        setHoveredBar({ dataPoint, value });
    }, []);

    const handleBarLeave = useCallback(() => {
        setHoveredBar(null);
    }, []);

    const handleBarClick = useCallback((dataPoint) => {
        if (onBarSelect) {
            onBarSelect(dataPoint);
        }
    }, [onBarSelect]);

    return (
        <div className="bg-white rounded-lg p-6" style={{ height: '350px', overflow: 'hidden' }}>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-800">Air Quality History</h3>
                    {hoveredBar && (
                        <div className="flex items-center space-x-2 animate-fade-in">
                            <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: getBarColor(hoveredBar.value, pmType) }}
                            />
                            <span className="text-sm font-medium text-gray-700">
                                {hoveredBar.dataPoint.time}: {pmType} = {hoveredBar.value.toFixed(1)} {pmType === 'PC0.1' ? 'PNC' : 'μg/m³'}
                            </span>
                            <span
                                className="text-xs px-2 py-1 rounded text-white font-medium"
                                style={{ backgroundColor: getBarColor(hoveredBar.value, pmType) }}
                            >
                                {getStatus(hoveredBar.value)}
                            </span>
                        </div>
                    )}
                </div>
                <div className="text-sm text-gray-600">{pmType === 'PC0.1' ? 'PNC' : 'μg/m³'}</div>
            </div>

            <div className="relative" style={{ height: `${chartHeight + 40}px`, width: chartWidth }}>
                <div className="absolute left-0 top-0 h-full" style={{ width: '40px' }}>
                    {thresholds.map((threshold, index) => (
                        <div
                            key={threshold}
                            className="absolute w-full border-t border-gray-200"
                            style={{ top: `${getYPosition(threshold)}px`, width: '100%' }}
                        >
                            <span className="absolute -left-8 text-xs text-gray-500">{threshold}</span>
                        </div>
                    ))}
                </div>

                <div
                    ref={chartRef}
                    className="absolute top-0 flex items-end justify-around"
                    style={{
                        left: '40px',
                        width: 'calc(100% - 40px)',
                        height: `${chartHeight}px`,
                        paddingBottom: '20px',
                    }}
                >
                    {data.map((item, index) => (
                        <div
                            key={`bar-${index}-${animationKey}`}
                            className="relative cursor-pointer transition-all duration-300 hover:scale-105"
                            style={{
                                width: `${barWidth}px`,
                                height: `${getBarHeight(parseFloat(item[pmType === 'PC0.1' ? 'pc01' : pmType === 'PM2.5' ? 'pm25' : 'pm10'] || 0))}px`,
                                backgroundColor: getBarColor(item[pmType === 'PC0.1' ? 'pc01' : pmType === 'PM2.5' ? 'pm25' : 'pm10'], pmType),
                                borderRadius: '4px 4px 0 0',
                                animation: `slideUp ${0.8 + index * 0.1}s ease-out`,
                                boxShadow: hoveredBar?.dataPoint === item
                                    ? `0 0 15px ${getBarColor(item[pmType === 'PC0.1' ? 'pc01' : pmType === 'PM2.5' ? 'pm25' : 'pm10'], pmType)}60`
                                    : 'none',
                            }}
                            onMouseEnter={(e) => handleBarHover(item, parseFloat(item[pmType === 'PC0.1' ? 'pc01' : pmType === 'PM2.5' ? 'pm25' : 'pm10'] || 0), e)}
                            onMouseLeave={handleBarLeave}
                            onClick={() => handleBarClick(item)}
                        >
                            {hoveredBar?.dataPoint === item && (
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                                    {(parseFloat(item[pmType === 'PC0.1' ? 'pc01' : pmType === 'PM2.5' ? 'pm25' : 'pm10'] || 0)).toFixed(1)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="absolute bottom-0 flex justify-around" style={{ left: '40px', width: 'calc(100% - 40px)' }}>
                    {data.map((item, index) => (
                        <div key={`label-${index}`} className="text-center">
                            <div className="text-sm font-medium text-gray-800">{item.time}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-4 flex justify-center">
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: getBarColor(15, pmType) }}></div>
                    <span className="text-sm text-gray-700">{pmType}</span>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideUp {
                    from {
                        height: 0;
                        opacity: 0;
                    }
                    to {
                        height: var(--final-height);
                        opacity: 1;
                    }
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-5px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default EnhancedMultiBarChart;