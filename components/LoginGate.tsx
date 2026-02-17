
import React, { useState } from 'react';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginGateProps {
  onAuthenticated: () => void;
}

// Custom Seahorse SVG component since it's not available in Lucide
const SeahorseIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 11.5c.3 0 .5.1.5.5 0 1.5-1.5 3-4 3-1.5 0-3-.5-3-2s1.5-1.5 1.5-3.5c0-2.5-1.5-4-4.5-4-1 0-2 .5-2 1.5s1 1.5 2 1.5c1.5 0 2.5 1.5 2.5 3.5 0 3-2.5 5.5-4 7.5-.5.5-.5 1.5 0 2 1 1 3.5 2 6 2 4.5 0 7.5-3 7.5-7.5 0-1.5-.5-3-1.5-4l-1 1z" />
    <circle cx="9" cy="5" r="0.5" fill="currentColor" />
  </svg>
);

const LoginGate: React.FC<LoginGateProps> = ({ onAuthenticated }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Kredensial Statis sebagai Contoh
    if (userId === 'admin' && password === 'creative2025') {
      onAuthenticated();
    } else {
      setError('User ID atau Password salah. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-950 relative overflow-hidden p-6">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-500">
        <div className="bg-white/5 backdrop-blur-xl border-4 border-white rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/30">
              <SeahorseIcon className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Gate Pass</h1>
            <p className="text-slate-200/70 text-sm">Silakan masuk untuk mengakses Generus AI Creative</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-widest ml-1">User ID</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
                  placeholder="Masukkan ID Anda"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-200 bg-red-400/20 p-3 rounded-lg border border-red-400/30 animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-xs font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/40 active:scale-[0.98]"
            >
              Sign In
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-slate-400 text-xs">
              Gunakan kredensial default untuk demo: <br/>
              <span className="text-slate-300 font-mono">admin / creative2025</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginGate;
