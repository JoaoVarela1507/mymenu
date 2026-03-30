// Mock database para recuperação de senha
export interface PasswordRecoveryUser {
  email: string;
  name: string;
  userType: 'restaurant' | 'consumer';
  phone?: string;
}

export const passwordRecoveryUsers: PasswordRecoveryUser[] = [
  {
    email: 'joao@restaurante.com',
    name: 'João Silva',
    userType: 'restaurant',
    phone: '(11) 98765-4321'
  },
  {
    email: 'maria@email.com',
    name: 'Maria Santos',
    userType: 'consumer',
    phone: '(11) 99876-5432'
  },
  {
    email: 'carlos@pizzaria.com.br',
    name: 'Carlos Oliveira',
    userType: 'restaurant',
    phone: '(21) 99999-8888'
  },
  {
    email: 'ana@example.com',
    name: 'Ana Costa',
    userType: 'consumer',
    phone: '(85) 98888-7777'
  }
];

// Função para verificar se o email existe
export const findUserByEmail = (email: string): PasswordRecoveryUser | undefined => {
  return passwordRecoveryUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
};

// Função para simular envio de email
export const sendPasswordResetEmail = (email: string): boolean => {
  const user = findUserByEmail(email);
  if (user) {
    console.log(`Email de recuperação de senha enviado para: ${email}`);
    return true;
  }
  return false;
};
