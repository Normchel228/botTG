
import { TargetApp, LeaderboardEntry, Upgrade } from './types';

export const TARGET_APPS: TargetApp[] = [
  { id: 'yt', name: 'YouTube', icon: 'fa-brands fa-youtube', description: 'Хостинг сомнительных видео.', dangerLevel: 4 },
  { id: 'dc', name: 'Discord', icon: 'fa-brands fa-discord', description: 'Сбор геймеров в группы.', dangerLevel: 3 },
  { id: 'tg', name: 'Telegram', icon: 'fa-brands fa-telegram', description: 'Слишком много свободы.', dangerLevel: 5 },
  { id: 'gh', name: 'GitHub', icon: 'fa-brands fa-github', description: 'Англоязычный код.', dangerLevel: 2 },
  { id: 'tw', name: 'X / Twitter', icon: 'fa-brands fa-x-twitter', description: 'Поток мнений.', dangerLevel: 5 },
  { id: 'st', name: 'Steam', icon: 'fa-brands fa-steam', description: 'Трата времени.', dangerLevel: 2 },
  { id: 'inst', name: 'Instagram', icon: 'fa-brands fa-instagram', description: 'Визуальный шум.', dangerLevel: 4 },
];

export const UPGRADES: Upgrade[] = [
  { id: 'stapler', name: 'Степлер "Люкс"', description: 'Ускоряет обработку бумаг. +1 к клику.', cost: 500, multiplier: 1, icon: 'fa-solid fa-stapler', owned: false },
  { id: 'stamp_gold', name: 'Золотая Печать', description: 'Удваивает доход от блокировок.', cost: 5000, multiplier: 2, icon: 'fa-solid fa-stamp', owned: false },
  { id: 'crt_new', name: 'Монитор LG Flatron', description: 'Уменьшает помехи на экране.', cost: 2000, multiplier: 1, icon: 'fa-solid fa-desktop', owned: false },
  { id: 'cactus', name: 'Кактус', description: 'Поглощает радиацию и дарит уважение.', cost: 1000, multiplier: 1.2, icon: 'fa-solid fa-seedling', owned: false },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { name: 'Иван Кузьмич', salary: 1500000 },
  { name: 'Мария Сергеевна', salary: 980000 },
  { name: 'Алексей Бумажкин', salary: 540000 },
];

export const RANKS = [
  { minBalance: 0, title: 'Младший стажер' },
  { minBalance: 5000, title: 'Старший инспектор' },
  { minBalance: 25000, title: 'Начальник отдела' },
  { minBalance: 100000, title: 'Гроза провайдеров' },
  { minBalance: 1000000, title: 'Министр Цифры' },
];
