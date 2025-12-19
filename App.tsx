
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
    try {
      const saved = localStorage.getItem('rkn_v3_data');
      return saved ? JSON.parse(saved) : {
        balance: 0,
        totalBans: 0,
        totalThrottles: 0,
        rank: RANKS[0].title,
        clickPower: 10,
        multiplier: 1,
        upgrades: []
      };
    } catch {
      return { balance: 0, totalBans: 0, totalThrottles: 0, rank: RANKS[0].title, clickPower: 10, multiplier: 1, upgrades: [] };
    }
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
      tg.setHeaderColor('#1a1c1e');
    }
    const timer = setTimeout(() => setIsBooting(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('rkn_v3_data', JSON.stringify(stats));
  }, [stats]);

  // Added missing handleAction to handle app banning/throttling
  const handleAction = (type: 'BAN' | 'THROTTLE') => {
    if (!selectedApp) return;
    
    const reward = selectedApp.dangerLevel * 100 * stats.multiplier;
    
    setStats(prev => {
      const newBal = prev.balance + reward;
      const newRank = [...RANKS].reverse().find(r => newBal >= r.minBalance)?.title || RANKS[0].title;
      return {
        ...prev,
        balance: newBal,
        totalBans: type === 'BAN' ? prev.totalBans + 1 : prev.totalBans,
        totalThrottles: type === 'THROTTLE' ? prev.totalThrottles + 1 : prev.totalThrottles,
        rank: newRank
      };
    });

    setShowStamp(type);
    if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    
    // Auto-clear stamp and reset state after a delay
    setTimeout(() => {
      setShowStamp(null);
      setSelectedApp(null);
      setAiReason('');
    }, 1000);
  };

  const handlePaperClick = () => {
    const gain = stats.clickPower * stats.multiplier;
    setStats(prev => {
      const newBal = prev.balance + gain;
      const newRank = [...RANKS].reverse().find(r => newBal >= r.minBalance)?.title || RANKS[0].title;
      return { ...prev, balance: newBal, rank: newRank };
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
        clickPower: upgrade.id === 'stapler' ? prev.clickPower + 40 : prev.clickPower
      }));
    }
  };

  if (isBooting) {
    return (
      <div className="flex-1 bg-[#1a1c1e] text-green-500 flex flex-col items-center justify-center font-mono">
        <p className="text-2xl font-black mb-4 animate-pulse">ВХОД В СИСТЕМУ...</p>
        <div className="w-32 h-1 bg-green-900 overflow-hidden">
          <div className="h-full bg-green-500 animate-[load_1s_infinite]"></div>
        </div>
        <style>{`@keyframes load { 0% { width: 0; } 100% { width: 100%; } }`}</style>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-300 max-w-md mx-auto relative border-x-4 border-slate-500 shadow-inner overflow-hidden">
      {/* Top Header */}
      <div className="bg-slate-900 text-white p-3 flex justify-between items-center shrink-0 border-b-2 border-slate-700">
        <div>
          <p className="text-[8px] uppercase font-bold text-slate-500">Бюджет</p>
          <p className="text-xl font-mono text-green-400">₽{stats.balance.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] uppercase font-bold text-slate-500">Ранг</p>
          <p className="text-[10px] font-black text-yellow-500 uppercase italic">{stats.rank}</p>
        </div>
      </div>

      <div className="flex-1 relative p-4 bg-slate-200 overflow-y-auto">
        {view === GameView.OFFICE && (
          <div className="h-full flex flex-col">
            {/* Monitor */}
            <div 
              className="w-full aspect-video bg-slate-800 rounded-sm border-4 border-slate-700 shadow-lg mb-6 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform"
              onClick={() => setView(GameView.ROULETTE)}
            >
              <i className="fa-solid fa-satellite-dish text-4xl text-slate-600 mb-2"></i>
              <p className="text-[10px] font-bold text-green-600 animate-pulse uppercase tracking-widest">ТЕРМИНАЛ: ГОТОВ</p>
            </div>

            {/* Desktop Items */}
            <div className="flex-1 grid grid-cols-2 gap-4 items-end pb-4">
              <div className="flex flex-col items-center group cursor-pointer" onClick={handlePaperClick}>
                <div className="w-24 h-16 bg-white border-2 border-slate-400 shadow-md group-active:translate-y-1 transition-transform relative">
                  <div className="absolute inset-x-2 top-2 h-0.5 bg-slate-200"></div>
                  <div className="absolute inset-x-2 top-4 h-0.5 bg-slate-200"></div>
                  <div className="absolute inset-x-2 top-6 h-0.5 bg-slate-100"></div>
                </div>
                <p className="text-[8px] font-bold mt-2 uppercase">Штамповать отчёты</p>
              </div>

              <div className="flex flex-col items-center cursor-pointer group" onClick={() => setView(GameView.SHOP)}>
                <div className="w-16 h-16 bg-slate-700 rounded-full border-4 border-slate-800 shadow-lg flex items-center justify-center group-active:scale-90 transition-transform">
                  <i className="fa-solid fa-toolbox text-2xl text-slate-400"></i>
                </div>
                <p className="text-[8px] font-bold mt-2 uppercase">Хоз. отдел</p>
              </div>
            </div>

            <button onClick={() => setView(GameView.LEADERBOARD)} className="w-full py-2 bg-slate-800 text-white font-bold text-[9px] uppercase tracking-widest">
              Доска Почёта
            </button>
          </div>
        )}

        {view === GameView.ROULETTE && (
          <div className="h-full flex flex-col bg-white border-2 border-slate-800 p-4 shadow-xl">
            <button onClick={() => setView(GameView.OFFICE)} className="mb-4 text-[9px] font-bold text-red-600 uppercase underline self-start">← Вернуться</button>
            <Roulette 
              isSpinning={isSpinning} 
              onSelected={async (app) => {
                setIsSpinning(false);
                setSelectedApp(app);
                setLoadingReason(true);
                const r = await generateBlockReason(app.name);
                setAiReason(r);
                setLoadingReason(false);
              }} 
            />
            
            {!isSpinning && !selectedApp && (
              <button 
                onClick={() => { setIsSpinning(true); setSelectedApp(null); }} 
                className="mt-6 w-full py-4 bg-red-700 text-white font-black text-xl uppercase italic shadow-[0_5px_0_#450a0a]"
              >
                КРУТИТЬ
              </button>
            )}

            {selectedApp && (
              <div className="mt-6 border-2 border-slate-800 p-3 bg-slate-50 relative">
                <div className="flex items-center mb-3">
                  <i className={`${selectedApp.icon} text-3xl mr-3`}></i>
                  <p className="font-black uppercase text-lg">{selectedApp.name}</p>
                </div>
                <p className="text-[10px] italic mb-4 bg-white p-2 border border-slate-200">
                  {loadingReason ? "Ожидание шифровки..." : aiReason}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => { handleAction('BAN'); setView(GameView.OFFICE); }} className="flex-1 py-3 bg-red-700 text-white text-[10px] font-bold uppercase">Забанить</button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === GameView.SHOP && (
          <div className="h-full bg-slate-100 border-2 border-slate-800 p-4 overflow-y-auto">
            <button onClick={() => setView(GameView.OFFICE)} className="mb-4 text-[9px] font-bold uppercase underline">← В кабинет</button>
            <div className="space-y-2">
              {UPGRADES.map(u => (
                <div key={u.id} className={`p-2 border border-slate-300 bg-white flex items-center justify-between ${stats.upgrades.includes(u.id) ? 'opacity-50' : ''}`}>
                  <div className="flex items-center">
                    <i className={`${u.icon} mr-3 text-slate-600`}></i>
                    <div>
                      <p className="text-[9px] font-bold uppercase">{u.name}</p>
                      <p className="text-[7px] text-slate-400">{u.description}</p>
                    </div>
                  </div>
                  <button 
                    disabled={stats.balance < u.cost || stats.upgrades.includes(u.id)}
                    onClick={() => buyUpgrade(u)}
                    className="px-2 py-1 bg-green-700 text-white text-[9px] font-bold uppercase rounded-sm"
                  >
                    {stats.upgrades.includes(u.id) ? 'ОК' : `₽${u.cost}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === GameView.LEADERBOARD && (
          <div className="h-full bg-white border-2 border-slate-800 p-4">
            <button onClick={() => setView(GameView.OFFICE)} className="mb-4 text-[9px] font-bold uppercase underline">← Назад</button>
            <div className="space-y-1">
              {[...MOCK_LEADERBOARD, { name: 'ВЫ (Инспектор)', salary: stats.balance, isPlayer: true }].sort((a, b) => b.salary - a.salary).map((e, i) => (
                <div key={i} className={`flex justify-between p-2 text-[10px] border-b ${e.isPlayer ? 'bg-yellow-50 font-bold' : ''}`}>
                  <span>{i+1}. {e.name}</span>
                  <span className="font-mono">₽{e.salary.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showStamp && (
        <div className="absolute inset-0 flex items-center justify-center z-[200] pointer-events-none">
          <div className="stamp-enter border-8 border-red-700 text-red-700 p-4 font-black text-4xl transform rotate-12 bg-white/80">
            ОДОБРЕНО
          </div>
        </div>
      )}

      <div className="bg-slate-900 text-[6px] text-center text-slate-600 py-1 uppercase tracking-widest shrink-0">
        Система контроля №13 // 2025
      </div>
    </div>
  );
};

export default App;
