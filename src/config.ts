export interface WeddingConfig {
  groomName: string;
  brideName: string;
  weddingDate: string; // ISO format or human readable
  weddingTime: string;
  locationName: string;
  locationAddress: string;
  googleMapsUrl: string;
  heroImage: string;
  storyImage: string;
  galleryImages: string[];
  story: string;
}

export const weddingConfig: WeddingConfig = {
  groomName: "Đình Trường",
  brideName: "Thanh Ngà",
  weddingDate: "2026-12-20",
  weddingTime: "17:00",
  locationName: "The Grand Palace",
  locationAddress: "123 Wedding St, Love City, Nghệ An",
  googleMapsUrl: "https://goo.gl/maps/example",
  heroImage: "/data/1JD0URKE8_6FLIUL.JPG",
  storyImage: "/data/1JDID6VFI_6FLIUL.JPG",
  galleryImages: [
    "/data/IMG_7737.JPG",
    "/data/IMG_7739.JPG",
    "/data/IMG_7740.JPG",
    "/data/IMG_9526.JPG",
    "/data/IMG_9527.JPG",
  ],
  story: "Our journey began five years ago, and now we're ready to start our forever together. We can't wait to celebrate this special day with all of you!",
};
