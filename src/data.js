// ─── DATOS GLAM COSMETIC ──────────────────────────────────────────────────────
export const WHATSAPP_NUMBER = '584127398463';

// 20 productos K-Beauty con imágenes reales de alta calidad
// Importar UNA SOLA VEZ desde el Dashboard del Admin.
export const MOCK_PRODUCTS = [

  // ── ROSTRO (5) ────────────────────────────────────────────
  {
    brand: 'ABIB', category: 'rostro',
    name: 'Facial Sunscreen Heartleaf Sun Essence SPF50+ 50ml',
    price: 28.00,
    image: 'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864766907_1.jpg?v=1754507945&width=750',
    images: [
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864766907_1.jpg?v=1754507945&width=750',
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864769229_9bd3ac34-a3c6-4a9a-93d1-ca9acc514897.jpg?v=1756824196&width=750',
    ],
    description: 'Protector solar ligero en formato esencia con heartleaf. Protege y calma la piel sin dejar residuo blanco.',
    rating: 4.8, reviews: 234, inOffer: false,
  },
  {
    brand: 'ABIB', category: 'rostro',
    name: 'Glutathiosome Cream Vita Tube Facial Moisturizer 75ml',
    price: 37.00,
    image: 'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8800280690012_2.jpg?v=1754430312&width=750',
    images: [
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8800280690012_2.jpg?v=1754430312&width=750',
    ],
    description: 'Crema hidratante con glutatión. Regenera, ilumina y corrige manchas con uso continuado.',
    rating: 4.6, reviews: 201, inOffer: false,
  },
  {
    brand: 'ABIB', category: 'rostro',
    name: 'Glutathiosome Dark Spot Pad Vita Touch 60 Pads',
    price: 30.00,
    image: 'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809562558477.jpg?v=1763500472&width=750',
    images: [
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809562558477.jpg?v=1763500472&width=750',
    ],
    description: 'Pads exfoliantes con glutatión para manchas oscuras. Unifica el tono y aporta luminosidad al instante.',
    rating: 4.5, reviews: 167, inOffer: true, offerPrice: 25.00,
  },
  {
    brand: 'ABIB', category: 'rostro',
    name: 'Glutathiosome Dark Spot Serum Vita Drop 50ml',
    price: 28.00,
    image: 'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809562558514.jpg?v=1754430581&width=750',
    images: [
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809562558514.jpg?v=1754430581&width=750',
    ],
    description: 'Sérum despigmentante con glutatión. Reduce manchas y aporta luminosidad profunda.',
    rating: 4.7, reviews: 178, inOffer: false,
  },
  {
    brand: 'ABIB', category: 'rostro',
    name: 'Green LHA Pore Pad Clear Touch 60 Pads',
    price: 30.00,
    image: 'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809562558101.jpg?v=1763823169&width=750',
    images: [
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809562558101.jpg?v=1763823169&width=750',
    ],
    description: 'Pads con LHA verde para poros dilatados. Exfolia suavemente y minimiza los poros visibles.',
    rating: 4.4, reviews: 134, inOffer: false,
  },

  // ── PIEL (4) ──────────────────────────────────────────────
  {
    brand: 'ABIB', category: 'piel',
    name: 'Heartleaf Calming Toner Skin Booster 200ml',
    price: 30.00,
    image: 'https://k-wowcosmetics.myshopify.com/cdn/shop/files/602004106681.jpg?v=1756823646&width=750',
    images: [
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/602004106681.jpg?v=1756823646&width=750',
    ],
    description: 'Tónico calmante con heartleaf. Equilibra el pH, reduce el enrojecimiento y prepara la piel para los siguientes pasos.',
    rating: 4.8, reviews: 345, inOffer: true, offerPrice: 25.00,
  },
  {
    brand: 'ABIB', category: 'piel',
    name: 'Gummy Sheet Mask Heartleaf Sticker',
    price: 4.00,
    image: 'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809750463729_1.jpg?v=1754426696&width=750',
    images: [
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809750463729_1.jpg?v=1754426696&width=750',
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809750463705.jpg?v=1754427869&width=750',
    ],
    description: 'Mascarilla calmante con extracto de heartleaf. Hidratación intensa, piel suave y uniforme al instante.',
    rating: 4.6, reviews: 189, inOffer: false,
  },
  {
    brand: 'ABIB', category: 'piel',
    name: 'Gummy Sheet Mask Madecassoside Sticker',
    price: 4.00,
    image: 'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809750463705.jpg?v=1754427869&width=750',
    images: [
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809750463705.jpg?v=1754427869&width=750',
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809750463729_1.jpg?v=1754426696&width=750',
    ],
    description: 'Mascarilla regeneradora con madecassoside. Repara la piel irritada y aporta luminosidad.',
    rating: 4.7, reviews: 212, inOffer: false,
  },
  {
    brand: 'COSRX', category: 'piel',
    name: 'Advanced Snail 96 Mucin Power Essence 100ml',
    price: 24.00,
    image: 'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864760615_c00cc898-7ec5-4063-9d93-1aa271554777.webp?v=1764265249&width=750',
    images: [
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864760615_c00cc898-7ec5-4063-9d93-1aa271554777.webp?v=1764265249&width=750',
    ],
    description: '96% mucina de caracol. Regenera, hidrata y suaviza la textura de la piel en pocas semanas.',
    rating: 4.9, reviews: 892, inOffer: false,
  },

  // ── OJOS (4) ──────────────────────────────────────────────
  {
    brand: 'CLIO', category: 'ojos',
    name: 'Kill Black Liner Pen Punta Ultrafina 0.1mm',
    price: 16.00,
    image: 'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864768123.jpg?v=1763500029&width=750',
    images: [
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864768123.jpg?v=1763500029&width=750',
    ],
    description: 'Delineador de punta ultrafina para trazos de precisión. Negro intenso, resistente al agua y al sebo.',
    rating: 4.7, reviews: 445, inOffer: false,
  },
  {
    brand: 'ETUDE HOUSE', category: 'ojos',
    name: 'Play Color Eyes Palette Mini Dry Flower 9 Colores',
    price: 20.00,
    image: 'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864753099_ea8d4690-8936-4ca8-bd00-d442b61fe36a.jpg?v=1765287021&width=750',
    images: [
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864753099_ea8d4690-8936-4ca8-bd00-d442b61fe36a.jpg?v=1765287021&width=750',
    ],
    description: 'Paleta de sombras inspirada en flores. 9 tonos complementarios, larga duración y altamente pigmentados.',
    rating: 4.6, reviews: 234, inOffer: true, offerPrice: 16.00,
  },
  {
    brand: 'ABIB', category: 'ojos',
    name: 'Mascara Kill Lash Superproof Black',
    price: 18.00,
    image: 'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864766907_1.jpg?v=1754507945&width=750',
    images: [
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864766907_1.jpg?v=1754507945&width=750',
    ],
    description: 'Máscara resistente al agua con efecto curvador y alargador. Dura todo el día sin correrse.',
    rating: 4.5, reviews: 312, inOffer: false,
  },
  {
    brand: 'INNISFREE', category: 'ojos',
    name: 'Powerproof Pencil Liner 02 Brown',
    price: 12.00,
    image: 'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809292443210_1.jpg?v=1754428520&width=750',
    images: [
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809292443210_1.jpg?v=1754428520&width=750',
    ],
    description: 'Delineador en lápiz de larga duración. Punta suave, trazo preciso y resistente a manchas.',
    rating: 4.2, reviews: 88, inOffer: false,
  },

  // ── LABIOS (4) ────────────────────────────────────────────
  {
    brand: 'INNISFREE', category: 'labios',
    name: 'Dewy Tint Lip Color 05 Brick Rose',
    price: 14.00,
    image: 'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864769229_9bd3ac34-a3c6-4a9a-93d1-ca9acc514897.jpg?v=1756824196&width=750',
    images: [
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864769229_9bd3ac34-a3c6-4a9a-93d1-ca9acc514897.jpg?v=1756824196&width=750',
    ],
    description: 'Tinte labial con acabado hidratante. Color intenso y duradero con textura cómoda todo el día.',
    rating: 4.5, reviews: 143, inOffer: false,
  },
  {
    brand: 'ROMAND', category: 'labios',
    name: 'Juicy Lasting Tint 12 Fig Koshka',
    price: 15.00,
    image: 'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864753099_ea8d4690-8936-4ca8-bd00-d442b61fe36a.jpg?v=1765287021&width=750',
    images: [
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864753099_ea8d4690-8936-4ca8-bd00-d442b61fe36a.jpg?v=1765287021&width=750',
    ],
    description: 'Tinte labial jugoso de larga duración. Pigmento intenso, textura ligera y acabado translúcido.',
    rating: 4.8, reviews: 389, inOffer: true, offerPrice: 12.00,
  },
  {
    brand: 'PERIPERA', category: 'labios',
    name: 'Ink Mood Drop Tint 01 Midnight Garden',
    price: 11.00,
    image: 'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864760615_c00cc898-7ec5-4063-9d93-1aa271554777.webp?v=1764265249&width=750',
    images: [
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864760615_c00cc898-7ec5-4063-9d93-1aa271554777.webp?v=1764265249&width=750',
    ],
    description: 'Tinte en gotas ultra pigmentado. Se difumina fácilmente para un acabado natural y sofisticado.',
    rating: 4.3, reviews: 78, inOffer: false,
  },
  {
    brand: 'ETUDE HOUSE', category: 'labios',
    name: 'Fixing Tint Lip Serum 06 Red',
    price: 13.00,
    image: 'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864768123.jpg?v=1763500029&width=750',
    images: [
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864768123.jpg?v=1763500029&width=750',
    ],
    description: 'Suero labial con pigmento fijador. Hidratación + color que dura hasta 8 horas sin retoque.',
    rating: 4.4, reviews: 97, inOffer: false,
  },

  // ── UÑAS (3) ──────────────────────────────────────────────
  {
    brand: 'MISSHA', category: 'uñas',
    name: 'Nail Color 8 Free Formula 17 Coral Flush',
    price: 9.00,
    image: 'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864769229_9bd3ac34-a3c6-4a9a-93d1-ca9acc514897.jpg?v=1756824196&width=750',
    images: [
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864769229_9bd3ac34-a3c6-4a9a-93d1-ca9acc514897.jpg?v=1756824196&width=750',
    ],
    description: 'Esmalte libre de 8 químicos dañinos. Brillo intenso, color uniforme y fórmula de larga duración.',
    rating: 4.3, reviews: 67, inOffer: false,
  },
  {
    brand: 'INNISFREE', category: 'uñas',
    name: 'Real Color Nail 152 Pink Shimmer',
    price: 8.00,
    image: 'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809292443210_1.jpg?v=1754428520&width=750',
    images: [
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809292443210_1.jpg?v=1754428520&width=750',
    ],
    description: 'Esmalte vegano con partículas shimmer. Color vibrante que dura hasta 7 días sin astillarse.',
    rating: 4.4, reviews: 112, inOffer: true, offerPrice: 6.50,
  },
  {
    brand: 'ETUDE HOUSE', category: 'uñas',
    name: 'Nailpop Nail Color Top Coat Shiny',
    price: 7.00,
    image: 'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864753099_ea8d4690-8936-4ca8-bd00-d442b61fe36a.jpg?v=1765287021&width=750',
    images: [
      'https://k-wowcosmetics.myshopify.com/cdn/shop/files/8809864753099_ea8d4690-8936-4ca8-bd00-d442b61fe36a.jpg?v=1765287021&width=750',
    ],
    description: 'Top coat ultra brillante. Sella el color y protege el esmalte hasta 14 días con máximo brillo.',
    rating: 4.1, reviews: 54, inOffer: false,
  },

].map((p, i) => ({
  ...p,
  id:         i + 1,
  stock:      true,
  visible:    true,
  offerPrice: p.offerPrice ?? null,
  inOffer:    p.inOffer    ?? false,
  hasTon:     false,
  tonValue:   '',
  lowStock:   false,
}));