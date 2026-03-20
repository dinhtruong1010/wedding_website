import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Heart, Calendar, Clock, MapPin, Utensils, Send, Quote, ChevronDown } from 'lucide-react';
import { weddingConfig } from './config';

// --- Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Our Story', href: '#story' },
    { name: 'Wedding Details', href: '#details' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Gifts', href: '#gifts' },
    { name: 'Wishes', href: '#wishes' },
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
          <button className="gold-foil px-8 py-2 rounded-xl text-white font-headline italic hover:scale-105 transition-transform shadow-md">
            RSVP
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
            <button className="gold-foil px-10 py-3 rounded-xl text-white font-headline italic">
              RSVP
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative h-screen w-full flex items-center justify-center text-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src={weddingConfig.heroImage}
          alt={`${weddingConfig.groomName} and ${weddingConfig.brideName}`}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
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
          {new Date(weddingConfig.weddingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • {weddingConfig.locationName}
        </p>
        <p className="font-headline text-xl md:text-2xl text-white italic mb-12 max-w-2xl mx-auto leading-relaxed">
          "We are getting married and would love to celebrate with you."
        </p>
        <motion.a
          href="#story"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="inline-flex flex-col items-center gap-4 text-white hover:opacity-80 transition-opacity"
        >
          <span className="font-label uppercase tracking-widest text-xs">View Our Story</span>
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

const OurStory = () => {
  const timeline = [
    {
      title: 'The First Meeting',
      date: 'MAY 2021',
      description: 'A chance encounter at City Lights Bookstore that lasted until closing time.',
    },
    {
      title: 'The First Trip',
      date: 'AUGUST 2022',
      description: 'Road tripping through the Pacific Northwest with nothing but a paper map and a sense of wonder.',
    },
    {
      title: 'The Proposal',
      date: 'DECEMBER 2023',
      description: 'Under the twinkling lights of Union Square, Julian asked the question that changed everything.',
    },
  ];

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
            <img
              src={weddingConfig.storyImage}
              alt="Our Story"
              className="relative z-10 w-full h-[500px] md:h-[700px] object-cover asymmetric-img shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="space-y-4">
              <span className="font-label uppercase tracking-[0.2em] text-primary text-sm font-semibold">A Journey of Love</span>
              <h2 className="font-headline text-4xl md:text-6xl text-on-surface">Our Story</h2>
            </div>
            <p className="font-body text-lg text-on-surface-variant leading-relaxed italic">
              {weddingConfig.story}
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

const WeddingDetails = () => {
  const details = [
    {
      icon: <Calendar className="text-secondary" />,
      title: 'The Date',
      content: new Date(weddingConfig.weddingDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
      sub: 'SAVE THE DATE',
    },
    {
      icon: <Clock className="text-secondary" />,
      title: 'The Time',
      content: `Ceremony: ${weddingConfig.weddingTime}`,
      sub: 'Reception to follow',
    },
    {
      icon: <MapPin className="text-secondary" />,
      title: 'Location',
      content: weddingConfig.locationName,
      sub: weddingConfig.locationAddress,
    },
    {
      icon: <Utensils className="text-secondary" />,
      title: 'Reception',
      content: 'Dinner & Dancing',
      sub: 'At the same venue',
    },
  ];

  return (
    <section id="details" className="py-24 bg-surface-container-low px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="font-label uppercase tracking-[0.2em] text-primary text-sm font-semibold">The Celebration</span>
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface">Wedding Details</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PhotoGallery = () => {
  const images = weddingConfig.galleryImages;

  return (
    <section id="gallery" className="py-24 px-6 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="font-label uppercase tracking-[0.2em] text-primary text-sm font-semibold">Memories Captured</span>
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface">Photo Gallery</h2>
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
              <img
                src={src}
                alt={`Gallery ${index}`}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
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

const Gifts = () => {
  return (
    <section id="gifts" className="py-24 bg-[#f7ece1] px-6">
      <div className="max-w-6xl mx-auto text-center space-y-12">
        <div className="space-y-4">
          <span className="font-label uppercase tracking-[0.2em] text-primary text-sm font-semibold">Registry</span>
          <h2 className="font-headline text-4xl text-on-surface">A Note on Gifts</h2>
          <p className="font-body text-on-surface-variant leading-relaxed text-lg">
            Your presence at our wedding is the greatest gift of all. If you wish to contribute, scan one of the QR codes below for the groom or bride.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-primary/10">
            <h3 className="font-headline text-2xl text-secondary mb-4">Groom Gift QR</h3>
            <img
              src={weddingConfig.groomGiftQrCode}
              alt="Groom gift QR code"
              className="mx-auto w-64 h-64 object-contain rounded-lg border border-primary/20"
              referrerPolicy="no-referrer"
            />
            <p className="mt-4 text-sm text-on-surface-variant">Scan to send a gift to {weddingConfig.groomName}.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl border border-primary/10">
            <h3 className="font-headline text-2xl text-secondary mb-4">Bride Gift QR</h3>
            <img
              src={weddingConfig.brideGiftQrCode}
              alt="Bride gift QR code"
              className="mx-auto w-64 h-64 object-contain rounded-lg border border-primary/20"
              referrerPolicy="no-referrer"
            />
            <p className="mt-4 text-sm text-on-surface-variant">Scan to send a gift to {weddingConfig.brideName}.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Guestbook = () => {
  const wishes = [
    { name: 'Sarah & Mark', message: "Wishing you both a lifetime of happiness and love. Can't wait to celebrate!" },
    { name: 'Aunt Clara', message: "The most beautiful couple. May your journey be filled with joy." },
    { name: 'Leo', message: "Cheers to the new beginning! See you at the dance floor." },
    { name: 'The Smiths', message: "Love is patient, love is kind. So happy for both of you!" },
  ];

  return (
    <section id="wishes" className="py-24 px-6 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20">
          <div className="space-y-10">
            <div className="space-y-4">
              <span className="font-label uppercase tracking-[0.2em] text-primary text-sm font-semibold">Guestbook</span>
              <h2 className="font-headline text-4xl text-on-surface">Leave a Wish</h2>
              <p className="text-on-surface-variant italic">Share your thoughts and blessings with the happy couple.</p>
            </div>

            <form className="space-y-8 bg-surface-container-low p-10 rounded-xl soft-petal-shadow">
              <div className="space-y-2">
                <label className="block font-label text-xs uppercase tracking-widest text-primary font-bold">Your Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary px-0 py-3 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-label text-xs uppercase tracking-widest text-primary font-bold">Your Message</label>
                <textarea
                  placeholder="Write something beautiful..."
                  rows={4}
                  className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary px-0 py-3 transition-all"
                ></textarea>
              </div>
              <button className="w-full gold-foil py-4 rounded-xl text-white font-label uppercase tracking-widest font-bold shadow-lg hover:scale-[1.02] transition-transform">
                Send Wish
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <h3 className="font-headline text-2xl text-on-surface mb-8">Recent Wishes</h3>
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

const Footer = () => {
  return (
    <footer className="py-16 bg-surface-container-low text-center space-y-8">
      <div className="font-display text-4xl text-primary">{weddingConfig.groomName} & {weddingConfig.brideName}</div>
      <div className="flex justify-center gap-12">
        <a href="#" className="font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</a>
        <a href="#" className="font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Contact Us</a>
      </div>
      <div className="font-label text-xs uppercase tracking-[0.2em] text-primary/60">
        {weddingConfig.groomName} & {weddingConfig.brideName} • {new Date(weddingConfig.weddingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <OurStory />
      <WeddingDetails />
      <PhotoGallery />
      <Gifts />
      <Guestbook />
      <Footer />
    </div>
  );
}
