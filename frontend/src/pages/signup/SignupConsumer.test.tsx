import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignupConsumer from './SignupConsumer';

// Mocks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockRegisterConsumer = vi.fn();
vi.mock('../../services/api', () => ({
  authService: {
    registerConsumer: (...args: any[]) => mockRegisterConsumer(...args),
  },
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
  }),
}));

vi.mock('../../services/authService', () => ({
  loginWithGoogle: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  getAuth: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  updateDoc: vi.fn(),
  getDoc: vi.fn(),
  getFirestore: vi.fn(),
}));

vi.mock('../../lib/firebase', () => ({
  auth: {},
  db: {},
}));

// Mock components
vi.mock('../../components/shared', () => ({
  Input: ({ label, error, ...props }: any) => (
    <div data-testid="mock-input">
      <label htmlFor={props.id || label}>{label}</label>
      <input id={props.id || label} {...props} />
      {error && <span data-testid="input-error">{error}</span>}
    </div>
  ),
  Button: ({ children, disabled, ...props }: any) => (
    <button disabled={disabled} {...props}>
      {children}
    </button>
  ),
  ImageCarousel: () => <div data-testid="mock-carousel">Carousel</div>,
}));

describe('SignupConsumer Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock global fetch for email availability check
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ exists: false, has_restaurant: false, has_consumer: false, name: '' }),
    });
  });

  // Test 1: Renderização
  it('deve renderizar a tela de cadastro e campos principais do consumidor', () => {
    render(
      <MemoryRouter>
        <SignupConsumer />
      </MemoryRouter>
    );

    expect(screen.getByText('Consumidor')).toBeInTheDocument();
    expect(screen.getByText('Complete seus dados para criar a conta')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome Completo')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar Senha')).toBeInTheDocument();
  });

  // Test 2: Todos os campos
  it('deve permitir preencher todos os campos do formulário', () => {
    render(
      <MemoryRouter>
        <SignupConsumer />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const nameInput = screen.getByLabelText('Nome Completo') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Senha') as HTMLInputElement;
    const confirmInput = screen.getByLabelText('Confirmar Senha') as HTMLInputElement;

    // Type in email FIRST (as changing email resets the name field value)
    fireEvent.change(emailInput, { target: { value: 'john@doe.com' } });
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(passwordInput, { target: { value: 'secret123' } });
    fireEvent.change(confirmInput, { target: { value: 'secret123' } });

    expect(emailInput.value).toBe('john@doe.com');
    expect(nameInput.value).toBe('John Doe');
    expect(passwordInput.value).toBe('secret123');
    expect(confirmInput.value).toBe('secret123');
  });

  // Test 3: Senhas diferentes
  it('deve mostrar mensagem de erro se as senhas não coincidirem', async () => {
    render(
      <MemoryRouter>
        <SignupConsumer />
      </MemoryRouter>
    );

    // Agree with terms so submit button becomes enabled
    const termsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(termsCheckbox);

    const emailInput = screen.getByLabelText('Email');
    const nameInput = screen.getByLabelText('Nome Completo');
    const passwordInput = screen.getByLabelText('Senha');
    const confirmInput = screen.getByLabelText('Confirmar Senha');
    const submitButton = screen.getByRole('button', { name: 'Acessar conta' });

    // Type in email FIRST
    fireEvent.change(emailInput, { target: { value: 'john@doe.com' } });
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(passwordInput, { target: { value: 'secret123' } });
    fireEvent.change(confirmInput, { target: { value: 'different123' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Senhas não coincidem')).toBeInTheDocument();
    });
  });

  // Test 4: Email inválido
  it('deve ter campo de email do tipo HTML5 email para validação', () => {
    render(
      <MemoryRouter>
        <SignupConsumer />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    expect(emailInput.type).toBe('email');
  });

  // Test 5: Cadastro realizado
  it('deve chamar a API de registro e redirecionar para login em caso de sucesso', async () => {
    mockRegisterConsumer.mockResolvedValue({ success: true });

    render(
      <MemoryRouter>
        <SignupConsumer />
      </MemoryRouter>
    );

    const termsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(termsCheckbox);

    const emailInput = screen.getByLabelText('Email');
    const nameInput = screen.getByLabelText('Nome Completo');
    const passwordInput = screen.getByLabelText('Senha');
    const confirmInput = screen.getByLabelText('Confirmar Senha');
    const submitButton = screen.getByRole('button', { name: 'Acessar conta' });

    // Type in email FIRST
    fireEvent.change(emailInput, { target: { value: 'john@doe.com' } });
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(passwordInput, { target: { value: 'secret123' } });
    fireEvent.change(confirmInput, { target: { value: 'secret123' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegisterConsumer).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'secret123',
        confirmPassword: 'secret123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  // Test 6: Botão desabilitado quando houver erro / termos não aceitos
  it('deve desabilitar o botão de envio se os termos de serviço não forem aceitos', () => {
    render(
      <MemoryRouter>
        <SignupConsumer />
      </MemoryRouter>
    );

    const termsCheckbox = screen.getByRole('checkbox') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'Acessar conta' });

    expect(termsCheckbox.checked).toBe(false);
    expect(submitButton).toBeDisabled();

    fireEvent.click(termsCheckbox);
    expect(termsCheckbox.checked).toBe(true);
    expect(submitButton).not.toBeDisabled();
  });

  // Test 7: Loading
  it('deve alterar o texto do botão de envio para "Criando conta..." e desabilitar controles durante envio', async () => {
    let resolveRegisterPromise: any;
    const registerPromise = new Promise((resolve) => {
      resolveRegisterPromise = resolve;
    });
    mockRegisterConsumer.mockReturnValue(registerPromise);

    render(
      <MemoryRouter>
        <SignupConsumer />
      </MemoryRouter>
    );

    const termsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(termsCheckbox);

    const emailInput = screen.getByLabelText('Email');
    const nameInput = screen.getByLabelText('Nome Completo');
    const passwordInput = screen.getByLabelText('Senha');
    const confirmInput = screen.getByLabelText('Confirmar Senha');
    const submitButton = screen.getByRole('button', { name: 'Acessar conta' });

    // Type in email FIRST
    fireEvent.change(emailInput, { target: { value: 'john@doe.com' } });
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(passwordInput, { target: { value: 'secret123' } });
    fireEvent.change(confirmInput, { target: { value: 'secret123' } });

    fireEvent.click(submitButton);

    expect(submitButton).toHaveTextContent('Criando conta...');
    expect(submitButton).toBeDisabled();

    resolveRegisterPromise({ success: true });
    await waitFor(() => {
      expect(submitButton).toHaveTextContent('Acessar conta');
    });
  });
});
