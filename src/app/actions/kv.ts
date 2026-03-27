"use server";

import { kv } from '@vercel/kv';
import { AppState } from '@/types';

const STORAGE_KEY = 'gens-cost-data';

// KVからデータを取得
export async function getAppData(): Promise<AppState | null> {
    try {
        const data = await kv.get<AppState>(STORAGE_KEY);
        return data; // dataがnullの場合は初期状態になります
    } catch (error) {
        console.error('Failed to get data from KV', error);
        return null;
    }
}

// KVにデータを保存
export async function saveAppData(data: AppState): Promise<boolean> {
    try {
        await kv.set(STORAGE_KEY, data);
        return true;
    } catch (error) {
        console.error('Failed to save data to KV', error);
        return false;
    }
}
