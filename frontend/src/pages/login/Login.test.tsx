import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

// Mocks
const mockNavigate = vi.fn();
const mockLocation = { state: null };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

const mockLogin = vi.fn();
const mockLoginWithProfile = vi.fn();
const mockCancelProfileChoice = vi.fn();
const mockLoginWithGoogle = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    login: mockLogin,
    loginWithProfile: mockLoginWithProfile,
    cancelProfileChoice: mockCancelProfileChoice,
    loginWithGoogle: mockLoginWithGoogle,
  }),
}));

// Mock Input with label/id mapping to make getByLabelText work
vi.mock('../../components/shared', () => ({
  Input: ({ label, error, ...props }: any) => (
    <div data-testid="mock-input">
      <label htmlFor={props.id || label}>{label}</label>
      <input id={props.id || label} {...props} />
      {error && <span>{error}</span>}
    </div>
  ),
  Button: ({ children, disabled, ...props }: any) => (
    <button disabled={disabled} {...props}>
      {children}
    </button>
  ),
  ImageCarousel: () => <div data-testid="mock-carousel">Carousel</div>,
}));

describe('Login Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.state = null;
  });

  // Test 1: Renderização da tela
  it('deve renderizar a tela de login corretamente com campos e logo', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText('Bem-vindo')).toBeInTheDocument();
    expect(screen.getByText('Acesse sua conta para continuar')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••')).toBeInTheDocument();
    
    // Use exact name matches using regex anchor ^$ to avoid matching both "Entrar" and "Entrar com Google"
    expect(screen.getByRole('button', { name: /^Entrar$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar com Google/i })).toBeInTheDocument();
  });

  // Test 2: Campos obrigatórios
  it('deve marcar o campo de Email como obrigatório', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toBeRequired();
  });

  // Test 3: Email inválido
  it('deve validar o campo de email de acordo com o tipo HTML5 email', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    expect(emailInput.type).toBe('email');
  });

  // Test 4: Senha obrigatória
  it('deve marcar o campo de Senha como obrigatório', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const passwordInput = screen.getByPlaceholderText('••••••');
    expect(passwordInput).toBeRequired();
  });

  // Test 5: Clique no botão Entrar
  it('deve chamar a função de login com os dados corretos ao submeter o formulário', async () => {
    mockLogin.mockResolvedValue({ success: true, needsProfileChoice: false });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByPlaceholderText('••••••');
    const submitButton = screen.getByRole('button', { name: /^Entrar$/i });

    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: 'password123',
    });
  });

  // Test 6: Estado de Loading
  it('deve alterar o texto do botão para "Entrando..." e desabilitar controles durante a autenticação', async () => {
    let resolveLoginPromise: any;
    const loginPromise = new Promise((resolve) => {
      resolveLoginPromise = resolve;
    });
    mockLogin.mockReturnValue(loginPromise);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByPlaceholderText('••••••');
    const submitButton = screen.getByRole('button', { name: /^Entrar$/i });

    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(submitButton).toHaveTextContent('Entrando...');
    expect(submitButton).toBeDisabled();

    // Finaliza o login
    resolveLoginPromise({ success: true });
    await waitFor(() => {
      expect(submitButton).toHaveTextContent('Entrar');
    });
  });

  // Test 7: Mensagens de erro
  it('deve exibir mensagem de erro quando a autenticação falhar', async () => {
    mockLogin.mockResolvedValue({ success: false });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByPlaceholderText('••••••');
    const submitButton = screen.getByRole('button', { name: /^Entrar$/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email ou senha inválidos')).toBeInTheDocument();
    });
  });
});
