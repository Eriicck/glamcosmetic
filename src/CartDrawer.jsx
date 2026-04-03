import React, { useEffect } from 'react';
import { X, ShoppingCart, Plus, Minus, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity, onRemove }) {
  const navigate  = useNavigate();
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Bloquear scroll del fondo
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>

      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto flex w-full max-w-md flex-col bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-pink-100 px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-[#D2006E]" strokeWidth={1.5} />
            <h2 className="text-base font-bold text-gray-900">
              Tu carrito <span className="text-[#D2006E]">({cartCount})</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-pink-50 transition-colors"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Barra decorativa */}
        <div className="h-0.5 w-full bg-gradient-to-r from-[#D2006E] via-pink-400 to-purple-500" />

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {cart.length === 0 ? (
            <div className="text-center mt-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mx-auto">
                <ShoppingCart size={28} className="text-pink-200" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-gray-400">Tu carrito está vacío.</p>
              <button
                onClick={onClose}
                className="text-xs text-[#D2006E] underline underline-offset-2 hover:text-pink-700 transition-colors"
              >
                Explorar productos
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 border-b border-pink-50 pb-5">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#FDF4F8] flex-shrink-0 border border-pink-100">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-pink-200"><ShoppingCart size={20} /></div>
                  }
                </div>
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-[#D2006E] tracking-wider uppercase mb-0.5">{item.brand}</p>
                      <h3 className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2">{item.name}</h3>
                    </div>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors p-0.5"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-pink-200 rounded-lg h-8 overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="px-2.5 text-gray-500 hover:text-[#D2006E] hover:bg-pink-50 h-full transition-colors flex items-center"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-bold w-7 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="px-2.5 text-gray-500 hover:text-[#D2006E] hover:bg-pink-50 h-full transition-colors flex items-center"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="font-bold text-gray-900 text-sm">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-pink-100 p-6 space-y-4 bg-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">Subtotal</span>
              <div>
                <span className="text-2xl font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
                <span className="text-sm text-gray-400 ml-1">USD</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-[#D2006E] text-white py-4 text-sm font-bold tracking-[0.2em] uppercase hover:bg-[#E5108A] transition-colors duration-300 rounded-full shadow-lg shadow-[#D2006E]/25 hover:shadow-xl"
            >
              PAGAR
            </button>
            <button
              onClick={onClose}
              className="w-full text-center text-sm text-gray-400 hover:text-[#D2006E] flex items-center justify-center gap-1 transition-colors"
            >
              Seguir comprando <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}