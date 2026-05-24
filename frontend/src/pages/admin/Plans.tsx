import { useState } from 'react';
import { Card, Button, PageHeader } from '../../components/shared';
import { useAuth } from '../../contexts/AuthContext';
import { updateRestaurantAppearance } from '../../lib/firestoreService';
import {
  PLAN_RULES,
  getCurrentPlan,
  getCurrentPaymentMethod,
  setCurrentPlan,
  setCurrentPaymentMethod,
  planLimitLabel,
  type SubscriptionPlan,
  type PaymentMethod,
} from '../../lib/subscriptionPlan';

export default function Plans() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(getCurrentPlan());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(getCurrentPaymentMethod());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const planList = [PLAN_RULES.prata, PLAN_RULES.ouro, PLAN_RULES.diamante];

  const handleSaveSubscription = async () => {
    setCurrentPlan(selectedPlan);
    setCurrentPaymentMethod(paymentMethod);
    if (user?.id) {
      setSaving(true);
      await updateRestaurantAppearance(user.id, { plan: selectedPlan } as any);
      setSaving(false);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f5ef' }}>
      <PageHeader
        title="Planos de Assinatura"
        subtitle="Escolha o plano ideal para o crescimento do seu restaurante"
        icon="💳"
      />

      <div className="max-w-7xl mx-auto px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {planList.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <Card
                key={plan.id}
                className={`border-2 transition-all ${
                  isSelected ? 'shadow-xl scale-[1.01]' : 'hover:shadow-lg'
                }`}
                style={{ borderColor: isSelected ? '#660000' : '#e5e7eb' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-3xl mb-2">{plan.icon}</p>
                    <h3 className="text-2xl font-bold text-gray-800">{plan.label}</h3>
                  </div>
                  {isSelected && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#660000' }}>
                      Plano Atual
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-3xl font-bold" style={{ color: '#660000' }}>
                    R$ {plan.monthlyPrice.toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-sm text-gray-600">por mês</p>
                </div>

                <div className="space-y-2 text-sm text-gray-700 mb-6">
                  <p>• Cadastro de restaurantes: {planLimitLabel(plan.maxRestaurants)}</p>
                  <p>• Produtos: {planLimitLabel(plan.maxProducts)}</p>
                  <p>• Relatórios avançados: {plan.advancedReports ? 'Sim' : 'Não'}</p>
                  <p>• Cupons de desconto: {plan.coupons ? 'Sim' : 'Não'}</p>
                  <p>• Multiusuários: {plan.multiUsers ? 'Sim' : 'Não'}</p>
                  <p>• Dashboard completo: {plan.dashboardComplete ? 'Sim' : 'Não'}</p>
                  <p>• Suporte: {plan.support.toUpperCase()}</p>
                </div>

                <Button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full py-2 rounded-lg font-semibold ${
                    isSelected ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={isSelected ? { backgroundColor: '#660000' } : undefined}
                >
                  {isSelected ? 'Selecionado' : 'Selecionar Plano'}
                </Button>
              </Card>
            );
          })}
        </div>

        <Card className="border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">💸 Pagamento Mensal</h2>
          <p className="text-sm text-gray-600 mb-4">Escolha o método para cobrança recorrente mensal.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setPaymentMethod('pix')}
              className={`text-left rounded-xl border-2 p-4 transition-all ${
                paymentMethod === 'pix' ? 'border-[#660000] bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className="text-lg font-bold text-gray-800">📱 Pix</p>
              <p className="text-sm text-gray-600 mt-1">Pagamento instantâneo e confirmação automática.</p>
            </button>

            <button
              onClick={() => setPaymentMethod('boleto')}
              className={`text-left rounded-xl border-2 p-4 transition-all ${
                paymentMethod === 'boleto' ? 'border-[#660000] bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className="text-lg font-bold text-gray-800">🧾 Boleto</p>
              <p className="text-sm text-gray-600 mt-1">Emissão mensal com vencimento programado.</p>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-700">
              Plano escolhido: <span className="font-bold">{PLAN_RULES[selectedPlan].icon} {PLAN_RULES[selectedPlan].label}</span>
              {' '}• Pagamento: <span className="font-bold">{paymentMethod === 'pix' ? 'Pix' : 'Boleto'}</span>
            </p>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSaveSubscription}
                disabled={saving}
                className="bg-[#660000] hover:bg-[#550000] text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-60"
              >
                {saving ? 'Salvando...' : '💾 Salvar Assinatura'}
              </Button>
              {saved && <span className="text-sm text-green-600 font-semibold">✅ Salvo!</span>}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
