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
    primaryVenueID: `venue-${Date.now()}`,
    status: 'planning',
    timeline: [],
    checklist: [],
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

  return response.json();
}

export async function updateTrip(id: string, tripData: Trip): Promise <Trip> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error('認証トークンが取得できませんでした');
  }
  if (!API_BASE_URL) {
    throw new Error('APIエンドポイントが設定されていません');
  }

  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(tripData), // tripDataを丸ごと送信
  });

  if (!response.ok) {
    throw new Error(`遠征の更新に失敗しました: ${response.status}`);
  }

  return response.json();
}

export async function deleteTrip(id: string): Promise <Trip> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error('認証トークンが取得できませんでした');
  }

  if (!API_BASE_URL) {
    throw new Error('APIエンドポイントが設定されていません');
  }

  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`遠征の削除に失敗しました: ${response.status}`);
  }

  return response.json();
}

// ▼ ここから追加: S3アップロード用のAPI関数

export async function getUploadUrl(eventId: string, filename: string, contentType: string): Promise<{ uploadUrl: string }> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error('認証トークンが取得できませんでした');
  }

  if (!API_BASE_URL) {
    throw new Error('APIエンドポイントが設定されていません');
  }

  // ⚠️ ここをバッククォート( ` )で囲み、${}で変数を展開します
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/upload-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ filename, contentType }),
  });

  if (!response.ok) {
    throw new Error(`アップロードURLの取得に失敗しました: ${response.status}`);
  }

  return response.json();
}

export async function uploadImageToS3(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file, // Fileオブジェクト（バイナリ）をそのまま送信
  });

  if (!response.ok) {
    throw new Error(`S3へのアップロードに失敗しました: ${response.status}`);
  }
}

