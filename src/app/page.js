'use client'
// src/app/page.js
import { useState } from 'react';
import { Header, MonitoringPanel, MapSection, HistoryData, Footer } from '../components/MonitoringInterface';
import { ClientWrapper } from '../components/ClientWrapper';

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelect = (locationData) => {
    console.log('Location selected in page.js:', locationData);
    setSelectedLocation(locationData);
  };

  const handleLocationClear = () => {
    setSelectedLocation(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header selectedLocation={selectedLocation} />
      <main className="flex flex-col lg:flex-row flex-1">
        {/* Left Panel */}
        <div className="w-full lg:w-2/5 bg-white border-r border-gray-200 flex-1">
          <div className="p-3 h-full">
            <MonitoringPanel
              selectedLocation={selectedLocation}
              onLocationClear={handleLocationClear}
            />
          </div>
        </div>
        {/* Right Panel */}
        <div className="w-full lg:w-3/5 flex flex-col flex-1">
          {/* Map Section */}
          <div className="bg-white border-b border-gray-200 flex-1">
            <MapSection
              selectedLocation={selectedLocation}
              onLocationSelect={handleLocationSelect}
            />
          </div>
          {/* History Data */}
          <div className="bg-white flex-1">
            <div className="h-full">
              <HistoryData selectedLocation={selectedLocation} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}