import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDown, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Heart, Languages, MapPin, Menu, Music2, Volume2, VolumeX, X } from 'lucide-react';
import { copy, Language, wedding } from './content';

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

type Countdown = { days: number; hours: number; minutes: number; seconds: number; complete: boolean };

const calculateCountdown = (): Countdown => {
  const distance = new Date(wedding.event.date).getTime() - Date.now();
  if (distance <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, complete: true };
  return {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance / 3600000) % 24),
    minutes: Math.floor((distance / 60000) % 60),
    seconds: Math.floor((distance / 1000) % 60),
    complete: false,
  };
};

function App() {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('wedding-v2-language') === 'en' ? 'en' : 'vi'));
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [countdown, setCountdown] = useState(calculateCountdown);
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const [rsvpSent, setRsvpSent] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const t = copy[language];

  useEffect(() => {
    localStorage.setItem('wedding-v2-language', language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(calculateCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' }), [language]);
  const dateParts = useMemo(() => {
    const parts = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).formatToParts(new Date(wedding.event.date));
    return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  }, []);
  const timeLabel = useMemo(() => new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: language === 'en' }).format(new Date(wedding.event.date)), [language]);

  const handleRsvp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRsvpSent(true);
  };

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const startExperience = () => {
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

  return (
    <div className="v2-shell">
      <audio ref={audioRef} src={asset('audio/Audio.mp3')} loop preload="metadata" />
      <AnimatePresence>
        {!isOpen && <InvitationCover language={language} setLanguage={setLanguage} onOpen={startExperience} />}
      </AnimatePresence>

      <header className={`v2-nav ${isOpen ? 'is-visible' : ''}`}>
        <a className="brand" href="#top" onClick={() => scrollTo('#top')} aria-label="Back to top">{wedding.couple.shortMark}</a>
        <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
          <button onClick={() => scrollTo('#story')}>{t.nav.story}</button>
          <button onClick={() => scrollTo('#details')}>{t.nav.details}</button>
          <button onClick={() => scrollTo('#gallery')}>{t.nav.gallery}</button>
          <button className="nav-rsvp" onClick={() => scrollTo('#rsvp')}>{t.nav.rsvp}</button>
          <LanguageSwitch language={language} setLanguage={setLanguage} />
        </nav>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>
      {isOpen && <button className="music-fab" type="button" onClick={toggleMusic} aria-label={musicPlaying ? 'Pause music' : 'Play music'}>{musicPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}<Music2 size={14} /></button>}

      <main id="top">
        <section className="v2-hero">
          <div className="hero-media" style={{ backgroundImage: `url('${asset(wedding.images.cover)}')` }} aria-hidden="true" />
          <div className="hero-shade" />
          <motion.div className="hero-content" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="eyebrow eyebrow-light">{t.hero.eyebrow}</p>
            <h1>{wedding.couple.groom} <span>&</span> {wedding.couple.bride}</h1>
            <p className="hero-copy">{t.hero.body}</p>
            <button className="light-button" onClick={() => scrollTo('#details')}>{t.hero.cta} <ArrowDown size={16} /></button>
          </motion.div>
          <div className="hero-date"><span>{dateFormatter.format(new Date(wedding.event.date))}</span><span>{wedding.event.venue}</span></div>
        </section>

        <section className="countdown-band" aria-label="Countdown">
          {countdown.complete ? <p className="countdown-complete">{t.countdown.complete}</p> : <div className="countdown-grid">{([['days', t.countdown.days], ['hours', t.countdown.hours], ['minutes', t.countdown.minutes], ['seconds', t.countdown.seconds]] as const).map(([key, label]) => <div className="countdown-item" key={key}><strong>{String(countdown[key]).padStart(2, '0')}</strong><span>{label}</span></div>)}</div>}
        </section>

        <section className="section details-section" id="details">
          <SectionIntro eyebrow={t.details.eyebrow} title={t.details.title} />
          <div className="details-layout">
            <div className="date-panel"><CalendarDays size={22} /><p className="date-large">{dateParts.day}<span>{dateParts.month}</span><small>{dateParts.year}</small></p><p>{dateFormatter.format(new Date(wedding.event.date))}</p></div>
            <div className="event-panel"><div className="event-row"><Clock3 /><div><small>{t.details.timeLabel}</small><strong>{timeLabel}</strong></div></div><div className="event-row"><MapPin /><div><small>{t.details.venueLabel}</small><strong>{wedding.event.venue}</strong><span>{wedding.event.address}</span></div></div><div className="event-actions"><a href={wedding.event.mapUrl} target="_blank" rel="noreferrer">{t.details.directions} <MapPin size={15} /></a><button onClick={() => downloadCalendar(language)}>{t.details.addCalendar} <CalendarDays size={15} /></button></div></div>
          </div>
        </section>

        <section className="family-strip"><SectionIntro eyebrow={t.family.eyebrow} title={t.family.title} /><p>{t.family.guests}</p><div className="family-grid"><FamilyCard family={wedding.families.groom} /><div className="family-divider"><Heart size={18} fill="currentColor" /></div><FamilyCard family={wedding.families.bride} /></div></section>

        <section className="section story-section" id="story"><div className="story-image"><img src={asset(wedding.images.story)} alt="Wedding story" loading="lazy" /></div><div className="story-content"><p className="eyebrow">{t.story.eyebrow}</p><h2>{t.story.title}</h2><p>{t.story.body}</p><div className="story-note"><span>01</span><div><strong>{t.story.milestone}</strong><small>Our beginning</small></div></div></div></section>

        <section className="section gallery-section" id="gallery"><SectionIntro eyebrow={t.gallery.eyebrow} title={t.gallery.title} /><p className="section-lead">{t.gallery.body}</p><div className="gallery-grid">{wedding.images.gallery.map((image, index) => <button className={`gallery-tile tile-${index + 1}`} key={image} onClick={() => setActivePhoto(index)}><img src={asset(image)} alt={`Wedding memory ${index + 1}`} loading="lazy" /><span>View photo</span></button>)}</div></section>

        <section className="rsvp-section" id="rsvp"><div className="section rsvp-layout"><div><p className="eyebrow">{t.rsvp.eyebrow}</p><h2>{t.rsvp.title}</h2><p>{t.rsvp.body}</p><div className="rsvp-mark">{wedding.couple.shortMark}</div></div><form onSubmit={handleRsvp} className="rsvp-form"><label>{t.rsvp.name}<input required placeholder={t.rsvp.namePlaceholder} /></label><fieldset><legend>{t.rsvp.attendance}</legend><label className="radio-label"><input type="radio" name="attendance" value="yes" defaultChecked />{t.rsvp.yes}</label><label className="radio-label"><input type="radio" name="attendance" value="no" />{t.rsvp.no}</label></fieldset><label>{t.rsvp.message}<textarea rows={4} placeholder={t.rsvp.messagePlaceholder} /></label><button className="dark-button" type="submit">{t.rsvp.submit} <Check size={16} /></button>{rsvpSent ? <p className="form-success" role="status"><Check size={16} /> {t.rsvp.success}</p> : <p className="form-note">{t.rsvp.setup}</p>}</form></div></section>

        <section className="gift-section"><p className="eyebrow">{t.gift.eyebrow}</p><h2>{t.gift.title}</h2><p>{t.gift.body}</p><div className="gift-placeholder"><Heart size={20} /><span>{t.gift.comingSoon}</span></div></section>
      </main>
      <footer><p>{t.footer}</p><strong>{wedding.couple.groom} & {wedding.couple.bride}</strong><span>{dateFormatter.format(new Date(wedding.event.date))}</span></footer>

      <AnimatePresence>{activePhoto !== null && <PhotoLightbox index={activePhoto} setIndex={setActivePhoto} language={language} />}</AnimatePresence>
    </div>
  );
}

