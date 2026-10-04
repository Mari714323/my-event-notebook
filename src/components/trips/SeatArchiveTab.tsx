'use client';


import React, { useState } from 'react';
import { Trip, SeatArchive, StandOrArena } from '../../types';
import { Ticket, Calendar, MapPin, Binoculars, Ear, MessageSquare, Edit2, Save, X, Loader2, Plus, Camera, Image as ImageIcon, Trash2 } from 'lucide-react';
import { updateTrip, getUploadUrl, uploadImageToS3 } from '../../lib/apiClient';

export const SeatArchiveTab = ({ trip }: { trip: Trip }) => {
  const [currentTrip, setCurrentTrip] = useState(trip);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<SeatArchive>>({});

  // アップロード中のアーカイブIDを保持する状態
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const archives = currentTrip.seatArchives || [];

  const startEditing = (archive: SeatArchive) => {
    setEditingId(archive.id);
    setEditForm({
      ...archive,
      seat: { ...archive.seat },
      photos: archive.photos ? [...archive.photos] : [] // 写真の配列もコピー
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
        photos: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedArchives = [...archives, newArchive];
      const updatedTrip = { ...currentTrip, seatArchives: updatedArchives };
      
      await updateTrip(currentTrip.id, updatedTrip);
      setCurrentTrip(updatedTrip);
      
      setEditingId(newArchive.id);
      setEditForm(newArchive);
    } catch (error) {
      console.error(error);
      alert('新規記録の追加に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  // S3への画像直接アップロード処理
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, archiveId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(archiveId);
    try {
      // 1. API GatewayからPresigned URLを取得
      const { uploadUrl } = await getUploadUrl(currentTrip.id, file.name, file.type);
      
      // 2. 取得したURLへS3に直接バイナリデータをPUT
      await uploadImageToS3(uploadUrl, file);
      
      // 3. 成功したらクエリパラメータを除いた純粋なオブジェクトURLを取得
      const imageUrl = uploadUrl.split('?')[0];

      // 4. 編集中のフォームに画像URLを追加
      const currentPhotos = editForm.photos || [];
      setEditForm({
        ...editForm,
        photos: [...currentPhotos, imageUrl],
      });
    } catch (error) {
      console.error(error);
      alert('画像のアップロードに失敗しました。');
    } finally {
      setUploadingId(null);
      // 同じファイルを連続で選択できるようにinputをリセット
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {archives.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="mb-4 text-sm text-gray-500">座席・鑑賞記録がまだありません</p>
          <button
            type="button"
            onClick={handleAddNewArchive}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            最初の記録を追加する
          </button>
        </div>
      ) : (
        <>
          {archives.map((archive) => {
            const isEditing = editingId === archive.id;
            const seat = isEditing ? editForm.seat ?? archive.seat : archive.seat;
            const fieldClass = 'w-full rounded border border-gray-300 p-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500';

            return (
              <article key={archive.id} className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <header className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {isEditing ? (
                      <>
                        <input
                          type="date"
                          value={editForm.performanceDate ?? ''}
                          onChange={(e) => setEditForm({ ...editForm, performanceDate: e.target.value })}
                          className="rounded border border-gray-300 p-1 text-sm"
                        />
                        <input
                          type="text"
                          value={editForm.performanceName ?? ''}
                          onChange={(e) => setEditForm({ ...editForm, performanceName: e.target.value })}
                          aria-label="公演名"
                          className="w-32 rounded border border-gray-300 p-1 text-sm"
                        />
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-bold text-gray-800">{archive.performanceDate}</span>
                        {archive.performanceName && <span className="text-xs text-gray-500">{archive.performanceName}</span>}
                      </>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSave(archive.id)}
                        disabled={isSaving}
                        className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        保存
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-600"
                      >
                        <X className="h-3.5 w-3.5" />
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditing(archive)}
                      className="flex items-center gap-1 text-xs font-bold text-gray-500 transition-colors hover:text-blue-600"
                    >
                      <Edit2 className="h-3.5 w-3.5" />編集
                    </button>
                  )}
                </header>

                <section>
                  <h3 className="mb-2 text-xs font-bold text-gray-500">座席位置</h3>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                      <label className="text-xs text-gray-500">席種
                        <select value={seat.type} onChange={(e) => setEditForm({ ...editForm, seat: { ...seat, type: e.target.value as StandOrArena } })} className={fieldClass}>
                          <option value="arena">アリーナ</option><option value="stand">スタンド</option><option value="balcony">バルコニー</option><option value="floor">フロア</option><option value="other">その他</option>
                        </select>
                      </label>
                      <label className="text-xs text-gray-500">ゲート/扉<input value={seat.gate ?? ''} onChange={(e) => setEditForm({ ...editForm, seat: { ...seat, gate: e.target.value } })} className={fieldClass} /></label>
                      <label className="text-xs text-gray-500">ブロック<input value={seat.blockOrArea ?? ''} onChange={(e) => setEditForm({ ...editForm, seat: { ...seat, blockOrArea: e.target.value } })} className={fieldClass} /></label>
                      <label className="text-xs text-gray-500">列<input value={seat.row ?? ''} onChange={(e) => setEditForm({ ...editForm, seat: { ...seat, row: e.target.value } })} className={fieldClass} /></label>
                      <label className="text-xs text-gray-500">番号<input value={seat.number ?? ''} onChange={(e) => setEditForm({ ...editForm, seat: { ...seat, number: e.target.value } })} className={fieldClass} /></label>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700">
                      {seat.type === 'arena' ? 'アリーナ' : seat.type === 'stand' ? 'スタンド' : seat.type === 'balcony' ? 'バルコニー' : seat.type === 'floor' ? 'フロア' : 'その他'}
                      {[seat.gate, seat.blockOrArea, seat.row, seat.number].filter(Boolean).join(' / ') && ` · ${[seat.gate, seat.blockOrArea, seat.row, seat.number].filter(Boolean).join(' / ')}`}
                    </p>
                  )}
                </section>

                <section className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-bold text-gray-500">双眼鏡倍率
                    {isEditing ? <input value={editForm.binocularMagnification ?? ''} onChange={(e) => setEditForm({ ...editForm, binocularMagnification: e.target.value })} className={fieldClass} /> : <p className="mt-1 text-sm font-normal text-gray-700">{archive.binocularMagnification || '記録なし'}</p>}
                  </label>
                  <div className="text-xs font-bold text-gray-500">ライブ用耳栓
                    {isEditing ? (
                      <label className="mt-1 flex items-center gap-2 text-sm font-normal text-gray-700"><input type="checkbox" checked={editForm.usedEarplugs ?? false} onChange={(e) => setEditForm({ ...editForm, usedEarplugs: e.target.checked })} className="h-4 w-4 rounded text-blue-600" />使用した</label>
                    ) : <p className="mt-1 text-sm font-normal text-gray-700">{archive.usedEarplugs ? '使用した' : '使用なし'}</p>}
                  </div>
                </section>

                <section>
                  <h3 className="mb-2 text-xs font-bold text-gray-500">実用メモ（見え方・退場動線・音響）</h3>
                  {isEditing ? (
                    <textarea value={editForm.memo ?? ''} onChange={(e) => setEditForm({ ...editForm, memo: e.target.value })} rows={3} className={`${fieldClass} resize-none`} />
                  ) : archive.memo ? (
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3.5"><p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{archive.memo}</p></div>
                  ) : <p className="text-sm text-gray-400">メモはありません</p>}
                </section>

                <section>
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-500"><Camera className="h-3.5 w-3.5" />座席・見え方写真</h3>
                  {isEditing ? (
                    <div className="space-y-3">
                      {!!editForm.photos?.length && <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {editForm.photos.map((photo, index) => <div key={`${photo}-${index}`} className="group relative aspect-video overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                          <img src={photo} alt={`座席写真 ${index + 1}`} className="h-full w-full object-cover" />
                          <button type="button" aria-label="写真を削除" onClick={() => setEditForm({ ...editForm, photos: editForm.photos?.filter((_, i) => i !== index) })} className="absolute right-1.5 top-1.5 rounded-full bg-red-500 p-1.5 text-white opacity-0 shadow-sm transition-opacity hover:bg-red-600 group-hover:opacity-100"><Trash2 className="h-3 w-3" /></button>
                        </div>)}
                      </div>}
                      <div className="relative">
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, archive.id)} disabled={uploadingId === archive.id} className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed" />
                        <div className={`flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${uploadingId === archive.id ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-gray-100'}`}>
                          {uploadingId === archive.id ? <><Loader2 className="mb-2 h-6 w-6 animate-spin text-blue-500" /><p className="text-sm font-bold text-blue-600">アップロード中...</p></> : <><ImageIcon className="mb-2 h-6 w-6 text-gray-400" /><p className="text-sm font-bold text-gray-600">タップまたはクリックして写真を追加</p><p className="mt-1 text-xs text-gray-400">JPEG, PNG（10MBまで推奨）</p></>}
                        </div>
                      </div>
                    </div>
                  ) : archive.photos?.length ? (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{archive.photos.map((photo, index) => <div key={`${photo}-${index}`} className="aspect-video overflow-hidden rounded-lg border border-gray-200 bg-gray-100"><img src={photo} alt={`座席写真 ${index + 1}`} className="h-full w-full cursor-pointer object-cover transition-transform duration-300 hover:scale-105" /></div>)}</div>
                  ) : <p className="text-sm text-gray-400">登録されている写真はありません</p>}
                </section>
              </article>
            );
          })}

          <button
            type="button"
            onClick={handleAddNewArchive}
            disabled={isSaving || editingId !== null}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white py-3.5 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50"
          >
            {isSaving && !editingId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            さらに公演記録を追加する
          </button>
        </>
      )}
    </div>
  );
};