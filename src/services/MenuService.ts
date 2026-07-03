import {
  collection, doc, setDoc, getDocs, deleteDoc,
  onSnapshot, serverTimestamp, addDoc, updateDoc, query, orderBy
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { MenuItem } from '../types';
import { MENU_ITEMS as STATIC_ITEMS } from '../data';

const COL = 'menuItems';

export const MenuService = {
  subscribeToAll(callback: (items: MenuItem[]) => void) {
    const q = query(collection(db, COL), orderBy('order', 'asc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ ...d.data(), id: d.id } as MenuItem)));
    }, () => callback([]));
  },

  subscribeToAvailable(callback: (items: MenuItem[]) => void) {
    const q = query(collection(db, COL), orderBy('order', 'asc'));
    return onSnapshot(q, (snap) => {
      const items = snap.docs
        .map(d => ({ ...d.data(), id: d.id } as MenuItem))
        .filter(i => i.available !== false);
      callback(items);
    }, () => callback([]));
  },

  async save(item: Omit<MenuItem, 'id'>, id?: string): Promise<string> {
    const data = { ...item, updatedAt: serverTimestamp() };
    if (id) {
      await updateDoc(doc(db, COL, id), data);
      return id;
    }
    const snap = await getDocs(collection(db, COL));
    const newData = { ...data, order: snap.size, createdAt: serverTimestamp() };
    const ref2 = await addDoc(collection(db, COL), newData);
    return ref2.id;
  },

  async delete(id: string) {
    await deleteDoc(doc(db, COL, id));
  },

  async toggleAvailable(id: string, available: boolean) {
    await updateDoc(doc(db, COL, id), { available, updatedAt: serverTimestamp() });
  },

  async migrate() {
    const snap = await getDocs(collection(db, COL));
    if (!snap.empty) return 0;
    for (let i = 0; i < STATIC_ITEMS.length; i++) {
      const item = STATIC_ITEMS[i];
      await setDoc(doc(db, COL, item.id), {
        ...item,
        available: true,
        order: i,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return STATIC_ITEMS.length;
  },

  async uploadImage(file: File, onProgress?: (p: number) => void): Promise<string> {
    const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
    const task = uploadBytesResumable(storageRef, file);
    return new Promise((resolve, reject) => {
      task.on('state_changed',
        (snap) => onProgress?.(snap.bytesTransferred / snap.totalBytes * 100),
        reject,
        async () => resolve(await getDownloadURL(task.snapshot.ref))
      );
    });
  },
};
