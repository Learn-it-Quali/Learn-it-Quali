import { useState, useEffect, useRef, useCallback } from 'react';
import { PomodoroSettings } from '../types';
import { Play, Pause, RotateCcw, Settings, ChevronUp, ChevronDown, X, Check, Volume2, VolumeX } from 'lucide-react';

interface PomodoroTimerProps {
  settings: PomodoroSettings;
  onUpdateSettings: (settings: PomodoroSettings) => void;
  onBack: () => void;
}

type TimerMode = 'work' | 'break' | 'longBreak';

export default function PomodoroTimer({ settings, onUpdateSettings, onBack }: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalTime = mode === 'work' ? settings.workMinutes * 60 : mode === 'break' ? settings.breakMinutes * 60 : settings.longBreakMinutes * 60;
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  const playSound = useCallback(() => {
    if (!soundEnabled) return;
    // Create a simple beep using Web Audio API
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      osc.start();
      setTimeout(() => { osc.stop(); ctx.close(); }, 300);
      setTimeout(() => {
        const ctx2 = new AudioContext();
        const osc2 = ctx2.createOscillator();
        const gain2 = ctx2.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx2.destination);
        osc2.frequency.value = 1000;
        gain2.gain.value = 0.3;
        osc2.start();
        setTimeout(() => { osc2.stop(); ctx2.close(); }, 300);
      }, 400);
    } catch (e) {
      // Audio not available
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            playSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, playSound]);

  const handleTimerEnd = () => {
    if (mode === 'work') {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      if (newSessions % settings.sessionsBeforeLongBreak === 0) {
        switchMode('longBreak');
      } else {
        switchMode('break');
      }
    } else {
      switchMode('work');
    }
  };

  useEffect(() => {
    if (timeLeft === 0 && !isRunning) {
      handleTimerEnd();
    }
  }, [timeLeft, isRunning]);

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    switch (newMode) {
      case 'work': setTimeLeft(settings.workMinutes * 60); break;
      case 'break': setTimeLeft(settings.breakMinutes * 60); break;
      case 'longBreak': setTimeLeft(settings.longBreakMinutes * 60); break;
    }
  };

  const reset = () => {
    setIsRunning(false);
    switch (mode) {
      case 'work': setTimeLeft(settings.workMinutes * 60); break;
      case 'break': setTimeLeft(settings.breakMinutes * 60); break;
      case 'longBreak': setTimeLeft(settings.longBreakMinutes * 60); break;
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const modeConfig = {
    work: { label: 'Lernen', emoji: '🧠', color: 'from-rose-500 to-pink-600', bg: 'bg-rose-500', inactiveBg: 'bg-rose-100 dark:bg-rose-900/30', inactiveText: 'text-rose-600 dark:text-rose-400' },
    break: { label: 'Pause', emoji: '☕', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500', inactiveBg: 'bg-emerald-100 dark:bg-emerald-900/30', inactiveText: 'text-emerald-600 dark:text-emerald-400' },
    longBreak: { label: 'Lange Pause', emoji: '🌴', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-500', inactiveBg: 'bg-blue-100 dark:bg-blue-900/30', inactiveText: 'text-blue-600 dark:text-blue-400' },
  };

  const currentConfig = modeConfig[mode];
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentConfig.color} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-white/70 hover:text-white text-sm font-medium">
            ← Zurück
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex bg-white/10 backdrop-blur rounded-2xl p-1 mb-8">
          {(['work', 'break', 'longBreak'] as TimerMode[]).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                mode === m ? 'bg-white text-gray-900 shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {modeConfig[m].emoji} {modeConfig[m].label}
            </button>
          ))}
        </div>

        {/* Timer circle */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <svg width="280" height="280" className="transform -rotate-90">
              <circle cx="140" cy="140" r="120" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
              <circle
                cx="140" cy="140" r="120" fill="none" stroke="white" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-black text-white tracking-tight">{formatTime(timeLeft)}</span>
              <span className="text-white/60 text-sm mt-2">{currentConfig.label}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button onClick={reset} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-colors">
            <RotateCcw className="w-6 h-6" />
          </button>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-10 py-5 bg-white text-gray-900 font-black text-lg rounded-2xl hover:bg-yellow-400 transition-all shadow-2xl active:scale-95"
          >
            {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
          </button>
          <div className="p-4 bg-white/10 rounded-2xl text-white text-center">
            <span className="text-2xl font-black">{sessions}</span>
            <p className="text-xs text-white/60">Sessions</p>
          </div>
        </div>

        {/* Session dots */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[...Array(settings.sessionsBeforeLongBreak)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < (sessions % settings.sessionsBeforeLongBreak) ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
          <span className="text-white/50 text-xs ml-2">bis zur langen Pause</span>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-20">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">⚙️ Timer Einstellungen</h3>
              <button onClick={() => setShowSettings(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <SettingRow label="Lernen (Min)" value={settings.workMinutes} onChange={v => onUpdateSettings({...settings, workMinutes: v})} />
              <SettingRow label="Pause (Min)" value={settings.breakMinutes} onChange={v => onUpdateSettings({...settings, breakMinutes: v})} />
              <SettingRow label="Lange Pause (Min)" value={settings.longBreakMinutes} onChange={v => onUpdateSettings({...settings, longBreakMinutes: v})} />
              <SettingRow label="Sessions bis lange Pause" value={settings.sessionsBeforeLongBreak} onChange={v => onUpdateSettings({...settings, sessionsBeforeLongBreak: v})} />
            </div>
            <button onClick={() => { setShowSettings(false); reset(); }} className="w-full mt-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> Speichern & Zurücksetzen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(Math.max(1, value - 1))} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <span className="w-10 text-center font-bold text-gray-900 dark:text-white">{value}</span>
        <button onClick={() => onChange(Math.min(120, value + 1))} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </div>
  );
}
