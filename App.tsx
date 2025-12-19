
import React, { useState, useEffect, useCallback } from 'react';
import { GameView, TargetApp, PlayerStats, LeaderboardEntry, Upgrade } from './types';
import { TARGET_APPS, RANKS, MOCK_LEADERBOARD, UPGRADES } from './constants';
import { generateBlockReason } from './services/geminiService';
import Roulette from './components/Roulette';

const tg = (window as any).Telegram?.WebApp;

const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [view, setView] = useState<GameView>(GameView.OFFICE);
  const [stats, setStats] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem('rkn_stats_v2');
    return saved ? JSON.parse(saved) : {
      balance: 0,
      totalBans: 0,
      totalThrottles: 0,
      rank: RANKS[0].title,
      clickPower: 10,
      multiplier: 1,
      upgrades: []
    };
  });
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedApp, setSelectedApp] = useState<TargetApp | null>(null);
  const [aiReason, setAiReason] = useState<string>('');
  const [loadingReason, setLoadingReason] = useState(false);
  const [showStamp, setShowStamp] = useState<'BAN' | 'THROTTLE' | null>(null);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
    const timer = setTimeout(() => setIsBooting(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('rkn_stats_v2', JSON.stringify(stats));
  }, [stats]);

  const updateRank = useCallback((balance: number) => {
    const newRank = [...RANKS].reverse().find(r => balance >= r.minBalance)?.title || RANKS[0].title;
    if (newRank !== stats.rank) {
      setStats(prev => ({ ...prev, rank: newRank }));
    }
  }, [stats.rank]);

  const handlePaperClick = () => {
    const gain = stats.clickPower * stats.multiplier;
    setStats(prev => {
      const newBalance = prev.balance + gain;
      updateRank(newBalance);
      return { ...prev, balance: newBalance };
    });
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
  };

  const buyUpgrade = (upgrade: Upgrade) => {
    if (stats.balance >= upgrade.cost && !stats.upgrades.includes(upgrade.id)) {
      setStats(prev => ({
        ...prev,
        balance: prev.balance - upgrade.cost,
        upgrades: [...prev.upgrades, upgrade.id],
        multiplier: prev.multiplier * upgrade.multiplier,
        clickPower: upgrade.id === 'stapler' ? prev.clickPower + 50 : prev.clickPower
      }));
    }
  };

  const handleSpin = () => {
    setIsSpinning(true);
    setSelectedApp(null);
    setAiReason('');
  };

  const handleAppSelected = async (app: TargetApp) => {
    setIsSpinning(false);
    setSelectedApp(app);
    setLoadingReason(true);
    const reason = await generateBlockReason(app.name);
    setAiReason(reason);
    setLoadingReason(false);
  };

  const handleAction = (type: 'BAN' | 'THROTTLE') => {
    if (!selectedApp) return;
    const reward = (selectedApp.dangerLevel * 500) * stats.multiplier;
    const finalReward = type === 'BAN' ? reward * 2 : reward;
    
    setShowStamp(type);
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('heavy');

    setTimeout(() => {
      setStats(prev => {
        const newBalance = prev.balance + finalReward;
        updateRank(newBalance);
        return {
          ...prev,
          balance: newBalance,
          totalBans: type === 'BAN' ? prev.totalBans + 1 : prev.totalBans,
        };
      });
      setSelectedApp(null);
      setShowStamp(null);
    }, 1000);
  };

  if (isBooting) {
    return (
      <div className="h-full w-full bg-black text-green-500 p-8 font-mono flex flex-col justify-center items-center">
        <div className="text-center animate-pulse">
          <p className="text-2xl mb-4 font-black">ЗАГРУЗКА ЦЕНЗУРЫ...</p>
          <div className="w-48 h-2 bg-green-900 mx-auto rounded-full overflow-hidden">
            <div className="h-full bg-green-500 animate-[loading_1.5s_ease-in-out]"></div>
          </div>
        </div>
        <style>{`@keyframes loading { 0% { width: 0; } 100% { width: 100%; } }`}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-slate-200 overflow-hidden relative border-x-4 border-slate-400">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white p-3 flex justify-between items-center shadow-xl z-20">
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Лицевой счет</span>
          <span className="text-xl font-mono text-green-400">₽{stats.balance.toLocaleString()}</span>
        </div>
        <div className="text-right">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Должность</span>
          <div className="text-xs font-bold text-yellow-500">{stats.rank}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative p-4 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-repeat">
        {view === GameView.OFFICE && (
          <div className="flex flex-col h-full">
            {/* Monitor Section */}
            <div className="relative w-full aspect-video bg-slate-800 rounded-lg border-8 border-slate-700 shadow-2xl overflow-hidden mb-6 flex items-center justify-center cursor-pointer" onClick={() => setView(GameView.ROULETTE)}>
              <div className="absolute inset-0 bg-blue-900/10 z-10 pointer-events-none"></div>
              <div className="text-center">
                <i className="fa-solid fa-power-off text-3xl text-slate-600 mb-2"></i>
                <p className="text-green-500 font-mono text-xs animate-pulse">ВКЛЮЧИТЬ СИСТЕМУ "БАРЬЕР"</p>
              </div>
            </div>

            {/* Desk Objects */}
            <div className="flex-1 grid grid-cols-2 gap-4 items-end">
              {/* Paper Stack - Clicker */}
              <div className="flex flex-col items-center group cursor-pointer" onClick={handlePaperClick}>
                <div className="relative w-24 h-12 bg-white border-x border-t border-slate-300 shadow-lg transform group-active:translate-y-1 transition-transform">
                  <div className="absolute -top-1 left-0 w-full h-1 bg-white border-t border-slate-300"></div>
                  <div className="absolute -top-2 left-0 w-full h-1 bg-white border-t border-slate-300"></div>
                </div>
                <span className="text-[9px] font-bold mt-2 uppercase text-slate-600 bg-white/50 px-1">Отчеты (КЛИК)</span>
              </div>

              {/* Shop / Telephone */}
              <div className="flex flex-col items-center cursor-pointer group" onClick={() => setView(GameView.SHOP)}>
                <div className="w-20 h-20 bg-slate-700 rounded-t-xl border-4 border-slate-800 shadow-xl flex items-center justify-center text-slate-300 transform group-active:scale-95">
                  <i className="fa-solid fa-phone-flip text-3xl"></i>
                </div>
                <span className="text-[9px] font-bold mt-2 uppercase text-slate-600 bg-white/50 px-1">Магазин / Связь</span>
              </div>
            </div>

            <button onClick={() => setView(GameView.LEADERBOARD)} className="mt-8 py-2 border-2 border-slate-800 font-bold uppercase text-xs tracking-widest text-slate-800 hover:bg-slate-800 hover:text-white transition-colors">
              Проверить Доску Почета
            </button>
          </div>
        )}

        {view === GameView.ROULETTE && (
          <div className="h-full flex flex-col bg-white border-4 border-slate-800 p-4 shadow-2xl">
            <button onClick={() => setView(GameView.OFFICE)} className="mb-4 text-xs font-bold uppercase text-red-600 underline">← Выйти из системы</button>
            <h2 className="text-center font-black uppercase text-sm mb-4">Выбор цели для мониторинга</h2>
            <Roulette onSelected={handleAppSelected} isSpinning={isSpinning} />
            
            {!isSpinning && !selectedApp && (
              <button onClick={handleSpin} className="mt-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest shadow-xl active:translate-y-1">Запустить Сканер</button>
            )}

            {selectedApp && (
              <div className="mt-6 border-2 border-slate-300 p-4 bg-slate-50 relative animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center mb-4">
                  <i className={`${selectedApp.icon} text-4xl mr-4 text-slate-800`}></i>
                  <div>
                    <h3 className="font-black text-xl uppercase leading-none">{selectedApp.name}</h3>
                    <span className="text-[10px] text-red-600 font-bold">ОПАСНОСТЬ: {selectedApp.dangerLevel}/5</span>
                  </div>
                </div>
                <div className="text-xs italic mb-6 border-l-4 border-red-500 pl-2">
                  {loadingReason ? "Получение данных со спутника..." : `"${aiReason}"`}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction('THROTTLE')} className="flex-1 py-3 bg-yellow-500 text-white font-bold uppercase text-xs border-b-4 border-yellow-700">Замедлить</button>
                  <button onClick={() => handleAction('BAN')} className="flex-1 py-3 bg-red-700 text-white font-bold uppercase text-xs border-b-4 border-red-900">Забанить</button>
                </div>
              </div>
            )}
            
            {showStamp && (
              <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                <div className="stamp-enter border-8 border-red-600 text-red-600 p-4 font-black text-4xl transform rotate-12 bg-white/80">
                  {showStamp === 'BAN' ? 'БЛОК' : 'ЗАМЕДЛ'}
                </div>
              </div>
            )}
          </div>
        )}

        {view === GameView.SHOP && (
          <div className="h-full bg-slate-100 border-4 border-slate-800 p-4 shadow-xl">
            <button onClick={() => setView(GameView.OFFICE)} className="mb-4 text-xs font-bold underline">← Назад к работе</button>
            <h2 className="text-center font-black uppercase mb-6 border-b-2 border-slate-800 pb-2 italic">Снабжение</h2>
            <div className="space-y-4">
              {UPGRADES.map(item => (
                <div key={item.id} className={`p-3 border-2 border-slate-300 flex items-center bg-white ${stats.upgrades.includes(item.id) ? 'opacity-50 grayscale' : ''}`}>
                  <div className="w-12 h-12 flex items-center justify-center text-2xl text-slate-700 bg-slate-200 mr-3">
                    <i className={item.icon}></i>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-xs uppercase">{item.name}</div>
                    <div className="text-[9px] text-slate-500 leading-none">{item.description}</div>
                  </div>
                  <button 
                    disabled={stats.balance < item.cost || stats.upgrades.includes(item.id)}
                    onClick={() => buyUpgrade(item)}
                    className="ml-2 px-3 py-1 bg-green-700 text-white font-bold text-[10px] uppercase disabled:bg-slate-400"
                  >
                    {stats.upgrades.includes(item.id) ? 'Есть' : `₽${item.cost}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === GameView.LEADERBOARD && (
          <div className="h-full bg-white border-4 border-slate-800 p-4 shadow-xl">
            <button onClick={() => setView(GameView.OFFICE)} className="mb-4 text-xs font-bold underline">← Назад</button>
            <h2 className="text-center font-black uppercase mb-6">Доска Почета</h2>
            <div className="space-y-2">
              {[...MOCK_LEADERBOARD, { name: 'ВЫ (Инспектор)', salary: stats.balance, isPlayer: true }].sort((a, b) => b.salary - a.salary).map((e, i) => (
                <div key={i} className={`flex justify-between p-2 border-b text-xs ${e.isPlayer ? 'bg-yellow-100 font-bold' : ''}`}>
                  <span>{i+1}. {e.name}</span>
                  <span className="font-mono">₽{e.salary.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-2 bg-slate-900 text-white text-[7px] text-center uppercase tracking-[0.3em] font-bold">
        Протокол ГП-2025 // Система контроля доступа
      </div>
    </div>
  );
};

export default App;
