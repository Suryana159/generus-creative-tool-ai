
import React from 'react';
import { Lightbulb, Image as ImageIcon, Video, Mic2, LogOut } from 'lucide-react';
import { AppStep } from '../types';

interface SidebarProps {
  activeStep: AppStep;
  setActiveStep: (step: AppStep) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeStep, setActiveStep, onLogout }) => {
  const steps = [
    { id: 'idea', label: 'Ide ke Prompt', icon: Lightbulb, color: 'text-amber-400', bg: 'bg-amber-950/50' },
    { id: 'image', label: 'Studio Gambar', icon: ImageIcon, color: 'text-blue-400', bg: 'bg-blue-950/50' },
    { id: 'video', label: 'Studio Video', icon: Video, color: 'text-purple-400', bg: 'bg-purple-950/50' },
    { id: 'voiceover', label: 'Pengisi Suara', icon: Mic2, color: 'text-rose-400', bg: 'bg-rose-950/50' },
  ];

  return (
    <aside className="w-72 bg-red-950 border-r border-red-900 flex flex-col transition-colors duration-300">
      <div className="p-8 flex-1">
        <nav className="space-y-2">
          {steps.map((step) => {
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id as AppStep)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? `${step.bg} ${step.color} shadow-lg ring-1 ring-inset ring-red-800` 
                    : 'text-red-300 hover:bg-red-900/50 hover:text-white'
                }`}
              >
                <step.icon className={`w-5 h-5 ${isActive ? step.color : 'text-red-400/70'}`} />
                <span className="font-semibold text-sm">{step.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-8 space-y-4 border-t border-red-900">
        <div className="bg-red-900/40 rounded-2xl p-5 text-white shadow-lg overflow-hidden relative border border-red-800">
          <div className="relative z-10">
            <h3 className="font-bold text-sm mb-1">Generus AI Creative</h3>
            <p className="text-xs text-red-200 leading-tight">Didukung oleh Gemini 3 & Veo 3.1</p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-red-500/10 rounded-full blur-2xl" />
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500 hover:text-white transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Keluar ke Gerbang
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
