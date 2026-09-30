import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Heart, Calendar, Clock, MapPin, Quote, ChevronDown } from 'lucide-react';
import { weddingConfig } from './config';
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
    <div className="flex items-center gap-1 rounded-full bg-white/15 p-1 backdrop-blur-sm" aria-label={t.language.label}>
      {(['vi', 'en'] as Language[]).map((item) => {
        const isActive = item === language;

        return (
          <button
            key={item}
            type="button"
            onClick={() => onLanguageChange(item)}
            className={`h-8 min-w-10 rounded-full px-3 font-label text-xs font-bold transition-all ${
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
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`font-label text-sm uppercase tracking-widest transition-colors hover:text-primary ${isScrolled ? 'text-on-surface' : 'text-white'}`}
            >
              {link.name}
            </a>
          ))}
          <div className={isScrolled ? 'text-on-surface' : 'text-white'}>
            <LanguageSwitcher language={language} onLanguageChange={onLanguageChange} />
          </div>
          <button className="gold-foil px-8 py-2 rounded-xl text-white font-headline italic hover:scale-105 transition-transform shadow-md">
            {t.nav.rsvp}
          </button>
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
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-label text-sm uppercase tracking-widest text-on-surface hover:text-primary"
              >
                {link.name}
              </a>
            ))}
            <div className="text-on-surface">
              <LanguageSwitcher language={language} onLanguageChange={onLanguageChange} />
            </div>
            <button className="gold-foil px-10 py-3 rounded-xl text-white font-headline italic">
              {t.nav.rsvp}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ language }: LocalizedProps) => {
  const t = translations[language];

  return (
    <section className="hero-section relative w-full flex items-center justify-center text-center overflow-hidden">
      <div className="absolute inset-0 z-0 w-full h-full">
        <ResponsivePicture
          mobileSrc={weddingConfig.heroImages.mobile}
          tabletSrc={weddingConfig.heroImages.tablet}
          desktopSrc={weddingConfig.heroImages.desktop}
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
        <h1 className="font-display text-7xl md:text-9xl text-white mb-6 drop-shadow-2xl">
          {weddingConfig.groomName} & {weddingConfig.brideName}
        </h1>
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
        <button className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform text-white">
          <Heart fill="currentColor" size={24} />
        </button>
      </div>
    </section>
  );
};

const OurStory = ({ language }: LocalizedProps) => {
  const t = translations[language];
  const timeline = t.story.timeline;

  return (
    <section id="story" className="py-24 md:py-32 px-6 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -top-6 -left-6 w-full h-full border border-primary/20 rounded-xl"></div>
            <ResponsiveImage
              src={weddingConfig.storyImage}
              alt={t.story.imageAlt}
              className="relative z-10 w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[700px] asymmetric-img shadow-2xl"
              objectFit="cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="space-y-4">
              <span className="font-label uppercase tracking-[0.2em] text-primary text-sm font-semibold">{t.story.eyebrow}</span>
              <h2 className="font-headline text-4xl md:text-6xl text-on-surface">{t.story.title}</h2>
            </div>
            <p className="font-body text-lg text-on-surface-variant leading-relaxed italic">
              {t.story.body}
            </p>

            <div className="space-y-10 relative before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-[1px] before:bg-outline-variant/30">
              {timeline.map((item, index) => (
                <div key={index} className="relative pl-10">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary-container flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <h4 className="font-headline text-xl text-on-surface">{item.title}</h4>
                  <p className="font-label text-xs text-primary mb-2 tracking-widest">{item.date}</p>
                  <p className="text-on-surface-variant leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
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

const PhotoGallery = ({ language }: LocalizedProps) => {
  const images = weddingConfig.galleryImages;
  const t = translations[language];

  return (
    <section id="gallery" className="py-24 px-6 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="font-label uppercase tracking-[0.2em] text-primary text-sm font-semibold">{t.gallery.eyebrow}</span>
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface">{t.gallery.title}</h2>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((src, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`relative group overflow-hidden ${index % 2 === 0 ? 'rounded-xl' : 'asymmetric-img'}`}
            >
              <ResponsiveGalleryImage
                src={src}
                alt={`${t.gallery.altPrefix} ${index + 1}`}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Heart className="text-white" size={32} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Gifts = ({ language }: LocalizedProps) => {
  const t = translations[language];

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

        <div className="grid sm:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-primary/10">
            <h3 className="font-headline text-2xl text-secondary mb-4">{t.gifts.groomTitle}</h3>
            <ResponsiveImage
              src={weddingConfig.groomGiftQrCode}
              alt={t.gifts.groomAlt}
              className="mx-auto w-48 sm:w-56 md:w-64 h-48 sm:h-56 md:h-64 object-contain rounded-lg border border-primary/20"
              objectFit="contain"
            />
            <p className="mt-4 text-sm text-on-surface-variant">{t.gifts.groomNote} {weddingConfig.groomName}.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl border border-primary/10">
            <h3 className="font-headline text-2xl text-secondary mb-4">{t.gifts.brideTitle}</h3>
            <ResponsiveImage
              src={weddingConfig.brideGiftQrCode}
              alt={t.gifts.brideAlt}
              className="mx-auto w-48 sm:w-56 md:w-64 h-48 sm:h-56 md:h-64 object-contain rounded-lg border border-primary/20"
              objectFit="contain"
            />
            <p className="mt-4 text-sm text-on-surface-variant">{t.gifts.brideNote} {weddingConfig.brideName}.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Guestbook = ({ language }: LocalizedProps) => {
  const t = translations[language];
  const wishes = t.guestbook.wishes;

  return (
    <section id="wishes" className="py-24 px-6 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20">
          <div className="space-y-10">
            <div className="space-y-4">
              <span className="font-label uppercase tracking-[0.2em] text-primary text-sm font-semibold">{t.guestbook.eyebrow}</span>
              <h2 className="font-headline text-4xl text-on-surface">{t.guestbook.title}</h2>
              <p className="text-on-surface-variant italic">{t.guestbook.intro}</p>
            </div>

            <form className="space-y-8 bg-surface-container-low p-10 rounded-xl soft-petal-shadow">
              <div className="space-y-2">
                <label className="block font-label text-xs uppercase tracking-widest text-primary font-bold">{t.guestbook.nameLabel}</label>
                <input
                  type="text"
                  placeholder={t.guestbook.namePlaceholder}
                  className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary px-0 py-3 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-label text-xs uppercase tracking-widest text-primary font-bold">{t.guestbook.messageLabel}</label>
                <textarea
                  placeholder={t.guestbook.messagePlaceholder}
                  rows={4}
                  className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary px-0 py-3 transition-all"
                ></textarea>
              </div>
              <button className="w-full gold-foil py-4 rounded-xl text-white font-label uppercase tracking-widest font-bold shadow-lg hover:scale-[1.02] transition-transform">
                {t.guestbook.submit}
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <h3 className="font-headline text-2xl text-on-surface mb-8">{t.guestbook.recent}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {wishes.map((wish, index) => (
                <motion.div
                  key={index}
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

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = window.localStorage.getItem('wedding-language');
    return savedLanguage === 'en' || savedLanguage === 'vi' ? savedLanguage : 'vi';
  });

  useEffect(() => {
    window.localStorage.setItem('wedding-language', language);
    document.documentElement.lang = language;
  }, [language]);

  return (
    <div className="min-h-screen">
      <Navbar language={language} onLanguageChange={setLanguage} />
      <Hero language={language} />
      <OurStory language={language} />
      <WeddingDetails language={language} />
      <PhotoGallery language={language} />
      <Gifts language={language} />
      <Guestbook language={language} />
      <Footer language={language} />
    </div>
  );
}
