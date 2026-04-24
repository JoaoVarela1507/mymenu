import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { menuItems } from '../../lib/menuConfig';

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!user) return null;

  const filteredMenu = menuItems.filter(item => 
    item.allowedRoles.includes(user.type)
  );

  const handleLogout = () => {
    logout();
  };

  return (
    <aside 
      className={`${isExpanded ? 'w-56' : 'w-20'} text-white h-screen sticky top-0 flex flex-col shadow-lg transition-all duration-300`}
      style={{ backgroundColor: '#660000' }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <style>{`
        .sidebar-nav::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: #A07860;
          border-radius: 3px;
          opacity: 0.6;
        }
        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: #B89968;
          opacity: 0.8;
        }
        .sidebar-nav {
          scrollbar-color: #A07860 transparent;
          scrollbar-width: thin;
        }
      `}</style>

      {/* Logo Section - Logo Flutuante */}
      <div className="flex flex-col items-center justify-center py-6 px-4">
        <img 
          src="/assets/logo_2.png" 
          alt="MyMenu Logo" 
          className={`object-contain transition-all duration-300 ${isExpanded ? 'w-64 h-auto' : 'w-16 h-auto opacity-0'}`}
        />
      </div>

      {/* Menu - Fundo Vinho Uniforme */}
      <nav className="flex-1 overflow-y-auto sidebar-nav py-6">
        <ul className="space-y-3 px-3">
          {filteredMenu.map(item => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            
            // Skip separators
            if (item.id === 'separator') return null;
            if (item.submenu) return null;
            
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  title={!isExpanded ? item.label : ''}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${
                    isActive
                      ? 'bg-white text-red-900 font-semibold'
                      : 'text-red-100 hover:opacity-80 hover:bg-red-900 hover:text-white'
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <span className={`text-sm whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sair Button */}
      <div className="p-3">
        <button
          onClick={handleLogout}
          title="Sair"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-red-100 transition-all text-sm hover:opacity-80 hover:bg-red-900 hover:text-white"
        >
          <span className="text-lg flex-shrink-0">🚪</span>
          <span className={`whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            Sair
          </span>
        </button>
      </div>
    </aside>
  );
}
