import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Heart, Calendar, Clock, MapPin, Quote, ChevronDown, ChevronLeft, ChevronRight, Volume2, VolumeX, Eye, EyeOff, Download } from 'lucide-react';
import { weddingConfig, type ResponsiveImageSource, type WeddingConfig } from './config';
import { ResponsiveImage, ResponsivePicture, ResponsiveGalleryImage } from './components/ResponsiveImage';
import { Language, languageLabels, localeByLanguage, translations } from './i18n';

// --- Components ---

interface LocalizedProps {
  language: Language;
}

interface NavbarProps extends LocalizedProps {
  onLanguageChange: (language: Language) => void;
}

const formatWeddingDate = (
  language: Language,
  options: Intl.DateTimeFormatOptions,
) => new Date(weddingConfig.weddingDate).toLocaleDateString(localeByLanguage[language], options);

const LanguageSwitcher = ({ language, onLanguageChange }: NavbarProps) => {
  const t = translations[language];

  return (
    <div className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-white/15 p-1 backdrop-blur-sm" aria-label={t.language.label}>
      {(['vi', 'en'] as Language[]).map((item) => {
        const isActive = item === language;

        return (
          <button
            key={item}
            type="button"
            onClick={() => onLanguageChange(item)}
            className={`h-8 min-w-10 whitespace-nowrap rounded-full px-3 font-label text-xs font-bold transition-all ${
              isActive ? 'bg-white text-primary shadow-sm' : 'text-current hover:bg-white/15'
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

const Navbar = ({ language, onLanguageChange }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = translations[language];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t.nav.story, href: '#story' },
    { name: t.nav.details, href: '#details' },
    { name: t.nav.gallery, href: '#gallery' },
    { name: t.nav.rsvp, href: '#rsvp', action: true },
    { name: t.nav.gifts, href: '#gifts' },
    { name: t.nav.wishes, href: '#wishes' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className={`text-3xl font-display ${isScrolled ? 'text-primary' : 'text-white'}`}>
          {weddingConfig.groomName} & {weddingConfig.brideName}
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex min-w-0 items-center gap-5">
          <div className="flex min-w-0 flex-nowrap items-center gap-5">
            {navLinks.map((link) => link.action ? (
              <button
                key={link.name}
                type="button"
                onClick={() => document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' })}
                className={`shrink-0 whitespace-nowrap bg-transparent p-0 font-label text-sm uppercase tracking-widest transition-colors hover:text-primary ${isScrolled ? 'text-on-surface' : 'text-white'}`}
              >
                {link.name}
              </button>
            ) : (
              <a
                key={link.name}
                href={link.href}
                className={`shrink-0 whitespace-nowrap font-label text-sm uppercase tracking-widest transition-colors hover:text-primary ${isScrolled ? 'text-on-surface' : 'text-white'}`}
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className={`shrink-0 ${isScrolled ? 'text-on-surface' : 'text-white'}`}>
            <LanguageSwitcher language={language} onLanguageChange={onLanguageChange} />
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-primary" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu className={isScrolled ? 'text-primary' : 'text-white'} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white shadow-xl py-8 flex flex-col items-center gap-6 md:hidden"
          >
            {navLinks.map((link) => link.action ? (
              <button
                key={link.name}
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="shrink-0 whitespace-nowrap bg-transparent p-0 font-label text-sm uppercase tracking-widest text-on-surface transition-colors hover:text-primary"
              >
                {link.name}
              </button>
            ) : (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="shrink-0 whitespace-nowrap font-label text-sm uppercase tracking-widest text-on-surface hover:text-primary"
              >
                {link.name}
              </a>
            ))}
            <div className="text-on-surface">
              <LanguageSwitcher language={language} onLanguageChange={onLanguageChange} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

interface AudioToggleProps {
  language: Language;
  isMuted: boolean;
  onToggle: () => void;
}

const AudioToggle = ({ language, isMuted, onToggle }: AudioToggleProps) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={isMuted ? (language === 'vi' ? 'Bật nhạc' : 'Turn music on') : language === 'vi' ? 'Tắt nhạc' : 'Turn music off'}
    aria-pressed={!isMuted}
    className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-white shadow-2xl transition-transform hover:scale-110"
  >
    {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
  </button>
);

const Hero = ({ language, isMuted, onToggle, heroImages }: LocalizedProps & Pick<AudioToggleProps, 'isMuted' | 'onToggle'> & { heroImages: WeddingConfig['heroImages'] }) => {
  const t = translations[language];

  return (
    <section className="hero-section relative w-full flex items-center justify-center text-center overflow-hidden">
      <div className="absolute inset-0 z-0 w-full h-full">
        <ResponsivePicture
          mobileSrc={heroImages.mobile}
          tabletSrc={heroImages.tablet}
          desktopSrc={heroImages.desktop}
          alt={t.hero.alt}
          className="hero-image w-full h-full"
          objectFit="cover"
          priority={true}
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 px-6 max-w-4xl"
      >
        <p className="font-label uppercase tracking-[0.3em] text-white/90 text-sm md:text-lg mb-8">
          {formatWeddingDate(language, { month: 'long', day: 'numeric', year: 'numeric' })} • {weddingConfig.locationName}
        </p>
        <p className="font-headline text-xl md:text-2xl text-white italic mb-12 max-w-2xl mx-auto leading-relaxed">
          "{t.hero.intro}"
        </p>
        <motion.a
          href="#story"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="inline-flex flex-col items-center gap-4 text-white hover:opacity-80 transition-opacity"
        >
          <span className="font-label uppercase tracking-widest text-xs">{t.hero.cta}</span>
          <ChevronDown size={32} />
        </motion.a>
      </motion.div>

      <div className="absolute bottom-8 right-8 z-20">
        <AudioToggle language={language} isMuted={isMuted} onToggle={onToggle} />
      </div>
    </section>
  );
};

const OurStory = ({ language, storyImages }: LocalizedProps & { storyImages: string[] }) => {
  const t = translations[language];
  const timeline = t.story.timeline;
  const imagePool = storyImages.length > 0 ? storyImages : [weddingConfig.storyImage];
  const resolvedStoryImages = timeline.map((_, index) => imagePool[index % imagePool.length]);

  return (
    <section id="story" className="story-section px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-20 text-center">
          <span className="font-label text-sm font-semibold uppercase tracking-[0.2em] text-primary">{t.story.eyebrow}</span>
          <h2 className="mt-4 font-headline text-4xl text-on-surface md:text-6xl">{t.story.title}</h2>
        </div>

        <div className="story-timeline">
          {timeline.map((item, index) => (
            <motion.article
              key={`${item.title}-${index}`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -36 : 36 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className={`story-step ${index % 2 === 1 ? 'story-step-reverse' : ''}`}
            >
              <div className="story-step-marker" aria-hidden="true">
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className="story-step-media">
                <ResponsiveImage
                  src={resolvedStoryImages[index]}
                  alt={`${t.story.imageAlt} - ${item.title}`}
                  className="story-step-image"
                  objectFit="cover"
                />
              </div>
              <div className="story-step-copy">
                <p className="font-label text-xs font-bold uppercase tracking-[0.18em] text-primary">{item.date}</p>
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

const WeddingDetails = ({ language }: LocalizedProps) => {
  const t = translations[language];
  const details = [
    {
      icon: <Calendar className="text-secondary" />,
      title: t.details.dateTitle,
      content: formatWeddingDate(language, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
      sub: t.details.dateSub,
    },
    {
      icon: <Clock className="text-secondary" />,
      title: t.details.timeTitle,
      content: weddingConfig.weddingTime,
      sub: t.details.timeSub,
    },
    {
      icon: <MapPin className="text-secondary" />,
      title: t.details.locationTitle,
      content: weddingConfig.locationName,
      sub: weddingConfig.locationAddress,
      href: weddingConfig.googleMapsUrl,
    },
  ];

  return (
    <section id="details" className="py-24 bg-surface-container-low px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="font-label uppercase tracking-[0.2em] text-primary text-sm font-semibold">{t.details.eyebrow}</span>
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface">{t.details.title}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {details.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-xl soft-petal-shadow text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="font-headline text-2xl mb-3">{item.title}</h3>
              <p className="text-on-surface-variant mb-1">{item.content}</p>
              <p className="font-label text-[10px] tracking-widest text-primary uppercase mt-4">{item.sub}</p>
              {'href' in item && item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex rounded-full border border-primary/20 px-5 py-2 font-label text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  {t.details.viewMap}
                </a>
              ) : null}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const RSVP_SUBMISSION_ID_KEY = 'wedding-rsvp-submission-id';

const getRsvpSubmissionId = () => {
  const existing = window.localStorage.getItem(RSVP_SUBMISSION_ID_KEY);
  if (existing) return existing;

  const submissionId = window.crypto.randomUUID();
  window.localStorage.setItem(RSVP_SUBMISSION_ID_KEY, submissionId);
  return submissionId;
};

const Rsvp = ({ language }: LocalizedProps) => {
  const t = translations[language].rsvp;
  const [name, setName] = useState('');
  const [attending, setAttending] = useState<boolean | null>(null);
  const [partySize, setPartySize] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || attending === null) return;

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: name,
          attending,
          partySize,
          submissionId: getRsvpSubmissionId(),
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.rsvp) {
        throw new Error(payload?.error ?? 'Unable to save RSVP');
      }

      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="rsvp" className="bg-surface-container-low px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="font-label text-sm font-semibold uppercase tracking-[0.2em] text-primary">{t.eyebrow}</span>
        <h2 className="mt-4 font-headline text-4xl text-on-surface md:text-5xl">{t.title}</h2>

        <form onSubmit={handleSubmit} className="mt-12 space-y-8 bg-white p-8 text-left shadow-xl sm:p-10">
          <div className="space-y-2">
            <label htmlFor="rsvp-name" className="block font-label text-xs font-bold uppercase tracking-widest text-primary">
              {t.nameLabel}
            </label>
            <input
              id="rsvp-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={120}
              required
              placeholder={t.namePlaceholder}
              className="w-full border-0 border-b border-outline-variant/30 bg-transparent px-0 py-3 focus:border-primary focus:ring-0"
            />
          </div>

          <fieldset>
            <legend className="font-label text-xs font-bold uppercase tracking-widest text-primary">{t.attendanceLabel}</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                { value: true, label: t.attending },
                { value: false, label: t.notAttending },
              ].map((option) => {
                const isSelected = attending === option.value;
                return (
                  <label
                    key={String(option.value)}
                    className={`flex min-h-12 cursor-pointer items-center justify-center border px-4 py-3 text-center font-label text-sm font-bold transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-primary/25 text-on-surface hover:border-primary hover:text-primary'
                    }`}
                  >
                    <input
                      type="radio"
                      name="attendance"
                      value={String(option.value)}
                      checked={isSelected}
                      onChange={() => setAttending(option.value)}
                      className="sr-only"
                      required={attending === null}
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {attending ? (
            <fieldset>
              <legend className="font-label text-xs font-bold uppercase tracking-widest text-primary">{t.partySizeLabel}</legend>
              <div className="mt-3 grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((size) => {
                  const isSelected = partySize === size;
                  return (
                    <label
                      key={size}
                      className={`flex min-h-12 cursor-pointer items-center justify-center border font-label text-sm font-bold transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-primary/25 text-on-surface hover:border-primary hover:text-primary'
                      }`}
                    >
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
            </fieldset>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || attending === null}
            className="w-full bg-primary py-4 font-label text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t.submitting : t.submit}
          </button>
          {status !== 'idle' ? (
            <p role="status" aria-live="polite" className={status === 'success' ? 'text-green-700' : 'text-red-700'}>
              {status === 'success' ? t.success : t.error}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
};

const PhotoGallery = ({ language, images }: LocalizedProps & { images: string[] }) => {
  const t = translations[language];
  const galleryImages = images.slice(0, 6);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  useEffect(() => {
    if (selectedImage === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedImage(null);
      if (event.key === 'ArrowLeft') setSelectedImage((index) => index === null ? null : (index - 1 + galleryImages.length) % galleryImages.length);
      if (event.key === 'ArrowRight') setSelectedImage((index) => index === null ? null : (index + 1) % galleryImages.length);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [galleryImages.length, selectedImage]);

  if (galleryImages.length === 0) return null;

  const selectPreviousImage = () => setSelectedImage((index) => index === null ? null : (index - 1 + galleryImages.length) % galleryImages.length);
  const selectNextImage = () => setSelectedImage((index) => index === null ? null : (index + 1) % galleryImages.length);

  return (
    <section id="gallery" className="gallery-section px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <span className="font-label uppercase tracking-[0.2em] text-primary text-sm font-semibold">{t.gallery.eyebrow}</span>
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface">{t.gallery.title}</h2>
        </div>

        <div className="gallery-featured-grid mx-auto max-w-3xl">
          {galleryImages.slice(0, 2).map((src, index) => (
            <GalleryPhoto
              key={src}
              src={src}
              index={index}
              alt={`${t.gallery.altPrefix} ${index + 1}`}
              onSelect={() => setSelectedImage(index)}
              featured
              openLabel={t.gallery.open}
            />
          ))}
        </div>

        {galleryImages.length > 2 ? (
          <div className="gallery-clothesline mt-14 pt-12">
            <div className="gallery-hanging-grid">
              {galleryImages.slice(2).map((src, index) => (
                <GalleryPhoto
                  key={src}
                  src={src}
                  index={index + 2}
                  alt={`${t.gallery.altPrefix} ${index + 3}`}
                  onSelect={() => setSelectedImage(index + 2)}
                  openLabel={t.gallery.open}
                />
              ))}
            </div>
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
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              className="relative flex h-full w-full max-w-6xl items-center justify-center"
            >
              <ResponsiveGalleryImage
                src={galleryImages[selectedImage]}
                alt={`${t.gallery.altPrefix} ${selectedImage + 1}`}
                containerClassName="gallery-lightbox-image"
                className="max-h-[82svh] w-auto max-w-full object-contain shadow-2xl"
              />
              <button type="button" onClick={() => setSelectedImage(null)} aria-label={t.gallery.close} className="gallery-lightbox-close">
                <X aria-hidden="true" size={24} />
              </button>
              <button type="button" onClick={selectPreviousImage} aria-label={t.gallery.previous} className="gallery-lightbox-arrow gallery-lightbox-previous">
                <ChevronLeft aria-hidden="true" size={30} />
              </button>
              <button type="button" onClick={selectNextImage} aria-label={t.gallery.next} className="gallery-lightbox-arrow gallery-lightbox-next">
                <ChevronRight aria-hidden="true" size={30} />
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
};

interface GalleryPhotoProps {
  src: string;
  index: number;
  alt: string;
  onSelect: () => void;
  featured?: boolean;
  openLabel: string;
}

const GalleryPhoto = ({ src, index, alt, onSelect, featured = false, openLabel }: GalleryPhotoProps) => {
  const rotations = [-2.2, 1.8, -1.5, 2.4, -2.6, 1.4];
  const rotation = rotations[index % rotations.length];

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 28, rotate: rotation }}
      whileInView={{ opacity: 1, y: 0, rotate: rotation }}
      whileHover={{ scale: 1.035, rotate: rotation / 2 }}
      animate={{ y: [0, -8, 0], rotate: [rotation, rotation + 1, rotation] }}
      transition={{
        opacity: { duration: 0.45, delay: index * 0.08 },
        y: { duration: 3.2 + index * 0.14, repeat: Infinity, ease: 'easeInOut', delay: index * 0.25 },
        rotate: { duration: 3.2 + index * 0.14, repeat: Infinity, ease: 'easeInOut', delay: index * 0.25 },
      }}
      viewport={{ once: true, amount: 0.2 }}
      onClick={onSelect}
      aria-label={`${openLabel} ${alt}`}
      className={`gallery-polaroid group relative block w-full cursor-zoom-in bg-white p-2 pb-10 text-left shadow-lg transition-shadow hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${featured ? 'gallery-polaroid-featured' : 'gallery-polaroid-hanging'}`}
    >
      {!featured ? <span aria-hidden="true" className="gallery-photo-pin" /> : null}
      <ResponsiveGalleryImage
        src={src}
        alt={alt}
        containerClassName="gallery-photo"
        className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
      />
      <span aria-hidden="true" className="absolute bottom-2 right-3 font-label text-sm font-semibold text-primary/80">{String(index + 1).padStart(2, '0')}</span>
    </motion.button>
  );
};

const Gifts = ({ language }: LocalizedProps) => {
  const t = translations[language];
  const [isQrVisible, setIsQrVisible] = useState(false);

  const downloadQr = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Unable to download QR code');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section id="gifts" className="py-24 bg-[#f7ece1] px-6">
      <div className="max-w-6xl mx-auto text-center space-y-12">
        <div className="space-y-4">
          <span className="font-label uppercase tracking-[0.2em] text-primary text-sm font-semibold">{t.gifts.eyebrow}</span>
          <h2 className="font-headline text-4xl text-on-surface">{t.gifts.title}</h2>
          <p className="font-body text-on-surface-variant leading-relaxed text-lg">
            {t.gifts.body}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsQrVisible((visible) => !visible)}
          aria-controls="gift-qr-region"
          aria-expanded={isQrVisible}
          title={isQrVisible ? t.gifts.hideQr : t.gifts.showQr}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 px-5 py-2 font-label text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-white"
        >
          {isQrVisible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          {isQrVisible ? t.gifts.hideQr : t.gifts.showQr}
        </button>

        {isQrVisible ? (
          <div id="gift-qr-region" className="grid sm:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-primary/10">
              <h3 className="font-headline text-2xl text-secondary mb-4">{t.gifts.groomTitle}</h3>
              <ResponsiveImage
                src={weddingConfig.groomGiftQrCode}
                alt={t.gifts.groomAlt}
                className="mx-auto h-36 w-36 rounded-lg border border-primary/20 object-contain sm:h-40 sm:w-40 md:h-44 md:w-44"
                objectFit="contain"
              />
              <p className="mt-4 text-sm text-on-surface-variant">{t.gifts.groomNote} {weddingConfig.groomName}.</p>
              <button
                type="button"
                onClick={() => downloadQr(weddingConfig.groomGiftQrCode, 'qr-chu-re.jpg')}
                className="mx-auto mt-5 inline-flex items-center gap-2 border border-primary/30 px-4 py-2 font-label text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-white"
              >
                <Download size={14} aria-hidden="true" />
                {t.gifts.downloadQr}
              </button>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl border border-primary/10">
              <h3 className="font-headline text-2xl text-secondary mb-4">{t.gifts.brideTitle}</h3>
              <ResponsiveImage
                src={weddingConfig.brideGiftQrCode}
                alt={t.gifts.brideAlt}
                className="mx-auto h-36 w-36 rounded-lg border border-primary/20 object-contain sm:h-40 sm:w-40 md:h-44 md:w-44"
                objectFit="contain"
              />
              <p className="mt-4 text-sm text-on-surface-variant">{t.gifts.brideNote} {weddingConfig.brideName}.</p>
              <button
                type="button"
                onClick={() => downloadQr(weddingConfig.brideGiftQrCode, 'qr-co-dau.jpg')}
                className="mx-auto mt-5 inline-flex items-center gap-2 border border-primary/30 px-4 py-2 font-label text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-white"
              >
                <Download size={14} aria-hidden="true" />
                {t.gifts.downloadQr}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

interface Wish {
  id?: string;
  name: string;
  message: string;
  createdAt?: string;
}

interface GuestbookProps extends LocalizedProps {
  wishes?: Wish[];
  onWishSubmitted: (wish: Wish) => void;
}

const Guestbook = ({ language, wishes, onWishSubmitted }: GuestbookProps) => {
  const t = translations[language];
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const displayedWishes = wishes ?? t.guestbook.wishes;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.wish) {
        throw new Error(payload?.error ?? 'Unable to send wish');
      }

      onWishSubmitted(payload.wish);
      setName('');
      setMessage('');
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="wishes" className="py-24 px-6 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20">
          <div className="space-y-10">
            <div className="space-y-4">
              <span className="font-label uppercase tracking-[0.2em] text-primary text-sm font-semibold">{t.guestbook.eyebrow}</span>
              <p className="text-on-surface-variant italic">{t.guestbook.intro}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-surface-container-low p-10 rounded-xl soft-petal-shadow">
              <div className="space-y-2">
                <label className="block font-label text-xs uppercase tracking-widest text-primary font-bold">{t.guestbook.nameLabel}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={120}
                  required
                  placeholder={t.guestbook.namePlaceholder}
                  className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary px-0 py-3 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-label text-xs uppercase tracking-widest text-primary font-bold">{t.guestbook.messageLabel}</label>
                <textarea
                  placeholder={t.guestbook.messagePlaceholder}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={1000}
                  required
                  rows={4}
                  className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary px-0 py-3 transition-all"
                ></textarea>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full gold-foil py-4 rounded-xl text-white font-label uppercase tracking-widest font-bold shadow-lg hover:scale-[1.02] transition-transform disabled:cursor-wait disabled:opacity-70">
                {isSubmitting ? t.guestbook.sending : t.guestbook.submit}
              </button>
              {status !== 'idle' && (
                <p role="status" aria-live="polite" className={status === 'success' ? 'text-green-700' : 'text-red-700'}>
                  {status === 'success' ? t.guestbook.success : t.guestbook.error}
                </p>
              )}
            </form>
          </div>

          <div className="space-y-8">
            <h3 className="font-headline text-2xl text-on-surface mb-8">{t.guestbook.recent}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {displayedWishes.map((wish, index) => (
                <motion.div
                  key={wish.id ?? `${wish.name}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-8 rounded-xl soft-petal-shadow border border-primary/5 italic relative overflow-hidden group"
                >
                  <Quote className="absolute top-4 right-4 text-secondary/10 group-hover:text-secondary/20 transition-colors" size={48} />
                  <p className="text-on-surface-variant mb-6 relative z-10 leading-relaxed">"{wish.message}"</p>
                  <p className="font-headline text-primary not-italic">— {wish.name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ language }: LocalizedProps) => {
  const t = translations[language];

  return (
    <footer className="py-16 bg-surface-container-low text-center space-y-8">
      <div className="font-display text-4xl text-primary">{weddingConfig.groomName} & {weddingConfig.brideName}</div>
      <div className="flex justify-center gap-12">
        <a href="#" className="font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">{t.footer.privacy}</a>
        <a href="#" className="font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">{t.footer.contact}</a>
      </div>
      <div className="font-label text-xs uppercase tracking-[0.2em] text-primary/60">
        {weddingConfig.groomName} & {weddingConfig.brideName} • {formatWeddingDate(language, { month: 'long', day: 'numeric', year: 'numeric' })}
      </div>
    </footer>
  );
};

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
          // Keep the Blob source instead of falling back to the local config.
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

const HeroPlaceholder = () => (
  <section className="hero-section hero-placeholder" aria-hidden="true" />
);

export default function App() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [activeConfig, setActiveConfig] = useState(weddingConfig);
  const [wishes, setWishes] = useState<Wish[] | undefined>();
  const [heroReady, setHeroReady] = useState(false);
  const [isMuted, setIsMuted] = useState(() => window.localStorage.getItem('wedding-audio-muted') === 'true');
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = window.localStorage.getItem('wedding-language');
    return savedLanguage === 'en' || savedLanguage === 'vi' ? savedLanguage : 'vi';
  });

  useEffect(() => {
    window.localStorage.setItem('wedding-language', language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/wedding-content', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then(async (payload) => {
        const nextConfig = payload?.config
          ? { ...weddingConfig, ...payload.config }
          : weddingConfig;

        // Apply the API config before preloading. The preloader only prevents a
        // visual flash; it must never decide whether Blob or local media wins.
        if (!cancelled) {
          setActiveConfig(nextConfig);
        }

        try {
          await preloadImage(currentHeroSource(nextConfig));
        } catch {
          // The <picture> element still owns the source fallback chain. Keep the
          // resolved API config so a transient preload failure cannot switch the
          // page back to local assets.
        }

        if (!cancelled) {
          setHeroReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setHeroReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/wishes', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!cancelled && Array.isArray(payload?.wishes)) {
          setWishes(payload.wishes);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem('wedding-audio-muted', String(isMuted));
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const startAudio = () => {
      if (!isMuted) audioRef.current?.play().catch(() => undefined);
    };
    window.addEventListener('pointerdown', startAudio, { once: true });
    return () => window.removeEventListener('pointerdown', startAudio);
  }, [isMuted]);

  const toggleAudio = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) audioRef.current?.play().catch(() => undefined);
  };

  return (
    <div className="min-h-screen">
      <audio ref={audioRef} src={activeConfig.audioUrl} loop preload="metadata" />
      <Navbar language={language} onLanguageChange={setLanguage} />
      {heroReady ? (
        <Hero language={language} isMuted={isMuted} onToggle={toggleAudio} heroImages={activeConfig.heroImages} />
      ) : (
        <HeroPlaceholder />
      )}
      <OurStory language={language} storyImages={activeConfig.storyImages} />
      <WeddingDetails language={language} />
      <Rsvp language={language} />
      <PhotoGallery language={language} images={activeConfig.galleryImages} />
      <Gifts language={language} />
      <Guestbook
        language={language}
        wishes={wishes}
        onWishSubmitted={(wish) => setWishes((current) => [wish, ...(current ?? [])])}
      />
      <Footer language={language} />
    </div>
  );
}
