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

// ── Validações ────────────────────────────────────────────
function validateCNPJ(cnpj: string) {
  const d = cnpj.replace(/\D/g, '');
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const calc = (x: number) => {
    let sum = 0, pos = x - 7;
    for (let i = x; i >= 1; i--) {
      sum += parseInt(d[x - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    return sum % 11 < 2 ? 0 : 11 - (sum % 11);
  };
  return calc(12) === parseInt(d[12]) && calc(13) === parseInt(d[13]);
}

const BR_STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const categories = ['Brasileira','Pizza','Lanches','Japonesa','Italiana','Mexicana','Árabe','Saudável','Doces','Bebidas','Padaria','Outros'];

type Field = {
  restaurantName: string; cnpj: string; restaurantPhone: string;
  category: string; address: string; city: string; state: string;
  cep: string; description: string;
  name: string; phone: string; email: string;
  password: string; confirmPassword: string;
};

type Errors = Partial<Record<keyof Field, string>>;

export default function SignupRestaurant() {
  const navigate = useNavigate();
  const [fields, setFields] = useState<Field>({
    restaurantName: '', cnpj: '', restaurantPhone: '',
    category: '', address: '', city: '', state: '', cep: '', description: '',
    name: '', phone: '', email: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailHasAccount, setEmailHasAccount] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);

  const set = (key: keyof Field, raw: string) => {
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
      // Se existe no Auth (seja consumidor ou admin), esconde campos de senha
      setEmailHasAccount(data.exists);
      setEmailChecked(true);
    } catch {}
    setEmailChecking(false);
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!fields.restaurantName.trim()) e.restaurantName = 'Informe o nome do restaurante';
    if (fields.cnpj.replace(/\D/g, '').length < 14) e.cnpj = 'CNPJ deve ter 14 dígitos';
    if (fields.restaurantPhone.replace(/\D/g, '').length < 10) e.restaurantPhone = 'Telefone inválido';
    if (!fields.category) e.category = 'Selecione uma categoria';
    if (!fields.address.trim()) e.address = 'Informe o endereço';
    if (!fields.city.trim()) e.city = 'Informe a cidade';
    if (!fields.state) e.state = 'Selecione o estado';
    if (fields.cep.replace(/\D/g, '').length !== 8) e.cep = 'CEP inválido';
    if (!fields.name.trim()) e.name = 'Informe seu nome';
    if (fields.phone.replace(/\D/g, '').length < 10) e.phone = 'Telefone inválido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) e.email = 'Email inválido';
    if (!emailHasAccount) {
      if (fields.password.length < 6) e.password = 'Mínimo 6 caracteres';
      if (fields.password !== fields.confirmPassword) e.confirmPassword = 'Senhas não coincidem';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    if (!emailChecked) { setServerError('Verifique o email antes de continuar (saia do campo email)'); return; }
    if (!acceptTerms) { setServerError('Aceite os termos de uso'); return; }

    setLoading(true);
    try {
      const res = await authService.registerRestaurant({ 
        ...fields,
        password: emailHasAccount ? '' : fields.password,
        confirmPassword: emailHasAccount ? '' : fields.confirmPassword,
      });
      if (res.success) {
        navigate('/login');
      } else {
        setServerError(res.message || 'Erro ao criar conta');
      }
    } catch {
      setServerError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (id: keyof Field, label: string, placeholder: string, type = 'text') => (
    <div>
      <label className="block text-xs font-semibold text-[#6B4423] mb-1">{label}</label>
      <input
        type={type}
        value={fields[id]}
        onChange={e => set(id, e.target.value)}
        onBlur={id === 'email' ? e => checkEmail(e.target.value) : undefined}
        placeholder={placeholder}
        className={`w-full px-3 py-2 text-sm rounded-lg border transition-all outline-none bg-white/80 ${
          errors[id]
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-[#D4AF37] focus:border-[#C92924] focus:ring-2 focus:ring-[#C92924]/10'
        }`}
      />
      {errors[id] && <p className="text-red-500 text-[11px] mt-0.5">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex">
      <div className="hidden lg:flex lg:w-7/12 relative">
        <ImageCarousel />
      </div>

      <div className="w-full lg:w-5/12 flex items-start justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 overflow-y-auto relative z-10">
        <div className="glass-card-golden w-full max-w-lg shadow-2xl p-0 overflow-hidden flex flex-col my-4">

          {/* Header */}
          <div className="bg-[#A30000] flex-shrink-0 flex items-center justify-center relative px-6 py-4 border-b-4 border-[#8B0000]">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-4 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center">
              <h2 className="text-white font-bold text-lg leading-none">Cadastro de Restaurante</h2>
              <p className="text-white/70 text-xs mt-0.5">Crie sua conta de administrador</p>
            </div>
          </div>

          <div className="px-6 py-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>

              {/* ── DADOS DO RESTAURANTE ── */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🏪</span>
                  <h3 className="text-xs font-black text-[#6B4423] tracking-widest uppercase">Dados do Restaurante</h3>
                </div>
                <div className="space-y-3">
                  {renderField('restaurantName', 'Nome do Restaurante *', 'Ex: Pizzaria Bella')}
                  {renderField('cnpj', 'CNPJ *', '00.000.000/0000-00')}
                  {renderField('restaurantPhone', 'Telefone do Restaurante *', '(11) 99999-9999')}

                  {/* Categoria — select */}
                  <div>
                    <label className="block text-xs font-semibold text-[#6B4423] mb-1">Categoria *</label>
                    <select
                      value={fields.category}
                      onChange={e => set('category', e.target.value)}
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition-all outline-none bg-white/80 ${
                        errors.category
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-[#D4AF37] focus:border-[#C92924] focus:ring-2 focus:ring-[#C92924]/10'
                      }`}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <p className="text-red-500 text-[11px] mt-0.5">{errors.category}</p>}
                  </div>

                  {renderField('description', 'Descrição (opcional)', 'Breve descrição do seu restaurante')}
                </div>
              </section>

              {/* ── ENDEREÇO ── */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">📍</span>
                  <h3 className="text-xs font-black text-[#6B4423] tracking-widest uppercase">Endereço</h3>
                </div>
                <div className="space-y-3">
                  {renderField('cep', 'CEP *', '00000-000')}
                  {renderField('address', 'Endereço Completo *', 'Rua, número, bairro')}

                  <div className="grid grid-cols-2 gap-3">
                    {renderField('city', 'Cidade *', 'São Paulo')}

                    {/* Estado — select */}
                    <div>
                      <label className="block text-xs font-semibold text-[#6B4423] mb-1">Estado *</label>
                      <select
                        value={fields.state}
                        onChange={e => set('state', e.target.value)}
                        className={`w-full px-3 py-2 text-sm rounded-lg border transition-all outline-none bg-white/80 ${
                          errors.state
                            ? 'border-red-400'
                            : 'border-[#D4AF37] focus:border-[#C92924] focus:ring-2 focus:ring-[#C92924]/10'
                        }`}
                      >
                        <option value="">UF</option>
                        {BR_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {errors.state && <p className="text-red-500 text-[11px] mt-0.5">{errors.state}</p>}
                    </div>
                  </div>
                </div>
              </section>

              {/* ── DADOS DO ADMIN ── */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">👤</span>
                  <h3 className="text-xs font-black text-[#6B4423] tracking-widest uppercase">Seus Dados (Administrador)</h3>
                </div>
                <div className="space-y-3">
                  {renderField('name', 'Nome Completo *', 'Seu nome')}
                  {renderField('phone', 'Seu Telefone *', '(11) 99999-9999')}
                  {renderField('email', 'Email *', 'seu@restaurante.com', 'email')}
                  {emailChecking && <p className="text-xs text-gray-400 animate-pulse">Verificando email...</p>}
                  {emailChecked && emailHasAccount && (
                    <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
                      <p className="text-amber-700 text-xs font-medium">⚠️ Este email já possui uma conta. O restaurante será vinculado a ela. <strong>Use a mesma senha da sua conta existente</strong> para fazer login e acessar os dois perfis.</p>
                      <p className="text-amber-600 text-xs mt-1">Deseja usar uma senha diferente? <strong>Cadastre com outro email.</strong></p>
                    </div>
                  )}
                  {emailChecked && !emailHasAccount && (
                    <>
                      {renderField('password', 'Senha *', 'Mínimo 6 caracteres', 'password')}
                      {renderField('confirmPassword', 'Confirmar Senha *', 'Digite a senha novamente', 'password')}
                    </>
                  )}
                  {!emailChecked && !emailChecking && fields.email && (
                    <p className="text-xs text-gray-400">Saia do campo email para verificar disponibilidade</p>
                  )}
                </div>
              </section>

              {/* Termos */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={e => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 accent-[#C92924]"
                />
                <span className="text-xs text-[#6B4423]/70">
                  Aceito os{' '}
                  <a href="#" className="text-[#C92924] hover:underline">termos de uso</a>
                  {' '}e{' '}
                  <a href="#" className="text-[#C92924] hover:underline">política de privacidade</a>
                </span>
              </label>

              {serverError && (
                <div className="bg-red-100/80 border border-red-300 rounded-lg p-2">
                  <p className="text-red-700 text-xs font-medium">{serverError}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 font-bold text-sm button-depth rounded-xl"
                disabled={loading}
              >
                {loading ? 'Criando conta...' : 'Criar conta de restaurante'}
              </Button>
            </form>

            <div className="text-center pt-3 border-t border-[#D4AF37]/30">
              <p className="text-[#C92924]/70 text-xs mb-2">Já tem uma conta?</p>
              <Link
                to="/login"
                className="inline-block w-full border-2 border-gray-300 font-bold text-xs py-2 px-4 rounded-lg text-[#C92924] hover:border-[#D4AF37] transition-colors"
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
