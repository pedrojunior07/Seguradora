# Documentação Completa da API - Sistema de Seguros

## Acesso à Documentação Swagger

A documentação interativa Swagger está disponível em:
```
http://127.0.0.1:8000/api/documentation
```

## Visão Geral

API RESTful para gerenciamento completo de seguros, com suporte a três perfis de usuário:
- **Cliente**: Gerencia suas apólices, sinistros e pagamentos
- **Seguradora**: Administra seguros, aprova apólices e analisa sinistros
- **Corretora**: Cria propostas e facilita a contratação de seguros

## Autenticação

A API utiliza JWT (JSON Web Token) para autenticação. Após fazer login, inclua o token em todas as requisições:

```
Authorization: Bearer {seu_token_aqui}
```

---

## Casos de Teste Detalhados

### 1. AUTENTICAÇÃO

#### 1.1. Registrar Cliente (Pessoa Física)

**Endpoint:** `POST /api/register`

**Caso de Teste 1.1.1 - Sucesso:**
```json
{
  "name": "João Silva",
  "email": "joao.silva@example.com",
  "password": "senha123",
  "password_confirmation": "senha123",
  "perfil": "cliente",
  "tipo_cliente": "fisica",
  "nome_completo": "João Alberto Silva",
  "nuit": "123456789",
  "documento": "BI123456",
  "endereco": "Av. Julius Nyerere, 123, Maputo",
  "telefone1": "+258 84 123 4567",
  "telefone2": "+258 82 987 6543"
}
```

**Resposta Esperada:** HTTP 201
```json
{
  "message": "Registro realizado com sucesso",
  "user": { ... },
  "entidade": { ... },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

**Caso de Teste 1.1.2 - Email duplicado:**
```json
{
  "name": "Maria Santos",
  "email": "joao.silva@example.com",
  "password": "senha123",
  "password_confirmation": "senha123",
  "perfil": "cliente"
}
```

**Resposta Esperada:** HTTP 400
```json
{
  "message": "The email has already been taken.",
  "errors": {
    "email": ["The email has already been taken."]
  }
}
```

#### 1.2. Registrar Seguradora

**Endpoint:** `POST /api/register`

**Caso de Teste 1.2.1 - Sucesso:**
```json
{
  "name": "Seguradora Premium",
  "email": "contato@seguradorapremium.com",
  "password": "senha123",
  "password_confirmation": "senha123",
  "perfil": "seguradora",
  "nome_empresa": "Seguradora Premium Moçambique Lda",
  "nuit": "987654321",
  "telefone": "+258 21 123 456",
  "endereco": "Av. 25 de Setembro, 789, Maputo"
}
```

**Resposta Esperada:** HTTP 201

#### 1.3. Login

**Endpoint:** `POST /api/login`

**Caso de Teste 1.3.1 - Login com sucesso:**
```json
{
  "email": "joao.silva@example.com",
  "password": "senha123"
}
```

**Resposta Esperada:** HTTP 200
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "perfil": "cliente",
  "perfil_id": 1
}
```

**Caso de Teste 1.3.2 - Credenciais inválidas:**
```json
{
  "email": "joao.silva@example.com",
  "password": "senhaerrada"
}
```

**Resposta Esperada:** HTTP 401
```json
{
  "message": "Credenciais inválidas"
}
```

#### 1.4. Obter Dados do Usuário

**Endpoint:** `GET /api/me`

**Headers:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Resposta Esperada:** HTTP 200
```json
{
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao.silva@example.com",
    "perfil": "cliente",
    "perfil_id": 1
  },
  "entidade": {
    "id_cliente": 1,
    "nome_completo": "João Alberto Silva",
    "nuit": "123456789",
    "tipo_cliente": "fisica"
  }
}
```

---

### 2. CATEGORIAS

#### 2.1. Listar Categorias

**Endpoint:** `GET /api/categorias`

**Headers:** `Authorization: Bearer {token}`

**Resposta Esperada:** HTTP 200
```json
[
  {
    "id_categoria": 1,
    "descricao": "Automóvel",
    "seguros_count": 5
  },
  {
    "id_categoria": 2,
    "descricao": "Saúde",
    "seguros_count": 3
  }
]
```

#### 2.2. Criar Categoria

**Endpoint:** `POST /api/categorias`

**Caso de Teste 2.2.1 - Criar categoria:**
```json
{
  "descricao": "Seguro de Vida"
}
```

