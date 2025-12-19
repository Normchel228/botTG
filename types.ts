
export interface TargetApp {
  id: string;
  name: string;
  icon: string;
  description: string;
  dangerLevel: number; // 1 to 5
}

export interface PlayerStats {
  balance: number;
  totalBans: number;
  totalThrottles: number;
  rank: string;
}

export interface LeaderboardEntry {
  name: string;
  salary: number;
  isPlayer?: boolean;
}

export enum GameView {
  MAIN = 'MAIN',
  ROULETTE = 'ROULETTE',
  LEADERBOARD = 'LEADERBOARD',
  OFFICE = 'OFFICE'
}
