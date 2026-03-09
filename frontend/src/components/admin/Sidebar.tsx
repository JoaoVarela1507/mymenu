import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { menuItems } from '../../lib/menuConfig';

export default function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { user, logout } = useAuth();

  if (!user) return null;

  const filteredMenu = menuItems.filter(item => 
    item.allowedRoles.includes(user.type)
  );

  const toggleSubmenu = (itemId: string) => {
    setExpandedMenus(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div 
      className={`bg-dark text-secondary h-screen p-4 flex flex-col transition-all duration-300 sticky top-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      {/* Logo */}
      <div className="mb-8 h-12 flex items-center justify-center">
        <div className={`transition-all duration-300 ${
          isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-full'
        }`}>
          <h1 className="text-xl font-bold text-primary whitespace-nowrap">MYMENU</h1>
        </div>
        <div className={`text-2xl text-primary font-bold transition-all duration-300 absolute ${
          isCollapsed ? 'opacity-100' : 'opacity-0'
        }`}>
          M
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {filteredMenu.map(item => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const isExpanded = expandedMenus.includes(item.id);
            const hasSubmenu = item.submenu && item.submenu.length > 0;

            return (
              <li key={item.id}>
                {hasSubmenu ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.id)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                        ${isActive 
                          ? 'bg-primary text-secondary font-semibold' 
                          : 'text-secondary/80 hover:bg-primary/20 hover:text-secondary'
                        }
                      `}
                      title={isCollapsed ? item.label : ''}
                    >
                      <span className="text-lg">{item.icon}</span>
                      {!isCollapsed && (
                        <>
                          <span className="text-sm flex-1 text-left animate-slide-in">{item.label}</span>
                          <span className={`text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                        </>
                      )}
                    </button>
                    {isExpanded && !isCollapsed && (
                      <ul className="ml-9 mt-1 space-y-1">
                        {item.submenu!.map(subitem => (
                          <li key={subitem.id}>
                            <Link
                              to={subitem.path}
                              className={`
                                block px-3 py-2 text-sm rounded-lg transition-all
                                ${location.pathname === subitem.path
                                  ? 'bg-primary/30 text-secondary font-medium'
                                  : 'text-secondary/70 hover:bg-primary/10 hover:text-secondary'
                                }
                              `}
                            >
                              {subitem.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                      ${isActive 
                        ? 'bg-primary text-secondary font-semibold' 
                        : 'text-secondary/80 hover:bg-primary/20 hover:text-secondary'
                      }
                    `}
                    title={isCollapsed ? item.label : ''}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {!isCollapsed && <span className="text-sm animate-slide-in">{item.label}</span>}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - Perfil e Sair */}
      <div className="pt-4 border-t border-secondary/20 space-y-2">
        <Link
          to="/admin/profile"
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
            ${location.pathname === '/admin/profile'
              ? 'bg-primary text-secondary font-semibold'
              : 'text-secondary/80 hover:bg-primary/20 hover:text-secondary'
            }
          `}
          title={isCollapsed ? 'Perfil' : ''}
        >
          <span className="text-lg">👤</span>
          {!isCollapsed && <span className="text-sm animate-slide-in">Perfil</span>}
        </Link>
        
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-secondary/70 hover:text-secondary hover:bg-primary/20 rounded-lg transition-all"
          title={isCollapsed ? 'Sair' : ''}
        >
          <span className="text-lg">🚪</span>
          {!isCollapsed && <span className="text-sm animate-slide-in">Sair</span>}
        </button>
      </div>
    </div>
  );
}