**Resposta Esperada:** HTTP 201
```json
{
  "message": "Categoria criada com sucesso",
  "data": {
    "id_categoria": 3,
    "descricao": "Seguro de Vida"
  }
}
```

---

### 3. SEGURADORA - SEGUROS

#### 3.1. Listar Seguros da Seguradora

**Endpoint:** `GET /api/seguradora/seguros`

**Headers:** `Authorization: Bearer {token_seguradora}`

**Query Parameters:**
- `status` (opcional): ativo, inativo
- `tipo_seguro` (opcional): automovel, saude, residencial, vida
- `id_categoria` (opcional): integer
- `per_page` (opcional): integer (default: 15)

**Exemplo:**
```
GET /api/seguradora/seguros?status=ativo&tipo_seguro=automovel&per_page=20
```

**Resposta Esperada:** HTTP 200
```json
{
  "current_page": 1,
  "data": [
    {
      "id_seguro": 1,
      "nome": "Seguro Auto Premium",
      "descricao": "Cobertura completa para veículos",
      "tipo_seguro": "automovel",
      "status": "ativo",
      "id_categoria": 1
    }
  ],
  "total": 50,
  "per_page": 20
}
```

#### 3.2. Criar Novo Seguro

**Endpoint:** `POST /api/seguradora/seguros`

**Caso de Teste 3.2.1 - Criar seguro de automóvel:**
```json
{
  "nome": "Seguro Auto Total",
  "descricao": "Proteção completa para seu veículo com cobertura contra colisão, roubo e terceiros",
  "tipo_seguro": "automovel",
  "id_categoria": 1,
  "detalhes": {
    "idade_minima_condutor": 21,
    "franquia_minima": 5000,
    "valor_max_indenizacao": 500000
  }
}
```

**Resposta Esperada:** HTTP 201
```json
{
  "message": "Seguro criado com sucesso",
  "data": {
    "id_seguro": 2,
    "nome": "Seguro Auto Total",
    "status": "ativo",
    "tipo_seguro": "automovel",
    "created_at": "2024-01-15T10:30:00.000000Z"
  }
}
```

#### 3.3. Obter Detalhes do Seguro

**Endpoint:** `GET /api/seguradora/seguros/{id}`

**Exemplo:** `GET /api/seguradora/seguros/1`

**Resposta Esperada:** HTTP 200
```json
{
  "data": {
    "id_seguro": 1,
    "nome": "Seguro Auto Premium",
    "descricao": "Cobertura completa",
    "tipo_seguro": "automovel",
    "status": "ativo",
    "precos": [
      {
        "id_preco": 1,
        "valor_base": 1500.00,
        "periodicidade": "mensal",
        "status": "ativo"
      }
    ],
    "coberturas": [
      {
        "id_cobertura": 1,
        "descricao": "Colisão",
        "tipo_cobertura": "obrigatoria",
        "percentual": 100
      }
    ]
  }
}
```

#### 3.4. Adicionar Preço ao Seguro

**Endpoint:** `POST /api/seguradora/seguros/{id}/precos`

**Caso de Teste 3.4.1 - Adicionar preço mensal:**
```json
{
  "valor_base": 1500.00,
  "periodicidade": "mensal",
  "descricao": "Plano básico mensal"
}
```

**Resposta Esperada:** HTTP 201
```json
{
  "message": "Preço adicionado com sucesso",
  "data": {
    "id_preco": 1,
    "id_seguro": 1,
    "valor_base": 1500.00,
    "periodicidade": "mensal",
    "status": "ativo"
  }
}
```

#### 3.5. Adicionar Cobertura ao Seguro

**Endpoint:** `POST /api/seguradora/seguros/{id}/coberturas`

**Caso de Teste 3.5.1 - Adicionar cobertura obrigatória:**
```json
{
  "descricao": "Responsabilidade Civil",
  "tipo_cobertura": "obrigatoria",
  "valor_cobertura": 50000.00,
  "percentual": 100,
  "detalhes": {
    "limite_danos_materiais": 30000,
    "limite_danos_corporais": 20000
  }
}
```

**Resposta Esperada:** HTTP 201

---

### 4. SEGURADORA - APÓLICES

#### 4.1. Listar Apólices Pendentes

**Endpoint:** `GET /api/seguradora/apolices/pendentes`

