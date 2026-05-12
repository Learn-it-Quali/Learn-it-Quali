import { useState } from 'react';
import { Lock, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

interface LoginScreenProps { onLogin: () => void; }

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Quali26') { setError(false); onLogin(); }
    else { setError(true); setShake(true); setTimeout(() => setShake(false), 500); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-teal-800 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute text-white/10 animate-bounce" style={{ left: `${10 + i * 16}%`, top: `${15 + (i % 3) * 25}%`, animationDelay: `${i * 0.5}s`, animationDuration: `${3 + i * 0.5}s`, fontSize: `${20 + i * 5}px` }}>
            {['📚', '🧠', '💡', '✏️', '🎯', '⭐'][i]}
          </div>
        ))}
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-lg rounded-2xl mb-4 border border-white/20 shadow-2xl">
            <BookOpen className="w-10 h-10 text-emerald-300" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight">
            Learn<span className="text-emerald-400">It</span>
          </h1>
          <p className="text-green-200 mt-2 text-lg flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" /> Deine Lernplattform <Sparkles className="w-4 h-4 text-yellow-400" />
          </p>
        </div>
        <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl transition-transform ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-green-200 mb-2">Passwort eingeben</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="w-5 h-5 text-green-300" /></div>
                <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(false); }} placeholder="Passwort..."
                  className={`w-full pl-12 pr-4 py-4 bg-white/10 border-2 rounded-xl text-white placeholder-green-300/50 focus:outline-none focus:ring-0 text-lg transition-colors ${error ? 'border-red-400 bg-red-500/10' : 'border-white/20 focus:border-emerald-400/60 hover:border-white/30'}`} autoFocus />
              </div>
              {error && <p className="text-red-300 text-sm mt-2">✗ Falsches Passwort. Bitte versuche es erneut.</p>}
            </div>
            <button type="submit" className="w-full py-4 bg-gradient-to-r from-emerald-400 to-green-500 text-gray-900 font-bold text-lg rounded-xl hover:from-emerald-300 hover:to-green-400 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
              Einloggen <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
        <p className="text-center text-green-300/50 text-sm mt-6">🔒 Deine Daten werden lokal gespeichert</p>
        <p className="text-center text-green-300/30 text-xs mt-3">💎 von Michi Bombe gemacht 💎</p>
      </div>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-10px)} 40%{transform:translateX(10px)} 60%{transform:translateX(-10px)} 80%{transform:translateX(10px)} }`}</style>
    </div>
  );
}
