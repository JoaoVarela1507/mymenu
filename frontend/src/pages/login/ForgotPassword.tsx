import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

import { Input, Button, ImageCarousel } from '../../components/shared';
import './Login.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'success'>('email');
  const [userInfo, setUserInfo] = useState<{ name: string; userType: string } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Envia o email de reset pelo Firebase Auth (não exige permissão Firestore)
      await sendPasswordResetEmail(auth, email);

      // 2. Tenta buscar nome/tipo no Firestore — falha silenciosa se sem permissão
      let name = '';
      let userType = 'Consumidor';
      try {
        const usersSnap = await getDocs(query(collection(db, 'users'), where('email', '==', email)));
        if (!usersSnap.empty) {
          const data = usersSnap.docs[0].data();
          name = data.name ?? '';
          userType = (data.type === 'admin' || data.role === 'admin') ? 'Restaurante' : 'Consumidor';
        }
      } catch (_) { /* sem permissão — ignora, o email já foi enviado */ }

      setUserInfo({ name, userType });
      setStep('success');
    } catch (err: any) {
      const code = err?.code ?? '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-email' || code === 'auth/invalid-credential') {
        setError('Email não encontrado em nosso sistema');
      } else if (code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
      } else {
        setError('Erro ao enviar o email. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmail('');
    setStep('email');
    setError('');
    setUserInfo(null);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex">
      {/* Coluna esquerda - Carrossel (55%) */}
      <div className="hidden lg:flex lg:w-7/12 relative">
        <ImageCarousel />
      </div>

      {/* Coluna direita - Formulário (45%) */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 overflow-y-auto relative z-10">
        {/* Card com Glassmorfismo */}
        <div className="glass-card-golden w-full max-w-lg shadow-2xl p-0 overflow-hidden flex flex-col">
          
          {/* FAIXA VERMELHA */}
          <div 
            className="bg-[#A30000] flex-shrink-0 flex items-center border-b-4 border-[#8B0000] relative" 
            style={{
              marginLeft: '-50px',
              marginRight: '-50px',
              marginTop: '-50px',
              marginBottom: '0',
              paddingLeft: '50px',
              paddingRight: '50px',
              paddingTop: '1.5rem',
              paddingBottom: '1.5rem',
              width: 'calc(100% + 100px)',
              position: 'relative'
            }}
          >
            {/* Botão Voltar */}
            <button
              onClick={() => navigate(-1)}
              className="text-white hover:opacity-80 transition-opacity font-bold"
              style={{
                position: 'absolute',
                right: '180px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Voltar"
            >
              <img src="/assets/voltar.png" alt="Voltar" style={{ width: '32px', height: '32px' }} />
            </button>

            {/* Título centralizado */}
            <h2 className="absolute text-white left-1/2 -translate-x-1/2 m-0 font-bold text-xl" style={{ color: '#FFFFFF' }}>
              Recuperar Senha
            </h2>
          </div>

          {/* CONTEÚDO */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
            <div className="w-full max-w-sm">
            {step === 'email' ? (
              <>
                <div className="text-left mb-6">
                  <p className="text-xs text-[#C92924]/70 m-0 whitespace-nowrap">Digite seu email para receber instruções</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-xs">
                      {error}
                    </div>
                  )}

                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="px-3 py-1.5 text-sm"
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-2 font-bold text-sm button-depth rounded-full bg-[#C92924] hover:bg-[#A02219]"
                    disabled={loading || !email}
                  >
                    {loading ? 'Enviando...' : 'Enviar Instruções'}
                  </Button>
                </form>

                <div className="text-center pt-4 border-t border-[#D4AF37]/30 mt-4">
                  <p className="text-[#C92924]/70 text-xs mb-2">Lembrou a senha?</p>
                  <Link 
                    to="/login" 
                    className="inline-block w-full border-2 border-gray-300 font-bold text-xs py-1.5 px-4 rounded-lg text-[#C92924] hover:border-[#D4AF37] transition-colors"
                    style={{ backgroundColor: '#FFF8E7' }}
                  >
                    Fazer login
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-4xl mb-4">✓</div>
                  <h2 className="text-lg font-bold text-[#6B4423] m-0 mb-2">Enviado com Sucesso!</h2>
                  <p className="text-sm text-[#6B4423] mb-4">
                    Enviamos as instruções de recuperação de senha para:<br />
                    <span className="font-bold">{email}</span>
                  </p>
                  <div className="bg-[#FFFDFB] p-4 rounded-lg border border-[#D4AF37]/20 mb-4">
                    <p className="text-xs text-[#6B4423] m-0">
                      <strong>Usuário:</strong> {userInfo?.name}<br />
                      <strong>Tipo:</strong> {userInfo?.userType}
                    </p>
                  </div>
                  <p className="text-xs text-[#C92924]/70 mb-4">
                    Verifique sua caixa de entrada e siga as instruções no email.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full py-2 font-bold text-sm button-depth rounded-full bg-[#C92924] hover:bg-[#A02219]"
                    onClick={handleReset}
                  >
                    Tentar Novamente
                  </Button>

                  <Link 
                    to="/login" 
                    className="inline-block w-full border-2 border-[#C92924] font-bold text-xs py-1.5 px-4 rounded-lg text-[#C92924] hover:bg-[#C92924] hover:text-white transition-colors text-center"
                  >
                    Voltar ao Login
                  </Link>
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
