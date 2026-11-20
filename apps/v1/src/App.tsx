import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, useInView, useScroll, useSpring, type Variants } from 'motion/react';
import {
  ArrowUp,
  Calendar,
  CalendarPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Download,
  Eye,
  EyeOff,
  Heart,
  HeartCrack,
  MailOpen,
  MapPin,
  Menu,
  Music,
  Quote,
  Send,
  VolumeX,
  X,
} from 'lucide-react';
import { weddingConfig, type GalleryConcept, type ResponsiveImageSource, type WeddingConfig } from './config';
import { ResponsiveImage, ResponsivePicture, ResponsiveGalleryImage, optimizedSrc } from './components/ResponsiveImage';
import { CursorEffects } from './components/CursorEffects';
import { apiUrl, siteId, siteStorageKey } from './site';
import { Language, languageLabels, localeByLanguage, translations } from './i18n';

// --- Shared helpers ---

interface LocalizedProps {
  language: Language;
}

interface NavbarProps extends LocalizedProps {
  onLanguageChange: (language: Language) => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const WEDDING_UTC_OFFSET = '+07:00'; // The ceremony happens in Hà Nội.
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * `new Date('2026-12-12')` is parsed as UTC midnight, which shows as Dec 11 for
 * guests in negative-offset timezones. Parse date-only strings as a calendar date.
 */
const parseCalendarDate = (value: string) => {
  const match = DATE_ONLY.exec(value);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date(value);
};

const formatWeddingDate = (language: Language, options: Intl.DateTimeFormatOptions) =>
  parseCalendarDate(weddingConfig.weddingDate).toLocaleDateString(localeByLanguage[language], options);

const shortWeddingDate = () => {
  const date = parseCalendarDate(weddingConfig.weddingDate);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
};

/** Ceremony start as an absolute instant (Hà Nội time), used for countdown & calendar. */
const weddingStart = (() => {
  const { weddingDate, weddingTime } = weddingConfig;
  const time = /^\d{2}:\d{2}$/.test(weddingTime) ? weddingTime : '00:00';
  const date = DATE_ONLY.test(weddingDate) ? new Date(`${weddingDate}T${time}:00${WEDDING_UTC_OFFSET}`) : new Date(weddingDate);
  return Number.isNaN(date.getTime()) ? null : date;
})();

/** Calendar date (YYYY-MM-DD) in Hà Nội time, whatever the guest's own timezone is. */
const hanoiDate = (time: number) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(time);

/** 'upcoming' until the ceremony starts, 'today' for the rest of that day, then 'past'. */
const weddingPhase = (now: number): 'upcoming' | 'today' | 'past' => {
  if (!weddingStart || now < weddingStart.getTime()) return 'upcoming';
  return hanoiDate(now) === hanoiDate(weddingStart.getTime()) ? 'today' : 'past';
};

const isAppleDevice = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);

/**
 * "Add to calendar": Apple devices get an .ics file (opens the Calendar app, no Google
 * login needed); everyone else gets Google Calendar's prefilled event page.
 */
