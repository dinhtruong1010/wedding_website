import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Download, ExternalLink, Heart, Languages, MapPin, Music, Volume2, VolumeX, X } from 'lucide-react';
import { copy, Language, wedding } from './content';

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number; complete: boolean };

const getTimeLeft = (): TimeLeft => {
  const distance = new Date(wedding.event.date).getTime() - Date.now();
  if (distance <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, complete: true };
  return { days: Math.floor(distance / 86400000), hours: Math.floor((distance / 3600000) % 24), minutes: Math.floor((distance / 60000) % 60), seconds: Math.floor((distance / 1000) % 60), complete: false };
};

export default function App() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const guest = params.get('to') || '';
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem('wedding-v3-language') === 'en' ? 'en' : 'vi');
  const [isOpen, setIsOpen] = useState(false);
  const [time, setTime] = useState(getTimeLeft);
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [activeQr, setActiveQr] = useState<'groom' | 'bride' | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const t = copy[language];

  useEffect(() => { localStorage.setItem('wedding-v3-language', language); document.documentElement.lang = language; }, [language]);
  useEffect(() => { const timer = window.setInterval(() => setTime(getTimeLeft()), 1000); return () => window.clearInterval(timer); }, []);

  const dateLabel = new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(wedding.event.date));
  const visiblePhotos = showAllPhotos ? wedding.images.gallery : wedding.images.gallery.slice(0, 4);

  const startInvitation = () => {
    setIsOpen(true);
    void audioRef.current?.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false));
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (musicPlaying) {
      audioRef.current.pause();
      setMusicPlaying(false);
      return;
    }
    void audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false));
  };

  return <div className="v3-page">
    <audio ref={audioRef} src={asset('audio/Audio.mp3')} loop preload="metadata" />
    <AnimatePresence>{!isOpen && <InvitationCover language={language} setLanguage={setLanguage} guest={guest} onOpen={startInvitation} />}</AnimatePresence>
    <main>
      <section className="v3-hero">
        <picture className="hero-picture"><source media="(max-width: 700px)" srcSet={asset(wedding.images.heroMobile)} /><img src={asset(wedding.images.hero)} alt={`${wedding.couple.groom} & ${wedding.couple.bride}`} /></picture>
        <div className="hero-overlay" />
        <div className="hero-copy"><div className="double-happiness">囍</div><p className="ornament-label">{t.hero.saveDate} <span>•</span> {wedding.event.dateLabel}</p><p className="hero-invite">{t.hero.invite}</p><h1>{guest || t.hero.title}</h1><div className="countdown">{time.complete ? <strong>{t.countdown.complete}</strong> : <>{([['days', t.countdown.days], ['hours', t.countdown.hours], ['minutes', t.countdown.minutes], ['seconds', t.countdown.seconds]] as const).map(([key, label]) => <div key={key}><strong>{String(time[key]).padStart(2, '0')}</strong><span>{label}</span></div>)}</>}</div></div><a className="scroll-cue" href="#couple"><span>Scroll</span><ChevronDown size={18} /></a>
      </section>

      <section className="v3-section couple-section" id="couple"><SectionHeading eyebrow={t.couple.eyebrow} title={t.couple.title} /><div className="couple-grid"><PersonCard image={wedding.images.groom} name={wedding.couple.groom} role={t.couple.groomRole} bio={t.couple.groomBio} alt={t.couple.groomAlt} /><div className="couple-heart"><Heart size={24} fill="currentColor" /></div><PersonCard image={wedding.images.bride} name={wedding.couple.bride} role={t.couple.brideRole} bio={t.couple.brideBio} alt={t.couple.brideAlt} /></div></section>

      <section className="letter-section"><div className="letter-image"><img src={asset(wedding.images.letter)} alt="Wedding invitation" loading="lazy" /><span>{wedding.couple.monogram}</span></div><div className="letter-copy"><p className="ornament-label">{t.letter.eyebrow}</p><h2>{t.letter.title}</h2><p>{t.letter.body}</p><div className="gold-rule" /></div></section>

      <section className="v3-section event-section" id="event"><SectionHeading eyebrow={t.event.eyebrow} title={t.event.title} /><p className="section-kicker">{t.event.saveDate}</p><h3>{t.event.celebration}</h3><div className="event-detail-grid"><EventDetail label={t.event.date} value={wedding.event.dateLabel} /><EventDetail label={t.event.arrival} value={wedding.event.guestArrival} /><EventDetail label={t.event.location} value={wedding.event.venue} extra={wedding.event.address} /></div><div className="event-links"><a href={wedding.event.mapUrl} target="_blank" rel="noreferrer">{t.event.directions} <ExternalLink size={15} /></a><button onClick={() => downloadCalendar(language)}><CalendarDays size={15} /> {t.event.addCalendar}</button></div>{wedding.event.mapEmbedUrl ? <iframe className="map" title="Wedding location" src={wedding.event.mapEmbedUrl} loading="lazy" /> : <div className="map-placeholder"><MapPin size={24} /><span>{wedding.event.address}</span></div>}</section>

      <section className="v3-section gallery-section" id="gallery"><SectionHeading eyebrow={t.gallery.eyebrow} title={t.gallery.title} /><div className="gallery-grid">{visiblePhotos.map((image, index) => <button key={image} className={`gallery-photo photo-${index + 1}`} onClick={() => setActivePhoto(index)}><img src={asset(image)} alt={`Wedding gallery ${index + 1}`} loading="lazy" /><span>View</span></button>)}</div><div className="gallery-actions">{wedding.images.gallery.length > 4 && <button onClick={() => setShowAllPhotos(!showAllPhotos)}>{showAllPhotos ? t.gallery.close : `${t.gallery.more} +${wedding.images.gallery.length - 4}`}</button>}<a href="#gallery">{t.gallery.original} <ExternalLink size={14} /></a></div></section>

      <section className="gift-section" id="gifts"><SectionHeading eyebrow={t.gifts.eyebrow} title={t.gifts.title} /><h3>{t.gifts.heading}</h3><p className="gift-intro">{t.gifts.body}</p><div className="gift-grid"><GiftCard title={t.gifts.groom} name={wedding.couple.groom} qr={wedding.gifts.groom} zoom={t.gifts.zoom} download={t.gifts.downloadGroom} onZoom={() => setActiveQr('groom')} /><GiftCard title={t.gifts.bride} name={wedding.couple.bride} qr={wedding.gifts.bride} zoom={t.gifts.zoom} download={t.gifts.downloadBride} onZoom={() => setActiveQr('bride')} /></div></section>

      <section className="thanks-section"><p className="ornament-label">{t.thanks.eyebrow}</p><h2>{t.thanks.title}</h2>{t.thanks.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<div className="thanks-signature">{wedding.couple.groom} <span>&</span> {wedding.couple.bride}</div></section>
      <section className="corner-section"><div className="corner-image"><img src={asset(wedding.images.corner)} alt={t.corner.eyebrow} loading="lazy" /></div><div><p className="ornament-label">{t.corner.eyebrow}</p><p>{t.corner.body}</p><a href="#top">{t.corner.link} <ExternalLink size={14} /></a></div></section>
    </main>
    <footer><p>{t.footer}</p><strong>{wedding.couple.monogram}</strong><span>{dateLabel}</span><div className="language-footer"><Languages size={15} />{(['vi', 'en'] as Language[]).map((item) => <button key={item} className={item === language ? 'active' : ''} onClick={() => setLanguage(item)}>{item.toUpperCase()}</button>)}</div><button className={`music-button ${musicPlaying ? 'is-playing' : ''}`} onClick={toggleMusic} aria-label={musicPlaying ? 'Pause music' : t.music}>{musicPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}<Music size={13} /></button></footer>
    <AnimatePresence>{activePhoto !== null && <PhotoViewer index={activePhoto} setIndex={setActivePhoto} language={language} />}</AnimatePresence>
    <AnimatePresence>{activeQr && <QrViewer type={activeQr} setType={setActiveQr} language={language} />}</AnimatePresence>
  </div>;
}

