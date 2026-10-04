'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { MapPin, Calendar, Clock, Ticket, Luggage, Trash2, Loader2, ChevronDown } from 'lucide-react'; 
import { Trip, TripStatus } from '../../types'; 
import { TimelineTab } from './TimelineTab';
import { PackingTab } from './PackingTab';
import { SeatArchiveTab } from './SeatArchiveTab';
import { deleteTrip, updateTrip } from '../../lib/apiClient'; 

type TabType = 'timeline' | 'packing' | 'seat';

export const TripDetailLayout = ({ trip }: { trip: Trip }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<TripStatus>(trip.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);


   const handleDelete = async () => {
    // ネイティブの確認ダイアログでワンクッション置く
    const confirmed = window.confirm('この遠征記録を削除しますか？\n※この操作は取り消せません。');
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deleteTrip(trip.id);
      router.push('/');
    } catch (error) {
      console.error(error);
      alert('削除に失敗しました。');
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: TripStatus) => {
    setIsUpdatingStatus(true);
    setCurrentStatus(newStatus);
    
    try {
      const updatedTrip = { ...trip, status: newStatus };
      await updateTrip(trip.id, updatedTrip);
    } catch (error) {
      console.error(error);
      alert('ステータスの更新に失敗しました。');
      setCurrentStatus(trip.status);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-5xl mx-auto w-full bg-white shadow-sm pb-16">
      {/* ヘッダー部分 */}
      <header className="bg-white px-4 py-6 shadow-sm z-10 relative">
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col items-start gap-2 pr-10">
            <h1 className="text-xl font-bold text-gray-900 leading-tight">{trip.title}</h1>
            
            {/* ★追加: ステータス切り替えUI（セレクトボックス方式） */}
            <div className="relative inline-block">
              <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value as TripStatus)}
                disabled={isUpdatingStatus}
                className={`appearance-none text-xs font-bold pl-3 pr-8 py-1.5 rounded-full border outline-none cursor-pointer transition-colors disabled:opacity-50
                  ${currentStatus === 'completed' ? 'bg-gray-100 border-gray-300 text-gray-600' : 
                    currentStatus === 'ongoing' ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                    'bg-green-50 border-green-200 text-green-700'}`}
              >
                <option value="planning">● 予定</option>
                <option value="ongoing">● 進行中</option>
                <option value="completed">● 参戦済み</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                {isUpdatingStatus ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </div>
            </div>
          </div>
          
          {/* 追加: 削除ボタン */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="absolute top-5 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
            aria-label="削除"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

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

// タブボタン用サブコンポーネント (既存のまま)
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