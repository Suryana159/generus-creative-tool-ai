
import React, { useState } from 'react';
import { Sparkles, Copy, ChevronRight, Loader2, PartyPopper, Check } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface IdeaGeneratorProps {
  onPromptGenerated: (prompt: string) => void;
}

const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({ onPromptGenerated }) => {
  const [idea, setIdea] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [smartComment, setSmartComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setIsLoading(true);
    setSmartComment('');
    setGeneratedPrompt('');
    setIsCopied(false);
    try {
      const data = await geminiService.generateIdeaToPrompt(idea);
      setGeneratedPrompt(data.refinedPrompt || '');
      setSmartComment(data.smartComment || '');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-3xl bg-yellow-100 p-8 rounded-3xl border-2 border-black shadow-sm">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Pertajam Visi Anda</h2>
        <p className="text-slate-700">Masukkan ide sederhana, dan biarkan Gemini 3 Pro mengubahnya menjadi prompt visual profesional yang sangat detail untuk pembuatan gambar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-yellow-100 p-6 rounded-2xl shadow-sm border-2 border-black space-y-4">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Ide Dasar Anda</label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Contoh: Kota futuristik dengan mobil terbang dan hujan neon..."
              className="w-full h-48 p-4 bg-slate-50 border-2 border-black rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-slate-800"
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading || !idea.trim()}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg border-2 border-black shadow-indigo-600/20"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-amber-400" />}
              Buat Prompt Pro
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-yellow-100 p-6 rounded-2xl shadow-sm border-2 border-black h-full flex flex-col">
            {smartComment && (
              <div className="mb-6 p-4 bg-white/50 border-2 border-dashed border-indigo-300 rounded-xl animate-in zoom-in duration-300">
                <div className="flex gap-3">
                  <PartyPopper className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Apresiasi AI</p>
                    <p className="text-sm text-slate-700 italic leading-relaxed font-medium">"{smartComment}"</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Prompt Hasil Olahan</label>
            </div>
            
            <div className={`flex-1 p-4 bg-slate-50 border-2 border-black rounded-xl overflow-y-auto text-slate-700 leading-relaxed italic ${!generatedPrompt ? 'flex items-center justify-center text-slate-400' : ''}`}>
              {generatedPrompt || 'Prompt detail akan muncul di sini...'}
            </div>

            {generatedPrompt && (
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-4 bg-white text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all border-2 border-black shadow-sm"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-5 h-5 text-green-600" />
                      Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Salin Prompt
                    </>
                  )}
                </button>
                <button
                  onClick={() => onPromptGenerated(generatedPrompt)}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all border-2 border-black shadow-lg shadow-indigo-600/20"
                >
                  Gunakan Prompt
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaGenerator;
