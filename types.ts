
export interface TargetApp {
  id: string;
  name: string;
  icon: string;
  description: string;
  dangerLevel: number;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  multiplier: number;
  icon: string;
  owned: boolean;
}

export interface PlayerStats {
  balance: number;
  totalBans: number;
  totalThrottles: number;
  rank: string;
  clickPower: number;
  multiplier: number;
  upgrades: string[];
}

export interface LeaderboardEntry {
  name: string;
  salary: number;
  isPlayer?: boolean;
}

export enum GameView {
  OFFICE = 'OFFICE',
  ROULETTE = 'ROULETTE',
  LEADERBOARD = 'LEADERBOARD',
  SHOP = 'SHOP'
}
