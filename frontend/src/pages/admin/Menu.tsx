import { useState, useEffect } from 'react';
import type { MenuItem, MenuCategory } from '../../types/restaurant';
import { Card, Button, Input } from '../../components/shared';
import { useAuth } from '../../contexts/AuthContext';
import { mockMenuItems, mockCategories } from '../../lib/mockMenu';
import { mockRestaurants } from '../../lib/mockRestaurants';

export default function Menu() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // Carregar dados do localStorage ou usar mock data
  useEffect(() => {
    const menuStorageKey = `menu_items_${user?.restaurantId}`;
    const categoryStorageKey = `menu_categories_${user?.restaurantId}`;
    
    // Carregar itens
    const storedItems = localStorage.getItem(menuStorageKey);
    if (storedItems) {
      setMenuItems(JSON.parse(storedItems));
    } else {
      const restaurantItems = mockMenuItems.filter(
        item => item.restaurantId === user?.restaurantId
      );
      setMenuItems(restaurantItems);
    }
    
    // Carregar categorias
    const storedCategories = localStorage.getItem(categoryStorageKey);
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    } else {
      const restaurantCategories = mockCategories.filter(
        cat => cat.restaurantId === user?.restaurantId
      );
      setCategories(restaurantCategories);
    }
  }, [user?.restaurantId]);

  // Salvar produtos no localStorage
  const saveMenuToLocalStorage = (items: MenuItem[]) => {
    if (user?.restaurantId) {
      const storageKey = `menu_items_${user.restaurantId}`;
      localStorage.setItem(storageKey, JSON.stringify(items));
    }
  };

  // Salvar categorias no localStorage
  const saveCategoriesToLocalStorage = (cats: MenuCategory[]) => {
    if (user?.restaurantId) {
      const storageKey = `menu_categories_${user.restaurantId}`;
      localStorage.setItem(storageKey, JSON.stringify(cats));
    }
  };
  
  // Obter dados do restaurante
  const restaurant = mockRestaurants.find(r => r.id === user?.restaurantId);
  
  // Filtrar itens do cardápio para este restaurante
  let filteredItems = menuItems.filter(
    item => item.restaurantId === user?.restaurantId
  );
  
  // Filtrar por categoria se selecionada
  if (selectedCategory) {
    filteredItems = filteredItems.filter(item => item.categoryId === selectedCategory);
  }
  
  // Filtrar por busca
  if (searchTerm) {
    filteredItems = filteredItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Agrupar itens por categoria
  const itemsByCategory = categories
    .map(category => ({
      category,
      items: filteredItems.filter(item => item.categoryId === category.id)
    }))
    .filter(group => group.items.length > 0 || !selectedCategory)
    .sort((a, b) => a.category.order - b.category.order);

  // Funções de CRUD - PRODUTOS
  const handleSaveProduct = (product: MenuItem) => {
    let updated: MenuItem[];
    
    if (editingProduct) {
      updated = menuItems.map(item => item.id === product.id ? product : item);
    } else {
      updated = [...menuItems, { ...product, id: `item_${Date.now()}`, restaurantId: user?.restaurantId || '' }];
    }
    
    setMenuItems(updated);
    saveMenuToLocalStorage(updated);
    setEditingProduct(null);
    setIsAddingProduct(false);
  };

  const handleDeleteProduct = (id: string) => {
    const updated = menuItems.filter(item => item.id !== id);
    setMenuItems(updated);
    saveMenuToLocalStorage(updated);
    setDeleteConfirm(null);
  };

  // Funções de CRUD - CATEGORIAS
  const handleSaveCategory = (category: MenuCategory) => {
    let updated: MenuCategory[];
    
    if (editingCategory) {
      updated = categories.map(cat => cat.id === category.id ? category : cat);
    } else {
      updated = [...categories, { ...category, id: `cat_${Date.now()}`, restaurantId: user?.restaurantId }];
    }
    
    setCategories(updated);
    saveCategoriesToLocalStorage(updated);
    setEditingCategory(null);
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = (id: string) => {
    // Não deletar se tem produtos nessa categoria
    const hasItems = menuItems.some(item => item.categoryId === id);
    if (hasItems) {
      alert('Não é possível deletar uma categoria que contém produtos. Mova os produtos para outra categoria primeiro.');
      return;
    }
    const updated = categories.filter(cat => cat.id !== id);
    setCategories(updated);
    saveCategoriesToLocalStorage(updated);
  };

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: '#f8f5ef' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6 px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#660000' }}>
            📋 Gestão de Cardápio - {restaurant?.name}
          </h1>
          <p className="text-gray-600">Gerencie produtos, preços, categorias e acompanhamentos do seu cardápio</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Barra de Ações */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Input
            placeholder="🔍 Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={() => setIsAddingProduct(true)}
            className="bg-[#660000] hover:bg-[#550000] text-white px-6 py-2 rounded-lg font-semibold"
          >
            + Novo Produto
          </Button>
          <Button 
            onClick={() => setShowCategoryManager(!showCategoryManager)}
            className="bg-[#8B6F47] hover:bg-[#7A6340] text-white px-6 py-2 rounded-lg font-semibold"
          >
            ⚙️ Categorias
          </Button>
        </div>

        {/* Gerenciador de Categorias (Colapsável) */}
        {showCategoryManager && (
          <Card className="mb-8 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#660000' }}>Gerenciar Categorias</h3>
              <button
                onClick={() => setShowCategoryManager(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {categories
                .sort((a, b) => a.order - b.order)
                .map(cat => (
                  <div key={cat.id} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                    <div className="flex-1">
                      <span className="font-semibold text-gray-800">{cat.name}</span>
                      <span className="text-xs text-gray-500 ml-2">({menuItems.filter(item => item.categoryId === cat.id).length} produtos)</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingCategory(cat)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
            </div>
            
            <Button
              onClick={() => setIsAddingCategory(true)}
              className="w-full bg-[#660000] hover:bg-[#550000] text-white px-4 py-2 rounded-lg font-semibold"
            >
              ➕ Nova Categoria
            </Button>
          </Card>
        )}

        {/* Filtros de Categoria */}
        <Card className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">FILTRAR POR CATEGORIA</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === ''
                  ? 'bg-[#660000] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todas ({filteredItems.length})
            </button>
            {categories
              .sort((a, b) => a.order - b.order)
              .map(cat => {
                const count = menuItems.filter(
                  item => item.restaurantId === user?.restaurantId && item.categoryId === cat.id
                ).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-[#660000] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
          </div>
        </Card>

        {/* Lista de Produtos */}
        {filteredItems.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">📭 Nenhum produto encontrado</p>
            <Button 
              onClick={() => setIsAddingProduct(true)}
              className="bg-[#660000] hover:bg-[#550000] text-white px-6 py-2 rounded-lg font-semibold"
            >
              + Adicionar Primeiro Produto
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {itemsByCategory.map(group => (
              <div key={group.category.id}>
                <h2 className="text-xl font-bold mb-4" style={{ color: '#660000' }}>
                  {group.category.name}
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {group.items.map(item => (
                    <Card key={item.id} className="flex items-start justify-between p-6">
                      <div className="flex gap-6 flex-1">
                        <div className="text-5xl">{item.image}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                          
                          {/* Ingredientes */}
                          {item.ingredients && (
                            <p className="text-xs text-gray-500 mb-2">
                              <strong>Ingredientes:</strong> {item.ingredients}
                            </p>
                          )}
                          
                          {/* Preços */}
                          <div className="flex flex-wrap gap-3 mb-3">
                            <div className="text-sm">
                              <span className="font-semibold text-gray-700">MyMenu:</span>
                              <span className="text-[#660000] font-bold ml-1">R$ {(item.prices?.mymenu || 0).toFixed(2)}</span>
                            </div>
                            {(item.prices?.ifood || 0) > 0 && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">iFood:</span>
                                <span className="text-[#660000] font-bold ml-1">R$ {(item.prices?.ifood || 0).toFixed(2)}</span>
                              </div>
                            )}
                            {(item.prices?.ubereats || 0) > 0 && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">UberEats:</span>
                                <span className="text-[#660000] font-bold ml-1">R$ {(item.prices?.ubereats || 0).toFixed(2)}</span>
                              </div>
                            )}
                            {(item.prices?.rappi || 0) > 0 && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Rappi:</span>
                                <span className="text-[#660000] font-bold ml-1">R$ {(item.prices?.rappi || 0).toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Status e Alérgenos */}
                          <div className="flex gap-3 text-xs flex-wrap">
                            <span className={`px-3 py-1 rounded-full ${
                              item.available
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {item.available ? '✅ Disponível' : '❌ Indisponível'}
                            </span>
                            {item.isOffer && (
                              <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold">
                                🎁 Em Oferta - R$ {(item.offerPrice || 0).toFixed(2)}
                              </span>
                            )}
                            {item.exclusive && (
                              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                                {item.exclusive === 'delivery' ? '🚗 Delivery' : '🏪 Presencial'}
                              </span>
                            )}
                            {(item.allergens?.length || 0) > 0 && (
                              <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                ⚠️ Alérgenos: {(item.allergens || []).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Botões de Ação */}
                      <div className="flex gap-2 flex-shrink-0 ml-4">
                        <button 
                          onClick={() => setEditingProduct(item)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                          title="Editar"
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm(item.id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                          title="Deletar"
                        >
                          🗑️ Deletar
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Edição/Adição de Produto */}
      {(editingProduct || isAddingProduct) && (
        <ProductFormModal
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => {
            setEditingProduct(null);
            setIsAddingProduct(false);
          }}
          restaurant={restaurant}
          categories={categories}
        />
      )}

      {/* Modal de Edição/Adição de Categoria */}
      {(editingCategory || isAddingCategory) && (
        <CategoryFormModal
          category={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => {
            setEditingCategory(null);
            setIsAddingCategory(false);
          }}
          existingCategories={categories}
        />
      )}

      {/* Modal de Confirmação de Deleção */}
      {deleteConfirm && (
        <DeleteConfirmModal
          onConfirm={() => handleDeleteProduct(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

// Componente Modal de Formulário
function ProductFormModal({ 
  product, 
  onSave, 
  onClose,
  restaurant,
  categories
}: { 
  product: MenuItem | null; 
  onSave: (product: MenuItem) => void; 
  onClose: () => void;
  restaurant: any;
  categories: MenuCategory[];
}) {
  const [formData, setFormData] = useState<MenuItem>(
    product || {
      id: '',
      restaurantId: restaurant?.id || '',
      name: '',
      description: '',
      ingredients: '',
      image: '🍽️',
      categoryId: categories[0]?.id || 'cat-1',
      prices: { mymenu: 0, ifood: 0, ubereats: 0, rappi: 0 },
      available: true,
      allergens: [],
      isOffer: false,
      offerPrice: 0
    }
  );

  const allergensOptions = ['gluten', 'dairy', 'eggs', 'nuts', 'soy', 'fish', 'shellfish'] as const;

  const handleAllergenToggle = (allergen: typeof allergensOptions[number]) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens?.includes(allergen)
        ? (prev.allergens || []).filter(a => a !== allergen)
        : [...(prev.allergens || []), allergen]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold" style={{ color: '#660000' }}>
            {product ? '✏️ Editar Produto' : '➕ Novo Produto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do Produto</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
              placeholder="Ex: Pizza Margherita"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
              placeholder="Descrição do produto"
              rows={2}
            />
          </div>

          {/* Ingredientes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ingredientes</label>
            <input
              type="text"
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
              placeholder="Ex: Tomate, queijo, manjericão"
            />
          </div>

          {/* Ícone/Imagem */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ícone/Emoji (1 caractere)</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value.slice(0, 2) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000] text-2xl"
              maxLength={2}
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
            >
              {categories.sort((a, b) => a.order - b.order).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Preços */}
          <div className="grid grid-cols-2 gap-4">
            {(['mymenu', 'ifood', 'ubereats', 'rappi'] as const).map(platform => (
              <div key={platform}>
                <label className="block text-sm font-semibold text-gray-700 mb-1 capitalize">
                  Preço {platform}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.prices?.[platform] || 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    prices: { ...formData.prices, [platform]: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
                  placeholder="0.00"
                />
              </div>
            ))}
          </div>

          {/* Disponibilidade */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 focus:ring-[#660000]"
            />
            <label htmlFor="available" className="text-sm font-semibold text-gray-700">
              ✅ Produto Disponível
            </label>
          </div>

          {/* Oferta */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="isOffer"
                checked={formData.isOffer}
                onChange={(e) => setFormData({ ...formData, isOffer: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 focus:ring-[#660000]"
              />
              <label htmlFor="isOffer" className="text-sm font-semibold text-gray-700">
                🎁 Colocar em Oferta
              </label>
            </div>
            {formData.isOffer && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Preço Promocional</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.offerPrice || 0}
                  onChange={(e) => setFormData({ ...formData, offerPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Preço original: R$ {formData.prices?.mymenu || 0}
                </p>
              </div>
            )}
          </div>

          {/* Tipo de Entrega */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Entrega</label>
            <select
              value={formData.exclusive || ''}
              onChange={(e) => setFormData({ ...formData, exclusive: (e.target.value as any) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
            >
              <option value="">Ambos (Delivery e Presencial)</option>
              <option value="delivery">🚗 Delivery</option>
              <option value="presencial">🏪 Presencial</option>
            </select>
          </div>

          {/* Alérgenos */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Alérgenos</label>
            <div className="grid grid-cols-2 gap-2">
              {allergensOptions.map(allergen => (
                <label key={allergen} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={(formData.allergens || []).includes(allergen)}
                    onChange={() => handleAllergenToggle(allergen)}
                    className="w-4 h-4 rounded border-gray-300 focus:ring-[#660000]"
                  />
                  <span className="capitalize">{allergen}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="sticky bottom-0 bg-gray-100 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-6 py-2 bg-[#660000] hover:bg-[#550000] text-white rounded-lg font-semibold transition-colors"
          >
            {product ? 'Salvar Alterações' : 'Adicionar Produto'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente Modal de Formulário de Categoria
function CategoryFormModal({ 
  category, 
  onSave, 
  onClose,
  existingCategories
}: { 
  category: MenuCategory | null; 
  onSave: (category: MenuCategory) => void; 
  onClose: () => void;
  existingCategories: MenuCategory[];
}) {
  const [formData, setFormData] = useState<MenuCategory>(
    category || {
      id: '',
      name: '',
      order: existingCategories.length + 1
    }
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold" style={{ color: '#660000' }}>
            {category ? '✏️ Editar Categoria' : '➕ Nova Categoria'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nome da Categoria</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
              placeholder="Ex: Pizzas Clássicas"
            />
          </div>

          {/* Ordem */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ordem de Exibição</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
              placeholder="1"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">Menor número = aparecer primeiro</p>
          </div>

          {/* Sugestões */}
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p className="font-semibold text-blue-900 mb-2">Sugestões de categorias:</p>
            <ul className="text-blue-800 text-xs space-y-1">
              <li>⭐ Destaques</li>
              <li>🎁 Combos</li>
              <li>🍕 Pizzas Clássicas</li>
              <li>🍫 Pizzas Doces</li>
              <li>🔥 Os Mais Avaliados</li>
              <li>🥤 Bebidas</li>
              <li>🍰 Sobremesas</li>
              <li>🍟 Acompanhamentos</li>
              <li>⏰ Pratos do Dia</li>
              <li>💰 Ofertas</li>
            </ul>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="bg-gray-100 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-6 py-2 bg-[#660000] hover:bg-[#550000] text-white rounded-lg font-semibold transition-colors"
          >
            {category ? 'Salvar Categoria' : 'Criar Categoria'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente Modal de Confirmação de Deleção
function DeleteConfirmModal({ 
  onConfirm, 
  onCancel 
}: { 
  onConfirm: () => void; 
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        <div className="p-6 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Deletar Produto?</h2>
          <p className="text-gray-600 mb-6">Esta ação não pode ser desfeita. Tem certeza?</p>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
            >
              Deletar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
