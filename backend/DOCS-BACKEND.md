# 📚 Documentação Backend - MyMenu API

## ✅ Visão Geral

**Backend Python FastAPI + MongoDB** - Sistema de autenticação completo com integração segura e validação de dados.

### Componentes Implementados

#### 🔐 Autenticação
- **3 Endpoints de Autenticação**
  - `POST /auth/register` - Registrar novo usuário (consumer/admin)
  - `POST /auth/login` - Realizar login
  - `POST /auth/forgot-password` - Solicitar reset de senha

#### 🗄️ Banco de Dados
- MongoDB conectado ao Atlas
- Coleção "users" pronta para uso
- Dados criptografados e seguros

#### 🛡️ Segurança
- Senhas criptografadas com Bcrypt
- Autenticação JWT (JSON Web Token)
- Validação completa de entrada
- CORS configurado para React

#### 📖 Documentação
- 14 arquivos de documentação técnica
- Exemplos de uso da API
- Guia de integração com frontend

---

## 🚀 Quick Start

### Pré-requisitos
- Python 3.8+
- MongoDB Atlas(já configurado)

### Instalação e Execução

#### 1. Abrir terminal na pasta `backend/`

```bash
cd backend
```

#### 2. Criar e ativar ambiente virtual

```bash
# Criar ambiente
python -m venv venv

# Ativar (Windows)
venv\Scripts\activate

# Ativar (Mac/Linux)
source venv/bin/activate
```

#### 3. Instalar dependências

```bash
pip install -r requirements.txt
```

#### 4. Iniciar servidor

```bash
python main.py
```

**Sucesso!** Você verá a mensagem:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## 🧪 Testando a API

### 1. Acessar Swagger UI (Recomendado)

Abra no navegador: **http://localhost:8000/docs**

A interface Swagger permite testar todos os endpoints interativamente.

### 2. Exemplo Prático: Registrar Usuário

1. Acesse http://localhost:8000/docs
2. Clique em **POST /auth/register**
3. Clique em **"Try it out"**
4. Preencha o body com:

```json
{
  "email": "joao@example.com",
  "password": "Senha123!",
  "name": "João Silva",
  "role": "consumer"
}
```

5. Clique em **"Execute"**

### 3. Resposta Esperada (Sucesso)

```json
{
  "message": "Usuário registrado com sucesso",
  "user_id": "507f1f77bcf86cd799439011",
  "email": "joao@example.com",
  "role": "consumer"
}
```

---

## 📂 Estrutura do Projeto

```
backend/
├── main.py                          # Entrada principal da aplicação
├── requirements.txt                 # Dependências Python
├── requirements-dev.txt             # Dependências para desenvolvimento
├── pytest.ini                       # Configuração de testes
├── .env                             # Variáveis de ambiente
│
├── app/
│   ├── __init__.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py                # Configurações da aplicação
│   │   ├── database.py              # Conexão MongoDB
│   │   ├── email.py                 # Serviço de emails
│   │   └── security.py              # JWT e criptografia
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   └── user.py                  # Modelo de usuário (MongoDB)
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   └── auth.py                  # Endpoints de autenticação
│   │
│   └── schemas/
│       ├── __init__.py
│       └── auth.py                  # Validação de dados (Pydantic)
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py                  # Configuração de testes
│   └── test_auth.py                 # Testes de autenticação
│
└── Documentação/
    ├── DOCS-BACKEND.md              # Este arquivo
    ├── README.md
    ├── START_HERE.md
    ├── API_EXAMPLES.md
    ├── FRONTEND_INTEGRATION.md
    └── ... (outros arquivos)
```

---

## 📋 Endpoints Disponíveis

### Autenticação

#### Register (Registrar)
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "Nome Completo",
  "role": "consumer" | "admin"
}
```

**Respostas:**
- `201 Created` - Usuário registrado com sucesso
- `400 Bad Request` - Email já existe ou validação falhou
- `422 Unprocessable Entity` - Dados inválidos

---

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Respostas:**
- `200 OK` - Login bem-sucedido, retorna token JWT
- `401 Unauthorized` - Credenciais inválidas
- `404 Not Found` - Usuário não encontrado

---

#### Forgot Password (Esqueci Senha)
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Respostas:**
- `200 OK` - Email de reset enviado
- `404 Not Found` - Usuário não encontrado

---

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
# MongoDB
MONGODB_URI=sua_connection_string

# JWT
SECRET_KEY=sua_chave_secreta
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASSWORD=sua_senha_app

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

---

## 🧬 Modelo de Dados

### User (Usuário)

```python
{
  "_id": ObjectId,           # ID único MongoDB
  "email": str,              # Email único
  "password_hash": str,      # Senha criptografada
  "name": str,               # Nome completo
  "role": "consumer|admin",  # Tipo de usuário
  "created_at": datetime,    # Data de criação
  "updated_at": datetime,    # Última atualização
  "is_active": bool          # Ativo/Inativo
}
```

---

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
pytest

# Com cobertura
pytest --cov=app

# Somente testes de autenticação
pytest tests/test_auth.py -v

# Modo watch (rerun automático)
pytest-watch
```

### Configuração de Testes

Veja [pytest.ini](pytest.ini) para configurações adicionais.

---

## 💻 Desenvolvimento

### Dependências de Dev

```bash
pip install -r requirements-dev.txt
```

Inclui:
- `pytest` - Testes
- `pytest-cov` - Cobertura de testes
- `black` - Formatação de código
- `flake8` - Linting
- `mypy` - Type checking

### Formatação de Código

```bash
# Formatar com Black
black .

# Lint com Flake8
flake8 .

# Type checking
mypy app/
```

---

## 🌐 Integração com Frontend

O backend está configurado com CORS para comunicação segura com o frontend React/TypeScript.

### URLs Configuradas

- `http://localhost:3000` (React dev server)
- `http://localhost:5173` (Vite dev server)

### Exemplo de Chamada Frontend

```typescript
// Login
const response = await fetch('http://localhost:8000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!'
  })
});

const data = await response.json();
localStorage.setItem('token', data.access_token);
```

---

## 📞 Troubleshooting

| Problema | Solução |
|----------|---------|
| **Porta 8000 em uso** | Mude em `main.py`: `uvicorn.run(..., port=8001)` |
| **MongoDB não conecta** | Verifique `MONGODB_URI` no `.env` |
| **CORS bloqueado** | Adicione origem em `CORS_ORIGINS` no `.env` |
| **Token JWT inválido** | Verifique `SECRET_KEY` e expiração |
| **Email não envia** | Verifique credenciais SMTP no `.env` |

---

## 📚 Documentação Adicional

- [START_HERE.md](START_HERE.md) - Guia para iniciantes
- [API_EXAMPLES.md](API_EXAMPLES.md) - Exemplos de uso
- [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) - Integração com React
- [README.md](README.md) - Informações gerais

---

## ✨ Features

- ✅ Autenticação segura com JWT
- ✅ Criptografia de senhas com Bcrypt
- ✅ Validação de dados com Pydantic
- ✅ Banco de dados MongoDB Atlas
- ✅ CORS configurado
- ✅ Documentação Swagger/OpenAPI
- ✅ Testes automatizados com Pytest
- ✅ Integração de emails
- ✅ Reset de senha seguro

---

**Último atualizado:** Junho 2024
