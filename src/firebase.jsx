import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, doc,
  getDocs, addDoc, updateDoc, deleteDoc, getDoc, setDoc,
  query, orderBy, onSnapshot, serverTimestamp, writeBatch
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAqj9YAXJR2AruNsF7r49dH0GTc4Mpeyp4",
  authDomain: "glam-dad3a.firebaseapp.com",
  projectId: "glam-dad3a",
  storageBucket: "glam-dad3a.firebasestorage.app",
  messagingSenderId: "981831391263",
  appId: "1:981831391263:web:c9220da11daaae11381d2a",
  measurementId: "G-W2F56MQXV9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ── PRODUCTOS — lectura única ──────────────────────────────
export async function getProducts() {
  const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── PRODUCTOS — escucha en tiempo real ────────────────────
export function subscribeProducts(onUpdate, onError) {
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  return onSnapshot(q,
    snap => onUpdate(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err  => { console.error('subscribeProducts:', err); onError?.(err); }
  );
}

// ── PRODUCTO — crear ───────────────────────────────────────
export async function createProduct(data) {
  const ref = await addDoc(collection(db, 'products'), {
    ...sanitize(data),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ── PRODUCTO — actualizar ──────────────────────────────────
export async function updateProduct(id, data) {
  await updateDoc(doc(db, 'products', id), {
    ...sanitize(data),
    updatedAt: serverTimestamp(),
  });
}

// ── PRODUCTO — eliminar ────────────────────────────────────
export async function deleteProduct(id) {
  await deleteDoc(doc(db, 'products', id));
}

// ── PRODUCTOS — sincronizar batch ──────────────────────────
export async function syncProductsToFirebase(products) {
  const batch = writeBatch(db);
  const updates = [];
  for (const p of products) {
    const clean = sanitize(p);
    if (p.firebaseId) {
      batch.update(doc(db, 'products', p.firebaseId), { ...clean, updatedAt: serverTimestamp() });
    } else {
      const ref = doc(collection(db, 'products'));
      batch.set(ref, { ...clean, createdAt: serverTimestamp() });
      updates.push({ localId: p.id, ref });
    }
  }
  await batch.commit();
  return products.map(p => {
    if (p.firebaseId) return p;
    const u = updates.find(x => x.localId === p.id);
    return u ? { ...p, firebaseId: u.ref.id } : p;
  });
}

// ── PRODUCTO — patch campos específicos ───────────────────
export async function patchProduct(firebaseId, fields) {
  if (!firebaseId) return;
  await updateDoc(doc(db, 'products', firebaseId), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}

// ── ÓRDENES ────────────────────────────────────────────────
export async function saveOrder({ form, cart, total }) {
  const ref = await addDoc(collection(db, 'orders'), {
    client:    { nombre: form.nombre, apellido: form.apellido, email: form.email || null, telefono: form.telefono || null },
    metodo:    form.metodo,
    direccion: form.metodo === 'shipping'
      ? { direccion: form.direccion, ciudad: form.ciudad, estado: form.estado || null }
      : null,
    notas:     form.notas || null,
    items:     cart.map(i => ({ id: i.id, name: i.name, brand: i.brand, price: i.price, quantity: i.quantity, image: i.image })),
    total,
    status:    'pending',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ── CONFIG VISUAL — guardar en Firebase ────────────────────
// Al guardar desde el Admin, todos los dispositivos ven el cambio.
export async function saveConfigToFirebase(config) {
  try {
    // JSON.parse/stringify elimina undefined que Firestore rechaza
    const clean = JSON.parse(JSON.stringify(config));
    await setDoc(doc(db, 'site_config', 'visual'), {
      ...clean,
      _updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('saveConfigToFirebase:', err);
    throw err;
  }
}

// ── CONFIG VISUAL — leer desde Firebase ───────────────────
// El frontend llama esto al montar para tener la config más reciente.
export async function getConfigFromFirebase() {
  try {
    const snap = await getDoc(doc(db, 'site_config', 'visual'));
    if (!snap.exists()) return null;
    const data = snap.data();
    delete data._updatedAt;
    return data;
  } catch (err) {
    console.error('getConfigFromFirebase:', err);
    return null;
  }
}

// ── CLOUDINARY ─────────────────────────────────────────────
export async function uploadToCloudinary(file) {
  const isVideo = file.type.startsWith('video/');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'urriola_uploads'); // ← reemplazar por el de GLAM
  const endpoint  = isVideo ? 'video' : 'image';
  const cloudName = 'dls6empbg'; // ← reemplazar por el cloud name de GLAM
  const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${endpoint}/upload`, { method: 'POST', body: formData });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.secure_url;
}

export const uploadImage = uploadToCloudinary;

// ── AUTH ───────────────────────────────────────────────────
import { getAuth } from 'firebase/auth';
export { getAuth };

// ── HELPERS ────────────────────────────────────────────────
function sanitize(p) {
  const { id, firebaseId, createdAt, ...rest } = p;
  const clean = {};
  for (const [k, v] of Object.entries(rest)) {
    clean[k] = v === undefined ? null : v;
  }
  return clean;
}