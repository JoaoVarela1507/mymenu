import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/shared';
import { useAuth } from '../../contexts/AuthContext';
import { getRestaurants, submitReservation, getUserReservations } from '../../lib/firestoreService';
import type { Restaurant } from '../../types/restaurant';
import type { Reservation } from '../../lib/firestoreService';

type ChatStep = 'restaurant' | 'day' | 'time' | 'people' | 'done';
interface ChatMessage { from: 'bot' | 'user'; text: string; }

function resStatusLabel(s: Reservation['status']) {
  const map: Record<string, string> = {
    pending: '⏳ Aguardando',
    confirmed: '✅ Confirmada',
    cancelled: '❌ Cancelada',
  };
  return map[s] ?? s;
}

function inputPlaceholder(step: ChatStep) {
  if (step === 'restaurant') return 'Digite o nome do restaurante...';
  if (step === 'day') return 'Ex: 25/05/2026';
  if (step === 'time') return 'Ex: 19:30';
  if (step === 'people') return 'Ex: 4';
  return '';
}

function inputLabel(step: ChatStep) {
  if (step === 'restaurant') return 'Nome do restaurante';
  if (step === 'day') return 'Data da reserva';
  if (step === 'time') return 'Horário';
  if (step === 'people') return 'Número de pessoas';
  return '';
}

