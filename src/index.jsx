import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Menu, X, ChevronRight,
  Instagram, Facebook, ArrowRight, Sparkles, MapPin
} from 'lucide-react';
import { getAdminConfig } from './Admin';
import { getConfigFromFirebase } from './firebase';

const LS_KEY = 'glam_admin_config';

const BRANDS = [
  'ABIB','ANUA','COSRX','BEAUTY OF JOSEON','INNISFREE','CLIO',
  'ROMAND','ETUDE HOUSE','PERIPERA','MISSHA','SOME BY MI',
  'ISNTREE','ROUND LAB','MEDIHEAL','KLAIRS','APLB'
];

const NAV_LINKS = [
  { label: 'Inicio',    path: '/' },
  { label: 'Productos', path: '/products' },
  { label: 'Nosotros',  path: '#nosotros' },
];

export default function Index({ cartCount = 0, onOpenCart }) {
  const navigate     = useNavigate();
  const heroVideoRef = useRef(null);
  const explorRef    = useRef(null);
  const ctaRef       = useRef(null);
  const lastScrollY  = useRef(0);

  const [scrolled,       setScrolled]       = useState(false);
  const [menuOpen,       setMenuOpen]        = useState(false);
  const [heroSlide,      setHeroSlide]       = useState(0);
  const [heroTransition, setHeroTransition]  = useState(true);
  const [parallaxExplor, setParallaxExplor]  = useState(0);
  const [parallaxCta,    setParallaxCta]     = useState(0);
  const [cfgVersion,     setCfgVersion]      = useState(0);

  // Leer config — se actualiza cuando llega la versión de Firebase
  const cfg = useMemo(() => getAdminConfig(), [cfgVersion]);
  const { hero, cta, categories, editorial, general } = cfg;
  const editorialTitle   = cfg.editorialTitle   || 'Glam your world';
  const editorialEyebrow = cfg.editorialEyebrow || 'Editorial';
  const visibleCats      = (categories || []).filter(c => c.visible);
  const heroSlides       = hero?.slides || [];
  const isVideoMode      = hero?.mode === 'video' && hero?.videoSrc;

  // ── Cargar config de Firebase (sync entre dispositivos) ───
  useEffect(() => {
    getConfigFromFirebase().then(fbConfig => {
      if (!fbConfig) return;
      const local  = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
      const merged = { ...local, ...fbConfig };
      localStorage.setItem(LS_KEY, JSON.stringify(merged));
      setCfgVersion(v => v + 1); // fuerza re-render con config nueva
    }).catch(() => {}); // sin conexión → usa localStorage
  }, []);

  // ── Scroll + parallax ─────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const sy = window.scrollY;
      setScrolled(sy > 60);
      lastScrollY.current = sy;

      // Parallax sección Explorar
      if (explorRef.current) {
        const rect = explorRef.current.getBoundingClientRect();
        setParallaxExplor(rect.top * -0.2);
      }
      // Parallax sección CTA
      if (ctaRef.current) {
        const rect = ctaRef.current.getBoundingClientRect();
        setParallaxCta(rect.top * -0.2);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Autoplay video hero (iOS fix) ─────────────────────────
  useEffect(() => {
    if (!isVideoMode) return;
    const v = heroVideoRef.current; if (!v) return;
    v.muted = true; v.defaultMuted = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    document.addEventListener('touchstart', tryPlay, { once: true });
    return () => document.removeEventListener('touchstart', tryPlay);
  }, [isVideoMode, hero?.videoSrc]);

  // ── Slideshow autoplay ────────────────────────────────────
  useEffect(() => {
    if (isVideoMode || heroSlides.length <= 1) return;
    const t = setInterval(() => {
      setHeroTransition(false);
      setTimeout(() => { setHeroSlide(s => (s + 1) % heroSlides.length); setHeroTransition(true); }, 50);
    }, hero?.slideInterval || 5000);
    return () => clearInterval(t);
  }, [isVideoMode, heroSlides.length, hero?.slideInterval]);

  // ── Animaciones de entrada ─────────────────────────────────
  useEffect(() => {
    const els = document.querySelectorAll('.glam-reveal');
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('glam-revealed'); obs.unobserve(e.target); } }),
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [cfgVersion]);

  const goTo = useCallback((path) => { setMenuOpen(false); navigate(path); }, [navigate]);
  const overlayAlpha = (hero?.overlayOpacity || 50) / 100;

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes marquee   { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes pulseDot  { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes menuSlide { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
        .glam-title { font-family: 'Playfair Display', serif; }
        .glam-reveal { opacity:0; transform:translateY(32px); transition: opacity .7s ease, transform .7s ease; }
        .glam-reveal.glam-revealed { opacity:1; transform:translateY(0); }
        .glam-reveal-d1{transition-delay:.1s} .glam-reveal-d2{transition-delay:.2s}
        .glam-reveal-d3{transition-delay:.3s} .glam-reveal-d4{transition-delay:.4s}
        .editorial-card { flex:1; transition:flex .5s cubic-bezier(.4,0,.2,1); }
        @media(hover:hover){
          .editorial-wrap:hover .editorial-card{flex:.7;}
          .editorial-wrap:hover .editorial-card:hover{flex:1.6;}
        }
      `}</style>

      {/* ══ NAVBAR ══════════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-12 flex items-center justify-between">
          <button onClick={() => goTo('/')} className="flex items-center h-10">
            <img src={scrolled ? '/glam-negro.svg' : '/glamblancoadmin.svg'} alt="GLAM" className="h-7 w-auto transition-all duration-300"
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}/>
            <span className={`glam-title font-bold text-xl tracking-widest transition-colors hidden ${scrolled?'text-[#0D0D12]':'text-white'}`}>GLAM</span>
          </button>

          <div className={`hidden md:flex gap-8 text-xs font-semibold tracking-[0.2em] uppercase transition-colors ${scrolled?'text-gray-700':'text-white/85'}`}>
            {NAV_LINKS.map(l => (
              <button key={l.label} onClick={() => l.path.startsWith('#') ? document.querySelector(l.path)?.scrollIntoView({behavior:'smooth'}) : goTo(l.path)}
                className="hover:text-[#D2006E] transition-colors">{l.label}</button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onOpenCart} className={`relative transition-colors hover:text-[#D2006E] ${scrolled?'text-gray-700':'text-white'}`}>
              <ShoppingCart size={20} strokeWidth={1.5} />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#D2006E] text-white text-[9px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>}
            </button>
            <button onClick={() => setMenuOpen(true)} className={`md:hidden transition-colors ${scrolled?'text-gray-700':'text-white'}`}>
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* ══ MOBILE MENU ═══════════════════════════════════ */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="relative ml-auto w-72 bg-[#0C0210] h-full flex flex-col px-8 py-10"
            style={{ animation: 'menuSlide .3s ease both' }}>
            <button onClick={() => setMenuOpen(false)} className="self-end text-white/40 hover:text-white mb-10"><X size={22}/></button>
            <div className="mb-8">
              <img src="/glamblancoadmin.svg" alt="GLAM" className="h-9 w-auto mb-1"
                onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='block';}}/>
              <span className="glam-title text-white text-2xl font-bold hidden">GLAM</span>
              <p className="glam-title italic text-[#D2006E] text-lg">Cosmetic</p>
            </div>
            <nav className="space-y-6">
              {NAV_LINKS.map(l => (
                <button key={l.label} onClick={() => { setMenuOpen(false); l.path.startsWith('#') ? document.querySelector(l.path)?.scrollIntoView({behavior:'smooth'}) : goTo(l.path); }}
                  className="block text-sm font-semibold tracking-[0.2em] uppercase text-white/70 hover:text-[#D2006E] transition-colors text-left">
                  {l.label}
                </button>
              ))}
            </nav>
            <div className="mt-auto flex gap-4">
              <a href={general?.instagramUrl||'#'} className="text-white/30 hover:text-[#D2006E] transition-colors"><Instagram size={18}/></a>
              <a href={general?.facebookUrl||'#'}  className="text-white/30 hover:text-[#D2006E] transition-colors"><Facebook  size={18}/></a>
            </div>
          </div>
        </div>
      )}

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section className="relative h-[100dvh] min-h-[600px] flex items-center justify-center overflow-hidden bg-[#0C0210]">
        {isVideoMode && (
          <video ref={heroVideoRef} src={hero.videoSrc} muted loop playsInline autoPlay
            className="absolute inset-0 w-full h-full object-cover"/>
        )}
        {!isVideoMode && heroSlides.map((slide, i) => (
          <div key={slide.id||i} className="absolute inset-0"
            style={{ opacity: i===heroSlide && heroTransition ? 1 : 0, zIndex: i===heroSlide?1:0, transition:'opacity 1.2s cubic-bezier(.4,0,.2,1)' }}>
            <img src={slide.src} alt="" className="w-full h-full object-cover object-center"/>
          </div>
        ))}
        <div className="absolute inset-0 z-10" style={{ background:`rgba(12,2,16,${overlayAlpha})` }}/>
        <div className="absolute inset-x-0 bottom-0 h-48 z-10 bg-gradient-to-t from-[#0C0210] to-transparent"/>

        <div className="relative z-20 text-center px-6 max-w-3xl mx-auto">
          <p className="text-[#D2006E] text-[10px] tracking-[0.5em] uppercase mb-5 font-semibold">{hero?.tagline||'Beauty · Power'}</p>
          <div className="flex justify-center mb-3">
            <img src="/glamblancoadmin.svg" alt="GLAM" className="h-16 md:h-24 w-auto"
              onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='block';}}/>
            <h1 className="glam-title text-white text-7xl md:text-9xl font-bold tracking-widest hidden">{hero?.title||'GLAM'}</h1>
          </div>
          <p className="glam-title text-3xl md:text-4xl italic font-normal text-[#D2006E] mb-2">{hero?.titleSub||'Cosmetic'}</p>
          <p className="text-white/50 text-sm md:text-base mt-4 mb-10 leading-relaxed font-light">{hero?.subtitle||'Tu glamour, sin límites'}</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={() => goTo('/products')}
              className="bg-[#D2006E] text-white text-xs font-bold tracking-[0.25em] uppercase px-10 py-4 rounded-full hover:bg-[#E5108A] transition-all duration-300 shadow-lg shadow-[#D2006E]/30 hover:-translate-y-0.5">
              Explorar tienda
            </button>
            <button onClick={() => document.querySelector('#nosotros')?.scrollIntoView({behavior:'smooth'})}
              className="border border-white/25 text-white/75 text-xs font-semibold tracking-[0.2em] uppercase px-8 py-4 rounded-full hover:border-white/50 hover:text-white transition-all duration-300">
              Nosotros
            </button>
          </div>
        </div>

        {!isVideoMode && heroSlides.length > 1 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {heroSlides.map((_,i) => (
              <button key={i} onClick={() => {setHeroSlide(i);setHeroTransition(true);}}
                className="transition-all duration-500 rounded-full bg-white"
                style={{width:i===heroSlide?'28px':'6px',height:'6px',opacity:i===heroSlide?1:0.35}}/>
            ))}
          </div>
        )}
        <div className="absolute bottom-10 right-8 z-20 opacity-40">
          <div className="w-px h-12 bg-white/40" style={{animation:'pulseDot 2s ease-in-out infinite'}}/>
        </div>
      </section>

      {/* ══ CATEGORÍAS — parallax ═════════════════════════ */}
      {visibleCats.length > 0 && (
        <section ref={explorRef} className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-[-20%] bg-cover bg-center"
              style={{ backgroundImage:'url(https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1920&q=80)', transform:`translateY(${parallaxExplor}px)`, willChange:'transform' }}/>
            <div className="absolute inset-0 bg-[#0C0210]/78"/>
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-10">
            <div className="text-center mb-12 glam-reveal">
              <p className="text-[#D2006E] text-[10px] tracking-[0.4em] uppercase mb-3 font-semibold">Explorar</p>
              <h2 className="glam-title text-4xl md:text-5xl font-bold text-white">
                Shop by <em className="italic font-normal text-[#D2006E]">category</em>
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {visibleCats.map((cat,i) => (
                <button key={cat.id} onClick={() => goTo('/products')}
                  className={`glam-reveal glam-reveal-d${Math.min(i+1,4)} group relative overflow-hidden rounded-2xl aspect-[3/4] bg-gray-800 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1`}>
                  {cat.img && <img src={cat.img} alt={cat.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy"/>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"/>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <span className="block text-white font-bold text-sm tracking-wide">{cat.label}</span>
                    <ChevronRight size={14} className="text-[#D2006E] mt-1 group-hover:translate-x-1 transition-transform"/>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ EDITORIAL ═════════════════════════════════════ */}
      {editorial?.length > 0 && (
        <section className="py-20 bg-[#FDF4F8]">
          <div className="max-w-7xl mx-auto px-5 md:px-10">
            <div className="flex items-end justify-between mb-10 glam-reveal">
              <div>
                <p className="text-[#D2006E] text-[10px] tracking-[0.4em] uppercase mb-3 font-semibold">{editorialEyebrow}</p>
                <h2 className="glam-title text-4xl md:text-5xl font-bold text-[#0D0D12]">
                  {editorialTitle.split(' ').slice(0,-1).join(' ')}{' '}
                  <em className="italic font-normal text-[#D2006E]">{editorialTitle.split(' ').slice(-1)}</em>
                </h2>
              </div>
              <button onClick={() => goTo('/products')} className="hidden md:flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-[#D2006E] hover:gap-4 transition-all">
                Ver todo <ArrowRight size={14}/>
              </button>
            </div>

            {/* Desktop: hover-expand sin rotación automática */}
            <div className="hidden md:flex editorial-wrap gap-3 h-[480px]">
              {editorial.map(item => (
                <button key={item.id} onClick={() => goTo(item.link||'/products')}
                  className="editorial-card group relative overflow-hidden rounded-2xl bg-gray-100 cursor-pointer">
                  {item.img && <img src={item.img} alt={item.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy"/>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"/>
                  <div className="absolute top-3 left-3">
                    <span className="text-[9px] font-bold tracking-widest uppercase text-white/90 bg-[#D2006E]/80 backdrop-blur-sm px-3 py-1 rounded-full">{item.tag}</span>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                    <span className="text-white font-semibold text-sm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">{item.label}</span>
                    <ChevronRight size={16} className="text-white/60 group-hover:translate-x-1 transition-transform"/>
                  </div>
                </button>
              ))}
            </div>

            {/* Mobile: stacked */}
            <div className="md:hidden flex flex-col gap-4">
              {editorial.map(item => (
                <button key={item.id} onClick={() => goTo(item.link||'/products')}
                  className="group relative overflow-hidden rounded-2xl bg-gray-100 w-full" style={{aspectRatio:'16/9'}}>
                  {item.img && <img src={item.img} alt={item.label} className="absolute inset-0 w-full h-full object-cover" loading="lazy"/>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"/>
                  <div className="absolute top-3 left-3">
                    <span className="text-[9px] font-bold tracking-widest uppercase text-white/90 bg-[#D2006E]/80 backdrop-blur-sm px-3 py-1 rounded-full">{item.tag}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <span className="text-white font-semibold text-sm">{item.label}</span>
                    <ChevronRight size={16} className="text-white/60"/>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ MARCAS ════════════════════════════════════════ */}
      <section className="py-12 bg-white border-y border-pink-100 overflow-hidden glam-reveal">
        <div className="text-center mb-6">
          <p className="text-gray-400 text-[10px] tracking-[0.4em] uppercase font-semibold">Marcas que ofrecemos</p>
        </div>
        <div className="relative flex overflow-hidden">
          {[0,1].map(copy=>(
            <div key={copy} className="flex gap-12 items-center whitespace-nowrap flex-shrink-0"
              style={{animation:'marquee 28s linear infinite',animationDelay:copy===1?'-14s':'0s'}}>
              {[...BRANDS,...BRANDS].map((b,i)=>(
                <span key={i} className="text-sm font-bold tracking-[0.2em] text-gray-300 uppercase hover:text-[#D2006E] transition-colors duration-300 cursor-default">{b}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ══ NOSOTROS ══════════════════════════════════════ */}
      <section id="nosotros" className="py-24 bg-[#0C0210] text-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10 grid md:grid-cols-2 gap-16 items-center">
          <div className="glam-reveal">
            <p className="text-[#D2006E] text-[10px] tracking-[0.4em] uppercase mb-4 font-semibold">Nuestra esencia</p>
            <h2 className="glam-title text-4xl md:text-6xl font-bold leading-tight mb-6">
              {general?.aboutTitle||'Belleza que empodera,'}<br/>
              <em className="italic font-normal text-[#D2006E]">glamour que inspira.</em>
            </h2>
            <p className="text-white/45 text-sm leading-relaxed max-w-sm mb-8">{general?.aboutText||'En GLAM Cosmetic encontrarás los mejores productos de maquillaje y cuidado personal.'}</p>
            <button onClick={()=>goTo('/products')} className="flex items-center gap-3 text-sm font-bold tracking-[0.2em] uppercase text-[#D2006E] hover:gap-5 transition-all duration-300">
              Ver productos <ArrowRight size={15}/>
            </button>
          </div>
          <div className="relative glam-reveal glam-reveal-d2">
            <div className="aspect-square rounded-2xl overflow-hidden border border-white/5">
              <img src={general?.aboutImage||''} alt="GLAM" className="w-full h-full object-cover" loading="lazy"/>
            </div>

          </div>
        </div>
      </section>

      {/* ══ CTA FINAL — con parallax ══════════════════════ */}
      <section ref={ctaRef} className="relative py-28 text-center px-5 overflow-hidden glam-reveal" style={{minHeight:'360px'}}>
        {/* Fondo parallax */}
        <div className="absolute inset-0 overflow-hidden">
          {cta?.src ? (
            <>
              <div className="absolute inset-[-20%] bg-cover bg-center"
                style={{ backgroundImage:`url(${cta.src})`, transform:`translateY(${parallaxCta}px)`, willChange:'transform' }}/>
              <div className="absolute inset-0" style={{background:`rgba(12,2,16,${(cta.overlayOpacity||40)/100})`}}/>
            </>
          ) : (
            // Sin imagen: fondo degradado con parallax decorativo
            <>
              <div className="absolute inset-0 bg-[#FDF4F8]"/>
              <div className="absolute inset-[-20%]"
                style={{ background:'radial-gradient(ellipse at 30% 50%, rgba(210,0,110,0.08) 0%, transparent 60%)', transform:`translateY(${parallaxCta * 0.5}px)`, willChange:'transform' }}/>
            </>
          )}
        </div>

        <div className="relative z-10">
          <p className={`text-[10px] tracking-[0.5em] uppercase mb-4 font-semibold ${cta?.src ? 'text-[#D2006E]' : 'text-[#D2006E]'}`}>
            {cta?.eyebrow||'Explorar'}
          </p>
          <h2 className={`glam-title text-5xl md:text-7xl font-bold mb-2 ${cta?.src?'text-white':'text-[#0D0D12]'}`}>
            {cta?.title||'Tu look,'}
          </h2>
          <h2 className="glam-title text-5xl md:text-7xl italic font-normal text-[#D2006E] mb-10">
            {cta?.titleItalic||'perfecto.'}
          </h2>
          <button onClick={()=>goTo('/products')}
            className="inline-flex items-center gap-3 bg-[#D2006E] text-white text-xs font-bold tracking-[0.25em] uppercase px-12 py-4 rounded-full hover:bg-[#E5108A] transition-all duration-500 shadow-lg shadow-[#D2006E]/25 hover:-translate-y-0.5">
            <Sparkles size={15}/>{cta?.buttonText||'Ver productos'}
          </button>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════ */}
      <footer className="bg-[#0C0210] text-white/50 py-16 px-5 md:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="mb-4">
              <img src="/glamblancoadmin.svg" alt="GLAM" className="h-8 w-auto mb-1"
                onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='block';}}/>
              <p className="glam-title text-2xl text-white font-bold tracking-widest hidden">GLAM</p>
              <p className="glam-title italic text-[#D2006E] text-lg">Cosmetic</p>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">Maquillaje y belleza premium. Calidad, glamour y los mejores productos para que brilles siempre.</p>
            <div className="flex gap-4 mt-5">
              <a href={general?.instagramUrl||'#'} target="_blank" rel="noreferrer" className="hover:text-[#D2006E] transition-colors"><Instagram size={17} strokeWidth={1.5}/></a>
              <a href={general?.facebookUrl||'#'}  target="_blank" rel="noreferrer" className="hover:text-[#D2006E] transition-colors"><Facebook  size={17} strokeWidth={1.5}/></a>
            </div>
          </div>
          <div>
            <p className="text-white text-[10px] tracking-[0.25em] uppercase font-bold mb-4">Navegación</p>
            <ul className="space-y-2 text-sm">
              {[['Inicio','/'],['Productos','/products'],['Nosotros','#nosotros']].map(([l,p])=>(
                <li key={l}><button onClick={()=>p.startsWith('/')?goTo(p):document.querySelector(p)?.scrollIntoView({behavior:'smooth'})} className="hover:text-[#D2006E] transition-colors text-left">{l}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-white text-[10px] tracking-[0.25em] uppercase font-bold mb-4">Contacto</p>
            <ul className="space-y-2 text-sm">
              {general?.whatsapp && <li><a href={`https://wa.me/${general.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-[#D2006E] transition-colors">WhatsApp disponible</a></li>}
              <li>Envío a domicilio</li><li>Retiro en tienda</li>
            </ul>
            <div className="mt-5 flex items-start gap-2 text-sm">
              <MapPin size={14} className="text-[#D2006E] flex-shrink-0 mt-0.5"/>
              <p className="leading-relaxed text-xs">Venezuela</p>
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