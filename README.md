# MyMenu - Documentação Completa

---

## 📋 Índice

1. [Introdução](#introdução)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Setup Inicial](#setup-inicial)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Backend - Guia Completo](#backend---guia-completo)
6. [Frontend - Guia Completo](#frontend---guia-completo)
7. [Exemplos de API](#exemplos-de-api)
8. [Integração Frontend com Backend](#integração-frontend-com-backend)
9. [Troubleshooting e Debugging](#troubleshooting-e-debugging)
10. [Próximas Etapas](#próximas-etapas)

---

## Introdução

MyMenu é um sistema completo de gerenciamento de restaurante com funcionalidades para consumidores e administradores. O projeto é composto por um backend robusto em FastAPI com autenticação JWT e integração com MongoDB, e um frontend moderno em React/TypeScript com Vite.

**Funcionalidades principais:**
- ✅ Autenticação segura com JWT
- ✅ Registro e login de usuários (consumidor/admin)
- ✅ Reset de senha por email
- ✅ Integração MongoDB
- ✅ CORS configurado para frontend
- ✅ API totalmente documentada com Swagger UI
- ✅ Interface moderna e responsiva

---

## Stack Tecnológico

### Backend
- **Framework:** FastAPI 0.104.1+
- **Servidor:** Uvicorn
- **Banco de Dados:** MongoDB (Atlas Cloud)
- **Autenticação:** JWT (JSON Web Tokens)
- **Segurança:** Bcrypt para hash de senhas
- **Validação:** Pydantic
- **Email:** SMTP (Gmail compatible)
- **Testes:** pytest

### Frontend
- **Build Tool:** Vite
- **Framework UI:** React 18
- **Linguagem:** TypeScript
- **Styling:** Tailwind CSS
- **Node Version:** 18+

### DevOps
- **Containerização:** Docker
- **Orquestração:** Docker Compose

---

## Setup Inicial

### Pré-requisitos
- Python 3.11+
- Node.js 18+
- Git
- Docker e Docker Compose (opcional, para containerização)

### Opção 1: Desenvolvimento Local Recomendado

#### Backend

```bash
# Navegar para pasta backend
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Iniciar servidor
python main.py
```

O servidor estará disponível em: `http://localhost:8000`

#### Frontend

```bash
# Navegar para pasta frontend
cd frontend

# Instalar dependências
npm install

# Iniciar dev server
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

### Opção 2: Docker Compose (Recomendado para Produção)

```bash
# Da raiz do projeto (mymenu/)
docker-compose up -d
```

Serviços disponíveis:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

---

## Estrutura do Projeto

```
mymenu/
├── backend/
│   ├── app/
│   │   ├── core/                 # Configurações de banco de dados, segurança, email
│   │   │   ├── config.py         # Variáveis de configuração
│   │   │   ├── database.py       # Conexão MongoDB
│   │   │   ├── email.py          # Serviço de email
│   │   │   └── security.py       # Autenticação JWT, hash de senhas
│   │   ├── models/               # Modelos de dados
│   │   │   └── user.py           # Modelo User MongoDB
│   │   ├── routes/               # Endpoints da API
│   │   │   └── auth.py           # Rotas de autenticação
│   │   ├── schemas/              # Validação Pydantic
│   │   │   └── auth.py           # Schemas de requisição/resposta
│   │   └── __init__.py
│   ├── tests/                    # Testes automatizados
│   │   ├── conftest.py
│   │   └── test_auth.py
│   ├── main.py                   # Ponto de entrada da API
│   ├── requirements.txt          # Dependências Python
│   ├── pytest.ini               # Configuração de testes
│   └── .env                     # Variáveis de ambiente (pré-configurado)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/            # Componentes do painel admin
│   │   │   │   ├── OrderCard.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── consumer/         # Componentes para consumidor
│   │   │   │   ├── FeaturedCarousel.tsx
│   │   │   │   ├── PriceComparison.tsx
│   │   │   │   ├── PromotionsCarousel.tsx
│   │   │   │   └── RestaurantCard.tsx
│   │   │   └── shared/           # Componentes reutilizáveis
│   │   │       ├── Badge.tsx
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── EmptyState.tsx
│   │   │       ├── FilterButton.tsx
│   │   │       ├── ImageCarousel.tsx
│   │   │       ├── Input.tsx
│   │   │       └── PageHeader.tsx
│   │   ├── contexts/             # React Contexts
│   │   │   ├── AuthContext.tsx   # Gerenciamento de autenticação
│   │   │   └── FavoritesContext.tsx
│   │   ├── hooks/                # Custom React Hooks
│   │   ├── lib/                  # Utilitários
│   │   │   ├── mockAuth.ts       # Mock de autenticação
│   │   │   ├── mockData.ts
│   │   │   ├── mockMenu.ts
│   │   │   ├── mockRestaurants.ts
│   │   │   └── menuConfig.ts
│   │   ├── pages/                # Páginas da aplicação
│   │   │   ├── admin/            # Páginas admin
│   │   │   ├── consumer/         # Páginas consumidor
│   │   │   ├── login/            # Páginas de autenticação
│   │   │   └── signup/
│   │   ├── services/
│   │   │   └── api.ts            # Cliente HTTP
│   │   ├── types/                # TypeScript types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── index.html
│
├── docker-compose.yml
├── package.json
└── README.md
```

---

## Backend - Guia Completo

### Configuração do Ambiente

O arquivo `.env` já vem pré-configurado com:

```
MONGODB_URL=mongodb+srv://adm_db_user:VqNlVtPec0YfAbuW@cluster0.ena4zbx.mongodb.net/
JWT_SECRET_KEY=your-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**⚠️ Para Produção:**
- Alterar `JWT_SECRET_KEY` para uma string aleatória forte
- Configurar credenciais SMTP para email
- Usar HTTPS/TLS
- Definir origens CORS específicas

### API Endpoints

#### 1. Registro de Usuário

```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "User Name",
  "role": "consumer"  // ou "admin"
}
```

**Resposta (201):**
```json
{
  "message": "User registered successfully with ID: 507f1f77bcf86cd799439011",
  "success": true
}
```

#### 2. Login

```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Resposta (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "User Name",
  "role": "consumer"
}
```

#### 3. Solicitar Reset de Senha

```
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Resposta (200):**
```json
{
  "message": "If an account with this email exists, a reset link has been sent",
  "success": true
}
```

#### 4. Reset de Senha

```
POST /auth/reset-password
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "new_password": "NewPassword456!"
}
```

**Resposta (200):**
```json
{
  "message": "Password reset successfully",
  "success": true
}
```

#### 5. Health Check

```
GET /health
```

**Resposta (200):**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### Banco de Dados

**MongoDB Collections:**

#### users
```
{
  "_id": ObjectId,
  "email": string,
  "password": string (bcrypt hashed),
  "name": string,
  "role": "consumer" | "admin",
  "created_at": datetime,
  "updated_at": datetime
}
```

### Autenticação e Segurança

**JWT (JSON Web Tokens):**
- Gerados durante login
- Expiram em 30 minutos (configurável)
- Armazenados em localStorage no frontend
- Incluídos em requisições protegidas via header Authorization

**Senha:**
- Hash com Bcrypt
- Validação de força (recomendado: maiúscula, minúscula, número)
- Nunca armazenada em plain text

**CORS:**
Configurado para aceitar requisições de:
- http://localhost:3000 (Create React App)
- http://localhost:5173 (Vite)

### Testando a API

**Método 1: Swagger UI (Interativo)**
```
1. Abrir http://localhost:8000/docs
2. Clicar em um endpoint
3. Clicar "Try it out"
4. Preencher os campos
5. Clicar "Execute"
```

**Método 2: cURL**
```bash
# Registro
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "MyPassword123!",
    "name": "John Doe",
    "role": "consumer"
  }'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "MyPassword123!"
  }'

# Health Check
curl http://localhost:8000/health
```

**Método 3: Postman**
1. Download em https://www.postman.com/downloads/
2. Importar exemplos da seção "Exemplos de API"
3. Testar cada endpoint

---

## Frontend - Guia Completo

### Paleta de Cores

**Cores Principais:**
- **Primary (Vermelho):** #C92924
- **Secondary (Bege/Creme):** #F9E7C9
- **Dark (Marrom escuro):** #280B0B

**Status de Pedidos:**
- Novo: #C92924 (Vermelho)
- Aceito: #FF9800 (Laranja)
- Preparo: #2196F3 (Azul)
- Pronto: #4CAF50 (Verde)
- Finalizado: #9E9E9E (Cinza)
- Cancelado: #F44336 (Vermelho claro)

### Estrutura de Componentes

**Design System Implementado:**
- Button: Botão reutilizável com variantes
- Card: Container de conteúdo
- Input: Campo de entrada
- Badge: Rótulo/tag
- EmptyState: Estado vazio
- PageHeader: Cabeçalho de página
- ImageCarousel: Carrossel de imagens
- FilterButton: Botão de filtro

### Páginas Implementadas

**Consumer (Consumidor):**
- Home: Página inicial com destaques
- RestaurantPage: Detalhes do restaurante
- Nearby: Restaurantes próximos
- Favorites: Restaurantes favoritos

**Admin:**
- Dashboard: Visão geral
- OrdersCenter: Central de pedidos
- Menu: Gerenciamento de cardápio
- Reports: Relatórios
- Profile: Perfil do admin
- Settings: Configurações

**Autenticação:**
- Login: Acesso para consumidor/admin
- RestaurantLogin: Login separado para restaurantes
- ForgotPassword: Recuperação de senha
- ResetPassword: Definir nova senha
- SignupChoice: Escolher tipo de conta

### Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint (ESLint)
npm run lint
```

### Contexts e Gerenciamento de Estado

**AuthContext:** Gerencia autenticação, login/logout, dados do usuário

**FavoritesContext:** Gerencia restaurantes favoritos

---

## Exemplos de API

### cURL Completo

```bash
# REGISTRAR CONSUMIDOR
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "consumer@example.com",
    "password": "MyPassword123!",
    "name": "John Doe",
    "role": "consumer"
  }'

# REGISTRAR ADMIN
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mymenu.com",
    "password": "AdminPassword123!",
    "name": "Admin User",
    "role": "admin"
  }'

# LOGIN
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "consumer@example.com",
    "password": "MyPassword123!"
  }'

# SOLICITAR RESET DE SENHA
curl -X POST http://localhost:8000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "consumer@example.com"
  }'

# RESET DE SENHA
curl -X POST http://localhost:8000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGc...",
    "new_password": "NewPassword123!"
  }'

# HEALTH CHECK
curl http://localhost:8000/health
```

### Status HTTP Esperados

| Código | Significado | Cenário |
|--------|-------------|---------|
| 200 | OK | Login, forgot-password, reset-password bem-sucedidos |
| 201 | Created | Registro bem-sucedido |
| 400 | Bad Request | Validação falhou ou email já registrado |
| 401 | Unauthorized | Credenciais inválidas |
| 500 | Server Error | Erro interno do servidor |

### Erros Comuns

**Email já registrado:**
```json
{
  "detail": "Email already registered"
}
```

**Role inválido:**
```json
{
  "detail": "Invalid role. Must be 'consumer' or 'admin'"
}
```

**Campo obrigatório faltando:**
```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "email"],
      "msg": "Field required"
    }
  ]
}
```

**Credenciais inválidas:**
```json
{
  "detail": "Invalid email or password"
}
```

---

## Integração Frontend com Backend

### Configuração Inicial

**1. Variáveis de Ambiente**

Criar ou atualizar `.env` no frontend:
```
VITE_API_URL=http://localhost:8000
```

**2. Cliente API**

Criar arquivo `src/services/backendApi.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const authService = {
  async register(
    email: string,
    password: string,
    name: string,
    role: 'consumer' | 'admin'
  ) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user_role', data.role);
    localStorage.setItem('user_id', data.user_id);

    return data;
  },

  async forgotPassword(email: string) {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }

    return response.json();
  },

  async resetPassword(token: string, newPassword: string) {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword }),
    });

    if (!response.ok) {
      throw new Error('Password reset failed');
    }

    return response.json();
  },

  getAuthToken() {
    return localStorage.getItem('access_token');
  },

  getUserRole() {
    return localStorage.getItem('user_role');
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
  },
};
```

### Atualizar AuthContext

```typescript
import { authService } from '../services/backendApi';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authService.getAuthToken();
    if (token) {
      setUser({
        id: localStorage.getItem('user_id') || '',
        email: '',
        name: '',
        role: (authService.getUserRole() as 'consumer' | 'admin') || 'consumer',
      });
    }
    setLoading(false);
  }, []);

  const register = async (
    email: string,
    password: string,
    name: string,
    role: 'consumer' | 'admin'
  ) => {
    await authService.register(email, password, name, role);
  };

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setUser({
      id: data.user_id,
      email: data.email,
      name: data.name,
      role: data.role,
    });
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    return authService.forgotPassword(email);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, logout, forgotPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

### Usar em Componentes

**Login Component:**
```typescript
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const { login } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      navigate('/home');
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    // Seu formulário JSX
  );
}
```

**Signup Component:**
```typescript
export function SignupConsumer() {
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, name, 'consumer');
      navigate('/login');
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    // Seu formulário JSX
  );
}
```

### Headers de Autenticação

Para requisições protegidas futuras:

```typescript
const response = await fetch(`${API_URL}/protected-route`, {
  headers: {
    'Authorization': `Bearer ${authService.getAuthToken()}`,
    'Content-Type': 'application/json',
  },
});
```

---

## Troubleshooting e Debugging

### Problemas Comuns

#### 1. Conexão com MongoDB Falha

**Problema:** "Failed to connect to MongoDB"

**Soluções:**
1. Verificar string de conexão em `.env`
2. Verificar conexão de internet (MongoDB Atlas requer acesso em nuvem)
3. Verificar IP whitelist no MongoDB Atlas
4. Testar com MongoDB Compass (download em https://www.mongodb.com/try/download/compass)

#### 2. Origem CORS Não Permitida

**Problema:** "CORS policy: No 'Access-Control-Allow-Origin' header"

**Soluções:**
1. Garantir que backend está rodando
2. Verificar que origem do frontend está configurada (main.py)
3. Frontend deve estar em:
   - http://localhost:3000 (Create React App)
   - http://localhost:5173 (Vite)
4. Para adicionar mais origens, editar main.py

#### 3. Porta 8000 Já em Uso

**Problema:** "Address already in use" na porta 8000

**Soluções:**
```bash
# Windows - encontrar processo
netstat -ano | findstr :8000