const calendarUrl = (language: Language) => {
  if (!weddingStart) return null;
  const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const end = new Date(weddingStart.getTime() + 4 * 60 * 60 * 1000);
  const title = `${translations[language].details.calendarEvent} ${weddingConfig.groomName} & ${weddingConfig.brideName}`;
  const location = `${weddingConfig.locationName}, ${weddingConfig.locationAddress}`;

  if (isAppleDevice) {
    const params = new URLSearchParams({ title, start: stamp(weddingStart), end: stamp(end), location, details: weddingConfig.googleMapsUrl });
    return `/api/calendar?${params.toString()}`;
  }
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${stamp(weddingStart)}/${stamp(end)}`,
    location,
    details: weddingConfig.googleMapsUrl,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Locks page scrolling while an overlay is open. `overflow: hidden` on <body> alone is
 * ignored by touch scrolling on iOS < 16, so the body is pinned with position: fixed and
 * the scroll position restored afterwards. Returns the unlock function.
 */
const lockPageScroll = () => {
  const { body } = document;
  const scrollY = window.scrollY;
  const previous = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow };
  body.style.position = 'fixed';
  body.style.top = `-${scrollY}px`;
  body.style.width = '100%';
  body.style.overflow = 'hidden';
  return () => {
    Object.assign(body.style, previous);
    window.scrollTo({ top: scrollY, behavior: 'instant' as ScrollBehavior });
  };
};

/** crypto.randomUUID only exists in secure contexts (https/localhost), not on LAN http. */
const createUuid = () => {
  if (typeof window.crypto?.randomUUID === 'function') return window.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const readStorage = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private mode / storage disabled: the page still works without persistence.
  }
};

// --- Decorations ---

const HEARTS = [
  { x: '4%', s: '14px', d: '13s', delay: '0s', sway: '24px' },
  { x: '14%', s: '10px', d: '16s', delay: '3s', sway: '-18px' },
  { x: '24%', s: '18px', d: '12s', delay: '6s', sway: '20px' },
  { x: '36%', s: '11px', d: '17s', delay: '1.5s', sway: '-24px' },
  { x: '48%', s: '15px', d: '14s', delay: '8s', sway: '18px' },
  { x: '60%', s: '10px', d: '15s', delay: '4.5s', sway: '-16px' },
  { x: '71%', s: '17px', d: '13s', delay: '10s', sway: '22px' },
  { x: '82%', s: '12px', d: '18s', delay: '2s', sway: '-20px' },
  { x: '92%', s: '15px', d: '12.5s', delay: '7s', sway: '16px' },
  { x: '55%', s: '9px', d: '19s', delay: '12s', sway: '-12px' },
];

const FloatingHearts = ({ color, count = HEARTS.length }: { color?: string; count?: number }) => (
  <div className="float-layer" aria-hidden="true">
    {HEARTS.slice(0, count).map((heart, index) => (
      <span
        key={index}
        className="float-heart"
        style={{
          '--x': heart.x,
          '--s': heart.s,
          '--d': heart.d,
          '--delay': heart.delay,
          '--sway': heart.sway,
          ...(color ? { '--c': color } : {}),
        } as React.CSSProperties}
      >
        {index % 3 === 2 ? '✿' : '♥'}
      </span>
    ))}
  </div>
);

const HeartDivider = () => (
  <div className="heart-divider" aria-hidden="true">
    <span />
    <Heart size={14} fill="currentColor" />
    <span />
  </div>
);

const SectionHeading = ({ eyebrow, title, intro }: { eyebrow: string; title?: string; intro?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.6 }}
    transition={{ duration: 0.7, ease: EASE }}
    className="mb-14 text-center md:mb-16"
  >
    {title ? (
      <>
        <span className="section-eyebrow">
          <Heart size={10} fill="currentColor" aria-hidden="true" />
          {eyebrow}
        </span>
        <h2 className="mt-4 font-headline text-4xl leading-tight text-on-surface md:text-5xl">{title}</h2>
      </>
    ) : (
      // Eyebrow-only heading: the pill is the section's heading for screen readers.
      <h2 className="section-eyebrow">
        <Heart size={10} fill="currentColor" aria-hidden="true" />
        {eyebrow}
      </h2>
    )}
    <HeartDivider />
    {intro ? <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-on-surface-variant">{intro}</p> : null}
  </motion.div>
);

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left"
      style={{ scaleX, background: 'linear-gradient(90deg, #f7b6c7, #e88aa5, #b84d70)' }}
    />
  );
};

// --- Language switcher & navbar ---

const LanguageSwitcher = ({ language, onLanguageChange, tone = 'glass' }: NavbarProps & { tone?: 'glass' | 'soft' }) => {
  const t = translations[language];

  return (
    <div
      role="group"
      className={`flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full p-1 backdrop-blur-sm ${tone === 'glass' ? 'bg-white/20' : 'bg-primary-container/60'}`}
      aria-label={t.language.label}
    >
      {(['vi', 'en'] as Language[]).map((item) => {
        const isActive = item === language;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onLanguageChange(item)}
            className={`h-10 min-w-11 whitespace-nowrap rounded-full px-3 font-label text-xs font-extrabold transition-all ${
              isActive ? 'bg-white text-primary shadow-sm' : 'text-current hover:bg-white/30'
            }`}
            aria-pressed={isActive}
          >
            {languageLabels[item]}
          </button>
        );
      })}
    </div>
  );
};

const SECTION_IDS = ['story', 'details', 'gallery', 'gifts', 'rsvp'];

const useActiveSection = () => {
  const [active, setActive] = useState('');

  useEffect(() => {
    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter((element): element is HTMLElement => Boolean(element));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return active;
};

const Navbar = ({ language, onLanguageChange }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeSection = useActiveSection();
  const t = translations[language];
  const isSolid = isScrolled || isMobileMenuOpen;
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: t.nav.story, href: '#story' },
    { name: t.nav.details, href: '#details' },
    { name: t.nav.gallery, href: '#gallery' },
    { name: t.nav.gifts, href: '#gifts' },
    { name: t.nav.rsvp, href: '#rsvp', action: true },
  ];

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isSolid ? 'bg-surface/95 py-3 shadow-[0_8px_30px_-18px_rgba(184,77,112,0.45)] md:bg-surface/85 md:backdrop-blur-md' : 'bg-transparent py-5 md:py-6'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-end gap-4 px-5 md:px-6 xl:justify-center">
        {/* Desktop Nav */}
        <div className="hidden min-w-0 items-center gap-2 xl:flex">
          <div className="flex min-w-0 flex-nowrap items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.slice(1);
              const colorClass = isSolid
                ? isActive
                  ? 'text-primary'
                  : 'text-on-surface hover:text-primary'
                : 'text-white hover:text-primary-container';
              if (link.action) {
                return (
                  <a key={link.href} href={link.href} className="btn-cute mx-1 shrink-0 px-5 py-2 text-xs uppercase">
                    {link.name}
                  </a>
                );
              }
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'true' : undefined}
                  className={`relative shrink-0 whitespace-nowrap rounded-full px-3 py-2 font-label text-[0.8rem] font-bold uppercase tracking-[0.14em] transition-colors ${colorClass}`}
                >
                  {link.name}
                  {isActive ? (
                    <motion.span
                      layoutId="nav-active"
                      className={`absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full ${isSolid ? 'bg-primary-soft' : 'bg-white'}`}
                    />
                  ) : null}
                </a>
              );
            })}
          </div>
          <div className={`ml-2 shrink-0 ${isSolid ? 'text-on-surface' : 'text-white'}`}>
            <LanguageSwitcher language={language} onLanguageChange={onLanguageChange} tone={isSolid ? 'soft' : 'glass'} />
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          type="button"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors xl:hidden ${
            isSolid ? 'bg-primary-container/60 text-primary' : 'bg-white/20 text-white backdrop-blur-sm'
          }`}
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-label={t.nav.menu}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="absolute inset-x-4 top-full mt-2 flex max-h-[calc(100dvh-5.5rem)] flex-col items-center gap-2 overflow-y-auto overscroll-contain rounded-[1.75rem] border border-primary-soft/20 bg-white px-6 py-6 shadow-xl xl:hidden"
          >
            {navLinks.map((link, index) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * index }}
                className={
                  link.action
                    ? 'btn-cute my-1 w-full max-w-xs py-3 text-sm uppercase'
                    : `w-full max-w-xs rounded-full py-2.5 text-center font-label text-sm font-bold uppercase tracking-[0.14em] transition-colors hover:bg-blush hover:text-primary ${
                        activeSection === link.href.slice(1) ? 'bg-blush text-primary' : 'text-on-surface'
                      }`
                }
              >
                {link.name}
              </motion.a>
            ))}
            <div className="mt-2 text-on-surface">
              <LanguageSwitcher language={language} onLanguageChange={onLanguageChange} tone="soft" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Invitation cover (loading screen) ---

interface CoverProps extends NavbarProps {
  ready: boolean;
  onOpen: () => void;
}

const InvitationCover = ({ language, onLanguageChange, ready, onOpen }: CoverProps) => {
  const t = translations[language].cover;

  return (
    <motion.div
      className="invite-cover bg-blush-glow"
      role="dialog"
      aria-modal="true"
      aria-label={t.open}
      exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.8, ease: EASE } }}
    >
      <FloatingHearts color="rgba(232, 138, 165, 0.5)" />
      <div className="absolute right-4 top-4 text-primary sm:right-6 sm:top-6">
        <LanguageSwitcher language={language} onLanguageChange={onLanguageChange} tone="soft" />
      </div>

      <motion.div
        className="invite-card"
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <motion.div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-primary"
          animate={{ rotate: [0, -6, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.2 }}
          aria-hidden="true"
        >
          <MailOpen size={24} />
        </motion.div>
        <p className="mt-6 font-label text-xs font-bold uppercase leading-relaxed tracking-[0.2em] text-on-surface-variant">{t.invite}</p>
        <p className="invite-names mt-4 font-names text-[3.4rem] font-normal leading-[1.15] text-primary sm:text-[4rem]">
          {weddingConfig.groomName}
          <span className="my-1 block text-[2.6rem] leading-none text-primary-soft">&</span>
          {weddingConfig.brideName}
        </p>
        <p className="mt-5 font-label text-xs font-bold uppercase tracking-[0.25em] text-cocoa">
          {shortWeddingDate()} · {weddingConfig.locationName}
        </p>

        <div className="mt-8 flex min-h-[6rem] flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {ready ? (
              <motion.div
                key="open"
                initial={{ opacity: 0, scale: 0.9, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="flex flex-col items-center gap-3"
              >
                <button type="button" onClick={onOpen} autoFocus className="btn-cute px-8 py-4 text-sm uppercase">
                  <Heart size={16} fill="currentColor" className="animate-heartbeat" aria-hidden="true" />
                  {t.open}
                </button>
                <p className="text-xs text-on-surface-variant">{t.hint}</p>
              </motion.div>
            ) : (
              <motion.div
                key="loading"
                exit={{ opacity: 0, y: -6 }}
                role="status"
                className="flex flex-col items-center gap-3 text-primary"
              >
                <Heart className="animate-heartbeat" fill="currentColor" size={30} aria-hidden="true" />
                <span className="inline-flex items-center gap-2 font-label text-xs font-bold uppercase tracking-[0.2em]">
                  {t.loading}
                  <span className="loader-dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Hero ---

const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.35 } },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 26, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: EASE } },
};

