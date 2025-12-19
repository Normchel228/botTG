
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
type OSState = 'BIOS' | 'DIALUP' | 'DESKTOP';

interface AppState {
  balance: number;
  rank: string;
  isTerminalOpen: boolean;
  isConnecting: boolean;
  isConnected: boolean;
}

// --- Constants ---
const DIALUP_SOUND_URL = "https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Dial+up+modem+sound&filename=mt/MTk5MTk3ODMxOTkxOTgz_p82Rst_2f8Dsc.mp3";

const TARGETS = [
  { name: 'YouTube', threat: 'High' },
  { name: 'Discord', threat: 'Medium' },
  { name: 'Telegram', threat: 'Extreme' },
  { name: 'GitHub', threat: 'Low' },
  { name: 'Wikipedia', threat: 'High' }
];

const App: React.FC = () => {
  const [osState, setOsState] = useState<OSState>('BIOS');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isDialing, setIsDialing] = useState(false);
  const [dialStep, setDialStep] = useState('');
  const [balance, setBalance] = useState(0);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>(["BARRIER-2025 v1.0.4", "READY FOR INPUT..."]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // BIOS Loading Effect
  useEffect(() => {
    if (osState === 'BIOS') {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setOsState('DIALUP'), 1000);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [osState]);

  const startDialing = () => {
    setIsDialing(true);
    setDialStep('Инициализация модема...');
    
    // Play the famous sound
    audioRef.current = new Audio(DIALUP_SOUND_URL);
    audioRef.current.play().catch(e => console.log("Audio play blocked", e));

    const steps = [
      'Набор номера: 8-800-555-35-35...',
      'Удаленный сервер ответил...',
      'Проверка логина и пароля...',
      'Установка связи (56 kbps)...',
      'Вход в сеть министерства...'
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setDialStep(steps[i]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setOsState('DESKTOP'), 1000);
      }
    }, 2500);
  };

  const handleBan = async (target: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setTerminalOutput(prev => [...prev, `> BAN REQUEST: ${target.toUpperCase()}`, "CONNECTING TO GEMINI CENTRAL..."]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Напиши одну смешную, абсурдную бюрократическую причину блокировки сервиса "${target}" на русском языке. Максимум 10 слов.`
      });

      const reason = response.text || "Причина не указана (секретно).";
      setTerminalOutput(prev => [...prev, `SUCCESS: ${reason}`, `REWARD: +₽1000`]);
      setBalance(b => b + 1000);
    } catch (e) {
      setTerminalOutput(prev => [...prev, "ERROR: Connection timed out", "REASON: Too much freedom detected."]);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- RENDERS ---

  if (osState === 'BIOS') {
    return (
      <div className="bg-black text-white h-full p-8 font-mono text-sm leading-tight uppercase">
        <p>Award Modular BIOS v4.51PG, An Energy Star Ally</p>
        <p>Copyright (C) 1984-1998, Award Software, Inc.</p>
        <br />
        <p>Pentium(R) II - MMX(TM) CPU at 233MHz</p>
        <p>Memory Test: {Math.floor(loadingProgress * 640)}KB OK</p>
        <br />
        <p>Detecting Primary Master ... ST34321A</p>
        <p>Detecting Primary Slave  ... None</p>
        <br />
        <p className="animate-pulse">Loading BARRIER.SYS...</p>
        <div className="fixed bottom-10 left-8">
          Press DEL to enter SETUP
        </div>
      </div>
    );
  }

  if (osState === 'DIALUP') {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="win-outset bg-[#c0c0c0] w-full max-w-xs shadow-2xl">
          <div className="win-title-bar">
            <span>Удаленное соединение</span>
            <button className="win-outset bg-[#c0c0c0] px-1 text-black font-bold h-4 flex items-center">×</button>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex gap-4 items-center">
              <i className="fa-solid fa-phone-flip text-3xl text-gray-700"></i>
              <div className="text-xs font-bold">Подключение к: <br/><span className="text-blue-900 underline">GOS-GATE-01</span></div>
            </div>
            
            <div className="win-inset p-2 text-[10px] h-12 flex items-center justify-center text-center">
              {isDialing ? (
                <div className="space-y-2 w-full">
                  <p className="animate-pulse">{dialStep}</p>
                  <div className="w-full h-2 bg-gray-200 win-inset overflow-hidden">
                    <div className="h-full bg-blue-800 animate-[progress_2s_infinite]"></div>
                  </div>
                </div>
              ) : (
                <p>Нажмите "Вызов" для начала сеанса</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button 
                onClick={startDialing}
                disabled={isDialing}
                className="win-outset bg-[#c0c0c0] px-4 py-1 text-xs font-bold active:bg-[#a0a0a0] disabled:opacity-50"
              >
                Вызов
              </button>
              <button className="win-outset bg-[#c0c0c0] px-4 py-1 text-xs font-bold">Отмена</button>
            </div>
          </div>
        </div>
        <style>{`@keyframes progress { 0% { width: 0; } 100% { width: 100%; } }`}</style>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Desktop Area */}
      <div className="flex-1 p-4 grid grid-cols-1 content-start gap-8">
        {/* Desktop Icons */}
        <div 
          className="flex flex-col items-center w-16 group cursor-pointer"
          onDoubleClick={() => setIsTerminalOpen(true)}
          onClick={() => { if(window.innerWidth < 640) setIsTerminalOpen(true); }}
        >
          <div className="w-10 h-10 flex items-center justify-center group-active:opacity-70">
            <i className="fa-solid fa-shield-halved text-3xl text-white drop-shadow-lg"></i>
          </div>
          <span className="text-[10px] text-white bg-black/30 px-1 mt-1 text-center font-bold">Barrier 2025</span>
        </div>

        <div className="flex flex-col items-center w-16 opacity-80">
          <i className="fa-solid fa-trash-can text-3xl text-white drop-shadow-lg"></i>
          <span className="text-[10px] text-white bg-black/30 px-1 mt-1 text-center font-bold">Корзина</span>
        </div>

        {/* Barrier App Window */}
        {isTerminalOpen && (
          <div className="absolute top-10 left-4 right-4 win-outset bg-[#c0c0c0] shadow-2xl z-50">
            <div className="win-title-bar">
              <div className="flex items-center gap-1">
                <i className="fa-solid fa-shield-halved text-[10px]"></i>
                <span>Система контроля №13</span>
              </div>
              <button onClick={() => setIsTerminalOpen(false)} className="win-outset bg-[#c0c0c0] px-1 text-black font-bold h-4 flex items-center">×</button>
            </div>
            
            <div className="p-2 space-y-2">
              <div className="win-inset bg-black text-[#00ff00] p-2 font-mono text-[10px] h-40 overflow-y-auto">
                {terminalOutput.map((line, idx) => <p key={idx}>{line}</p>)}
                {isProcessing && <p className="animate-pulse">_</p>}
              </div>

              <div className="grid grid-cols-1 gap-1">
                <p className="text-[9px] font-bold uppercase text-gray-700">Список нарушителей:</p>
                {TARGETS.map(t => (
                  <div key={t.name} className="flex items-center justify-between win-outset p-1 bg-white/50">
                    <span className="text-[11px] font-bold">{t.name} <span className="text-[8px] text-red-600">[{t.threat}]</span></span>
                    <button 
                      onClick={() => handleBan(t.name)}
                      disabled={isProcessing}
                      className="win-outset bg-[#c0c0c0] text-[9px] px-2 py-0.5 font-bold hover:bg-red-200 transition-colors"
                    >
                      БЛОК
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Taskbar */}
      <div className="h-8 win-outset bg-[#c0c0c0] flex items-center p-1 gap-1 z-[1000]">
        <button className="win-outset flex items-center gap-1 px-2 h-full bg-[#c0c0c0] font-bold text-[11px] active:bg-[#808080]">
          <i className="fa-solid fa-windows text-blue-800"></i>
          Пуск
        </button>
        <div className="win-inset flex-1 h-full bg-[#808080]/10 flex items-center px-2">
          {isTerminalOpen && (
            <div className="win-outset bg-[#c0c0c0] h-full flex items-center px-2 text-[10px] font-bold max-w-[120px] truncate">
              <i className="fa-solid fa-shield-halved mr-1"></i> Barrier 2025
            </div>
          )}
        </div>
        <div className="win-inset h-full flex items-center px-2 text-[10px] font-bold gap-2">
          <i className="fa-solid fa-volume-high opacity-50"></i>
          <span className="text-green-800">₽{balance}</span>
          <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>
    </div>
  );
};

export default App;
