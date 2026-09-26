import { fetchAuthSession } from 'aws-amplify/auth';
import { Trip } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

export async function fetchTrips(): Promise<Trip[]> {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    if (!token) {
        throw new Error('認証トークンが見つかりません');
    }

    if (!API_BASE_URL) {
        throw new Error('APIのエンドポイントが設定されていません');
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