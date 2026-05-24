import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, ImageCarousel } from '../../components/shared';
import { authService } from '../../services/api';

// ── Máscaras ──────────────────────────────────────────────
function maskCNPJ(v: string) {
  return v.replace(/\D/g, '').slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}
function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
}
function maskCEP(v: string) {
  return v.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');
}

const BR_STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const CATEGORIES = ['Brasileira','Pizza','Lanches','Japonesa','Italiana','Mexicana','Árabe','Saudável','Doces','Bebidas','Padaria','Outros'];
const STEPS = [
  { label: 'Restaurante', icon: '🏪' },
  { label: 'Endereço',    icon: '📍' },
  { label: 'Sua Conta',   icon: '👤' },
];

type FormFields = {
  restaurantName: string; cnpj: string; restaurantPhone: string;
  category: string; address: string; city: string; state: string;
  cep: string; description: string;
  name: string; phone: string; email: string;
  password: string; confirmPassword: string;
};
type FormErrors = Partial<Record<keyof FormFields, string>>;

// ── FormField definido FORA do componente pai para evitar re-mounts ──
interface FormFieldProps {
  id: keyof FormFields;
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  error?: string;
  onChange: (id: keyof FormFields, val: string) => void;
  onBlur?: () => void;
}
function FormField({ id, label, placeholder, type = 'text', value, error, onChange, onBlur }: FormFieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(id, e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 text-sm rounded-xl border transition-all outline-none bg-white/80 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-[#D4AF37] focus:border-[#C92924] focus:ring-2 focus:ring-[#C92924]/10'
        }`}
      />
      {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────
export default function SignupRestaurant() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [fields, setFields] = useState<FormFields>({
    restaurantName: '', cnpj: '', restaurantPhone: '',
    category: '', address: '', city: '', state: '', cep: '', description: '',
    name: '', phone: '', email: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailHasAccount, setEmailHasAccount] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);

  const set = (key: keyof FormFields, raw: string) => {
    let val = raw;
    if (key === 'cnpj') val = maskCNPJ(raw);
    if (key === 'restaurantPhone' || key === 'phone') val = maskPhone(raw);
    if (key === 'cep') val = maskCEP(raw);
    if (key === 'email') { setEmailHasAccount(false); setEmailChecking(false); setEmailChecked(false); }
    setFields(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  const checkEmail = async (email: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setEmailChecking(true);
    setEmailChecked(false);
    try {
      const res = await fetch(`http://localhost:8000/restaurant/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setEmailHasAccount(data.exists);
      setEmailChecked(true);
    } catch {}
    setEmailChecking(false);
  };

  const validateStep = (s: number): boolean => {
    const e: FormErrors = {};
    if (s === 0) {
      if (!fields.restaurantName.trim()) e.restaurantName = 'Informe o nome do restaurante';
      if (fields.cnpj.replace(/\D/g, '').length < 14) e.cnpj = 'CNPJ deve ter 14 dígitos';
      if (fields.restaurantPhone.replace(/\D/g, '').length < 10) e.restaurantPhone = 'Telefone inválido';
      if (!fields.category) e.category = 'Selecione uma categoria';
    }
    if (s === 1) {
      if (fields.cep.replace(/\D/g, '').length !== 8) e.cep = 'CEP inválido';
      if (!fields.address.trim()) e.address = 'Informe o endereço';
      if (!fields.city.trim()) e.city = 'Informe a cidade';
      if (!fields.state) e.state = 'Selecione o estado';
    }
    if (s === 2) {
      if (!fields.name.trim()) e.name = 'Informe seu nome';
      if (fields.phone.replace(/\D/g, '').length < 10) e.phone = 'Telefone inválido';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) e.email = 'Email inválido';
      if (!emailHasAccount) {
        if (fields.password.length < 6) e.password = 'Mínimo 6 caracteres';
        if (fields.password !== fields.confirmPassword) e.confirmPassword = 'Senhas não coincidem';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setServerError('');
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setServerError('');
    if (step === 0) navigate(-1);
    else setStep(s => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validateStep(2)) return;
    if (!emailChecked) { setServerError('Saia do campo email para verificar disponibilidade'); return; }
    if (!acceptTerms) { setServerError('Aceite os termos de uso para continuar'); return; }
    setLoading(true);
    try {
      const res = await authService.registerRestaurant({
        ...fields,
        password: emailHasAccount ? '' : fields.password,
        confirmPassword: emailHasAccount ? '' : fields.confirmPassword,
      });
      if (res.success) navigate('/login');
      else setServerError(res.message || 'Erro ao criar conta');
    } catch {
      setServerError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const selectClass = (key: keyof FormFields) =>
    `w-full px-3 py-2.5 text-sm rounded-xl border transition-all outline-none bg-white/80 ${
      errors[key]
        ? 'border-red-400 focus:border-red-500'
        : 'border-[#D4AF37] focus:border-[#C92924] focus:ring-2 focus:ring-[#C92924]/10'
    }`;

  return (
    <div className="h-screen w-full overflow-hidden flex">
      {/* Imagem lateral */}
      <div className="hidden lg:flex lg:w-7/12 relative h-full">
        <ImageCarousel />
      </div>

      {/* Painel do formulário */}
      <div className="w-full lg:w-5/12 h-full flex flex-col items-center justify-start p-6 bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">
        <div className="glass-card-golden w-full max-w-lg shadow-2xl overflow-hidden flex flex-col flex-1 min-h-0">

          {/* ── Header fixo ── */}
          <div className="bg-[#A30000] flex-shrink-0 px-5 pt-4 pb-5 border-b-4 border-[#8B0000]">

            {/* Linha título */}
            <div className="relative flex items-center justify-center mb-4">
              <button
                onClick={handleBack}
                className="absolute left-0 hover:opacity-80 transition-opacity"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <img src="/assets/voltar.png" alt="Voltar" style={{ width: '32px', height: '32px' }} />
              </button>
              <div className="text-center">
                <h2 style={{ color: '#ffffff' }} className="font-extrabold text-base leading-none">Cadastro de Restaurante</h2>
                <p style={{ color: 'rgba(255,255,255,0.9)' }} className="text-xs mt-1 font-semibold">Etapa {step + 1} de {STEPS.length}</p>
              </div>
            </div>

            {/* Indicador de etapas */}
            <div className="flex items-center">
              {STEPS.map((s, i) => (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2 ${
                      i < step
                        ? 'bg-white border-white text-[#A30000] shadow'
                        : i === step
                          ? 'bg-white border-white text-[#A30000] shadow-lg scale-110'
                          : 'bg-transparent border-white/60 text-white/80'
                    }`}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    <span className={`text-[10px] mt-1.5 font-bold whitespace-nowrap ${
                      i < step  ? 'text-white' :
                      i === step ? 'text-white' :
                                   'text-white/60'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all ${i < step ? 'bg-white' : 'bg-white/30'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Conteúdo com scroll ── */}
          <div className="overflow-y-auto flex-1 px-6 py-5">
            <form onSubmit={handleSubmit} noValidate>

              {/* Etapa 1 — Restaurante */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🏪</span>
                    <div>
                      <p className="text-sm font-bold text-gray-700">Dados do Restaurante</p>
                      <p className="text-xs text-gray-700/60">Informações básicas do seu estabelecimento</p>
                    </div>
                  </div>

                  <FormField id="restaurantName" label="Nome do Restaurante *" placeholder="Ex: Pizzaria Bella" value={fields.restaurantName} error={errors.restaurantName} onChange={set} />
                  <FormField id="cnpj" label="CNPJ *" placeholder="00.000.000/0000-00" value={fields.cnpj} error={errors.cnpj} onChange={set} />
                  <FormField id="restaurantPhone" label="Telefone do Restaurante *" placeholder="(11) 99999-9999" value={fields.restaurantPhone} error={errors.restaurantPhone} onChange={set} />

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Categoria *</label>
                    <select value={fields.category} onChange={e => set('category', e.target.value)} className={selectClass('category')}>
                      <option value="">Selecione uma categoria</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <p className="text-red-500 text-[11px] mt-1">{errors.category}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Descrição <span className="font-normal text-gray-700/50">(opcional)</span>
                    </label>
                    <textarea
                      value={fields.description}
                      onChange={e => set('description', e.target.value)}
                      placeholder="Breve descrição do seu restaurante..."
                      rows={2}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#D4AF37] focus:border-[#C92924] focus:ring-2 focus:ring-[#C92924]/10 outline-none bg-white/80 resize-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Etapa 2 — Endereço */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📍</span>
                    <div>
                      <p className="text-sm font-bold text-gray-700">Endereço</p>
                      <p className="text-xs text-gray-700/60">Localização do seu restaurante</p>
                    </div>
                  </div>

                  <FormField id="cep" label="CEP *" placeholder="00000-000" value={fields.cep} error={errors.cep} onChange={set} />
                  <FormField id="address" label="Endereço Completo *" placeholder="Rua, número, bairro" value={fields.address} error={errors.address} onChange={set} />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField id="city" label="Cidade *" placeholder="São Paulo" value={fields.city} error={errors.city} onChange={set} />
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Estado *</label>
                      <select value={fields.state} onChange={e => set('state', e.target.value)} className={selectClass('state')}>
                        <option value="">UF</option>
                        {BR_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {errors.state && <p className="text-red-500 text-[11px] mt-1">{errors.state}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Etapa 3 — Sua Conta */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">👤</span>
                    <div>
                      <p className="text-sm font-bold text-gray-700">Seus Dados (Administrador)</p>
                      <p className="text-xs text-gray-700/60">Quem vai gerenciar o restaurante</p>
                    </div>
                  </div>

                  <FormField id="name" label="Nome Completo *" placeholder="Seu nome" value={fields.name} error={errors.name} onChange={set} />
                  <FormField id="phone" label="Seu Telefone *" placeholder="(11) 99999-9999" value={fields.phone} error={errors.phone} onChange={set} />
                  <FormField id="email" label="Email *" placeholder="seu@restaurante.com" type="email" value={fields.email} error={errors.email} onChange={set} onBlur={() => checkEmail(fields.email)} />

                  {emailChecking && <p className="text-xs text-gray-400 animate-pulse">Verificando email...</p>}

                  {emailChecked && emailHasAccount && (
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-3">
                      <p className="text-amber-700 text-xs font-medium">⚠️ Este email já possui uma conta. O restaurante será vinculado a ela.</p>
                      <p className="text-amber-600 text-xs mt-1">Use a mesma senha da sua conta existente ao fazer login.</p>
                    </div>
                  )}

                  {emailChecked && !emailHasAccount && (
                    <>
                      <FormField id="password" label="Senha *" placeholder="Mínimo 6 caracteres" type="password" value={fields.password} error={errors.password} onChange={set} />
                      <FormField id="confirmPassword" label="Confirmar Senha *" placeholder="Digite a senha novamente" type="password" value={fields.confirmPassword} error={errors.confirmPassword} onChange={set} />
                    </>
                  )}

                  {!emailChecked && !emailChecking && fields.email && (
                    <p className="text-xs text-gray-400">Saia do campo email para verificar disponibilidade</p>
                  )}

                  <label className="flex items-start gap-2 cursor-pointer pt-1">
                    <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} className="mt-0.5 accent-[#C92924]" />
                    <span className="text-xs text-gray-700/70">
                      Aceito os{' '}
                      <a href="#" className="text-[#C92924] hover:underline">termos de uso</a>
                      {' '}e{' '}
                      <a href="#" className="text-[#C92924] hover:underline">política de privacidade</a>
                    </span>
                  </label>

                  {serverError && (
                    <div className="bg-red-100/80 border border-red-300 rounded-xl p-3">
                      <p className="text-red-700 text-xs font-medium">{serverError}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Botões de navegação */}
              <div className={`flex gap-3 mt-6 ${step === 0 ? 'justify-end' : 'justify-between'}`}>
                {step > 0 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-2.5 border-2 border-[#D4AF37] text-gray-700 text-sm font-bold rounded-xl hover:bg-[#FFF8E7] transition-colors"
                  >
                    ← Voltar
                  </button>
                )}
                {step < 2 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 py-2.5 bg-[#C92924] text-white text-sm font-bold rounded-xl hover:bg-[#a81f1a] transition-colors"
                  >
                    Próximo →
                  </button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 py-2.5 font-bold text-sm rounded-xl"
                    disabled={loading}
                  >
                    {loading ? 'Criando conta...' : '✅ Criar conta'}
                  </Button>
                )}
              </div>
            </form>

            <div className="text-center mt-5 pt-4 border-t border-[#D4AF37]/30">
              <p className="text-[#C92924]/70 text-xs mb-2">Já tem uma conta?</p>
              <Link
                to="/login"
                className="inline-block w-full border-2 border-gray-300 font-bold text-xs py-2 px-4 rounded-xl text-[#C92924] hover:border-[#D4AF37] transition-colors"
                style={{ backgroundColor: '#FFF8E7' }}
              >
                Fazer login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