function InvitationCover({ language, setLanguage, guest, onOpen }: { language: Language; setLanguage: (language: Language) => void; guest: string; onOpen: () => void }) { const t = copy[language]; return <motion.div className="v3-cover" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .55 }}><div className="cover-card"><div className="cover-mark">囍</div><p className="ornament-label">{t.cover.eyebrow}</p><h1>{wedding.couple.groom}</h1><span>&</span><h1>{wedding.couple.bride}</h1><div className="invite-box"><small>{t.cover.invite}</small><strong>{guest || t.cover.guest}</strong></div><button onClick={onOpen}><Heart size={16} fill="currentColor" /> {t.cover.open}</button></div><div className="cover-switch"><Languages size={15} />{(['vi', 'en'] as Language[]).map((item) => <button key={item} className={item === language ? 'active' : ''} onClick={() => setLanguage(item)}>{item.toUpperCase()}</button>)}</div></motion.div>; }
function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) { return <div className="section-heading"><p className="ornament-label">🍃 {eyebrow} 🌿</p><h2>{title}</h2></div>; }
function PersonCard({ image, name, role, bio, alt }: { image: string; name: string; role: string; bio: string; alt: string }) { return <article className="person-card"><img src={asset(image)} alt={alt} loading="lazy" /><h3>{name}</h3><p className="person-role">{role}</p><p className="person-bio">“{bio}”</p></article>; }
function EventDetail({ label, value, extra }: { label: string; value: string; extra?: string }) { return <div className="event-detail"><small>{label}</small><strong>{value}</strong>{extra && <span>{extra}</span>}</div>; }
function GiftCard({ title, name, qr, zoom, download, onZoom }: { title: string; name: string; qr: string; zoom: string; download: string; onZoom: () => void }) { return <article className="gift-card"><small>{title}</small><h3>{name}</h3><button className="qr-button" onClick={onZoom}><img src={qr} alt={`${title} ${name}`} /><span>{zoom}</span></button><a href={qr} download={`${name}-qr.png`} target="_blank" rel="noreferrer"><Download size={14} /> {download}</a></article>; }
function PhotoViewer({ index, setIndex, language }: { index: number; setIndex: (value: number | null) => void; language: Language }) { const next = () => setIndex((index + 1) % wedding.images.gallery.length); const previous = () => setIndex((index - 1 + wedding.images.gallery.length) % wedding.images.gallery.length); return <motion.div className="viewer" role="dialog" aria-modal="true" aria-label={copy[language].gallery.close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIndex(null)}><button className="viewer-close" onClick={() => setIndex(null)} aria-label={copy[language].gallery.close}><X /></button><button className="viewer-prev" onClick={(event) => { event.stopPropagation(); previous(); }} aria-label="Previous"><ChevronLeft /></button><img src={asset(wedding.images.gallery[index])} alt={`Wedding gallery ${index + 1}`} onClick={(event) => event.stopPropagation()} /><button className="viewer-next" onClick={(event) => { event.stopPropagation(); next(); }} aria-label="Next"><ChevronRight /></button></motion.div>; }
function QrViewer({ type, setType, language }: { type: 'groom' | 'bride'; setType: (value: 'groom' | 'bride' | null) => void; language: Language }) { const qr = wedding.gifts[type]; const name = type === 'groom' ? wedding.couple.groom : wedding.couple.bride; return <motion.div className="viewer qr-viewer" role="dialog" aria-modal="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setType(null)}><button className="viewer-close" onClick={() => setType(null)} aria-label={copy[language].gallery.close}><X /></button><img src={qr} alt={`QR ${name}`} onClick={(event) => event.stopPropagation()} /></motion.div>; }
function downloadCalendar(language: Language) { const event = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:20261220T100000Z\nSUMMARY:${wedding.couple.groom} & ${wedding.couple.bride}\nLOCATION:${wedding.event.venue}, ${wedding.event.address}\nEND:VEVENT\nEND:VCALENDAR`; const url = URL.createObjectURL(new Blob([event], { type: 'text/calendar;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = language === 'vi' ? 'lich-cuoi.ics' : 'wedding.ics'; link.click(); URL.revokeObjectURL(url); }
