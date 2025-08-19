# API Documentation

Este projeto utiliza **Scalar** para documentação interativa da API REST. O Scalar é uma moderna plataforma de documentação que oferece uma interface intuitiva para explorar e testar endpoints da API.

## URLs de Documentação

### 🚀 Scalar UI (Recomendado)
- **URL**: http://localhost:3000/api/docs
- **Descrição**: Interface moderna e interativa do Scalar
- **Características**:
  - Design limpo e moderno
  - Testes de API integrados
  - Busca por hotkey (pressione 'k')
  - Suporte completo ao OpenAPI 3.0

### 📚 Swagger UI (Alternativo)
- **URL**: http://localhost:3000/api/docs-swagger
- **Descrição**: Interface tradicional do Swagger UI
- **Características**:
  - Interface familiar do Swagger
  - Testes de API integrados
  - Suporte a autorização JWT

### 📄 Especificação OpenAPI JSON
- **URL**: http://localhost:3000/api/docs/openapi.json
- **Descrição**: Especificação OpenAPI 3.0 em formato JSON
- **Uso**: Para importar em outras ferramentas como Postman, Insomnia, etc.

## Estrutura da API

### 🔐 Autenticação
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Fazer login e obter token JWT

### 📁 Projetos
- `GET /api/projects` - Listar projetos com filtros e paginação
- `POST /api/projects` - Criar novo projeto (autenticado)
- `GET /api/projects/:id` - Obter projeto específico
- `PUT /api/projects/:id` - Atualizar projeto (autenticado)
- `DELETE /api/projects/:id` - Deletar projeto (autenticado)

### ✅ Tarefas
- `POST /api/projects/:projectId/tasks` - Criar nova tarefa em projeto específico (autenticado)
- `PUT /api/tasks/:id` - Atualizar tarefa (autenticado)
- `DELETE /api/tasks/:id` - Deletar tarefa (autenticado)

## Autenticação

A API utiliza **JWT (JSON Web Tokens)** para autenticação. Para acessar endpoints protegidos:

1. Registre um usuário ou faça login através dos endpoints `/auth/register` ou `/auth/login`
2. Use o token retornado no header Authorization: `Bearer <token>`
3. O Scalar e Swagger UI possuem interfaces para configurar a autenticação

## Filtros e Busca

### Projetos
- **Busca**: Use o parâmetro `search` para buscar por título ou descrição
- **Tags**: Use o parâmetro `tags` com uma lista separada por vírgulas
- **Paginação**: Use `page` e `limit` para controlar a paginação

Exemplo:
```
GET /api/projects?page=1&limit=10&search=react&tags=frontend,javascript
```

## Schemas

### Project
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "active|completed|paused",
  "tags": ["string"],
  "githubUrl": "string",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

### Task
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "todo|in_progress|done",
  "projectId": "uuid",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

### User
```json
{
  "id": "uuid",
  "email": "string",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

## Respostas Padrão

### Sucesso
```json
{
  "success": true,
  "data": {},
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "hasNextPage": false
  }
}
```

### Erro
```json
{
  "success": false,
  "error": {
    "type": "ValidationError",
    "message": "Invalid data provided",
    "field": "email",
    "value": "invalid-email"
  }
}
```

## Tecnologias Utilizadas

- **Scalar**: Interface moderna de documentação
- **Swagger JSDoc**: Geração de OpenAPI a partir de comentários
- **Swagger UI Express**: Interface alternativa do Swagger
- **OpenAPI 3.0**: Especificação da API
