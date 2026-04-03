// ─── DATOS GLAM. COSMETICK ─────────────────────────────────────────────────────
// Productos mock para mostrar la web mientras se cargan los reales desde Firebase.
// Cuando hagas la importación real desde el admin, estos se reemplazan.

export const WHATSAPP_NUMBER = '584127398463'; // +58 412 739 8463

const REAL_PRODUCTS = [
  { brand: 'MAYBELLINE', name: 'Labial SuperStay Matte Ink 24H',         price: 12.00, category: 'labios',  image: 'https://images.unsplash.com/photo-1586495777744-4e6232bf6270?w=600&q=80' },
  { brand: 'L\'ORÉAL',   name: 'Base True Match Fluide SPF17',            price: 18.00, category: 'rostro',  image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80' },
  { brand: 'NYX',        name: 'Paleta Sombras Ultimate Brights',         price: 22.00, category: 'ojos',    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80' },
  { brand: 'MAC',        name: 'Labial Matte Ruby Woo',                   price: 28.00, category: 'labios',  image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80' },
  { brand: 'REVLON',     name: 'Colorstay Foundation 24H Normal/Dry',     price: 15.00, category: 'rostro',  image: 'https://images.unsplash.com/photo-1583241475880-083f84372725?w=600&q=80' },
  { brand: 'ESSENCE',    name: 'Máscara de Pestañas Lash Princess',       price:  8.00, category: 'ojos',    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80' },
  { brand: 'CATRICE',    name: 'Polvo Fijador HD Skin',                   price: 10.00, category: 'rostro',  image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80' },
  { brand: 'RIMMEL',     name: 'Esmalte de Uñas 60 Seconds Super Shine',  price:  6.00, category: 'uñas',    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80' },
  { brand: 'MILANI',     name: 'Blush Powder Baked Luminoso',             price: 14.00, category: 'rostro',  image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80' },
  { brand: 'E.L.F.',     name: 'Corrector Poreless Putty Primer',         price:  9.00, category: 'rostro',  image: 'https://images.unsplash.com/photo-1614159366559-20c0c9fdf7e9?w=600&q=80' },
  { brand: 'RUBY ROSE',  name: 'Gloss Labial Plumping Effect',            price:  7.00, category: 'labios',  image: 'https://images.unsplash.com/photo-1586495777744-4e6232bf6270?w=600&q=80' },
  { brand: 'MORPHE',     name: 'Paleta Contorno & Highlight Pro',         price: 35.00, category: 'rostro',  image: 'https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?w=600&q=80' },
];

const EXTRA_IMAGES = [
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
  'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80',
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
  'https://images.unsplash.com/photo-1614159366559-20c0c9fdf7e9?w=600&q=80',
  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80',
];

export const MOCK_PRODUCTS = Array.from({ length: 80 }).map((_, i) => {
  const base = REAL_PRODUCTS[i % REAL_PRODUCTS.length];
  return {
    id:          i + 1,
    brand:       base.brand,
    name:        i < REAL_PRODUCTS.length ? base.name : `${base.name} — Ed. ${i + 1}`,
    price:       i < REAL_PRODUCTS.length ? base.price : base.price + (i % 6),
    category:    base.category,
    image:       i < REAL_PRODUCTS.length ? base.image : EXTRA_IMAGES[i % EXTRA_IMAGES.length],
    images:      [
      i < REAL_PRODUCTS.length ? base.image : EXTRA_IMAGES[i % EXTRA_IMAGES.length],
      EXTRA_IMAGES[(i + 1) % EXTRA_IMAGES.length],
      EXTRA_IMAGES[(i + 2) % EXTRA_IMAGES.length],
    ],
    stock:       true,
    visible:     true,
    inOffer:     i % 7 === 0,
    offerPrice:  i % 7 === 0 ? (base.price * 0.8).toFixed(2) : null,
    lowStock:    i % 11 === 0,
    hasTon:      false,
    tonValue:    '',
    description: '',
    rating:      4 + (i % 2) * 0.5,
    reviews:     8 + (i * 3) % 60,
  };
});