**Resposta Esperada:** HTTP 200
```json
{
  "data": [
    {
      "id_apolice": 1,
      "numero_apolice": "APO-2024-001",
      "status": "pendente_aprovacao",
      "premio_total": 18000.00,
      "data_inicio": "2024-02-01",
      "data_fim": "2025-02-01",
      "cliente": {
        "id_cliente": 1,
        "nome_completo": "João Alberto Silva"
      },
      "bem_segurado": {
        "tipo": "Veiculo",
        "marca": "Toyota",
        "modelo": "Corolla"
      }
    }
  ]
}
```

#### 4.2. Aprovar Apólice

**Endpoint:** `POST /api/seguradora/apolices/{apolice}/aprovar`

**Caso de Teste 4.2.1 - Aprovar apólice:**
```json
{
  "observacoes": "Apólice aprovada após análise de risco. Cliente possui bom histórico."
}
```

**Resposta Esperada:** HTTP 200
```json
{
  "message": "Apólice aprovada com sucesso",
  "apolice": {
    "id_apolice": 1,
    "status": "ativa",
    "data_aprovacao": "2024-01-20T14:30:00.000000Z"
  }
}
```

#### 4.3. Rejeitar Apólice

**Endpoint:** `POST /api/seguradora/apolices/{apolice}/rejeitar`

**Caso de Teste 4.3.1 - Rejeitar apólice:**
```json
{
  "motivo": "Risco elevado: Cliente possui histórico de múltiplos sinistros nos últimos 2 anos"
}
```

**Resposta Esperada:** HTTP 200
```json
{
  "message": "Apólice rejeitada",
  "apolice": {
    "id_apolice": 2,
    "status": "cancelada",
    "motivo_cancelamento": "Risco elevado..."
  }
}
```

#### 4.4. Estatísticas de Apólices

**Endpoint:** `GET /api/seguradora/apolices/estatisticas`

**Resposta Esperada:** HTTP 200
```json
{
  "total_apolices": 150,
  "ativas": 120,
  "pendentes": 15,
  "valor_total_premios": 2500000.00
}
```

---

### 5. CLIENTE - PAGAMENTOS

#### 5.1. Listar Pagamentos Pendentes

**Endpoint:** `GET /api/cliente/pagamentos/pendentes`

**Headers:** `Authorization: Bearer {token_cliente}`

**Resposta Esperada:** HTTP 200
```json
[
  {
    "id_pagamento": 1,
    "numero_pagamento": "PAG-2024-001-01",
    "valor_parcela": 1500.00,
    "data_vencimento": "2024-02-15",
    "status": "pendente",
    "numero_parcela": 1,
    "apolice": {
      "numero_apolice": "APO-2024-001"
    }
  }
]
```

#### 5.2. Listar Pagamentos Atrasados

**Endpoint:** `GET /api/cliente/pagamentos/atrasados`

**Resposta Esperada:** HTTP 200
```json
[
  {
    "id_pagamento": 2,
    "numero_pagamento": "PAG-2024-002-01",
    "valor_parcela": 1500.00,
    "data_vencimento": "2024-01-15",
    "status": "pendente",
    "dias_atraso": 5
  }
]
```

#### 5.3. Registrar Pagamento

**Endpoint:** `POST /api/cliente/pagamentos/{pagamento}/registrar`

**Content-Type:** `multipart/form-data`

**Caso de Teste 5.3.1 - Registrar pagamento com comprovante:**
```
metodo_pagamento_id: 1
referencia_pagamento: REF-M-PESA-123456
comprovante: [arquivo.pdf ou imagem.jpg]
```

**Resposta Esperada:** HTTP 200
```json
{
  "message": "Pagamento registado com sucesso",
  "pagamento": {
    "id_pagamento": 1,
    "status": "pago",
    "data_pagamento": "2024-01-20T10:00:00.000000Z",
    "valor_pago": 1500.00,
    "comprovante_pagamento": "pagamentos/PAG-2024-001-01/comprovante.pdf"
  }
}
```

#### 5.4. Estatísticas de Pagamentos

**Endpoint:** `GET /api/cliente/pagamentos/estatisticas`

**Resposta Esperada:** HTTP 200
```json
{
  "total_pendente": 15000.00,
  "total_pago": 45000.00,
  "total_atrasado": 3000.00,
  "quantidade_pendente": 10,
  "quantidade_pago": 30,
  "quantidade_atrasada": 2
}
```

---

### 6. CLIENTE - SINISTROS

#### 6.1. Registrar Sinistro

**Endpoint:** `POST /api/cliente/sinistros`

