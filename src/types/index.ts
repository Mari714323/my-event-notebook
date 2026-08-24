/**
 * マイ遠征手帳 ドメイン型定義
 */

// ==========================================
// 会場関連 (Venue)
// ==========================================

export interface VenueLocation {
  lat: number;
  lng: number;
  address: string;
  nearestStation: string;
}

export interface Venue {
  id: string;
  name: string;
  shortName?: string;
  location: VenueLocation;
  capacity?: number;
  facilityNotes?: string; // コインロッカー、トイレ、電波状況、周辺飲食店などの知見
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 座席・公演鑑賞アーカイブ (SeatArchive)
// ==========================================

export type StandOrArena = 'arena' | 'stand' | 'balcony' | 'floor' | 'other';

export interface SeatPosition {
  type: StandOrArena;
  gate?: string;      // 例: 3番ゲート, 南口
  blockOrArea?: string; // 例: アリーナA2, スタンド東
  row?: string;       // 例: 12列
  number?: string;    // 例: 34番
  door?: string;      // 例: 11扉
}

export interface SeatArchive {
  id: string;
  tripId: string;
  venueId: string;
  performanceDate: string; // ISO 8601 (YYYY-MM-DD)
  performanceName?: string; // 例: Day 1, 昼公演
  seat: SeatPosition;
  
  // 鑑賞環境 & 実用スペック
  binocularMagnification?: string; // 例: "8倍", "10倍", "防振12倍", "肉眼で十分"
  usedEarplugs: boolean;          // ライブ用耳栓の使用有無
  
  // 実用メモ（見え方、動線、規制退場、音響、教訓などすべて集約）
  memo: string;
  
  photos?: string[];              // 座席からの視界写真やチケット・会場写真URL
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// タイムライン・しおり (TimelineItem)
// ==========================================

export type TimelineCategory =
  | 'transport'  // 移動 (新幹線、飛行機、電車など)
  | 'goods'      // 物販
  | 'admission'  // 入場
  | 'live'       // 本番・開演
  | 'lodging'    // ホテル・宿泊
  | 'meal'       // 食事
  | 'sightseeing'// 観光
  | 'other';     // その他

export interface TimelineItem {
  id: string;
  tripId: string;
  time: string;           // "HH:mm" または "YYYY-MM-DDTHH:mm"
  category: TimelineCategory;
  title: string;
  location?: string;
  memo?: string;
  isCompleted: boolean;
  order: number;
}

// ==========================================
// 持ち物チェックリスト (CheckItem)
// ==========================================

export type PackingCategory =
  | 'tickets_valuable' // チケット・身分証・貴重品
  | 'live_essentials'  // ペンライト、電池、双眼鏡、耳栓など
  | 'travel_lodging'   // 着替え、充電器、アメニティなど
  | 'care_health'      // 薬、のど飴、アイマスクなど
  | 'other';

export interface CheckItem {
  id: string;
  tripId?: string;       // null/undefined の場合は共通テンプレート
  category: PackingCategory;
  name: string;
  memo?: string;
  isRequired: boolean;
  isChecked: boolean;
  isTemplate?: boolean;  // 将来のテンプレート機能用フラグ
}

// ==========================================
// 遠征・トリップ (Trip)
// ==========================================

export type TripStatus = 'planning' | 'ongoing' | 'completed';

export interface Trip {
  id: string;
  title: string;          // 遠征タイトル (例: "2026 アリーナツアー 大阪遠征")
  artistName: string;     // アーティスト / イベント主催
  startDate: string;      // YYYY-MM-DD
  endDate: string;        // YYYY-MM-DD
  status: TripStatus;
  primaryVenueId: string; // メイン会場ID
  
  // 遠征サマリーメモ
  lodgingMemo?: string;   // 宿泊先情報
  transportMemo?: string; // 新幹線・交通予約情報
  generalNotes?: string;  // 遠征全体の感想・教訓
  estimatedBudget?: number;
  actualCost?: number;
  
  // リレーション
  timeline: TimelineItem[];
  packingList: CheckItem[];
  seatArchives: SeatArchive[];
  
  createdAt: string;
  updatedAt: string;
}