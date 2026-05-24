import { useState, useEffect } from 'react';
import { Card, PageHeader } from '../../components/shared';
import { useAuth } from '../../contexts/AuthContext';
import {
  getRestaurantTables, saveTable, deleteTable,
  getRestaurantReservations,
} from '../../lib/firestoreService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { RestaurantTable, Reservation } from '../../lib/firestoreService';

function generateCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const l = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  const n = String(Math.floor(Math.random() * 900) + 100);
  return `${l}-${n}`;
}

function statusBadge(s: Reservation['status']) {
  if (s === 'confirmed') return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">✅ Confirmada</span>;
  if (s === 'cancelled') return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">❌ Negada</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-semibold">⏳ Pendente</span>;
}

export default function Tables() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'mesas' | 'reservas'>('reservas');
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingRes, setLoadingRes] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const restaurantId = user?.id ?? '';

  useEffect(() => {
    if (!restaurantId) return;
    getRestaurantTables(restaurantId).then(t => { setTables(t); setLoadingTables(false); });
    getRestaurantReservations(restaurantId).then(r => { setReservations(r); setLoadingRes(false); });
  }, [restaurantId]);

  const handleAdd = async () => {
    if (!newName.trim()) { setError('Informe o nome da mesa.'); return; }
    const code = newCode.trim().toUpperCase() || generateCode();
    if (!/^[A-Z]{3}-\d{3}$/.test(code)) { setError('Código inválido. Use 3 letras + 3 números (ex: FSD-456).'); return; }
    if (tables.some(t => t.code === code)) { setError('Esse código já existe.'); return; }
    setSaving(true);
    setError('');
    const id = await saveTable(restaurantId, { code, name: newName.trim(), active: true });
    setTables(prev => [...prev, { id, restaurantId, code, name: newName.trim(), active: true }]);
    setNewName(''); setNewCode('');
    setSaving(false);
  };

  const handleToggle = async (table: RestaurantTable) => {
    await saveTable(restaurantId, { ...table, active: !table.active });
    setTables(prev => prev.map(t => t.id === table.id ? { ...t, active: !t.active } : t));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta mesa?')) return;
    await deleteTable(id);
    setTables(prev => prev.filter(t => t.id !== id));
  };

  const handleResStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    setUpdatingId(id);
    await updateDoc(doc(db, 'reservations', id), { status });
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    setUpdatingId(null);
  };

  const pending = reservations.filter(r => r.status === 'pending');
  const resolved = reservations.filter(r => r.status !== 'pending');

  if (user?.type !== 'admin') return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f5ef' }}>
      <PageHeader title="Mesas & Reservas" subtitle="Gerencie mesas e solicitações de reserva" icon="🪑" />

      <div className="max-w-3xl mx-auto px-8 py-10 space-y-6">

        {/* Tabs */}
        <div className="flex gap-2 bg-white border border-gray-200 rounded-2xl p-1">
          <button
            onClick={() => setTab('reservas')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'reservas' ? 'bg-[#660000] text-white shadow' : 'text-gray-600 hover:text-[#660000]'}`}
          >
            📅 Reservas
            {pending.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{pending.length}</span>
            )}
          </button>
          <button
            onClick={() => setTab('mesas')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'mesas' ? 'bg-[#660000] text-white shadow' : 'text-gray-600 hover:text-[#660000]'}`}
          >
            🪑 Mesas
          </button>
        </div>

        {/* ── TAB RESERVAS ── */}
        {tab === 'reservas' && (
          <>
            {/* Pendentes */}
            <Card>
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                ⏳ Aguardando Resposta
                <span className="ml-2 text-sm font-normal text-gray-400">({pending.length})</span>
              </h2>
              {loadingRes ? (
                <p className="text-gray-400 text-sm">Carregando...</p>
              ) : pending.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">Nenhuma reserva pendente.</p>
              ) : (
                <div className="space-y-3">
                  {pending.map(r => (
                    <div key={r.id} className="border-2 border-yellow-200 bg-yellow-50 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">{r.userName}</p>
                          <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                            <span>📅 {r.day}</span>
                            <span>🕐 {r.time}</span>
                            <span>👥 {r.people} {r.people === 1 ? 'pessoa' : 'pessoas'}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Solicitado em {new Date(r.createdAt).toLocaleDateString('pt-BR')} às {new Date(r.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleResStatus(r.id, 'confirmed')}
                            disabled={updatingId === r.id}
                            className="px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            ✅ Aceitar
                          </button>
                          <button
                            onClick={() => handleResStatus(r.id, 'cancelled')}
                            disabled={updatingId === r.id}
                            className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            ❌ Negar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Respondidas */}
            {resolved.length > 0 && (
              <Card>
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  📋 Histórico
                  <span className="ml-2 text-sm font-normal text-gray-400">({resolved.length})</span>
                </h2>
                <div className="space-y-2">
                  {resolved.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{r.userName}</p>
                        <p className="text-xs text-gray-500">{r.day} às {r.time} · {r.people} {r.people === 1 ? 'pessoa' : 'pessoas'}</p>
                      </div>
                      {statusBadge(r.status)}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}

        {/* ── TAB MESAS ── */}
        {tab === 'mesas' && (
          <>
            <Card className="bg-yellow-50 border border-yellow-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💎</span>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Funcionalidade exclusiva do plano Diamante</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Cada mesa recebe um código único (ex: <strong>FSD-456</strong>). O cliente digita esse código no app para pedir direto da mesa, sem garçom.
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-bold text-gray-800 mb-4">➕ Adicionar Mesa</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nome da Mesa</label>
                  <input value={newName} onChange={e => { setNewName(e.target.value); setError(''); }}
                    placeholder="Ex: Mesa 1, Varanda, Balcão"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Código (opcional — gerado automaticamente)</label>
                  <input value={newCode} onChange={e => { setNewCode(e.target.value.toUpperCase()); setError(''); }}
                    placeholder="Ex: FSD-456" maxLength={7}
                    className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]" />
                </div>
              </div>
              {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
              <button onClick={handleAdd} disabled={saving}
                className="px-5 py-2 bg-[#660000] text-white text-sm font-bold rounded-lg hover:bg-[#550000] transition-colors disabled:opacity-60">
                {saving ? 'Adicionando...' : '➕ Adicionar'}
              </button>
            </Card>

            <Card>
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                🪑 Mesas Cadastradas
                <span className="ml-2 text-sm font-normal text-gray-400">({tables.length})</span>
              </h2>
              {loadingTables ? <p className="text-gray-400 text-sm">Carregando...</p>
                : tables.length === 0 ? <p className="text-gray-500 text-sm text-center py-6">Nenhuma mesa cadastrada ainda.</p>
                : (
                  <div className="space-y-2">
                    {tables.map(t => (
                      <div key={t.id} className={`flex items-center justify-between p-3 rounded-xl border-2 ${t.active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🪑</span>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                            <p className="text-xs font-mono font-bold text-[#660000] tracking-widest">{t.code}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${t.active ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                            {t.active ? 'Ativa' : 'Inativa'}
                          </span>
                          <button onClick={() => handleToggle(t)}
                            className="text-xs px-2 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
                            {t.active ? 'Desativar' : 'Ativar'}
                          </button>
                          <button onClick={() => handleDelete(t.id)}
                            className="text-xs px-2 py-1 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </Card>
          </>
        )}

      </div>
    </div>
  );
}
