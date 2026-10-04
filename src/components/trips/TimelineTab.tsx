'use client';
import React, { useState } from 'react';
import { Trip, TimelineItem, TimelineCategory } from '../../types';
import { Train, ShoppingBag, Ticket, Mic2, Hotel, Utensils, Map, HelpCircle, CheckCircle2, Circle, MapPin, Plus, Edit2, Trash2, Save, Loader2 } from 'lucide-react';
import { updateTrip } from '../../lib/apiClient';

const getCategoryIcon = (category: TimelineCategory) => {
switch (category) {
case 'transport': return <Train className="w-4 h-4" />;
case 'goods': return <ShoppingBag className="w-4 h-4" />;
case 'admission': return <Ticket className="w-4 h-4" />;
case 'live': return <Mic2 className="w-4 h-4" />;
case 'lodging': return <Hotel className="w-4 h-4" />;
case 'meal': return <Utensils className="w-4 h-4" />;
case 'sightseeing': return <Map className="w-4 h-4" />;
default: return <HelpCircle className="w-4 h-4" />;
}
};
export const TimelineTab = ({ trip }: { trip: Trip }) => {
// 初期ソート（文字列の比較で時間順に並べる）
const [items, setItems] = useState<TimelineItem[]>(
[...trip.timeline].sort((a, b) => a.time.localeCompare(b.time))
);
const [editingId, setEditingId] = useState<string | null>(null);
const [editForm, setEditForm] = useState<Partial<TimelineItem>>({});
const [isUpdating, setIsUpdating] = useState(false);
// 完了状態のトグル
const toggleComplete = async (id: string, e?: React.MouseEvent) => {
if (e) e.stopPropagation();
if (editingId !== null) return; // 編集中はトグル無効
// オプティミスティックUI
const newItems = items.map(item => 
  item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
);
setItems(newItems);

try {
  await updateTrip(trip.id, { ...trip, timeline: newItems });
} catch (error) {
  console.error(error);
  alert('状態の保存に失敗しました。');
  setItems(items); // エラー時は元の状態に戻す
}


};
// 編集モード開始
const startEditing = (item: TimelineItem) => {
setEditingId(item.id);
setEditForm(item);
};
// 編集キャンセル
const cancelEditing = () => {
// 新規作成（未保存）のキャンセル時はリストから削除
if (editingId && editingId.startsWith('new-tl-')) {
setItems(items.filter(i => i.id !== editingId));
}
setEditingId(null);
setEditForm({});
};
// 保存処理（追加・更新）
const handleSave = async () => {
if (!editForm.time || !editForm.title || !editForm.category) {
alert('時間、カテゴリ、タイトルは必須項目です。');
return;
}
setIsUpdating(true);
try {
  // 編集中のアイテムを更新し、time で再ソート
  const updatedItems = items.map(item => 
    item.id === editingId ? { ...item, ...editForm } as TimelineItem : item
  ).sort((a, b) => a.time.localeCompare(b.time));

  // order プロパティを振り直し
  const sortedItems = updatedItems.map((item, index) => ({ ...item, order: index }));

  const updatedTrip = { ...trip, timeline: sortedItems };
  await updateTrip(trip.id, updatedTrip);
  
  setItems(sortedItems);
  setEditingId(null);
} catch (error) {
  console.error(error);
  alert('保存に失敗しました。');
} finally {
  setIsUpdating(false);
}


};
// 削除処理
const handleDelete = async (id: string) => {
const confirmed = window.confirm('この行程を削除しますか？');
if (!confirmed) return;
setIsUpdating(true);
try {
  const updatedItems = items.filter(item => item.id !== id);
  const updatedTrip = { ...trip, timeline: updatedItems };
  
  await updateTrip(trip.id, updatedTrip);
  setItems(updatedItems);
  setEditingId(null);
} catch (error) {
  console.error(error);
  alert('削除に失敗しました。');
} finally {
  setIsUpdating(false);
}


};
// 新規追加ボタンのハンドラー
const handleAddNew = () => {
const newId = `new-tl-${Date.now()}`;
const newItem: TimelineItem = {
id: newId,
tripId: trip.id,
time: '12:00',
category: 'other',
title: '',
isCompleted: false,
order: items.length,
};
// 一時的にリストに追加し、すぐに編集モードにする
setItems([...items, newItem]);
setEditingId(newId);
setEditForm(newItem);


};
return (
<div className="p-5 pb-20">
{items.length === 0 && editingId === null ? (
<div className="text-center p-8 bg-white rounded-xl border border-dashed border-gray-200 mb-6">
<p className="text-sm font-bold text-gray-500">まだ行程がありません</p>
<p className="text-xs text-gray-400 mt-1">追加してタイムラインを作りましょう</p>
</div>
) : (
<div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
{items.map((item) => (
<div key={item.id} className="relative pl-6">
{/* タイムラインの丸アイコン */}
<div
  className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-gray-50 flex items-center justify-center transition-colors ${item.isCompleted ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'} ${editingId === null ? 'cursor-pointer' : ''}`}
  onClick={(e) => editingId === null && toggleComplete(item.id, e)}
>
  {getCategoryIcon(item.category)}
</div>
          {/* イベント詳細カード / 編集フォーム */}
          {editingId === item.id ? (
            /* 編集モードのUI */
            <div className="bg-white rounded-xl p-4 shadow-md border border-blue-300 space-y-3 z-10 relative">
              <div className="flex gap-2">
                <input 
                  type="time" 
                  value={editForm.time || ''} 
                  onChange={e => setEditForm({...editForm, time: e.target.value})} 
                  className="border border-gray-300 rounded-lg p-2 text-sm w-24 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                />
                <select 
                  value={editForm.category || 'other'} 
                  onChange={e => setEditForm({...editForm, category: e.target.value as TimelineCategory})} 
                  className="border border-gray-300 rounded-lg p-2 text-sm flex-1 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="transport">交通</option>
                  <option value="lodging">宿泊</option>
                  <option value="admission">入場・受付</option>
                  <option value="goods">物販</option>
                  <option value="live">ライブ・イベント</option>
                  <option value="meal">食事</option>
                  <option value="sightseeing">観光</option>
                  <option value="other">その他</option>
                </select>
              </div>
              <input 
                type="text" 
                placeholder="タイトル (例: 新幹線乗車)" 
                value={editForm.title || ''} 
                onChange={e => setEditForm({...editForm, title: e.target.value})} 
                className="border border-gray-300 rounded-lg p-2.5 text-sm w-full font-bold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
              />
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="場所 (任意)" 
                  value={editForm.location || ''} 
                  onChange={e => setEditForm({...editForm, location: e.target.value})} 
                  className="py-2.5 text-sm w-full outline-none bg-transparent" 
                />
              </div>
              <textarea 
                placeholder="メモ (任意)" 
                value={editForm.memo || ''} 
                onChange={e => setEditForm({...editForm, memo: e.target.value})} 
                className="border border-gray-300 rounded-lg p-2.5 text-sm w-full resize-none outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                rows={2} 
              />
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                <button 
                  onClick={() => handleDelete(item.id)} 
                  disabled={isUpdating} 
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  aria-label="削除"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={cancelEditing} 
                    disabled={isUpdating} 
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-bold transition-colors disabled:opacity-50"
                  >
                    キャンセル
                  </button>
                  <button 
                    onClick={handleSave} 
                    disabled={isUpdating || !editForm.title} 
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-blue-400 transition-colors"
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                    保存する
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* 表示モードのUI */
            <div 
              className={`bg-white rounded-xl p-4 shadow-sm border transition-all cursor-pointer group
                ${item.isCompleted ? 'border-blue-100 bg-blue-50/40 opacity-70' : 'border-gray-100 hover:border-blue-200 hover:shadow-md'}`}
              onClick={(e) => {
                if (editingId === null) toggleComplete(item.id, e);
              }}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-800 tracking-tight">{item.time}</span>
                  <h3 className={`font-semibold ${item.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {item.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  {/* 編集ボタン（スマホでは常に薄く見せ、PCではホバー時強調） */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); startEditing(item); }}
                    className="p-1.5 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    aria-label="編集"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleComplete(item.id, e); }}
                    className="p-1"
                  >
                    {item.isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-blue-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
              
              {item.location && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {item.location}
                </p>
              )}
              
              {item.memo && (
                <p className="text-sm text-gray-600 bg-gray-50 p-2.5 rounded-lg mt-3 border border-gray-100">
                  {item.memo}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )}

  {/* 新規追加ボタン */}
  {editingId === null && (
    <button 
      onClick={handleAddNew}
      className="w-full mt-6 bg-white border-2 border-dashed border-gray-300 text-gray-500 font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all"
    >
      <Plus className="w-5 h-5" />
      新しい行程を追加
    </button>
  )}
</div>


);
};
