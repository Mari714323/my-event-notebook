import React from 'react';
import { MOCK_VENUES, MOCK_TRIPS } from '../../../mocks/mockData';
import { VenueArchiveClient } from '../../../components/venues/VenueArchiveClient';

// サーバー側でデータを取得してからクライアントコンポーネントへ渡す
export default async function VenueArchivePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const venue = MOCK_VENUES[resolvedParams.id];

  if (!venue) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500 flex-col gap-4">
        <p>会場データが見つかりませんでした。</p>
      </div>
    );
  }

  // 全遠征データの中から、この会場に紐づく座席アーカイブだけを抽出
  const relatedArchives = MOCK_TRIPS
    .flatMap(trip => trip.seatArchives || [])
    .filter(archive => archive.venueId === venue.id)
    // 日付の新しい順（降順）にソートする
    .sort((a, b) => new Date(b.performanceDate).getTime() - new Date(a.performanceDate).getTime());

  return <VenueArchiveClient venue={venue} archives={relatedArchives} trips={MOCK_TRIPS} />;
}