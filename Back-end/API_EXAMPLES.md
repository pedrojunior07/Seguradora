# Exemplos de Requisições API

## 🔐 Autenticação

### Registar Cliente
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123",
    "password_confirmation": "senha123",
    "perfil": "cliente",
    "tipo_cliente": "fisica",
    "nome_completo": "João Manuel Silva",
    "nuit": "123456789",
    "documento": "9876543",
    "endereco": "Rua Principal, 123",
    "telefone1": "+258841234567",
    "telefone2": "+258841234568"
  }'
```

### Registar Seguradora
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Seguradora",
    "email": "admin@seguros.com",
    "password": "senha123",
    "password_confirmation": "senha123",
    "perfil": "seguradora",
    "nome_empresa": "Seguros XYZ",
    "nuit": "987654321",
    "telefone": "+258841234567",
    "endereco": "Av. Principal, 456"
  }'
```

### Registar Corretora
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Corretora",
    "email": "admin@corretora.com",
    "password": "senha123",
    "password_confirmation": "senha123",
    "perfil": "corretora",
    "nome_empresa": "Corretora ABC",
    "nuit": "555666777",
    "telefone": "+258841234567",
    "endereco": "Rua da Corretora, 789",
    "licenca": "LIC2025001"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

Response:
```json
{
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@example.com",
    "perfil": "cliente",
    "perfil_id": 1,
    "status": true
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Obter Dados do Usuário
```bash
curl -X GET http://localhost:8000/api/me \
  -H "Authorization: Bearer {token}"
```

### Logout
```bash
curl -X POST http://localhost:8000/api/logout \
  -H "Authorization: Bearer {token}"
```

---

## 👤 ENDPOINTS DO CLIENTE

### Listar Apólices
```bash
curl -X GET http://localhost:8000/api/cliente/apolices \
  -H "Authorization: Bearer {token}"
```

### Listar Apólices Ativas
```bash
curl -X GET http://localhost:8000/api/cliente/apolices/ativas \
  -H "Authorization: Bearer {token}"
```

### Ver Detalhes da Apólice
```bash
curl -X GET http://localhost:8000/api/cliente/apolices/1 \
  -H "Authorization: Bearer {token}"
```

### Ver Pagamentos da Apólice
```bash
curl -X GET http://localhost:8000/api/cliente/apolices/1/pagamentos \
  -H "Authorization: Bearer {token}"
```

### Estatísticas do Cliente
```bash
curl -X GET http://localhost:8000/api/cliente/apolices/estatisticas \
  -H "Authorization: Bearer {token}"
```

### Listar Sinistros
```bash
curl -X GET http://localhost:8000/api/cliente/sinistros \
  -H "Authorization: Bearer {token}"
```

### Registar Sinistro
```bash
curl -X POST http://localhost:8000/api/cliente/sinistros \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "apolice_id": 1,
    "data_ocorrencia": "2025-12-10T14:30:00",
    "local_ocorrencia": "Estrada Principal, Maputo",
    "descricao_ocorrencia": "Colisão com outro veículo em semáforo vermelho. Danos moderados na frente do veículo.",
    "tipo_sinistro": "colisao",
    "causa_provavel": "Falha de atenção do condutor",
    "valor_estimado_dano": 5000.00,
    "envolve_terceiros": true,
    "dados_terceiros": [
      {
        "nome": "Manuel Pedro",
        "telefone": "+258841234567",
        "veiculo": "Toyota Corolla 2020"
      }
    ],
    "numero_bo": "BO/2025/12345",
    "data_bo": "2025-12-10"
  }'
```

### Ver Acompanhamento Sinistro
```bash
curl -X GET http://localhost:8000/api/cliente/sinistros/1/acompanhamento \
  -H "Authorization: Bearer {token}"
```

### Listar Pagamentos
```bash
curl -X GET http://localhost:8000/api/cliente/pagamentos \
  -H "Authorization: Bearer {token}"
```

### Listar Pagamentos Pendentes
```bash
curl -X GET http://localhost:8000/api/cliente/pagamentos/pendentes \
  -H "Authorization: Bearer {token}"
```

### Listar Pagamentos Atrasados
```bash
curl -X GET http://localhost:8000/api/cliente/pagamentos/atrasados \
  -H "Authorization: Bearer {token}"
```

### Registar Pagamento
```bash
curl -X POST http://localhost:8000/api/cliente/pagamentos/1/registrar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "metodo_pagamento_id": 1,
    "referencia_pagamento": "TRF20251215001",
    "comprovante": null
  }'
```

### Estatísticas de Pagamentos
```bash
curl -X GET http://localhost:8000/api/cliente/pagamentos/estatisticas \
  -H "Authorization: Bearer {token}"
```

---

## 🏢 ENDPOINTS DA SEGURADORA

### Apólices Pendentes Aprovação
```bash
curl -X GET http://localhost:8000/api/seguradora/apolices/pendentes \
  -H "Authorization: Bearer {token}"
```

### Apólices Ativas
```bash
curl -X GET http://localhost:8000/api/seguradora/apolices/ativas \
  -H "Authorization: Bearer {token}"
```

### Ver Detalhes Apólice
```bash
curl -X GET http://localhost:8000/api/seguradora/apolices/1 \
  -H "Authorization: Bearer {token}"
```

### Aprovar Apólice
```bash
curl -X POST http://localhost:8000/api/seguradora/apolices/1/aprovar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "observacoes": "Apólice aprovada conforme análise de risco."
  }'
