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
- Git
- Docker

Caso não deseje utilizar docker:

- Redis
- MySQL

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
DB_PORT=3306
DB_NAME=ligue_lead_challenge
DB_USER=root
DB_PASS=password

# Configuração do JWT
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui
JWT_EXPIRES_IN=7d

# Configuração do Redis (opcional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Configuração do CORS
CORS_ORIGIN=*                                                     # Domínios permitidos (* para permitir todos)
CORS_CREDENTIALS=false                                            # Permitir cookies e credenciais
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS               # Métodos HTTP permitidos
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With  # Headers permitidos
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
# Suba todos os serviços (API, MySQL, Redis)
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

Esta API utiliza **Scalar** para documentação interativa e moderna. A documentação completa está disponível quando o servidor está em execução.

### 🚀 Acessar Documentação

- **Scalar UI (Recomendado)**: http://localhost:3000/api/docs
  - Interface moderna e intuitiva
  - Testes de API integrados
  - Busca por hotkey (pressione 'k')
  
- **Swagger UI (Alternativo)**: http://localhost:3000/api/docs-swagger
  - Interface tradicional do Swagger
  
- **OpenAPI JSON**: http://localhost:3000/api/docs/openapi.json
  - Especificação para importar em outras ferramentas

### 📖 Documentação Adicional

- [Documentação Completa da API](./docs/API_DOCUMENTATION.md)
- [Exemplos de Uso](./docs/API_EXAMPLES.md)

### 🔐 Autenticação Rápida

1. **Registre um usuário**: `POST /auth/register`
2. **Faça login**: `POST /auth/login`
3. **Use o token**: Inclua o header `Authorization: Bearer <token>`

### 📋 Endpoints Principais

#### Autenticação
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Obter token de acesso

#### Projetos  
- `GET /api/projects` - Listar projetos (com filtros e busca)
- `GET /api/projects/:id` - Obter projeto específico
- `POST /api/projects` - Criar novo projeto (autenticado)
- `PUT /api/projects/:id` - Atualizar projeto (autenticado)
- `DELETE /api/projects/:id` - Deletar projeto (autenticado)

#### Tarefas
- `GET /api/tasks` - Listar tarefas
- `GET /api/projects/:id/tasks` - Tarefas de um projeto
- `POST /api/tasks` - Criar tarefa (autenticado)
- `PUT /api/tasks/:id` - Atualizar tarefa (autenticado)
- `DELETE /api/tasks/:id` - Deletar tarefa (autenticado)

### 🔍 Recursos Avançados

- **Busca e Filtros**: `/api/projects?search=termo&tags=react,nodejs`
- **Paginação**: `/api/projects?page=1&limit=10`
- **Integração GitHub**: `/api/projects/:id/github/:username`

> **💡 Dica**: Use a documentação interativa do Scalar para explorar todos os endpoints, testar requisições e ver exemplos de response!

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

## 🌐 Configuração CORS

A API possui configuração flexível de CORS via variáveis de ambiente:

### Desenvolvimento (Permissivo)

```bash
CORS_ORIGIN=*
CORS_CREDENTIALS=false
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With
```

### Produção (Restritivo)

```bash
CORS_ORIGIN=https://meuapp.com,https://app.meudominio.com
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE
CORS_ALLOWED_HEADERS=Content-Type,Authorization
```

### Configurações Disponíveis

- **CORS_ORIGIN**: Domínios permitidos
  - `*` = todos os domínios (apenas desenvolvimento)
  - `https://app.com` = domínio específico
  - `https://app1.com,https://app2.com` = múltiplos domínios
- **CORS_CREDENTIALS**: Permitir cookies/credenciais (`true`/`false`)
- **CORS_METHODS**: Métodos HTTP permitidos (separados por vírgula)
- **CORS_ALLOWED_HEADERS**: Headers permitidos (separados por vírgula)

## 🛡️ Segurança

- Autenticação JWT
- Validação de entrada com Zod
- Sanitização de dados
- CORS configurável por ambiente
- Headers de segurança com Helmet

## 🚀 Deploy

### Variáveis de Ambiente para Produção

Certifique-se de configurar todas as variáveis de ambiente necessárias:

- Use senhas fortes para banco de dados
- Configure `JWT_SECRET` com uma chave segura
- Configure `NODE_ENV=production`
- Configure URLs corretas para o banco de dados e Redis

## 👨‍💻 Desenvolvedor

Desenvolvido por [Felipe Santarosa](https://github.com/felpssantarosa) como parte do desafio técnico da Ligue Lead.
