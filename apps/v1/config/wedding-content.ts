export interface WeddingContent {
  groomName: string;
  brideName: string;
  weddingDate: string;
  weddingTime: string;
  locationName: string;
  locationAddress: string;
  googleMapsUrl: string;
  groomGiftQrCode: string;
  brideGiftQrCode: string;
  heroImages: { mobile: string; tablet: string; desktop: string };
  storyImage: string;
  galleryImages: string[];
  audioUrl: string;
}

export const weddingContent: WeddingContent = {
  groomName: "Đình Trường",
  brideName: "Thanh Ngà",
  weddingDate: "2026-12-12",
  weddingTime: "17:00",
  locationName: "Aquaria Palace",
  locationAddress: "Cung thể thao dưới nước, Đ. Lê Đức Thọ, Mỹ Đình 2, Từ Liêm, Hà Nội, Việt Nam",
  googleMapsUrl: "https://maps.app.goo.gl/wgKv7AwRAo18ZoT7A",
  groomGiftQrCode: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=Groom%20Bank%20Info%20or%20payment%20link",
  brideGiftQrCode: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=Bride%20Bank%20Info%20or%20payment%20link",
  heroImages: { mobile: "/data/hero-mobile.jpg", tablet: "/data/hero-tablet.jpg", desktop: "/data/hero-desktop.jpg" },
  storyImage: "/data/1JDID6VFI_6FLIUL.JPG",
  galleryImages: ["/data/IMG_7737.JPG", "/data/IMG_7739.JPG", "/data/IMG_7740.JPG", "/data/IMG_9526.JPG", "/data/IMG_9527.JPG"],
  audioUrl: "/audio/Audio.mp3",
};
