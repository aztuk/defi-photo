export interface LayerConfig {
  speed: number;
  scale: number;
  blur: number;
  zIndex: number;
  minSprites: number;
  maxSprites: number;
}

export interface ParticleConfig {
  count: number;
  minSize: number;
  maxSize: number;
  minSpeed: number;
  maxSpeed: number;
}

export interface GalleryConfig {
  spawnInterval: number;
  maxPhotoSizePercent: number;
  borderWidth: number;
  layers: LayerConfig[];
  particles: ParticleConfig;
}

export const DEFAULT_GALLERY_CONFIG: GalleryConfig = {
  spawnInterval: 1000, // Check every second to fill layers if needed
  maxPhotoSizePercent: 0.35,
  borderWidth: 80,
  particles: {
    count: 300,
    minSize: 1,
    maxSize: 6,
    minSpeed: 0.01,
    maxSpeed: 1.5,
  },
  layers: [
    // zIndex 1 (Back)
    { speed: 0.1, scale: 0.4, blur: 10, zIndex: 1, minSprites: 3, maxSprites: 8 },
    // zIndex 2
    { speed: 0.2, scale: 0.55, blur: 5, zIndex: 2, minSprites: 2, maxSprites: 5 },
    // zIndex 3 (Middle)
    { speed: 0.4, scale: 0.7, blur: 2, zIndex: 3, minSprites: 1, maxSprites: 3 },
    // zIndex 4
    { speed: 0.7, scale: 0.85, blur: 0, zIndex: 4, minSprites: 0, maxSprites: 2 },
    // zIndex 5 (Front)
    { speed: 1.0, scale: 1.0, blur: 0, zIndex: 5, minSprites: 1, maxSprites: 1 },
  ],
};
