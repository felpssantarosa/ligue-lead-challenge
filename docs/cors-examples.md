# Exemplos de Configuração CORS

Este arquivo contém exemplos de configuração CORS para diferentes cenários de uso.

## Desenvolvimento Local

Para desenvolvimento com frontend rodando em localhost:

```bash
# .env.development
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:5173
CORS_CREDENTIALS=true
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With,X-CSRF-Token
```

## Produção - Aplicação Web Simples

Para uma aplicação web em produção com domínio específico:

```bash
# .env.production
CORS_ORIGIN=https://meuapp.com
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE
CORS_ALLOWED_HEADERS=Content-Type,Authorization
```

## Produção - Múltiplos Domínios

Para aplicação com múltiplos domínios (ex: app web + app mobile):

```bash
# .env.production
CORS_ORIGIN=https://app.meudominio.com,https://admin.meudominio.com,https://mobile.meudominio.com
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,PATCH
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With
```

## API Pública

Para uma API completamente pública (não recomendado para produção com dados sensíveis):

```bash
# .env
CORS_ORIGIN=*
CORS_CREDENTIALS=false
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With
```

## Aplicação com Subdomínios

Para aplicações que usam subdomínios dinâmicos:

```bash
# .env
CORS_ORIGIN=https://*.meudominio.com
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE
CORS_ALLOWED_HEADERS=Content-Type,Authorization
```

**Nota**: Para subdomínios dinâmicos, você pode precisar implementar uma função personalizada na configuração do CORS.

## Configuração Restritiva para APIs Corporativas

Para APIs internas ou corporativas com máxima segurança:

```bash
# .env.corporate
CORS_ORIGIN=https://intranet.empresa.com,https://app.empresa.com
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-CSRF-Token
```

## Testing/Staging

Para ambientes de teste:

```bash
# .env.staging
CORS_ORIGIN=https://staging.meuapp.com,https://test.meuapp.com,http://localhost:3000
CORS_CREDENTIALS=true
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With,X-Test-Header
```

## Dicas de Segurança

1. **Nunca use `CORS_ORIGIN=*` em produção** se `CORS_CREDENTIALS=true`
2. **Sempre especifique domínios exatos** em produção
3. **Limite os métodos** HTTP aos necessários
4. **Limite os headers** aos essenciais para sua aplicação
5. **Use HTTPS** sempre em produção
6. **Monitore logs** para tentativas de acesso não autorizadas

## Debugging CORS

Para debuggar problemas de CORS, você pode:

1. Verificar as variáveis de ambiente estão carregadas:

```bash
curl -I http://localhost:3000/health -H "Origin: http://localhost:3001"
```

2. Testar preflight requests:

```bash
curl -X OPTIONS http://localhost:3000/api/projects \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type" \
  -v
```

3. Verificar logs do servidor para erros de CORS
4. Usar as ferramentas de desenvolvedor do browser (Network tab)