**Caso de Teste 6.1.1 - Registrar sinistro de colisão:**
```json
{
  "apolice_id": 1,
  "data_ocorrencia": "2024-01-15",
  "hora_ocorrencia": "14:30:00",
  "local_ocorrencia": "Av. Julius Nyerere, esquina com Rua da Paz, Maputo",
  "descricao_ocorrido": "Colisão traseira em semáforo. Veículo da frente freou bruscamente e não consegui parar a tempo. Danos na parte frontal do meu veículo.",
  "valor_estimado_dano": 15000.00,
  "houve_vitimas": false,
  "boletim_ocorrencia": "BO-2024-12345"
}
```

**Resposta Esperada:** HTTP 201
```json
{
  "message": "Sinistro registado com sucesso",
  "sinistro": {
    "id_sinistro": 1,
    "numero_sinistro": "SIN-2024-001",
    "status": "aberto",
    "data_comunicacao": "2024-01-15T15:00:00.000000Z"
  }
}
```

**Caso de Teste 6.1.2 - Sinistro com vítimas:**
```json
{
  "apolice_id": 1,
  "data_ocorrencia": "2024-01-18",
  "hora_ocorrencia": "08:15:00",
  "local_ocorrencia": "EN1, Km 25, Matola",
  "descricao_ocorrido": "Colisão frontal com outro veículo. Houve feridos.",
  "valor_estimado_dano": 50000.00,
  "houve_vitimas": true,
  "numero_vitimas": 2,
  "gravidade_vitimas": "leve",
  "boletim_ocorrencia": "BO-2024-54321"
}
```

**Resposta Esperada:** HTTP 201

#### 6.2. Acompanhar Sinistro

**Endpoint:** `GET /api/cliente/sinistros/{sinistro}/acompanhamento`

**Exemplo:** `GET /api/cliente/sinistros/1/acompanhamento`

**Resposta Esperada:** HTTP 200
```json
{
  "numero_sinistro": "SIN-2024-001",
  "status": "em_analise",
  "data_comunicacao": "2024-01-15T15:00:00.000000Z",
  "data_analise": "2024-01-16T10:00:00.000000Z",
  "valor_estimado": 15000.00,
  "valor_aprovado": 12000.00,
  "valor_indenizacao": null,
  "data_pagamento": null,
  "observacoes": "Sinistro em análise. Aguardando perícia técnica."
}
```

#### 6.3. Estatísticas de Sinistros

**Endpoint:** `GET /api/cliente/sinistros/estatisticas`

**Resposta Esperada:** HTTP 200
```json
{
  "total_sinistros": 5,
  "abertos": 1,
  "em_analise": 2,
  "aprovados": 1,
  "pagos": 0,
  "negados": 1,
  "valor_total_indenizado": 0
}
```

---

### 7. CORRETORA - PROPOSTAS

#### 7.1. Criar Proposta

**Endpoint:** `POST /api/corretora/propostas`

**Caso de Teste 7.1.1 - Criar proposta de seguro auto:**
```json
{
  "cliente_id": 1,
  "seguradora_seguro_id": 1,
  "tipo_proposta": "individual",
  "valor_bem": 350000.00,
  "coberturas_selecionadas": [1, 2, 3],
  "bem_id": 1,
  "bem_type": "App\\Models\\Veiculo",
  "parcelas_sugeridas": 12,
  "observacoes": "Cliente preferencial, possui outros seguros conosco"
}
```

**Resposta Esperada:** HTTP 201
```json
{
  "message": "Proposta criada com sucesso",
  "proposta": {
    "id_proposta": 1,
    "numero_proposta": "PROP-2024-001",
    "premio_calculado": 18000.00,
    "status": "rascunho",
    "validade_proposta": "2024-02-20",
    "cliente": { ... },
    "seguradora_seguro": { ... }
  }
}
```

#### 7.2. Enviar Proposta

**Endpoint:** `POST /api/corretora/propostas/{proposta}/enviar`

**Caso de Teste 7.2.1 - Enviar proposta para análise:**

**Resposta Esperada:** HTTP 200
```json
{
  "message": "Proposta enviada",
  "proposta": {
    "id_proposta": 1,
    "status": "enviada",
    "data_envio": "2024-01-20T16:00:00.000000Z"
  }
}
```

#### 7.3. Converter Proposta em Apólice

**Endpoint:** `POST /api/corretora/propostas/{proposta}/converter-apolice`

