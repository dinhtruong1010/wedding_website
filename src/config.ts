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
  heroImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBytNaW5ha254-Sh9wHJdG0d7oUchhGhPDBywewS305Lu7X3YgB019r7Tqvsmnk-hI1mm9Ln6clW5yAGyOfRn932K5Rn9ndrdNCV653_r3qkTYb0eQM8uQz9cw-mdvDf_0BG_PU0bBpti0zYUnEM6kQPyXywUPoUqmBM9FAvtXuNXgbCFfG7XmsLwpAiMpTNXMhfxtRGQrXcpUyG0Zbbi6ZYgyqnlqwuNueo1K-dukmxwzQHZdqXSATPqZWiWXffvJvaX9ptoyMWeWh",
  storyImage: "https://picsum.photos/seed/wedding-story/800/1000",
  galleryImages: [
    "https://picsum.photos/seed/wedding1/800/600",
    "https://picsum.photos/seed/wedding2/800/600",
    "https://picsum.photos/seed/wedding3/800/600",
    "https://picsum.photos/seed/wedding4/800/600",
    "https://picsum.photos/seed/wedding5/800/600",
    "https://picsum.photos/seed/wedding6/800/600",
  ],
  story: "Our journey began five years ago, and now we're ready to start our forever together. We can't wait to celebrate this special day with all of you!",
};
