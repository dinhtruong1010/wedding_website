import { CSSProperties, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Download, ExternalLink, Heart, Languages, MapPin, Music, Volume2, VolumeX, X } from 'lucide-react';
import { copy, Language, wedding } from './content';

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number; complete: boolean };
type RevealProps = { children: ReactNode; className?: string; delay?: number };

const revealViewport = { once: true, amount: .2, margin: '0px 0px -100px' };

const leafStyles = [
  { left: 8, delay: -2, duration: 14, size: 14, sway: -34 },
  { left: 18, delay: -8, duration: 18, size: 18, sway: 42 },
  { left: 27, delay: -5, duration: 16, size: 11, sway: -28 },
  { left: 35, delay: -12, duration: 22, size: 20, sway: 38 },
  { left: 47, delay: -4, duration: 15, size: 13, sway: -46 },
  { left: 56, delay: -10, duration: 19, size: 17, sway: 30 },
  { left: 66, delay: -6, duration: 17, size: 12, sway: -36 },
  { left: 74, delay: -14, duration: 23, size: 21, sway: 44 },
  { left: 84, delay: -3, duration: 16, size: 15, sway: -30 },
  { left: 93, delay: -11, duration: 20, size: 18, sway: 34 },
] as const;

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
  const initialPhotoCount = Math.min(8, wedding.images.gallery.length);
  const visiblePhotos = showAllPhotos ? wedding.images.gallery : wedding.images.gallery.slice(0, initialPhotoCount);

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
    <AmbientLeaves />
    <AnimatePresence>{!isOpen && <InvitationCover language={language} setLanguage={setLanguage} guest={guest} onOpen={startInvitation} />}</AnimatePresence>
    <main>
      <section className="v3-hero">
        <picture className="hero-picture"><source media="(max-width: 700px)" srcSet={asset(wedding.images.heroMobile)} /><img src={asset(wedding.images.hero)} alt={`${wedding.couple.groom} & ${wedding.couple.bride}`} /></picture>
        <div className="hero-overlay" />
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 22, scale: .98 }} animate={isOpen ? { opacity: 1, y: 0, scale: 1 } : { opacity: .55, y: 18, scale: .99 }} transition={{ delay: isOpen ? .28 : 0, duration: .75, ease: 'easeOut' }}><div className="double-happiness">囍</div><p className="ornament-label">{t.hero.saveDate} <span>•</span> {dateLabel}</p><p className="hero-invite">{t.hero.invite}</p><h1>{guest || t.hero.title}</h1><div className="countdown">{time.complete ? <strong>{t.countdown.complete}</strong> : <>{([['days', t.countdown.days], ['hours', t.countdown.hours], ['minutes', t.countdown.minutes], ['seconds', t.countdown.seconds]] as const).map(([key, label]) => <div key={key}><strong>{String(time[key]).padStart(2, '0')}</strong><span>{label}</span></div>)}</>}</div></motion.div><a className="scroll-cue" href="#couple"><span>Scroll</span><ChevronDown size={18} /></a>
      </section>

      <section className="v3-section couple-section" id="couple"><SectionHeading eyebrow={t.couple.eyebrow} title={t.couple.title} /><StaggerGroup className="couple-grid"><PersonCard image={wedding.images.groom} name={wedding.couple.groom} role={t.couple.groomRole} bio={t.couple.groomBio} alt={t.couple.groomAlt} /><motion.div className="couple-heart" variants={staggerItem}><Heart size={24} fill="currentColor" /></motion.div><PersonCard image={wedding.images.bride} name={wedding.couple.bride} role={t.couple.brideRole} bio={t.couple.brideBio} alt={t.couple.brideAlt} /></StaggerGroup></section>

      <section className="letter-section"><Reveal className="letter-image"><img src={asset(wedding.images.letter)} alt="Wedding invitation" loading="lazy" /><span>{wedding.couple.monogram}</span></Reveal><Reveal className="letter-copy" delay={.1}><p className="ornament-label">{t.letter.eyebrow}</p><h2>{t.letter.title}</h2><p>{t.letter.body}</p><div className="gold-rule" /></Reveal></section>

      <section className="v3-section event-section" id="event"><SectionHeading eyebrow={t.event.eyebrow} title={t.event.title} /><Reveal delay={.08}><p className="section-kicker">{t.event.saveDate}</p><h3>{t.event.celebration}</h3></Reveal><StaggerGroup className="event-detail-grid"><EventDetail label={t.event.date} value={dateLabel} /><EventDetail label={t.event.arrival} value={wedding.event.guestArrival} /><EventDetail label={t.event.location} value={wedding.event.venue} extra={wedding.event.address} /></StaggerGroup><Reveal className="event-links"><a href={wedding.event.mapUrl} target="_blank" rel="noreferrer">{t.event.directions} <ExternalLink size={15} /></a><button onClick={() => downloadCalendar(language)}><CalendarDays size={15} /> {t.event.addCalendar}</button></Reveal>{wedding.event.mapEmbedUrl?.includes('/maps/embed') ? <Reveal><iframe className="map" title="Wedding location" src={wedding.event.mapEmbedUrl} loading="lazy" /></Reveal> : <Reveal className="map-placeholder"><MapPin size={24} /><span>{wedding.event.address}</span></Reveal>}</section>

      <section className="v3-section gallery-section" id="gallery"><SectionHeading eyebrow={t.gallery.eyebrow} title={t.gallery.title} /><StaggerGroup className="gallery-grid">{visiblePhotos.map((image, index) => <motion.button variants={staggerItem} key={image} className={`gallery-photo photo-${index + 1}`} onClick={() => setActivePhoto(index)}><img src={asset(image)} alt={`Wedding gallery ${index + 1}`} loading="lazy" /><span>View</span></motion.button>)}</StaggerGroup><Reveal className="gallery-actions">{wedding.images.gallery.length > initialPhotoCount && <button onClick={() => setShowAllPhotos(!showAllPhotos)}>{showAllPhotos ? t.gallery.close : `${t.gallery.more} +${wedding.images.gallery.length - initialPhotoCount}`}</button>}<a href="#gallery">{t.gallery.original} <ExternalLink size={14} /></a></Reveal></section>

      <section className="gift-section" id="gifts"><SectionHeading eyebrow={t.gifts.eyebrow} title={t.gifts.title} /><Reveal delay={.08}><h3>{t.gifts.heading}</h3><p className="gift-intro">{t.gifts.body}</p></Reveal><StaggerGroup className="gift-grid"><GiftCard title={t.gifts.groom} name={wedding.couple.groom} qr={wedding.gifts.groom} zoom={t.gifts.zoom} download={t.gifts.downloadGroom} onZoom={() => setActiveQr('groom')} /><GiftCard title={t.gifts.bride} name={wedding.couple.bride} qr={wedding.gifts.bride} zoom={t.gifts.zoom} download={t.gifts.downloadBride} onZoom={() => setActiveQr('bride')} /></StaggerGroup></section>

      <section className="thanks-section"><StaggerGroup><motion.p variants={staggerItem} className="ornament-label">{t.thanks.eyebrow}</motion.p><motion.h2 variants={staggerItem}>{t.thanks.title}</motion.h2>{t.thanks.paragraphs.map((paragraph) => <motion.p variants={staggerItem} key={paragraph}>{paragraph}</motion.p>)}<motion.div variants={staggerItem} className="thanks-signature">{wedding.couple.groom} <span>&</span> {wedding.couple.bride}</motion.div></StaggerGroup></section>
      <section className="corner-section"><Reveal className="corner-image"><img src={asset(wedding.images.corner)} alt={t.corner.eyebrow} loading="lazy" /></Reveal><Reveal delay={.08}><p className="ornament-label">{t.corner.eyebrow}</p><p>{t.corner.body}</p><a href="#top">{t.corner.link} <ExternalLink size={14} /></a></Reveal></section>
    </main>
    <footer><p>{t.footer}</p><strong>{wedding.couple.monogram}</strong><span>{dateLabel}</span><div className="language-footer"><Languages size={15} />{(['vi', 'en'] as Language[]).map((item) => <button key={item} className={item === language ? 'active' : ''} onClick={() => setLanguage(item)}>{item.toUpperCase()}</button>)}</div><button className={`music-button ${musicPlaying ? 'is-playing' : ''}`} onClick={toggleMusic} aria-label={musicPlaying ? 'Pause music' : t.music}>{musicPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}<Music size={13} /></button></footer>
    <AnimatePresence>{activePhoto !== null && <PhotoViewer index={activePhoto} setIndex={setActivePhoto} language={language} />}</AnimatePresence>
    <AnimatePresence>{activeQr && <QrViewer type={activeQr} setType={setActiveQr} language={language} />}</AnimatePresence>
  </div>;
}

