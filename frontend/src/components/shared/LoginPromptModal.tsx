import { useNavigate } from 'react-router-dom';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function LoginPromptModal({ isOpen, onClose, message }: LoginPromptModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleConfirm = () => {
    navigate('/login');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-[#660000] mb-2">Login necessário</h2>
        <p className="text-gray-500 text-sm mb-6">
          {message ?? 'Para acessar este conteúdo você precisa estar logado.'}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleConfirm}
            className="w-full bg-[#C92924] text-white font-bold py-3 rounded-lg hover:bg-[#A02219] transition-colors"
          >
            Sim, fazer login
          </button>
          <button
            onClick={onClose}
            className="w-full border-2 border-gray-300 text-gray-600 font-semibold py-3 rounded-lg hover:border-gray-400 transition-colors"
          >
            Não, voltar
          </button>
        </div>
      </div>
    </div>
  );
}