```

### Rejeitar Apólice
```bash
curl -X POST http://localhost:8000/api/seguradora/apolices/1/rejeitar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "motivo": "Documentação incompleta. Solicitamos comprovante de renda adicional."
  }'
```

### Estatísticas Apólices
```bash
curl -X GET http://localhost:8000/api/seguradora/apolices/estatisticas \
  -H "Authorization: Bearer {token}"
```

### Sinistros Pendentes
```bash
curl -X GET http://localhost:8000/api/seguradora/sinistros/pendentes \
  -H "Authorization: Bearer {token}"
```

### Sinistros em Análise
```bash
curl -X GET http://localhost:8000/api/seguradora/sinistros/em-analise \
  -H "Authorization: Bearer {token}"
```

### Ver Detalhes Sinistro
```bash
curl -X GET http://localhost:8000/api/seguradora/sinistros/1 \
  -H "Authorization: Bearer {token}"
```

### Iniciar Análise Sinistro
```bash
curl -X POST http://localhost:8000/api/seguradora/sinistros/1/analisar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{}'
```

### Aprovar Sinistro
```bash
curl -X POST http://localhost:8000/api/seguradora/sinistros/1/aprovar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "valor_aprovado": 4500.00,
    "franquia": 500.00
  }'
```

### Negar Sinistro
```bash
curl -X POST http://localhost:8000/api/seguradora/sinistros/1/negar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "motivo": "Sinistro não se enquadra nas coberturas contratadas. Dano por negligência do segurado."
  }'
```

### Estatísticas Sinistros
```bash
curl -X GET http://localhost:8000/api/seguradora/sinistros/estatisticas \
  -H "Authorization: Bearer {token}"
```

---

## 🤝 ENDPOINTS DA CORRETORA

### Listar Propostas
```bash
curl -X GET http://localhost:8000/api/corretora/propostas \
  -H "Authorization: Bearer {token}"
```

### Criar Proposta
```bash
curl -X POST http://localhost:8000/api/corretora/propostas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "cliente_id": 1,
    "seguradora_seguro_id": 1,
    "tipo_proposta": "veiculo",
    "bem_id": 1,
    "bem_type": "App\\Models\\Veiculo",
    "valor_bem": 150000.00,
    "coberturas_selecionadas": [1, 2, 3],
    "parcelas_sugeridas": 12,
    "data_inicio_proposta": "2025-12-15",
    "data_fim_proposta": "2026-12-15",
    "observacoes": "Cliente preferencial - desconto de 10%"
  }'
```

### Ver Detalhes Proposta
```bash
curl -X GET http://localhost:8000/api/corretora/propostas/1 \
  -H "Authorization: Bearer {token}"
```

### Enviar Proposta
```bash
curl -X POST http://localhost:8000/api/corretora/propostas/1/enviar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{}'
```

### Converter Proposta em Apólice
```bash
curl -X POST http://localhost:8000/api/corretora/propostas/1/converter-apolice \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{}'
```

---

## 📊 ESTRUTURA DE RESPOSTAS

### Sucesso com Paginação
```json
{
  "data": [
    {
      "id_apolice": 1,
      "numero_apolice": "APL202500000001",
      "cliente_id": 1,
      "status": "ativa",
      ...
    }
  ],
  "links": {
    "first": "...",
    "last": "...",
    "prev": null,
    "next": "..."
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "path": "...",
    "per_page": 20,
    "to": 20,
    "total": 100
  }
}
```

### Erro de Validação
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### Erro de Autorização
```json
{
  "message": "Acesso não autorizado para este perfil",
  "perfil_atual": "cliente",
  "perfis_permitidos": ["seguradora"]
}
```

---

## 🧪 FLUXO COMPLETO DE VENDA

### 1. Cliente se registra
```
POST /register (perfil: cliente)
```

### 2. Cliente faz login
```
POST /login
```

### 3. Corretora cria proposta para cliente
```
POST /corretora/propostas
```

### 4. Corretora envia proposta
```
POST /corretora/propostas/{id}/enviar
```

### 5. Seguradora aprova proposta (via API interna)
```
Transição automática para aprovada ou manual por admin
```

### 6. Corretora converte proposta em apólice
```
POST /corretora/propostas/{id}/converter-apolice
```

### 7. Seguradora aprova apólice
```
POST /seguradora/apolices/{id}/aprovar
```

### 8. Cliente vê apólice ativa
```
GET /cliente/apolices/ativas
```

### 9. Cliente registra sinistro
```
POST /cliente/sinistros
```

### 10. Seguradora analisa e processa sinistro
```
POST /seguradora/sinistros/{id}/analisar
POST /seguradora/sinistros/{id}/aprovar
```

---

## 🔑 Headers Importantes

Todas as requisições autenticadas devem incluir:
```
Authorization: Bearer {seu_jwt_token_aqui}
Content-Type: application/json
```

---

## 📱 Variáveis de Ambiente para Testes

```bash
# Base URL
BASE_URL=http://localhost:8000/api

# Tokens (salvos após login)
CLIENTE_TOKEN=...
SEGURADORA_TOKEN=...
CORRETORA_TOKEN=...
```

---

## ⚠️ Códigos HTTP Esperados

| Código | Significado |
|--------|------------|
| 200 | Sucesso (GET, PUT, DELETE) |
| 201 | Criado com sucesso (POST) |
| 400 | Erro de validação ou negócio |
| 401 | Não autenticado |
| 403 | Não autorizado |
| 404 | Recurso não encontrado |
| 422 | Dados inválidos |
| 500 | Erro do servidor |

---

Estes exemplos cobrem os fluxos principais do sistema. Adapte conforme necessário para seus IDs reais.
