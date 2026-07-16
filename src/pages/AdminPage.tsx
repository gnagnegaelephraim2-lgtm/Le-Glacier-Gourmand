import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import {
  Plus, Edit2, Trash2, LogOut, Upload, X, Check,
  Eye, EyeOff, Search, Loader2, Database, ImageIcon, ChevronDown,
} from 'lucide-react';
import { auth, logout } from '../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { MenuService } from '../services/MenuService';
import { MenuItem, Category } from '../types';

// ─── constants ────────────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  hotDrinks: 'Café Gourmand',
  glaces: 'Nos Glaces',
  sucres: 'Les Sucrés',
  frappes: 'Frappes & Milks',
  sales: 'Les Salés',
};
const CATEGORY_EMOJI: Record<string, string> = {
  hotDrinks: '☕', glaces: '🍦', sucres: '🥞', frappes: '🥛', sales: '🍽️',
};
const ALL_TAGS = ['Best-Seller', 'Sans Gluten', 'Vegan', 'Halal', 'Nouveau', 'Classique', 'Raffiné', 'Signature'];

// ─── empty form ───────────────────────────────────────────────────────────────
const emptyForm = (): Partial<MenuItem> => ({
  title: { fr: '', en: '' },
  description: { fr: '', en: '' },
  price: 'Rs ',
  category: 'glaces',
  subcategory: undefined,
  image: '',
  tags: [],
  available: true,
});

