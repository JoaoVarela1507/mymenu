import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

// Mocks
const mockNavigate = vi.fn();
let mockLocationPath = '/';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: mockLocationPath,
    }),
  };
});

let mockUser: any = null;
let mockHasMultipleProfiles = false;
const mockLogout = vi.fn();
const mockLoginWithProfile = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
    loginWithProfile: mockLoginWithProfile,
    hasMultipleProfiles: mockHasMultipleProfiles,
  }),
}));

describe('Sidebar Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
    mockHasMultipleProfiles = false;
    mockLocationPath = '/';
  });

  // Test 1: Renderização
  it('deve renderizar a estrutura básica da sidebar com o logo', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    // Sidebar has images of logo
    const logoImgs = screen.getAllByAltText('MyMenu');
    expect(logoImgs.length).toBeGreaterThan(0);
  });

  // Test 2: Itens do menu
  it('deve renderizar itens do menu do consumidor por padrão e ocultar os de admin', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    // Consumidor navigation items (query first matching element since layout renders twice for mobile/desktop)
    expect(screen.getAllByText('Início')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Ofertas')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Top Avaliações')[0]).toBeInTheDocument();

    // Admin-only items should NOT be present
    expect(screen.queryByText('Visão Geral')).not.toBeInTheDocument();
    expect(screen.queryByText('Cardápio')).not.toBeInTheDocument();
  });

  it('deve renderizar itens do admin quando logado como admin', () => {
    mockUser = { type: 'admin', name: 'Admin User', email: 'admin@mymenu.com' };

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    // Admin navigation items should show
    expect(screen.getAllByText('Visão Geral')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Cardápio')[0]).toBeInTheDocument();

    // Consumer items should not show (since visibleItems filters based on role)
    expect(screen.queryByText('Início')).not.toBeInTheDocument();
  });

  // Test 3: Navegação
  it('deve navegar para a página correta ao clicar em um item de menu', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    const offersLink = screen.getAllByText('Ofertas')[0].closest('a');
    expect(offersLink).toHaveAttribute('href', '/ofertas');
  });

  // Test 4: Menu ativo
  it('deve aplicar estilos de menu ativo quando a rota corresponder ao caminho do item', () => {
    mockLocationPath = '/ofertas';

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    const offersLink = screen.getAllByText('Ofertas')[0].closest('a');
    expect(offersLink).toHaveClass('bg-white/15');
  });

  // Test 5: Collapse
  it('deve renderizar textos do menu com opacidade total no estado expandido por padrão', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    const itemLabel = screen.getAllByText('Início')[0];
    expect(itemLabel).toHaveClass('opacity-100');
  });

  // Test 6: Responsividade
  it('deve abrir a gaveta mobile ao clicar no botão hamburguer em telas pequenas', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    // Get hamburger button specifically by finding the one with the lg:hidden class
    const hamburgerBtn = screen.getAllByRole('button').find(btn => btn.className.includes('lg:hidden'))!;
    expect(hamburgerBtn).toBeInTheDocument();

    // Clicking Hamburguer button changes mobile drawer classes
    fireEvent.click(hamburgerBtn);

    // The aside mobile drawer container has class translate-x-0 when mobileOpen is true
    const mobileAside = screen.getAllByRole('complementary')[0]; // first aside element is mobile, second is desktop
    expect(mobileAside).toHaveClass('translate-x-0');
  });

  // Test 7: Logout
  it('deve chamar a função de logout ao clicar no botão Sair', () => {
    mockUser = { type: 'admin', name: 'Admin User', email: 'admin@mymenu.com' };

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    const logoutBtn = screen.getAllByText('Sair')[0];
    fireEvent.click(logoutBtn);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
