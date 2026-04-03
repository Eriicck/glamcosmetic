import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const navigate  = useNavigate();
  const auth      = getAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch {
      setError('Credenciales incorrectas. Verificá tu email y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif", height: '100dvh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity:.3; } 50% { opacity:.9; } }
        @keyframes floatY { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        .anim-fade-up { animation: fadeUp .7s ease both; }
        .anim-delay-1 { animation-delay: .15s; }
        .anim-delay-2 { animation-delay: .30s; }
        .anim-delay-3 { animation-delay: .45s; }
        .glam-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.15);
          color: white;
          font-size: 14px;
          padding: 10px 0;
          outline: none;
          transition: border-color .3s;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: .02em;
        }
        .glam-input::placeholder { color: rgba(255,255,255,0.25); }
        .glam-input:focus { border-bottom-color: rgba(210,0,100,0.8); }
      `}</style>

      {/* Panel izquierdo — imagen decorativa */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#08020C]">
        <img
          src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1400&q=85"
          alt="GLAM Cosmetick"
          className="w-full h-full object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08020C]/90 via-[#08020C]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08020C] via-transparent to-[#08020C]/30" />

        {/* Texto decorativo */}
        <div className="absolute bottom-14 left-14">
          <p className="text-[#D2006E]/80 text-[10px] tracking-[0.45em] uppercase mb-4">Panel de administración</p>
          <h2 className="text-white leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="block text-6xl font-bold">GLAM</span>
            <span className="block text-3xl font-normal italic text-[#D2006E] mt-1">Cosmetick</span>
          </h2>
          <p className="text-white/35 text-sm mt-5 max-w-xs leading-relaxed">
            Gestioná tu tienda, productos y pedidos desde un solo lugar.
          </p>
          <div className="mt-8 w-12 h-px bg-gradient-to-r from-[#D2006E] to-transparent" />
        </div>

        {/* Partículas */}
        {[...Array(5)].map((_, i) => (
          <div key={i}
            className="absolute rounded-full bg-[#D2006E]"
            style={{
              width: `${4 + (i % 3) * 3}px`, height: `${4 + (i % 3) * 3}px`,
              left: `${20 + i * 13}%`, top: `${15 + (i % 4) * 18}%`,
              animation: `shimmer ${2.5 + i * .4}s ease-in-out infinite, floatY ${3 + i * .6}s ease-in-out infinite`,
              animationDelay: `${i * .35}s`,
              filter: 'blur(0.5px)',
            }}
          />
        ))}
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 bg-[#0C0210] flex items-center justify-center px-8 py-12 relative overflow-hidden">

        {/* Fondo decorativo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-[#D2006E]/5 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-[#7B006E]/8 blur-3xl" />
        </div>

        <div className="w-full max-w-sm relative z-10">

          {/* Logo */}
          <div className="anim-fade-up text-center mb-14">
            <p className="text-[#D2006E]/70 text-[9px] tracking-[0.5em] uppercase mb-3">Panel Admin</p>
            <h1 className="text-white leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
              <span className="block text-4xl font-bold tracking-widest">GLAM</span>
              <span className="block text-xl italic font-normal text-[#D2006E]">Cosmetick</span>
            </h1>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-[#D2006E]/40" />
              <div className="w-1 h-1 rounded-full bg-[#D2006E]/60" />
              <div className="h-px w-8 bg-[#D2006E]/40" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Email */}
            <div className="anim-fade-up anim-delay-1">
              <label className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#D2006E]/80 block mb-2">
                Email
              </label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com" required
                className="glam-input" autoComplete="email"
              />
            </div>

            {/* Contraseña */}
            <div className="anim-fade-up anim-delay-2">
              <label className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#D2006E]/80 block mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="glam-input pr-8" autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-xs leading-relaxed">{error}</p>
              </div>
            )}

            {/* Submit */}
            <div className="anim-fade-up anim-delay-3 pt-2">
              <button type="submit" disabled={loading}
                className="w-full bg-[#D2006E] text-white py-4 text-[11px] font-bold tracking-[0.3em] uppercase rounded-lg hover:bg-[#E5108A] transition-all duration-300 shadow-lg shadow-[#D2006E]/25 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Ingresando...
                  </span>
                ) : 'Ingresar al panel'}
              </button>
            </div>
          </form>

          <p className="text-center text-white/15 text-[10px] tracking-widest uppercase mt-16">
            GLAM Cosmetick © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}