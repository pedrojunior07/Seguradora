# 📚 Documentação da API - Sistema de Seguros

## 🎯 Visão Geral

Este projeto possui documentação completa da API utilizando **Swagger/OpenAPI 3.0**, com anotações detalhadas em todos os controladores e casos de teste abrangentes.

## 📖 Recursos Disponíveis

### 1. Documentação Interativa Swagger

Acesse a interface interativa do Swagger:

```
http://127.0.0.1:8000/api/documentation
```

**Recursos da Interface:**
- ✅ Testar todos os endpoints diretamente no navegador
- ✅ Visualizar schemas de requisição e resposta
- ✅ Autenticação JWT integrada
- ✅ Exemplos práticos de uso
- ✅ Download da especificação OpenAPI

### 2. Arquivos de Documentação

| Arquivo | Descrição |
|---------|-----------|
| [DOCUMENTACAO_API.md](DOCUMENTACAO_API.md) | Documentação completa com exemplos de uso e casos de teste |
| [POSTMAN_COLLECTION.md](POSTMAN_COLLECTION.md) | Collection JSON para importar no Postman/Insomnia |
| [CENARIOS_TESTE.md](CENARIOS_TESTE.md) | Casos de teste detalhados e matriz de rastreabilidade |
| `storage/api-docs/api-docs.json` | Especificação OpenAPI em formato JSON |

## 🚀 Como Usar

### Acessar Documentação Swagger

1. Certifique-se de que o servidor está rodando:
```bash
php artisan serve
```

2. Abra o navegador:
```
http://127.0.0.1:8000/api/documentation
```

3. Para testar endpoints protegidos:
   - Clique em "Authorize" (cadeado no topo)
   - Faça login via endpoint `/api/login`
   - Copie o token retornado
   - Cole no campo "Value" com o prefixo "Bearer "
   - Exemplo: `Bearer eyJ0eXAiOiJKV1QiLCJhbGc...`

### Regenerar Documentação

Se você adicionar ou modificar anotações nos controladores:

```bash
php artisan l5-swagger:generate
```

### Importar no Postman

1. Abra o arquivo [POSTMAN_COLLECTION.md](POSTMAN_COLLECTION.md)
2. Copie o JSON completo
3. No Postman: `Import` > `Raw text` > Cole o JSON
4. A collection será criada com todas as requisições organizadas

## 📋 Estrutura da API

### Endpoints Principais

#### Autenticação
- `POST /api/register` - Registrar novo usuário
- `POST /api/login` - Fazer login
- `GET /api/me` - Dados do usuário autenticado
- `POST /api/logout` - Fazer logout
- `POST /api/refresh` - Renovar token

#### Categorias
- `GET /api/categorias` - Listar categorias
- `POST /api/categorias` - Criar categoria
- `PUT /api/categorias/{id}` - Atualizar categoria
- `DELETE /api/categorias/{id}` - Deletar categoria

#### Seguradora - Seguros
- `GET /api/seguradora/seguros` - Listar seguros
- `POST /api/seguradora/seguros` - Criar seguro
- `GET /api/seguradora/seguros/{id}` - Detalhes do seguro
- `PUT /api/seguradora/seguros/{id}` - Atualizar seguro
- `POST /api/seguradora/seguros/{id}/ativar` - Ativar seguro
- `POST /api/seguradora/seguros/{id}/desativar` - Desativar seguro
- `POST /api/seguradora/seguros/{id}/precos` - Adicionar preço
- `POST /api/seguradora/seguros/{id}/coberturas` - Adicionar cobertura

#### Seguradora - Apólices
- `GET /api/seguradora/apolices/pendentes` - Apólices pendentes
- `GET /api/seguradora/apolices/ativas` - Apólices ativas
- `GET /api/seguradora/apolices/{apolice}` - Detalhes da apólice
- `POST /api/seguradora/apolices/{apolice}/aprovar` - Aprovar apólice
- `POST /api/seguradora/apolices/{apolice}/rejeitar` - Rejeitar apólice
- `GET /api/seguradora/apolices/estatisticas` - Estatísticas

#### Seguradora - Sinistros
- `GET /api/seguradora/sinistros/pendentes` - Sinistros pendentes
- `GET /api/seguradora/sinistros/em-analise` - Sinistros em análise
- `GET /api/seguradora/sinistros/{sinistro}` - Detalhes do sinistro
- `POST /api/seguradora/sinistros/{sinistro}/analisar` - Analisar sinistro
- `POST /api/seguradora/sinistros/{sinistro}/aprovar` - Aprovar sinistro
- `POST /api/seguradora/sinistros/{sinistro}/negar` - Negar sinistro
- `GET /api/seguradora/sinistros/estatisticas` - Estatísticas

#### Corretora - Propostas
- `GET /api/corretora/propostas` - Listar propostas
- `POST /api/corretora/propostas` - Criar proposta
- `GET /api/corretora/propostas/{proposta}` - Detalhes da proposta
- `POST /api/corretora/propostas/{proposta}/enviar` - Enviar proposta
- `POST /api/corretora/propostas/{proposta}/converter-apolice` - Converter em apólice

