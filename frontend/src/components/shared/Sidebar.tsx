import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { menuItems } from '../../lib/menuConfig';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loginWithProfile, hasMultipleProfiles } = useAuth();
  const [isExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const consumerItems = menuItems.filter(
    item => item.id !== 'separator' && !item.submenu && item.allowedRoles.includes('consumer')
  );

  const visibleItems = user
    ? menuItems.filter(item => item.id !== 'separator' && !item.submenu && item.allowedRoles.includes(user.type))
    : consumerItems;

  const NavItem = ({ item }: { item: typeof visibleItems[0] }) => {
    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
    const isLocked = !user && (item as any).requiresAuth;

    return (
      <li>
        <Link
          to={item.path}
          title={!isExpanded && !mobileOpen ? item.label : ''}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
            isActive
              ? 'bg-white/15 text-white font-semibold shadow-inner'
              : isLocked
              ? 'text-white/30 cursor-pointer'
              : 'text-white/75 hover:bg-white/10 hover:text-white'
          }`}
        >
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
          )}
          <span className="text-lg flex-shrink-0 leading-none">{item.icon}</span>
          <span className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded || mobileOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'}`}>
            {item.label}
          </span>
          {isLocked && (isExpanded || mobileOpen) && (
            <span className="ml-auto text-xs opacity-50">🔒</span>
          )}
        </Link>
      </li>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <style>{`
        .sidebar-nav::-webkit-scrollbar { width: 4px; }
        .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
        .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        .sidebar-nav { scrollbar-color: rgba(255,255,255,0.2) transparent; scrollbar-width: thin; }
      `}</style>

      {/* Logo — fixa no topo */}
      <div className="flex-shrink-0 flex items-center justify-center px-3 py-5 border-b border-white/10">
        <img
          src="/assets/logo_2.png"
          alt="MyMenu"
          className={`object-contain transition-all duration-300 ${isExpanded || mobileOpen ? 'w-36 h-auto' : 'w-10 h-10'}`}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto sidebar-nav py-4">
        <ul className="space-y-1 px-2">
          {visibleItems.map(item => <NavItem key={item.id} item={item} />)}
        </ul>
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t border-white/10" />

      {/* Footer */}
      <div className="flex-shrink-0 p-2 pb-4">
        {user ? (
          <>
            {/* Avatar + nome */}
            <div className={`flex items-center gap-3 px-3 py-2 mb-1 rounded-xl ${isExpanded || mobileOpen ? 'bg-white/10' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
                {user.name?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <div className={`overflow-hidden transition-all duration-300 ${isExpanded || mobileOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'}`}>
                <p className="text-white text-xs font-semibold truncate">{user.name}</p>
                <p className="text-white/50 text-[10px] truncate">{user.email}</p>
              </div>
            </div>
            {hasMultipleProfiles && (
              <button
                onClick={async () => {
                  const target = user!.type === 'admin' ? 'consumer' : 'admin';
                  await loginWithProfile(target);
                  navigate(target === 'admin' ? '/admin/dashboard' : '/');
                  setMobileOpen(false);
                }}
                title={user?.type === 'admin' ? 'Ir para área do consumidor' : 'Ir para área do restaurante'}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm"
              >
                <span className="text-lg flex-shrink-0">🔄</span>
                <span className={`whitespace-nowrap transition-all duration-300 ${isExpanded || mobileOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'}`}>
                  {user?.type === 'admin' ? 'Área do Cliente' : 'Área do Restaurante'}
                </span>
              </button>
            )}
            <button
              onClick={() => { logout(); setMobileOpen(false); }}
              title="Sair"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm"
            >
              <span className="text-lg flex-shrink-0">🚪</span>
              <span className={`whitespace-nowrap transition-all duration-300 ${isExpanded || mobileOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'}`}>
                Sair
              </span>
            </button>
          </>
        ) : (
          <button
            onClick={() => { navigate('/login'); setMobileOpen(false); }}
            title="Entrar / Cadastrar"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fff0f0 100%)', color: '#7f0000', boxShadow: '0 4px 0 #b91c1c, 0 6px 16px rgba(185,28,28,0.3)' }}
          >
            <span className="text-lg flex-shrink-0">🔑</span>
            <span className="whitespace-nowrap">
              Entrar / Cadastrar
            </span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Botão hamburguer — mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg text-white"
        style={{ backgroundColor: '#660000' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar mobile (drawer) */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full z-50 w-64 shadow-2xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: '#660000' }}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {sidebarContent}
      </aside>

      {/* Sidebar desktop (hover expand) */}
      <aside
        className={`hidden lg:flex flex-col ${isExpanded ? 'w-56' : 'w-[72px]'} h-screen sticky top-0 shadow-xl flex-shrink-0`}
        style={{ backgroundColor: '#660000' }}

      >
        {sidebarContent}
      </aside>
    </>
  );
}
