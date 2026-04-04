import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Menu, X, ChevronRight,
  Instagram, Facebook, ArrowRight, Sparkles, MapPin
} from 'lucide-react';
import { getAdminConfig } from './Admin';

// ─── SVG LOGOS inline ─────────────────────────────────────────────────────────
// Logo claro (para fondo oscuro / hero / footer)
const LogoLight = ({ className = 'h-10 w-auto' }) => (
  <img src="/logo-light.svg" alt="GLAM Cosmetic" className={className} />
);
// Logo oscuro (para navbar scrolleada / fondo blanco)
const LogoDark = ({ className = 'h-10 w-auto' }) => (
  <img src="/logo-dark.svg" alt="GLAM Cosmetic" className={className} />
);
// Logo blanco sólido (admin / fondo muy oscuro)
const LogoWhite = ({ className = 'h-10 w-auto' }) => (
  <img src="/logo-white.svg" alt="GLAM Cosmetic" className={className} />
);

const BRANDS = [
  'MAYBELLINE','L\'ORÉAL','NYX','MAC','REVLON','ESSENCE',
  'CATRICE','RIMMEL','MILANI','E.L.F.','RUBY ROSE','MORPHE',
  'VULT','RUBY KISSES','SLEEK','MUA'
];

const NAV_LINKS = [
  { label: 'Inicio',    path: '/' },
  { label: 'Productos', path: '/products' },
  { label: 'Nosotros',  path: '#nosotros' },
];

// ─── SCROLL ANIMATION HOOK ────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
}

