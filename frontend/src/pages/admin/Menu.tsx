import { useEffect, useMemo, useState } from 'react';
import type { MenuCategory, MenuItem } from '../../types/restaurant';
import { Card, Button, Input } from '../../components/shared';
import { useAuth } from '../../contexts/AuthContext';
import { mockRestaurants } from '../../lib/mockRestaurants';
import { canAddProduct, getCurrentPlan, getPlanRule, planLimitLabel } from '../../lib/subscriptionPlan';
import { authService, menuService, type MenuItemPayload } from '../../services/api';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface FeedbackState {
  type: 'success' | 'error';
  message: string;
}

interface ProductFormValues extends MenuItemPayload {}


export default function Menu() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const restaurant = mockRestaurants.find(r => r.id === user?.restaurantId);
  const activePlan = getCurrentPlan();
  const activeRule = getPlanRule(activePlan);

  const filteredItems = useMemo(() => {
    let items = [...menuItems];

    if (selectedCategory) {
      items = items.filter(item => item.categoryId === selectedCategory);
    }

    if (searchTerm) {
      const normalizedSearch = searchTerm.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.description?.toLowerCase().includes(normalizedSearch)
      );
    }

    return items;
  }, [menuItems, searchTerm, selectedCategory]);

  const itemsByCategory = useMemo(() => {
    return [...categories]
      .sort((a, b) => a.order - b.order)
      .map(category => ({
        category,
        items: filteredItems.filter(item => item.categoryId === category.id),
      }))
      .filter(group => group.items.length > 0 || !selectedCategory);
  }, [categories, filteredItems, selectedCategory]);

  useEffect(() => {
    const loadMenuData = async () => {
      const token = authService.getToken();

      if (!user?.restaurantId || !token) {
        setMenuItems([]);
        setCategories([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setFeedback(null);

      try {
        const [categoriesResponse, itemsResponse] = await Promise.all([
          menuService.getCategories(token),
          menuService.getMenuItems(token),
        ]);

        setCategories(categoriesResponse.data || []);
        setMenuItems(itemsResponse.data || []);
      } catch (error) {
        setFeedback({
          type: 'error',
          message: error instanceof Error ? error.message : 'Erro ao carregar cardápio.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    void loadMenuData();
  }, [user?.restaurantId]);

  const handleSaveProduct = async (payload: ProductFormValues) => {
    const token = authService.getToken();
    if (!token) {
      setFeedback({ type: 'error', message: 'Sessão expirada. Faça login novamente.' });
      return;
    }

    if (!editingProduct) {
      const currentCount = menuItems.length;
      if (!canAddProduct(currentCount, activePlan)) {
        setFeedback({
          type: 'error',
          message: `Limite do plano atingido: ${planLimitLabel(activeRule.maxProducts)} produtos.`,
        });
        return;
      }
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const response = editingProduct
        ? await menuService.updateMenuItem(editingProduct.id, payload, token)
        : await menuService.createMenuItem(payload, token);

      if (!response.data) {
        throw new Error(response.message || 'Não foi possível salvar o item.');
      }

      if (editingProduct) {
        setMenuItems(prev => prev.map(item => item.id === response.data?.id ? response.data : item));
      } else {
        setMenuItems(prev => [...prev, response.data!]);
      }

      setFeedback({
        type: 'success',
        message: response.message || 'Item salvo com sucesso!',
      });
      setEditingProduct(null);
      setIsAddingProduct(false);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao salvar item.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (item: MenuItem) => {
    const token = authService.getToken();
    if (!token) {
      setFeedback({ type: 'error', message: 'Sessão expirada. Faça login novamente.' });
      return;
    }

    setIsSaving(true);
    try {
      await menuService.deleteMenuItem(item.id, token);
      setMenuItems(prev => prev.filter(currentItem => currentItem.id !== item.id));
      setFeedback({ type: 'success', message: 'Item removido com sucesso!' });
      setDeleteConfirm(null);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao remover item.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCategory = async (payload: Pick<MenuCategory, 'name' | 'order'>) => {
    const token = authService.getToken();
    if (!token) {
      setFeedback({ type: 'error', message: 'Sessão expirada. Faça login novamente.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const response = editingCategory
        ? await menuService.updateCategory(editingCategory.id, payload, token)
        : await menuService.createCategory(payload, token);

      if (!response.data) {
        throw new Error(response.message || 'Não foi possível salvar a categoria.');
      }

      if (editingCategory) {
        setCategories(prev => prev.map(category => category.id === response.data?.id ? response.data : category));
      } else {
        setCategories(prev => [...prev, response.data!]);
      }

      setFeedback({
        type: 'success',
        message: response.message || 'Categoria salva com sucesso!',
      });
      setEditingCategory(null);
      setIsAddingCategory(false);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao salvar categoria.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (category: MenuCategory) => {
    const token = authService.getToken();
    if (!token) {
      setFeedback({ type: 'error', message: 'Sessão expirada. Faça login novamente.' });
      return;
    }

    setIsSaving(true);
    try {
      await menuService.deleteCategory(category.id, token);
      setCategories(prev => prev.filter(currentCategory => currentCategory.id !== category.id));
      if (selectedCategory === category.id) {
        setSelectedCategory('');
      }
      setFeedback({ type: 'success', message: 'Categoria removida com sucesso!' });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao remover categoria.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user?.restaurantId) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f5ef' }}>
        <Card className="max-w-xl text-center p-8">
          <h1 className="text-2xl font-bold mb-3" style={{ color: '#660000' }}>
            Conta sem restaurante vinculado
          </h1>
          <p className="text-gray-600">
            Esta conta admin não possui `restaurantId`, então o CRUD de cardápio não pode ser carregado.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: '#f8f5ef' }}>
      <div className="bg-white border-b border-gray-200 py-6 px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#660000' }}>
            Gestão de Cardápio - {restaurant?.name || 'Seu Restaurante'}
          </h1>
          <p className="text-gray-600">Gerencie produtos, preços, categorias e imagens do seu cardápio</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <Card className="mb-6 border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-gray-700">
              Plano atual: <span className="font-bold">{activeRule.icon} {activeRule.label}</span>
            </p>
            <p className="text-gray-700">
              Limite de produtos: <span className="font-bold">{planLimitLabel(activeRule.maxProducts)}</span>
            </p>
          </div>
        </Card>

        {feedback && (
          <Card className={`mb-6 border ${feedback.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <p className={feedback.type === 'error' ? 'text-red-700' : 'text-green-700'}>{feedback.message}</p>
          </Card>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Input
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => setIsAddingProduct(true)}
            className="bg-[#660000] hover:bg-[#550000] text-white px-6 py-2 rounded-lg font-semibold"
            disabled={categories.length === 0}
          >
            + Novo Produto
          </Button>
          <Button
            onClick={() => setShowCategoryManager(!showCategoryManager)}
            className="bg-[#8B6F47] hover:bg-[#7A6340] text-white px-6 py-2 rounded-lg font-semibold"
          >
            Categorias
          </Button>
        </div>

        {showCategoryManager && (
          <Card className="mb-8 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#660000' }}>Gerenciar Categorias</h3>
              <button
                onClick={() => setShowCategoryManager(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                x
              </button>
            </div>

            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {[...categories]
                .sort((a, b) => a.order - b.order)
                .map(category => (
                  <div key={category.id} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                    <div className="flex-1">
                      <span className="font-semibold text-gray-800">{category.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({menuItems.filter(item => item.categoryId === category.id).length} produtos)
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => void handleDeleteCategory(category)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                        disabled={isSaving}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <Button
              onClick={() => setIsAddingCategory(true)}
              className="w-full bg-[#660000] hover:bg-[#550000] text-white px-4 py-2 rounded-lg font-semibold"
            >
              + Nova Categoria
            </Button>
          </Card>
        )}

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
            {[...categories]
              .sort((a, b) => a.order - b.order)
              .map(category => {
                const count = menuItems.filter(item => item.categoryId === category.id).length;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === category.id
                        ? 'bg-[#660000] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category.name} ({count})
                  </button>
                );
              })}
          </div>
        </Card>

        {isLoading ? (
          <Card className="text-center py-12">
            <p className="text-gray-500 text-lg">Carregando cardápio...</p>
          </Card>
        ) : filteredItems.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Nenhum produto encontrado</p>
            <Button
              onClick={() => setIsAddingProduct(true)}
              className="bg-[#660000] hover:bg-[#550000] text-white px-6 py-2 rounded-lg font-semibold"
              disabled={categories.length === 0}
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
                        <ProductVisual item={item} />
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{item.description}</p>

                          {item.ingredients && (
                            <p className="text-xs text-gray-500 mb-2">
                              <strong>Ingredientes:</strong> {item.ingredients}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-3 mb-3">
                            <PriceTag label="MyMenu" value={item.prices?.mymenu || 0} />
                            {(item.prices?.ifood || 0) > 0 && <PriceTag label="iFood" value={item.prices?.ifood || 0} />}
                            {(item.prices?.ubereats || 0) > 0 && <PriceTag label="UberEats" value={item.prices?.ubereats || 0} />}
                            {(item.prices?.rappi || 0) > 0 && <PriceTag label="Rappi" value={item.prices?.rappi || 0} />}
                          </div>

                          <div className="flex gap-3 text-xs flex-wrap">
                            <span className={`px-3 py-1 rounded-full ${
                              item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {item.available ? 'Disponível' : 'Indisponível'}
                            </span>
                            {item.isOffer && (
                              <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold">
                                Oferta - R$ {(item.offerPrice || 0).toFixed(2)}
                              </span>
                            )}
                            {item.exclusive && (
                              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                                {item.exclusive === 'delivery' ? 'Delivery' : 'Presencial'}
                              </span>
                            )}
                            {(item.allergens?.length || 0) > 0 && (
                              <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                Alergenos: {(item.allergens || []).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0 ml-4">
                        <button
                          onClick={() => setEditingProduct(item)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                          title="Editar"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(item)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                          title="Excluir"
                        >
                          Excluir
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

      {(editingProduct || isAddingProduct) && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onSave={(payload) => void handleSaveProduct(payload)}
          onClose={() => {
            setEditingProduct(null);
            setIsAddingProduct(false);
          }}
          isSubmitting={isSaving}
        />
      )}

      {(editingCategory || isAddingCategory) && (
        <CategoryFormModal
          category={editingCategory}
          existingCategories={categories}
          onSave={(payload) => void handleSaveCategory(payload)}
          onClose={() => {
            setEditingCategory(null);
            setIsAddingCategory(false);
          }}
          isSubmitting={isSaving}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          title="Excluir Produto?"
          description="Esta ação não pode ser desfeita. Tem certeza?"
          onConfirm={() => void handleDeleteProduct(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
          isSubmitting={isSaving}
        />
      )}
    </div>
  );
}


function ProductVisual({ item }: { item: MenuItem }) {
  if (item.imageUrl) {
    return (
      <img
        src={`${API_URL}${item.imageUrl}`}
        alt={item.name}
        className="w-24 h-24 rounded-2xl object-cover border border-gray-200 bg-gray-100"
      />
    );
  }

  return (
    <div className="w-24 h-24 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-5xl">
      {item.image || '🍽️'}
    </div>
  );
}


function PriceTag({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-sm">
      <span className="font-semibold text-gray-700">{label}:</span>
      <span className="text-[#660000] font-bold ml-1">R$ {value.toFixed(2)}</span>
    </div>
  );
}


function ProductFormModal({
  product,
  categories,
  onSave,
  onClose,
  isSubmitting,
}: {
  product: MenuItem | null;
  categories: MenuCategory[];
  onSave: (payload: ProductFormValues) => void;
  onClose: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState<ProductFormValues>({
    name: product?.name || '',
    description: product?.description || '',
    ingredients: product?.ingredients || '',
    categoryId: product?.categoryId || categories[0]?.id || '',
    prices: {
      mymenu: product?.prices?.mymenu || 0,
      ifood: product?.prices?.ifood || 0,
      ubereats: product?.prices?.ubereats || 0,
      rappi: product?.prices?.rappi || 0,
    },
    available: product?.available ?? true,
    exclusive: product?.exclusive,
    allergens: product?.allergens || [],
    isOffer: product?.isOffer || false,
    offerPrice: product?.offerPrice,
    imageFile: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string>(product?.imageUrl ? `${API_URL}${product.imageUrl}` : '');
  const [error, setError] = useState('');

  const allergensOptions = ['gluten', 'dairy', 'eggs', 'nuts', 'soy', 'fish', 'shellfish'] as const;

  const handleAllergenToggle = (allergen: typeof allergensOptions[number]) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(item => item !== allergen)
        : [...prev.allergens, allergen],
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, imageFile: file }));
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError('Informe o nome do produto.');
      return;
    }

    if (!formData.categoryId) {
      setError('Selecione uma categoria antes de salvar.');
      return;
    }

    if ((formData.prices.mymenu || 0) <= 0) {
      setError('O preço MyMenu deve ser maior que zero.');
      return;
    }

    if (formData.isOffer && (!formData.offerPrice || formData.offerPrice >= formData.prices.mymenu)) {
      setError('O preço promocional deve ser menor que o preço MyMenu.');
      return;
    }

    setError('');
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold" style={{ color: '#660000' }}>
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            x
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="product-name" className="block text-sm font-semibold text-gray-700 mb-1">Nome do Produto</label>
            <input
              id="product-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
              placeholder="Ex: Pizza Margherita"
            />
          </div>

          <div>
            <label htmlFor="product-description" className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
            <textarea
              id="product-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
              placeholder="Descrição do produto"
              rows={2}
            />
          </div>

          <div>
            <label htmlFor="product-ingredients" className="block text-sm font-semibold text-gray-700 mb-1">Ingredientes</label>
            <input
              id="product-ingredients"
              type="text"
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
              placeholder="Ex: Tomate, queijo, manjericão"
            />
          </div>

          <div>
            <label htmlFor="product-image" className="block text-sm font-semibold text-gray-700 mb-2">Imagem do Produto</label>
            <div className="flex items-center gap-4">
              <label htmlFor="product-image" className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200">
                Selecionar imagem
                <input
                  id="product-image"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              {previewUrl ? (
                <img src={previewUrl} alt="Preview do produto" className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-3xl">
                  {product?.image || '🍽️'}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="product-category" className="block text-sm font-semibold text-gray-700 mb-1">Categoria</label>
            <select
              id="product-category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
            >
              {categories.sort((a, b) => a.order - b.order).map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(['mymenu', 'ifood', 'ubereats', 'rappi'] as const).map(platform => (
              <div key={platform}>
                <label htmlFor={`price-${platform}`} className="block text-sm font-semibold text-gray-700 mb-1 capitalize">
                  Preço {platform}
                </label>
                <input
                  id={`price-${platform}`}
                  type="number"
                  step="0.01"
                  value={formData.prices[platform] || 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    prices: { ...formData.prices, [platform]: Number(e.target.value) || 0 },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 focus:ring-[#660000]"
            />
            <label htmlFor="available" className="text-sm font-semibold text-gray-700">
              Produto disponível
            </label>
          </div>

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
                Colocar em oferta
              </label>
            </div>
            {formData.isOffer && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Preço Promocional</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.offerPrice || 0}
                  onChange={(e) => setFormData({ ...formData, offerPrice: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Entrega</label>
            <select
              value={formData.exclusive || ''}
              onChange={(e) => setFormData({
                ...formData,
                exclusive: (e.target.value as 'delivery' | 'presencial' | '') || undefined,
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
            >
              <option value="">Ambos (Delivery e Presencial)</option>
              <option value="delivery">Delivery</option>
              <option value="presencial">Presencial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Alergenos</label>
            <div className="grid grid-cols-2 gap-2">
              {allergensOptions.map(allergen => (
                <label key={allergen} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.allergens.includes(allergen)}
                    onChange={() => handleAllergenToggle(allergen)}
                    className="w-4 h-4 rounded border-gray-300 focus:ring-[#660000]"
                  />
                  <span className="capitalize">{allergen}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-100 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-[#660000] hover:bg-[#550000] text-white rounded-lg font-semibold transition-colors"
            disabled={isSubmitting || categories.length === 0}
          >
            {isSubmitting ? 'Salvando...' : product ? 'Salvar Alterações' : 'Adicionar Produto'}
          </button>
        </div>
      </div>
    </div>
  );
}


function CategoryFormModal({
  category,
  existingCategories,
  onSave,
  onClose,
  isSubmitting,
}: {
  category: MenuCategory | null;
  existingCategories: MenuCategory[];
  onSave: (payload: Pick<MenuCategory, 'name' | 'order'>) => void;
  onClose: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    order: category?.order || existingCategories.length + 1,
  });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError('Informe o nome da categoria.');
      return;
    }

    if (formData.order < 1) {
      setError('A ordem deve ser maior ou igual a 1.');
      return;
    }

    setError('');
    onSave({
      name: formData.name.trim(),
      order: formData.order,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold" style={{ color: '#660000' }}>
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            x
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ordem de Exibição</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">Menor número = aparecer primeiro</p>
          </div>
        </div>

        <div className="bg-gray-100 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-[#660000] hover:bg-[#550000] text-white rounded-lg font-semibold transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : category ? 'Salvar Categoria' : 'Criar Categoria'}
          </button>
        </div>
      </div>
    </div>
  );
}


function DeleteConfirmModal({
  title,
  description,
  onConfirm,
  onCancel,
  isSubmitting,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        <div className="p-6 text-center">
          <div className="text-5xl mb-4">!</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">{description}</p>

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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
