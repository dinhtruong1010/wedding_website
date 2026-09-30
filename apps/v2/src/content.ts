export type Language = 'vi' | 'en';

export const wedding = {
  couple: {
    groom: 'Đình Trường',
    bride: 'Thanh Ngà',
    shortMark: 'T & N',
  },
  event: {
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

export const copy = {
  vi: {
    cover: {
      kicker: 'Save the date',
      title: 'Một lời hẹn ước',
      subtitle: 'Mở thiệp để cùng chúng mình lưu giữ ngày đặc biệt này',
      open: 'Mở thiệp',
    },
    nav: { story: 'Câu chuyện', details: 'Thông tin', gallery: 'Album', rsvp: 'Xác nhận' },
    hero: {
      eyebrow: 'Chúng mình sắp kết hôn',
      title: 'Đình Trường & Thanh Ngà',
      body: 'Hạnh phúc là khi tìm thấy một người để cùng đi qua những ngày bình thường và biến chúng thành điều đáng nhớ.',
      cta: 'Xem thông tin lễ cưới',
    },
    countdown: { days: 'Ngày', hours: 'Giờ', minutes: 'Phút', seconds: 'Giây', complete: 'Hôm nay là ngày vui của chúng mình' },
    details: {
      eyebrow: 'Ngày chung đôi', title: 'Hẹn gặp bạn tại lễ cưới', date: 'Chủ nhật, ngày 20 tháng 12, 2026', time: '17:00', timeLabel: 'Làm lễ & khai tiệc', venueLabel: 'Địa điểm', directions: 'Chỉ đường', addCalendar: 'Lưu vào lịch',
    },
    family: { eyebrow: 'Hai gia đình', title: 'Trân trọng kính mời', guests: 'Tới dự tiệc chung vui cùng gia đình chúng mình' },
    story: { eyebrow: 'Love story', title: 'Từ hôm nay, mình có nhau', body: 'Hành trình của chúng mình bắt đầu từ những điều giản dị. Cảm ơn bạn đã luôn hiện diện trong những cột mốc quan trọng và cùng chia sẻ niềm vui này.', milestone: 'Ngày chúng mình bắt đầu' },
    gallery: { eyebrow: 'Golden hour', title: 'Những khoảnh khắc yêu thương', body: 'Một vài ký ức chúng mình muốn chia sẻ cùng bạn.', close: 'Đóng ảnh' },
    rsvp: { eyebrow: 'RSVP', title: 'Bạn sẽ đến chung vui chứ?', body: 'Sự hiện diện của bạn là niềm vui lớn nhất với chúng mình. Vui lòng xác nhận để gia đình chuẩn bị đón tiếp chu đáo.', name: 'Họ và tên', namePlaceholder: 'Nhập tên của bạn', attendance: 'Bạn sẽ tham dự?', yes: 'Có, mình sẽ đến', no: 'Rất tiếc, mình không thể', message: 'Lời nhắn', messagePlaceholder: 'Gửi một lời chúc tới cô dâu chú rể...', submit: 'Gửi xác nhận', success: 'Cảm ơn bạn. Chúng mình đã ghi nhận lời xác nhận này.', setup: 'Form này sẽ được kết nối với hệ thống RSVP trong bước tiếp theo.' },
    gift: { eyebrow: 'Mừng cưới', title: 'Thay cho lời cảm ơn', body: 'Sự hiện diện của bạn đã là món quà quý giá nhất. Thông tin mừng cưới sẽ được cập nhật tại đây.', comingSoon: 'Thông tin đang được chuẩn bị' },
    footer: 'Cảm ơn bạn đã dành tình cảm cho chúng mình.',
  },
  en: {
    cover: { kicker: 'Save the date', title: 'A promise to keep', subtitle: 'Open the invitation and celebrate this special day with us', open: 'Open invitation' },
    nav: { story: 'Our story', details: 'Details', gallery: 'Gallery', rsvp: 'RSVP' },
    hero: { eyebrow: 'We are getting married', title: 'Dinh Truong & Thanh Nga', body: 'Happiness is finding someone to walk through ordinary days with, and making them memorable together.', cta: 'View wedding details' },
    countdown: { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds', complete: 'Today is our special day' },
    details: { eyebrow: 'The celebration', title: 'Save this date', date: 'Sunday, December 20, 2026', time: '5:00 PM', timeLabel: 'Ceremony & reception', venueLabel: 'Venue', directions: 'Get directions', addCalendar: 'Save to calendar' },
    family: { eyebrow: 'Our families', title: 'You are warmly invited', guests: 'To celebrate this joyful occasion with our families' },
    story: { eyebrow: 'Love story', title: 'From today, we have each other', body: 'Our journey began with simple moments. Thank you for being part of our important milestones and for sharing this celebration with us.', milestone: 'The day we began' },
    gallery: { eyebrow: 'Golden hour', title: 'A few moments of us', body: 'Some memories we would love to share with you.', close: 'Close photo' },
    rsvp: { eyebrow: 'RSVP', title: 'Will you celebrate with us?', body: 'Your presence is the greatest joy. Please let us know so our families can prepare a warm welcome.', name: 'Full name', namePlaceholder: 'Enter your name', attendance: 'Will you attend?', yes: 'Yes, I will be there', no: 'Sadly, I cannot attend', message: 'Message', messagePlaceholder: 'Send a wish to the couple...', submit: 'Send RSVP', success: 'Thank you. Your response has been noted.', setup: 'This form will connect to the RSVP service in the next step.' },
    gift: { eyebrow: 'Gifts', title: 'A note on gifts', body: 'Your presence is already the greatest gift. Gift details will be added here.', comingSoon: 'Details coming soon' },
    footer: 'Thank you for sharing your love with us.',
  },
} as const;
