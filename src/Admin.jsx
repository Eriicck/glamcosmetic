/**
 * ADMIN.JSX — Panel de control GLAM Cosmetick
 * - Misma lógica que U.RRIOLA, identidad GLAM
 * - Hero: slideshow de 3 imágenes configurables
 * - Productos en Firebase
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import {
  Settings, Package, Grid, Plus, Trash2,
  Edit2, Save, X, ChevronUp, ChevronDown, Eye, EyeOff,
  Tag, ToggleLeft, ToggleRight, Check, AlertCircle,
  RefreshCw, Home, Search, Layout, LogOut, Upload, Link, Image
} from 'lucide-react';
import { MOCK_PRODUCTS, WHATSAPP_NUMBER } from './data';
import {
  syncProductsToFirebase, patchProduct,
  deleteProduct as deleteProductFromFirebase,
  createProduct, uploadToCloudinary, subscribeProducts
} from './firebase';

// ─── PERSISTENCIA ─────────────────────────────────────────
const LS_KEY = 'glam_admin_config';

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
    slides: [
      { id: 'sl-1', src: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1920&q=85' },
      { id: 'sl-2', src: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1920&q=85' },
      { id: 'sl-3', src: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1920&q=85' },
    ],
    overlayOpacity: 50,
    tagline: 'Beauty · Power',
    title: 'GLAM',
    titleSub: 'Cosmetick',
    subtitle: 'Tu glamour, sin límites',
    slideInterval: 5000,
  },
  cta: {
    type: 'color', src: '', overlayOpacity: 40,
    eyebrow: 'Explorar', title: 'Tu look,',
    titleItalic: 'perfecto.', buttonText: 'Ver productos',
  },
  categories: [
    { id: 'cat-1', label: 'Rostro',   img: 'https://images.unsplash.com/photo-1614159366559-20c0c9fdf7e9?w=800&q=80', visible: true },
    { id: 'cat-2', label: 'Labios',   img: 'https://images.unsplash.com/photo-1586495777744-4e6232bf6270?w=800&q=80', visible: true },
    { id: 'cat-3', label: 'Ojos',     img: 'https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?w=800&q=80', visible: true },
    { id: 'cat-4', label: 'Uñas',     img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80', visible: true },
    { id: 'cat-5', label: 'Piel',     img: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80', visible: true },
  ],
  editorial: [
    { id: 'ed-1', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=80', label: 'Ver todos', tag: 'Nueva Colección', link: '/products' },
    { id: 'ed-2', img: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1200&q=80', label: 'Labios', tag: 'Tendencia', link: '/products' },
    { id: 'ed-3', img: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80', label: 'Comprar ahora', tag: 'Best Seller', link: '/products' },
  ],
  editorialTitle: 'Glam your world',
  editorialEyebrow: 'Editorial',
  reels: [],
  reelsEyebrow: 'Descubrí',
  reelsTitle: 'GLAM en acción',
  general: {
    whatsapp: WHATSAPP_NUMBER,
    brandColor: '#D2006E',
    instagramUrl: '#', facebookUrl: '#',
    aboutTitle: 'Belleza que empodera, glamour que inspira.',
    aboutText: 'En GLAM Cosmetick encontrarás los mejores productos de maquillaje y cuidado personal. Calidad premium, precios accesibles.',
    aboutImage: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80',
  },
};

// ─── ESTILOS ───────────────────────────────────────────────
const S = {
  input:      'w-full border border-pink-100 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#D2006E] bg-white transition-colors',
  label:      'block text-[11px] font-semibold tracking-widest uppercase text-[#D2006E]/70 mb-1',
  card:       'bg-white border border-pink-100 rounded-xl p-5 shadow-sm',
  btn:        'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
  btnPrimary: 'bg-[#D2006E] text-white hover:bg-[#E5108A]',
  btnGhost:   'border border-pink-200 text-[#D2006E] hover:border-[#D2006E]',
  btnDanger:  'text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-1.5 transition-colors',
};

// ─── ATOMS ────────────────────────────────────────────────
function Field({ label, children }) {
  return <div><label className={S.label}>{label}</label>{children}</div>;
}

function Toggle({ value, onChange, label }) {
  return (
    <button onClick={() => onChange(!value)} className={`flex items-center gap-2 transition-colors ${value ? 'text-[#D2006E]' : 'text-gray-400'}`}>
      {value ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
      <span className="text-gray-600 text-xs">{label}</span>
    </button>
  );
}

function Toast({ message, type = 'ok' }) {
  const isErr = type === 'error';
  return (
    <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3 rounded-full shadow-lg text-sm font-medium
      ${isErr ? 'bg-red-500 text-white' : 'bg-[#D2006E] text-white'}`}>
      {isErr ? <AlertCircle size={15} /> : <Check size={15} />}
      {message}
    </div>
  );
}

function NumericInput({ value, onChange, placeholder = '0', step = '0.01', min = '0', className }) {
  const [raw, setRaw] = useState(String(value ?? ''));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setRaw(String(value ?? ''));
  }, [value, focused]);

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

// ─── MEDIA FIELD ──────────────────────────────────────────
function MediaField({ label, value, onSrcChange }) {
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState('url');
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onSrcChange(url);
    } catch (err) {
      alert('Error subiendo archivo: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className={S.label}>{label}</label>}
      <div className="flex gap-2 mb-2">
        {['url', 'upload'].map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${mode === m ? 'bg-[#D2006E] text-white border-[#D2006E]' : 'border-gray-200 text-gray-500 hover:border-[#D2006E]'}`}>
            {m === 'url' ? <><Link size={10} className="inline mr-1" />URL</> : <><Upload size={10} className="inline mr-1" />Subir</>}
          </button>
        ))}
      </div>
      {mode === 'url' ? (
        <input type="url" value={value || ''} onChange={e => onSrcChange(e.target.value)}
          placeholder="https://..." className={S.input} />
      ) : (
        <div>
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="w-full border-2 border-dashed border-pink-200 rounded-lg py-3 text-xs text-gray-400 hover:border-[#D2006E] hover:text-[#D2006E] transition-colors disabled:opacity-50">
            {uploading ? 'Subiendo...' : 'Elegir archivo'}
          </button>
        </div>
      )}
      {value && (
        <div className="mt-2 rounded-lg overflow-hidden border border-pink-100 bg-gray-50">
          <img src={value} alt="" className="w-full h-28 object-cover" onError={e => e.target.style.display='none'} />
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS DRAWER ──────────────────────────────────────
function SettingsDrawer({ isOpen, onClose, config, onChange }) {
  const [tab, setTab] = useState('hero');

  const h = config.hero || {};
  const g = config.general || {};
  const cta = config.cta || {};

  const upHero = (k, v) => onChange('hero', { ...h, [k]: v });
  const upGen  = (k, v) => onChange('general', { ...g, [k]: v });
  const upCta  = (k, v) => onChange('cta', { ...cta, [k]: v });

  const addSlide = () => {
    const slides = [...(h.slides || []), { id: uid(), src: '' }];
    upHero('slides', slides);
  };
  const removeSlide = (id) => upHero('slides', (h.slides || []).filter(s => s.id !== id));
  const updateSlide = (id, src) => upHero('slides', (h.slides || []).map(s => s.id === id ? { ...s, src } : s));

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100">
          <span className="font-semibold text-gray-900">Configuración visual</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors"><X size={18} /></button>
        </div>

        <div className="flex border-b border-pink-100 px-6 gap-4">
          {['hero', 'cta', 'general'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`py-3 text-xs font-semibold tracking-widest uppercase border-b-2 transition-colors ${tab === t ? 'border-[#D2006E] text-[#D2006E]' : 'border-transparent text-gray-400'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {tab === 'hero' && (
            <>
              <Field label="Tagline">
                <input className={S.input} value={h.tagline || ''} onChange={e => upHero('tagline', e.target.value)} />
              </Field>
              <Field label="Título principal">
                <input className={S.input} value={h.title || ''} onChange={e => upHero('title', e.target.value)} />
              </Field>
              <Field label="Subtítulo en cursiva">
                <input className={S.input} value={h.titleSub || ''} onChange={e => upHero('titleSub', e.target.value)} />
              </Field>
              <Field label="Frase hero">
                <input className={S.input} value={h.subtitle || ''} onChange={e => upHero('subtitle', e.target.value)} />
              </Field>
              <Field label={`Opacidad overlay: ${h.overlayOpacity || 50}%`}>
                <input type="range" min="0" max="90" value={h.overlayOpacity || 50}
                  onChange={e => upHero('overlayOpacity', Number(e.target.value))}
                  className="w-full accent-[#D2006E]" />
              </Field>
              <Field label={`Intervalo slides: ${(h.slideInterval || 5000)/1000}s`}>
                <input type="range" min="3000" max="10000" step="500" value={h.slideInterval || 5000}
                  onChange={e => upHero('slideInterval', Number(e.target.value))}
                  className="w-full accent-[#D2006E]" />
              </Field>
              <div>
                <label className={S.label}>Imágenes del slideshow</label>
                <div className="space-y-3">
                  {(h.slides || []).map((slide, i) => (
                    <div key={slide.id} className="bg-pink-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500">Slide {i + 1}</span>
                        <button onClick={() => removeSlide(slide.id)} className={S.btnDanger}><Trash2 size={13} /></button>
                      </div>
                      <MediaField value={slide.src} onSrcChange={src => updateSlide(slide.id, src)} />
                    </div>
                  ))}
                  <button onClick={addSlide}
                    className="w-full border-2 border-dashed border-pink-200 rounded-lg py-2 text-xs text-[#D2006E] hover:border-[#D2006E] transition-colors flex items-center justify-center gap-1">
                    <Plus size={12} /> Agregar slide
                  </button>
                </div>
              </div>
            </>
          )}

          {tab === 'cta' && (
            <>
              <Field label="Eyebrow"><input className={S.input} value={cta.eyebrow||''} onChange={e=>upCta('eyebrow',e.target.value)}/></Field>
              <Field label="Título"><input className={S.input} value={cta.title||''} onChange={e=>upCta('title',e.target.value)}/></Field>
              <Field label="Título cursiva"><input className={S.input} value={cta.titleItalic||''} onChange={e=>upCta('titleItalic',e.target.value)}/></Field>
              <Field label="Texto botón"><input className={S.input} value={cta.buttonText||''} onChange={e=>upCta('buttonText',e.target.value)}/></Field>
              <Field label="Imagen de fondo (opcional)"><MediaField value={cta.src||''} onSrcChange={v=>upCta('src',v)}/></Field>
            </>
          )}

          {tab === 'general' && (
            <>
              <Field label="WhatsApp (solo números)">
                <input className={S.input} value={g.whatsapp||''} onChange={e=>upGen('whatsapp',e.target.value)} />
              </Field>
              <Field label="Instagram URL"><input className={S.input} value={g.instagramUrl||''} onChange={e=>upGen('instagramUrl',e.target.value)}/></Field>
              <Field label="Facebook URL"><input className={S.input} value={g.facebookUrl||''} onChange={e=>upGen('facebookUrl',e.target.value)}/></Field>
              <Field label="Título Nosotros"><input className={S.input} value={g.aboutTitle||''} onChange={e=>upGen('aboutTitle',e.target.value)}/></Field>
              <Field label="Texto Nosotros">
                <textarea className={S.input} rows={3} value={g.aboutText||''} onChange={e=>upGen('aboutText',e.target.value)} />
              </Field>
              <Field label="Imagen Nosotros"><MediaField value={g.aboutImage||''} onSrcChange={v=>upGen('aboutImage',v)}/></Field>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT FORM ─────────────────────────────────────────
function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState(product || {
    brand: '', name: '', price: 0, category: 'rostro',
    image: '', images: [], stock: true, visible: true,
    inOffer: false, offerPrice: null, hasTon: false, tonValue: '',
    lowStock: false, description: '', rating: 4.5, reviews: 0,
  });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      up('image', url);
      if (!form.images || form.images.length === 0) up('images', [url]);
    } catch (err) { alert('Error: ' + err.message); }
    finally { setUploading(false); }
  };

  return (
    <div className={S.card + ' space-y-4'}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">{product ? 'Editar producto' : 'Nuevo producto'}</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-700 transition-colors"><X size={18} /></button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Marca">
          <input className={S.input} value={form.brand} onChange={e => up('brand', e.target.value)} placeholder="MAYBELLINE" />
        </Field>
        <Field label="Categoría">
          <select className={S.input} value={form.category} onChange={e => up('category', e.target.value)}>
            {['rostro','labios','ojos','uñas','piel','otro'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Nombre del producto">
        <input className={S.input} value={form.name} onChange={e => up('name', e.target.value)} placeholder="Labial Matte Ultra..." />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Precio USD">
          <NumericInput value={form.price} onChange={v => up('price', v)} />
        </Field>
        <Field label="Precio oferta">
          <NumericInput value={form.offerPrice || ''} onChange={v => up('offerPrice', v)} />
        </Field>
      </div>

      <Field label="Imagen principal">
        <div className="flex gap-2">
          <input className={S.input} value={form.image} onChange={e => { up('image', e.target.value); up('images', [e.target.value]); }} placeholder="https://..." />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex-shrink-0 px-3 py-2 border border-pink-200 rounded-lg text-xs text-[#D2006E] hover:border-[#D2006E] transition-colors disabled:opacity-50">
            {uploading ? '...' : <Upload size={14} />}
          </button>
        </div>
        {form.image && <img src={form.image} alt="" className="mt-2 w-20 h-20 object-cover rounded-lg border border-pink-100" />}
      </Field>

      <Field label="Descripción">
        <textarea className={S.input} rows={2} value={form.description} onChange={e => up('description', e.target.value)} placeholder="Descripción breve del producto..." />
      </Field>

      <div className="flex flex-wrap gap-4 pt-2">
        <Toggle value={form.stock}    onChange={v => up('stock', v)}    label="En stock" />
        <Toggle value={form.visible}  onChange={v => up('visible', v)}  label="Visible" />
        <Toggle value={form.inOffer}  onChange={v => up('inOffer', v)}  label="En oferta" />
        <Toggle value={form.lowStock} onChange={v => up('lowStock', v)} label="Poco stock" />
        <Toggle value={form.hasTon}   onChange={v => up('hasTon', v)}   label="Tiene tono" />
      </div>

      {form.hasTon && (
        <Field label="Tono/Color"><input className={S.input} value={form.tonValue} onChange={e => up('tonValue', e.target.value)} placeholder="Ej: Coral 03" /></Field>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={() => onSave(form)} className={`${S.btn} ${S.btnPrimary} flex-1`}><Save size={14} /> Guardar</button>
        <button onClick={onCancel} className={`${S.btn} ${S.btnGhost}`}><X size={14} /> Cancelar</button>
      </div>
    </div>
  );
}

// ─── PRODUCTS SECTION ─────────────────────────────────────
function ProductsSection({ products, setProducts, onToast, initialFilter }) {
  const [editing, setEditing]   = useState(null);
  const [adding,  setAdding]    = useState(false);
  const [search,  setSearch]    = useState('');
  const [filter,  setFilter]    = useState(initialFilter || 'all');
  const [saving,  setSaving]    = useState(false);

  useEffect(() => { if (initialFilter) setFilter(initialFilter); }, [initialFilter]);

  const cats = useMemo(() => ['all', ...new Set(products.map(p => p.category).filter(Boolean))], [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (filter !== 'all') list = list.filter(p => p.category === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
    }
    return list;
  }, [products, filter, search]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await patchProduct(editing.id, form);
        setProducts(ps => ps.map(p => p.id === editing.id ? { ...p, ...form } : p));
        onToast('Producto actualizado ✓');
      } else {
        const id = await createProduct(form);
        setProducts(ps => [{ id, ...form }, ...ps]);
        onToast('Producto creado ✓');
      }
      setEditing(null); setAdding(false);
    } catch (err) {
      onToast('Error al guardar: ' + err.message, 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.name}"?`)) return;
    try {
      await deleteProductFromFirebase(p.id);
      setProducts(ps => ps.filter(x => x.id !== p.id));
      onToast('Producto eliminado');
    } catch (err) { onToast('Error: ' + err.message, 'error'); }
  };

  const toggleVis = async (p) => {
    const val = !p.visible;
    await patchProduct(p.id, { visible: val });
    setProducts(ps => ps.map(x => x.id === p.id ? { ...x, visible: val } : x));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {cats.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${filter === c ? 'bg-[#D2006E] text-white' : 'border border-pink-200 text-gray-600 hover:border-[#D2006E] hover:text-[#D2006E]'}`}>
              {c === 'all' ? 'Todos' : c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
              className="pl-8 pr-3 py-2 border border-pink-100 rounded-full text-sm focus:outline-none focus:border-[#D2006E] w-40 transition-colors" />
          </div>
          <button onClick={() => { setAdding(true); setEditing(null); }} className={`${S.btn} ${S.btnPrimary}`}>
            <Plus size={14} /> Nuevo
          </button>
        </div>
      </div>

      {(adding && !editing) && (
        <ProductForm onSave={handleSave} onCancel={() => setAdding(false)} />
      )}

      <div className="space-y-3">
        {filtered.map(p => (
          editing?.id === p.id ? (
            <ProductForm key={p.id} product={p} onSave={handleSave} onCancel={() => setEditing(null)} />
          ) : (
            <div key={p.id} className="bg-white border border-pink-100 rounded-xl p-4 flex items-center gap-4 hover:border-pink-200 transition-colors">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-pink-100">
                {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20}/></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-[#D2006E]/70 tracking-widest uppercase">{p.brand}</p>
                <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold text-gray-800">${Number(p.price).toFixed(2)}</span>
                  {p.inOffer && p.offerPrice && <span className="text-[10px] bg-[#D2006E] text-white px-1.5 py-0.5 rounded-full font-bold">OFERTA</span>}
                  {p.lowStock && <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">Poco stock</span>}
                  <span className={`text-[10px] capitalize px-1.5 py-0.5 rounded-full ${p.category ? 'bg-pink-50 text-pink-500' : ''}`}>{p.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggleVis(p)} title={p.visible ? 'Ocultar' : 'Mostrar'}
                  className={`p-2 rounded-lg transition-colors ${p.visible ? 'text-[#D2006E] hover:bg-pink-50' : 'text-gray-300 hover:bg-gray-50'}`}>
                  {p.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button onClick={() => { setEditing(p); setAdding(false); }} className="p-2 rounded-lg text-gray-400 hover:text-[#D2006E] hover:bg-pink-50 transition-colors"><Edit2 size={15} /></button>
                <button onClick={() => handleDelete(p)} className={S.btnDanger}><Trash2 size={15} /></button>
              </div>
            </div>
          )
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Package size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay productos{search ? ' con esa búsqueda' : ''}.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CATEGORIES SECTION ────────────────────────────────────
function CategoriesSection({ config, onChange }) {
  const cats = config.categories || [];
  const ed   = config.editorial  || [];

  const upCat = (id, field, val) => onChange('categories', cats.map(c => c.id === id ? { ...c, [field]: val } : c));
  const upEd  = (id, field, val) => onChange('editorial',  ed.map(e => e.id === id ? { ...e, [field]: val } : e));
  const addCat = () => onChange('categories', [...cats, { id: uid(), label: 'Nueva', img: '', visible: true }]);
  const addEd  = () => onChange('editorial',  [...ed,  { id: uid(), img: '', label: '', tag: '', link: '/products' }]);
  const delCat = id => onChange('categories', cats.filter(c => c.id !== id));
  const delEd  = id => onChange('editorial',  ed.filter(e => e.id !== id));

  return (
    <div className="space-y-10">
      {/* Categorías */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Categorías</h3>
          <button onClick={addCat} className={`${S.btn} ${S.btnPrimary} text-xs`}><Plus size={12}/> Agregar</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cats.map(cat => (
            <div key={cat.id} className={S.card + ' space-y-3'}>
              <div className="flex items-center justify-between">
                <Toggle value={cat.visible} onChange={v => upCat(cat.id, 'visible', v)} label="Visible" />
                <button onClick={() => delCat(cat.id)} className={S.btnDanger}><Trash2 size={13}/></button>
              </div>
              <Field label="Nombre">
                <input className={S.input} value={cat.label} onChange={e => upCat(cat.id, 'label', e.target.value)} />
              </Field>
              <MediaField label="Imagen" value={cat.img} onSrcChange={v => upCat(cat.id, 'img', v)} />
            </div>
          ))}
        </div>
      </div>

      {/* Editorial */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Editorial / Lookbook</h3>
            <div className="flex gap-3 mt-2">
              <div className="flex-1">
                <label className={S.label}>Eyebrow</label>
                <input className={S.input} value={config.editorialEyebrow||''} onChange={e => onChange('editorialEyebrow', e.target.value)} />
              </div>
              <div className="flex-1">
                <label className={S.label}>Título</label>
                <input className={S.input} value={config.editorialTitle||''} onChange={e => onChange('editorialTitle', e.target.value)} />
              </div>
            </div>
          </div>
          <button onClick={addEd} className={`${S.btn} ${S.btnPrimary} text-xs self-start`}><Plus size={12}/> Agregar</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ed.map(item => (
            <div key={item.id} className={S.card + ' space-y-3'}>
              <div className="flex justify-end">
                <button onClick={() => delEd(item.id)} className={S.btnDanger}><Trash2 size={13}/></button>
              </div>
              <MediaField label="Imagen" value={item.img} onSrcChange={v => upEd(item.id, 'img', v)} />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Label"><input className={S.input} value={item.label} onChange={e=>upEd(item.id,'label',e.target.value)}/></Field>
                <Field label="Tag"><input className={S.input} value={item.tag} onChange={e=>upEd(item.id,'tag',e.target.value)}/></Field>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────
function Dashboard({ products, config, onNavigate, onImportMock, onCSVImport, importing, importDone }) {
  const total    = products.length;
  const visible  = products.filter(p => p.visible).length;
  const offers   = products.filter(p => p.inOffer).length;
  const noStock  = products.filter(p => p.stock === false).length;

  const stats = [
    { label: 'Total productos', value: total,   color: 'bg-pink-50 text-[#D2006E]' },
    { label: 'Visibles',        value: visible, color: 'bg-purple-50 text-purple-600' },
    { label: 'En oferta',       value: offers,  color: 'bg-rose-50 text-rose-500' },
    { label: 'Sin stock',       value: noStock, color: 'bg-gray-50 text-gray-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Dashboard</h2>
        <p className="text-sm text-gray-500">Resumen de tu tienda GLAM Cosmetick</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color.split(' ')[0]}`}>
            <p className={`text-2xl font-bold ${s.color.split(' ')[1]}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className={S.card}>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Importar productos</h3>
        <div className="flex gap-3 flex-wrap">
          <label className={`${S.btn} border border-pink-200 text-[#D2006E] hover:border-[#D2006E] cursor-pointer`}>
            <Upload size={14}/> Importar CSV
            <input type="file" accept=".csv" className="hidden" onChange={onCSVImport} />
          </label>
        </div>
        <p className="text-xs text-gray-400 mt-2">CSV: columnas name, brand, price, category, image, stock</p>
      </div>

      <div className={S.card}>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Accesos rápidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Agregar producto', icon: Plus, tab: 'products' },
            { label: 'Categorías', icon: Grid, tab: 'categories' },
          ].map(a => (
            <button key={a.label} onClick={() => onNavigate(a.tab)}
              className="flex items-center gap-2 p-4 border border-pink-100 rounded-xl hover:border-[#D2006E] hover:text-[#D2006E] transition-colors text-sm text-gray-600 font-medium">
              <a.icon size={16} /> {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const MAIN_TABS = [
  { id: 'dashboard',  label: 'Dashboard',  icon: Home },
  { id: 'products',   label: 'Productos',  icon: Package },
  { id: 'categories', label: 'Visual',     icon: Grid },
];

// ─── ADMIN PRINCIPAL ───────────────────────────────────────
export default function Admin() {
  const navigate = useNavigate();
  const [config,       setConfig]       = useState(getAdminConfig);
  const [products,     setProducts]     = useState([]);
  const [activeTab,    setActiveTab]    = useState('dashboard');
  const [activeFilter, setActiveFilter] = useState('all');
  const [dirty,        setDirty]        = useState(false);
  const [toast,        setToast]        = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loadingProds, setLoadingProds] = useState(true);
  const [importing,    setImporting]    = useState(false);
  const [importDone,   setImportDone]   = useState(false);

  useEffect(() => {
    const unsub = subscribeProducts(prods => {
      setProducts(prods);
      setLoadingProds(false);
    }, () => setLoadingProds(false));
    return unsub;
  }, []);

  const handleChange = useCallback((key, value) => {
    setConfig(c => ({ ...c, [key]: value }));
    setDirty(true);
  }, []);

  const handleSave = () => {
    const { products: _, ...cfgWithoutProds } = config;
    saveConfig(cfgWithoutProds);
    setDirty(false);
    showToast('¡Configuración guardada!');
  };

  const handleReset = () => {
    if (!window.confirm('¿Restaurar configuración visual por defecto?')) return;
    localStorage.removeItem(LS_KEY); setConfig(DEFAULT_CONFIG); setDirty(false);
    showToast('Configuración restaurada');
  };

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  const handleNavigate = (tab, filter) => {
    setActiveTab(tab);
    if (filter) setActiveFilter(filter);
  };

  const handleCSVImport = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const text = await file.text();
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const existingNames = new Set(products.map(p => p.name?.trim().toLowerCase()));
    let count = 0;
    const { createProduct: cp } = await import('./firebase');
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(',');
      const row  = {};
      headers.forEach((h, idx) => { row[h] = vals[idx]?.trim() || ''; });
      if (!row.name || existingNames.has(row.name.trim().toLowerCase())) continue;
      try {
        await cp({
          brand: row.brand || '', name: row.name, price: parseFloat(row.price) || 0,
          category: row.category || 'rostro', image: row.image || '', images: row.image ? [row.image] : [],
          stock: row.stock !== 'false', visible: true, inOffer: false, offerPrice: null,
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

      <header className="sticky top-0 z-40 bg-white border-b border-pink-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>GLAM</span>
            <span className="text-[9px] tracking-[0.3em] uppercase text-[#D2006E] bg-pink-50 px-2.5 py-1 rounded-full font-semibold">Admin</span>
          </div>
          <nav className="hidden md:flex gap-1">
            {MAIN_TABS.map(t => { const I = t.icon; return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all
                  ${activeTab === t.id ? 'bg-[#D2006E] text-white' : 'text-gray-600 hover:bg-pink-50 hover:text-[#D2006E]'}`}>
                <I size={13} />{t.label}
              </button>
            );})}
          </nav>
          <div className="flex items-center gap-2">
            {dirty && <span className="hidden md:block text-[10px] text-amber-500 font-medium animate-pulse">● Sin guardar</span>}
            <button onClick={() => setSettingsOpen(true)} title="Configuración visual"
              className="p-2.5 rounded-full border border-pink-100 text-gray-500 hover:border-[#D2006E] hover:text-[#D2006E] transition-colors">
              <Settings size={16} />
            </button>
            <button onClick={handleReset}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full border border-pink-100 text-xs text-gray-500 hover:border-[#D2006E] transition-colors">
              <RefreshCw size={12} /> Restaurar
            </button>
            <button onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all
                ${dirty ? 'bg-[#D2006E] text-white hover:bg-[#E5108A] shadow-md' : 'bg-gray-100 text-gray-400 cursor-default'}`}>
              <Save size={13} /> Guardar
            </button>
            <button onClick={handleLogout} title="Cerrar sesión"
              className="p-2.5 rounded-full border border-pink-100 text-gray-500 hover:border-red-300 hover:text-red-400 transition-colors">
              <LogOut size={15} />
            </button>
          </div>
        </div>
        {/* Mobile tabs */}
        <div className="md:hidden flex border-t border-pink-50">
          {MAIN_TABS.map(t => { const I = t.icon; return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex flex-col items-center py-2.5 gap-1 text-[10px] font-medium transition-colors
                ${activeTab === t.id ? 'text-[#D2006E] border-t-2 border-[#D2006E]' : 'text-gray-400'}`}>
              <I size={16} />{t.label}
            </button>
          );})}
        </div>
      </header>

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
            {activeTab === 'dashboard'  && <Dashboard products={products} config={config} onNavigate={handleNavigate} onImportMock={() => {}} onCSVImport={handleCSVImport} importing={importing} importDone={importDone} />}
            {activeTab === 'products'   && <ProductsSection products={products} setProducts={setProducts} onToast={showToast} initialFilter={activeFilter} />}
            {activeTab === 'categories' && <CategoriesSection config={config} onChange={handleChange} />}
          </>
        )}
      </main>

      <SettingsDrawer isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} config={config} onChange={handleChange} />
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}