// ─── SECTION WRAPPER ──────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Index({ cartCount = 0, onOpenCart }) {
  const navigate    = useNavigate();
  const reelsRef    = useRef(null);
  const ctaSectionRef = useRef(null);
  const lastScrollY = useRef(0);
  const isDragging  = useRef(false);
  const dragStartX  = useRef(0);
  const dragScrollL = useRef(0);

  const [scrolled,        setScrolled]        = useState(false);
  const [menuOpen,        setMenuOpen]        = useState(false);
  const [heroSlide,       setHeroSlide]       = useState(0);
  const [heroTransition,  setHeroTransition]  = useState(true);
  const [activeEditorial, setActiveEditorial] = useState(null); // null = no hover
  const [ctaParallax,     setCtaParallax]     = useState(0);

  const cfg = getAdminConfig();
  const { hero, cta, categories, editorial, general } = cfg;
  const editorialTitle   = cfg.editorialTitle   || 'Glam your world';
  const editorialEyebrow = cfg.editorialEyebrow || 'Editorial';

  const visibleCats  = (categories || []).filter(c => c.visible);
  const heroSlides   = hero?.slides || [];
  const overlayAlpha = (hero?.overlayOpacity || 50) / 100;

  // ── Scroll ────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const sy = window.scrollY;
      setScrolled(sy > 60);
      // Parallax en CTA
      if (ctaSectionRef.current) {
        const rect = ctaSectionRef.current.getBoundingClientRect();
        const progress = -rect.top / window.innerHeight;
        setCtaParallax(progress * 80);
      }
      lastScrollY.current = sy;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Hero slideshow ─────────────────────────────────────────
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = hero?.slideInterval || 5000;
    const t = setInterval(() => {
      setHeroTransition(false);
      setTimeout(() => { setHeroSlide(s => (s + 1) % heroSlides.length); setHeroTransition(true); }, 50);
    }, interval);
    return () => clearInterval(t);
  }, [heroSlides.length, hero?.slideInterval]);

  const goTo = useCallback((path) => {
    setMenuOpen(false);
    if (path.startsWith('#')) {
      document.querySelector(path)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(path);
    }
  }, [navigate]);

  // ── Carrito con efecto de rebote ───────────────────────────
  const handleOpenCart = useCallback(() => {
    onOpenCart();
  }, [onOpenCart]);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes marquee   { from { transform: translateX(0); }    to { transform: translateX(-50%); } }
        @keyframes fadeSlide { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulseDot  { 0%,100%{transform:scale(1);opacity:.7} 50%{transform:scale(1.3);opacity:1} }
        @keyframes slideInRight { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
        @keyframes bounceIn  { 0%{transform:scale(.8);opacity:0} 60%{transform:scale(1.05)} 80%{transform:scale(.97)} 100%{transform:scale(1);opacity:1} }
        .hide-scroll  { -ms-overflow-style:none; scrollbar-width:none; }
        .hide-scroll::-webkit-scrollbar { display:none; }
        .hero-img     { transition: opacity 1.2s cubic-bezier(.4,0,.2,1); }
        .glam-title   { font-family: 'Playfair Display', serif; }
        .cart-panel   { animation: slideInRight .35s cubic-bezier(.4,0,.2,1); }
        .cart-bounce  { animation: bounceIn .4s cubic-bezier(.34,1.56,.64,1); }
        .editorial-img { transition: transform .6s cubic-bezier(.4,0,.2,1), box-shadow .4s ease; }
        .editorial-img:hover { transform: scale(1.02); box-shadow: 0 20px 60px rgba(210,0,110,.18); }
      `}</style>

      {/* ══ NAVBAR ══════════════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${scrolled ? 'bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-16 flex items-center justify-between">

          {/* Logo — cambia según scroll */}
          <button onClick={() => goTo('/')} className="flex-shrink-0">
            {scrolled
              ? <LogoDark  className="h-9 w-auto" />
              : <LogoLight className="h-9 w-auto" />
            }
          </button>

          {/* Nav desktop */}
          <div className={`hidden md:flex gap-8 text-xs font-semibold tracking-[0.2em] uppercase transition-colors
            ${scrolled ? 'text-gray-700' : 'text-white/85'}`}>
            {NAV_LINKS.map(l => (
              <button key={l.label}
                onClick={() => goTo(l.path)}
                className="hover:text-[#D2006E] transition-colors">
                {l.label}
              </button>
            ))}
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-4">
            <button onClick={handleOpenCart}
              className={`relative transition-colors hover:text-[#D2006E] ${scrolled ? 'text-gray-700' : 'text-white'}`}>
              <ShoppingCart size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#D2006E] text-white text-[9px] font-bold rounded-full flex items-center justify-center cart-bounce">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setMenuOpen(true)}
              className={`md:hidden transition-colors ${scrolled ? 'text-gray-700' : 'text-white'}`}>
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* ══ MOBILE MENU ══════════════════════════════════════════ */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="relative ml-auto w-72 bg-[#0C0210] h-full flex flex-col px-8 py-10"
            style={{ animation: 'slideInRight .3s ease' }}>
            <button onClick={() => setMenuOpen(false)} className="self-end text-white/40 hover:text-white mb-10"><X size={22} /></button>
            <div className="mb-8">
              <LogoLight className="h-12 w-auto" />
            </div>
            <nav className="space-y-6">
              {NAV_LINKS.map(l => (
                <button key={l.label} onClick={() => goTo(l.path)}
                  className="block text-sm font-semibold tracking-[0.2em] uppercase text-white/70 hover:text-[#D2006E] transition-colors text-left">
                  {l.label}
                </button>
              ))}
            </nav>
            <div className="mt-auto flex gap-4">
              <a href={general?.instagramUrl || '#'} className="text-white/30 hover:text-[#D2006E] transition-colors"><Instagram size={18} /></a>
              <a href={general?.facebookUrl  || '#'} className="text-white/30 hover:text-[#D2006E] transition-colors"><Facebook  size={18} /></a>
            </div>
          </div>
        </div>
      )}

      {/* ══ HERO SLIDESHOW ═══════════════════════════════════════ */}
      <section className="relative flex items-center justify-center overflow-hidden bg-[#0C0210]"
        style={{ height: '100dvh', minHeight: 600 }}>

        {heroSlides.map((slide, i) => (
          <div key={slide.id || i} className="hero-img absolute inset-0"
            style={{ opacity: i === heroSlide && heroTransition ? 1 : 0, zIndex: i === heroSlide ? 1 : 0 }}>
            <img src={slide.src} alt="" className="w-full h-full object-cover object-center" />
          </div>
        ))}

        <div className="absolute inset-0 z-10" style={{ background: `rgba(12,2,16,${overlayAlpha})` }} />
        <div className="absolute inset-x-0 bottom-0 h-48 z-10 bg-gradient-to-t from-[#0C0210] to-transparent" />

        <div className="relative z-20 text-center px-6 max-w-3xl mx-auto">
          <p className="text-[#D2006E] text-[10px] tracking-[0.5em] uppercase mb-5 font-semibold"
            style={{ animation: 'fadeSlide .9s ease both' }}>
            {hero?.tagline || 'Beauty · Power'}
          </p>
          {/* Logo en el hero */}
          <div className="flex justify-center mb-6" style={{ animation: 'fadeSlide .9s ease .2s both' }}>
            <LogoLight className="h-20 md:h-28 w-auto" />
          </div>
          <p className="text-white/50 text-sm md:text-base mt-2 mb-10 leading-relaxed font-light"
            style={{ animation: 'fadeSlide .9s ease .4s both' }}>
            {hero?.subtitle || 'Tu glamour, sin límites'}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap"
            style={{ animation: 'fadeSlide .9s ease .55s both' }}>
            <button onClick={() => goTo('/products')}
              className="bg-[#D2006E] text-white text-xs font-bold tracking-[0.25em] uppercase px-10 py-4 rounded-full hover:bg-[#E5108A] transition-all duration-300 shadow-lg shadow-[#D2006E]/30 hover:shadow-xl hover:-translate-y-0.5">
              Explorar tienda
            </button>
            <button onClick={() => goTo('#nosotros')}
              className="border border-white/25 text-white/75 text-xs font-semibold tracking-[0.2em] uppercase px-8 py-4 rounded-full hover:border-white/50 hover:text-white transition-all duration-300">
              Nosotros
            </button>
          </div>
        </div>

        {/* Slide indicators */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {heroSlides.map((_, i) => (
              <button key={i} onClick={() => { setHeroSlide(i); setHeroTransition(true); }}
                className="transition-all duration-500 rounded-full bg-white"
                style={{ width: i === heroSlide ? '24px' : '6px', height: '6px', opacity: i === heroSlide ? 1 : 0.4 }} />
            ))}
          </div>
        )}
      </section>

      {/* ══ CATEGORÍAS ═══════════════════════════════════════════ */}
      {visibleCats.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-5 md:px-10">
            <Reveal className="text-center mb-12">
              <p className="text-[#D2006E] text-[10px] tracking-[0.4em] uppercase mb-3 font-semibold">Explorar</p>
              <h2 className="glam-title text-4xl md:text-5xl font-bold text-[#0D0D12]">
                Shop by <em className="italic font-normal text-[#D2006E]">category</em>
              </h2>
            </Reveal>
            {/* Desktop: fila — Mobile: columna full width */}
            <div className="hidden md:flex gap-4 justify-center">
              {visibleCats.map((cat, idx) => (
                <Reveal key={cat.id} delay={idx * 80} className="flex-1 max-w-[220px]">
                  <button onClick={() => goTo('/products')}
                    className="group relative overflow-hidden rounded-2xl w-full bg-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                    style={{ aspectRatio: '3/4' }}>
                    {cat.img && <img src={cat.img} alt={cat.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-[#D2006E]/0 group-hover:bg-[#D2006E]/15 transition-colors duration-500" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <span className="block text-white font-bold text-sm tracking-wide group-hover:text-white transition-colors">{cat.label}</span>
                      <ChevronRight size={14} className="text-[#D2006E] mt-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
            {/* Mobile: columnas full width */}
            <div className="flex md:hidden flex-col gap-4">
              {visibleCats.map((cat, idx) => (
                <Reveal key={cat.id} delay={idx * 60}>
                  <button onClick={() => goTo('/products')}
                    className="group relative overflow-hidden rounded-2xl w-full bg-gray-100"
                    style={{ height: '180px' }}>
                    {cat.img && <img src={cat.img} alt={cat.label} className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-active:scale-105" loading="lazy" />}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                    <div className="absolute inset-y-0 left-0 flex flex-col justify-center p-6">
                      <span className="block text-white font-bold text-xl tracking-wide">{cat.label}</span>
                      <ChevronRight size={16} className="text-[#D2006E] mt-2" />
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ EDITORIAL ════════════════════════════════════════════ */}
      {editorial?.length > 0 && (
        <section className="py-20 bg-[#FDF4F8]">
          <div className="max-w-7xl mx-auto px-5 md:px-10">
            <Reveal className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[#D2006E] text-[10px] tracking-[0.4em] uppercase mb-3 font-semibold">{editorialEyebrow}</p>
                <h2 className="glam-title text-4xl md:text-5xl font-bold text-[#0D0D12]">
                  {editorialTitle.split(' ').slice(0,-1).join(' ')}{' '}
                  <em className="italic font-normal text-[#D2006E]">{editorialTitle.split(' ').slice(-1)}</em>
                </h2>
              </div>
              <button onClick={() => goTo('/products')}
                className="hidden md:flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-[#D2006E] hover:gap-4 transition-all">
                Ver todo <ArrowRight size={14} />
              </button>
            </Reveal>

            {/* Desktop: fila con hover — Mobile: columna */}
            <div className="hidden md:flex gap-4">
              {editorial.map((item, i) => (
                <Reveal key={item.id} delay={i * 100} className="flex-1">
                  <button onClick={() => goTo(item.link || '/products')}
                    className="editorial-img group relative overflow-hidden rounded-2xl w-full bg-gray-200 cursor-pointer"
                    style={{ aspectRatio: '3/4' }}
                    onMouseEnter={() => setActiveEditorial(i)}
                    onMouseLeave={() => setActiveEditorial(null)}>
                    {item.img && <img src={item.img} alt={item.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="text-[9px] font-bold tracking-widest uppercase text-white/90 bg-[#D2006E]/80 px-3 py-1 rounded-full">{item.tag}</span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <span className="text-white font-semibold text-sm">{item.label}</span>
                      <ChevronRight size={16} className="text-white/60 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>

            {/* Mobile: columna */}
            <div className="flex md:hidden flex-col gap-4">
              {editorial.map((item, i) => (
                <Reveal key={item.id} delay={i * 80}>
                  <button onClick={() => goTo(item.link || '/products')}
                    className="relative overflow-hidden rounded-2xl w-full bg-gray-200 cursor-pointer"
                    style={{ height: '220px' }}>
                    {item.img && <img src={item.img} alt={item.label} className="absolute inset-0 w-full h-full object-cover object-center" loading="lazy" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="text-[9px] font-bold tracking-widest uppercase text-white/90 bg-[#D2006E]/80 px-3 py-1 rounded-full">{item.tag}</span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <span className="text-white font-semibold text-sm">{item.label}</span>
                      <ChevronRight size={16} className="text-white/60" />
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ MARCAS ═══════════════════════════════════════════════ */}
      <section className="py-12 bg-white border-y border-pink-100 overflow-hidden">
        <Reveal className="text-center mb-6">
          <p className="text-gray-400 text-[10px] tracking-[0.4em] uppercase font-semibold">Marcas que ofrecemos</p>
        </Reveal>
        <div className="relative flex overflow-hidden">
          {[0,1].map(copy => (
            <div key={copy} className="flex gap-12 items-center whitespace-nowrap flex-shrink-0"
              style={{ animation: 'marquee 28s linear infinite', animationDelay: copy === 1 ? '-14s' : '0s' }}>
              {[...BRANDS,...BRANDS].map((b,i) => (
                <span key={i} className="text-sm font-bold tracking-[0.2em] text-gray-300 uppercase hover:text-[#D2006E] transition-colors duration-300 cursor-default">{b}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ══ NOSOTROS ═════════════════════════════════════════════ */}
      <section id="nosotros" className="py-24 bg-[#0C0210] text-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10 grid md:grid-cols-2 gap-16 items-center">
          <Reveal>
            <p className="text-[#D2006E] text-[10px] tracking-[0.4em] uppercase mb-4 font-semibold">Nuestra esencia</p>
            <h2 className="glam-title text-4xl md:text-6xl font-bold leading-tight mb-6">
              {general?.aboutTitle || 'Belleza que empodera,'}
              <br />
              <em className="italic font-normal text-[#D2006E]">glamour que inspira.</em>
            </h2>
            <p className="text-white/45 text-sm leading-relaxed max-w-sm mb-8">
              {general?.aboutText || 'En GLAM Cosmetic encontrarás los mejores productos de maquillaje y cuidado personal.'}
            </p>
            <button onClick={() => goTo('/products')}
              className="flex items-center gap-3 text-sm font-bold tracking-[0.2em] uppercase text-[#D2006E] hover:gap-5 transition-all duration-300">
              Ver productos <ArrowRight size={15} />
            </button>
          </Reveal>
          <Reveal delay={150} className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden border border-white/5">
              <img src={general?.aboutImage || ''} alt="GLAM Cosmetic" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="absolute -bottom-5 -left-5 w-28 h-28 rounded-full bg-[#D2006E]/15 border border-[#D2006E]/30 flex items-center justify-center text-center p-3">
              <span className="text-[#D2006E] text-[9px] font-bold tracking-widest uppercase leading-tight">Beauty<br />Power</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ CTA FINAL — con parallax ═════════════════════════════ */}
      <section ref={ctaSectionRef}
        className="relative py-28 text-center px-5 overflow-hidden bg-[#FDF4F8]">
        {cta?.src && (
          <>
            <img src={cta.src} alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: `translateY(${ctaParallax}px)`, willChange: 'transform' }} />
            <div className="absolute inset-0"
              style={{ background: `rgba(12,2,16,${(cta.overlayOpacity||40)/100})` }} />
          </>
        )}
        <Reveal className="relative z-10">
          <p className="text-[#D2006E] text-[10px] tracking-[0.5em] uppercase mb-4 font-semibold">
            {cta?.eyebrow || 'Explorar'}
          </p>
          <h2 className={`glam-title text-5xl md:text-7xl font-bold mb-2 ${cta?.src ? 'text-white' : 'text-[#0D0D12]'}`}>
            {cta?.title || 'Tu look,'}
          </h2>
          <h2 className="glam-title text-5xl md:text-7xl italic font-normal text-[#D2006E] mb-10">
            {cta?.titleItalic || 'perfecto.'}
          </h2>
          <button onClick={() => goTo('/products')}
            className="inline-flex items-center gap-3 bg-[#D2006E] text-white text-xs font-bold tracking-[0.25em] uppercase px-12 py-4 rounded-full hover:bg-[#E5108A] transition-all duration-500 shadow-lg shadow-[#D2006E]/25 hover:shadow-xl hover:-translate-y-0.5">
            <Sparkles size={15} />
            {cta?.buttonText || 'Ver productos'}
          </button>
        </Reveal>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════ */}
      <footer className="bg-[#0C0210] text-white/50 py-16 px-5 md:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            {/* Logo blanco en footer */}
            <div className="mb-4">
              <LogoLight className="h-14 w-auto" />
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Maquillaje y belleza premium. Calidad, glamour y los mejores productos para que brilles siempre.
            </p>
            <div className="flex gap-4 mt-5">
              <a href={general?.instagramUrl || '#'} target="_blank" rel="noreferrer" className="hover:text-[#D2006E] transition-colors"><Instagram size={17} strokeWidth={1.5} /></a>
              <a href={general?.facebookUrl  || '#'} target="_blank" rel="noreferrer" className="hover:text-[#D2006E] transition-colors"><Facebook  size={17} strokeWidth={1.5} /></a>
            </div>
          </div>
          <div>
            <p className="text-white text-[10px] tracking-[0.25em] uppercase font-bold mb-4">Navegación</p>
            <ul className="space-y-2 text-sm">
              {[['Inicio','/'],['Productos','/products'],['Nosotros','#nosotros']].map(([l, p]) => (
                <li key={l}>
                  <button onClick={() => goTo(p)} className="hover:text-[#D2006E] transition-colors text-left">{l}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-white text-[10px] tracking-[0.25em] uppercase font-bold mb-4">Contacto</p>
            <ul className="space-y-2 text-sm">
              {general?.whatsapp && (
                <li>
                  <a href={`https://wa.me/${general.whatsapp}`} target="_blank" rel="noreferrer"
                    className="hover:text-[#D2006E] transition-colors">
                    WhatsApp disponible
                  </a>
                </li>
              )}
              <li>Envío a domicilio</li>
              <li>Retiro en tienda</li>
            </ul>
            <div className="mt-5 flex items-start gap-2 text-sm">
              <MapPin size={14} className="text-[#D2006E] flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed text-xs">Av. Díaz Moreno, Centro de Valencia, Venezuela</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} GLAM Cosmetic. Todos los derechos reservados.</p>
          <p>Beauty · Glamour · Venezuela</p>
        </div>
      </footer>
    </div>
  );
}