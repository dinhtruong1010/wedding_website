/** Editable wedding data for V3. Keep page layout and copy in App/content.ts. */
export const weddingConfig = {
  couple: {
    groom: 'Đình Trường',
    bride: 'Thanh Ngà',
    monogram: 'T & N',
  },
  event: {
    // ISO datetime with timezone. The countdown and calendar use this value.
    date: '2026-12-12T17:00:00+07:00',
    guestArrival: '16:00',
    venue: 'Casa de Ruby',
    address: 'Casa de Ruby - Farmstay Erahouse, Ng. 64 P. Ng. Xuân Quảng, Gia Lâm, Hà Nội, Việt Nam',
    mapUrl: 'https://maps.app.goo.gl/WuJeTN6ZSPzzkfqt6',
    mapEmbedUrl: 'https://maps.app.goo.gl/WuJeTN6ZSPzzkfqt6',
  },
  families: {
    groom: { title: 'Nhà trai', parents: 'Ông ... & Bà ...', address: 'Nghệ An' },
    bride: { title: 'Nhà gái', parents: 'Ông ... & Bà ...', address: '...' },
  },
  images: {
    hero: 'data/hero-desktop.jpg',
    heroMobile: 'data/hero-mobile.jpg',
    groom: 'data/1JD0URKE8_6FLIUL.JPG',
    bride: 'data/1JDID6VFI_6FLIUL.JPG',
    letter: 'data/IMG_9528.JPG',
    corner: 'data/IMG_7740.JPG',
    gallery: [
      'data/IMG_7737.JPG',
      'data/IMG_7739.JPG',
      'data/IMG_7740.JPG',
      'data/IMG_9526.JPG',
      'data/IMG_9527.JPG',
      'data/IMG_9528.JPG',
    ],
  },
  gifts: {
    groom: 'https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=Groom%20Bank%20Info%20or%20payment%20link',
    bride: 'https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=Bride%20Bank%20Info%20or%20payment%20link',
  },
} as const;
