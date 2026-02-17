
import React, { useState, useRef } from 'react';
import { Mic2, Play, Pause, Loader2, Volume2, Save, Download } from 'lucide-react';
import { geminiService, decodeAudioData, decode } from '../services/geminiService';

interface VoiceOverGeneratorProps {
  videoUrl?: string;
}

const VoiceOverGenerator: React.FC<VoiceOverGeneratorProps> = ({ videoUrl }) => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState<'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr'>('Zephyr');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const voices = [
    { id: 'Kore', name: 'Kore', gender: 'Wanita', desc: 'Hangat & Profesional' },
    { id: 'Puck', name: 'Puck', gender: 'Pria', desc: 'Enerjik & Ceria' },
    { id: 'Charon', name: 'Charon', gender: 'Pria', desc: 'Dalam & Berwibawa' },
    { id: 'Fenrir', name: 'Fenrir', gender: 'Pria', desc: 'Berani & Sinematik' },
    { id: 'Zephyr', name: 'Zephyr', gender: 'Wanita', desc: 'Lembut & Ramah' },
  ];

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    try {
      const base64 = await geminiService.generateVoiceOver(text, voice);
      setAudioBase64(base64);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadAudio = () => {
    if (!audioBase64) return;
    const binary = decode(audioBase64);
    const blob = new Blob([binary], { type: 'audio/pcm' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `voiceover-${voice.toLowerCase()}-${Date.now()}.pcm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const playAudio = async () => {
    if (!audioBase64) return;
    
    if (isPlaying && sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      setIsPlaying(false);
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    const ctx = audioContextRef.current;
    const binary = decode(audioBase64);
    const audioBuffer = await decodeAudioData(binary, ctx, 24000, 1);
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    
    source.onended = () => setIsPlaying(false);
    
    source.start();
    sourceNodeRef.current = source;
    setIsPlaying(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-3xl bg-yellow-100 p-8 rounded-3xl border-2 border-black shadow-sm">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Pengisi Suara</h2>
        <p className="text-slate-700">Berikan narator profesional untuk video Anda. Pilih dari berbagai suara AI ekspresif yang didukung oleh Gemini 2.5 Flash TTS.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-yellow-100 p-6 rounded-2xl shadow-sm border-2 border-black space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Naskah</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tulis narasi untuk video Anda..."
                className="w-full h-48 p-4 bg-slate-50 border-2 border-black rounded-xl focus:ring-2 focus:ring-rose-500 text-sm transition-all resize-none text-slate-800"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Pilih Suara</label>
              <div className="grid grid-cols-1 gap-2">
                {voices.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVoice(v.id as any)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      voice === v.id 
                        ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-sm' 
                        : 'bg-white border-black text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${voice === v.id ? 'bg-rose-200' : 'bg-slate-100'}`}>
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm">{v.name}</p>
                        <p className="text-[10px] opacity-70 uppercase font-bold">{v.desc}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 rounded text-slate-500">{v.gender}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !text.trim()}
              className="w-full py-4 bg-rose-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-700 transition-all shadow-lg border-2 border-black disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic2 className="w-5 h-5" />}
              Buat Narasi
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl shadow-sm border-2 border-black overflow-hidden min-h-[500px] flex flex-col">
            <div className="flex-1 relative">
              {videoUrl ? (
                <video src={videoUrl} className="w-full h-full object-cover opacity-50" muted loop autoPlay />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700">
                  <Play className="w-20 h-20 opacity-20" />
                </div>
              )}
              
              <div className="absolute inset-0 flex items-center justify-center">
                {audioBase64 ? (
                  <button
                    onClick={playAudio}
                    className="w-24 h-24 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-2xl"
                  >
                    {isPlaying ? <Pause className="w-10 h-10 fill-white" /> : <Play className="w-10 h-10 fill-white ml-2" />}
                  </button>
                ) : (
                  <div className="text-center space-y-2">
                    <Mic2 className="w-12 h-12 text-slate-500 mx-auto" />
                    <p className="text-slate-500 font-medium">Buat suara untuk melihat pratinjau</p>
                  </div>
                )}
              </div>
            </div>

            {audioBase64 && (
              <div className="p-8 bg-slate-800/50 border-t-2 border-black flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold">Narator {voice}</h4>
                  <p className="text-slate-400 text-sm">Menyinkronkan pratinjau video...</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleDownloadAudio}
                    className="flex items-center gap-2 px-4 py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-all shadow-lg border border-white/10"
                  >
                    <Download className="w-5 h-5" />
                    Unduh
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all border-2 border-black">
                    <Save className="w-5 h-5" />
                    Simpan Hasil Akhir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceOverGenerator;
