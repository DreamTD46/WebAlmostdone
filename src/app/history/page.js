'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDatabase, ref, onValue } from 'firebase/database';
import { initializeApp, getApps } from 'firebase/app';
import { Header, Footer } from '../../components/MonitoringInterface';
import dynamic from 'next/dynamic';
import { LOCATION_CONFIGS } from '../../config/firebase-configs';
import { getAirQualityColor, PM_THRESHOLDS, determineHourlyMeanPC01Status, determinePM25Status, determinePM10Status } from '../../data/monitoring-data';

const EnhancedMultiBarChart = dynamic(() => import('../../components/EnhancedMultiBarChart'), { ssr: false });

// Air quality status functions
const getBarColor = (value, type) => {
    const status =
        type === 'PC0.1'
            ? determineHourlyMeanPC01Status(value)
            : type === 'PM2.5'
                ? determinePM25Status(value)
                : determinePM10Status(value);
    return getAirQualityColor(status);
};

const getSelectedStatus = (selectedData, pmType) => {
    if (!selectedData) return { status: 'Good', range: '', color: getAirQualityColor('Good') };
    const value = selectedData[pmType === 'PC0.1' ? 'pc01' : pmType === 'PM2.5' ? 'pm25' : 'pm10'];
    const status =
        pmType === 'PC0.1'
            ? determineHourlyMeanPC01Status(value)
            : pmType === 'PM2.5'
                ? determinePM25Status(value)
                : determinePM10Status(value);
    const thresholds =
        pmType === 'PC0.1' ? PM_THRESHOLDS.HourlyMeanPC01 : pmType === 'PM2.5' ? PM_THRESHOLDS.PM : PM_THRESHOLDS.PM10;
    return {
        status,
        range: getRangeText(status, thresholds, pmType),
        color: getAirQualityColor(status),
    };
};

const getRangeText = (status, thresholds, pmType) => {
    switch (status) {
        case 'Good':
            return pmType === 'PC0.1' ? `0-${thresholds.Good} PNC` : `0-${thresholds.Good} μg/m³`;
        case 'Warning':
            return pmType === 'PC0.1' ? `${thresholds.Good + 1}-${thresholds.Warning} PNC` : `${thresholds.Good + 0.1}-${thresholds.Warning} μg/m³`;
        case 'Affects health':
            return pmType === 'PC0.1'
                ? `${thresholds.Warning + 1}-${thresholds['Affects health']} PNC`
                : `${thresholds.Warning + 0.1}-${thresholds['Affects health']} μg/m³`;
        case 'Danger':
            return pmType === 'PC0.1'
                ? `${thresholds['Affects health'] + 1}-${thresholds.Danger} PNC`
                : `${thresholds['Affects health'] + 0.1}-${thresholds.Danger} μg/m³`;
        case 'Hazardous':
            return pmType === 'PC0.1' ? `${thresholds.Danger + 1}+ PNC` : `${thresholds.Danger + 0.1}+ μg/m³`;
        default:
            return '';
    }
};

const createFallbackData = (timestamp = '00:00') => ({
    time: timestamp,
    pc01: '0.00',
    pm25: '0.00',
    pm10: '0.00',
});

