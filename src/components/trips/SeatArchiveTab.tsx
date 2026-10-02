'use client';

import React, { useState } from 'react';
import { Trip, SeatArchive, StandOrArena } from '../../types';
import { Ticket, Calendar, MapPin, Binoculars, Ear, MessageSquare, Edit2, Save, X, Loader2, Plus } from 'lucide-react'; // Plusを追加
import { updateTrip } from '../../lib/apiClient';

export const SeatArchiveTab = ({ trip }: { trip: Trip }) => {
  const [currentTrip, setCurrentTrip] = useState<Trip>(trip);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<SeatArchive>>({});

  const archives = currentTrip.seatArchives || [];

  const startEditing = (archive: SeatArchive) => {
    setEditingId(archive.id);
    setEditForm({
      ...archive,
      seat: { ...archive.seat }
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id: string) => {
    if (!editForm) return;
    setIsSaving(true);
    try {
      const updatedArchives = archives.map(arch => 
        arch.id === id ? { ...arch, ...editForm } as SeatArchive : arch
      );
      const updatedTrip = { ...currentTrip, seatArchives: updatedArchives };
      await updateTrip(currentTrip.id, updatedTrip);
      setCurrentTrip(updatedTrip);
      setEditingId(null);
    } catch (error) {
      console.error(error);
      alert('保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  // 追加: 新規記録を作成する処理
  const handleAddNewArchive = async () => {
    setIsSaving(true);
    try {
      const newArchive: SeatArchive = {
        id: `seat-${Date.now()}`,
        tripId: currentTrip.id,
        venueId: currentTrip.primaryVenueId,
        performanceDate: currentTrip.startDate,
        performanceName: '本公演',
        seat: { type: 'other' },
        usedEarplugs: false,
        memo: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedArchives = [...archives, newArchive];
      const updatedTrip = { ...currentTrip, seatArchives: updatedArchives };
      
      await updateTrip(currentTrip.id, updatedTrip);
      setCurrentTrip(updatedTrip);
      
      // 作成後、すぐに編集モードを開く
      setEditingId(newArchive.id);
      setEditForm(newArchive);
    } catch (error) {
      console.error(error);
      alert('新規記録の追加に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-5 pb-20 space-y-6">
      {archives.length === 0 ? (
        <div className="p-10 flex flex-col items-center justify-center text-gray-400 space-y-3">
          <Ticket className="w-12 h-12 text-gray-200" />
          <p className="text-sm font-medium">座席・鑑賞記録がまだありません</p>
          <button 
            onClick={handleAddNewArchive}
            disabled={isSaving}
            className="mt-2 px-5 py-2.5 bg-blue-50 text-blue-600 font-bold text-sm rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            最初の記録を追加する
          </button>
        </div>
      ) : (
        <>
          {archives.map((archive) => {
            const isEditing = editingId === archive.id;

            return (
              <div key={archive.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* ヘッダー部分 */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    {isEditing ? (
                       <input type="date" value={editForm.performanceDate || ''} 
                         onChange={(e) => setEditForm({ ...editForm, performanceDate: e.target.value })}
                         className="text-sm border border-gray-300 rounded p-1 outline-none focus:ring-1 focus:ring-blue-500" />
                    ) : (
                      <span>{archive.performanceDate}</span>
                    )}
                    
                    {isEditing ? (
                       <input type="text" placeholder="例: Day 1" value={editForm.performanceName || ''} 
                         onChange={(e) => setEditForm({ ...editForm, performanceName: e.target.value })}
                         className="text-[11px] border border-gray-300 rounded p-1 outline-none w-20" />
                    ) : (
                      archive.performanceName && (
                        <span className="bg-white px-2 py-0.5 rounded text-[11px] border border-gray-200 text-gray-600">
                          {archive.performanceName}
                        </span>
                      )
                    )}
                  </div>
                  
                  {/* 編集・保存ボタン */}
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button onClick={cancelEditing} disabled={isSaving} className="p-1.5 text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded-md">
                        <X className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleSave(archive.id)} disabled={isSaving} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-700 disabled:opacity-50">
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        保存
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => startEditing(archive)} className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" /> 編集
                    </button>
                  )}
                </div>

                <div className="p-4 space-y-5">
                  {/* === 座席位置ブロック === */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2">
                      <MapPin className="w-3.5 h-3.5" /> 座席位置
                    </div>
                    
                    {isEditing ? (
                      /* 編集モード：座席フォーム */
                      <div className="bg-blue-50/30 border border-blue-100 rounded-lg p-3 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1">席種</label>
                            <select 
                              value={editForm.seat?.type || 'other'}
                              onChange={(e) => setEditForm({ ...editForm, seat: { ...editForm.seat!, type: e.target.value as StandOrArena } })}
                              className="w-full text-sm border border-gray-300 rounded p-1.5 bg-white outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="arena">アリーナ</option>
                              <option value="stand">スタンド</option>
                              <option value="balcony">バルコニー</option>
                              <option value="floor">フロア</option>
                              <option value="other">その他</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1">ゲート/扉</label>
                            <input type="text" placeholder="例: 3番ゲート" 
                              value={editForm.seat?.gate || ''}
                              onChange={(e) => setEditForm({ ...editForm, seat: { ...editForm.seat!, gate: e.target.value } })}
                              className="w-full text-sm border border-gray-300 rounded p-1.5 outline-none focus:ring-1 focus:ring-blue-500" />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1">ブロック</label>
                            <input type="text" placeholder="例: A2" 
                              value={editForm.seat?.blockOrArea || ''}
                              onChange={(e) => setEditForm({ ...editForm, seat: { ...editForm.seat!, blockOrArea: e.target.value } })}
                              className="w-full text-sm border border-gray-300 rounded p-1.5 outline-none focus:ring-1 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1">列</label>
                            <input type="text" placeholder="例: 12列" 
                              value={editForm.seat?.row || ''}
                              onChange={(e) => setEditForm({ ...editForm, seat: { ...editForm.seat!, row: e.target.value } })}
                              className="w-full text-sm border border-gray-300 rounded p-1.5 outline-none focus:ring-1 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1">番号</label>
                            <input type="text" placeholder="例: 34番" 
                              value={editForm.seat?.number || ''}
                              onChange={(e) => setEditForm({ ...editForm, seat: { ...editForm.seat!, number: e.target.value } })}
                              className="w-full text-sm border border-gray-300 rounded p-1.5 outline-none focus:ring-1 focus:ring-blue-500" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* 表示モード：座席 */
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
                    )}
                  </div>

                  {/* === 鑑賞環境スペック === */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 mb-1">
                        <Binoculars className="w-3.5 h-3.5" /> 双眼鏡倍率
                      </div>
                      {isEditing ? (
                        <input type="text" placeholder="例: 8倍推奨" 
                          value={editForm.binocularMagnification || ''}
                          onChange={(e) => setEditForm({ ...editForm, binocularMagnification: e.target.value })}
                          className="w-full text-sm border border-gray-300 rounded p-1.5 outline-none focus:ring-1 focus:ring-blue-500" />
                      ) : (
                        <p className="text-sm font-bold text-gray-800">{archive.binocularMagnification || '記録なし'}</p>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 mb-1">
                        <Ear className="w-3.5 h-3.5" /> ライブ用耳栓
                      </div>
                      {isEditing ? (
                        <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                          <input type="checkbox" 
                            checked={editForm.usedEarplugs || false}
                            onChange={(e) => setEditForm({ ...editForm, usedEarplugs: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                          <span className="text-sm font-bold text-gray-700">使用した</span>
                        </label>
                      ) : (
                        <p className="text-sm font-bold">
                          {archive.usedEarplugs ? (
                            <span className="text-emerald-600">使用した</span>
                          ) : (
                            <span className="text-gray-400">使用なし</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* === 実用メモ === */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2">
                      <MessageSquare className="w-3.5 h-3.5" /> 実用メモ（見え方・退場動線・音響）
                    </div>
                    {isEditing ? (
                      <textarea 
                        rows={4}
                        placeholder="見え方や音響、次回の教訓などをメモ..."
                        value={editForm.memo || ''}
                        onChange={(e) => setEditForm({ ...editForm, memo: e.target.value })}
                        className="w-full text-sm border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-blue-500 resize-none bg-white"
                      />
                    ) : (
                      archive.memo ? (
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3.5">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {archive.memo}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">メモはありません</p>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* 新規追加ボタン（2件目以降） */}
          <button 
            onClick={handleAddNewArchive}
            disabled={isSaving || editingId !== null}
            className="w-full bg-white border border-dashed border-gray-300 text-gray-500 font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-gray-50 hover:text-blue-600 transition-colors disabled:opacity-50"
          >
            {isSaving && !editingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            さらに公演記録を追加する
          </button>
        </>
      )}
    </div>
  );
};