**Caso de Teste 7.3.1 - Converter proposta aprovada:**

**Resposta Esperada:** HTTP 201
```json
{
  "message": "Apólice gerada a partir da proposta",
  "apolice": {
    "id_apolice": 1,
    "numero_apolice": "APO-2024-001",
    "status": "pendente_aprovacao",
    "premio_total": 18000.00
  }
}
```

**Caso de Teste 7.3.2 - Erro: Proposta não aprovada:**

**Resposta Esperada:** HTTP 400
```json
{
  "message": "Apenas propostas aprovadas podem ser convertidas"
}
```

---

## Fluxos Completos de Teste

### FLUXO 1: Contratação de Seguro (Happy Path)

1. **Cliente se registra:**
   - POST `/api/register` (perfil: cliente)
   - Recebe token JWT

2. **Corretora cria proposta:**
   - POST `/api/register` (perfil: corretora)
   - POST `/api/corretora/propostas` (com dados do cliente)
   - Recebe proposta com prêmio calculado

3. **Corretora envia proposta:**
   - POST `/api/corretora/propostas/{id}/enviar`
   - Status muda para "enviada"

4. **Seguradora aprova proposta:**
   - POST `/api/register` (perfil: seguradora)
   - Aprova proposta (via processo interno)

5. **Corretora converte em apólice:**
   - POST `/api/corretora/propostas/{id}/converter-apolice`
   - Apólice criada com status "pendente_aprovacao"

6. **Seguradora aprova apólice:**
   - POST `/api/seguradora/apolices/{id}/aprovar`
   - Apólice ativa, pagamentos gerados

7. **Cliente realiza pagamento:**
   - GET `/api/cliente/pagamentos/pendentes`
   - POST `/api/cliente/pagamentos/{id}/registrar`

### FLUXO 2: Registro e Pagamento de Sinistro

1. **Cliente registra sinistro:**
   - POST `/api/cliente/sinistros`
   - Sinistro criado com status "aberto"

2. **Seguradora analisa sinistro:**
   - GET `/api/seguradora/sinistros/pendentes`
   - POST `/api/seguradora/sinistros/{id}/analisar`
   - Status muda para "em_analise"

3. **Seguradora aprova sinistro:**
   - POST `/api/seguradora/sinistros/{id}/aprovar`
   - Define valor de indenização

4. **Cliente acompanha status:**
   - GET `/api/cliente/sinistros/{id}/acompanhamento`
   - Visualiza valor aprovado

---

## Códigos de Erro Comuns

| Código | Significado | Exemplo |
|--------|-------------|---------|
| 200 | Sucesso | Operação concluída |
| 201 | Criado | Recurso criado com sucesso |
| 400 | Requisição inválida | Validação falhou |
| 401 | Não autenticado | Token inválido ou ausente |
| 403 | Não autorizado | Sem permissão para o recurso |
| 404 | Não encontrado | Recurso não existe |
| 422 | Entidade não processável | Erro de validação específico |
| 500 | Erro interno | Erro no servidor |

---

## Validações Importantes

### Registro de Cliente
- Email único no sistema
- NUIT obrigatório e único
- Senha mínima de 8 caracteres
- Telefone1 obrigatório para clientes

### Criação de Seguros
- Nome do seguro único por seguradora
- Tipo de seguro deve ser válido (automovel, saude, residencial, vida)
- Categoria deve existir

### Registro de Sinistro
- Apólice deve estar ativa
- Data de ocorrência não pode ser futura
- Cliente deve ser titular da apólice

### Pagamentos
- Apenas pagamentos pendentes podem ser registrados
- Comprovante é opcional mas recomendado
- Valor pago deve corresponder ao valor da parcela

---

## Observações Finais

1. **Paginação:** Endpoints de listagem suportam paginação via parâmetro `per_page`
2. **Filtros:** Utilize query parameters para filtrar resultados
3. **Relacionamentos:** Use `?include=` para incluir relacionamentos (quando disponível)
4. **Ordenação:** Use `?sort=` para ordenar resultados (quando disponível)
5. **Token JWT:** Expira em 60 minutos. Use `/api/refresh` para renovar

---

## Suporte e Recursos

- **Documentação Swagger:** http://127.0.0.1:8000/api/documentation
- **JSON da API:** http://127.0.0.1:8000/api/documentation/api-docs.json
- **Regenerar Docs:** `php artisan l5-swagger:generate`
