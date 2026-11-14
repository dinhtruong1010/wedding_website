import { weddingContent, type WeddingContent } from "./wedding-content";

export type WeddingConfig = WeddingContent;

const blobBaseUrl = (import.meta.env.VITE_BLOB_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");

export const weddingConfig: WeddingConfig = {
  ...weddingContent,
  audioUrl: blobBaseUrl ? `${blobBaseUrl}/wedding/audio/Audio.mp3` : weddingContent.audioUrl,
  galleryImages: blobBaseUrl
    ? ["IMG_7737.JPG", "IMG_7739.JPG", "IMG_7740.JPG", "IMG_9526.JPG", "IMG_9527.JPG"].map(
        (file) => `${blobBaseUrl}/wedding/gallery/${file}`,
      )
    : weddingContent.galleryImages,
};
