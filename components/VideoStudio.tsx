
import React, { useState } from 'react';
import { Video, Wand2, Loader2, Download, Play, ChevronRight, AlertCircle } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface VideoStudioProps {
  initialPrompt: string;
  initialImage?: string;
  onVideoGenerated: (video: string) => void;
}

const VideoStudio: React.FC<VideoStudioProps> = ({ initialPrompt, initialImage, onVideoGenerated }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const messages = [
    "Menganalisis isyarat visual...",
    "Membangun konsistensi temporal...",
    "Veo 3.1 sedang melukis visi Anda...",
    "Menyelesaikan proses render...",
    "Mengoptimalkan kompresi video..."
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    let msgIndex = 0;
    setStatusMessage(messages[0]);
    
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      setStatusMessage(messages[msgIndex]);
    }, 12000);

    try {
      const videoUrl = await geminiService.generateVideo({
        prompt,
        image: initialImage,
        aspectRatio,
        resolution
      });
      setGeneratedVideo(videoUrl);
      clearInterval(interval);
    } catch (err: any) {
      console.error(err);
      clearInterval(interval);
      if (err.message === "API_KEY_EXPIRED") {
        setError("API Key tidak valid untuk layanan Veo. Pastikan Anda menggunakan kunci dari Paid Project.");
      } else {
        setError(err.message || "Gagal membuat video. Veo memerlukan API Key berbayar dan prompt yang aman.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-3xl bg-yellow-100 p-8 rounded-3xl border-2 border-black shadow-sm">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Studio Video</h2>
        <p className="text-slate-700">Hidupkan gambar Anda dengan Veo 3.1. Generasi gerakan fidelitas tinggi dengan kualitas sinematik.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-yellow-100 p-6 rounded-2xl shadow-sm border-2 border-black space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Prompt Gerakan</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Jelaskan bagaimana objek harus bergerak..."
                className="w-full h-32 p-4 bg-slate-50 border-2 border-black rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm transition-all resize-none text-slate-800"
              />
            </div>

            {initialImage && (
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Bingkai Referensi</label>
                <div className="aspect-video rounded-xl overflow-hidden border-2 border-black">
                  <img src={initialImage} alt="Bingkai awal" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Konfigurasi</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Rasio Aspek</span>
                  <select 
                    value={aspectRatio} 
                    onChange={(e) => setAspectRatio(e.target.value as any)}
                    className="w-full p-2.5 bg-white border-2 border-black rounded-lg text-sm text-slate-800"
                  >
                    <option value="16:9">Lanskap (16:9)</option>
                    <option value="9:16">Potret (9:16)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Resolusi</span>
                  <select 
                    value={resolution} 
                    onChange={(e) => setResolution(e.target.value as any)}
                    className="w-full p-2.5 bg-white border-2 border-black rounded-lg text-sm text-slate-800"
                  >
                    <option value="1080p">Tinggi (1080p)</option>
                    <option value="720p">Standar (720p)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/50 rounded-xl border-2 border-dashed border-black/20 flex gap-3 text-slate-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <p>Pembuatan video memakan waktu sekitar 2-5 menit. Harap tetap di halaman ini.</p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg border-2 border-black disabled:opacity-50 shadow-indigo-600/20"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              Buat Video Sinematik
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-3xl shadow-sm border-2 border-black overflow-hidden min-h-[500px] flex flex-col items-center justify-center relative">
            {error && (
              <div className="absolute top-6 left-6 right-6 p-4 bg-red-900/80 border-2 border-black rounded-xl flex gap-3 text-white z-10 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {isGenerating ? (
              <div className="flex flex-col items-center gap-8 text-center px-12">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-indigo-500/30 animate-pulse" />
                  <div className="absolute inset-0 w-24 h-24 rounded-full border-t-4 border-indigo-500 animate-spin" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">{statusMessage}</h3>
                  <p className="text-slate-500 text-sm">Veo sedang memproses permintaan sinematik Anda. Kualitas membutuhkan waktu.</p>
                </div>
              </div>
            ) : generatedVideo ? (
              <div className="w-full h-full flex flex-col">
                <video 
                  src={generatedVideo} 
                  controls 
                  className="w-full aspect-video bg-black shadow-2xl"
                  autoPlay
                  loop
                />
                <div className="p-6 bg-slate-800 flex items-center justify-between border-t-2 border-black">
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs font-semibold">Veo 3.1 Fast</span>
                    <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs font-semibold">{resolution}</span>
                  </div>
                  <div className="flex gap-3">
                    <a 
                      href={generatedVideo} 
                      download="creative-video.mp4"
                      className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all text-sm font-semibold border border-white/20"
                    >
                      <Download className="w-4 h-4" />
                      Unduh
                    </a>
                    <button
                      onClick={() => onVideoGenerated(generatedVideo)}
                      className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-bold shadow-lg border-2 border-black"
                    >
                      Tambah Pengisi Suara
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-slate-600">
                <Video className="w-24 h-24 stroke-[1]" />
                <p className="font-medium text-lg">Video sinematik Anda akan muncul di sini</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;
