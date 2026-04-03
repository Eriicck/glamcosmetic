import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Search, SlidersHorizontal, X,
  Plus, Minus, ChevronLeft, ChevronRight, Star
} from 'lucide-react';
import { subscribeProducts } from './Firebase';

const ITEMS_PER_PAGE = 16;
const SORT_OPTIONS   = ['Destacados', 'Precio: menor a mayor', 'Precio: mayor a menor', 'Más nuevos'];

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-pink-100">
      <button onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between py-4 text-left">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        {open ? <Minus size={14} className="text-gray-400" /> : <Plus size={14} className="text-gray-400" />}
      </button>
      <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden"><div className="pb-4">{children}</div></div>
      </div>
    </div>
  );
}

function ProductModal({ product, onClose, onAddToCart }) {
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  useEffect(() => { if (product) { setQty(1); setActiveImg(0); } }, [product]);
  if (!product) return null;
  const images = (product.images && product.images.length > 0) ? product.images : [product.image].filter(Boolean);
  const hasOffer = product.inOffer && product.offerPrice && Number(product.offerPrice) < Number(product.price);
  const displayPrice = hasOffer ? product.offerPrice : product.price;
  const pct = hasOffer ? Math.round((1 - Number(product.offerPrice)/Number(product.price))*100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-3xl bg-white rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl max-h-[92dvh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <X size={17} className="text-gray-600" />
        </button>
        <div className="grid md:grid-cols-2">
          <div className="relative bg-[#FDF4F8]" style={{ aspectRatio: '1' }}>
            <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover object-center" />
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{ width: i === activeImg ? '24px' : '6px', background: i === activeImg ? '#D2006E' : 'rgba(210,0,110,0.25)' }} />
                ))}
              </div>
            )}
          </div>
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#D2006E] tracking-widest uppercase">{product.brand}</span>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-2 leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>{product.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className={i < Math.floor(product.rating || 4) ? 'fill-[#D2006E] text-[#D2006E]' : 'fill-gray-200 text-gray-200'} />
                  ))}
                </div>
                <span className="text-xs text-gray-400">({product.reviews || 0})</span>
              </div>
              <div className="flex items-baseline gap-3 mt-4 flex-wrap">
                {hasOffer ? (
                  <>
                    <p className="text-2xl font-bold text-[#D2006E]">${Number(product.offerPrice).toFixed(2)} <span className="text-sm font-normal text-gray-400">USD</span></p>
                    <p className="text-base text-gray-400 line-through">${Number(product.price).toFixed(2)}</p>
                    <span className="text-[10px] font-bold bg-[#D2006E] text-white px-2 py-0.5 rounded-full uppercase">-{pct}%</span>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">${Number(product.price).toFixed(2)} <span className="text-sm font-normal text-gray-400">USD</span></p>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-4 leading-relaxed">{product.description || 'Producto de belleza premium. Calidad garantizada para que luzcas increíble.'}</p>
              {product.hasTon && product.tonValue && (
                <div className="mt-3 inline-flex items-center gap-2 bg-pink-50 text-[#D2006E] text-xs font-semibold px-3 py-1 rounded-full">💄 Tono: {product.tonValue}</div>
              )}
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-pink-200 rounded-lg h-10 overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 text-gray-500 hover:bg-pink-50 h-full transition-colors flex items-center"><Minus size={14} /></button>
                  <span className="w-8 text-center text-sm font-bold">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="px-3 text-gray-500 hover:bg-pink-50 h-full transition-colors flex items-center"><Plus size={14} /></button>
                </div>
                {product.stock !== false
                  ? <span className="text-xs text-green-600 font-semibold">● En stock</span>
                  : <span className="text-xs text-red-400 font-semibold">● Sin stock</span>}
              </div>
              <button disabled={product.stock === false}
                onClick={() => { if (product.stock !== false) { onAddToCart(product, qty); onClose(); } }}
                className={`w-full text-white py-3.5 text-sm font-bold tracking-widest rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 ${product.stock !== false ? 'bg-[#D2006E] hover:bg-[#E5108A]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                <ShoppingCart size={16} strokeWidth={1.5} />
                {product.stock !== false ? 'Agregar al carrito' : 'Sin stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, onAddToCart, onOpenModal }) {
  const hasOffer = product.inOffer && product.offerPrice && Number(product.offerPrice) < Number(product.price);
  const pct = hasOffer ? Math.round((1 - Number(product.offerPrice)/Number(product.price))*100) : 0;
  return (
    <div className="group flex flex-col cursor-pointer" onClick={() => onOpenModal(product)}>
      <div className="relative overflow-hidden rounded-2xl bg-[#FDF4F8] mb-3" style={{ aspectRatio: '3/4' }}>
        {product.image ? (
          <img src={product.image} alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingCart size={32} strokeWidth={1} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {hasOffer && <span className="text-[9px] font-bold bg-[#D2006E] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">-{pct}% OFF</span>}
          {product.lowStock && <span className="text-[9px] font-bold bg-amber-400 text-white px-2 py-0.5 rounded-full uppercase">Poco stock</span>}
          {product.stock === false && <span className="text-[9px] font-bold bg-gray-400 text-white px-2 py-0.5 rounded-full uppercase">Agotado</span>}
        </div>

        {/* Add to cart button on hover */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            disabled={product.stock === false}
            onClick={e => { e.stopPropagation(); if (product.stock !== false) onAddToCart(product, 1); }}
            className={`w-full py-2.5 text-xs font-bold tracking-widest uppercase rounded-xl transition-colors flex items-center justify-center gap-2 ${product.stock !== false ? 'bg-[#D2006E] text-white hover:bg-[#E5108A]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
            <ShoppingCart size={13} /> Agregar
          </button>
        </div>
      </div>
      <div className="px-0.5">
        <p className="text-[10px] font-bold text-[#D2006E] tracking-widest uppercase mb-0.5">{product.brand}</p>
        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-2">{product.name}</p>
        <div className="flex items-center gap-2">
          {hasOffer ? (
            <>
              <span className="text-base font-bold text-[#D2006E]">${Number(product.offerPrice).toFixed(2)}</span>
              <span className="text-sm text-gray-400 line-through">${Number(product.price).toFixed(2)}</span>
            </>
          ) : (
            <span className="text-base font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
          )}
          <span className="text-xs text-gray-400">USD</span>
        </div>
      </div>
    </div>
  );
}

export default function Products({ cartCount = 0, onOpenCart, onAddToCart }) {
  const navigate = useNavigate();
  const [products,         setProducts]         = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [search,           setSearch]           = useState('');
  const [sortBy,           setSortBy]           = useState('Destacados');
  const [filterOpen,       setFilterOpen]       = useState(false);
  const [selectedCats,     setSelectedCats]     = useState([]);
  const [selectedBrands,   setSelectedBrands]   = useState([]);
  const [minPrice,         setMinPrice]         = useState('');
  const [maxPrice,         setMaxPrice]         = useState('');
  const [currentPage,      setCurrentPage]      = useState(1);
  const [selectedProduct,  setSelectedProduct]  = useState(null);

  useEffect(() => {
    const unsub = subscribeProducts(prods => {
      setProducts(prods.filter(p => p.visible !== false));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const ALL_CATS   = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))], [products]);
  const ALL_BRANDS = useMemo(() => [...new Set(products.map(p => p.brand).filter(Boolean))], [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
    }
    if (selectedCats.length)   list = list.filter(p => selectedCats.includes(p.category));
    if (selectedBrands.length) list = list.filter(p => selectedBrands.includes(p.brand));
    if (minPrice !== '') list = list.filter(p => Number(p.price) >= Number(minPrice));
    if (maxPrice !== '') list = list.filter(p => Number(p.price) <= Number(maxPrice));

    switch (sortBy) {
      case 'Precio: menor a mayor': list.sort((a,b) => Number(a.price)-Number(b.price)); break;
      case 'Precio: mayor a menor': list.sort((a,b) => Number(b.price)-Number(a.price)); break;
      default: break;
    }
    return list;
  }, [products, search, sortBy, selectedCats, selectedBrands, minPrice, maxPrice]);

  const totalPages     = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentProducts = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const hasFilters     = selectedCats.length > 0 || selectedBrands.length > 0 || minPrice !== '' || maxPrice !== '';

  const handlePageChange = (p) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCat   = c => { setSelectedCats(s => s.includes(c) ? s.filter(x => x !== c) : [...s, c]); setCurrentPage(1); };
  const toggleBrand = b => { setSelectedBrands(s => s.includes(b) ? s.filter(x => x !== b) : [...s, b]); setCurrentPage(1); };
  const clearFilters = () => { setSelectedCats([]); setSelectedBrands([]); setMinPrice(''); setMaxPrice(''); setCurrentPage(1); };

  const handleAddToCart = useCallback((product, qty = 1) => {
    onAddToCart?.(product, qty);
  }, [onAddToCart]);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap'); *, *::before, *::after { box-sizing: border-box; }`}</style>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-pink-100">
        <div className="flex items-center justify-between px-4 py-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-6 flex-1">
            <nav className="hidden md:flex gap-6 text-sm font-semibold tracking-wide">
              <button onClick={() => navigate('/')} className="hover:text-[#D2006E] transition-colors text-gray-500">Inicio</button>
              <button className="text-[#D2006E] border-b-2 border-[#D2006E] pb-0.5">Productos</button>
              <button onClick={() => navigate('/#nosotros')} className="hover:text-[#D2006E] transition-colors text-gray-500">Nosotros</button>
            </nav>
            <button onClick={() => navigate('/')} className="md:hidden text-sm font-semibold text-gray-400 hover:text-[#D2006E] flex items-center gap-1 transition-colors">
              <ChevronLeft size={15} /> Inicio
            </button>
          </div>
          <button onClick={() => navigate('/')} className="font-bold text-2xl tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>GLAM</button>
          <div className="flex items-center justify-end gap-4 flex-1">
            <button onClick={onOpenCart} className="relative hover:opacity-70 transition-opacity">
              <ShoppingCart size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -bottom-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#D2006E] text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Page header */}
        <div className="mb-8 text-center">
          <p className="text-[#D2006E] text-[10px] tracking-[0.4em] uppercase mb-2 font-semibold">Catálogo</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Todos los <em className="italic font-normal text-[#D2006E]">Productos</em>
          </h2>
        </div>

        {/* Controls */}
        <div className="border-t border-pink-100 pt-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-gray-400 flex-shrink-0">{filtered.length} productos</span>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Buscar..." value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="pl-8 pr-3 py-2 border border-pink-100 rounded-full text-sm focus:outline-none focus:border-[#D2006E] transition-colors w-36 md:w-52" />
              </div>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="border border-pink-100 rounded-full py-2 px-3 text-xs md:text-sm text-gray-700 focus:outline-none cursor-pointer bg-white max-w-[140px] md:max-w-none">
                {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
              <button onClick={() => setFilterOpen(true)}
                className="flex items-center gap-1.5 text-sm font-semibold border border-pink-100 rounded-full py-2 px-3 hover:border-[#D2006E] hover:text-[#D2006E] transition-colors flex-shrink-0">
                <SlidersHorizontal size={14} /> Filtrar {hasFilters && <span className="w-2 h-2 bg-[#D2006E] rounded-full" />}
              </button>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <svg className="animate-spin w-8 h-8 text-[#D2006E]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
        ) : currentProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Search size={40} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm">No hay productos con esos filtros.</p>
            {hasFilters && <button onClick={clearFilters} className="mt-3 text-xs text-[#D2006E] underline underline-offset-2">Limpiar filtros</button>}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 lg:grid-cols-4 md:gap-x-6 md:gap-y-12">
            {currentProducts.map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} onOpenModal={setSelectedProduct} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-20 flex items-center justify-center gap-2 text-sm">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
              className="w-9 h-9 rounded-full border border-pink-100 flex items-center justify-center hover:border-[#D2006E] disabled:opacity-30 transition-colors">
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx-1] > 1) acc.push('…'); acc.push(p); return acc; }, [])
              .map((p, i) => p === '…'
                ? <span key={`e${i}`} className="text-gray-400 px-1">…</span>
                : <button key={p} onClick={() => handlePageChange(p)}
                    className={`w-9 h-9 rounded-full text-sm font-semibold transition-all ${p === currentPage ? 'bg-[#D2006E] text-white' : 'border border-pink-100 text-gray-700 hover:border-[#D2006E]'}`}>
                    {p}
                  </button>
              )}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-full border border-pink-100 flex items-center justify-center hover:border-[#D2006E] disabled:opacity-30 transition-colors">
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </main>

      {/* Filter Drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFilterOpen(false)} />
          <div className="relative ml-auto w-72 bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100">
              <span className="font-bold text-gray-900 text-sm">Filtrar</span>
              <button onClick={() => setFilterOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {ALL_CATS.length > 0 && (
                <Accordion title="Categorías" defaultOpen>
                  <div className="space-y-3 pt-1">
                    {ALL_CATS.map(c => (
                      <label key={c} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={selectedCats.includes(c)} onChange={() => toggleCat(c)}
                          className="w-4 h-4 rounded accent-[#D2006E]" />
                        <span className="text-sm text-gray-600 group-hover:text-[#D2006E] transition-colors capitalize">{c}</span>
                      </label>
                    ))}
                  </div>
                </Accordion>
              )}
              <Accordion title="Precio">
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center border border-pink-100 rounded-lg p-2 flex-1">
                    <span className="text-xs text-gray-400 mr-1">$</span>
                    <input type="number" placeholder="0" value={minPrice} onChange={e => { setMinPrice(e.target.value); setCurrentPage(1); }} className="w-full outline-none text-sm bg-transparent" />
                  </div>
                  <span className="text-gray-400 text-sm">—</span>
                  <div className="flex items-center border border-pink-100 rounded-lg p-2 flex-1">
                    <span className="text-xs text-gray-400 mr-1">$</span>
                    <input type="number" placeholder="999" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setCurrentPage(1); }} className="w-full outline-none text-sm bg-transparent" />
                  </div>
                </div>
              </Accordion>
              {ALL_BRANDS.length > 0 && (
                <Accordion title="Marcas" defaultOpen>
                  <div className="space-y-3 pt-1 max-h-48 overflow-y-auto pr-1">
                    {ALL_BRANDS.map(b => (
                      <label key={b} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)}
                          className="w-4 h-4 rounded accent-[#D2006E]" />
                        <span className="text-sm text-gray-600 group-hover:text-[#D2006E] transition-colors">{b}</span>
                      </label>
                    ))}
                  </div>
                </Accordion>
              )}
            </div>
            <div className="border-t border-pink-100 p-4 space-y-2">
              <button onClick={() => setFilterOpen(false)}
                className="w-full bg-[#D2006E] text-white py-3 text-sm font-bold tracking-widest hover:bg-[#E5108A] transition-colors rounded-xl">
                APLICAR
              </button>
              <button onClick={() => { clearFilters(); setFilterOpen(false); }}
                className="w-full text-sm text-gray-500 py-2 hover:text-[#D2006E] transition-colors">
                Eliminar todo
              </button>
            </div>
          </div>
        </div>
      )}

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />
    </div>
  );
}