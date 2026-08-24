'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Venue, SeatArchive, Trip } from '../../types';
import { ArrowLeft, AlertTriangle, Calendar, MapPin, Binoculars, Ear, MessageSquare, Ticket } from 'lucide-react';

interface Props {
  venue: Venue;
  archives: SeatArchive[];
  trips: Trip[];
}

export const VenueArchiveClient = ({ venue, archives, trips }: Props) => {
  const router = useRouter();

  return (
    <div className="max-w-5xl mx-auto w-full min-h-screen bg-gray-50 pb-24">
      {/* ヘッダー（戻るボタン付き） */}
      <header className="sticky top-0 bg-white shadow-sm z-10 px-4 py-3 flex items-center gap-3">
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="戻る"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="font-bold text-gray-900 text-lg truncate">{venue.name}</h1>
      </header>

      <main className="p-5 space-y-6">
        {/* 重要メモ（施設・動線情報） */}
        {venue.facilityNotes && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-2 text-sm">
              <AlertTriangle className="w-4 h-4" /> 施設・動線メモ
            </div>
            <p className="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">
              {venue.facilityNotes}
            </p>
          </div>
        )}

        {/* アーカイブ一覧 */}
        <div>
          <h2 className="font-black text-gray-800 text-lg mb-4 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-blue-600" />
            過去の参戦記録 ({archives.length}件)
          </h2>

          {archives.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200 border-dashed">
              <p className="text-sm font-bold text-gray-500">この会場の記録はまだありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {archives.map((archive, index) => {
                // どの遠征（Trip）での記録かを探してタイトルを取得
                const trip = trips.find(t => t.id === archive.tripId);
                
                return (
                  <div key={archive.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* カードヘッダー */}
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>{archive.performanceDate}</span>
                        </div>
                        {/* 古い順や新しい順に関わらず、件数ベースでナンバリング */}
                        <span className="text-xs font-bold text-gray-400">#{archives.length - index}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 items-center mt-1">
                        {trip && (
                          <span className="text-[11px] font-bold text-gray-500 truncate max-w-[200px]">
                            {trip.title}
                          </span>
                        )}
                        {archive.performanceName && (
                          <span className="bg-white px-2 py-0.5 rounded text-[10px] border border-gray-200 text-gray-600 font-bold">
                            {archive.performanceName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-4">
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

                      {/* 鑑賞環境スペック */}
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

                      {/* 実用メモ */}
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
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};