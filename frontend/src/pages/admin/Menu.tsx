import { useState, useEffect } from 'react';
import type { MenuItem, MenuCategory } from '../../types/restaurant';
import { Card, Button, Input } from '../../components/shared';
import { useAuth } from '../../contexts/AuthContext';
import { getCategories, getMenuItems, saveCategory, saveMenuItem, deleteCategory, deleteMenuItem, getRestaurantByOwnerId } from '../../lib/firestoreService';
import { canAddProduct, getCurrentPlan, getPlanRule, planLimitLabel } from '../../lib/subscriptionPlan';

export default function Menu() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');

  const activePlan = getCurrentPlan();
  const activeRule = getPlanRule(activePlan);

  useEffect(() => {
    if (!user?.id) return;
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const rest = await getRestaurantByOwnerId(user!.id);
      setRestaurant(rest);
      const restaurantId = rest?.id ?? user!.id;
      const [cats, items] = await Promise.all([
        getCategories(restaurantId),
        getMenuItems(restaurantId),
      ]);
      setCategories(cats);
      setMenuItems(items);
    } catch (e: any) {
      console.error('Erro ao carregar dados:', e);
      setLoadError(`Erro ao carregar dados: ${e?.message ?? e}`);
    }
    setLoading(false);
  };

  let filteredItems = menuItems;
  if (selectedCategory) filteredItems = filteredItems.filter(i => i.categoryId === selectedCategory);
  if (searchTerm) filteredItems = filteredItems.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsByCategory = categories
    .map(cat => ({ category: cat, items: filteredItems.filter(i => i.categoryId === cat.id) }))
    .filter(g => g.items.length > 0 || !selectedCategory)
    .sort((a, b) => a.category.order - b.category.order);

  const handleSaveProduct = async (product: MenuItem) => {
    setSaveError('');
    if (!product.id || product.id.startsWith('temp_')) {
      if (!canAddProduct(menuItems.length, activePlan)) {
        alert(`🚫 Limite do plano atingido.\nPlano: ${activeRule.label}\nLimite: ${planLimitLabel(activeRule.maxProducts)} produtos`);
        return;
      }
    }
    try {
      const restaurantId = restaurant?.id ?? user!.id;
      const id = await saveMenuItem(restaurantId, product);
      const saved = { ...product, id, restaurantId };
      setMenuItems(prev => prev.some(i => i.id === id) ? prev.map(i => i.id === id ? saved : i) : [...prev, saved]);
      setEditingProduct(null);
      setIsAddingProduct(false);
    } catch (e: any) {
      setSaveError(`Erro ao salvar produto: ${e?.message ?? e}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteMenuItem(id);
      setMenuItems(prev => prev.filter(i => i.id !== id));
      setDeleteConfirm(null);
    } catch (e: any) {
      setSaveError(`Erro ao deletar produto: ${e?.message ?? e}`);
    }
  };

  const handleSaveCategory = async (category: MenuCategory) => {
    setSaveError('');
    try {
      const restaurantId = restaurant?.id ?? user!.id;
      const id = await saveCategory(restaurantId, category);
      const saved = { ...category, id, restaurantId };
      setCategories(prev => prev.some(c => c.id === id) ? prev.map(c => c.id === id ? saved : c) : [...prev, saved]);
      setEditingCategory(null);
      setIsAddingCategory(false);
    } catch (e: any) {
      setSaveError(`Erro ao salvar categoria: ${e?.message ?? e}`);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (menuItems.some(i => i.categoryId === id)) {
      alert('Mova os produtos desta categoria antes de deletá-la.');
      return;
    }
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (e: any) {
      setSaveError(`Erro ao deletar categoria: ${e?.message ?? e}`);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-[#660000] font-bold text-lg">Carregando cardápio...</p>
    </div>
  );

  if (loadError) return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6 max-w-lg text-center">
        <p className="text-2xl mb-3">⚠️</p>
        <p className="font-bold text-red-700 mb-2">Erro ao carregar dados</p>
        <p className="text-sm text-red-600 mb-4">{loadError}</p>
        <button onClick={loadData} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">
          Tentar novamente
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: '#f8f5ef' }}>
      <div className="bg-white border-b border-gray-200 py-6 px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-1" style={{ color: '#660000' }}>
            📋 Cardápio — {restaurant?.restaurantName ?? '...'}
          </h1>
          <p className="text-gray-500 text-sm">{restaurant?.category} • {restaurant?.city}, {restaurant?.state}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        {saveError && (
          <div className="bg-red-50 border border-red-400 rounded-lg p-4 flex items-start gap-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <div className="flex-1">
              <p className="text-red-700 font-semibold text-sm">{saveError}</p>
            </div>
            <button onClick={() => setSaveError('')} className="text-red-400 hover:text-red-600 font-bold">✕</button>
          </div>
        )}
        {/* Plano */}
        <Card className="border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-gray-700">Plano: <span className="font-bold">{activeRule.icon} {activeRule.label}</span></p>
            <p className="text-gray-700">Produtos: <span className="font-bold">{menuItems.length} / {planLimitLabel(activeRule.maxProducts)}</span></p>
          </div>
        </Card>

        {/* Ações */}
        <div className="flex flex-col md:flex-row gap-3">
          <Input placeholder="🔍 Buscar produto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1" />
          <Button onClick={() => setIsAddingProduct(true)} className="bg-[#660000] hover:bg-[#550000] text-white px-6 py-2 rounded-lg font-semibold">
            + Novo Produto
          </Button>
          <Button onClick={() => setShowCategoryManager(!showCategoryManager)} className="bg-[#8B6F47] hover:bg-[#7A6340] text-white px-6 py-2 rounded-lg font-semibold">
            ⚙️ Categorias
          </Button>
        </div>

        {/* Gerenciador de Categorias */}
        {showCategoryManager && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#660000' }}>Gerenciar Categorias</h3>
              <button onClick={() => setShowCategoryManager(false)} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
            </div>
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {[...categories].sort((a, b) => a.order - b.order).map(cat => (
                <div key={cat.id} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                  <span className="font-semibold text-gray-800">{cat.name}
                    <span className="text-xs text-gray-500 ml-2">({menuItems.filter(i => i.categoryId === cat.id).length} produtos)</span>
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingCategory(cat)} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm">✏️</button>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => setIsAddingCategory(true)} className="w-full bg-[#660000] hover:bg-[#550000] text-white px-4 py-2 rounded-lg font-semibold">
              ➕ Nova Categoria
            </Button>
          </Card>
        )}

        {/* Filtros */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">FILTRAR POR CATEGORIA</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelectedCategory('')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === '' ? 'bg-[#660000] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              Todas ({menuItems.length})
            </button>
            {[...categories].sort((a, b) => a.order - b.order).map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat.id ? 'bg-[#660000] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                {cat.name} ({menuItems.filter(i => i.categoryId === cat.id).length})
              </button>
            ))}
          </div>
        </Card>

        {/* Lista de Produtos */}
        {filteredItems.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">📭 Nenhum produto encontrado</p>
            <Button onClick={() => setIsAddingProduct(true)} className="bg-[#660000] hover:bg-[#550000] text-white px-6 py-2 rounded-lg font-semibold">
              + Adicionar Primeiro Produto
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {itemsByCategory.map(group => (
              <div key={group.category.id}>
                <h2 className="text-xl font-bold mb-4" style={{ color: '#660000' }}>{group.category.name}</h2>
                <div className="grid grid-cols-1 gap-4">
                  {group.items.map(item => (
                    <Card key={item.id} className="flex items-start justify-between p-6">
                      <div className="flex gap-6 flex-1">
                        <div className="text-5xl">{item.image}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          <div className="flex flex-wrap gap-3 mb-2">
                            <div className="text-sm">
                              <span className="font-semibold text-gray-700">Preço:</span>
                              <span className="text-[#660000] font-bold ml-1">R$ {(item.price ?? 0).toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap text-xs">
                            <span className={`px-3 py-1 rounded-full ${item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {item.available ? '✅ Disponível' : '❌ Indisponível'}
                            </span>
                            {item.isOffer && <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold">🎁 Oferta R$ {(item.offerPrice ?? 0).toFixed(2)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => setEditingProduct(item)} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium">✏️ Editar</button>
                        <button onClick={() => setDeleteConfirm(item.id)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium">🗑️ Deletar</button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(editingProduct || isAddingProduct) && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          restaurantId={restaurant?.id ?? user!.id}
          onSave={handleSaveProduct}
          onClose={() => { setEditingProduct(null); setIsAddingProduct(false); }}
        />
      )}
      {(editingCategory || isAddingCategory) && (
        <CategoryFormModal
          category={editingCategory}
          existingCategories={categories}
          onSave={handleSaveCategory}
          onClose={() => { setEditingCategory(null); setIsAddingCategory(false); }}
        />
      )}
      {deleteConfirm && (
        <DeleteConfirmModal onConfirm={() => handleDeleteProduct(deleteConfirm)} onCancel={() => setDeleteConfirm(null)} />
      )}
    </div>
  );
}

function ProductFormModal({ product, categories, restaurantId, onSave, onClose }: {
  product: MenuItem | null;
  categories: MenuCategory[];
  restaurantId: string;
  onSave: (p: MenuItem) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<MenuItem>(product ?? {
    id: `temp_${Date.now()}`,
    restaurantId,
    name: '',
    description: '',
    ingredients: '',
    image: '🍽️',
    categoryId: categories[0]?.id ?? '',
    price: 0,
    available: true,
    allergens: [],
    isOffer: false,
    offerPrice: 0,
  });

  const allergenOptions = ['gluten', 'dairy', 'eggs', 'nuts', 'soy', 'fish', 'shellfish'] as const;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold" style={{ color: '#660000' }}>{product ? '✏️ Editar Produto' : '➕ Novo Produto'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: 'Nome do Produto', key: 'name', placeholder: 'Ex: Pizza Margherita' },
            { label: 'Ingredientes', key: 'ingredients', placeholder: 'Ex: Tomate, queijo, manjericão' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
              <input value={(form as any)[key] ?? ''} onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]" placeholder={placeholder} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
            <textarea value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Emoji/Ícone</label>
            <input value={form.image ?? ''} onChange={e => setForm({ ...form, image: e.target.value.slice(0, 2) })}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000] text-2xl" maxLength={2} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria</label>
            <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]">
              {categories.length === 0 && <option value="">Crie uma categoria primeiro</option>}
              {[...categories].sort((a, b) => a.order - b.order).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Preço (R$)</label>
            <input type="number" step="0.01" min="0" value={form.price ?? 0}
              onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
              placeholder="Ex: 39.90" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="avail" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} className="w-4 h-4" />
            <label htmlFor="avail" className="text-sm font-semibold text-gray-700">✅ Disponível</label>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <input type="checkbox" id="offer" checked={form.isOffer ?? false} onChange={e => setForm({ ...form, isOffer: e.target.checked })} className="w-4 h-4" />
              <label htmlFor="offer" className="text-sm font-semibold text-gray-700">🎁 Em Oferta</label>
            </div>
            {form.isOffer && (
              <input type="number" step="0.01" value={form.offerPrice ?? 0}
                onChange={e => setForm({ ...form, offerPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
                placeholder="Preço promocional" />
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Alérgenos</label>
            <div className="grid grid-cols-2 gap-2">
              {allergenOptions.map(a => (
                <label key={a} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={(form.allergens ?? []).includes(a)}
                    onChange={() => setForm({ ...form, allergens: (form.allergens ?? []).includes(a) ? (form.allergens ?? []).filter(x => x !== a) : [...(form.allergens ?? []), a] })}
                    className="w-4 h-4" />
                  <span className="capitalize">{a}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-gray-100 border-t px-6 py-4 flex gap-3 justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold">Cancelar</button>
          <button onClick={() => onSave(form)} className="px-6 py-2 bg-[#660000] hover:bg-[#550000] text-white rounded-lg font-semibold">
            {product ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryFormModal({ category, existingCategories, onSave, onClose }: {
  category: MenuCategory | null;
  existingCategories: MenuCategory[];
  onSave: (c: MenuCategory) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<MenuCategory>(category ?? { id: `temp_${Date.now()}`, name: '', order: existingCategories.length + 1 });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold" style={{ color: '#660000' }}>{category ? '✏️ Editar' : '➕ Nova'} Categoria</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]" placeholder="Ex: Pizzas Clássicas" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ordem</label>
            <input type="number" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]" min={1} />
          </div>
        </div>
        <div className="bg-gray-100 border-t px-6 py-4 flex gap-3 justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold">Cancelar</button>
          <button onClick={() => onSave(form)} className="px-6 py-2 bg-[#660000] hover:bg-[#550000] text-white rounded-lg font-semibold">
            {category ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Deletar Produto?</h2>
        <p className="text-gray-600 mb-6">Esta ação não pode ser desfeita.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold">Cancelar</button>
          <button onClick={onConfirm} className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold">Deletar</button>
        </div>
      </div>
    </div>
  );
}
