'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Trip } from '../../../types';
import { TripDetailLayout } from '../../../components/trips/TripDetailLayout';
import { fetchTrip } from '../../../lib/apiClient';
import { Loader2 } from 'lucide-react';

export default function TripDetailPage() {
  // App Routerのクライアントコンポーネントでのパラメータ取得
  const params = useParams();
  const id = params.id as string;
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const loadTrip = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTrip(id);
        setTrip(data);
      } catch (err) {
        setError('遠征データの取得に失敗しました。');
      } finally {
        setIsLoading(false);
      }
    };

    loadTrip();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-blue-500 bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-gray-500 bg-gray-50 gap-4">
        <p className="font-bold">{error || '遠征データが見つかりませんでした'}</p>
      </div>
    );
  }

  return <TripDetailLayout trip={trip} />;
}