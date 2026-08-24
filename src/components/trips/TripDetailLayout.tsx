'use client';

import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Ticket, Luggage } from 'lucide-react';
import { Trip } from '../../types';
import { TimelineTab } from './TimelineTab';
import { PackingTab } from './PackingTab';
import { SeatArchiveTab } from './SeatArchiveTab';

type TabType = 'timeline' | 'packing' | 'seat';

export const TripDetailLayout = ({ trip }: { trip: Trip }) => {
  const [activeTab, setActiveTab] = useState<TabType>('timeline');

  return (
    <div className="min-h-screen flex flex-col max-w-5xl mx-auto w-full bg-white shadow-sm pb-16">
      {/* ヘッダー部分 */}
      <header className="bg-white px-4 py-6 shadow-sm z-10">
        <h1 className="text-xl font-bold text-gray-900 mb-2">{trip.title}</h1>
        <div className="flex flex-col gap-1 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>{trip.startDate} {trip.startDate !== trip.endDate && `〜 ${trip.endDate}`}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>{trip.primaryVenueId === 'venue-osaka-jo' ? '大阪城ホール' : '横浜アリーナ'}</span>
          </div>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="flex bg-white border-b border-gray-200">
        <TabButton 
          isActive={activeTab === 'timeline'} 
          onClick={() => setActiveTab('timeline')}
          icon={<Clock className="w-4 h-4" />}
          label="行程"
        />
        <TabButton 
          isActive={activeTab === 'packing'} 
          onClick={() => setActiveTab('packing')}
          icon={<Luggage className="w-4 h-4" />}
          label="持ち物"
        />
        <TabButton 
          isActive={activeTab === 'seat'} 
          onClick={() => setActiveTab('seat')}
          icon={<Ticket className="w-4 h-4" />}
          label="座席・記録"
        />
      </div>

      {/* タブコンテンツ */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {activeTab === 'timeline' && <TimelineTab trip={trip} />}
        {activeTab === 'packing' && <PackingTab trip={trip} />}
        {activeTab === 'seat' && <SeatArchiveTab trip={trip} />}
      </main>
    </div>
  );
};

// タブボタン用サブコンポーネント
const TabButton = ({ isActive, onClick, icon, label }: { isActive: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium border-b-2 transition-colors
      ${isActive 
        ? 'border-blue-600 text-blue-600' 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
  >
    {icon}
    {label}
  </button>
);