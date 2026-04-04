import React, { useState, useCallback, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CartDrawer  from './CartDrawer';
import Index       from './index';
import Products    from './Products';
import Checkout    from './checkout';
import Admin       from './Admin';
import AdminLogin  from './Adminlogin';
import { getAuth, onAuthStateChanged } from 'firebase/auth';


// ─── CART PERSISTENCE ─────────────────────────────────────────────────────────
const CART_KEY = 'glam_cart';
function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

// ─── PROTECTED ADMIN ROUTE ────────────────────────────────────────────────────
function ProtectedAdmin({ children }) {
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, user => setStatus(user ? 'ok' : 'no'));
    return unsub;
  }, []);

  if (status === 'loading') return (
    <div className="min-h-screen bg-[#0C0210] flex items-center justify-center">
      <svg className="animate-spin w-6 h-6 text-[#D2006E]" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );
  return status === 'ok' ? children : <Navigate to="/admin/login" replace />;
}

// ─── PAGE TRANSITION ──────────────────────────────────────────────────────────
function PageTransition({ children }) {
  const location = useLocation();
  const [show, setShow]       = useState(true);
  const [current, setCurrent] = useState(children);
  const prev = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname === prev.current) { setCurrent(children); return; }
    setShow(false);
    const t = setTimeout(() => {
      setCurrent(children);
      setShow(true);
      prev.current = location.pathname;
    }, 220);
    return () => clearTimeout(t);
  }, [location.pathname]); // eslint-disable-line

  return (
    <div style={{ opacity: show ? 1 : 0, transition: 'opacity 220ms ease' }}>
      {current}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [cart,        setCart]        = useState(loadCart);
  const [isCartOpen,  setIsCartOpen]  = useState(false);

  // Persistir carrito
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  }, []);

  const updateQuantity = useCallback((id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartProps = {
    cart,
    cartCount,
    onAddToCart: addToCart,
    onOpenCart:  () => setIsCartOpen(true),
  };

  return (
    // BrowserRouter va SOLO aquí — main.jsx no debe tenerlo
    <BrowserRouter>
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />
      <Routes>
        <Route path="/"            element={<PageTransition><Index    {...cartProps} /></PageTransition>} />
        <Route path="/products"    element={<PageTransition><Products {...cartProps} /></PageTransition>} />
        <Route path="/checkout"    element={<PageTransition><Checkout cart={cart} cartCount={cartCount} onOpenCart={() => setIsCartOpen(true)} /></PageTransition>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin"       element={<ProtectedAdmin><Admin /></ProtectedAdmin>} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}