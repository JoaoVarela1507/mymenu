import { useState, useEffect } from 'react';
import type { Promotion, PromotionDay } from '../../types';
import { getPromotions, savePromotion, deletePromotion } from '../../lib/firestoreService';
import { getRestaurantByOwnerId } from '../../lib/firestoreService';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/shared';

const DAY_LABELS: Record<PromotionDay, string> = {
  seg: 'Seg', ter: 'Ter', qua: 'Qua', qui: 'Qui', sex: 'Sex', sab: 'Sáb', dom: 'Dom',
};
const ALL_DAYS: PromotionDay[] = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];

const emptyForm = () => ({
  title: '',
  condition: '',
  days: [] as PromotionDay[],
  startTime: '18:00',
  endTime: '22:00',
});

export default function Promotions() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    getRestaurantByOwnerId(user.id).then(rest => {
      if (!rest) { setLoadingData(false); return; }
      setRestaurantId(rest.id);
      return getPromotions(rest.id);
    }).then(promos => {
      if (promos) setPromotions(promos);
      setLoadingData(false);
    });
  }, [user?.id]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError('');
    setShowModal(true);
  };

  const openEdit = (p: Promotion) => {
    setEditingId(p.id);
    setForm({ title: p.title, condition: p.condition, days: [...p.days], startTime: p.startTime, endTime: p.endTime });
    setError('');
    setShowModal(true);
  };

  const toggleDay = (day: PromotionDay) => {
    setForm(f => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter(d => d !== day) : [...f.days, day],
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) return setError('Informe um título.');
    if (!form.condition.trim()) return setError('Informe a condição da promoção.');
    if (form.days.length === 0) return setError('Selecione pelo menos um dia.');
    if (!restaurantId) return;

    setSaving(true);
    try {
      if (editingId) {
        const updated = { ...promotions.find(p => p.id === editingId)!, ...form };
        await savePromotion(restaurantId, updated);
        setPromotions(ps => ps.map(p => p.id === editingId ? updated : p));
      } else {
        const newPromo: Promotion = {
          id: `temp_${Date.now()}`,
          restaurantId,
          ...form,
          active: true,
        };
        const id = await savePromotion(restaurantId, newPromo);
        setPromotions(ps => [{ ...newPromo, id }, ...ps]);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string) => {
    if (!restaurantId) return;
    const promo = promotions.find(p => p.id === id);
    if (!promo) return;
    const updated = { ...promo, active: !promo.active };
    await savePromotion(restaurantId, updated);
    setPromotions(ps => ps.map(p => p.id === id ? updated : p));
  };

  const handleDelete = async (id: string) => {
    await deletePromotion(id);
    setPromotions(ps => ps.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="Promoções"
        subtitle="Crie e gerencie promoções do seu restaurante"
        icon="🎁"
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border-2 border-[#D4AF37] max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#C92924]">
                  {editingId ? 'Editar Promoção' : 'Nova Promoção'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Título *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Ex: Pizza em Dobro"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C92924]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Condição / Desconto *</label>
                  <input
                    type="text"
                    value={form.condition}
                    onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                    placeholder="Ex: Peça 1 pizza e leve 2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C92924]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Dias da semana *</label>
                  <div className="flex gap-2 flex-wrap">
                    {ALL_DAYS.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          form.days.includes(day)
                            ? 'bg-[#C92924] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {DAY_LABELS[day]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Início</label>
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C92924]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Fim</label>
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C92924]/40"
                    />
                  </div>
                </div>

                {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-600 hover:border-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2 bg-[#C92924] text-white rounded-lg text-sm font-bold hover:bg-[#a81f1a] transition-colors disabled:opacity-60"
                >
                  {saving ? 'Salvando...' : editingId ? 'Salvar' : 'Criar Promoção'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-4xl px-4 py-4">
        {loadingData ? (
          <div className="text-center py-16 text-gray-400">Carregando promoções...</div>
        ) : !restaurantId ? (
          <div className="text-center py-16 text-gray-400">Restaurante não encontrado.</div>
        ) : (
        <>
        <div className="flex justify-end mb-4">
          <button
            onClick={openNew}
            className="px-4 py-2 bg-[#C92924] text-white rounded-lg text-sm font-bold hover:bg-[#a81f1a] transition-colors"
          >
            + Nova Promoção
          </button>
        </div>

        {promotions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🎁</p>
            <p className="font-semibold">Nenhuma promoção cadastrada</p>
            <p className="text-sm mt-1">Crie uma promoção para atrair mais clientes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {promotions.map(p => (
              <div
                key={p.id}
                className={`border-2 rounded-xl p-4 transition-all ${
                  p.active ? 'border-[#C92924]/30 bg-red-50/30' : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800">{p.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        p.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {p.active ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                    <p className="text-sm text-[#C92924] font-semibold mb-2">{p.condition}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>📅 {p.days.map(d => DAY_LABELS[d]).join(', ')}</span>
                      <span>🕐 {p.startTime} – {p.endTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(p.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        p.active ? 'bg-[#C92924]' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        p.active ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </>)}
      </div>
    </div>
  );
}