export default function HistoryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const locationId = searchParams.get('locationId');
    const selectedLocation = locationId
        ? LOCATION_CONFIGS[locationId] || { name: 'Cafe Amazon ST', id: 'cafe-amazon-st', firebaseConfig: LOCATION_CONFIGS['cafe-amazon-st'].firebaseConfig, testingPath: 'Cafe' }
        : { name: 'Cafe Amazon ST', id: 'cafe-amazon-st', firebaseConfig: LOCATION_CONFIGS['cafe-amazon-st'].firebaseConfig, testingPath: 'Cafe' };

    const [timeFrame, setTimeFrame] = useState('Daily');
    const [pmType, setPmType] = useState('PM10');
    const [historicalData, setHistoricalData] = useState([createFallbackData()]);
    const [selectedData, setSelectedData] = useState(createFallbackData());
    const [loading, setLoading] = useState(true);
    const firebaseAppRef = useRef({});

    const handleBackToHome = async () => {
        try {
            console.log('Navigating to home...');
            await router.push('/');
        } catch (error) {
            console.error('Navigation error:', error);
        }
    };

    const getFirebaseApp = (locationConfig) => {
        if (!firebaseAppRef.current[locationConfig.id]) {
            try {
                const existingApp = getApps().find((app) => app.name === locationConfig.id);
                if (!existingApp) {
                    firebaseAppRef.current[locationConfig.id] = initializeApp(locationConfig.firebaseConfig, locationConfig.id);
                    console.log('Firebase app initialized for:', locationConfig.id);
                } else {
                    firebaseAppRef.current[locationConfig.id] = existingApp;
                    console.log('Firebase app reused for:', locationConfig.id);
                }
            } catch (error) {
                console.error('Error initializing Firebase app:', error);
                throw error;
            }
        }
        return firebaseAppRef.current[locationConfig.id];
    };

    useEffect(() => {
        if (!selectedLocation) {
            console.error('No location selected');
            setHistoricalData([createFallbackData()]);
            setSelectedData(createFallbackData());
            setLoading(false);
            return;
        }

        setLoading(true);
        const locationConfig = LOCATION_CONFIGS[selectedLocation.id];
        if (!locationConfig) {
            console.error('Location config not found for ID:', selectedLocation.id);
            setHistoricalData([createFallbackData()]);
            setSelectedData(createFallbackData());
            setLoading(false);
            return;
        }

        try {
            const firebaseApp = getFirebaseApp(locationConfig);
            const db = getDatabase(firebaseApp);
            const today = new Date().toISOString().split('T')[0];
            const fullDataPath = `Testing/${locationConfig.testingPath}/${today}`;
            console.log('Fetching data path for', locationConfig.name, ':', fullDataPath);
            const dataRef = ref(db, fullDataPath);

            const dataListener = onValue(
                dataRef,
                (snapshot) => {
                    console.log('Raw snapshot:', snapshot.val());
                    if (snapshot.exists()) {
                        const raw = snapshot.val();
                        const timestamps = Object.keys(raw);
                        if (timestamps.length > 0) {
                            const formattedData = timestamps
                                .map((timestamp) => {
                                    const data = raw[timestamp] || {};
                                    return {
                                        time: timestamp,
                                        pc01:
                                            data[timeFrame === 'Hourly' ? 'Hourly_mean_PC01' : 'Daily_mean_PC01'] !== undefined
                                                ? Number(data[timeFrame === 'Hourly' ? 'Hourly_mean_PC01' : 'Daily_mean_PC01']).toFixed(2)
                                                : '0.00',
                                        pm25:
                                            data[timeFrame === 'Hourly' ? 'Hourly_mean_PM25' : 'Daily_mean_PM25'] !== undefined
                                                ? Number(data[timeFrame === 'Hourly' ? 'Hourly_mean_PM25' : 'Daily_mean_PM25']).toFixed(2)
                                                : '0.00',
                                        pm10:
                                            data[timeFrame === 'Hourly' ? 'Hourly_mean_PM10' : 'Daily_mean_PM10'] !== undefined
                                                ? Number(data[timeFrame === 'Hourly' ? 'Hourly_mean_PM10' : 'Daily_mean_PM10']).toFixed(2)
                                                : '0.00',
                                    };
                                })
                                .sort((a, b) => {
                                    const aTime = new Date(`${today} ${a.time}`).getTime();
                                    const bTime = new Date(`${today} ${b.time}`).getTime();
                                    return aTime - bTime;
                                });

                            setHistoricalData(formattedData);
                            setSelectedData(formattedData[formattedData.length - 1] || createFallbackData());
                        } else {
                            console.log('No timestamps found for', locationConfig.name);
                            setHistoricalData([createFallbackData()]);
                            setSelectedData(createFallbackData());
                        }
                    } else {
                        console.log('No data available at path for', locationConfig.name, ':', fullDataPath);
                        setHistoricalData([createFallbackData()]);
                        setSelectedData(createFallbackData());
                    }
                    setLoading(false);
                },
                (error) => {
                    console.error('Firebase error:', error.code, error.message);
                    setHistoricalData([createFallbackData()]);
                    setSelectedData(createFallbackData());
                    setLoading(false);
                }
            );

            return () => {
                dataListener();
            };
        } catch (err) {
            console.error('Initialization error for', locationConfig.name, ':', err);
            setHistoricalData([createFallbackData()]);
            setSelectedData(createFallbackData());
            setLoading(false);
        }
    }, [selectedLocation, timeFrame]);

    const currentDate = new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Bangkok',
    });

    const selectedStatus = getSelectedStatus(selectedData, pmType);

    return (
        <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
            <Header selectedLocation={selectedLocation} onClick={handleBackToHome} />
            <main className="flex-1 w-full max-w-none p-4">
                <div className="bg-white rounded-lg shadow-sm p-6 w-full" style={{ backgroundColor: '#F0F0F0' }}>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Air Quality History</h2>
                        <p className="text-gray-600 text-sm">-ข้อมูลย้อนหลังของ {selectedLocation.name}</p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="bg-white rounded-lg p-3 shadow-sm w-full md:w-1/3 flex items-center justify-between border border-gray-200">
                                <div className="text-xs text-gray-600">{selectedData ? selectedData.time : currentDate}</div>
                                <div className="text-xl font-bold text-gray-900">
                                    {loading ? 'Loading...' : selectedData ? selectedData[pmType === 'PC0.1' ? 'pc01' : pmType === 'PM2.5' ? 'pm25' : 'pm10'] : '0.00'}{' '}
                                    {pmType === 'PC0.1' ? 'PNC' : 'μg/m³'}
                                </div>
                                <div className="px-3 py-1 rounded-full text-white font-semibold" style={{ backgroundColor: selectedStatus.color }}>
                                    {loading ? 'Loading...' : selectedStatus.status}
                                </div>
                            </div>
                            <div className="flex-1 flex justify-end space-x-2">
                                <select
                                    value={timeFrame}
                                    onChange={(e) => setTimeFrame(e.target.value)}
                                    className="px-4 py-2 rounded-lg font-semibold text-white focus:outline-none"
                                    style={{ backgroundColor: '#2DC653' }}
                                >
                                    <option value="Daily">Daily</option>
                                    <option value="Hourly">Hourly</option>
                                </select>
                                <select
                                    value={pmType}
                                    onChange={(e) => setPmType(e.target.value)}
                                    className="px-4 py-2 rounded-lg font-semibold text-white focus:outline-none"
                                    style={{ backgroundColor: '#2DC653' }}
                                >
                                    <option value="PC0.1">PC0.1</option>
                                    <option value="PM2.5">PM2.5</option>
                                    <option value="PM10">PM10</option>
                                </select>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm" style={{ height: '500px' }}>
                            {loading ? (
                                <div className="text-center p-4">Loading data...</div>
                            ) : (
                                <EnhancedMultiBarChart data={historicalData} pmType={pmType} getBarColor={getBarColor} onBarSelect={setSelectedData} />
                            )}
                        </div>
                    </div>
                    <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold mb-3 text-gray-800">Air Quality Standards</h3>
                        <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2DC653' }}></div>
                                <div>
                                    <div className="text-sm font-medium">Good</div>
                                    <div className="text-xs text-gray-500">
                                        {pmType === 'PC0.1' ? `0-${PM_THRESHOLDS.HourlyMeanPC01.Good} PNC` : pmType === 'PM10' ? `0-${PM_THRESHOLDS.PM10.Good} μg/m³` : `0-${PM_THRESHOLDS.PM.Good} μg/m³`}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FECF3E' }}></div>
                                <div>
                                    <div className="text-sm font-medium">Warning</div>
                                    <div className="text-xs text-gray-500">
                                        {pmType === 'PC0.1'
                                            ? `${PM_THRESHOLDS.HourlyMeanPC01.Good + 1}-${PM_THRESHOLDS.HourlyMeanPC01.Warning} PNC`
                                            : pmType === 'PM10'
                                                ? `${PM_THRESHOLDS.PM10.Good + 0.1}-${PM_THRESHOLDS.PM10.Warning} μg/m³`
                                                : `${PM_THRESHOLDS.PM.Good + 0.1}-${PM_THRESHOLDS.PM.Warning} μg/m³`}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FF9500' }}></div>
                                <div>
                                    <div className="text-sm font-medium">Affects health</div>
                                    <div className="text-xs text-gray-500">
                                        {pmType === 'PC0.1'
                                            ? `${PM_THRESHOLDS.HourlyMeanPC01.Warning + 1}-${PM_THRESHOLDS.HourlyMeanPC01['Affects health']} PNC`
                                            : pmType === 'PM10'
                                                ? `${PM_THRESHOLDS.PM10.Warning + 0.1}-${PM_THRESHOLDS.PM10['Affects health']} μg/m³`
                                                : `${PM_THRESHOLDS.PM.Warning + 0.1}-${PM_THRESHOLDS.PM['Affects health']} μg/m³`}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#D02224' }}></div>
                                <div>
                                    <div className="text-sm font-medium">Danger</div>
                                    <div className="text-xs text-gray-500">
                                        {pmType === 'PC0.1'
                                            ? `${PM_THRESHOLDS.HourlyMeanPC01['Affects health'] + 1}-${PM_THRESHOLDS.HourlyMeanPC01.Danger} PNC`
                                            : pmType === 'PM10'
                                                ? `${PM_THRESHOLDS.PM10['Affects health'] + 0.1}-${PM_THRESHOLDS.PM10.Danger} μg/m³`
                                                : `${PM_THRESHOLDS.PM['Affects health'] + 0.1}-${PM_THRESHOLDS.PM.Danger} μg/m³`}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#973AA8' }}></div>
                                <div>
                                    <div className="text-sm font-medium">Hazardous</div>
                                    <div className="text-xs text-gray-500">
                                        {pmType === 'PC0.1'
                                            ? `${PM_THRESHOLDS.HourlyMeanPC01.Danger + 1}+ PNC`
                                            : pmType === 'PM10'
                                                ? `${PM_THRESHOLDS.PM10.Danger + 0.1}+ μg/m³`
                                                : `${PM_THRESHOLDS.PM.Danger + 0.1}+ μg/m³`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}