// ─── Login ────────────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a2e20] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🍦</div>
          <h1 className="text-2xl font-serif text-[#1a2e20] font-bold">Le Glacier Gourmand</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Panneau d'administration</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email" required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#c4a55a]"
          />
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Mot de passe" required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#c4a55a]"
          />
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 bg-[#1a2e20] text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#c4a55a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Product Form Modal ───────────────────────────────────────────────────────
function ProductFormModal({
  item, onClose, onSaved,
}: { item: Partial<MenuItem> | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<MenuItem>>(item ?? emptyForm());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(item?.image ?? '');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const isEdit = !!item?.id;

  const setField = (field: string, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  const setTitle = (val: string) =>
    setForm(f => ({ ...f, title: { ...f.title, fr: val } as any }));

  const setDesc = (val: string) =>
    setForm(f => ({ ...f, description: { ...f.description, fr: val } as any }));

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const toggleTag = (tag: string) => {
    const tags = form.tags ?? [];
    setField('tags', tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]);
  };

  const handleSave = async () => {
    if (!(form.title as any)?.fr?.trim()) { setError('Le nom est obligatoire.'); return; }
    if (!form.price?.trim()) { setError('Le prix est obligatoire.'); return; }
    setSaving(true);
    setError('');
    try {
      let imageUrl = form.image ?? '';
      if (imageFile) {
        imageUrl = await MenuService.uploadImage(imageFile, setUploadProgress);
        setUploadProgress(null);
      }
      const toSave: Omit<MenuItem, 'id'> = {
        title: { fr: (form.title as any).fr, en: (form.title as any).en || (form.title as any).fr },
        description: { fr: (form.description as any)?.fr ?? '', en: (form.description as any)?.en ?? '' },
        price: form.price ?? 'Rs 0',
        category: form.category as Category,
        subcategory: form.subcategory as any,
        image: imageUrl,
        tags: form.tags ?? [],
        available: form.available ?? true,
        order: form.order ?? 999,
      };
      await MenuService.save(toSave, isEdit ? item!.id : undefined);
      onSaved();
    } catch (err: any) {
      setError('Erreur : ' + (err.message ?? 'inconnue'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-serif font-bold text-[#1a2e20]">
            {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400"><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Image */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Photo du produit</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative w-full aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-[#c4a55a] transition-colors overflow-hidden"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-300">
                  <ImageIcon size={32} className="mx-auto mb-2" />
                  <p className="text-xs">Cliquez pour ajouter une photo</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload size={24} className="text-white" />
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            {uploadProgress !== null && (
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#c4a55a] transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
          </div>

          {/* Name */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Nom du produit (FR) *</label>
              <input
                value={(form.title as any)?.fr ?? ''}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex : Pistache de Sicile"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#c4a55a]"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Nom (EN)</label>
              <input
                value={(form.title as any)?.en ?? ''}
                onChange={e => setForm(f => ({ ...f, title: { ...f.title, en: e.target.value } as any }))}
                placeholder="Ex : Sicilian Pistachio"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#c4a55a]"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Description (FR)</label>
              <textarea
                value={(form.description as any)?.fr ?? ''}
                onChange={e => setDesc(e.target.value)}
                placeholder="Décrivez le produit..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#c4a55a] resize-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Description (EN)</label>
              <textarea
                value={(form.description as any)?.en ?? ''}
                onChange={e => setForm(f => ({ ...f, description: { ...f.description, en: e.target.value } as any }))}
                placeholder="Describe the product..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#c4a55a] resize-none"
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Prix *</label>
            <input
              value={form.price ?? 'Rs '}
              onChange={e => setField('price', e.target.value)}
              placeholder="Rs 280"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#c4a55a]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Catégorie *</label>
            <div className="relative">
              <select
                value={form.category ?? 'glaces'}
                onChange={e => { setField('category', e.target.value); setField('subcategory', undefined); }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#c4a55a] appearance-none bg-white"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{CATEGORY_EMOJI[key]} {label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Subcategory — only for glaces */}
          {form.category === 'glaces' && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Sous-catégorie</label>
              <div className="relative">
                <select
                  value={form.subcategory ?? ''}
                  onChange={e => setField('subcategory', e.target.value || undefined)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#c4a55a] appearance-none bg-white"
                >
                  <option value="">Artisanale (standard)</option>
                  <option value="artisanales">Artisanale</option>
                  <option value="creations">Création / Coupe</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map(tag => {
                const active = (form.tags ?? []).includes(tag);
                return (
                  <button
                    key={tag} type="button" onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all ${
                      active ? 'bg-[#1a2e20] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {active && <Check size={10} className="inline mr-1" />}{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Available toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
            <div>
              <p className="text-sm font-bold text-[#1a2e20]">Disponible à la vente</p>
              <p className="text-xs text-gray-400">Désactiver pour masquer temporairement</p>
            </div>
            <button
              type="button"
              onClick={() => setField('available', !form.available)}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.available ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.available ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {error && <p className="text-red-500 text-xs bg-red-50 px-4 py-3 rounded-xl">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button
            onClick={handleSave} disabled={saving}
            className="flex-1 py-3 bg-[#1a2e20] text-white rounded-xl text-sm font-bold hover:bg-[#c4a55a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {isEdit ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function AdminDashboard({ user }: { user: User }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [migratedCount, setMigratedCount] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [formItem, setFormItem] = useState<Partial<MenuItem> | null | false>(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const unsub = MenuService.subscribeToAll((all) => {
      setItems(all);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleMigrate = async () => {
    setMigrating(true);
    try {
      const count = await MenuService.migrate();
      setMigratedCount(count);
    } catch (e) {
      console.error(e);
    } finally {
      setMigrating(false);
    }
  };

  const handleToggle = async (item: MenuItem) => {
    await MenuService.toggleAvailable(item.id, !(item.available ?? true));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    setDeleting(id);
    await MenuService.delete(id);
    setDeleting(null);
  };

  const filtered = items.filter(item => {
    const catOk = activeCategory === 'All' || item.category === activeCategory;
    const searchOk = !search || (item.title as any).fr?.toLowerCase().includes(search.toLowerCase());
    return catOk && searchOk;
  });

  const available = items.filter(i => i.available !== false).length;
  const unavailable = items.length - available;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-[#1a2e20] text-white px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍦</span>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-widest">Le Glacier Gourmand</h1>
            <p className="text-[10px] text-white/50 uppercase tracking-wider">Back-office</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-[10px] text-white/50 uppercase tracking-widest">{user.email}</span>
          <button onClick={logout} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Déconnexion">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: 'Produits total', value: items.length, color: 'bg-[#1a2e20] text-white' },
            { label: 'Disponibles', value: available, color: 'bg-green-50 text-green-700' },
            { label: 'Indisponibles', value: unavailable, color: 'bg-red-50 text-red-500' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
              <p className="text-2xl sm:text-3xl font-bold">{s.value}</p>
              <p className="text-[10px] uppercase tracking-wider opacity-70 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Migration banner (if no products yet) */}
        {items.length === 0 && !loading && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-amber-800">Base de données vide</p>
              <p className="text-xs text-amber-600 mt-0.5">Importez les produits existants pour commencer.</p>
            </div>
            <button
              onClick={handleMigrate} disabled={migrating}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {migrating ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
              Importer les produits
            </button>
          </div>
        )}

        {migratedCount !== null && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <Check size={18} className="text-green-600 shrink-0" />
            <p className="text-sm text-green-700 font-medium">{migratedCount} produits importés avec succès.</p>
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#c4a55a]"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {['All', ...Object.keys(CATEGORY_LABELS)].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeCategory === cat ? 'bg-[#1a2e20] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-[#c4a55a]'
                }`}
              >
                {cat === 'All' ? 'Tous' : `${CATEGORY_EMOJI[cat]} ${CATEGORY_LABELS[cat]}`}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 size={32} className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <span className="text-5xl block mb-3">📦</span>
            <p className="text-sm font-bold uppercase tracking-widest">Aucun produit</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => {
              const avail = item.available !== false;
              return (
                <div key={item.id} className={`bg-white rounded-2xl overflow-hidden border transition-all ${avail ? 'border-gray-100' : 'border-red-100 opacity-60'}`}>
                  {/* Image */}
                  <div className="relative aspect-video bg-gray-100">
                    {item.image ? (
                      <img src={item.image} alt={(item.title as any).fr} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <ImageIcon size={32} />
                      </div>
                    )}
                    {/* Available badge */}
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${avail ? 'bg-green-500 text-white' : 'bg-red-400 text-white'}`}>
                      {avail ? 'Disponible' : 'Indisponible'}
                    </div>
                    {/* Category badge */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {CATEGORY_EMOJI[item.category]} {CATEGORY_LABELS[item.category]}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-serif font-bold text-[#1a2e20] text-base leading-tight">{(item.title as any).fr}</h3>
                      <span className="text-[#c4a55a] font-bold text-sm shrink-0 ml-2">{item.price}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-3">{(item.description as any).fr}</p>

                    {/* Tags */}
                    {item.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold">{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleToggle(item)}
                        title={avail ? 'Rendre indisponible' : 'Rendre disponible'}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all ${avail ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                      >
                        {avail ? <Eye size={13} /> : <EyeOff size={13} />}
                        {avail ? 'Disponible' : 'Masqué'}
                      </button>
                      <button
                        onClick={() => setFormItem(item)}
                        className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-[#1a2e20] hover:text-white transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting === item.id}
                        className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-40"
                        title="Supprimer"
                      >
                        {deleting === item.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB — Add product */}
      <button
        onClick={() => setFormItem(emptyForm())}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#c4a55a] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[#1a2e20] transition-colors z-20"
        title="Ajouter un produit"
      >
        <Plus size={24} />
      </button>

      {/* Product form modal */}
      {formItem !== false && (
        <ProductFormModal
          item={formItem}
          onClose={() => setFormItem(false)}
          onSaved={() => setFormItem(false)}
        />
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [user, setUser] = useState<User | null | 'loading'>('loading');

  useEffect(() => {
    return onAuthStateChanged(auth, u => setUser(u));
  }, []);

  if (user === 'loading') {
    return (
      <div className="min-h-screen bg-[#1a2e20] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-white" />
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onLogin={() => {}} />;
  }

  return <AdminDashboard user={user} />;
}
