import { weddingConfig } from './config';

export type Language = 'vi' | 'en';

export const wedding = weddingConfig;

export const copy = {
  vi: {
    cover: { eyebrow: 'Thiệp mời dự lễ thành hôn', invite: 'Trân trọng kính mời', guest: 'Quý khách', open: 'Chạm để mở thiệp cưới' },
    hero: { saveDate: 'Save the date', invite: 'Trân trọng kính mời', title: 'Quý khách' },
    couple: { title: 'Cặp đôi', eyebrow: 'Nhân vật chính', groomRole: 'Chú rể', brideRole: 'Cô dâu', groomBio: 'Chàng trai điềm đạm, yêu những điều giản dị và say đắm nụ cười của nàng.', brideBio: 'Cô gái luôn tỏa ra năng lượng tích cực và mang đến thật nhiều niềm vui.', groomAlt: 'Chú rể Đình Trường', brideAlt: 'Cô dâu Thanh Ngà' },
    letter: { eyebrow: 'Lời ngỏ', title: 'Trân trọng kính mời', body: 'Sự hiện diện của Quý khách là niềm vinh hạnh lớn nhất của gia đình chúng tôi. Cùng chung vui trong ngày trọng đại, chứng kiến khoảnh khắc hai trái tim hòa chung một nhịp đập.' },
    event: { eyebrow: 'Thông tin', title: 'Sự kiện', saveDate: 'Save the date', celebration: 'Tiệc mừng thành hôn', date: 'Thời gian', arrival: 'Giờ đón khách', location: 'Địa điểm', directions: 'Chỉ đường trên bản đồ', addCalendar: 'Thêm vào lịch' },
    gallery: { title: 'Khoảnh khắc', eyebrow: 'Lưu giữ kỷ niệm • Album ảnh cưới', more: 'Xem thêm ảnh cưới', original: 'Xem trọn bộ album', close: 'Đóng ảnh' },
    gifts: { title: 'Hộp mừng cưới', eyebrow: 'Gửi trao lời chúc phúc & quà mừng', heading: 'Mừng cưới trực tuyến', body: 'Sự hiện diện cùng những lời chúc phúc ấm áp của gia đình và bạn bè chính là món quà vô giá. Với quý vị ở xa chưa thể đến chung vui, mã QR bên dưới là góc nhỏ tiện lợi để gửi gắm tình cảm và quà mừng tới dâu rể.', groom: 'Mừng cưới chú rể', bride: 'Mừng cưới cô dâu', zoom: 'Phóng to QR', downloadGroom: 'Tải QR chú rể', downloadBride: 'Tải QR cô dâu' },
    thanks: { eyebrow: 'Thank you', title: 'Lời cảm ơn', paragraphs: ['Sự hiện diện và những lời chúc phúc ấm áp từ mọi người chính là món quà vô giá, mang đến trọn vẹn niềm vui và hạnh phúc trong ngày trọng đại này.', 'Bước sang một chặng đường mới, chúng mình cảm thấy vô cùng may mắn khi luôn có gia đình, người thân và bạn bè ở bên yêu thương, đồng hành.', 'Nếu trong ngày vui có điều gì sơ suất, dâu rể rất mong nhận được sự cảm thông và lượng thứ từ mọi người.'] },
    corner: { eyebrow: 'Góc nhỏ của hai đứa', body: 'Một góc nhỏ để chia sẻ những điều chúng mình yêu thích và cùng nhau vun đắp.', link: 'Khám phá thêm' },
    footer: 'Trân trọng cảm ơn sự thương yêu và đồng hành của quý vị.', language: 'Ngôn ngữ', music: 'Nhấp để phát nhạc', countdown: { days: 'Ngày', hours: 'Giờ', minutes: 'Phút', seconds: 'Giây', complete: 'Hôm nay là ngày vui của chúng mình' },
  },
  en: {
    cover: { eyebrow: 'Wedding invitation', invite: 'You are warmly invited', guest: 'Dear guest', open: 'Open wedding invitation' },
    hero: { saveDate: 'Save the date', invite: 'You are warmly invited', title: 'Dear guest' },
    couple: { title: 'The couple', eyebrow: 'The main characters', groomRole: 'The groom', brideRole: 'The bride', groomBio: 'A gentle soul who loves simple things and the brightest smile of his favorite person.', brideBio: 'A joyful spirit who brings positive energy and laughter wherever she goes.', groomAlt: 'Groom Dinh Truong', brideAlt: 'Bride Thanh Nga' },
    letter: { eyebrow: 'A note from us', title: 'You are warmly invited', body: 'Your presence would be the greatest honor for our families. Please join us as two hearts begin a new chapter together.' },
    event: { eyebrow: 'Details', title: 'The celebration', saveDate: 'Save the date', celebration: 'Wedding reception', date: 'Date', arrival: 'Guest arrival', location: 'Venue', directions: 'Get directions', addCalendar: 'Add to calendar' },
    gallery: { title: 'Moments', eyebrow: 'Keeping memories • Wedding album', more: 'View more photos', original: 'View full album', close: 'Close photo' },
    gifts: { title: 'Wedding gifts', eyebrow: 'Share your blessings & gifts', heading: 'Online gifts', body: 'Your presence and warm wishes are already the greatest gift. For loved ones who cannot join us in person, the QR codes below offer a simple way to send their love.', groom: 'Groom gifts', bride: 'Bride gifts', zoom: 'Enlarge QR', downloadGroom: 'Download groom QR', downloadBride: 'Download bride QR' },
    thanks: { eyebrow: 'Thank you', title: 'A note of gratitude', paragraphs: ['Your presence and warm wishes are the most precious gift, bringing complete joy to our wedding day.', 'As we begin this new chapter, we feel incredibly lucky to have family and friends who love and support us.', 'Please forgive us for anything we may have missed while welcoming you on our special day.'] },
    corner: { eyebrow: 'A little corner of us', body: 'A small space to share the things we love and build together.', link: 'Discover more' },
    footer: 'Thank you for your love and for celebrating with us.', language: 'Language', music: 'Tap to play music', countdown: { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds', complete: 'Today is our special day' },
  },
} as const;