export default function OrderHistory() {
  const { user, isAuthenticated } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [step, setStep] = useState<ChatStep>('restaurant');
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [reservation, setReservation] = useState<Partial<{
    restaurantId: string; restaurantName: string; day: string; time: string; people: number;
  }>>({});
  const [pastReservations, setPastReservations] = useState<Reservation[]>([]);
  const [started, setStarted] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getRestaurants().then(setRestaurants);
    if (user?.id) getUserReservations(user.id).then(setPastReservations);
  }, [user?.id]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const addBot = (text: string) => setMessages(m => [...m, { from: 'bot', text }]);
  const addUser = (text: string) => setMessages(m => [...m, { from: 'user', text }]);

  const startChat = () => {
    setStarted(true);
    setMessages([{ from: 'bot', text: 'Olá! 👋 Em qual restaurante você quer fazer uma reserva?' }]);
    setStep('restaurant');
    setInput('');
    setInputError('');
    setReservation({});
  };

  const handleSend = () => {
    const val = input.trim();
    if (!val) return;
    setInputError('');

    if (step === 'restaurant') {
      const found = restaurants.find(r =>
        r.name.toLowerCase().includes(val.toLowerCase())
      );
      if (!found) {
        setInputError('Restaurante não encontrado. Verifique o nome e tente novamente.');
        return;
      }
      setInput('');
      addUser(found.name);
      setReservation(rv => ({ ...rv, restaurantId: found.id, restaurantName: found.name }));
      setTimeout(() => { addBot(`Ótimo! ${found.logo} ${found.name} selecionado. Para qual dia você quer reservar?`); setStep('day'); }, 400);
      return;
    }

    setInput('');
    addUser(val);

    if (step === 'day') {
      setReservation(rv => ({ ...rv, day: val }));
      setTimeout(() => { addBot('Qual horário? (ex: 19:30)'); setStep('time'); }, 400);
    } else if (step === 'time') {
      setReservation(rv => ({ ...rv, time: val }));
      setTimeout(() => { addBot('Quantas pessoas? (ex: 4)'); setStep('people'); }, 400);
    } else if (step === 'people') {
      const people = parseInt(val) || 1;
      const final = { ...reservation, people };
      setReservation(final as any);
      setTimeout(async () => {
        addBot(`Perfeito! Reserva para ${people} ${people === 1 ? 'pessoa' : 'pessoas'} em ${reservation.restaurantName}, dia ${reservation.day} às ${reservation.time}. ✅`);
        setTimeout(() => addBot('Sua reserva foi enviada! O restaurante entrará em contato para confirmar. Obrigado! 🙏'), 800);
        await submitReservation({
          restaurantId: final.restaurantId!,
          restaurantName: final.restaurantName!,
          userId: user!.id,
          userName: user!.name,
          day: reservation.day!,
          time: reservation.time!,
          people,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
        getUserReservations(user!.id).then(setPastReservations);
        setStep('done');
      }, 400);
    }
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-white">
      <PageHeader title="Reservas" subtitle="Reserve sua mesa favorita" icon="📅" />
      <div className="container mx-auto max-w-md px-4 py-16 text-center text-gray-400">
        <p className="text-4xl mb-4">🔒</p>
        <p className="font-semibold">Faça login para fazer reservas.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title="Reservas" subtitle="Reserve sua mesa favorita" icon="📅" />

      <div className="container mx-auto max-w-3xl px-4 py-6 space-y-4">

        {!started ? (
          <>
            <div className="bg-[#fdf6ec] border-2 border-[#e8d9b5] rounded-2xl p-5">
              <p className="text-sm text-gray-700 mb-3">
                Reserve uma mesa de forma rápida. Nosso assistente vai te guiar: restaurante, dia, horário e número de pessoas.
              </p>
              <button onClick={startChat} className="px-5 py-2.5 bg-[#660000] text-white font-bold rounded-xl hover:bg-[#550000] transition-colors text-sm">
                💬 Iniciar Reserva
              </button>
            </div>

            {pastReservations.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">Minhas reservas</p>
                <div className="space-y-2">
                  {pastReservations.slice(0, 8).map(r => (
                    <div key={r.id} className={`p-3 bg-white border rounded-xl text-sm ${r.status === 'cancelled' ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-800">{r.restaurantName}</p>
                          <p className="text-xs text-gray-500">{r.day} às {r.time} · {r.people} {r.people === 1 ? 'pessoa' : 'pessoas'}</p>
                        </div>
                        <span className="text-xs font-semibold whitespace-nowrap">{resStatusLabel(r.status)}</span>
                      </div>
                      {r.status === 'cancelled' && r.denyReason && (
                        <div className="mt-2 flex items-start gap-1.5 bg-red-100 border border-red-200 rounded-lg px-2.5 py-1.5">
                          <span className="text-red-500 text-xs mt-0.5">⚠️</span>
                          <p className="text-xs text-red-700"><span className="font-semibold">Motivo:</span> {r.denyReason}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col h-[500px] bg-[#fdf6ec] border border-[#e8d9b5] rounded-2xl overflow-hidden">
            {/* Header chat */}
            <div className="bg-[#660000] px-4 py-3 flex items-center gap-2 flex-shrink-0">
              <span className="text-xl">🤖</span>
              <p className="text-white text-sm font-bold">Assistente MyMenu</p>
            </div>

            {/* Mensagens */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    m.from === 'bot'
                      ? 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                      : 'bg-[#660000] text-white rounded-tr-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            {step !== 'done' && (
              <div className="border-t border-[#e8d9b5] p-3 flex-shrink-0">
                <label className="block text-xs font-semibold text-gray-500 mb-1 px-1">
                  {inputLabel(step)}
                </label>
                <div className="relative">
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={e => { setInput(e.target.value); setInputError(''); }}
                      onKeyDown={e => e.key === 'Enter' && step !== 'restaurant' && handleSend()}
                      placeholder={inputPlaceholder(step)}
                      className={`flex-1 px-3 py-2 text-sm border rounded-xl focus:outline-none focus:border-[#660000] ${inputError ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {step !== 'restaurant' && (
                      <button
                        onClick={handleSend}
                        className="px-4 py-2 bg-[#660000] text-white text-sm font-bold rounded-xl hover:bg-[#550000] transition-colors"
                      >
                        Enviar
                      </button>
                    )}
                  </div>

                  {/* Autocomplete restaurante */}
                  {step === 'restaurant' && input.trim().length > 0 && (() => {
                    const filtered = restaurants
                      .filter(r => r.name.toLowerCase().includes(input.toLowerCase()))
                      .sort((a, b) => a.name.localeCompare(b.name));
                    return filtered.length > 0 ? (
                      <ul className="absolute z-10 left-0 right-0 bottom-full mb-1 bg-white border-2 border-[#e8d9b5] rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                        {filtered.map(r => (
                          <li key={r.id}>
                            <button
                              onClick={() => {
                                setInput('');
                                setInputError('');
                                addUser(r.name);
                                setReservation(rv => ({ ...rv, restaurantId: r.id, restaurantName: r.name }));
                                setTimeout(() => { addBot(`Ótimo! ${r.logo} ${r.name} selecionado. Para qual dia você quer reservar?`); setStep('day'); }, 400);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#fdf6ec] transition-colors text-left"
                            >
                              <span className="text-xl">{r.logo}</span>
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{r.name}</p>
                                <p className="text-xs text-gray-500">{r.city || r.category}</p>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="absolute z-10 left-0 right-0 bottom-full mb-1 bg-white border-2 border-[#e8d9b5] rounded-xl shadow-lg px-3 py-2.5">
                        <p className="text-sm text-gray-400">Nenhum restaurante encontrado.</p>
                      </div>
                    );
                  })()}
                </div>
                {inputError && <p className="text-xs text-red-500 mt-1 px-1">{inputError}</p>}
              </div>
            )}

            {step === 'done' && (
              <div className="border-t border-[#e8d9b5] p-3 text-center flex-shrink-0">
                <button
                  onClick={startChat}
                  className="text-xs text-[#660000] hover:underline font-semibold"
                >
                  Fazer outra reserva
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
