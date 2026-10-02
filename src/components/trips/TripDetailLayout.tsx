'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // 追加
import { MapPin, Calendar, Clock, Ticket, Luggage, Trash2 } from 'lucide-react'; // Trash2 を追加
import { Trip } from '../../types';
import { TimelineTab } from './TimelineTab';
import { PackingTab } from './PackingTab';
import { SeatArchiveTab } from './SeatArchiveTab';
import { deleteTrip } from '../../lib/apiClient'; // 追加

type TabType = 'timeline' | 'packing' | 'seat';

export const TripDetailLayout = ({ trip }: { trip: Trip }) => {
  const router = useRouter(); // 追加
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [isDeleting, setIsDeleting] = useState(false); // 追加

  // 追加: 削除処理ハンドラー
  const handleDelete = async () => {
    // ネイティブの確認ダイアログでワンクッション置く
    const confirmed = window.confirm('この遠征記録を削除しますか？\n※この操作は取り消せません。');
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deleteTrip(trip.id);
      // 削除成功後はホーム画面へ戻る
      router.push('/');
    } catch (error) {
      console.error(error);
      alert('削除に失敗しました。');
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-5xl mx-auto w-full bg-white shadow-sm pb-16">
      {/* ヘッダー部分 */}
      <header className="bg-white px-4 py-6 shadow-sm z-10 relative">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-xl font-bold text-gray-900 pr-10">{trip.title}</h1>
          
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