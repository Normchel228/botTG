
import React, { useState, useEffect, useCallback } from 'react';
import { GameView, TargetApp, PlayerStats, LeaderboardEntry, Upgrade } from './types';
import { TARGET_APPS, RANKS, MOCK_LEADERBOARD, UPGRADES } from './constants';
import { generateBlockReason } from './services/geminiService';
import Roulette from './components/Roulette';

const tg = (window as any).Telegram?.WebApp;

const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [bootError, setBootError] = useState(false);
  const [view, setView] = useState<GameView>(GameView.OFFICE);
  const [stats, setStats] = useState<PlayerStats>(() => {
    try {
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
    } catch (e) {
      return {
        balance: 0,
        totalBans: 0,
        totalThrottles: 0,
        rank: RANKS[0].title,
        clickPower: 10,
        multiplier: 1,
        upgrades: []
      };
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
      // Set theme-aware colors
      tg.setHeaderColor(tg.themeParams.secondary_bg_color || '#1a1c1e');
    }
    
    const timer = setTimeout(() => setIsBooting(false), 2000);
    const errorTimer = setTimeout(() => {
      if (isBooting) setBootError(true);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(errorTimer);
    };
  }, [isBooting]);

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
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    }
  };

  const handleSpin = () => {
    setIsSpinning(true);
    setSelectedApp(null);
    setAiReason('');
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
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
          totalThrottles: type === 'THROTTLE' ? prev.totalThrottles + 1 : prev.totalThrottles,
        };
      });
      setSelectedApp(null);
      setShowStamp(null);
    }, 1000);
  };

  if (isBooting) {
    return (
      <div className="h-full w-full bg-[#1a1c1e] text-green-500 p-8 font-mono flex flex-col justify-center items-center text-center">
        <div className="space-y-4">
          <i className="fa-solid fa-server text-5xl mb-4 animate-pulse"></i>
          <p className="text-xl font-black tracking-widest uppercase">Система "БАРЬЕР-2025"</p>
          <div className="w-48 h-1 bg-green-900 mx-auto overflow-hidden rounded-full">
            <div className="h-full bg-green-500 animate-[loading_2s_ease-in-out]"></div>
          </div>
          <p className="text-[10px] opacity-60">ИНИЦИАЛИЗАЦИЯ ПРОТОКОЛОВ...</p>
          
          {bootError && (
            <div className="mt-8 p-4 border border-red-500 bg-red-900/20 text-red-400 text-xs animate-bounce">
              <p className="font-bold">ОШИБКА ЗАГРУЗКИ СКРИПТОВ</p>
              <p>Проверьте соединение или API ключ</p>
              <button onClick={() => window.location.reload()} className="mt-2 underline font-bold">ПЕРЕЗАГРУЗИТЬ</button>
            </div>
          )}
        </div>
        <style>{`@keyframes loading { 0% { width: 0; } 100% { width: 100%; } }`}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-slate-200 overflow-hidden relative border-x-4 border-slate-400 shadow-2xl">
      {/* Top Bar - Now Fixed */}
      <div className="bg-slate-900 text-white p-3 flex justify-between items-center shadow-xl z-20 shrink-0">
        <div className="flex flex-col">
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Гос. счет</span>
          <span className="text-xl font-mono text-green-400 leading-none">₽{stats.balance.toLocaleString()}</span>
        </div>
        <div className="text-right">
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Статус</span>
          <div className="text-[10px] font-bold text-yellow-500 leading-none">{stats.rank}</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative p-4 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-repeat">
        {view === GameView.OFFICE && (
          <div className="flex flex-col h-full animate-in fade-in duration-500">
            {/* Monitor Section */}
            <div 
              className="relative w-full aspect-video bg-slate-800 rounded-lg border-8 border-slate-700 shadow-2xl overflow-hidden mb-6 flex items-center justify-center cursor-pointer group active:scale-95 transition-transform" 
              onClick={() => setView(GameView.ROULETTE)}
            >
              <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
              <div className="text-center z-10">
                <i className="fa-solid fa-desktop text-4xl text-slate-500 mb-2 group-hover:text-green-500 transition-colors"></i>
                <p className="text-green-500 font-mono text-[10px] animate-pulse uppercase tracking-tighter">Терминал: ОНЛАЙН</p>
              </div>
            </div>

            {/* Desk Objects */}
            <div className="flex-1 grid grid-cols-2 gap-4 items-end pb-4">
              {/* Paper Stack - Clicker */}
              <div className="flex flex-col items-center group cursor-pointer" onClick={handlePaperClick}>
                <div className="relative w-24 h-14 bg-white border-x border-t border-slate-300 shadow-lg transform group-active:translate-y-1 transition-transform overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:100%_4px]"></div>
                  <div className="absolute top-2 left-2 right-2 h-0.5 bg-slate-200"></div>
                  <div className="absolute top-4 left-2 right-4 h-0.5 bg-slate-200"></div>
                  <div className="absolute top-6 left-2 right-2 h-0.5 bg-slate-200"></div>
                </div>
                <span className="text-[9px] font-bold mt-2 uppercase text-slate-700 bg-white/80 px-2 rounded-full shadow-sm">ОТЧЕТЫ (КЛИК)</span>
              </div>

              {/* Shop / Telephone */}
              <div className="flex flex-col items-center cursor-pointer group" onClick={() => setView(GameView.SHOP)}>
                <div className="w-20 h-20 bg-slate-800 rounded-t-3xl border-4 border-slate-900 shadow-2xl flex items-center justify-center text-slate-400 transform group-active:scale-90 transition-transform relative">
                   <div className="absolute top-2 w-8 h-1 bg-slate-700 rounded-full"></div>
                  <i className="fa-solid fa-phone-volume text-3xl"></i>
                </div>
                <span className="text-[9px] font-bold mt-2 uppercase text-slate-700 bg-white/80 px-2 rounded-full shadow-sm">СНАБЖЕНИЕ</span>
              </div>
            </div>

            <button 
              onClick={() => setView(GameView.LEADERBOARD)} 
              className="mt-4 py-3 bg-slate-800 text-white font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-slate-950 active:bg-black transition-colors shadow-lg"
            >
              ДОСКА ПОЧЁТА МИНИСТЕРСТВА
            </button>
          </div>
        )}

        {view === GameView.ROULETTE && (
          <div className="h-full flex flex-col bg-white border-4 border-slate-900 p-4 shadow-2xl animate-in zoom-in-95 duration-300">
            <button onClick={() => setView(GameView.OFFICE)} className="mb-4 text-[10px] font-black uppercase text-red-600 flex items-center">
              <i className="fa-solid fa-chevron-left mr-1"></i> ВЕРНУТЬСЯ В КАБИНЕТ
            </button>
            <h2 className="text-center font-black uppercase text-[10px] mb-4 text-slate-500 tracking-widest border-b pb-2">СКАНИРОВАНИЕ ИНФО-ПРОСТРАНСТВА</h2>
            
            <div className="flex-1 flex flex-col justify-center">
              <Roulette onSelected={handleAppSelected} isSpinning={isSpinning} />
              
              {!isSpinning && !selectedApp && (
                <button 
                  onClick={handleSpin} 
                  className="mt-8 py-5 bg-red-700 text-white font-black uppercase tracking-widest shadow-[0_8px_0_rgb(153,27,27)] active:shadow-none active:translate-y-2 transition-all text-lg"
                >
                  ПОИСК НАРУШИТЕЛЕЙ
                </button>
              )}

              {selectedApp && (
                <div className="mt-8 border-4 border-slate-900 p-4 bg-slate-50 relative animate-in slide-in-from-bottom-4">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-white border-2 border-slate-900 flex items-center justify-center text-3xl shadow-md">
                      <i className={`${selectedApp.icon} text-slate-900`}></i>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-black text-xl uppercase leading-none text-slate-900">{selectedApp.name}</h3>
                      <span className="text-[9px] text-red-600 font-bold uppercase tracking-tighter">ИНДЕКС УГРОЗЫ: {selectedApp.dangerLevel}/5</span>
                    </div>
                  </div>
                  <div className="text-[11px] italic mb-6 border-l-4 border-slate-900 pl-3 py-1 bg-slate-200/50 font-medium">
                    {loadingReason ? (
                       <span className="flex items-center"><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> ЗАПРОС К ИИ...</span>
                    ) : (
                       `"${aiReason}"`
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAction('THROTTLE')} 
                      className="flex-1 py-4 bg-yellow-500 text-slate-900 font-black uppercase text-[10px] border-b-4 border-yellow-700 active:border-0 active:translate-y-1 transition-all"
                    >
                      ЗАМЕДЛИТЬ
                    </button>
                    <button 
                      onClick={() => handleAction('BAN')} 
                      className="flex-1 py-4 bg-red-700 text-white font-black uppercase text-[10px] border-b-4 border-red-900 active:border-0 active:translate-y-1 transition-all"
                    >
                      ЗАБЛОКИРОВАТЬ
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {showStamp && (
              <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                <div className="stamp-enter border-[12px] border-red-700 text-red-700 p-6 font-black text-5xl transform rotate-12 bg-white/90 shadow-2xl">
                  {showStamp === 'BAN' ? 'БЛОК' : 'ЗАМЕДЛ'}
                </div>
              </div>
            )}
          </div>
        )}

        {view === GameView.SHOP && (
          <div className="h-full bg-slate-100 border-4 border-slate-900 p-4 shadow-2xl animate-in slide-in-from-right-4 duration-300">
            <button onClick={() => setView(GameView.OFFICE)} className="mb-4 text-[10px] font-bold uppercase underline">← Назад к работе</button>
            <h2 className="text-center font-black uppercase mb-6 border-b-2 border-slate-900 pb-2 italic text-sm">ХОЗЯЙСТВЕННЫЙ ОТДЕЛ</h2>
            <div className="space-y-3">
              {UPGRADES.map(item => (
                <div 
                  key={item.id} 
                  className={`p-3 border-2 border-slate-900 flex items-center bg-white shadow-md transition-all ${stats.upgrades.includes(item.id) ? 'opacity-40 grayscale pointer-events-none' : 'hover:scale-[1.02] cursor-default'}`}
                >
                  <div className="w-10 h-10 flex items-center justify-center text-xl text-white bg-slate-900 mr-3 shadow-inner">
                    <i className={item.icon}></i>
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-[10px] uppercase leading-none mb-1">{item.name}</div>
                    <div className="text-[8px] text-slate-500 leading-tight uppercase font-bold">{item.description}</div>
                  </div>
                  <button 
                    disabled={stats.balance < item.cost || stats.upgrades.includes(item.id)}
                    onClick={() => buyUpgrade(item)}
                    className="ml-2 px-3 py-2 bg-green-700 text-white font-black text-[9px] uppercase shadow-[0_2px_0_rgb(21,128,61)] active:shadow-none active:translate-y-0.5 disabled:bg-slate-300 disabled:shadow-none transition-all"
                  >
                    {stats.upgrades.includes(item.id) ? 'ЕСТЬ' : `₽${item.cost}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === GameView.LEADERBOARD && (
          <div className="h-full bg-white border-4 border-slate-900 p-4 shadow-2xl animate-in slide-in-from-left-4 duration-300">
            <button onClick={() => setView(GameView.OFFICE)} className="mb-4 text-[10px] font-bold uppercase underline">← Вернуться</button>
            <h2 className="text-center font-black uppercase mb-6 text-sm italic tracking-widest border-b-2 border-slate-900 pb-2">ДОСКА ПОЧЕТА</h2>
            <div className="space-y-1">
              {[...MOCK_LEADERBOARD, { name: 'ВЫ (Инспектор)', salary: stats.balance, isPlayer: true }].sort((a, b) => b.salary - a.salary).map((e, i) => (
                <div key={i} className={`flex justify-between items-center p-3 border-b border-slate-100 text-[11px] ${e.isPlayer ? 'bg-yellow-100 font-bold border-2 border-yellow-500 shadow-sm z-10' : ''}`}>
                  <span className="uppercase"><span className="opacity-40 mr-1">{i+1}.</span> {e.name}</span>
                  <span className="font-mono text-green-700">₽{e.salary.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-slate-900 text-white text-[9px] uppercase font-bold text-center leading-tight tracking-tighter">
              СЛУЖИМ ОТЕЧЕСТВУ. СОБЛЮДАЕМ ПРАВИЛА. БЛОКИРУЕМ ЛИШНЕЕ.
            </div>
          </div>
        )}
      </div>

      <div className="p-2 bg-slate-900 text-white text-[7px] text-center uppercase tracking-[0.3em] font-bold shrink-0">
        ЦЕНТРАЛЬНЫЙ АППАРАТ // 2025 // v1.2.0-stable
      </div>
    </div>
  );
};

export default App;
