'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_TRIPS } from '../mocks/mockData';
import { Trip } from '../types';
import { Calendar, MapPin, Plus, LogOut } from 'lucide-react';

// ★ Amplify UIコンポーネントとスタイルのインポート
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('past'); // モックデータが過去のものなので初期値はpast

  // 遠征をステータスで分類
  const upcomingTrips = MOCK_TRIPS.filter(trip => trip.status === 'planning' || trip.status === 'ongoing');
  const pastTrips = MOCK_TRIPS.filter(trip => trip.status === 'completed');

  const displayTrips = activeTab === 'upcoming' ? upcomingTrips : pastTrips;

  return (
    // ★ Authenticatorで囲むことで、未ログイン時はログイン画面が自動表示される
    <Authenticator>
      {({ signOut, user }) => (
        <div className="max-w-5xl mx-auto w-full min-h-screen bg-gray-50 pb-24">
          {/* アプリヘッダー */}
          <header className="bg-white px-5 pt-8 pb-4 shadow-sm z-10 sticky top-0">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">マイ遠征手帳</h1>
                <p className="text-xs font-bold text-gray-500 mt-1">完全プライベート・参戦記録</p>
              </div>
              {/* ★ サインアウトボタンの追加 */}
              <button 
                onClick={signOut}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="サインアウト"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
            
            {/* タブ切り替えUI */}
            <div className="flex mt-6 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                  activeTab === 'upcoming' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                予定 ({upcomingTrips.length})
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                  activeTab === 'past' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                履歴 ({pastTrips.length})
              </button>
            </div>
          </header>

          {/* 遠征リスト（PCではグリッド表示） */}
          <main className="p-5">
            {displayTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayTrips.map(trip => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-200 border-dashed mt-4">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-600">
                  {activeTab === 'upcoming' ? 'これからの遠征予定はありません' : '過去の遠征記録はありません'}
                </p>
                <p className="text-xs text-gray-400 mt-1">右下の＋ボタンから追加できます</p>
              </div>
            )}
          </main>

          {/* 新規作成フローティングボタン (右下配置) */}
          <button 
            className="fixed bottom-20 right-5 md:right-8 lg:right-[calc(50%-480px)] w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all z-40"
            aria-label="新規遠征作成"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>
      )}
    </Authenticator>
  );
}

// 遠征リスト用カードコンポーネント
const TripCard = ({ trip }: { trip: Trip }) => (
  <Link href={`/trips/${trip.id}`} className="block h-full">
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all h-full flex flex-col group">
      <h3 className="font-bold text-gray-900 mb-4 leading-snug group-hover:text-blue-600 transition-colors">
        {trip.title}
      </h3>
      <div className="mt-auto space-y-2 text-xs font-bold text-gray-500">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span>{trip.startDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-500" />
          <span>{trip.primaryVenueId === 'venue-osaka-jo' ? '大阪城ホール' : '横浜アリーナ'}</span>
        </div>
      </div>
    </div>
  </Link>
);