// ─── DATOS GLAM COSMETICK ──────────────────────────────────────────────────────
export const WHATSAPP_NUMBER = '584127398463';

// 20 productos demo — 4 por categoría (rostro, labios, ojos, uñas, piel)
// Todos van a Firebase al importar. El admin los puede eliminar después.
export const MOCK_PRODUCTS = [

  // ── ROSTRO ────────────────────────────────────────────────
  {
    brand: 'MAYBELLINE', category: 'rostro',
    name: 'Base Fit Me Matte + Poreless 120 Classic Ivory',
    price: 18.00, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80'],
    description: 'Base líquida de cobertura media-total. Controla el brillo hasta 24h. Tono 120.',
    rating: 4.5, reviews: 128,
  },
  {
    brand: 'L\'ORÉAL', category: 'rostro',
    name: 'Polvo Infaillible 24H Fresh Wear Powder Foundation',
    price: 22.00, image: 'https://images.unsplash.com/photo-1583241475880-083f84372725?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1583241475880-083f84372725?w=600&q=80'],
    description: 'Polvo compacto con cobertura de base. Larga duración y acabado natural.',
    rating: 4.3, reviews: 86,
  },
  {
    brand: 'REVLON', category: 'rostro',
    name: 'Colorstay Foundation 24H Normal/Dry Skin 150 Buff',
    price: 16.50, image: 'https://images.unsplash.com/photo-1614159366559-20c0c9fdf7e9?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1614159366559-20c0c9fdf7e9?w=600&q=80'],
    description: 'Base de larga duración, resistente al agua. Formulada para pieles normales a secas.',
    rating: 4.2, reviews: 64,
  },
  {
    brand: 'E.L.F.', category: 'rostro',
    name: 'Halo Glow Liquid Filter — Complexion Booster',
    price: 14.00, image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80'],
    description: 'Iluminador líquido para un efecto glow natural. Se mezcla con base o se usa solo.',
    inOffer: true, offerPrice: 11.00,
    rating: 4.7, reviews: 203,
  },

  // ── LABIOS ─────────────────────────────────────────────────
  {
    brand: 'MAC', category: 'labios',
    name: 'Labial Matte Lipstick Ruby Woo (Retro Matte)',
    price: 28.00, image: 'https://images.unsplash.com/photo-1586495777744-4e6232bf6270?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1586495777744-4e6232bf6270?w=600&q=80'],
    description: 'El rojo icónico de MAC. Acabado matte retro, ultra pigmentado, larga duración.',
    rating: 4.9, reviews: 412,
  },
  {
    brand: 'MAYBELLINE', category: 'labios',
    name: 'SuperStay Matte Ink Lip Color 20 Pioneer',
    price: 12.00, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80'],
    description: 'Labial líquido matte de hasta 16h de duración. Transferencia mínima.',
    rating: 4.6, reviews: 289,
  },
  {
    brand: 'NYX', category: 'labios',
    name: 'Soft Matte Lip Cream — Cannes (Pink Beige)',
    price: 10.00, image: 'https://images.unsplash.com/photo-1588514727851-f5e6e86e7e43?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1588514727851-f5e6e86e7e43?w=600&q=80'],
    description: 'Crema labial con acabado matte suave. Hidratante, pigmentado y duradero.',
    inOffer: true, offerPrice: 8.00,
    rating: 4.4, reviews: 156,
  },
  {
    brand: 'RUBY ROSE', category: 'labios',
    name: 'Gloss Labial Plumping Effect — Crystal Pink',
    price: 8.00, image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80'],
    description: 'Gloss con efecto volumizador. Brillo espejo y fórmula hidratante.',
    rating: 4.1, reviews: 73,
  },

  // ── OJOS ───────────────────────────────────────────────────
  {
    brand: 'NYX', category: 'ojos',
    name: 'Paleta Sombras Ultimate Brights — 16 Colores',
    price: 24.00, image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80'],
    description: '16 sombras altamente pigmentadas en tonos vibrantes y neutros. Acabado mate y shimmer.',
    rating: 4.5, reviews: 178,
  },
  {
    brand: 'ESSENCE', category: 'ojos',
    name: 'Lash Princess False Lash Effect Mascara',
    price: 9.00, image: 'https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?w=600&q=80'],
    description: 'Máscara alargadora con efecto pestañas postizas. Fórmula sin grumos.',
    inOffer: true, offerPrice: 7.00,
    rating: 4.7, reviews: 521,
  },
  {
    brand: 'L\'ORÉAL', category: 'ojos',
    name: 'Delineador Infaillible Grip 36H Gel Liner — Black',
    price: 13.00, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80'],
    description: 'Delineador en gel de 36h. Trazo preciso, resistente al agua y al calor.',
    rating: 4.4, reviews: 134,
  },
  {
    brand: 'CATRICE', category: 'ojos',
    name: 'Liquid Metal Longlasting Eyeshadow — 040 Gold',
    price: 11.00, image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80'],
    description: 'Sombra líquida metálica de larga duración. Color intenso con un solo toque.',
    rating: 4.3, reviews: 98,
  },

  // ── UÑAS ───────────────────────────────────────────────────
  {
    brand: 'ESSIE', category: 'uñas',
    name: 'Esmalte Gel Couture — 420 Take The Limo',
    price: 12.00, image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80'],
    description: 'Esmalte de gel de larga duración. Rojo intenso, acabado brillante tipo salón.',
    rating: 4.6, reviews: 167,
  },
  {
    brand: 'OPI', category: 'uñas',
    name: 'Nail Lacquer — Malaga Wine NL L87',
    price: 14.00, image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80'],
    description: 'Esmalte de larga duración con fórmula patentada. Brillo intenso y resistente a astillas.',
    inOffer: true, offerPrice: 11.00,
    rating: 4.8, reviews: 244,
  },
  {
    brand: 'RIMMEL', category: 'uñas',
    name: 'Esmalte 60 Seconds Super Shine — 320 Rapid Ruby',
    price: 7.00, image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80'],
    description: 'Seca en 60 segundos. Formula enriquecida con aceite de argán para uñas sanas.',
    rating: 4.0, reviews: 89,
  },
  {
    brand: 'SALLY HANSEN', category: 'uñas',
    name: 'Miracle Gel Top Coat — Acabado Gel sin lámpara',
    price: 10.00, image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80'],
    description: 'Top coat de acabado gel. Sella el color y aporta brillo espejo hasta 14 días.',
    rating: 4.3, reviews: 112,
  },

  // ── PIEL ───────────────────────────────────────────────────
  {
    brand: 'NEUTROGENA', category: 'piel',
    name: 'Hydro Boost Water Gel — Hidratante Ácido Hialurónico',
    price: 20.00, image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80'],
    description: 'Hidratante en gel ultra-ligero con ácido hialurónico. Absorción inmediata, sin residuo graso.',
    rating: 4.7, reviews: 387,
  },
  {
    brand: 'CETAPHIL', category: 'piel',
    name: 'Moisturizing Cream — Piel Sensible y Seca 250g',
    price: 18.00, image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80'],
    description: 'Crema hidratante para piel sensible y seca. Recomendada por dermatólogos.',
    inOffer: true, offerPrice: 15.00,
    rating: 4.6, reviews: 295,
  },
  {
    brand: 'THE ORDINARY', category: 'piel',
    name: 'Niacinamide 10% + Zinc 1% — Sérum Poros y Brillo',
    price: 9.00, image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80'],
    description: 'Sérum con niacinamida al 10%. Reduce poros, controla el sebo y uniformiza el tono.',
    rating: 4.8, reviews: 634,
  },
  {
    brand: 'CLEAN & CLEAR', category: 'piel',
    name: 'Gel Limpiador Facial Oil-Free — Piel Mixta a Grasa',
    price: 8.00, image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80'],
    description: 'Limpiador en gel libre de aceite. Elimina el exceso de sebo sin resecar.',
    rating: 4.1, reviews: 142,
  },
].map((p, i) => ({
  ...p,
  id: i + 1,
  stock: true,
  visible: true,
  inOffer:    p.inOffer    ?? false,
  offerPrice: p.offerPrice ?? null,
  hasTon:     false,
  tonValue:   '',
  lowStock:   false,
}));