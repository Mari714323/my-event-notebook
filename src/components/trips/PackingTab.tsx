'use client';

import React, { useState } from 'react';
import { Trip, CheckItem, PackingCategory } from '../../types';
import { CheckSquare, Square, AlertCircle, Plus, Loader2 } from 'lucide-react'; // Plus, Loader2追加
import { updateTrip } from '../../lib/apiClient'; // 追加

// カテゴリ表示用の日本語ラベル
const categoryLabels: Record<PackingCategory, string> = {
  tickets_valuable: 'チケット・貴重品',
  live_essentials: 'ライブ必須装備',
  travel_lodging: '遠征・宿泊用品',
  care_health: 'ケア・健康用品',
  other: 'その他'
};

export const PackingTab = ({ trip }: { trip: Trip }) => {
  const [items, setItems] = useState<CheckItem[]>(trip.packingList || []);
  
  // 追加: 新規追加用のState
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<PackingCategory>('other');
  const [isUpdating, setIsUpdating] = useState(false);

  // 変更: API通信を含めたトグル処理（即時反映）
  const toggleCheck = async (id: string) => {
    // オプティミスティックUI（先に画面だけチェック状態を更新してサクサク感を持たせる）
    const newItems = items.map(item =>
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    );
    setItems(newItems);

    try {
      // バックエンドに保存（PUTで全体を上書き）
      const updatedTrip = { ...trip, packingList: newItems };
      await updateTrip(trip.id, updatedTrip);
    } catch (error) {
      console.error(error);
      alert('状態の保存に失敗しました。');
      // エラー時は元の状態に戻す
      setItems(items);
    }
  };

  // 追加: 新規アイテムの追加処理
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setIsUpdating(true);
    const newItem: CheckItem = {
      id: `pack-${Date.now()}`, // 簡易的な一意ID
      category: newItemCategory,
      name: newItemName.trim(),
      isRequired: false,
      isChecked: false,
    };

    const newItems = [...items, newItem];
    setItems(newItems); // 画面を更新

    try {
      const updatedTrip = { ...trip, packingList: newItems };
      await updateTrip(trip.id, updatedTrip);
      setNewItemName(''); // 成功したらフォームをリセット
    } catch (error) {
      console.error(error);
      alert('アイテムの追加に失敗しました。');
      setItems(items); // エラー時は追加前の状態に戻す
    } finally {
      setIsUpdating(false);
    }
  };

  // カテゴリごとにアイテムをグループ化
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CheckItem[]>);

  // カテゴリの表示順序（チケット関連を最優先）
  const displayOrder: PackingCategory[] = [
    'tickets_valuable',
    'live_essentials',
    'travel_lodging',
    'care_health',
    'other'
  ];

  const totalItems = items.length;
  const completedItems = items.filter(i => i.isChecked).length;
  const progressPercentage = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  return (
    <div className="p-5 pb-20 space-y-6">
      {/* 進捗バー */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
          <span>準備状況</span>
          <span className="text-blue-600">{completedItems} / {totalItems} ({progressPercentage}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* カテゴリ別のリスト */}
      <div className="space-y-6">
        {displayOrder.map((category) => {
          const categoryItems = groupedItems[category];
          if (!categoryItems || categoryItems.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <h3 className="font-bold text-gray-800 text-sm border-b pb-1">
                {categoryLabels[category]}
              </h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {categoryItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`flex items-start gap-3 p-3.5 cursor-pointer hover:bg-gray-50 transition-colors
                      ${index !== categoryItems.length - 1 ? 'border-b border-gray-50' : ''}`}
                    onClick={() => toggleCheck(item.id)}
                  >
                    <div className="mt-0.5">
                      {item.isChecked ? (
                        <CheckSquare className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${item.isChecked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {item.name}
                        </span>
                        {item.isRequired && (
                          <span className="flex items-center gap-0.5 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">
                            <AlertCircle className="w-3 h-3" /> 必須
                          </span>
                        )}
                      </div>
                      {item.memo && (
                        <p className={`text-xs mt-1 ${item.isChecked ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.memo}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 追加: 新規アイテム追加フォーム */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mt-6">
        <h3 className="font-bold text-gray-800 text-sm mb-3">持ち物を追加</h3>
        <form onSubmit={handleAddItem} className="space-y-3">
          <div className="flex gap-2">
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value as PackingCategory)}
              className="border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="アイテム名"
              className="flex-1 border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isUpdating || !newItemName.trim()}
            className="w-full bg-blue-50 text-blue-600 font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {isUpdating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> 追加中...</>
            ) : (
              <><Plus className="w-4 h-4" /> 追加する</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};