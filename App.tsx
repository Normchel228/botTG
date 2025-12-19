
import React, { useState, useEffect, useCallback } from 'react';
import { GameView, TargetApp, PlayerStats, LeaderboardEntry } from './types';
import { TARGET_APPS, RANKS, MOCK_LEADERBOARD } from './constants';
import { generateBlockReason } from './services/geminiService';
import Roulette from './components/Roulette';

const tg = (window as any).Telegram?.WebApp;

const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [view, setView] = useState<GameView>(GameView.OFFICE);
  const [stats, setStats] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem('rkn_stats');
    return saved ? JSON.parse(saved) : {
      balance: 0,
      totalBans: 0,
      totalThrottles: 0,
      rank: RANKS[0].title
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
    // Simulate system boot
    const timer = setTimeout(() => setIsBooting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('rkn_stats', JSON.stringify(stats));
  }, [stats]);

  const updateRank = useCallback((balance: number) => {
    const newRank = [...RANKS].reverse().find(r => balance >= r.minBalance)?.title || RANKS[0].title;
    if (newRank !== stats.rank) {
      setStats(prev => ({ ...prev, rank: newRank }));
    }
  }, [stats.rank]);

  const handleSpin = () => {
    setIsSpinning(true);
    setSelectedApp(null);
    setAiReason('');
    setShowStamp(null);
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

    const rewardBase = selectedApp.dangerLevel * 1000;
    const salary = type === 'BAN' ? rewardBase * 2 : rewardBase;
    
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('heavy');
    }

    setShowStamp(type);
    
    setTimeout(() => {
      setStats(prev => {
        const newBalance = prev.balance + salary;
        updateRank(newBalance);
        return {
          ...prev,
          balance: newBalance,
          totalBans: type === 'BAN' ? prev.totalBans + 1 : prev.totalBans,
          totalThrottles: type === 'THROTTLE' ? prev.totalThrottles + 1 : prev.totalThrottles,
        };
      });
      setSelectedApp(null);
      setAiReason('');
      setShowStamp(null);
    }, 1500);
  };

  if (isBooting) {
    return (
      <div className="h-full w-full bg-black text-green-500 p-8 font-mono flex flex-col justify-center items-start overflow-hidden">
        <p className="mb-2">SYSTEM BOOTING...</p>
        <p className="mb-2">LOADING PROTOCOLS v.1.0.2...</p>
        <p className="mb-2">CONNECTING TO DATABASE... [OK]</p>
        <p className="mb-2">LOADING AI CENSORSHIP CORE... [OK]</p>
        <p className="mb-2">READY FOR DUTY.</p>
        <div className="w-12 h-1 bg-green-500 animate-pulse mt-4"></div>
      </div>
    );
  }

  const sortedLeaderboard: LeaderboardEntry[] = [
    ...MOCK_LEADERBOARD,
    { name: 'Вы (Инспектор)', salary: stats.balance, isPlayer: true }
  ].sort((a, b) => b.salary - a.salary);

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-slate-100 shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--tg-theme-bg-color, #f1f5f9)' }}>
      {/* Header Stats */}
      <div className="bg-slate-900 text-green-500 p-4 border-b-4 border-slate-700 shadow-lg relative">
        <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold opacity-70">STATUS: ENCRYPTED</span>
            <span className="text-[10px] font-bold text-red-500 animate-pulse">● LIVE FEED</span>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[9px] uppercase text-slate-400 font-bold tracking-widest">БАЛАНС КАРТЫ 'МИР'</div>
            <div className="text-2xl font-mono leading-none">₽{stats.balance.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase text-slate-400 font-bold tracking-widest">РАНГ</div>
            <div className="text-xs font-bold text-yellow-500 uppercase italic">{stats.rank}</div>
          </div>
        </div>
      </div>

      {/* Main Screen */}
      <div className="flex-1 relative overflow-y-auto p-4 flex flex-col">
        {view === GameView.OFFICE && (
          <div className="w-full flex-1 flex flex-col justify-center items-center">
            <div className="mb-10 text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-slate-800 border-4 border-slate-600 rounded-sm flex items-center justify-center shadow-xl mb-4 transform rotate-1">
                    <i className="fa-solid fa-building-shield text-6xl text-slate-400"></i>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase shadow-lg transform -rotate-3">
                    СЕКТОР Г
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mt-4">УПРАВЛЕНИЕ №13</h2>
              <p className="text-[11px] text-slate-500 uppercase font-bold tracking-widest">Цифровой Суверенитет</p>
            </div>

            <button 
              onClick={() => setView(GameView.ROULETTE)}
              className="w-full py-6 bg-red-600 hover:bg-red-700 text-white rounded-none shadow-lg border-b-8 border-red-900 active:border-b-0 active:translate-y-2 transition-all font-black text-2xl uppercase tracking-tighter mb-4"
            >
              ПРИСТУПИТЬ
            </button>
            
            <button 
              onClick={() => setView(GameView.LEADERBOARD)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-none shadow border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all font-bold uppercase text-sm tracking-widest"
            >
              <i className="fa-solid fa-list-check mr-2"></i> ДОСКА ПОЧЁТА
            </button>
          </div>
        )}

        {view === GameView.ROULETTE && (
          <div className="w-full h-full flex flex-col">
            <button 
              onClick={() => setView(GameView.OFFICE)}
              className="mb-4 text-slate-500 hover:text-slate-700 font-bold text-xs uppercase self-start border-b border-slate-300"
            >
              ← ВЕРНУТЬСЯ К ОТЧЕТАМ
            </button>

            <div className="bg-slate-200 p-1 shadow-inner border-2 border-slate-400">
                <div className="bg-white p-6 border border-slate-400 relative">
                  <h3 className="text-center font-bold text-slate-400 mb-4 uppercase tracking-tighter text-xs">АВТОМАТИЗИРОВАННАЯ ВЫБОРКА ЦЕЛЕЙ</h3>
                  
                  <Roulette onSelected={handleAppSelected} isSpinning={isSpinning} />

                  {!isSpinning && !selectedApp && (
                    <button 
                      onClick={handleSpin}
                      className="mt-6 w-full py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-none shadow-xl border-b-4 border-yellow-900 active:border-b-0 active:translate-y-1 transition-all font-black text-xl uppercase italic"
                    >
                      КРУТИТЬ РУЛЕТКУ
                    </button>
                  )}

                  {selectedApp && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 shadow-inner animate-in fade-in zoom-in-95 duration-300">
                      <div className="flex items-center mb-3">
                        <i className={`${selectedApp.icon} text-3xl mr-3 text-slate-800`}></i>
                        <h4 className="text-xl font-black uppercase text-slate-800 leading-none">{selectedApp.name}</h4>
                      </div>
                      <div className="text-xs text-slate-700 leading-tight font-mono">
                        {loadingReason ? (
                          <div className="flex items-center">
                            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                            ГЕНЕРАЦИЯ ОБВИНЕНИЯ...
                          </div>
                        ) : (
                          <>
                            <span className="font-bold text-red-600 block mb-1">ОБОСНОВАНИЕ:</span>
                            "{aiReason}"
                          </>
                        )}
                      </div>

                      <div className="mt-6 flex gap-3">
                        <button 
                          onClick={() => handleAction('THROTTLE')}
                          disabled={loadingReason}
                          className="flex-1 py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase border-b-4 border-slate-950 disabled:opacity-50"
                        >
                          ЗАМЕДЛИТЬ
                        </button>
                        <button 
                          onClick={() => handleAction('BAN')}
                          disabled={loadingReason}
                          className="flex-1 py-4 bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase border-b-4 border-red-950 disabled:opacity-50"
                        >
                          ЗАБАНИТЬ
                        </button>
                      </div>
                    </div>
                  )}

                  {showStamp && (
                    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                      <div className={`stamp-enter text-4xl font-black p-4 border-8 transform ${showStamp === 'BAN' ? 'text-red-700 border-red-700 bg-red-50/50' : 'text-slate-800 border-slate-800 bg-slate-50/50'}`}>
                        {showStamp === 'BAN' ? 'БЛОКИРОВКА' : 'ЗАМЕДЛЕНИЕ'}
                      </div>
                    </div>
                  )}
                </div>
            </div>
            
            <div className="mt-auto p-4 text-center">
                <p className="text-[9px] text-slate-400 uppercase font-bold leading-tight">Ваш IP зафиксирован. Каждое действие записывается в архив министерства.</p>
            </div>
          </div>
        )}

        {view === GameView.LEADERBOARD && (
          <div className="w-full h-full flex flex-col">
            <button 
              onClick={() => setView(GameView.OFFICE)}
              className="mb-4 text-slate-500 hover:text-slate-700 font-bold text-xs uppercase self-start"
            >
              ← НАЗАД
            </button>

            <div className="bg-white border-2 border-slate-800 shadow-2xl">
              <div className="bg-slate-800 p-3 text-white font-black text-center uppercase tracking-widest text-sm italic">
                СПИСОК ЛУЧШИХ СОТРУДНИКОВ
              </div>
              <div className="p-2 bg-slate-100">
                {sortedLeaderboard.map((entry, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-3 border-b border-slate-300 last:border-0 ${entry.isPlayer ? 'bg-yellow-100 font-bold border-2 border-yellow-600 z-10' : ''}`}
                  >
                    <div className="flex items-center">
                      <span className={`w-8 font-mono text-sm ${idx < 3 ? 'text-red-600 font-black' : 'text-slate-500'}`}>{idx + 1}.</span>
                      <span className={`text-xs uppercase ${entry.isPlayer ? 'text-blue-800' : 'text-slate-800'}`}>{entry.name}</span>
                    </div>
                    <span className="font-mono text-xs text-green-700">₽{entry.salary.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="p-2 text-center text-[7px] text-slate-500 bg-slate-200 border-t border-slate-300 uppercase tracking-[0.2em] font-bold">
        ИНФОРМАЦИОННАЯ СИСТЕМА "БАРЬЕР-2025" // СТРОГО КОНФИДЕНЦИАЛЬНО
      </div>
    </div>
  );
};

export default App;