#### Cliente - Apólices
- `GET /api/cliente/apolices` - Listar apólices
- `GET /api/cliente/apolices/ativas` - Apólices ativas
- `GET /api/cliente/apolices/{apolice}` - Detalhes da apólice
- `GET /api/cliente/apolices/{apolice}/pagamentos` - Pagamentos da apólice
- `GET /api/cliente/apolices/estatisticas` - Estatísticas

#### Cliente - Sinistros
- `GET /api/cliente/sinistros` - Listar sinistros
- `POST /api/cliente/sinistros` - Registrar sinistro
- `GET /api/cliente/sinistros/{sinistro}` - Detalhes do sinistro
- `GET /api/cliente/sinistros/{sinistro}/acompanhamento` - Acompanhar sinistro
- `GET /api/cliente/sinistros/estatisticas` - Estatísticas

#### Cliente - Pagamentos
- `GET /api/cliente/pagamentos` - Listar pagamentos
- `GET /api/cliente/pagamentos/pendentes` - Pagamentos pendentes
- `GET /api/cliente/pagamentos/atrasados` - Pagamentos atrasados
- `GET /api/cliente/pagamentos/{pagamento}` - Detalhes do pagamento
- `POST /api/cliente/pagamentos/{pagamento}/registrar` - Registrar pagamento
- `GET /api/cliente/pagamentos/estatisticas` - Estatísticas

## 🔐 Autenticação

A API utiliza **JWT (JSON Web Token)** para autenticação.

### Fluxo de Autenticação

1. **Registrar ou fazer login:**
```bash
POST /api/login
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

2. **Receber token:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

3. **Usar token nas requisições:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

## 📊 Exemplos de Uso

### Exemplo 1: Registrar Cliente

```bash
curl -X POST http://127.0.0.1:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123",
    "password_confirmation": "senha123",
    "perfil": "cliente",
    "tipo_cliente": "fisica",
    "nome_completo": "João Alberto Silva",
    "nuit": "123456789",
    "telefone1": "+258 84 123 4567"
  }'
```

### Exemplo 2: Criar Seguro (Seguradora)

```bash
curl -X POST http://127.0.0.1:8000/api/seguradora/seguros \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Seguro Auto Premium",
    "descricao": "Cobertura completa",
    "tipo_seguro": "automovel",
    "id_categoria": 1
  }'
```

### Exemplo 3: Registrar Sinistro (Cliente)

```bash
curl -X POST http://127.0.0.1:8000/api/cliente/sinistros \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "apolice_id": 1,
    "data_ocorrencia": "2024-01-20",
    "descricao_ocorrido": "Colisão traseira",
    "valor_estimado_dano": 10000.00,
    "houve_vitimas": false
  }'
```

## 🧪 Testes

### Executar Testes Manuais

Consulte o arquivo [CENARIOS_TESTE.md](CENARIOS_TESTE.md) para casos de teste detalhados.

### Executar com Postman/Newman

```bash
# Instalar Newman
npm install -g newman

# Executar testes
newman run postman_collection.json -e environment.json

# Com relatório HTML
newman run postman_collection.json -r htmlextra
```

## 📝 Anotações Swagger

### Exemplo de Anotação em Controlador

```php
/**
 * @OA\Post(
 *     path="/api/seguradora/seguros",
 *     summary="Criar novo seguro",
 *     description="Cadastra um novo produto de seguro",
 *     tags={"Seguradora - Seguros"},
 *     security={{"bearerAuth":{}}},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"nome","tipo_seguro"},
 *             @OA\Property(property="nome", type="string", example="Seguro Auto"),
 *             @OA\Property(property="tipo_seguro", type="string", enum={"automovel","saude"})
 *         )
 *     ),
 *     @OA\Response(
 *         response=201,
 *         description="Seguro criado com sucesso"
 *     )
 * )
 */
public function store(Request $request) { ... }
```

## 🔧 Configuração

### Arquivo de Configuração L5-Swagger

O arquivo de configuração está em:
```
config/l5-swagger.php
```

### Personalizar Documentação

Edite o controlador base:
```php
// app/Http/Controllers/Controller.php

/**
 * @OA\Info(
 *     title="API Seguros TM",
 *     version="1.0.0",
 *     description="Sua descrição aqui"
 * )
 * @OA\Server(
 *     url="http://127.0.0.1:8000",
 *     description="Servidor Local"
 * )
 */
abstract class Controller { }
```

## 📚 Recursos Adicionais

- [OpenAPI Specification](https://swagger.io/specification/)
- [L5-Swagger Documentation](https://github.com/DarkaOnLine/L5-Swagger)
- [JWT Authentication](https://jwt.io/)

## 🤝 Contribuindo

Ao adicionar novos endpoints:

1. Adicione anotações Swagger no método do controlador
2. Execute `php artisan l5-swagger:generate`
3. Verifique a documentação em `/api/documentation`
4. Atualize os arquivos de teste conforme necessário

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte a documentação Swagger interativa
- Verifique os exemplos em `DOCUMENTACAO_API.md`
- Revise os casos de teste em `CENARIOS_TESTE.md`

---

**Última atualização:** 2024-01-20
**Versão da API:** 1.0.0
**Tecnologias:** Laravel 12, JWT Auth, L5-Swagger
