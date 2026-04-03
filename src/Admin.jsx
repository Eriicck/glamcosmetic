/**
 * ADMIN.JSX — Panel de control GLAM Cosmetick
 * Basado en el modelo U.RRIOLA con identidad GLAM
 * ─────────────────────────────────────────────
 * ✅ Hero: slideshow de imágenes o video (mp4/webm) — URL o subida local
 * ✅ Productos en Firebase con edición inline
 * ✅ Descuento calculado en tiempo real al editar oferta
 * ✅ Importación mock (20 productos) + CSV masivo
 * ✅ Editorial, Reels, Categorías, Configuración general
 * ✅ Cambios reflejados al instante en el frontend vía onSnapshot
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import {
  Settings, Package, Grid, Image, Video, Plus, Trash2,
  Edit2, Save, X, ChevronUp, ChevronDown, Eye, EyeOff,
  ToggleLeft, ToggleRight, Check, AlertCircle, Layers,
  RefreshCw, ChevronLeft, ChevronRight, Home,
  Search, Film, FileImage, Layout, LogOut, Upload, Link,
  Percent, Tag, Palette, SlidersHorizontal
} from 'lucide-react';
import { MOCK_PRODUCTS, WHATSAPP_NUMBER } from './data';
import {
  patchProduct, deleteProduct as deleteProductFromFirebase,
  createProduct, uploadToCloudinary, subscribeProducts
} from './firebase';

// ─── PERSISTENCIA ─────────────────────────────────────────
const LS_KEY      = 'glam_admin_config';
const IMPORT_KEY  = 'glam_import_done';

export function getAdminConfig() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_CONFIG;
  } catch { return DEFAULT_CONFIG; }
}
function saveConfig(cfg) { localStorage.setItem(LS_KEY, JSON.stringify(cfg)); }
function uid() { return Math.random().toString(36).slice(2, 9); }

// ─── CONFIG POR DEFECTO ────────────────────────────────────
const DEFAULT_CONFIG = {
  hero: {
    mode: 'slides',          // 'slides' | 'video'
    slides: [
      { id: 'sl-1', src: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1920&q=85' },
      { id: 'sl-2', src: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1920&q=85' },
      { id: 'sl-3', src: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1920&q=85' },
    ],
    videoSrc:       '',
    slideInterval:  5000,
    overlayOpacity: 50,
    tagline:   'Beauty · Power',
    title:     'GLAM',
    titleSub:  'Cosmetick',
    subtitle:  'Tu glamour, sin límites',
  },
  cta: {
    type: 'color', src: '', overlayOpacity: 40,
    eyebrow: 'Explorar', title: 'Tu look,',
    titleItalic: 'perfecto.', buttonText: 'Ver productos',
  },
  categories: [
    { id: 'cat-1', label: 'Rostro', img: 'https://images.unsplash.com/photo-1614159366559-20c0c9fdf7e9?w=800&q=80', visible: true },
    { id: 'cat-2', label: 'Labios', img: 'https://images.unsplash.com/photo-1586495777744-4e6232bf6270?w=800&q=80', visible: true },
    { id: 'cat-3', label: 'Ojos',   img: 'https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?w=800&q=80', visible: true },
    { id: 'cat-4', label: 'Uñas',   img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80', visible: true },
    { id: 'cat-5', label: 'Piel',   img: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80', visible: true },
  ],
  editorial: [
    { id: 'ed-1', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=80', label: 'Ver todos',     tag: 'Nueva Colección', link: '/products' },
    { id: 'ed-2', img: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1200&q=80', label: 'Labios',        tag: 'Tendencia',       link: '/products' },
    { id: 'ed-3', img: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80', label: 'Comprar ahora', tag: 'Best Seller',     link: '/products' },
  ],
  editorialTitle:   'Glam your world',
  editorialEyebrow: 'Editorial',
  reels: [],
  reelsEyebrow: 'Descubrí',
  reelsTitle:   'GLAM en acción',
  general: {
    whatsapp:     WHATSAPP_NUMBER,
    brandColor:   '#D2006E',
    instagramUrl: '#',
    facebookUrl:  '#',
    aboutTitle:   'Belleza que empodera, glamour que inspira.',
    aboutText:    'En GLAM Cosmetick encontrarás los mejores productos de maquillaje y cuidado personal. Calidad premium, precios accesibles.',
    aboutImage:   'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80',
  },
};

// ─── TEMA GLAM ─────────────────────────────────────────────
const S = {
  input:      'w-full border border-pink-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#D2006E] bg-white transition-colors',
  label:      'block text-[11px] font-bold tracking-widest uppercase text-[#D2006E]/70 mb-1',
  card:       'bg-white border border-pink-100 rounded-xl p-5 shadow-sm',
  btn:        'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200',
  btnPrimary: 'bg-[#D2006E] text-white hover:bg-[#E5108A] shadow-sm',
  btnGhost:   'border border-pink-200 text-[#D2006E] hover:border-[#D2006E] hover:bg-pink-50',
  btnDanger:  'text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-1.5 transition-colors',
};

// ─── ATOMS ────────────────────────────────────────────────
function Field({ label, children, hint }) {
  return (
    <div>
      <label className={S.label}>{label}</label>
      {children}
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <button onClick={() => onChange(!value)} className={`flex items-center gap-2 transition-colors ${value ? 'text-[#D2006E]' : 'text-gray-400'}`}>
      {value ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
      <span className="text-gray-600 text-xs font-medium">{label}</span>
    </button>
  );
}

function Toast({ message, type = 'ok' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3 rounded-full shadow-xl text-sm font-semibold
      ${type === 'error' ? 'bg-red-500 text-white' : 'bg-[#D2006E] text-white'}`}>
      {type === 'error' ? <AlertCircle size={15} /> : <Check size={15} />}
      {message}
    </div>
  );
}

// Input numérico sin bug del cero
function NumericInput({ value, onChange, placeholder = '0', className }) {
  const [raw, setRaw]         = useState(String(value ?? ''));
  const [focused, setFocused] = useState(false);
  useEffect(() => { if (!focused) setRaw(String(value ?? '')); }, [value, focused]);
  return (
    <input type="text" inputMode="decimal" placeholder={placeholder}
      value={focused ? raw : (value === 0 || value === '' || value == null ? '' : String(value))}
      className={className || S.input}
      onFocus={() => { setFocused(true); setRaw(value === 0 ? '' : String(value ?? '')); }}
      onChange={e => setRaw(e.target.value)}
      onBlur={() => {
        setFocused(false);
        const n = parseFloat(raw.replace(',', '.'));
        onChange(isNaN(n) ? 0 : Math.max(0, n));
      }}
    />
  );
}

// Badge de descuento en tiempo real
function DiscountBadge({ price, offerPrice }) {
  const p = Number(price), o = Number(offerPrice);
  if (!p || !o || o >= p) return null;
  const pct = Math.round((1 - o / p) * 100);
  return (
    <span className="inline-flex items-center gap-1 bg-[#D2006E] text-white text-[10px] font-bold px-2.5 py-1 rounded-full ml-2 animate-pulse">
      <Percent size={9} /> -{pct}% OFF
    </span>
  );
}

// ─── MEDIA FIELD — imagen / video + Cloudinary ─────────────
function MediaField({ label, value, typeValue, onTypeChange, onSrcChange, hideColor = false, hint }) {
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const fileRef = useRef(null);

  const types = hideColor ? ['image', 'video'] : ['image', 'video', 'color'];
  const accept = typeValue === 'video'
    ? 'video/mp4,video/webm,video/quicktime'
    : 'image/jpeg,image/png,image/webp,image/gif';

  const handleFile = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploadErr(''); setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onSrcChange(url);
    } catch (err) {
      setUploadErr('Error al subir. Verificá tu configuración de Cloudinary.');
    } finally { setUploading(false); e.target.value = ''; }
  };

  return (
    <div className="space-y-3">
      {label && <label className={S.label}>{label}</label>}

      {/* Selector de tipo */}
      <div className="flex gap-2 flex-wrap">
        {types.map(t => (
          <button key={t} onClick={() => onTypeChange(t)}
            className={`${S.btn} text-xs ${typeValue === t ? S.btnPrimary : S.btnGhost}`}>
            {t === 'image' ? <Image size={13} /> : t === 'video' ? <Video size={13} /> : <Palette size={13} />}
            {t === 'image' ? 'Imagen' : t === 'video' ? 'Video' : 'Color sólido'}
          </button>
        ))}
      </div>

      {typeValue !== 'color' && (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={`${S.input} pl-8`}
                placeholder={typeValue === 'video' ? 'URL del video (.mp4 / .webm)' : 'URL de la imagen'}
                value={value || ''} onChange={e => onSrcChange(e.target.value)} />
            </div>
            <label className={`${S.btn} ${S.btnGhost} text-xs cursor-pointer flex-shrink-0 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploading
                ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                : <Upload size={13} />}
              {uploading ? 'Subiendo...' : 'Subir'}
              <input ref={fileRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
            </label>
          </div>
          {uploadErr && <p className="text-xs text-red-400 mt-1">{uploadErr}</p>}
          {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
        </>
      )}

      {typeValue === 'color' && (
        <p className="text-xs text-gray-400 italic">Usará el fondo rosa suave de la sección</p>
      )}

      {/* Preview */}
      {value && typeValue === 'image' && (
        <div className="w-full h-28 rounded-xl overflow-hidden bg-pink-50 border border-pink-100">
          <img src={value} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
        </div>
      )}
      {value && typeValue === 'video' && (
        <div className="w-full h-28 rounded-xl overflow-hidden bg-black flex items-center justify-center relative">
          <video src={value} muted playsInline className="h-full w-full object-contain" />
          <span className="absolute bottom-2 right-2 text-white/60 text-[10px] bg-black/50 px-2 py-0.5 rounded">Vista previa</span>
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS DRAWER ──────────────────────────────────────
function SettingsDrawer({ isOpen, onClose, config, onChange }) {
  const [tab, setTab] = useState('hero');
  const h = config.hero    || {};
  const c = config.cta     || {};
  const g = config.general || {};

  const uHero = (k, v) => onChange({ ...config, hero:    { ...h, [k]: v } });
  const uCta  = (k, v) => onChange({ ...config, cta:     { ...c, [k]: v } });
  const uGen  = (k, v) => onChange({ ...config, general: { ...g, [k]: v } });

  const TABS = [
    { id: 'hero',      label: 'Hero',      icon: FileImage },
    { id: 'cta',       label: 'CTA Final', icon: Layout },
    { id: 'editorial', label: 'Editorial', icon: Layers },
    { id: 'reels',     label: 'Reels',     icon: Film },
    { id: 'general',   label: 'General',   icon: Settings },
  ];

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto flex flex-col bg-white shadow-2xl" style={{ width: 'min(680px, 96vw)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100 bg-white flex-shrink-0">
          <div>
            <p className="font-bold text-gray-900">Configuración avanzada</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Ajustes de estética y estructura del sitio</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-pink-50 text-gray-400 transition-colors"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-pink-100 overflow-x-auto bg-white px-4 pt-3 flex-shrink-0">
          {TABS.map(t => { const Icon = t.icon; return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap rounded-t-lg transition-colors border-b-2
                ${tab === t.id ? 'border-[#D2006E] text-[#D2006E] bg-pink-50/50' : 'border-transparent text-gray-400 hover:text-[#D2006E]'}`}>
              <Icon size={13} />{t.label}
            </button>
          );})}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FDF4F8]">

          {/* ── HERO ── */}
          {tab === 'hero' && (
            <>
              {/* Selector de modo */}
              <div className={S.card}>
                <label className={S.label}>Modo del Hero</label>
                <div className="flex gap-3 mt-2">
                  {[
                    { val: 'slides', icon: <Image size={16}/>,  label: 'Slideshow de imágenes' },
                    { val: 'video',  icon: <Video size={16}/>,  label: 'Video de fondo (mp4/webm)' },
                  ].map(m => (
                    <button key={m.val} onClick={() => uHero('mode', m.val)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border-2 transition-all
                        ${h.mode === m.val ? 'border-[#D2006E] bg-[#D2006E] text-white' : 'border-pink-200 text-gray-500 hover:border-[#D2006E] hover:text-[#D2006E]'}`}>
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SLIDES mode */}
              {h.mode !== 'video' && (
                <div className={S.card + ' space-y-4'}>
                  <div className="flex items-center justify-between">
                    <label className={S.label}>Imágenes del slideshow</label>
                    <button onClick={() => uHero('slides', [...(h.slides||[]), { id: uid(), src: '' }])}
                      className={`${S.btn} ${S.btnPrimary} text-xs`}><Plus size={12}/> Agregar</button>
                  </div>
                  {(h.slides || []).map((slide, idx) => (
                    <div key={slide.id} className="bg-pink-50 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-500">Slide {idx + 1}</span>
                        <div className="flex gap-1">
                          <button onClick={() => { const arr=[...(h.slides||[])],j=idx-1; if(j>=0){[arr[idx],arr[j]]=[arr[j],arr[idx]]; uHero('slides',arr);} }}
                            disabled={idx===0} className="p-1 text-gray-400 hover:text-[#D2006E] disabled:opacity-20"><ChevronUp size={14}/></button>
                          <button onClick={() => { const arr=[...(h.slides||[])],j=idx+1; if(j<arr.length){[arr[idx],arr[j]]=[arr[j],arr[idx]]; uHero('slides',arr);} }}
                            disabled={idx===(h.slides||[]).length-1} className="p-1 text-gray-400 hover:text-[#D2006E] disabled:opacity-20"><ChevronDown size={14}/></button>
                          <button onClick={() => uHero('slides', (h.slides||[]).filter((_,i)=>i!==idx))} className={S.btnDanger}><Trash2 size={13}/></button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Link size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                          <input className={`${S.input} pl-7 text-xs`} placeholder="URL de imagen..."
                            value={slide.src} onChange={e => uHero('slides', (h.slides||[]).map((s,i)=>i===idx?{...s,src:e.target.value}:s))} />
                        </div>
                        <label className={`${S.btn} ${S.btnGhost} text-xs cursor-pointer flex-shrink-0 px-3`}>
                          <Upload size={12}/>
                          <input type="file" accept="image/*" className="hidden" onChange={async e => {
                            const f=e.target.files[0]; if(!f) return;
                            try { const url=await uploadToCloudinary(f); uHero('slides',(h.slides||[]).map((s,i)=>i===idx?{...s,src:url}:s)); }
                            catch { alert('Error subiendo imagen'); }
                            e.target.value='';
                          }}/>
                        </label>
                      </div>
                      {slide.src && <img src={slide.src} alt="" className="w-full h-20 object-cover rounded-lg" onError={e=>e.target.style.display='none'}/>}
                    </div>
                  ))}
                  <Field label={`Intervalo entre slides — ${(h.slideInterval||5000)/1000}s`}>
                    <input type="range" min={2000} max={12000} step={500} value={h.slideInterval||5000}
                      onChange={e => uHero('slideInterval', Number(e.target.value))} className="w-full accent-[#D2006E]" />
                  </Field>
                </div>
              )}

              {/* VIDEO mode */}
              {h.mode === 'video' && (
                <div className={S.card}>
                  <MediaField
                    label="Video de fondo del Hero (.mp4 / .webm)"
                    value={h.videoSrc || ''} typeValue="video"
                    onTypeChange={() => {}} onSrcChange={v => uHero('videoSrc', v)}
                    hideColor
                    hint="Recomendado: video corto en bucle, sin audio. Sube a Cloudinary o pega la URL directa."
                  />
                </div>
              )}

              {/* Overlay y textos — siempre visibles */}
              <div className={S.card + ' space-y-4'}>
                <Field label={`Opacidad del overlay oscuro — ${h.overlayOpacity||50}%`}>
                  <input type="range" min={0} max={85} value={h.overlayOpacity||50}
                    onChange={e => uHero('overlayOpacity', Number(e.target.value))} className="w-full accent-[#D2006E]" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Tagline"><input className={S.input} value={h.tagline||''} onChange={e=>uHero('tagline',e.target.value)} placeholder="Beauty · Power"/></Field>
                  <Field label="Título"><input className={S.input} value={h.title||''} onChange={e=>uHero('title',e.target.value)} placeholder="GLAM"/></Field>
                  <Field label="Subtítulo cursiva"><input className={S.input} value={h.titleSub||''} onChange={e=>uHero('titleSub',e.target.value)} placeholder="Cosmetick"/></Field>
                  <Field label="Frase hero"><input className={S.input} value={h.subtitle||''} onChange={e=>uHero('subtitle',e.target.value)} placeholder="Tu glamour, sin límites"/></Field>
                </div>
              </div>
            </>
          )}

          {/* ── CTA ── */}
          {tab === 'cta' && (
            <div className={S.card + ' space-y-5'}>
              <MediaField label='Fondo sección CTA final'
                value={c.src||''} typeValue={c.type||'color'}
                onTypeChange={v=>uCta('type',v)} onSrcChange={v=>uCta('src',v)} />
              {c.type !== 'color' && (
                <Field label={`Opacidad overlay — ${c.overlayOpacity||40}%`}>
                  <input type="range" min={0} max={85} value={c.overlayOpacity||40}
                    onChange={e=>uCta('overlayOpacity',Number(e.target.value))} className="w-full accent-[#D2006E]" />
                </Field>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Eyebrow"><input className={S.input} value={c.eyebrow||''} onChange={e=>uCta('eyebrow',e.target.value)}/></Field>
                <Field label="Título"><input className={S.input} value={c.title||''} onChange={e=>uCta('title',e.target.value)}/></Field>
                <Field label="Título cursiva"><input className={S.input} value={c.titleItalic||''} onChange={e=>uCta('titleItalic',e.target.value)}/></Field>
                <Field label="Texto botón"><input className={S.input} value={c.buttonText||''} onChange={e=>uCta('buttonText',e.target.value)}/></Field>
              </div>
            </div>
          )}

          {/* ── EDITORIAL ── */}
          {tab === 'editorial' && (() => {
            const eds = config.editorial || [];
            const upd = nw => onChange({ ...config, editorial: nw });
            const edit   = (i,k,v) => upd(eds.map((e,idx)=>idx===i?{...e,[k]:v}:e));
            const remove = i => upd(eds.filter((_,idx)=>idx!==i));
            const move   = (i,d) => { const arr=[...eds],j=i+d; if(j<0||j>=arr.length)return; [arr[i],arr[j]]=[arr[j],arr[i]]; upd(arr); };
            const add    = () => upd([...eds,{id:uid(),img:'',label:'Ver más',tag:'Nuevo',link:'/products'}]);
            return (
              <div className="space-y-5">
                <div className={S.card}>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Eyebrow"><input className={S.input} value={config.editorialEyebrow||''} onChange={e=>onChange({...config,editorialEyebrow:e.target.value})}/></Field>
                    <Field label="Título"><input className={S.input} value={config.editorialTitle||''} onChange={e=>onChange({...config,editorialTitle:e.target.value})}/></Field>
                  </div>
                </div>
                {eds.map((ed,i)=>(
                  <div key={ed.id} className={S.card}>
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-1 mt-1">
                        <button onClick={()=>move(i,-1)} className="text-gray-300 hover:text-[#D2006E]"><ChevronUp size={14}/></button>
                        <span className="text-[9px] text-center text-gray-300 font-bold">{i+1}</span>
                        <button onClick={()=>move(i,1)} className="text-gray-300 hover:text-[#D2006E]"><ChevronDown size={14}/></button>
                      </div>
                      {ed.img && <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-pink-100"><img src={ed.img} className="w-full h-full object-cover" alt=""/></div>}
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Field label="URL imagen"><input className={S.input} value={ed.img||''} onChange={e=>edit(i,'img',e.target.value)} placeholder="https://..."/></Field>
                        <Field label="Tag"><input className={S.input} value={ed.tag||''} onChange={e=>edit(i,'tag',e.target.value)} placeholder="Best Seller"/></Field>
                        <Field label="Botón"><input className={S.input} value={ed.label||''} onChange={e=>edit(i,'label',e.target.value)}/></Field>
                        <Field label="Link"><input className={S.input} value={ed.link||''} onChange={e=>edit(i,'link',e.target.value)} placeholder="/products"/></Field>
                      </div>
                      <button onClick={()=>remove(i)} className={S.btnDanger}><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
                <button onClick={add} className={`${S.btn} ${S.btnGhost} w-full justify-center border-dashed text-xs`}><Plus size={13}/> Agregar tarjeta</button>
              </div>
            );
          })()}

          {/* ── REELS ── */}
          {tab === 'reels' && (() => {
            const reels = config.reels || [];
            const upd  = nw => onChange({ ...config, reels: nw });
            const edit = (i,k,v) => upd(reels.map((r,idx)=>idx===i?{...r,[k]:v}:r));
            const add  = () => upd([...reels,{id:uid(),thumb:'',src:'',visible:true}]);
            return (
              <div className="space-y-5">
                <div className={S.card}>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Eyebrow"><input className={S.input} value={config.reelsEyebrow||''} onChange={e=>onChange({...config,reelsEyebrow:e.target.value})}/></Field>
                    <Field label="Título"><input className={S.input} value={config.reelsTitle||''} onChange={e=>onChange({...config,reelsTitle:e.target.value})}/></Field>
                  </div>
                </div>
                {reels.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Film size={32} className="mx-auto mb-3 opacity-30"/>
                    <p className="text-sm">No hay reels. Agregá el primero.</p>
                  </div>
                )}
                {reels.map((r,i)=>(
                  <div key={r.id} className={S.card}>
                    <div className="flex items-center gap-3">
                      {r.thumb && <div className="w-10 h-16 rounded-lg bg-gray-900 overflow-hidden flex-shrink-0"><img src={r.thumb} className="w-full h-full object-cover" alt=""/></div>}
                      <div className="flex-1 space-y-2">
                        <Field label="Miniatura (.jpg/.png)"><input className={S.input} placeholder="https://..." value={r.thumb||''} onChange={e=>edit(i,'thumb',e.target.value)}/></Field>
                        <Field label="Video (.mp4/.webm)"><input className={S.input} placeholder="https://..." value={r.src||''} onChange={e=>edit(i,'src',e.target.value)}/></Field>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Toggle value={r.visible} onChange={v=>edit(i,'visible',v)} label="Visible"/>
                        <button onClick={()=>upd(reels.filter((_,idx)=>idx!==i))} className={S.btnDanger}><Trash2 size={14}/></button>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={add} className={`${S.btn} ${S.btnGhost} w-full justify-center border-dashed text-xs`}><Plus size={13}/> Agregar reel</button>
              </div>
            );
          })()}

          {/* ── GENERAL ── */}
          {tab === 'general' && (
            <div className={S.card + ' space-y-5'}>
              <Field label="WhatsApp (solo números con código de país)" hint="Ej: 584127398463 → +58 412 739 8463">
                <input className={S.input} value={g.whatsapp||''} onChange={e=>uGen('whatsapp',e.target.value)} placeholder="584127398463"/>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Instagram URL"><input className={S.input} value={g.instagramUrl||''} onChange={e=>uGen('instagramUrl',e.target.value)} placeholder="https://instagram.com/..."/></Field>
                <Field label="Facebook URL"><input className={S.input} value={g.facebookUrl||''} onChange={e=>uGen('facebookUrl',e.target.value)} placeholder="https://facebook.com/..."/></Field>
              </div>
              <Field label="Color de marca">
                <div className="flex gap-2 items-center">
                  <input type="color" value={g.brandColor||'#D2006E'} onChange={e=>uGen('brandColor',e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-pink-200 p-0.5"/>
                  <input className={`${S.input} flex-1`} value={g.brandColor||'#D2006E'} onChange={e=>uGen('brandColor',e.target.value)}/>
                </div>
              </Field>
              <div className="border-t border-pink-100 pt-5 space-y-4">
                <p className={S.label}>Sección Nosotros</p>
                <Field label="Imagen URL">
                  <input className={S.input} value={g.aboutImage||''} onChange={e=>uGen('aboutImage',e.target.value)}/>
                  {g.aboutImage && <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-pink-100"><img src={g.aboutImage} className="w-full h-full object-cover" alt=""/></div>}
                </Field>
                <Field label="Título"><input className={S.input} value={g.aboutTitle||''} onChange={e=>uGen('aboutTitle',e.target.value)}/></Field>
                <Field label="Texto"><textarea className={`${S.input} resize-none`} rows={3} value={g.aboutText||''} onChange={e=>uGen('aboutText',e.target.value)}/></Field>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CATEGORÍAS ────────────────────────────────────────────
function CategoriesSection({ config, onChange }) {
  const cats = config.categories || [];
  const upd    = nw => onChange({ ...config, categories: nw });
  const move   = (i,d) => { const arr=[...cats],j=i+d; if(j<0||j>=arr.length)return; [arr[i],arr[j]]=[arr[j],arr[i]]; upd(arr); };
  const edit   = (i,k,v) => upd(cats.map((c,idx)=>idx===i?{...c,[k]:v}:c));
  const remove = i => upd(cats.filter((_,idx)=>idx!==i));
  const add    = () => upd([...cats,{id:uid(),label:'Nueva categoría',img:'',visible:true}]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">El orden aquí determina el orden en la tienda.</p>
        <button onClick={add} className={`${S.btn} ${S.btnPrimary} text-xs`}><Plus size={13}/> Nueva</button>
      </div>
      {cats.map((cat,i)=>(
        <div key={cat.id} className={`${S.card} ${!cat.visible?'opacity-50':''}`}>
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-0.5">
              <button onClick={()=>move(i,-1)} className="text-gray-300 hover:text-[#D2006E]"><ChevronUp size={16}/></button>
              <span className="text-[10px] text-center text-gray-400 font-bold">{i+1}</span>
              <button onClick={()=>move(i,1)} className="text-gray-300 hover:text-[#D2006E]"><ChevronDown size={16}/></button>
            </div>
            <div className="w-12 h-16 rounded-xl overflow-hidden bg-pink-50 flex-shrink-0 border border-pink-100">
              {cat.img
                ? <img src={cat.img} className="w-full h-full object-cover" alt="" onError={e=>e.target.style.display='none'}/>
                : <div className="w-full h-full flex items-center justify-center"><Image size={16} className="text-pink-200"/></div>}
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Nombre"><input className={S.input} value={cat.label||''} onChange={e=>edit(i,'label',e.target.value)}/></Field>
              <Field label="URL imagen">
                <div className="flex gap-1">
                  <input className={`${S.input} flex-1`} value={cat.img||''} onChange={e=>edit(i,'img',e.target.value)} placeholder="https://..."/>
                  <label className={`${S.btn} ${S.btnGhost} text-xs cursor-pointer px-2 flex-shrink-0`}>
                    <Upload size={12}/>
                    <input type="file" accept="image/*" className="hidden" onChange={async e=>{
                      const f=e.target.files[0]; if(!f) return;
                      try { const url=await uploadToCloudinary(f); edit(i,'img',url); }
                      catch { alert('Error subiendo'); }
                      e.target.value='';
                    }}/>
                  </label>
                </div>
              </Field>
            </div>
            <div className="flex flex-col gap-3 items-end">
              <Toggle value={cat.visible} onChange={v=>edit(i,'visible',v)} label="Visible"/>
              <button onClick={()=>remove(i)} className={S.btnDanger}><Trash2 size={15}/></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── PRODUCTOS ─────────────────────────────────────────────
const PROD_PER_PAGE = 12;

function ProductsSection({ products, setProducts, onToast, initialFilter = 'all' }) {
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState(initialFilter);
  const [page,      setPage]      = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editBuf,   setEditBuf]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [selected,  setSelected]  = useState(new Set());

  useEffect(() => { if (initialFilter) setFilter(initialFilter); }, [initialFilter]);

  const filtered = useMemo(() => products.filter(p => {
    const q = (search || '').toLowerCase();
    const m = (p.name||'').toLowerCase().includes(q) || (p.brand||'').toLowerCase().includes(q);
    if (!m) return false;
    if (filter === 'offer')    return p.inOffer;
    if (filter === 'hidden')   return !p.visible;
    if (filter === 'nostock')  return p.stock === false;
    if (filter === 'lowstock') return p.lowStock === true;
    if (filter === 'ton')      return p.hasTon;
    // filtro por categoría
    const CATS = ['rostro','labios','ojos','uñas','piel'];
    if (CATS.includes(filter)) return (p.category||'').toLowerCase() === filter;
    return true;
  }), [products, search, filter]);

  const totalPages = Math.ceil(filtered.length / PROD_PER_PAGE);
  const paginated  = filtered.slice((page-1)*PROD_PER_PAGE, page*PROD_PER_PAGE);
  const resetPage  = v => { setFilter(v); setPage(1); };
  const startEdit  = p => { setEditingId(p.id); setEditBuf({...p}); };
  const cancelEdit = () => { setEditingId(null); setEditBuf(null); };

  // ── Guardar → Firebase ──────────────────────────────────
  const saveEdit = async () => {
    setSaving(true);
    try {
      const fbId = editBuf.firebaseId || editBuf.id;
      if (fbId && typeof fbId === 'string') {
        const { id, firebaseId, ...fields } = editBuf;
        await patchProduct(fbId, fields);
        setProducts(prev => prev.map(p => p.id === editingId ? { ...editBuf } : p));
      } else {
        const { id, ...fields } = editBuf;
        const newFbId = await createProduct(fields);
        setProducts(prev => prev.map(p => p.id === editingId ? { ...editBuf, id: newFbId, firebaseId: newFbId } : p));
      }
      onToast('✅ Guardado en Firebase — visible en tienda al instante');
    } catch (err) {
      console.error(err); onToast('❌ Error al guardar', 'error');
    } finally { setSaving(false); cancelEdit(); }
  };

  // ── Toggle rápido → Firebase ─────────────────────────────
  const quickToggle = async (p, key) => {
    const newVal = !p[key];
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, [key]: newVal } : x));
    const fbId = p.firebaseId || p.id;
    if (fbId && typeof fbId === 'string') {
      try { await patchProduct(fbId, { [key]: newVal }); }
      catch (err) {
        console.error(err);
        setProducts(prev => prev.map(x => x.id === p.id ? { ...x, [key]: !newVal } : x));
        onToast('❌ Error al actualizar', 'error');
      }
    }
  };

  // ── Eliminar → Firebase ──────────────────────────────────
  const removeProduct = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.name}"?`)) return;
    setProducts(prev => prev.filter(x => x.id !== p.id));
    const fbId = p.firebaseId || p.id;
    if (fbId && typeof fbId === 'string') {
      try { await deleteProductFromFirebase(fbId); }
      catch (err) { console.error(err); onToast('❌ Error al eliminar', 'error'); }
    }
  };

  const removeSelected = async () => {
    if (!window.confirm(`¿Eliminar ${selected.size} productos?`)) return;
    const toRemove = products.filter(p => selected.has(p.id));
    setProducts(prev => prev.filter(p => !selected.has(p.id)));
    setSelected(new Set());
    for (const p of toRemove) {
      const fbId = p.firebaseId || p.id;
      if (fbId && typeof fbId === 'string') {
        try { await deleteProductFromFirebase(fbId); } catch(e) { console.error(e); }
      }
    }
  };

  const addProduct = () => {
    const np = {
      id: Date.now(), brand: 'NUEVA MARCA', name: 'Nuevo producto', price: 0,
      image: '', images: [], stock: true, inOffer: false, offerPrice: null,
      hasTon: false, tonValue: '', visible: true, lowStock: false,
      description: '', rating: 4.5, reviews: 0, category: 'rostro',
    };
    setProducts(prev => [np, ...prev]);
    startEdit(np); setPage(1);
  };

  const toggleSelect = id => setSelected(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  const selectAll    = () => setSelected(new Set(paginated.map(p=>p.id)));
  const selectNone   = () => setSelected(new Set());

  const FILTERS = [
    ['all',      'Todos',      products.length],
    ['rostro',   'Rostro',     products.filter(p=>p.category==='rostro').length],
    ['labios',   'Labios',     products.filter(p=>p.category==='labios').length],
    ['ojos',     'Ojos',       products.filter(p=>p.category==='ojos').length],
    ['uñas',     'Uñas',       products.filter(p=>p.category==='uñas').length],
    ['piel',     'Piel',       products.filter(p=>p.category==='piel').length],
    ['offer',    'En oferta',  products.filter(p=>p.inOffer).length],
    ['nostock',  'Sin stock',  products.filter(p=>p.stock===false).length],
    ['lowstock', 'Poco stock', products.filter(p=>p.lowStock===true).length],
    ['hidden',   'Ocultos',    products.filter(p=>!p.visible).length],
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input className={`${S.input} pl-8 w-64`} placeholder="Buscar producto o marca..."
            value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }}/>
        </div>
        <button onClick={addProduct} className={`${S.btn} ${S.btnPrimary} text-xs`}><Plus size={13}/> Nuevo producto</button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(([v,l,count]) => (
          <button key={v} onClick={()=>resetPage(v)}
            className={`${S.btn} text-xs ${filter===v ? S.btnPrimary : S.btnGhost}`}>
            {l}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter===v?'bg-white/20':'bg-pink-50 text-pink-400'}`}>{count}</span>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400">{filtered.length} resultado{filtered.length!==1?'s':''} · pág {page}/{totalPages||1}</p>

      {/* Bulk delete */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="text-sm font-semibold text-red-600">{selected.size} seleccionado{selected.size!==1?'s':''}</span>
          <div className="flex gap-2">
            <button onClick={selectNone} className={`${S.btn} ${S.btnGhost} text-xs`}><X size={12}/> Deseleccionar</button>
            <button onClick={removeSelected} className={`${S.btn} text-xs bg-red-500 text-white hover:bg-red-600`}><Trash2 size={12}/> Eliminar {selected.size}</button>
          </div>
        </div>
      )}

      {selected.size === 0 && paginated.length > 0 && (
        <button onClick={selectAll} className="text-xs text-[#D2006E] hover:underline text-left">
          Seleccionar todos ({paginated.length})
        </button>
      )}

      {/* Lista */}
      <div className="space-y-2">
        {paginated.map(p => (
          <div key={p.id} className={`${S.card} ${!p.visible?'opacity-50':''}`}>
            {editingId === p.id && editBuf ? (
              /* ── FORMULARIO DE EDICIÓN ── */
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-sm font-bold text-[#D2006E] truncate mr-4">✏️ {editBuf.name}</p>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={saveEdit} disabled={saving} className={`${S.btn} ${S.btnPrimary} text-xs ${saving?'opacity-60 pointer-events-none':''}`}>
                      {saving ? <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : <Save size={13}/>}
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button onClick={cancelEdit} className={`${S.btn} ${S.btnGhost} text-xs`}><X size={13}/> Cancelar</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Field label="Marca">
                    <input className={S.input} value={editBuf.brand||''} onChange={e=>setEditBuf(b=>({...b,brand:e.target.value}))}/>
                  </Field>
                  <Field label="Nombre">
                    <input className={S.input} value={editBuf.name||''} onChange={e=>setEditBuf(b=>({...b,name:e.target.value}))}/>
                  </Field>
                  <Field label="Categoría">
                    <select className={S.input} value={editBuf.category||'rostro'} onChange={e=>setEditBuf(b=>({...b,category:e.target.value}))}>
                      <option value="rostro">Rostro</option>
                      <option value="labios">Labios</option>
                      <option value="ojos">Ojos</option>
                      <option value="uñas">Uñas</option>
                      <option value="piel">Piel</option>
                      <option value="otro">Otro</option>
                    </select>
                  </Field>
                </div>

                {/* Precio con descuento en tiempo real */}
                <div className="bg-pink-50 rounded-xl p-4 space-y-3 border border-pink-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag size={14} className="text-[#D2006E]"/>
                    <span className="text-xs font-bold text-[#D2006E] tracking-widest uppercase">Precio</span>
                    {editBuf.inOffer && <DiscountBadge price={editBuf.price} offerPrice={editBuf.offerPrice} />}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Precio normal USD">
                      <NumericInput value={editBuf.price} onChange={v=>setEditBuf(b=>({...b,price:v}))} placeholder="0.00"/>
                    </Field>
                    {editBuf.inOffer && (
                      <Field label="Precio de oferta USD">
                        <NumericInput value={editBuf.offerPrice||0} onChange={v=>setEditBuf(b=>({...b,offerPrice:v}))} placeholder="0.00"/>
                      </Field>
                    )}
                  </div>
                  {editBuf.inOffer && editBuf.offerPrice > 0 && editBuf.price > 0 && (
                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-pink-200">
                      <Percent size={13} className="text-[#D2006E]"/>
                      <span className="text-sm font-bold text-[#D2006E]">
                        -{Math.round((1 - Number(editBuf.offerPrice)/Number(editBuf.price))*100)}% descuento
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        Ahorro: ${(Number(editBuf.price)-Number(editBuf.offerPrice)).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <Field label="Descripción">
                  <textarea className={`${S.input} resize-none`} rows={2} value={editBuf.description||''}
                    placeholder="Descripción breve del producto..."
                    onChange={e=>setEditBuf(b=>({...b,description:e.target.value}))}/>
                </Field>

                <Field label="Imagen principal">
                  <div className="flex gap-2">
                    <input className={`${S.input} flex-1`} placeholder="https://..."
                      value={editBuf.image||''} onChange={e=>setEditBuf(b=>({...b,image:e.target.value}))}/>
                    <label className={`${S.btn} ${S.btnGhost} text-xs cursor-pointer flex-shrink-0`}>
                      <Upload size={13}/> Subir
                      <input type="file" accept="image/*" className="hidden" onChange={async e=>{
                        const f=e.target.files[0]; if(!f) return;
                        try { const url=await uploadToCloudinary(f); setEditBuf(b=>({...b,image:url,images:[url,...(b.images||[]).filter(x=>x!==b.image)]})); }
                        catch { onToast('❌ Error al subir imagen','error'); }
                        e.target.value='';
                      }}/>
                    </label>
                  </div>
                  {editBuf.image && <div className="mt-2 w-20 h-28 rounded-xl overflow-hidden bg-pink-50 border border-pink-100"><img src={editBuf.image} className="w-full h-full object-cover" alt=""/></div>}
                </Field>

                <Field label="Imágenes adicionales (URLs separadas por coma)">
                  <input className={S.input} placeholder="url1, url2, url3"
                    value={(editBuf.images||[]).join(', ')}
                    onChange={e=>setEditBuf(b=>({...b,images:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}))}/>
                </Field>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-pink-50 rounded-xl p-4 border border-pink-100">
                  <Toggle value={editBuf.visible}    onChange={v=>setEditBuf(b=>({...b,visible:v}))}    label="Visible"/>
                  <Toggle value={editBuf.stock}      onChange={v=>setEditBuf(b=>({...b,stock:v}))}      label="En stock"/>
                  <Toggle value={editBuf.inOffer}    onChange={v=>setEditBuf(b=>({...b,inOffer:v}))}    label="En oferta"/>
                  <Toggle value={editBuf.hasTon}     onChange={v=>setEditBuf(b=>({...b,hasTon:v}))}     label="Tiene tono"/>
                  <Toggle value={!!editBuf.lowStock} onChange={v=>setEditBuf(b=>({...b,lowStock:v}))}   label="Poco stock"/>
                </div>

                {editBuf.hasTon && (
                  <Field label="Tono / variante (ej: Coral 03, Ruby Woo)">
                    <input className={S.input} value={editBuf.tonValue||''} onChange={e=>setEditBuf(b=>({...b,tonValue:e.target.value}))}/>
                  </Field>
                )}
              </div>

            ) : (
              /* ── FILA COMPACTA ── */
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={selected.has(p.id)} onChange={()=>toggleSelect(p.id)}
                  onClick={e=>e.stopPropagation()} className="w-4 h-4 rounded accent-[#D2006E] flex-shrink-0 cursor-pointer"/>
                <div className="w-10 h-14 rounded-xl overflow-hidden bg-pink-50 flex-shrink-0 border border-pink-100">
                  {p.image
                    ? <img src={p.image} className="w-full h-full object-cover" alt=""/>
                    : <div className="w-full h-full flex items-center justify-center"><Package size={14} className="text-pink-200"/></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold tracking-widest uppercase text-[#D2006E]/70">{p.brand}</p>
                  <p className="text-[13px] font-semibold text-gray-900 truncate">{p.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {p.inOffer && p.offerPrice
                      ? <>
                          <span className="text-xs font-bold text-[#D2006E]">${Number(p.offerPrice).toFixed(2)}</span>
                          <span className="text-xs text-gray-400 line-through">${Number(p.price).toFixed(2)}</span>
                          <span className="text-[9px] font-bold bg-[#D2006E] text-white px-1.5 py-0.5 rounded-full">
                            -{Math.round((1-Number(p.offerPrice)/Number(p.price))*100)}%
                          </span>
                        </>
                      : <span className="text-xs text-gray-500 font-semibold">${Number(p.price||0).toFixed(2)}</span>}
                    {!p.stock    && <span className="text-[9px] font-bold text-red-400 bg-red-50 px-1.5 py-0.5 rounded-full">Sin stock</span>}
                    {p.lowStock  && <span className="text-[9px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full">Poco stock</span>}
                    {p.hasTon    && <span className="text-[9px] font-bold text-purple-400 bg-purple-50 px-1.5 py-0.5 rounded-full">{p.tonValue||'Ton'}</span>}
                    {p.category  && <span className="text-[9px] text-pink-400 bg-pink-50 px-1.5 py-0.5 rounded-full capitalize">{p.category}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={()=>quickToggle(p,'visible')} title={p.visible?'Ocultar':'Mostrar'}
                    className={`p-1.5 rounded-lg transition-colors ${p.visible?'text-[#D2006E] hover:bg-pink-50':'text-gray-300 hover:bg-gray-50'}`}>
                    {p.visible?<Eye size={15}/>:<EyeOff size={15}/>}
                  </button>
                  <button onClick={()=>quickToggle(p,'stock')} title={p.stock!==false?'Marcar sin stock':'Marcar en stock'}
                    className={`p-1.5 rounded-lg transition-colors text-xs ${p.stock!==false?'text-green-400 hover:bg-green-50':'text-red-300 hover:bg-red-50'}`}>
                    {p.stock!==false?'●':'○'}
                  </button>
                  <button onClick={()=>startEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#D2006E] hover:bg-pink-50 transition-colors"><Edit2 size={15}/></button>
                  <button onClick={()=>removeProduct(p)} className={S.btnDanger}><Trash2 size={15}/></button>
                </div>
              </div>
            )}
          </div>
        ))}
        {paginated.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Package size={32} className="mx-auto mb-3 opacity-20"/>
            <p className="text-sm">No hay productos{search ? ' con esa búsqueda' : ''}.</p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
            className="w-8 h-8 rounded-full border border-pink-200 flex items-center justify-center hover:border-[#D2006E] disabled:opacity-30 transition-colors">
            <ChevronLeft size={14}/>
          </button>
          {Array.from({length:totalPages},(_,i)=>i+1).map(n=>(
            <button key={n} onClick={()=>setPage(n)}
              className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${n===page?'bg-[#D2006E] text-white':'border border-pink-200 text-gray-600 hover:border-[#D2006E]'}`}>
              {n}
            </button>
          ))}
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
            className="w-8 h-8 rounded-full border border-pink-200 flex items-center justify-center hover:border-[#D2006E] disabled:opacity-30 transition-colors">
            <ChevronRight size={14}/>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────