const staggerItem = {
  hidden: { opacity: 0, y: 28, scale: .98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: .62, ease: 'easeOut' } },
};

function Reveal({ children, className, delay = 0 }: RevealProps) {
  return <motion.div className={className} initial={{ opacity: 0, y: 30, scale: .985 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={revealViewport} transition={{ duration: .68, delay, ease: 'easeOut' }}>{children}</motion.div>;
}

function StaggerGroup({ children, className, delay = 0 }: RevealProps) {
  return <motion.div className={className} initial="hidden" whileInView="show" viewport={revealViewport} variants={{ hidden: {}, show: { transition: { delayChildren: delay, staggerChildren: .12 } } }}>{children}</motion.div>;
}

function AmbientLeaves() {
  return <div className="ambient-leaves" aria-hidden="true">{leafStyles.map((leaf, index) => <span key={index} style={{ '--leaf-left': `${leaf.left}%`, '--leaf-delay': `${leaf.delay}s`, '--leaf-duration': `${leaf.duration}s`, '--leaf-size': `${leaf.size}px`, '--leaf-sway': `${leaf.sway}px` } as CSSProperties} />)}</div>;
}

function InvitationCover({ language, setLanguage, guest, onOpen }: { language: Language; setLanguage: (language: Language) => void; guest: string; onOpen: () => void }) {
  const t = copy[language];
  return <motion.div className="v3-cover" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { delay: .55, duration: .35 } }}>
    <motion.div className="cover-panel cover-panel-left" exit={{ x: '-102%', rotateY: -11, transition: { duration: .9, ease: [.22, 1, .36, 1] } }} />
    <motion.div className="cover-panel cover-panel-right" exit={{ x: '102%', rotateY: 11, transition: { duration: .9, ease: [.22, 1, .36, 1] } }} />
    <motion.div className="cover-card" initial={{ opacity: 0, y: 18, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -22, scale: .96, filter: 'blur(6px)', transition: { duration: .4, ease: 'easeOut' } }}>
      <div className="cover-mark">囍</div>
      <p className="ornament-label">{t.cover.eyebrow}</p>
      <h1>{wedding.couple.groom}</h1>
      <span>&</span>
      <h1>{wedding.couple.bride}</h1>
      <div className="invite-box"><small>{t.cover.invite}</small><strong>{guest || t.cover.guest}</strong></div>
      <button onClick={onOpen}><Heart size={16} fill="currentColor" /> {t.cover.open}</button>
    </motion.div>
    <div className="cover-switch"><Languages size={15} />{(['vi', 'en'] as Language[]).map((item) => <button key={item} className={item === language ? 'active' : ''} onClick={() => setLanguage(item)}>{item.toUpperCase()}</button>)}</div>
  </motion.div>;
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) { return <Reveal className="section-heading"><p className="ornament-label">🍃 {eyebrow} 🌿</p><h2>{title}</h2></Reveal>; }
function PersonCard({ image, name, role, bio, alt }: { image: string; name: string; role: string; bio: string; alt: string }) { return <motion.article className="person-card" variants={staggerItem}><div className="person-image"><img src={asset(image)} alt={alt} loading="lazy" /></div><h3>{name}</h3><p className="person-role">{role}</p><p className="person-bio">“{bio}”</p></motion.article>; }
function EventDetail({ label, value, extra }: { label: string; value: string; extra?: string }) { return <motion.div className="event-detail" variants={staggerItem}><small>{label}</small><strong>{value}</strong>{extra && <span>{extra}</span>}</motion.div>; }
function GiftCard({ title, name, qr, zoom, download, onZoom }: { title: string; name: string; qr: string; zoom: string; download: string; onZoom: () => void }) { return <motion.article className="gift-card" variants={staggerItem}><small>{title}</small><h3>{name}</h3><button className="qr-button" onClick={onZoom}><img src={qr} alt={`${title} ${name}`} /><span>{zoom}</span></button><a href={qr} download={`${name}-qr.png`} target="_blank" rel="noreferrer"><Download size={14} /> {download}</a></motion.article>; }
function PhotoViewer({ index, setIndex, language }: { index: number; setIndex: (value: number | null) => void; language: Language }) { const next = () => setIndex((index + 1) % wedding.images.gallery.length); const previous = () => setIndex((index - 1 + wedding.images.gallery.length) % wedding.images.gallery.length); return <motion.div className="viewer" role="dialog" aria-modal="true" aria-label={copy[language].gallery.close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIndex(null)}><button className="viewer-close" onClick={() => setIndex(null)} aria-label={copy[language].gallery.close}><X /></button><button className="viewer-prev" onClick={(event) => { event.stopPropagation(); previous(); }} aria-label="Previous"><ChevronLeft /></button><img src={asset(wedding.images.gallery[index])} alt={`Wedding gallery ${index + 1}`} onClick={(event) => event.stopPropagation()} /><button className="viewer-next" onClick={(event) => { event.stopPropagation(); next(); }} aria-label="Next"><ChevronRight /></button></motion.div>; }
function QrViewer({ type, setType, language }: { type: 'groom' | 'bride'; setType: (value: 'groom' | 'bride' | null) => void; language: Language }) { const qr = wedding.gifts[type]; const name = type === 'groom' ? wedding.couple.groom : wedding.couple.bride; return <motion.div className="viewer qr-viewer" role="dialog" aria-modal="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setType(null)}><button className="viewer-close" onClick={() => setType(null)} aria-label={copy[language].gallery.close}><X /></button><img src={qr} alt={`QR ${name}`} onClick={(event) => event.stopPropagation()} /></motion.div>; }
function downloadCalendar(language: Language) { const calendarDate = wedding.event.date.replace(/[-:]/g, '').replace('.000', ''); const event = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${calendarDate}\nSUMMARY:${wedding.couple.groom} & ${wedding.couple.bride}\nLOCATION:${wedding.event.venue}, ${wedding.event.address}\nEND:VEVENT\nEND:VCALENDAR`; const url = URL.createObjectURL(new Blob([event], { type: 'text/calendar;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = language === 'vi' ? 'lich-cuoi.ics' : 'wedding.ics'; link.click(); URL.revokeObjectURL(url); }
