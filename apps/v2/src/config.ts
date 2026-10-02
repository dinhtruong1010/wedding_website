/** Editable wedding data for V2. Keep page layout and copy in App/content.ts. */
export const weddingConfig = {
  couple: {
    groom: 'Đình Trường',
    bride: 'Thanh Ngà',
    shortMark: 'T & N',
  },
  event: {
    // ISO datetime with timezone. The countdown and calendar use this value.
    date: '2026-12-20T17:00:00+07:00',
    venue: 'The Grand Palace',
    address: '123 Wedding St, Love City, Nghệ An',
    mapUrl: 'https://goo.gl/maps/example',
  },
  families: {
    groom: {
      title: 'Nhà trai',
      parents: 'Ông ... & Bà ...',
      address: 'Nghệ An',
    },
    bride: {
      title: 'Nhà gái',
      parents: 'Ông ... & Bà ...',
      address: '...',
    },
  },
  images: {
    cover: 'data/hero-desktop.jpg',
    coverMobile: 'data/hero-mobile.jpg',
    story: 'data/1JDID6VFI_6FLIUL.JPG',
    gallery: [
      'data/IMG_7737.JPG',
      'data/IMG_7739.JPG',
      'data/IMG_7740.JPG',
      'data/IMG_9526.JPG',
      'data/IMG_9527.JPG',
      'data/IMG_9528.JPG',
    ],
  },
} as const;
