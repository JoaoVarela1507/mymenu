import { useState } from 'react';
import { PageHeader } from '../../components/shared';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function Profile() {
  const { user } = useAuth();
  const { favorites } = useFavorites();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const isGoogleUser = auth.currentUser?.providerData.some(p => p.providerId === 'google.com');

  const handleChangePassword = async () => {
    setPwError('');
    if (!pwForm.current) { setPwError('Digite sua senha atual.'); return; }
    if (pwForm.next.length < 6) { setPwError('A nova senha deve ter no mínimo 6 caracteres.'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError('As senhas não coincidem.'); return; }

    setSaving(true);
    try {
      const currentUser = auth.currentUser!;
      const credential = EmailAuthProvider.credential(currentUser.email!, pwForm.current);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, pwForm.next);
      setPwSuccess(true);
      setPwForm({ current: '', next: '', confirm: '' });
      setShowPasswordForm(false);
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setPwError('Senha atual incorreta.');
      } else {
        setPwError('Erro ao alterar senha. Tente novamente.');
      }
    }
    setSaving(false);
  };

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="Meu Perfil"
        subtitle="Suas informações pessoais"
        icon="👤"
      />

      <div className="container mx-auto max-w-2xl px-4 py-8 space-y-5">

        {/* Card principal */}
        <div className="bg-[#fdf6ec] border border-[#e8d9b5] rounded-2xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #660000, #C92924)' }}>
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
            <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-[#660000]/10 text-[#660000] font-semibold">
              {user?.type === 'admin' ? '🏪 Restaurante' : '🛒 Consumidor'}
            </span>
          </div>
          <div className="text-center flex-shrink-0">
            <p className="text-2xl font-bold text-[#660000]">{favorites.length}</p>
            <p className="text-xs text-gray-500">Favoritos</p>
          </div>
        </div>

        {/* Segurança */}
        <div className="bg-[#fdf6ec] border border-[#e8d9b5] rounded-2xl p-6">
          <h3 className="text-base font-bold text-gray-800 mb-3">🔒 Segurança</h3>

          {isGoogleUser ? (
            <p className="text-sm text-gray-500">Conta vinculada ao Google — a senha é gerenciada pelo Google.</p>
          ) : (
            <>
              {pwSuccess && (
                <p className="text-sm text-green-600 font-semibold mb-3">✅ Senha alterada com sucesso!</p>
              )}
              {!showPasswordForm ? (
                <button
                  onClick={() => { setShowPasswordForm(true); setPwSuccess(false); }}
                  className="text-sm px-4 py-2 rounded-lg border-2 border-[#660000] text-[#660000] font-semibold hover:bg-[#660000] hover:text-white transition-colors"
                >
                  🔑 Alterar Senha
                </button>
              ) : (
                <div className="space-y-3">
                  {pwError && <p className="text-xs text-red-600 font-medium">{pwError}</p>}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Senha atual</label>
                    <input
                      type="password"
                      value={pwForm.current}
                      onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
                      placeholder="••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nova senha</label>
                    <input
                      type="password"
                      value={pwForm.next}
                      onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Confirmar nova senha</label>
                    <input
                      type="password"
                      value={pwForm.confirm}
                      onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660000]"
                      placeholder="••••••"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleChangePassword}
                      disabled={saving}
                      className="px-4 py-2 bg-[#660000] text-white text-sm font-semibold rounded-lg hover:bg-[#550000] transition-colors disabled:opacity-60"
                    >
                      {saving ? 'Salvando...' : '💾 Salvar'}
                    </button>
                    <button
                      onClick={() => { setShowPasswordForm(false); setPwError(''); setPwForm({ current: '', next: '', confirm: '' }); }}
                      className="px-4 py-2 border border-gray-300 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Conta */}
        <div className="bg-[#fdf6ec] border border-[#e8d9b5] rounded-2xl p-6">
          <h3 className="text-base font-bold text-gray-800 mb-3">📋 Dados da Conta</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Nome</span>
              <span className="font-semibold text-gray-800">{user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-semibold text-gray-800">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tipo de conta</span>
              <span className="font-semibold text-gray-800 capitalize">{user?.type === 'admin' ? 'Restaurante' : 'Consumidor'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Login</span>
              <span className="font-semibold text-gray-800">{isGoogleUser ? 'Google' : 'Email / Senha'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
