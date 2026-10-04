export type GameCategory = 
  | 'Action'
  | 'Racing'
  | 'Puzzle'
  | 'RPG'
  | 'Strategy'
  | 'Casual'
  | 'Tools'
  | 'Adventure'
  | 'Sports';

export interface GameReview {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  date: string;
  comment: string;
  helpfulCount: number;
}

export interface Game {
  id: string;
  name: string;
  packageName: string;
  category: GameCategory;
  developer: string;
  shortDescription: string;
  description: string;
  iconUrl: string;
  bannerUrl?: string;
  screenshots?: string[];
  apkUrl: string;
  apkFileName?: string;
  apkSizeMb: number;
  version: string;
  versionCode: number;
  minAndroidVersion: string;
  rating: number;
  ratingsCount: number;
  downloadsCount: number;
  featured?: boolean;
  editorsChoice?: boolean;
  createdAt: string;
  updatedAt: string;
  reviews?: GameReview[];
}

export interface FirebaseConnectionConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId?: string;
  appId: string;
  projectNumber?: string;
  measurementId?: string;
}
