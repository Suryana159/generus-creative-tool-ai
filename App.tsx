
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Lightbulb, 
  ImageIcon as ImageIcon, 
  Video, 
  Mic2, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  LogOut
} from 'lucide-react';
import { AppStep, GeneratedAsset } from './types';
import IdeaGenerator from './components/IdeaGenerator';
import ImageStudio from './components/ImageStudio';
import VideoStudio from './components/VideoStudio';
import VoiceOverGenerator from './components/VoiceOverGenerator';
import Sidebar from './components/Sidebar';
import LoginGate from './components/LoginGate';

// Window augmentation for Gemini Studio API
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('creative_auth') === 'true';
  });
  const [activeStep, setActiveStep] = useState<AppStep>('idea');
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [sharedPrompt, setSharedPrompt] = useState<string>('');
  const [sharedImage, setSharedImage] = useState<string>('');
  const [sharedVideo, setSharedVideo] = useState<string>('');

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    localStorage.setItem('creative_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('creative_auth');
  };

  if (!isAuthenticated) {
    return <LoginGate onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        activeStep={activeStep} 
        setActiveStep={setActiveStep} 
        onLogout={handleLogout}
      />
      
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 z-10 bg-emerald-950/95 backdrop-blur-md border-b border-emerald-900 px-8 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-900/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Generus AI Creative</h1>
              <p className="text-xs text-emerald-400 uppercase tracking-widest font-bold">Generasi AI Berkelanjutan</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-full border border-indigo-500 text-sm font-medium shadow-lg shadow-indigo-900/40">
              <CheckCircle2 className="w-4 h-4" />
              AI Studio Terhubung
            </div>
            <div className="h-6 w-px bg-emerald-800/50 mx-1" />
            <button 
              onClick={handleLogout}
              className="p-2 text-emerald-600 hover:text-white transition-all rounded-lg hover:bg-red-900/20"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          {activeStep === 'idea' && (
            <IdeaGenerator 
              onPromptGenerated={(prompt) => {
                setSharedPrompt(prompt);
                setActiveStep('image');
              }} 
            />
          )}
          {activeStep === 'image' && (
            <ImageStudio 
              initialPrompt={sharedPrompt}
              onImageGenerated={(img, prompt) => {
                setSharedImage(img);
                setSharedPrompt(prompt);
                setActiveStep('video');
              }}
            />
          )}
          {activeStep === 'video' && (
            <VideoStudio 
              initialPrompt={sharedPrompt}
              initialImage={sharedImage}
              onVideoGenerated={(video) => {
                setSharedVideo(video);
                setActiveStep('voiceover');
              }}
            />
          )}
          {activeStep === 'voiceover' && (
            <VoiceOverGenerator 
              videoUrl={sharedVideo}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
