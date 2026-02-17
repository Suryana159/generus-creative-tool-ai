
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Audio utility functions
export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const geminiService = {
  async generateIdeaToPrompt(rawIdea: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Idea from user: "${rawIdea}". 
      Perform two tasks:
      1. Refine this idea into a professional, highly detailed visual prompt for image generation.
      2. Write a short, smart, and enthusiastic praise for the user's creativity in Indonesian (Bahasa Indonesia) to make them feel inspired and happy about their unique idea. Ensure the tone is warm and encouraging.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            refinedPrompt: { type: Type.STRING, description: "The professional visual prompt." },
            smartComment: { type: Type.STRING, description: "A witty, smart praise for the user's creativity in Indonesian." }
          },
          required: ["refinedPrompt", "smartComment"]
        }
      }
    });
    
    try {
      return JSON.parse(response.text);
    } catch (e) {
      // Fallback if JSON parsing fails
      return { 
        refinedPrompt: response.text, 
        smartComment: "Wah, itu ide yang luar biasa! Imajinasi Anda benar-benar menginspirasi. Mari kita wujudkan!" 
      };
    }
  },

  async generateImage(options: { prompt: string; aspectRatio: string; imageSize: string; sourceImage?: string }) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = (options.imageSize === '2K' || options.imageSize === '4K') 
      ? 'gemini-3-pro-image-preview' 
      : 'gemini-2.5-flash-image';

    const parts: any[] = [{ text: options.prompt }];
    
    if (options.sourceImage) {
      const mimeType = options.sourceImage.match(/data:(.*?);/)?.[1] || 'image/png';
      const base64Data = options.sourceImage.split(',')[1];
      parts.unshift({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: options.aspectRatio as any,
            imageSize: options.imageSize as any
          }
        }
      });

      const candidate = response.candidates?.[0];
      if (!candidate || !candidate.content?.parts) {
        throw new Error("Model did not return any content. This might be due to safety filters.");
      }

      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      
      throw new Error("No image data found in the response parts.");
    } catch (error: any) {
      console.error("Image Generation Error:", error);
      if (error.message?.includes("entity was not found")) {
        throw new Error("API_KEY_EXPIRED");
      }
      throw error;
    }
  },

  async generateVideo(options: { prompt: string; image?: string; aspectRatio: '16:9' | '9:16'; resolution: '720p' | '1080p' }) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const videoConfig: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: options.prompt,
      config: {
        numberOfVideos: 1,
        resolution: options.resolution,
        aspectRatio: options.aspectRatio
      }
    };

    if (options.image) {
      const mimeType = options.image.match(/data:(.*?);/)?.[1] || 'image/png';
      const base64Data = options.image.split(',')[1];
      videoConfig.image = {
        imageBytes: base64Data,
        mimeType: mimeType
      };
    }

    try {
      let operation = await ai.models.generateVideos(videoConfig);
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video generation failed to provide a download link.");
      
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      if (!response.ok) throw new Error("Failed to fetch generated video content.");
      
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error: any) {
      console.error("Video Generation Error:", error);
      if (error.message?.includes("entity was not found")) {
        throw new Error("API_KEY_EXPIRED");
      }
      throw error;
    }
  },

  async generateVoiceOver(text: string, voiceName: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("Voice generation did not return audio data.");
      return base64Audio;
    } catch (error: any) {
      console.error("TTS Error:", error);
      throw error;
    }
  }
};
