'use client';

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MOCK_VENUES, MOCK_TRIPS } from '../../mocks/mockData';
import { Venue } from '../../types';
import { VenueBottomSheet } from './VenueBottomSheet';

// ピンの色を出し分ける関数（Tailwindクラスを使用）
const createCustomIcon = (isUpcoming: boolean) => {
  const colorClass = isUpcoming ? 'bg-red-500' : 'bg-gray-400';
  const shadowClass = isUpcoming ? 'ring-red-500/30' : 'ring-gray-400/30';

  return L.divIcon({
    className: 'custom-leaflet-icon',
    // Tailwindでスタイリングした丸いピンを直接HTMLで描画
    html: `<div class="w-5 h-5 rounded-full border-[3px] border-white shadow-md ring-4 ${colorClass} ${shadowClass}"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10], // ピンの中心座標を合わせる
  });
};

// 該当会場に「予定（planning/ongoing）」の遠征があるかチェック
const checkIsUpcoming = (venueId: string) => {
  return MOCK_TRIPS.some(trip => 
    trip.primaryVenueId === venueId && 
    (trip.status === 'planning' || trip.status === 'ongoing')
  );
};

export const MapContent = () => {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  // 初期表示の中心座標（神奈川県・横浜駅周辺）
  const defaultCenter: [number, number] = [35.4662, 139.6227];

  return (
    <div className="w-full h-[calc(100vh-64px)] relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={11} 
        className="w-full h-full"
        zoomControl={false} // 右下のデフォズームボタンを消す（スマホ用スッキリ化）
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {Object.values(MOCK_VENUES).map((venue) => {
          const isUpcoming = checkIsUpcoming(venue.id);
          
          return (
            <Marker
              key={venue.id}
              position={[venue.location.lat, venue.location.lng]}
              icon={createCustomIcon(isUpcoming)}
              eventHandlers={{
                click: () => setSelectedVenue(venue),
              }}
            />
          );
        })}
      </MapContainer>

      {/* ボトムシートの呼び出し */}
      <VenueBottomSheet 
        venue={selectedVenue} 
        onClose={() => setSelectedVenue(null)} 
      />
    </div>
  );
};