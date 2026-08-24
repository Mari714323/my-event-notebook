'use client';

import React, { useState } from 'react';
import { Trip, TimelineItem, TimelineCategory } from '../../types';
import { Train, ShoppingBag, Ticket, Mic2, Hotel, Utensils, Map, HelpCircle, CheckCircle2, Circle, MapPin } from 'lucide-react';

// カテゴリに応じたアイコンを返すヘルパー関数
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
  // UIでのチェック操作をテストするため、ローカルStateで管理
  const [items, setItems] = useState<TimelineItem[]>(
    [...trip.timeline].sort((a, b) => a.order - b.order)
  );

  const toggleComplete = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
    ));
  };

  return (
    <div className="p-5 pb-20">
      <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
        {items.map((item) => (
          <div key={item.id} className="relative pl-6">
            {/* タイムラインの丸アイコン */}
            <div 
              className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-gray-50 flex items-center justify-center cursor-pointer transition-colors
                ${item.isCompleted ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}
              onClick={() => toggleComplete(item.id)}
            >
              {getCategoryIcon(item.category)}
            </div>

            {/* イベント詳細カード */}
            <div 
              className={`bg-white rounded-xl p-4 shadow-sm border transition-all cursor-pointer
                ${item.isCompleted ? 'border-blue-100 bg-blue-50/40 opacity-70' : 'border-gray-100'}`}
              onClick={() => toggleComplete(item.id)}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-800 tracking-tight">{item.time}</span>
                  <h3 className={`font-semibold ${item.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {item.title}
                  </h3>
                </div>
                <div>
                  {item.isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-300" />
                  )}
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
          </div>
        ))}
      </div>
    </div>
  );
};