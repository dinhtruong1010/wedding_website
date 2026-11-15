import weddingContent from "./wedding-content.json";

export interface WeddingConfig {
  groomName: string;
  brideName: string;
  weddingDate: string;
  weddingTime: string;
  locationName: string;
  locationAddress: string;
  googleMapsUrl: string;
  groomGiftQrCode: string;
  brideGiftQrCode: string;
  heroImages: {
    mobile: ResponsiveImageSource;
    tablet: ResponsiveImageSource;
    desktop: ResponsiveImageSource;
  };
  storyImage: string;
  storyImages: string[];
  galleryImages: string[];
  audioUrl: string;
}

export interface ResponsiveImageSource {
  avif?: string;
  webp?: string;
  fallback: string;
}

const blobBaseUrl = (import.meta.env.VITE_BLOB_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");

export const weddingConfig: WeddingConfig = {
  ...weddingContent,
  storyImages: blobBaseUrl
    ? [
        `${blobBaseUrl}/wedding/story/story_1.jpg`,
        `${blobBaseUrl}/wedding/story/story_2.jpg`,
        `${blobBaseUrl}/wedding/story/story_3.jpg`,
        `${blobBaseUrl}/wedding/story/story_4.jpg`,
        `${blobBaseUrl}/wedding/story/story_4.jpg`,
        `${blobBaseUrl}/wedding/story/story_6.jpg`,
        `${blobBaseUrl}/wedding/story/story_6.jpg`,
        `${blobBaseUrl}/wedding/story/story_8.jpg`,
      ]
    : weddingContent.storyImages,
  audioUrl: blobBaseUrl ? `${blobBaseUrl}/wedding/audio/Audio.mp3` : weddingContent.audioUrl,
  galleryImages: blobBaseUrl
    ? ["IMG_7737.JPG", "IMG_7739.JPG", "IMG_7740.JPG", "IMG_9526.JPG", "IMG_9527.JPG", "IMG_9528.JPG"].map(
        (file) => `${blobBaseUrl}/wedding/gallery/${file}`,
      )
    : weddingContent.galleryImages,
};