interface HeroProps extends LocalizedProps {
  heroImages: WeddingConfig['heroImages'];
  isOpened: boolean;
}

const Hero = ({ language, heroImages, isOpened }: HeroProps) => {
  const t = translations[language];

  return (
    <section id="top" className="hero-section relative flex w-full items-center justify-center overflow-hidden text-center">
      <div className="absolute inset-0 z-0 h-full w-full">
        <motion.div
          className="h-full w-full"
          initial={{ scale: 1.14 }}
          animate={{ scale: isOpened ? 1 : 1.14 }}
          transition={{ duration: 9, ease: 'easeOut' }}
        >
          <ResponsivePicture
            mobileSrc={heroImages.mobile}
            tabletSrc={heroImages.tablet}
            desktopSrc={heroImages.desktop}
            alt={t.hero.alt}
            className="hero-image h-full w-full"
            objectFit="cover"
            priority
          />
        </motion.div>
        <div className="hero-overlay" />
      </div>

      <FloatingHearts color="rgba(255, 255, 255, 0.7)" count={8} />

      <motion.div
        variants={heroContainer}
        initial="hidden"
        animate={isOpened ? 'show' : 'hidden'}
        className="relative z-10 max-w-4xl px-6 text-white"
      >
        <motion.h1 variants={heroItem} className="hero-names font-names text-[clamp(2.75rem,15vw,3.8rem)] font-normal leading-[1.1] sm:text-7xl lg:text-8xl">
          <span className="whitespace-nowrap">{weddingConfig.groomName}</span>
          <span className="mx-3 my-1 block text-[3rem] leading-none text-white [text-shadow:0_0_18px_rgba(232,138,165,0.95)] sm:text-6xl xl:inline">&</span>
          <span className="whitespace-nowrap">{weddingConfig.brideName}</span>
        </motion.h1>
        <motion.p variants={heroItem} className="mt-6 font-label text-xs font-bold uppercase tracking-[0.3em] text-white/90 sm:text-sm md:text-base">
          {formatWeddingDate(language, { month: 'long', day: 'numeric', year: 'numeric' })} • {weddingConfig.locationName}
        </motion.p>
        <motion.p variants={heroItem} className="mx-auto mt-6 max-w-2xl font-headline text-lg italic leading-relaxed text-white/95 md:text-2xl">
          “{t.hero.intro}”
        </motion.p>
      </motion.div>
    </section>
  );
};

const HeroPlaceholder = () => <section id="top" className="hero-section hero-placeholder" aria-hidden="true" />;

// --- Story ---

