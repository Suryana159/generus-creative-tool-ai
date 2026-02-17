
import React, { useState, useRef } from 'react';
import { ImageIcon, Wand2, Maximize, Trash2, Loader2, Download, Palette, AlertCircle } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { AspectRatio, ImageSize, ImageStyle } from '../types';

interface ImageStudioProps {
  initialPrompt: string;
  onImageGenerated: (image: string, prompt: string) => void;
}

const IMAGE_STYLES: { id: ImageStyle; label: string; prompt: string }[] = [
  { id: 'none', label: 'Default', prompt: '' },
  { id: 'realistic', label: 'Realistis', prompt: 'Professional photography, ultra-realistic, 8k, highly detailed, sharp focus' },
  { id: 'cinematic', label: 'Sinematik', prompt: 'Cinematic lighting, dramatic atmosphere, 35mm lens, film grain, epic composition' },
  { id: 'anime', label: 'Anime', prompt: 'Anime style, vibrant colors, clean lines, high-quality illustration, studio ghibli aesthetic' },
  { id: 'digital_art', label: 'Seni Digital', prompt: 'Digital art, concept art, intricate details, trending on ArtStation, masterpiece' },
  { id: '3d_render', label: 'Render 3D', prompt: 'Octane render, Unreal Engine 5, 3D model, isometric, soft shadows, ray tracing' },
  { id: 'oil_painting', label: 'Lukisan Minyak', prompt: 'Oil painting, thick brushstrokes, classical art, canvas texture, museum quality' },
  { id: 'pixel_art', label: 'Seni Piksel', prompt: 'Pixel art, 16-bit, nostalgic, game asset, detailed sprites' },
  { id: 'sketch', label: 'Sketsa', prompt: 'Pencil sketch, hand-drawn, charcoal, artistic, expressive lines, white background' },
];

const ImageStudio: React.FC<ImageStudioProps> = ({ initialPrompt, onImageGenerated }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('none');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatios: AspectRatio[] = ['1:1', '3:4', '4:3', '9:16', '16:9'];
  const sizes: ImageSize[] = ['1K', '2K', '4K'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSourceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    
    const styleObj = IMAGE_STYLES.find(s => s.id === selectedStyle);
    const finalPrompt = selectedStyle !== 'none' 
      ? `${styleObj?.prompt}, ${prompt}` 
      : prompt;

    try {
      const img = await geminiService.generateImage({
        prompt: finalPrompt,
        aspectRatio,
        imageSize,
        sourceImage: sourceImage || undefined
      });
      setGeneratedImage(img);
    } catch (err: any) {
      console.error(err);
      if (err.message === "API_KEY_EXPIRED") {
        setError("API Key tidak valid atau telah kadaluarsa. Silakan refresh halaman atau hubungi admin.");
      } else {
        setError(err.message || "Gagal membuat gambar. Pastikan prompt aman dan API Key Anda aktif (Tier Berbayar diperlukan untuk model Pro).");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `creative-ai-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearResult = () => {
    setGeneratedImage(null);
    setError(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-3xl bg-yellow-100 p-8 rounded-3xl border-2 border-black shadow-sm">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Studio Gambar</h2>
        <p className="text-slate-700">Buat visual berkualitas tinggi menggunakan Nano Banana Pro. Anda juga dapat mengunggah gambar referensi untuk sintesis gambar-ke-gambar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-yellow-100 p-6 rounded-2xl shadow-sm border-2 border-black space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Jelaskan gambar Anda secara detail..."
                className="w-full h-32 p-4 bg-slate-50 border-2 border-black rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm transition-all resize-none text-slate-800"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4 text-indigo-500" />
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Gaya Visual</label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {IMAGE_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`py-2 text-[10px] font-bold rounded-lg border-2 transition-all ${
                      selectedStyle === style.id 
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700' 
                        : 'bg-white text-slate-500 border-black hover:bg-slate-50'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Rasio Aspek</label>
              <div className="grid grid-cols-3 gap-2">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-2 text-xs font-semibold rounded-lg border-2 transition-all ${
                      aspectRatio === ratio 
                        ? 'bg-indigo-600 text-white border-black shadow-sm' 
                        : 'bg-white text-slate-600 border-black hover:bg-slate-50'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Kualitas Output</label>
              <div className="flex gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setImageSize(size)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border-2 transition-all ${
                      imageSize === size 
                        ? 'bg-slate-900 text-white border-black' 
                        : 'bg-white text-slate-600 border-black hover:bg-slate-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Gambar Referensi (Opsional)</label>
              {!sourceImage ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-black rounded-xl text-slate-400 hover:border-indigo-400 hover:text-indigo-400 transition-all flex flex-col items-center gap-2 bg-slate-50"
                >
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xs font-medium">Klik untuk unggah</span>
                </button>
              ) : (
                <div className="relative group rounded-xl overflow-hidden aspect-video border-2 border-black">
                  <img src={sourceImage} alt="Referensi" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => setSourceImage(null)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg border-2 border-black disabled:opacity-50 shadow-indigo-600/20"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              Buat Gambar
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border-2 border-black overflow-hidden min-h-[600px] flex flex-col items-center justify-center relative">
            {error && (
              <div className="absolute top-6 left-6 right-6 p-4 bg-red-50 border-2 border-black rounded-xl flex gap-3 text-red-800 z-10 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {isGenerating ? (
              <div className="flex flex-col items-center gap-4 text-slate-400 animate-pulse">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                <p className="font-medium text-slate-600">Mensintesis Piksel...</p>
              </div>
            ) : generatedImage ? (
              <>
                <div className="w-full h-full flex items-center justify-center p-8 bg-slate-900">
                  <img 
                    src={generatedImage} 
                    alt="Hasil" 
                    className="max-w-full max-h-[70vh] shadow-2xl rounded-lg object-contain" 
                  />
                </div>
                <div className="absolute bottom-6 right-6 flex flex-wrap justify-end gap-3">
                  <button
                    onClick={handleClearResult}
                    className="p-4 bg-white text-red-500 rounded-xl font-bold flex items-center gap-2 hover:bg-red-50 transition-all shadow-xl border-2 border-black group"
                    title="Hapus Hasil"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-6 py-4 bg-white text-slate-900 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-100 transition-all shadow-xl border-2 border-black group"
                  >
                    <Download className="w-5 h-5 group-hover:bounce" />
                    Unduh
                  </button>
                  <button
                    onClick={() => onImageGenerated(generatedImage, prompt)}
                    className="px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl border-2 border-black"
                  >
                    Gunakan di Video
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 text-slate-300">
                <ImageIcon className="w-24 h-24 stroke-[1]" />
                <p className="font-medium text-lg text-slate-400">Karya agung Anda akan muncul di sini</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;
