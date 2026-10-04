/**
 * OMSTORE.COM - API Client Service
 * Handles communication with the Node.js Express backend
 */

import { Game } from '../types/game';

const API_BASE = '/api';

export interface UploadResponse {
  success: boolean;
  fileUrl: string;
  fileName: string;
  storedName: string;
  sizeMb: number;
  sizeBytes: number;
}

export interface StoreStats {
  totalGames: number;
  totalDownloads: number;
  categoriesCount: number;
  uptimeSeconds: number;
  serverTime: string;
}

/**
 * Fetch games with optional search query, category, and sorting
 */
export async function fetchGames(params?: {
  q?: string;
  category?: string;
  sort?: string;
}): Promise<Game[]> {
  try {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.sort) query.append('sort', params.sort);

    const res = await fetch(`${API_BASE}/games?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.games || [];
  } catch (err) {
    console.error('Error fetching games from API:', err);
    throw err;
  }
}

/**
 * Fetch a single game by ID
 */
export async function fetchGameById(id: string): Promise<Game> {
  const res = await fetch(`${API_BASE}/games/${id}`);
  if (!res.ok) throw new Error(`Failed to load game ${id}`);
  const data = await res.json();
  return data.game;
}

/**
 * Upload a binary file (APK, Icon, or Screenshot) to the backend
 */
export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    xhr.open('POST', `${API_BASE}/upload`);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch {
          reject(new Error('Invalid JSON response from server'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during file upload'));
    };

    xhr.send(formData);
  });
}

/**
 * Publish a new game
 */
export async function createGame(gameData: Partial<Game>): Promise<Game> {
  const res = await fetch(`${API_BASE}/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to publish game');
  }

  const data = await res.json();
  return data.game;
}

/**
 * Update an existing game
 */
export async function updateGame(id: string, gameData: Partial<Game>): Promise<Game> {
  const res = await fetch(`${API_BASE}/games/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update game');
  }

  const data = await res.json();
  return data.game;
}

/**
 * Delete a game
 */
export async function deleteGame(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/games/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Failed to delete game');
  const data = await res.json();
  return data.success;
}

/**
 * Record a game download and return download payload
 */
export async function recordDownload(id: string): Promise<{
  downloadsCount: number;
  apkUrl: string;
  apkFileName: string;
}> {
  const res = await fetch(`${API_BASE}/games/${id}/download`, {
    method: 'POST',
  });

  if (!res.ok) throw new Error('Failed to record download');
  return res.json();
}

/**
 * Get store statistics
 */
export async function fetchStoreStats(): Promise<StoreStats> {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}