# Windows - matar processo
taskkill /PID <PID> /F

# Mac/Linux - encontrar processo
lsof -i :8000

# Mac/Linux - matar processo
kill -9 <PID>
```

Ou mudar porta em main.py:
```python
uvicorn.run(app, host="0.0.0.0", port=8001)
```

#### 4. Email Não Está Sendo Enviado

**Problema:** "Failed to send email"

**Soluções:**
1. Verificar configurações SMTP em `.env`:
   - SMTP_SERVER: smtp.gmail.com
   - SMTP_PORT: 587
2. Para Gmail:
   - Usar App Password (não senha regular)
   - Gerar em: https://myaccount.google.com/apppasswords
3. Verificar firewall/antivírus bloqueando SMTP

#### 5. Erro de Validação Pydantic

**Problema:** "validation error" ou "field required"

**Soluções:**
1. Verificar formato JSON das requisições
2. Garantir que todos os campos obrigatórios estão presentes:
   - register: email, password, name, role
   - login: email, password
   - forgot-password: email
3. Validar formatos:
   - email: formato válido de email
   - password: maiúscula, minúscula, número
   - role: "consumer" ou "admin"

#### 6. Token JWT Expirado

**Problema:** "Invalid access token" ou "Token expired"

**Soluções:**
1. Verificar JWT_SECRET_KEY em `.env`
2. Token expira em 30 minutos por padrão
3. Estender em `.env`: ACCESS_TOKEN_EXPIRE_MINUTES
4. Implementar lógica de refresh token para sessões longas
5. Limpar localStorage se JWT_SECRET_KEY foi alterado

### Ferramentas de Debug

**Verificar Saúde da API:**
```bash
curl http://localhost:8000/health
```

**Swagger UI Interativo:**
```
http://localhost:8000/docs
```

**Alternativa - ReDoc:**
```
http://localhost:8000/redoc
```

**MongoDB Compass:**
1. Download em: https://www.mongodb.com/try/download/compass
2. Usar string de conexão de `.env`
3. Navegar por coleções e documentos
4. Debugar problemas de dados

**Browser DevTools:**
1. F12 (abrir DevTools)
2. Aba "Network"
3. Fazer requisições
4. Ver respostas e erros CORS

**Python Debugging:**
```python
import pdb
pdb.set_trace()  # Breakpoint interativo
```

### Testes Automatizados

```bash
# Rodar todos os testes
pytest