function InvitationCover({ language, setLanguage, onOpen }: { language: Language; setLanguage: (language: Language) => void; onOpen: () => void }) {
  const t = copy[language];
  return <motion.div className="invitation-cover" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}><div className="cover-media" style={{ backgroundImage: `url('${asset(wedding.images.cover)}')` }} /><div className="cover-content"><p className="cover-monogram">{wedding.couple.shortMark}</p><p className="eyebrow eyebrow-light">{t.cover.kicker}</p><h2>{t.cover.title}</h2><p>{t.cover.subtitle}</p><button className="light-button" onClick={onOpen}>{t.cover.open} <ArrowDown size={16} /></button></div><div className="cover-language"><LanguageSwitch language={language} setLanguage={setLanguage} /></div></motion.div>;
}

function LanguageSwitch({ language, setLanguage }: { language: Language; setLanguage: (language: Language) => void }) {
  return <div className="language-switch"><Languages size={15} />{(['vi', 'en'] as Language[]).map((item) => <button className={item === language ? 'active' : ''} key={item} onClick={() => setLanguage(item)}>{item.toUpperCase()}</button>)}</div>;
}

function SectionIntro({ eyebrow, title }: { eyebrow: string; title: string }) { return <div className="section-intro"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>; }
function FamilyCard({ family }: { family: { title: string; parents: string; address: string } }) { return <div className="family-card"><small>{family.title}</small><strong>{family.parents}</strong><span>{family.address}</span></div>; }

function PhotoLightbox({ index, setIndex, language }: { index: number; setIndex: (index: number | null) => void; language: Language }) {
  const next = () => setIndex((index + 1) % wedding.images.gallery.length);
  const previous = () => setIndex((index - 1 + wedding.images.gallery.length) % wedding.images.gallery.length);
  return <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label={copy[language].gallery.close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIndex(null)}><button className="lightbox-close" onClick={() => setIndex(null)} aria-label={copy[language].gallery.close}><X /></button><button className="lightbox-prev" onClick={(event) => { event.stopPropagation(); previous(); }} aria-label="Previous photo"><ChevronLeft /></button><img src={asset(wedding.images.gallery[index])} alt={`Wedding memory ${index + 1}`} onClick={(event) => event.stopPropagation()} /><button className="lightbox-next" onClick={(event) => { event.stopPropagation(); next(); }} aria-label="Next photo"><ChevronRight /></button></motion.div>;
}

function downloadCalendar(language: Language) {
  const calendarDate = wedding.event.date.replace(/[-:]/g, '').replace('.000', '');
  const event = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${calendarDate}\nSUMMARY:${wedding.couple.groom} & ${wedding.couple.bride} Wedding\nLOCATION:${wedding.event.venue}, ${wedding.event.address}\nEND:VEVENT\nEND:VCALENDAR`;
  const blob = new Blob([event], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = language === 'vi' ? 'lich-cuoi.ics' : 'wedding.ics';
  link.click();
  URL.revokeObjectURL(url);
}

export default App;
