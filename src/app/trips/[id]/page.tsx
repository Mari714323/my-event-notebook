import React from 'react';
import { MOCK_TRIPS } from '../../../mocks/mockData';
import { TripDetailLayout } from '../../../components/trips/TripDetailLayout';

// ★最新のNext.jsに合わせて async を追加し、params を Promise 型に変更しました
export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  
  // ★ここでURLのパラメータ（id）を取り出します
  const resolvedParams = await params;
  
  const trip = MOCK_TRIPS.find(t => t.id === resolvedParams.id);

  if (!trip) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        遠征データが見つかりませんでした。
      </div>
    );
  }

  return <TripDetailLayout trip={trip} />;
}