# Teste específico
pytest tests/test_auth.py::test_register_consumer -v

# Com cobertura
pip install pytest-cov
pytest --cov=app

# Modo verbose
pytest -v
```

### Checklist de Verificação

- [ ] Python 3.11+ instalado
- [ ] Virtual environment ativado
- [ ] Dependências instaladas (pip install -r requirements.txt)
- [ ] Arquivo `.env` configurado
- [ ] MongoDB connection string funciona
- [ ] Servidor inicia sem erros (python main.py)
- [ ] http://localhost:8000 acessível
- [ ] Swagger UI abre em http://localhost:8000/docs
- [ ] Health check responde em http://localhost:8000/health
- [ ] Endpoints de registro, login, forgot-password funcionam
- [ ] Frontend conecta ao backend sem erros CORS
- [ ] Tokens armazenados em localStorage
- [ ] Dados de usuário persistem após refresh
- [ ] Email funciona (se configurado)

---

## Próximas Etapas

### Funcionalidades Planejadas

- [ ] Integração completa frontend com backend
- [ ] Gerenciamento completo de restaurantes
- [ ] Sistema de pedidos e notificações
- [ ] Dashboard analítico
- [ ] Sistema de avaliações e comentários
- [ ] Integração de pagamento
- [ ] Notificações em tempo real (WebSocket)
- [ ] Mobile app (React Native)

### Antes de Lançar para Produção

1. **Segurança:**
   - Alterar JWT_SECRET_KEY
   - Configurar HTTPS/TLS
   - Definir CORS origins específicas
   - Revisar variáveis de ambiente

2. **Performance:**
   - Configurar cache
   - Otimizar queries MongoDB
   - Implementar rate limiting
   - Comprimis responses

3. **Infraestrutura:**
   - Configurar CI/CD
   - Setup de monitoramento
   - Backups automáticos
   - Implementar logging centralizado

4. **Testes:**
   - Cobertura mínima 80%
   - Testes de integração
   - Teste de carga
   - Teste de segurança

---

## Contato e Suporte

Para dúvidas ou problemas:

1. Consultar a seção apropriada nesta documentação
2. Revisar logs de erro usando ferramentas debug
3. Testar endpoints com Swagger UI
4. Verificar MongoDB Compass para problemas de dados
5. Revisar requirements.txt para compatibilidade de versões

---

**Última atualização:** 06 de abril de 2026  
**Versão:** 1.0  
**Status:** Pronto para desenvolvimento
