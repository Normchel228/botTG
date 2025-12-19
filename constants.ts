
import { TargetApp, LeaderboardEntry } from './types';

export const TARGET_APPS: TargetApp[] = [
  { id: 'yt', name: 'YouTube', icon: 'fa-brands fa-youtube', description: 'Слишком много познавательного контента. Опасно.', dangerLevel: 4 },
  { id: 'dc', name: 'Discord', icon: 'fa-brands fa-discord', description: 'Геймеры общаются без присмотра.', dangerLevel: 3 },
  { id: 'tg', name: 'Telegram', icon: 'fa-brands fa-telegram', description: 'Иронично, но мы всё равно следим.', dangerLevel: 5 },
  { id: 'st', name: 'Steam', icon: 'fa-brands fa-steam', description: 'Распродажи выкачивают деньги из страны.', dangerLevel: 2 },
  { id: 'wp', name: 'WhatsApp', icon: 'fa-brands fa-whatsapp', description: 'Родительские чаты — источник хаоса.', dangerLevel: 1 },
  { id: 'gh', name: 'GitHub', icon: 'fa-brands fa-github', description: 'Код на английском. Подозрительно.', dangerLevel: 3 },
  { id: 'tw', name: 'X (Twitter)', icon: 'fa-brands fa-x-twitter', description: 'Слишком много мнений.', dangerLevel: 5 },
  { id: 'vk', name: 'VK', icon: 'fa-brands fa-vk', description: 'Свой, родной, но надо для профилактики.', dangerLevel: 1 },
  { id: 'rd', name: 'Reddit', icon: 'fa-brands fa-reddit', description: 'Англоязычные мемы захватывают умы.', dangerLevel: 4 },
  { id: 'wpd', name: 'Wikipedia', icon: 'fa-solid fa-book-atlas', description: 'Много фактов, не прошедших проверку.', dangerLevel: 3 },
  { id: 'ggl', name: 'Google', icon: 'fa-brands fa-google', description: 'Знает слишком много.', dangerLevel: 4 },
  { id: 'twch', name: 'Twitch', icon: 'fa-brands fa-twitch', description: 'Прямые трансляции чего попало.', dangerLevel: 3 },
  { id: 'inst', name: 'Instagram', icon: 'fa-brands fa-instagram', description: 'Красивая жизнь разлагает дисциплину.', dangerLevel: 5 },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { name: 'Иван Кузьмич (Начальник)', salary: 1500000 },
  { name: 'Мария Сергеевна', salary: 980000 },
  { name: 'Петр Петрович', salary: 750000 },
  { name: 'Алексей Бумажкин', salary: 540000 },
  { name: 'Елена Папкина', salary: 320000 },
];

export const RANKS = [
  { minBalance: 0, title: 'Младший инспектор' },
  { minBalance: 10000, title: 'Старший бумагомаратель' },
  { minBalance: 50000, title: 'Гроза провайдеров' },
  { minBalance: 200000, title: 'Магистр блокировок' },
  { minBalance: 1000000, title: 'Верховный Регулятор' },
];