const OurStory = ({ language, storyImages }: LocalizedProps & { storyImages: string[] }) => {
  const t = translations[language];
  const timeline = t.story.timeline;
  const imagePool = storyImages.length > 0 ? storyImages : [weddingConfig.storyImage];
  const resolvedStoryImages = timeline.map((_, index) => imagePool[index % imagePool.length]);

  return (
    <section id="story" className="bg-dots relative bg-surface px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={t.story.eyebrow} title={t.story.title} />

        <div className="story-timeline">
          {timeline.map((item, index) => (
            <motion.article
              key={`${item.title}-${index}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, ease: EASE }}
              className={`story-step ${index % 2 === 1 ? 'story-step-reverse' : ''}`}
            >
              <motion.div
                className="story-step-marker"
                aria-hidden="true"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ type: 'spring', stiffness: 320, damping: 16, delay: 0.15 }}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
              </motion.div>
              <div className="story-step-media">
                <ResponsiveImage
                  src={resolvedStoryImages[index]}
                  alt={`${t.story.imageAlt} - ${item.title}`}
                  className="story-step-image"
                  objectFit="cover"
                />
              </div>
              <div className="story-step-copy">
                <span className="story-date">{item.date}</span>
                <h3 className="mt-3 font-headline text-2xl text-on-surface md:text-3xl">{item.title}</h3>
                <p className="mt-4 leading-relaxed text-on-surface-variant">{item.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Countdown & details ---

const Countdown = ({ language }: LocalizedProps) => {
  const t = translations[language].countdown;
  const [now, setNow] = useState(() => Date.now());

  const phase = weddingPhase(now);

  useEffect(() => {
    // Nothing left to tick once the wedding day is over.
    if (phase === 'past') return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  if (!weddingStart) return null;
  const diff = Math.max(0, weddingStart.getTime() - now);

  if (phase !== 'upcoming') {
    return (
      <p className="mb-14 text-balance text-center font-display text-4xl text-primary">
        {phase === 'today' ? t.arrived : t.past} <Heart className="inline animate-heartbeat" fill="currentColor" size={28} aria-hidden="true" />
      </p>
    );
  }

  const units = [
    { label: t.days, value: Math.floor(diff / 86_400_000) },
    { label: t.hours, value: Math.floor(diff / 3_600_000) % 24 },
    { label: t.minutes, value: Math.floor(diff / 60_000) % 60 },
    { label: t.seconds, value: Math.floor(diff / 1000) % 60 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="mb-16 text-center"
    >
      <p className="font-headline text-xl italic text-on-surface-variant md:text-2xl">{t.title}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-5" role="timer" aria-live="off">
        {units.map((unit) => (
          <div key={unit.label} className="countdown-box">
            <div className="relative h-10 w-full overflow-hidden sm:h-12">
              {/* Re-keyed span = enter-only flip. No exit animation, so nothing can pile up
                  when the browser throttles animations (background tabs). */}
              <motion.span
                key={unit.value}
                initial={{ y: '70%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="block font-headline text-3xl font-semibold tabular-nums text-primary sm:text-4xl"
              >
                {String(unit.value).padStart(2, '0')}
              </motion.span>
            </div>
            <span className="mt-1 font-label text-xs font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">{unit.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const WeddingDetails = ({ language }: LocalizedProps) => {
  const t = translations[language];
  const calendarHref = calendarUrl(language);
  const details = [
    {
      icon: <Calendar size={26} />,
      title: t.details.dateTitle,
      content: formatWeddingDate(language, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
      sub: t.details.dateSub,
      link: calendarHref ? { href: calendarHref, label: t.details.addToCalendar, icon: <CalendarPlus size={14} aria-hidden="true" /> } : null,
    },
    {
      icon: <Clock size={26} />,
      title: t.details.timeTitle,
      content: weddingConfig.weddingTime,
      sub: t.details.timeSub,
      link: null,
    },
    {
      icon: <MapPin size={26} />,
      title: t.details.locationTitle,
      content: weddingConfig.locationName,
      sub: weddingConfig.locationAddress,
      link: { href: weddingConfig.googleMapsUrl, label: t.details.viewMap, icon: <MapPin size={14} aria-hidden="true" /> },
    },
  ];

  return (
    <section id="details" className="relative bg-blush px-6 py-24 md:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={t.details.eyebrow} title={t.details.title} />
        <Countdown language={language} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {details.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: EASE, delay: index * 0.12 }}
              whileHover={{ y: -8 }}
              className={`cute-card group flex flex-col items-center px-8 py-10 text-center ${index === 2 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
            >
              <div className="group-hover-wiggle mb-6 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-primary-container text-primary">
                {item.icon}
              </div>
              <h3 className="mb-3 font-headline text-2xl">{item.title}</h3>
              <p className="mb-1 text-lg font-semibold text-on-surface first-letter:uppercase">{item.content}</p>
              <p className="mt-3 text-balance font-label text-xs font-bold uppercase leading-relaxed tracking-[0.14em] text-on-surface-variant">{item.sub}</p>
              {item.link ? (
                <a href={item.link.href} target="_blank" rel="noreferrer" className="btn-outline-cute mt-6 px-5 py-2 text-xs uppercase">
                  {item.link.icon}
                  {item.link.label}
                </a>
              ) : null}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- RSVP & wishes (one section) ---

interface Wish {
  id?: string;
  name: string;
  message: string;
  createdAt?: string;
}

const RSVP_SUBMISSION_ID_KEY = siteStorageKey('wedding-rsvp-submission-id');
const RSVP_RESPONSE_KEY = siteStorageKey('wedding-rsvp-response');
const WISHES_PAGE_SIZE = 6;

/** Page list with gaps, e.g. 1 … 4 5 6 … 12. Always shows first, last and neighbours. */
const paginationItems = (current: number, total: number): Array<number | 'gap'> => {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((page) => pages.add(page));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((page) => pages.add(page));
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  return sorted.flatMap((page, index) => (index > 0 && page - sorted[index - 1] > 1 ? (['gap', page] as const) : [page]));
};
const WISH_MAX_LENGTH = 1000;

interface SavedRsvp {
  name: string;
  attending: boolean;
  partySize: number;
}

/** Fallback when storage is blocked (private mode, some in-app browsers): one id per visit. */
let memorySubmissionId: string | null = null;

const getRsvpSubmissionId = () => {
  const existing = readStorage(RSVP_SUBMISSION_ID_KEY) ?? memorySubmissionId;
  if (existing) return existing;
  const submissionId = createUuid();
  memorySubmissionId = submissionId;
  writeStorage(RSVP_SUBMISSION_ID_KEY, submissionId);
  return submissionId;
};

const readSavedRsvp = (): SavedRsvp | null => {
  try {
    const parsed = JSON.parse(readStorage(RSVP_RESPONSE_KEY) ?? 'null');
    if (typeof parsed?.name === 'string' && typeof parsed?.attending === 'boolean') {
      return { name: parsed.name, attending: parsed.attending, partySize: Number(parsed.partySize) || 1 };
    }
  } catch {
    // Ignore malformed data.
  }
  return null;
};

const postJson = async (url: string, body: unknown) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error ?? `Request failed: ${url}`);
  return payload;
};

const BurstHearts = () => (
  <div className="pointer-events-none absolute inset-0" aria-hidden="true">
    {Array.from({ length: 8 }, (_, index) => {
      const angle = (index / 8) * Math.PI * 2;
      return (
        <motion.span
          key={index}
          className="absolute left-1/2 top-1/2 text-primary-soft"
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
          animate={{ x: Math.cos(angle) * 70, y: Math.sin(angle) * 70, opacity: 0, scale: 1.1 }}
          transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
        >
          ♥
        </motion.span>
      );
    })}
  </div>
);

const LoadingDots = () => (
  <span className="loader-dots" aria-hidden="true">
    <span className="!bg-white" />
    <span className="!bg-white" />
    <span className="!bg-white" />
  </span>
);

interface RsvpWishesProps extends LocalizedProps {
  wishes?: Wish[];
  onWishSubmitted: (wish: Wish) => void;
}

/**
 * One form for both: attendance (saved to /api/rsvps) and an optional wish
 * (saved to /api/wishes). Below it, a balanced masonry wall of wishes.
 */
const RsvpAndWishes = ({ language, wishes, onWishSubmitted }: RsvpWishesProps) => {
  const t = translations[language].rsvp;
  const tg = translations[language].guestbook;
  const [saved, setSaved] = useState<SavedRsvp | null>(readSavedRsvp);
  const [isEditing, setIsEditing] = useState(() => readSavedRsvp() === null);
  const [name, setName] = useState(saved?.name ?? '');
  const [attending, setAttending] = useState<boolean | null>(saved?.attending ?? null);
  const [partySize, setPartySize] = useState(saved?.attending ? saved.partySize : 1);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<'rsvp' | 'wish' | null>(null);
  // Validation messages appear only after a submit attempt, then update live.
  const [showErrors, setShowErrors] = useState(false);
  // Anti-spam signals (see api/wishes.ts): a hidden field only bots fill, and time on form.
  const [website, setWebsite] = useState('');
  const formShownAt = useRef(Date.now());
  const botCheck = () => ({ website, elapsedMs: Date.now() - formShownAt.current });
  const nameMissing = !name.trim();
  const attendanceMissing = attending === null;
  const [page, setPage] = useState(1);
  // undefined = still loading. Sample wishes are never shown as if guests had written them.
  const isLoadingWishes = wishes === undefined;
  const displayedWishes: readonly Wish[] = wishes ?? [];
  const pageCount = Math.max(1, Math.ceil(displayedWishes.length / WISHES_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * WISHES_PAGE_SIZE;
  const visibleWishes = displayedWishes.slice(pageStart, pageStart + WISHES_PAGE_SIZE);

  const goToPage = (next: number) => {
    setPage(Math.min(Math.max(1, next), pageCount));
    // Keep the wall's top in view so guests aren't left staring at the footer.
    const wall = document.getElementById('wishes');
    if (wall && wall.getBoundingClientRect().top < 0) wall.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (nameMissing || attending === null) {
      setShowErrors(true);
      // Move focus to the first field that still needs an answer.
      const firstInvalid = nameMissing ? document.getElementById('rsvp-name') : document.querySelector<HTMLInputElement>('input[name="attendance"]');
      firstInvalid?.focus();
      firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const guestName = name.trim();
    const wishMessage = message.trim();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = await postJson(apiUrl('/api/rsvps'), {
        guestName,
        attending,
        partySize: attending ? partySize : 0,
        submissionId: getRsvpSubmissionId(),
        ...botCheck(),
      });
      if (!payload?.rsvp) throw new Error('Unable to save RSVP');
    } catch {
      setError('rsvp');
      setIsSubmitting(false);
      return;
    }

    const nextSaved = { name: guestName, attending, partySize: attending ? partySize : 0 };
    writeStorage(RSVP_RESPONSE_KEY, JSON.stringify(nextSaved));
    setSaved(nextSaved);

    if (wishMessage) {
      try {
        const payload = await postJson(apiUrl('/api/wishes'), { name: guestName, message: wishMessage, ...botCheck() });
        if (!payload?.wish) throw new Error('Unable to send wish');
        onWishSubmitted(payload.wish);
        setPage(1);
        setMessage('');
      } catch {
        // RSVP is saved; keep the form open so the guest can resend only the wish.
        setError('wish');
        setIsSubmitting(false);
        return;
      }
    }

    setIsEditing(false);
    setIsSubmitting(false);
  };

  return (
    <section id="rsvp" className="bg-blush-glow relative overflow-hidden px-6 py-24 md:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} intro={tg.intro} />

        <div className="mx-auto max-w-2xl">
          <AnimatePresence mode="wait" initial={false}>
            {!isEditing && saved ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="cute-card px-8 py-12 text-center sm:px-12"
                role="status"
                aria-live="polite"
              >
                <div className="relative mx-auto h-20 w-20">
                  <BurstHearts />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-container text-primary"
                  >
                    {saved.attending ? <Heart size={34} fill="currentColor" className="animate-heartbeat" /> : <HeartCrack size={34} />}
                  </motion.div>
                </div>
                <h3 className="mt-6 font-display text-4xl text-primary">{t.successTitle}</h3>
                <p className="mt-3 text-lg text-on-surface-variant">
                  <strong className="text-on-surface">{saved.name}</strong> · {saved.attending ? `${t.attending} (${saved.partySize})` : t.notAttending}
                </p>
                <p className="mt-2 text-on-surface-variant">{saved.attending ? t.successAttending : t.successNotAttending}</p>
                <button type="button" onClick={() => setIsEditing(true)} className="btn-outline-cute mt-8 px-6 py-2.5 text-xs uppercase">
                  {t.edit}
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                noValidate
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="cute-card space-y-7 p-7 text-left sm:p-10"
              >
                <p className="font-label text-xs text-on-surface-variant">
                  <span className="required-mark" aria-hidden="true">*</span> {t.requiredNote}
                </p>
                <div className="honeypot" aria-hidden="true">
                  <label htmlFor="rsvp-website">Website</label>
                  <input id="rsvp-website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
                </div>
                <div>
                  <label htmlFor="rsvp-name" className="cute-label">
                    {t.nameLabel}
                    <span className="required-mark" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="rsvp-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={120}
                    required
                    autoComplete="name"
                    placeholder={t.namePlaceholder}
                    aria-required="true"
                    aria-invalid={showErrors && nameMissing}
                    aria-describedby={showErrors && nameMissing ? 'rsvp-name-error' : undefined}
                    className="cute-input"
                  />
                  {showErrors && nameMissing ? (
                    <p id="rsvp-name-error" className="field-error" role="alert">
                      {t.nameRequired}
                    </p>
                  ) : null}
                </div>

                <fieldset
                  aria-required="true"
                  aria-invalid={showErrors && attendanceMissing}
                  aria-describedby={showErrors && attendanceMissing ? 'rsvp-attendance-error' : undefined}
                >
                  <legend className="cute-label">
                    {t.attendanceLabel}
                    <span className="required-mark" aria-hidden="true">*</span>
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2" data-invalid={showErrors && attendanceMissing}>
                    {[
                      { value: true, label: t.attending, icon: <Heart size={16} fill="currentColor" aria-hidden="true" /> },
                      { value: false, label: t.notAttending, icon: <HeartCrack size={16} aria-hidden="true" /> },
                    ].map((option) => {
                      const isSelected = attending === option.value;
                      return (
                        <label key={String(option.value)} className="choice-pill" data-selected={isSelected}>
                          <input
                            type="radio"
                            name="attendance"
                            value={String(option.value)}
                            checked={isSelected}
                            onChange={() => setAttending(option.value)}
                            className="sr-only"
                            required
                          />
                          {option.icon}
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                  {showErrors && attendanceMissing ? (
                    <p id="rsvp-attendance-error" className="field-error" role="alert">
                      {t.attendanceRequired}
                    </p>
                  ) : null}
                </fieldset>

                <AnimatePresence initial={false}>
                  {attending ? (
                    <motion.fieldset
                      key="party"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <legend className="cute-label">{t.partySizeLabel}</legend>
                      <div className="grid grid-cols-4 gap-3 pb-1">
                        {[1, 2, 3, 4].map((size) => {
                          const isSelected = partySize === size;
                          return (
                            <label key={size} className="choice-pill" data-selected={isSelected}>
                              <input
                                type="radio"
                                name="party-size"
                                value={size}
                                checked={isSelected}
                                onChange={() => setPartySize(size)}
                                className="sr-only"
                              />
                              {size}
                            </label>
                          );
                        })}
                      </div>
                    </motion.fieldset>
                  ) : null}
                </AnimatePresence>

                <div>
                  <label htmlFor="rsvp-message" className="cute-label">
                    {t.messageLabel}
                  </label>
                  <textarea
                    id="rsvp-message"
                    placeholder={t.messagePlaceholder}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    maxLength={WISH_MAX_LENGTH}
                    rows={4}
                    className="cute-input resize-none"
                  />
                  <p className="mt-1.5 text-right font-label text-xs text-on-surface-variant">
                    {message.length}/{WISH_MAX_LENGTH}
                  </p>
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-cute w-full py-4 text-sm uppercase">
                  {isSubmitting ? (
                    <>
                      <LoadingDots />
                      {t.submitting}
                    </>
                  ) : (
                    <>
                      <Send size={16} aria-hidden="true" />
                      {t.submit}
                    </>
                  )}
                </button>
                <AnimatePresence>
                  {error ? (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      role="alert"
                      className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700"
                    >
                      {error === 'rsvp' ? t.error : t.wishError}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Wishes wall: CSS columns keep cards of different lengths balanced. */}
        <div id="wishes" className="mt-20">
          <h3 className="mb-8 flex items-center justify-center gap-2 text-center font-headline text-2xl text-on-surface md:text-3xl">
            <Heart size={18} className="text-primary-soft" fill="currentColor" aria-hidden="true" />
            {tg.recent}
            <Heart size={18} className="text-primary-soft" fill="currentColor" aria-hidden="true" />
          </h3>
          {isLoadingWishes ? (
            <div className="wish-wall wish-wall-narrow" aria-busy="true">
              {[0, 1, 2].map((index) => (
                <div key={index} className="wish-card img-skeleton h-28" aria-hidden="true" />
              ))}
            </div>
          ) : displayedWishes.length === 0 ? (
            <p className="mx-auto max-w-md text-center font-headline text-lg italic text-on-surface-variant">{tg.empty}</p>
          ) : null}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: EASE }}
              className={`wish-wall ${visibleWishes.length <= 4 ? 'wish-wall-narrow' : ''}`}
            >
              {visibleWishes.map((wish, index) => (
                <article key={wish.id ?? `${wish.name}-${pageStart + index}`} className={`wish-card wish-card-${(pageStart + index) % 3}`}>
                  <Quote className="absolute right-4 top-4 text-primary-soft/25" size={30} aria-hidden="true" />
                  <p className="relative z-10 mb-4 whitespace-pre-line break-words pr-6 leading-relaxed text-on-surface-variant">{wish.message}</p>
                  <p className="flex items-center gap-1.5 font-display text-xl font-semibold text-primary">
                    <Heart size={12} fill="currentColor" className="text-primary-soft" aria-hidden="true" />
                    {wish.name}
                  </p>
                </article>
              ))}
            </motion.div>
          </AnimatePresence>

          {pageCount > 1 ? (
            <nav className="mt-10 flex items-center justify-center gap-1.5 sm:gap-2" aria-label={tg.pagination}>
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label={tg.previousPage}
                className="page-btn"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              {paginationItems(currentPage, pageCount).map((item, index) =>
                item === 'gap' ? (
                  <span key={`gap-${index}`} className="px-1 text-on-surface-variant" aria-hidden="true">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => goToPage(item)}
                    aria-current={item === currentPage ? 'page' : undefined}
                    className="page-btn"
                    data-active={item === currentPage}
                  >
                    {item}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === pageCount}
                aria-label={tg.nextPage}
                className="page-btn"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </nav>
          ) : null}
        </div>
      </div>
    </section>
  );
};

// --- Gallery ---

const slideVariants: Variants = {
  enter: (direction: number) => ({ x: direction >= 0 ? 90 : -90, opacity: 0, scale: 0.97 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (direction: number) => ({ x: direction >= 0 ? -90 : 90, opacity: 0, scale: 0.97 }),
};

/** Photos shown before "View more": the sunset row plus the first two garden rows. */
const GALLERY_PREVIEW_COUNT = 8;

const PhotoGallery = ({ language, concepts }: LocalizedProps & { concepts: GalleryConcept[] }) => {
  const t = translations[language];
  const [isExpanded, setIsExpanded] = useState(false);
  const totalCount = concepts.reduce((sum, concept) => sum + concept.rows.flat().length, 0);

  // Whole rows only: a row is shown when it starts before the preview limit.
  let seen = 0;
  const visibleConcepts = concepts
    .map((concept) => ({
      ...concept,
      rows: concept.rows.filter((row) => {
        const start = seen;
        seen += row.length;
        return isExpanded || start < GALLERY_PREVIEW_COUNT;
      }),
    }))
    .filter((concept) => concept.rows.length > 0);
  // The lightbox steps through exactly the photos on screen, in reading order.
  const galleryImages = visibleConcepts.flatMap((concept) => concept.rows.flat());
  const count = galleryImages.length;

  const toggleExpanded = () => {
    if (isExpanded) {
      // The button sits below the album: collapsing removes rows above it, so bring the
      // album back into view instead of leaving the guest further down the page.
      document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsExpanded((expanded) => !expanded);
  };
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isOpen = selectedImage !== null;
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useInView(sectionRef, { margin: '200px 0px' });

  const step = useCallback(
    (delta: number) => {
      setDirection(delta);
      setSelectedImage((index) => (index === null ? null : (index + delta + count) % count));
    },
    [count],
  );

  const open = (index: number) => {
    setDirection(0);
    setSelectedImage(index);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedImage(null);
      if (event.key === 'ArrowLeft') step(-1);
      if (event.key === 'ArrowRight') step(1);
    };

    // Remember the thumbnail that opened the lightbox so focus can go back to it.
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const unlockScroll = lockPageScroll();
    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      unlockScroll();
      window.removeEventListener('keydown', handleKeyDown);
      opener?.focus({ preventScroll: true });
    };
  }, [isOpen, step]);

  if (count === 0) return null;

  return (
    <section id="gallery" ref={sectionRef} data-visible={isVisible} className="gallery-section overflow-hidden px-6 py-24 md:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow={t.gallery.title} />

        <div className="mx-auto max-w-4xl">
          <AnimatePresence initial={false}>
            {visibleConcepts.map((concept) => (
              <motion.div
                key={concept.id}
                layout="position"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="gallery-concept"
              >
                {concept.rows.map((row) => (
                  <motion.div
                    key={row[0]}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="gallery-clothesline gallery-row"
                    style={{ '--cols': row.length } as React.CSSProperties}
                  >
                    {row.map((src) => {
                      const index = galleryImages.indexOf(src);
                      return (
                        <GalleryPhoto
                          key={src}
                          src={src}
                          index={index}
                          alt={`${t.gallery.altPrefix} ${index + 1}`}
                          onSelect={() => open(index)}
                          openLabel={t.gallery.open}
                        />
                      );
                    })}
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {totalCount > GALLERY_PREVIEW_COUNT ? (
          <div className="mx-auto mt-6 flex max-w-4xl justify-center">
            <button type="button" onClick={toggleExpanded} aria-expanded={isExpanded} className="gallery-toggle">
              {isExpanded ? t.gallery.showLess : t.gallery.showAll}
              {isExpanded ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
            </button>
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {selectedImage !== null ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${t.gallery.altPrefix} ${selectedImage + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:backdrop-blur-md"
            style={{ background: 'rgba(60, 30, 40, 0.88)' }}
          >
            <p className="gallery-lightbox-counter absolute left-1/2 z-[2] -translate-x-1/2 rounded-full bg-white/15 px-4 py-1.5 font-label text-xs font-bold tracking-[0.2em] text-white">
              {selectedImage + 1} / {count}
            </p>
            <div className="relative flex h-full w-full max-w-6xl items-center justify-center overflow-hidden">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.img
                  key={selectedImage}
                  src={optimizedSrc(galleryImages[selectedImage], 1600)}
                  alt={`${t.gallery.altPrefix} ${selectedImage + 1}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: EASE }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60 || info.velocity.x < -500) step(1);
                    else if (info.offset.x > 60 || info.velocity.x > 500) step(-1);
                  }}
                  onClick={(event) => event.stopPropagation()}
                  draggable={false}
                  referrerPolicy="no-referrer"
                  className="max-h-[80svh] w-auto max-w-full cursor-grab touch-none select-none rounded-2xl border-[6px] border-white object-contain shadow-2xl active:cursor-grabbing"
                />
              </AnimatePresence>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setSelectedImage(null);
              }}
              aria-label={t.gallery.close}
              className="gallery-lightbox-close"
            >
              <X aria-hidden="true" size={22} />
            </button>
            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    step(-1);
                  }}
                  aria-label={t.gallery.previous}
                  className="gallery-lightbox-arrow gallery-lightbox-previous"
                >
                  <ChevronLeft aria-hidden="true" size={28} />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    step(1);
                  }}
                  aria-label={t.gallery.next}
                  className="gallery-lightbox-arrow gallery-lightbox-next"
                >
                  <ChevronRight aria-hidden="true" size={28} />
                </button>
              </>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
};

interface GalleryPhotoProps {
  key?: React.Key;
  src: string;
  index: number;
  alt: string;
  onSelect: () => void;
  featured?: boolean;
  openLabel: string;
}

const GALLERY_ROTATIONS = [-2.2, 1.8, -1.5, 2.4, -2.6, 1.4];

const GalleryPhoto = ({ src, index, alt, onSelect, featured = false, openLabel }: GalleryPhotoProps) => {
  const rotation = GALLERY_ROTATIONS[index % GALLERY_ROTATIONS.length];

  // The outer element handles entrance + hover; the inner one gently sways.
  // (Previously both lived on one element and `whileInView` cancelled the sway.)
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 32, rotate: rotation }}
      whileInView={{ opacity: 1, y: 0, rotate: rotation }}
      whileHover={{ scale: 1.04, rotate: rotation / 3, zIndex: 3 }}
      whileTap={{ scale: 0.98 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: EASE, delay: (index % 4) * 0.08 }}
      onClick={onSelect}
      aria-label={`${openLabel} ${alt}`}
      className={`gallery-polaroid relative block w-full cursor-zoom-in text-left ${featured ? 'gallery-polaroid-featured' : 'gallery-polaroid-hanging'}`}
    >
      {/* Sway is a CSS animation (compositor only, paused off-screen by .gallery-section). */}
      <span
        className="gallery-sway group relative block rounded-lg bg-white p-2 pb-10 shadow-[0_18px_36px_-20px_rgba(138,106,90,0.6)] transition-shadow hover:shadow-[0_26px_44px_-20px_rgba(184,77,112,0.55)]"
        style={
          {
            transformOrigin: featured ? '50% 0%' : '50% -1.25rem',
            '--sway': featured ? '0.8deg' : '1.6deg',
            animationDuration: `${5 + index * 0.35}s`,
            animationDelay: `${index * 0.3}s`,
          } as React.CSSProperties
        }
      >
        {featured ? <span aria-hidden="true" className="gallery-tape" /> : <span aria-hidden="true" className="gallery-photo-pin" />}
        <ResponsiveGalleryImage
          src={src}
          alt={alt}
          containerClassName="gallery-photo"
          className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span aria-hidden="true" className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-1 font-display text-lg text-primary/80">
          <Heart size={12} fill="currentColor" />
        </span>
      </span>
    </motion.button>
  );
};

// --- Gifts ---

/**
 * In-app browsers (Zalo, Messenger, Facebook, Instagram...) and iOS ignore <a download>
 * on blob URLs without any error, so there we ask guests to long-press the QR instead.
 */
const cannotDownloadFiles = (() => {
  const ua = navigator.userAgent;
  const inAppBrowser = /FBAN|FBAV|FB_IAB|Messenger|Instagram|Zalo|Line\/|MicroMessenger|TikTok|; wv\)/i.test(ua);
  const iOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return inAppBrowser || iOS;
})();

const downloadQr = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Unable to download QR code');
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // Revoking synchronously can cancel the download in some browsers (Safari/Firefox).
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
  } catch {
    // Same-tab navigation: a window.open after an await is blocked as a popup.
    window.location.assign(url);
  }
};

interface GiftCardProps {
  title: string;
  alt: string;
  qr: string;
  note: string;
  name: string;
  filename: string;
  downloadLabel: string;
  saveHint: string;
  delay: number;
}

const GiftCard = ({ title, alt, qr, note, name, filename, downloadLabel, saveHint, delay }: GiftCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, ease: EASE, delay }}
    className="cute-card mt-4 px-8 pb-8 pt-10"
  >
    <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary-container px-5 py-1.5 font-label text-xs font-extrabold uppercase tracking-[0.16em] text-primary shadow-sm">
      {title}
    </span>
    <div className="mx-auto w-fit rounded-[1.5rem] border-2 border-dashed border-primary-soft/40 bg-white p-3">
      {/* Original file, not resized/re-encoded: guests long-press to save it, and banking apps must read it. */}
      <ResponsiveImage src={qr} alt={alt} optimize={false} className="h-auto w-52 rounded-xl md:w-56" objectFit="contain" />
    </div>
    <p className="mt-5 text-sm text-on-surface-variant">
      {note} <strong className="font-names text-2xl font-normal text-primary">{name}</strong>
    </p>
    {cannotDownloadFiles ? (
      <p className="mt-4 font-label text-sm font-semibold text-primary">{saveHint}</p>
    ) : (
      <button type="button" onClick={() => downloadQr(qr, filename)} className="btn-outline-cute mt-5 px-5 py-2 text-xs uppercase">
        <Download size={14} aria-hidden="true" />
        {downloadLabel}
      </button>
    )}
  </motion.div>
);

const Gifts = ({ language, groomQr, brideQr }: LocalizedProps & { groomQr: string; brideQr: string }) => {
  const t = translations[language];
  const [isQrVisible, setIsQrVisible] = useState(false);

  return (
    <section id="gifts" className="bg-dots relative bg-blush px-6 py-24 md:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <SectionHeading eyebrow={t.gifts.eyebrow} title={t.gifts.title} intro={t.gifts.body} />

        <button
          type="button"
          onClick={() => setIsQrVisible((visible) => !visible)}
          aria-controls="gift-qr-region"
          aria-expanded={isQrVisible}
          className="btn-cute px-7 py-3 text-xs uppercase"
        >
          {isQrVisible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          {isQrVisible ? t.gifts.hideQr : t.gifts.showQr}
        </button>

        <AnimatePresence initial={false}>
          {isQrVisible ? (
            <motion.div
              id="gift-qr-region"
              key="qr"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="grid gap-10 px-1 pb-4 pt-10 sm:grid-cols-2 sm:gap-8">
                <GiftCard
                  title={t.gifts.groomTitle}
                  alt={t.gifts.groomAlt}
                  qr={groomQr}
                  note={t.gifts.groomNote}
                  name={weddingConfig.groomName}
                  filename="qr-chu-re.jpg"
                  downloadLabel={t.gifts.downloadQr}
                  saveHint={t.gifts.saveHint}
                  delay={0.1}
                />
                <GiftCard
                  title={t.gifts.brideTitle}
                  alt={t.gifts.brideAlt}
                  qr={brideQr}
                  note={t.gifts.brideNote}
                  name={weddingConfig.brideName}
                  filename="qr-co-dau.jpg"
                  downloadLabel={t.gifts.downloadQr}
                  saveHint={t.gifts.saveHint}
                  delay={0.2}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
};

// --- Footer & floating controls ---

const Footer = ({ language }: LocalizedProps) => {
  const t = translations[language];

  return (
    <footer className="relative overflow-hidden bg-beige px-6 pb-28 pt-20 text-center">
      <FloatingHearts color="rgba(232, 138, 165, 0.35)" count={6} />
      <Heart className="mx-auto animate-heartbeat text-primary-soft" fill="currentColor" size={28} aria-hidden="true" />
      <div className="mt-4 font-names text-[3.4rem] font-normal text-primary md:text-7xl">
        {weddingConfig.groomName} <span className="text-primary-soft">&</span> {weddingConfig.brideName}
      </div>
      <p className="mx-auto mt-5 max-w-md font-headline text-lg italic leading-relaxed text-on-surface-variant">{t.footer.thanks}</p>
      <p className="mt-6 font-label text-xs font-bold uppercase tracking-[0.25em] text-cocoa">
        {formatWeddingDate(language, { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
    </footer>
  );
};

interface FloatingControlsProps extends LocalizedProps {
  isMuted: boolean;
  isPlaying: boolean;
  onToggleAudio: () => void;
}

const FloatingControls = ({ language, isMuted, isPlaying, onToggleAudio }: FloatingControlsProps) => {
  const t = translations[language];
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 700);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="fixed bottom-5 right-5 z-40 flex flex-col items-center gap-3 sm:bottom-8 sm:right-8"
      style={{ marginBottom: 'env(safe-area-inset-bottom)', marginRight: 'env(safe-area-inset-right)' }}
    >
      <AnimatePresence>
        {showTop ? (
          <motion.button
            key="top"
            type="button"
            initial={{ opacity: 0, y: 12, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label={t.footer.backToTop}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-lg ring-1 ring-primary/15 transition-transform hover:-translate-y-0.5"
          >
            <ArrowUp size={18} />
          </motion.button>
        ) : null}
      </AnimatePresence>
      <button
        type="button"
        onClick={onToggleAudio}
        aria-label={isMuted ? t.audio.on : t.audio.off}
        className="btn-cute relative h-14 w-14 p-0"
      >
        {isPlaying ? <span className="absolute inset-0 animate-ping rounded-full bg-primary-soft/40" aria-hidden="true" /> : null}
        {isMuted ? <VolumeX size={22} /> : <Music size={22} className={isPlaying ? 'animate-spin-slow' : ''} />}
      </button>
    </motion.div>
  );
};

// --- Hero preloading ---

const preferredHeroSource = (source: ResponsiveImageSource) => [source.avif, source.webp, source.fallback].filter(Boolean) as string[];

const preloadImage = async (source: ResponsiveImageSource) => {
  for (const url of preferredHeroSource(source)) {
    try {
      await new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          if (typeof image.decode !== 'function') {
            resolve();
            return;
          }
          // A loaded image is usable even when decode() is rejected by a browser.
          image.decode().then(resolve).catch(resolve);
        };
        image.onerror = () => reject(new Error(`Unable to load hero image: ${url}`));
        image.src = url;
      });
      return;
    } catch {
      // Try the next format when this browser cannot decode the preferred source.
    }
  }
  throw new Error('No usable hero image source');
};

const currentHeroSource = (heroImages: WeddingConfig['heroImages']) => {
  if (window.matchMedia('(max-width: 640px)').matches) return heroImages.mobile;
  if (window.matchMedia('(max-width: 1024px)').matches) return heroImages.tablet;
  return heroImages.desktop;
};

/** Never keep guests on the cover longer than this, even if the API or image is slow. */
const MAX_LOADING_MS = 6000;

// --- App ---

export default function App() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [activeConfig, setActiveConfig] = useState(weddingConfig);
  const [wishes, setWishes] = useState<Wish[] | undefined>();
  const [heroReady, setHeroReady] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  // Media the guest actually sees/hears. Frozen once the invitation is opened so a late
  // API response can't reload the playing <audio> (which stops the music) or swap the hero.
  const [mediaConfig, setMediaConfig] = useState(weddingConfig);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(() => readStorage('wedding-audio-muted') === 'true');
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = readStorage('wedding-language');
    return savedLanguage === 'en' || savedLanguage === 'vi' ? savedLanguage : 'vi';
  });

  useEffect(() => {
    if (!isOpened) setMediaConfig(activeConfig);
  }, [activeConfig, isOpened]);

  useEffect(() => {
    writeStorage('wedding-language', language);
    document.documentElement.lang = language;
  }, [language]);

  // index.html carries the Hà Nội title; keep the tab title in sync with the active site.
  useEffect(() => {
    if (siteId === 'hn') return;
    document.title = `${weddingConfig.groomName} & ${weddingConfig.brideName} · ${shortWeddingDate()} · ${weddingConfig.locationName}`;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const markReady = () => {
      if (!cancelled) setHeroReady(true);
    };
    const safetyTimer = window.setTimeout(markReady, MAX_LOADING_MS);

    fetch(apiUrl('/api/wedding-content'))
      .then((response) => (response.ok ? response.json() : null))
      .then(async (payload) => {
        const nextConfig = payload?.config ? { ...weddingConfig, ...payload.config } : weddingConfig;

        // Apply the API config before preloading. The preloader only prevents a
        // visual flash; it must never decide whether Blob or local media wins.
        if (!cancelled) setActiveConfig(nextConfig);

        try {
          await preloadImage(currentHeroSource(nextConfig.heroImages));
        } catch {
          // The <picture> element still owns the source fallback chain.
        }
        markReady();
      })
      .catch(async () => {
        // API unavailable (e.g. plain `vite dev`): still warm up the local hero image.
        try {
          await preloadImage(currentHeroSource(weddingConfig.heroImages));
        } catch {
          // ignore
        }
        markReady();
      });

    return () => {
      cancelled = true;
      window.clearTimeout(safetyTimer);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch(apiUrl('/api/wishes'))
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!cancelled) setWishes(Array.isArray(payload?.wishes) ? payload.wishes : []);
      })
      .catch(() => {
        if (!cancelled) setWishes([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Always open the invitation from the hero, not wherever the guest was before a reload.
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    if (window.location.hash) window.history.replaceState(null, '', window.location.pathname + window.location.search);
    window.scrollTo(0, 0);
  }, []);

  // In-page links (#story, #rsvp...) scroll smoothly without leaving a #hash in the URL,
  // so a reload or a shared link never drops the guest at the bottom of the page.
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
      const id = link?.getAttribute('href')?.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Lock page scroll while the invitation cover is shown.
  useEffect(() => {
    if (isOpened) return;
    return lockPageScroll();
  }, [isOpened]);

  // While the cover dialog is shown, the page behind it must not be reachable with Tab
  // or a screen reader (aria-modal alone isn't enough in most browsers).
  useEffect(() => {
    const behind = document.querySelectorAll<HTMLElement>('#root nav, #root main, #root footer');
    behind.forEach((element) => {
      element.inert = !isOpened;
    });
  }, [isOpened]);

  useEffect(() => {
    writeStorage('wedding-audio-muted', String(isMuted));
  }, [isMuted]);

  // Track real playback state (autoplay can be refused by the browser).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  // Pause the music while the tab is hidden, resume when the guest comes back.
  useEffect(() => {
    let resumeOnVisible = false;
    const handleVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden) {
        resumeOnVisible = !audio.paused;
        audio.pause();
      } else if (resumeOnVisible) {
        audio.play().catch(() => undefined);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const playAudio = () => {
    audioRef.current?.play().catch(() => undefined);
  };

  const handleOpen = () => {
    setIsOpened(true);
    // The click on "Open invitation" is a user gesture, so browsers allow playback.
    if (!isMuted) playAudio();
    // Always start the invitation from the hero, even if the URL carries a stale #hash.
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const toggleAudio = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) audioRef.current?.pause();
    else playAudio();
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen">
        <audio ref={audioRef} src={mediaConfig.audioUrl} loop preload="none" />
        <CursorEffects />
        <ScrollProgress />
        <Navbar language={language} onLanguageChange={setLanguage} />
        <main>
          {heroReady ? <Hero language={language} heroImages={mediaConfig.heroImages} isOpened={isOpened} /> : <HeroPlaceholder />}
          <OurStory language={language} storyImages={activeConfig.storyImages} />
          <WeddingDetails language={language} />
          <PhotoGallery language={language} concepts={weddingConfig.galleryConcepts} />
          <Gifts language={language} groomQr={activeConfig.groomGiftQrCode} brideQr={activeConfig.brideGiftQrCode} />
          <RsvpAndWishes
            language={language}
            wishes={wishes}
            onWishSubmitted={(wish) => setWishes((current) => [wish, ...(current ?? [])])}
          />
        </main>
        <Footer language={language} />
        {isOpened ? <FloatingControls language={language} isMuted={isMuted} isPlaying={isPlaying} onToggleAudio={toggleAudio} /> : null}

        <AnimatePresence>
          {!isOpened ? <InvitationCover language={language} onLanguageChange={setLanguage} ready={heroReady} onOpen={handleOpen} /> : null}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
