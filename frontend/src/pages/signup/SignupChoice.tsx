import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/shared';
import '../login/Login';

export default function SignupChoice() {
  const [selectedType, setSelectedType] = useState<'restaurant' | 'consumer' | null>(null);
  const navigate = useNavigate();

  const handleCardClick = (type: 'restaurant' | 'consumer') => {
    setSelectedType(type);
  };

  const handleProceed = () => {
    if (selectedType === 'restaurant') {
      navigate('/cadastro/restaurante');
    } else if (selectedType === 'consumer') {
      navigate('/cadastro/consumidor');
    }
  };

  return (
    <div 
      className="min-h-screen w-full relative overflow-hidden flex"
      style={{
        backgroundImage: 'url(/assets/imagem.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Coluna esquerda - Imagem (55%) */}
      <div className="hidden lg:block w-7/12 relative">
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Coluna direita - Formulário de Signup (45%) */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 overflow-y-auto relative z-10">
        
        {/* Card com Glassmorfismo */}
        <div className="glass-card-golden w-full max-w-lg shadow-2xl p-0 overflow-hidden flex flex-col">
          
          {/* FAIXA VERMELHA CORRIGIDA */}
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
            {/* Botão Voltar no canto esquerdo */}
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

            {/* Título perfeitamente centralizado em beje */}
            <h2 className="absolute text-white left-1/2 -translate-x-1/2 m-0 font-bold text-xl" style={{ color: '#FFFFFF' }}>  
              Cadastro
            </h2>
          </div>

          {/* SUBTÍTULO */}
          <div className="w-full px-6 py-4 bg-white flex-shrink-0 border-b border-gray-100 text-center">
            <p className="text-[#C92924] font-semibold text-sm m-0">
              Primeiro, escolha como deseja se cadastrar
            </p>
          </div>

          {/* CONTEÚDO COM SELEÇÃO */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
            <div className="grid grid-cols-2 gap-16 mb-8 w-full max-w-md mx-auto">
              
              {/* Card Restaurante */}
              <div 
                className={`rounded-lg overflow-hidden cursor-pointer transition-all shadow-md hover:shadow-lg ${
                  selectedType === 'restaurant' ? 'ring-4 ring-[#C92924]' : ''
                }`}
                onClick={() => handleCardClick('restaurant')}
                role="button"
                tabIndex={0}
              >
                <div className="bg-gradient-to-r from-[#FDF2E9] to-[#FAE8D8] px-4 py-4 text-center border-b-2 border-[#e8dfd5]">
                  <div className="mb-2">
                    <img src="/assets/fast-food.png" alt="Fast Food" className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-sm font-bold text-[#6B4423] m-0">Sou um Restaurante</h3>
                </div>
                <div className="px-4 py-4 bg-[#FFFDFB]">
                  <ul className="space-y-2 text-xs text-[#6B4423] list-none m-0 p-0">
                    <li className="flex items-start">
                      <span className="text-[#D4AF37] font-bold mr-2 text-sm">✓</span>
                      <span>Central de pedidos</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#D4AF37] font-bold mr-2 text-sm">✓</span>
                      <span>Gestão de cardápio</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#D4AF37] font-bold mr-2 text-sm">✓</span>
                      <span>Relatórios</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Card Consumidor */}
              <div 
                className={`rounded-lg overflow-hidden cursor-pointer transition-all shadow-md hover:shadow-lg ${
                  selectedType === 'consumer' ? 'ring-4 ring-[#C92924]' : ''
                }`}
                onClick={() => handleCardClick('consumer')}
                role="button"
                tabIndex={0}
              >
                <div className="bg-gradient-to-r from-[#FDF2E9] to-[#FAE8D8] px-4 py-4 text-center border-b-2 border-[#e8dfd5]">
                  <div className="mb-2">
                    <img src="/assets/restaurant.png" alt="Restaurant" className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-sm font-bold text-[#6B4423] m-0">Sou um Consumidor</h3>
                </div>
                <div className="px-4 py-4 bg-[#FFFDFB]">
                  <ul className="space-y-2 text-xs text-[#6B4423] list-none m-0 p-0">
                    <li className="flex items-start">
                      <span className="text-[#D4AF37] font-bold mr-2 text-sm">✓</span>
                      <span>Busque restaurantes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#D4AF37] font-bold mr-2 text-sm">✓</span>
                      <span>Compare preços</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#D4AF37] font-bold mr-2 text-sm">✓</span>
                      <span>Salve favoritos</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* BOTÃO PROSSEGUIR */}
            <Button
              type="button"
              variant="primary"
              className="w-full max-w-xs py-2 font-bold text-sm button-depth mb-6"
              onClick={handleProceed}
              disabled={!selectedType}
            >
              Acessar conta
            </Button>

            {/* RODAPÉ LOGIN */}
            <div className="text-center pt-4 border-t border-[#D4AF37]/30 w-full">
              <p className="text-[#C92924]/70 text-xs mb-2">Já tem uma conta?</p>
              <Link 
                to="/login" 
                className="inline-block w-full max-w-xs border-2 border-gray-300 font-bold text-xs py-2 px-4 rounded-lg text-[#C92924] hover:border-[#D4AF37] hover:bg-white transition-colors"
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