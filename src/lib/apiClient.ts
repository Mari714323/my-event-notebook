import { fetchAuthSession } from 'aws-amplify/auth';
import { Trip } from '../types';
import { TimerifyOptions } from 'node:perf_hooks';
import { CheckItem } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

// ▼ 一覧取得用 (引数なし、Trip[] を返す)
export async function fetchTrips(): Promise<Trip[]> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error('認証トークンが見つかりません');
  }

  if (!API_BASE_URL) {
    throw new Error('APIエンドポイントが設定されていません');
  }

  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`データの取得に失敗しました: ${response.status}`);
  }

  return response.json();
}

export async function fetchTrip(id: string): Promise<Trip> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error('認証トークンが取得できませんでした');
  }

  if (!API_BASE_URL) {
    throw new Error('APIエンドポイントが設定されていません');
  }

  const response = await fetch(`${API_BASE_URL}/events/${id}`, {

    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`遠征データの取得に失敗しました: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

const DEFAULT_PACKING_LIST = [
  { category: 'tickets_valuable' as const, name: 'チケット（紙/電子・身分証）', isRequired: true, isChecked: false, isTemplate: true },
  { category: 'live_essentials' as const, name: 'ペンライト＆予備電池', isRequired: true, isChecked: false, isTemplate: true },
  { category: 'live_essentials' as const, name: '双眼鏡', isRequired: false, isChecked: false, isTemplate: true },
  { category: 'live_essentials' as const, name: 'ライブ用耳栓', isRequired: false, isChecked: false, isTemplate: true },
  { category: 'travel_lodging' as const, name: 'モバイルバッテリー', isRequired: true, isChecked: false, isTemplate: true },
];

export async function createTrip(
  tripData: { title: string; venueName: string; startDate: string; endDate: string }
): Promise <Trip> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error('認証トークンが取得できませんでした');
  }

  if (!API_BASE_URL) {
    throw new Error('APIエンドポイントが設定されていません');
  }

  // フォームからの入力値と、自動設定する初期値をマージしてペイロードを作成
  const payload = {
    ...tripData,
    primaryVenueId: `venue-${Date.now()}`, // 今回は会場名からの簡易的な仮ID生成（後でマスタと紐づけるなど拡張可能）
    status: 'planning',
    timeline: [],
    // 持ち物テンプレートを展開し、一意のIDを付与してセット
    checklist: DEFAULT_PACKING_LIST.map(item => ({
      id: `pack-${crypto.randomUUID()}`,
      ...item
    })),
    // DynamoDBの仕様に合わせて必要な初期値があれば追加
    hasHotel: false,
    hasTransport: false,
  };

  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`遠征の作成に失敗しました: ${response.status}`);
  }

  const data = await response.json();
  return data;
}