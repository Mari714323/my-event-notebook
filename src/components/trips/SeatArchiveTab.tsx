'use client';

import React from 'react';
import { Trip } from '../../types';
import { Ticket, Calendar, MapPin, Binoculars, Ear, MessageSquare } from 'lucide-react';

export const SeatArchiveTab = ({ trip }: { trip: Trip }) => {
  const archives = trip.seatArchives || [];

  // 記録がない場合の表示
  if (archives.length === 0) {
    return (
      <div className="p-10 flex flex-col items-center justify-center text-gray-400 space-y-3">
        <Ticket className="w-12 h-12 text-gray-200" />
        <p className="text-sm font-medium">座席・鑑賞記録がまだありません</p>
      </div>
    );
  }

  return (
    <div className="p-5 pb-20 space-y-6">
      {archives.map((archive, index) => (
        <div key={archive.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* ヘッダー部分（公演日時と公演名） */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{archive.performanceDate}</span>
              {archive.performanceName && (
                <span className="bg-white px-2 py-0.5 rounded text-[11px] border border-gray-200 text-gray-600">
                  {archive.performanceName}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
          </div>

          <div className="p-4 space-y-5">
            {/* 座席位置ブロック */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2">
                <MapPin className="w-3.5 h-3.5" /> 座席位置
              </div>
              <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex flex-wrap gap-x-3 gap-y-2 items-baseline">
                <span className="font-extrabold text-lg text-blue-900 tracking-tight">
                  {archive.seat.type === 'arena' ? 'アリーナ' : 
                   archive.seat.type === 'stand' ? 'スタンド' : 
                   archive.seat.type === 'balcony' ? 'バルコニー' : 
                   archive.seat.type === 'floor' ? 'フロア' : 'その他'}
                </span>
                {archive.seat.gate && <span className="text-sm font-semibold text-gray-700">{archive.seat.gate}</span>}
                {archive.seat.blockOrArea && <span className="text-sm font-bold text-gray-800">{archive.seat.blockOrArea}</span>}
                {archive.seat.row && <span className="text-sm font-bold text-gray-800">{archive.seat.row}</span>}
                {archive.seat.number && <span className="text-sm font-bold text-gray-800">{archive.seat.number}</span>}
              </div>
            </div>

            {/* 鑑賞環境スペック（双眼鏡・耳栓） */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 mb-1">
                  <Binoculars className="w-3.5 h-3.5" /> 双眼鏡倍率
                </div>
                <p className="text-sm font-bold text-gray-800">
                  {archive.binocularMagnification || '記録なし'}
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 mb-1">
                  <Ear className="w-3.5 h-3.5" /> ライブ用耳栓
                </div>
                <p className="text-sm font-bold">
                  {archive.usedEarplugs ? (
                    <span className="text-emerald-600">使用した</span>
                  ) : (
                    <span className="text-gray-400">使用なし</span>
                  )}
                </p>
              </div>
            </div>

            {/* 実用メモ（見え方・動線・音響などすべて集約） */}
            {archive.memo && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2">
                  <MessageSquare className="w-3.5 h-3.5" /> 実用メモ（見え方・退場動線・音響）
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-3.5">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {archive.memo}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};