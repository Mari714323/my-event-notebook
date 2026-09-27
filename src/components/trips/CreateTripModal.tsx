'use client';

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; venueName: string; startDate: string; endDate: string }) => Promise<void>;
}

export const CreateTripModal = ({ isOpen, onClose, onSubmit }: Props) => {
  const [title, setTitle] = useState('');
  const [venueName, setVenueName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // 終了日が未入力の場合は、日帰り想定として開始日と同じ値をセット
      const finalEndDate = endDate || startDate;
      await onSubmit({ title, venueName, startDate, endDate: finalEndDate });
      
      // 成功したらフォームをリセット
      setTitle('');
      setVenueName('');
      setStartDate('');
      setEndDate('');
    } catch (err: any) {
      setError(err.message || '作成に失敗しました');
      setIsSubmitting(false); // 失敗時のみローディングを解除して再入力可能にする
    }
  };

  return (
    <>
      {/* 背景オーバーレイ */}
      <div 
        className="fixed inset-0 bg-black/30 z-[1000] transition-opacity" 
        onClick={onClose} 
      />
      
      {/* ボトムシート本体 */}
      <div className="fixed bottom-0 left-0 right-0 z-[1001] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 max-w-5xl mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-gray-900">新しい遠征を登録</h2>
          <button 
            onClick={onClose} 
            className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">イベント / 遠征タイトル <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="例: Spring Live Tour 2026 大阪"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">会場名 <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="例: 大阪城ホール"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">開始日 <span className="text-red-500">*</span></label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">終了日</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-blue-600 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 hover:bg-blue-700 disabled:bg-blue-400 transition-colors shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                登録中...
              </>
            ) : (
              '遠征を登録する'
            )}
          </button>
        </form>
      </div>
    </>
  );
};