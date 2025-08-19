# Ligue Lead Challenge

API REST desenvolvida como parte do desafio técnico da Ligue Lead. Esta aplicação implementa um sistema de gerenciamento de projetos e tarefas com autenticação JWT e integração com GitHub.

## 🚀 Funcionalidades

- **Autenticação JWT**: Sistema de login seguro
- **Gerenciamento de Projetos**: Criação, listagem, atualização e exclusão de projetos
- **Gerenciamento de Tarefas**: CRUD de tarefas vinculadas a projetos
- **Integração GitHub**: Sincronização com repositórios GitHub
- **Validação de Dados**: Validação robusta usando Zod
- **Cache Redis**: Sistema de cache para otimização de performance
- **Testes**: Cobertura completa com testes unitários, integração e E2E

## 📋 Pré-requisitos

- Node.js >= 22.0.0
- PostgreSQL >= 13
- Redis
- Git

## 🛠️ Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/felpssantarosa/ligue-lead-challenge.git
cd ligue-lead-challenge
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Configuração do Servidor
PORT=3000
NODE_ENV=development

# Configuração do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ligue_lead_challenge
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres

# Configuração do JWT
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui
JWT_EXPIRES_IN=7d

# Configuração do Redis (opcional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Configure o banco de dados

Execute as migrações para criar as tabelas:

```bash
npm run migration:run
```

Popule o banco com dados iniciais (opcional):

```bash
npm run seed:run
```

### 5. Inicie o servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build && npm start
```

A API estará disponível em `http://localhost:3000`

## 🧪 Como Executar os Testes

### Todos os Testes

```bash
npm test
```

### Testes em Modo Watch

```bash
npm run test:watch
```

### Cobertura de Testes

```bash
npm run test:coverage
```

Os relatórios de cobertura estarão disponíveis em `coverage/lcov-report/index.html`

## 🐳 Docker

### Usando Docker Compose (Recomendado)

```bash
# Suba todos os serviços (API, PostgreSQL, Redis)
docker-compose up -d
```

### MySQL e Redis, rodando a aplicação localmente

```bash
docker compose up -d mysql redis
npm run dev

# ou
# npm run build
# npm start
```

### Apenas a aplicação

Nota: Deve ter MySQL e Redis em execução em sua máquina.

```bash
# Build da imagem
docker build -t ligue-lead-api .

# Executar o container
docker run -p 3000:3000 --env-file .env ligue-lead-api
```

## 📚 Documentação da API

### Autenticação

Todos os endpoints (exceto login e registro) requerem autenticação via JWT.
Inclua o token no header da requisição:

```
Authorization: Bearer seu_jwt_token_aqui
```

### Endpoints Principais

#### Usuários

- `POST /users/register` - Registrar novo usuário
- `POST /users/login` - Login do usuário
- `GET /users/profile` - Obter perfil do usuário logado
- `PUT /users/profile` - Atualizar perfil do usuário

#### Projetos

- `GET /projects` - Listar todos os projetos
- `GET /projects/:id` - Obter projeto específico
- `POST /projects` - Criar novo projeto
- `PUT /projects/:id` - Atualizar projeto
- `DELETE /projects/:id` - Deletar projeto

#### Tarefas

- `GET /tasks` - Listar todas as tarefas
- `GET /tasks/:id` - Obter tarefa específica
- `POST /tasks` - Criar nova tarefa
- `PUT /tasks/:id` - Atualizar tarefa
- `DELETE /tasks/:id` - Deletar tarefa

## 🏗️ Arquitetura

O projeto segue os princípios de Clean Architecture e DDD (Domain Driven Design):

```
src/
├── config/           # Configurações da aplicação
├── shared/           # Código compartilhado
│   ├── domain/       # Entidades e value objects
│   ├── infra/        # Infraestrutura (DB, Container Injection, etc)
│   ├── validation/   # Esquemas de validação
│   └── Errors/       # Classes de erro customizadas
├── user/             # Módulo de usuários
├── project/          # Módulo de projetos
└── task/             # Módulo de tarefas
```

Cada módulo segue a estrutura:

- `controller/` - Controladores HTTP
- `service/` - Lógica de negócio
- `domain/` - Entidades do domínio
- `infra/` - Repositórios e adaptadores
- `validation/` - Validações específicas

## 🛡️ Segurança

- Autenticação JWT
- Validação de entrada com Zod
- Sanitização de dados

## 🚀 Deploy

### Variáveis de Ambiente para Produção

Certifique-se de configurar todas as variáveis de ambiente necessárias:

- Use senhas fortes para banco de dados
- Configure `JWT_SECRET` com uma chave segura
- Configure `NODE_ENV=production`
- Configure URLs corretas para o banco de dados e Redis

## 👨‍💻 Desenvolvedor

Desenvolvido por [Felipe Santarosa](https://github.com/felpssantarosa) como parte do desafio técnico da Ligue Lead.
