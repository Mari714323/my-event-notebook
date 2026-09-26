import { fetchAuthSession } from 'aws-amplify/auth';
import { Trip } from '../types';

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

// ▼ 詳細取得用 (引数にidを受け取り、Trip を返す)
export async function fetchTrip(id: string): Promise<Trip> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error('認証トークンが見つかりません');
  }

  if (!API_BASE_URL) {
    throw new Error('APIエンドポイントが設定されていません');
  }

  const response = await fetch(`\({API_BASE_URL}/events/\){id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`データ詳細の取得に失敗しました: ${response.status}`);
  }

  const data = await response.json();
  
  // もしAPIが配列で返してきている場合は、先頭の要素を返すようにする
  if (Array.isArray(data)) {
    if (data.length === 0) {
       throw new Error('データが見つかりませんでした');
    }
    return data[0];
  }
  
  return data;
}