function Dashboard({ products, config, onNavigate, onImportMock, onCSVImport, importing, importDone }) {
  const total   = products.length;
  const visible = products.filter(p=>p.visible).length;
  const offers  = products.filter(p=>p.inOffer).length;
  const noStock = products.filter(p=>p.stock===false).length;

  const STATS = [
    { label: 'Total productos', value: total,   bg: 'bg-pink-50',   color: 'text-[#D2006E]' },
    { label: 'Visibles',        value: visible, bg: 'bg-purple-50', color: 'text-purple-600' },
    { label: 'En oferta',       value: offers,  bg: 'bg-rose-50',   color: 'text-rose-500'   },
    { label: 'Sin stock',       value: noStock, bg: 'bg-gray-50',   color: 'text-gray-500'   },
  ];

  const ACCIONES = [
    { label: 'Agregar producto', desc: 'Crear un nuevo producto',        icon: Plus,    tab: 'products',   accent: '#D2006E' },
    { label: 'Editar categorías', desc: 'Ordenar, subir imágenes',       icon: Grid,    tab: 'categories', accent: '#9333ea' },
    { label: 'Ver productos',    desc: 'Listado completo con filtros',    icon: Package, tab: 'products',   accent: '#059669' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Dashboard</h2>
        <p className="text-sm text-gray-400">Bienvenida al panel de GLAM Cosmetick ✨</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(s=>(
          <div key={s.label} className={`rounded-xl p-4 ${s.bg}`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div>
        <p className="text-[11px] font-bold tracking-widest uppercase text-[#D2006E]/70 mb-3">Acciones rápidas</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ACCIONES.map(a=>{ const Icon=a.icon; return (
            <button key={a.tab+a.label} onClick={()=>onNavigate(a.tab)}
              className="group flex items-center gap-4 bg-white border border-pink-100 rounded-xl p-4 hover:border-[#D2006E] hover:shadow-md transition-all text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: a.accent+'18' }}>
                <Icon size={20} style={{ color: a.accent }}/>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{a.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
              </div>
              <ChevronRight size={15} className="ml-auto text-gray-300 group-hover:text-[#D2006E] transition-colors"/>
            </button>
          );})}
        </div>
      </div>

      {/* Importación */}
      <div>
        <p className="text-[11px] font-bold tracking-widest uppercase text-[#D2006E]/70 mb-3">Importar productos</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Mock products */}
          <div className={S.card + ' space-y-3'}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D2006E]/10 flex items-center justify-center flex-shrink-0">
                <Package size={18} className="text-[#D2006E]"/>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Importar catálogo inicial</p>
                <p className="text-xs text-gray-400 leading-relaxed">Sube los {MOCK_PRODUCTS.length} productos de muestra a Firebase. <strong>Una sola vez</strong> para no tener la tienda vacía.</p>
              </div>
            </div>
            {importDone
              ? <p className="text-xs text-green-600 font-semibold flex items-center gap-1.5 bg-green-50 rounded-lg px-3 py-2"><Check size={13}/> Catálogo importado correctamente</p>
              : <button onClick={onImportMock} disabled={importing}
                  className={`${S.btn} ${S.btnPrimary} text-xs w-full justify-center`}>
                  {importing
                    ? <><svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Importando...</>
                    : `Importar ${MOCK_PRODUCTS.length} productos`}
                </button>}
          </div>

          {/* CSV */}
          <div className={S.card + ' space-y-3'}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                <Grid size={18} className="text-[#D2006E]"/>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Importación CSV masiva</p>
                <p className="text-xs text-gray-400">Columnas: <code className="bg-pink-50 px-1 rounded text-[#D2006E]">brand, name, price, category, image, stock</code></p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href="data:text/csv;charset=utf-8,brand,name,price,category,image,stock%0AMAYBELLINE,Base Fit Me,18.00,rostro,,true"
                download="plantilla_glam.csv" className={`${S.btn} ${S.btnGhost} text-xs`}>↓ Plantilla CSV</a>
              <label className={`${S.btn} ${S.btnPrimary} text-xs cursor-pointer`}>
                ↑ Subir CSV<input type="file" accept=".csv" onChange={onCSVImport} className="hidden"/>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Categorías activas */}
      <div className={S.card}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-gray-900">
            Categorías activas ({config.categories?.filter(c=>c.visible).length}/{config.categories?.length})
          </p>
          <button onClick={()=>onNavigate('categories')} className="text-xs text-[#D2006E] hover:underline font-semibold">Editar →</button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(config.categories||[]).map(c=>(
            <span key={c.id} className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full
              ${c.visible?'bg-[#D2006E]/10 text-[#D2006E]':'bg-gray-100 text-gray-400 line-through'}`}>
              {c.label}
            </span>
          ))}
        </div>
      </div>

      {/* Tip configuración */}
      <div className="flex items-start gap-4 bg-pink-50 border border-pink-200 rounded-xl p-5">
        <Settings size={20} className="text-[#D2006E] flex-shrink-0 mt-0.5"/>
        <div>
          <p className="text-sm font-bold text-gray-800">Configuración avanzada — ⚙ arriba a la derecha</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Hero (slideshow de imágenes o video mp4/webm, subida directa o por URL), CTA final, Editorial, Reels, colores, WhatsApp y sección Nosotros.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN ROOT ────────────────────────────────────────────
const MAIN_TABS = [
  { id: 'dashboard',  label: 'Inicio',     icon: Home    },
  { id: 'products',   label: 'Productos',  icon: Package },
  { id: 'categories', label: 'Categorías', icon: Grid    },
];

export default function Admin() {
  const navigate = useNavigate();

  const [config,       setConfig]       = useState(() => getAdminConfig());
  const [products,     setProducts]     = useState([]);
  const [loadingProds, setLoadingProds] = useState(true);
  const [activeTab,    setActiveTab]    = useState('dashboard');
  const [activeFilter, setActiveFilter] = useState('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast,        setToast]        = useState(null);
  const [dirty,        setDirty]        = useState(false);
  const [importDone,   setImportDone]   = useState(() => !!localStorage.getItem(IMPORT_KEY));
  const [importing,    setImporting]    = useState(false);

  // Suscripción en tiempo real a Firebase
  useEffect(() => {
    const unsub = subscribeProducts(
      data => {
        setProducts(data.map(p => ({ ...p, id: p.id, firebaseId: p.id })));
        setLoadingProds(false);
      },
      () => setLoadingProds(false)
    );
    return unsub;
  }, []);

  const handleChange = useCallback(cfg => { setConfig(cfg); setDirty(true); }, []);

  const handleSave = () => {
    const { products: _, ...cfgClean } = config;
    saveConfig(cfgClean);
    setDirty(false);
    showToast('¡Configuración guardada!');
  };

  const handleReset = () => {
    if (!window.confirm('¿Restaurar configuración visual por defecto?')) return;
    localStorage.removeItem(LS_KEY); setConfig(DEFAULT_CONFIG); setDirty(false);
    showToast('Configuración restaurada al default');
  };

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500);
  };

  const handleNavigate = (tab, filter) => {
    setActiveTab(tab);
    if (filter) setActiveFilter(filter);
  };

  // Importar productos mock a Firebase
  const handleImportMock = async () => {
    if (!window.confirm(`¿Importar ${MOCK_PRODUCTS.length} productos de muestra a Firebase?`)) return;
    setImporting(true);
    try {
      for (const p of MOCK_PRODUCTS) {
        await createProduct({
          brand: p.brand, name: p.name, price: p.price,
          image: p.image, images: p.images || [p.image],
          category: p.category, stock: true, visible: true,
          inOffer: p.inOffer || false, offerPrice: p.offerPrice || null,
          hasTon: false, tonValue: '', lowStock: false,
          description: p.description || '', rating: p.rating || 4.5, reviews: p.reviews || 0,
        });
      }
      setImportDone(true);
      localStorage.setItem(IMPORT_KEY, '1');
      showToast(`✅ ${MOCK_PRODUCTS.length} productos importados a Firebase`);
    } catch (err) {
      console.error(err); showToast('❌ Error al importar. Revisá la consola.', 'error');
    } finally { setImporting(false); }
  };

  // Importar desde CSV
  const handleCSVImport = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const text    = await file.text();
    const lines   = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const existingNames = new Set(products.map(p => p.name?.trim().toLowerCase()));
    let count = 0;
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(',');
      const row  = {};
      headers.forEach((h, idx) => { row[h] = vals[idx]?.trim() || ''; });
      if (!row.name || existingNames.has(row.name.trim().toLowerCase())) continue;
      try {
        await createProduct({
          brand: row.brand||'', name: row.name, price: parseFloat(row.price)||0,
          category: row.category||'rostro', image: row.image||'', images: row.image?[row.image]:[],
          stock: row.stock!=='false', visible: true, inOffer: false, offerPrice: null,
          hasTon: false, tonValue: '', lowStock: false, description: '', rating: 4.5, reviews: 0,
        });
        count++;
      } catch (err) { console.error(err); }
    }
    showToast(`✅ ${count} productos importados desde CSV`);
    e.target.value = '';
  };

  const handleLogout = async () => {
    await signOut(getAuth());
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#FDF4F8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-pink-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>GLAM</span>
            <span className="text-[9px] tracking-[0.3em] uppercase text-[#D2006E] bg-pink-50 px-2.5 py-1 rounded-full font-bold border border-pink-200">Admin</span>
          </div>

          {/* Tabs desktop */}
          <nav className="hidden md:flex gap-1">
            {MAIN_TABS.map(t => { const I = t.icon; return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all
                  ${activeTab === t.id ? 'bg-[#D2006E] text-white shadow-sm' : 'text-gray-600 hover:bg-pink-50 hover:text-[#D2006E]'}`}>
                <I size={13}/>{t.label}
              </button>
            );})}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {dirty && <span className="hidden md:block text-[10px] text-amber-500 font-bold animate-pulse">● Sin guardar</span>}
            <button onClick={() => setSettingsOpen(true)} title="Configuración visual"
              className="p-2.5 rounded-full border border-pink-200 text-gray-500 hover:border-[#D2006E] hover:text-[#D2006E] transition-colors">
              <Settings size={16}/>
            </button>
            <button onClick={handleReset}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full border border-pink-200 text-xs text-gray-500 hover:border-[#D2006E] hover:text-[#D2006E] transition-colors">
              <RefreshCw size={12}/> Restaurar
            </button>
            <button onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all
                ${dirty ? 'bg-[#D2006E] text-white hover:bg-[#E5108A] shadow-md' : 'bg-gray-100 text-gray-400 cursor-default'}`}>
              <Save size={13}/> Guardar
            </button>
            <button onClick={handleLogout} title="Cerrar sesión"
              className="p-2.5 rounded-full border border-pink-200 text-gray-500 hover:border-red-300 hover:text-red-400 transition-colors">
              <LogOut size={15}/>
            </button>
          </div>
        </div>

        {/* Tabs mobile */}
        <div className="md:hidden flex border-t border-pink-50">
          {MAIN_TABS.map(t => { const I = t.icon; return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-[10px] font-bold transition-colors
                ${activeTab === t.id ? 'text-[#D2006E] border-t-2 border-[#D2006E]' : 'text-gray-400'}`}>
              <I size={16}/>{t.label}
            </button>
          );})}
        </div>
      </header>

      {/* ── CONTENIDO ── */}
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {loadingProds && activeTab !== 'dashboard' ? (
          <div className="flex items-center justify-center py-32">
            <svg className="animate-spin w-7 h-7 text-[#D2006E]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard'  && <Dashboard products={products} config={config} onNavigate={handleNavigate} onImportMock={handleImportMock} onCSVImport={handleCSVImport} importing={importing} importDone={importDone}/>}
            {activeTab === 'products'   && <ProductsSection products={products} setProducts={setProducts} onToast={showToast} initialFilter={activeFilter}/>}
            {activeTab === 'categories' && <CategoriesSection config={config} onChange={handleChange}/>}
          </>
        )}
      </main>

      <SettingsDrawer isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} config={config} onChange={handleChange}/>
      {toast && <Toast message={toast.msg} type={toast.type}/>}
    </div>
  );
}