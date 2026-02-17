
export type AppStep = 'idea' | 'image' | 'video' | 'voiceover';

export interface GeneratedAsset {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  prompt: string;
  metadata?: any;
}

// Supported aspect ratios are "1:1", "3:4", "4:3", "9:16", and "16:9".
export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
export type ImageSize = '1K' | '2K' | '4K';

export type ImageStyle = 
  | 'none' 
  | 'realistic' 
  | 'cinematic' 
  | 'anime' 
  | 'digital_art' 
  | '3d_render' 
  | 'oil_painting' 
  | 'pixel_art' 
  | 'sketch';

export interface ImageGenerationOptions {
  prompt: string;
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
  style: ImageStyle;
  sourceImage?: string; // For image-to-image
}

export interface VideoGenerationOptions {
  prompt: string;
  image?: string;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}

export interface VoiceOverOptions {
  text: string;
  voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
}
