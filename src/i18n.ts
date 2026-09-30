export type Language = 'vi' | 'en';

export const languageLabels: Record<Language, string> = {
  vi: 'VI',
  en: 'EN',
};

export const localeByLanguage: Record<Language, string> = {
  vi: 'vi-VN',
  en: 'en-US',
};

export const translations = {
  vi: {
    nav: {
      story: 'Câu chuyện',
      details: 'Thông tin',
      gallery: 'Album ảnh',
      gifts: 'Mừng cưới',
      wishes: 'Lời chúc',
      rsvp: 'Xác nhận',
    },
    hero: {
      alt: 'Đình Trường và Thanh Ngà',
      intro: 'Chúng mình sắp kết hôn và rất mong được cùng bạn chung vui trong ngày đặc biệt này.',
      cta: 'Xem câu chuyện',
    },
    story: {
      eyebrow: 'Hành trình yêu thương',
      title: 'Câu chuyện của chúng mình',
      imageAlt: 'Câu chuyện của chúng mình',
      body: 'Hành trình của chúng mình bắt đầu từ những điều giản dị, và giờ đây chúng mình sẵn sàng cùng nhau bước sang một chương mới. Sự hiện diện của bạn sẽ làm ngày vui này thêm trọn vẹn.',
      timeline: [
        {
          title: 'Lần đầu gặp gỡ',
          date: 'THÁNG 5, 2025',
          description: 'Một cuộc gặp tình cờ đã mở ra thật nhiều câu chuyện và những kỷ niệm đáng nhớ.',
        },
        {
          title: 'Những chuyến đi đầu tiên',
          date: 'THÁNG 8, 2025',
          description: 'Cùng nhau khám phá những nơi mới, lưu giữ tiếng cười và những khoảnh khắc bình yên.',
        },
        {
          title: 'Lời hẹn ước',
          date: 'THÁNG 12, 2026',
          description: 'Chúng mình quyết định nắm tay nhau bước vào hành trình hôn nhân.',
        },
      ],
    },
    details: {
      eyebrow: 'Ngày chung đôi',
      title: 'Thông tin lễ cưới',
      dateTitle: 'Ngày cưới',
      dateSub: 'LƯU LẠI NGÀY NÀY',
      timeTitle: 'Thời gian',
      timeSub: 'GIỜ LÀM LỄ',
      locationTitle: 'Địa điểm',
      viewMap: 'Xem bản đồ',
    },
    gallery: {
      eyebrow: 'Khoảnh khắc yêu thương',
      title: 'Album ảnh',
      altPrefix: 'Ảnh cưới',
    },
    gifts: {
      eyebrow: 'Mừng cưới',
      title: 'Thay cho lời cảm ơn',
      body: 'Sự hiện diện của bạn là món quà quý giá nhất. Nếu muốn gửi lời chúc mừng, bạn có thể quét mã QR của chú rể hoặc cô dâu bên dưới.',
      groomTitle: 'QR chú rể',
      brideTitle: 'QR cô dâu',
      groomAlt: 'Mã QR mừng cưới chú rể',
      brideAlt: 'Mã QR mừng cưới cô dâu',
      groomNote: 'Quét mã để gửi quà mừng tới',
      brideNote: 'Quét mã để gửi quà mừng tới',
    },
    guestbook: {
      eyebrow: 'Sổ lưu bút',
      title: 'Gửi lời chúc',
      intro: 'Hãy để lại đôi lời yêu thương cho cô dâu chú rể.',
      nameLabel: 'Tên của bạn',
      namePlaceholder: 'Nhập tên của bạn',
      messageLabel: 'Lời chúc',
      messagePlaceholder: 'Viết một lời chúc thật đẹp...',
      submit: 'Gửi lời chúc',
      recent: 'Lời chúc gần đây',
      wishes: [
        { name: 'Gia đình và bạn bè', message: 'Chúc hai bạn trăm năm hạnh phúc, luôn yêu thương và đồng hành cùng nhau.' },
        { name: 'Một người bạn thân', message: 'Mong ngày vui của hai bạn thật rực rỡ và đầy ắp tiếng cười.' },
        { name: 'Đồng nghiệp', message: 'Chúc mừng hạnh phúc. Hẹn gặp hai bạn trên sàn nhảy nhé!' },
        { name: 'Người thân', message: 'Chúc hành trình mới của hai con luôn bình an, ngọt ngào và viên mãn.' },
      ],
    },
    footer: {
      privacy: 'Chính sách riêng tư',
      contact: 'Liên hệ',
    },
    language: {
      label: 'Ngôn ngữ',
    },
  },
  en: {
    nav: {
      story: 'Our Story',
      details: 'Wedding Details',
      gallery: 'Gallery',
      gifts: 'Gifts',
      wishes: 'Wishes',
      rsvp: 'RSVP',
    },
    hero: {
      alt: 'Dinh Truong and Thanh Nga',
      intro: 'We are getting married and would love to celebrate this special day with you.',
      cta: 'View Our Story',
    },
    story: {
      eyebrow: 'A Journey of Love',
      title: 'Our Story',
      imageAlt: 'Our Story',
      body: "Our journey began with simple, meaningful moments, and now we're ready to begin a new chapter together. Your presence will make this celebration even more special.",
      timeline: [
        {
          title: 'The First Meeting',
          date: 'MAY 2025',
          description: 'A chance encounter opened the door to many conversations and unforgettable memories.',
        },
        {
          title: 'The First Trips',
          date: 'AUGUST 2025',
          description: 'Exploring new places together, collecting laughter and quiet moments along the way.',
        },
        {
          title: 'The Promise',
          date: 'DECEMBER 2026',
          description: 'We chose to hold hands and begin the beautiful journey of marriage.',
        },
      ],
    },
    details: {
      eyebrow: 'The Celebration',
      title: 'Wedding Details',
      dateTitle: 'The Date',
      dateSub: 'SAVE THE DATE',
      timeTitle: 'The Time',
      timeSub: 'CEREMONY TIME',
      locationTitle: 'Location',
      viewMap: 'View Map',
    },
    gallery: {
      eyebrow: 'Memories Captured',
      title: 'Photo Gallery',
      altPrefix: 'Wedding photo',
    },
    gifts: {
      eyebrow: 'Registry',
      title: 'A Note on Gifts',
      body: 'Your presence at our wedding is the greatest gift of all. If you wish to contribute, scan one of the QR codes below for the groom or bride.',
      groomTitle: 'Groom Gift QR',
      brideTitle: 'Bride Gift QR',
      groomAlt: 'Groom gift QR code',
      brideAlt: 'Bride gift QR code',
      groomNote: 'Scan to send a gift to',
      brideNote: 'Scan to send a gift to',
    },
    guestbook: {
      eyebrow: 'Guestbook',
      title: 'Leave a Wish',
      intro: 'Share your thoughts and blessings with the happy couple.',
      nameLabel: 'Your Name',
      namePlaceholder: 'Enter your name',
      messageLabel: 'Your Message',
      messagePlaceholder: 'Write something beautiful...',
      submit: 'Send Wish',
      recent: 'Recent Wishes',
      wishes: [
        { name: 'Family & Friends', message: 'Wishing you both a lifetime of happiness, love, and partnership.' },
        { name: 'A Dear Friend', message: 'May your wedding day be radiant and filled with laughter.' },
        { name: 'A Colleague', message: 'Congratulations! See you both on the dance floor.' },
        { name: 'Loved Ones', message: 'May this new chapter be peaceful, sweet, and full of joy.' },
      ],
    },
    footer: {
      privacy: 'Privacy Policy',
      contact: 'Contact Us',
    },
    language: {
      label: 'Language',
    },
  },
} as const;
