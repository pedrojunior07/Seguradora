# Cenários de Teste - API Sistema de Seguros

## Índice
1. [Testes de Autenticação](#1-testes-de-autenticação)
2. [Testes de Categorias](#2-testes-de-categorias)
3. [Testes de Seguros](#3-testes-de-seguros)
4. [Testes de Apólices](#4-testes-de-apólices)
5. [Testes de Pagamentos](#5-testes-de-pagamentos)
6. [Testes de Sinistros](#6-testes-de-sinistros)
7. [Testes de Propostas](#7-testes-de-propostas)
8. [Testes de Segurança](#8-testes-de-segurança)
9. [Testes de Performance](#9-testes-de-performance)

---

## 1. Testes de Autenticação

### CT-AUTH-001: Registro de Cliente com Sucesso
**Objetivo:** Validar o registro de um novo cliente pessoa física

**Pré-condições:**
- Email não existe no sistema
- NUIT não existe no sistema

**Dados de Entrada:**
```json
{
  "name": "João Silva",
  "email": "joao.silva.001@example.com",
  "password": "senha123456",
  "password_confirmation": "senha123456",
  "perfil": "cliente",
  "tipo_cliente": "fisica",
  "nome_completo": "João Alberto Silva",
  "nuit": "100000001",
  "telefone1": "+258 84 000 0001"
}
```

**Resultado Esperado:**
- HTTP Status: 201
- Resposta contém: `user`, `entidade`, `token`, `token_type`, `expires_in`
- Token JWT válido é retornado
- Cliente criado no banco de dados

---

### CT-AUTH-002: Registro com Email Duplicado
**Objetivo:** Validar que o sistema rejeita emails duplicados

**Pré-condições:**
- Email já existe no sistema

**Dados de Entrada:**
```json
{
  "name": "Maria Santos",
  "email": "joao.silva.001@example.com",
  "password": "senha123456",
  "password_confirmation": "senha123456",
  "perfil": "cliente",
  "tipo_cliente": "fisica",
  "nome_completo": "Maria Santos",
  "nuit": "100000002",
  "telefone1": "+258 84 000 0002"
}
```

**Resultado Esperado:**
- HTTP Status: 400 ou 422
- Mensagem de erro contém referência ao email duplicado
- Nenhum registro criado no banco

---

### CT-AUTH-003: Login com Credenciais Válidas
**Objetivo:** Validar login bem-sucedido

**Pré-condições:**
- Usuário existe e está ativo

**Dados de Entrada:**
```json
{
  "email": "joao.silva.001@example.com",
  "password": "senha123456"
}
```

**Resultado Esperado:**
- HTTP Status: 200
- Token JWT válido retornado
- Campo `perfil` indica o tipo correto
- Token possui expiração definida

---

### CT-AUTH-004: Login com Senha Incorreta
**Objetivo:** Validar rejeição de senha incorreta

**Dados de Entrada:**
```json
{
  "email": "joao.silva.001@example.com",
  "password": "senhaerrada"
}
```

**Resultado Esperado:**
- HTTP Status: 401
- Mensagem: "Credenciais inválidas"
- Nenhum token retornado

---

### CT-AUTH-005: Acesso a Rota Protegida sem Token
**Objetivo:** Validar proteção de rotas autenticadas

**Endpoint:** GET /api/me

**Headers:** Nenhum

**Resultado Esperado:**
- HTTP Status: 401
- Mensagem de erro sobre autenticação

---

### CT-AUTH-006: Refresh Token
**Objetivo:** Validar renovação de token JWT

**Pré-condições:**
- Token válido existe

**Resultado Esperado:**
- HTTP Status: 200
- Novo token retornado
- Token antigo invalidado

---

## 2. Testes de Categorias

### CT-CAT-001: Listar Categorias
**Objetivo:** Validar listagem de categorias

**Pré-condições:**
- Usuário autenticado
- Pelo menos 1 categoria existe

**Resultado Esperado:**
- HTTP Status: 200
- Array de categorias retornado
- Cada categoria contém: `id_categoria`, `descricao`, `seguros_count`

---

### CT-CAT-002: Criar Categoria Nova
**Objetivo:** Validar criação de categoria

**Dados de Entrada:**
```json
{
  "descricao": "Seguro Empresarial"
}
```

**Resultado Esperado:**
- HTTP Status: 201
- Categoria criada com ID
- Mensagem de sucesso

---

### CT-CAT-003: Criar Categoria Duplicada
**Objetivo:** Validar rejeição de categoria duplicada

**Pré-condições:**
- Categoria "Seguro Empresarial" já existe

**Dados de Entrada:**
```json
{
  "descricao": "Seguro Empresarial"
}
```

**Resultado Esperado:**
- HTTP Status: 400 ou 422
- Mensagem de erro sobre duplicação

---

## 3. Testes de Seguros

### CT-SEG-001: Criar Seguro Completo
**Objetivo:** Validar criação de seguro pela seguradora

**Pré-condições:**
- Usuário logado como seguradora
- Categoria existe

**Dados de Entrada:**
```json
{
  "nome": "Auto Premium Plus",
  "descricao": "Cobertura total para veículos premium",
  "tipo_seguro": "automovel",
  "id_categoria": 1
}
```

**Resultado Esperado:**
- HTTP Status: 201
- Seguro criado com status "ativo"
- ID do seguro retornado

---

### CT-SEG-002: Listar Seguros com Filtros
**Objetivo:** Validar filtros de listagem

**Query Params:**
```
?status=ativo&tipo_seguro=automovel&per_page=10
```

**Resultado Esperado:**
- HTTP Status: 200
- Apenas seguros ativos e de automóvel retornados
- Máximo 10 itens por página

---

### CT-SEG-003: Adicionar Preço ao Seguro
**Objetivo:** Validar adição de preço

**Dados de Entrada:**
```json
{
  "valor_base": 2500.00,
  "periodicidade": "mensal",
  "descricao": "Plano Premium Mensal"
}
```

**Resultado Esperado:**
- HTTP Status: 201
- Preço associado ao seguro
- Status do preço = "ativo"

---

### CT-SEG-004: Adicionar Cobertura ao Seguro
**Objetivo:** Validar adição de cobertura

**Dados de Entrada:**
```json
{
  "descricao": "Colisão Total",
  "tipo_cobertura": "opcional",
  "valor_cobertura": 100000.00,
  "percentual": 85
}
```

**Resultado Esperado:**
- HTTP Status: 201
- Cobertura associada ao seguro

---

### CT-SEG-005: Tentar Criar Seguro como Cliente
**Objetivo:** Validar controle de acesso por perfil

**Pré-condições:**
- Usuário logado como cliente

**Resultado Esperado:**
- HTTP Status: 403
- Mensagem de acesso negado

---

## 4. Testes de Apólices

### CT-APO-001: Listar Apólices Pendentes (Seguradora)
**Objetivo:** Validar listagem de apólices pendentes

**Pré-condições:**
- Usuário logado como seguradora
- Existe apólice pendente

**Resultado Esperado:**
- HTTP Status: 200
- Apenas apólices com status "pendente_aprovacao"
- Apenas da seguradora autenticada

---

### CT-APO-002: Aprovar Apólice
**Objetivo:** Validar aprovação de apólice

**Dados de Entrada:**
```json
{
  "observacoes": "Aprovado após análise de risco"
}
```

**Pré-condições:**
- Apólice está pendente
- Pertence à seguradora autenticada

**Resultado Esperado:**
- HTTP Status: 200
- Status muda para "ativa"
- Pagamentos são gerados automaticamente

**Validações Adicionais:**
- Verificar se número de parcelas foi criado
- Verificar datas de vencimento corretas

---

### CT-APO-003: Rejeitar Apólice
**Objetivo:** Validar rejeição de apólice

**Dados de Entrada:**
```json
{
  "motivo": "Risco elevado - histórico de sinistros"
}
```

**Resultado Esperado:**
- HTTP Status: 200
- Status muda para "cancelada"
- Motivo registrado

---

### CT-APO-004: Tentar Aprovar Apólice de Outra Seguradora
**Objetivo:** Validar controle de acesso entre seguradoras

**Pré-condições:**
- Apólice pertence a outra seguradora

**Resultado Esperado:**
- HTTP Status: 403
- Mensagem de acesso negado

---

### CT-APO-005: Estatísticas de Apólices
**Objetivo:** Validar cálculos estatísticos

**Resultado Esperado:**
- HTTP Status: 200
- Campos retornados:
  - `total_apolices`
  - `ativas`
  - `pendentes`
  - `valor_total_premios`
- Valores corretos conforme banco de dados

---

## 5. Testes de Pagamentos

### CT-PAG-001: Listar Pagamentos Pendentes (Cliente)
**Objetivo:** Validar listagem de pagamentos pendentes

**Pré-condições:**
- Cliente com apólice ativa
- Existem parcelas pendentes

**Resultado Esperado:**
- HTTP Status: 200
- Apenas pagamentos do cliente autenticado
- Apenas com status "pendente"
- Ordenados por data de vencimento

---

### CT-PAG-002: Listar Pagamentos Atrasados
**Objetivo:** Validar identificação de pagamentos atrasados

**Resultado Esperado:**
- HTTP Status: 200
- Apenas pagamentos com vencimento passado
- Status = "pendente"

---

### CT-PAG-003: Registrar Pagamento com Comprovante
**Objetivo:** Validar registro de pagamento

**Dados de Entrada:** (multipart/form-data)
```
metodo_pagamento_id: 1
referencia_pagamento: "MPESA-2024-001"
comprovante: [arquivo.pdf]
```

**Resultado Esperado:**
- HTTP Status: 200
- Status muda para "pago"
- Data de pagamento registrada
- Comprovante armazenado
- Path do comprovante retornado

---

### CT-PAG-004: Tentar Pagar Parcela Já Paga
**Objetivo:** Validar prevenção de duplo pagamento

**Pré-condições:**
- Pagamento já possui status "pago"

**Resultado Esperado:**
- HTTP Status: 400
- Mensagem: "Este pagamento já foi processado"

---

### CT-PAG-005: Tentar Pagar Parcela de Outro Cliente
**Objetivo:** Validar controle de acesso

**Pré-condições:**
- Pagamento pertence a outro cliente

**Resultado Esperado:**
- HTTP Status: 403
- Acesso negado

---

### CT-PAG-006: Estatísticas de Pagamentos
**Objetivo:** Validar cálculos de estatísticas

**Resultado Esperado:**
- HTTP Status: 200
- Todos os campos calculados corretamente:
  - `total_pendente`
  - `total_pago`
  - `total_atrasado`
  - `quantidade_pendente`
  - `quantidade_pago`
  - `quantidade_atrasada`

---

## 6. Testes de Sinistros

### CT-SIN-001: Registrar Sinistro Simples
**Objetivo:** Validar registro de sinistro

**Dados de Entrada:**
```json
{
  "apolice_id": 1,
  "data_ocorrencia": "2024-01-20",
  "hora_ocorrencia": "15:30:00",
  "local_ocorrencia": "Av. Julius Nyerere, Maputo",
  "descricao_ocorrido": "Colisão traseira",
  "valor_estimado_dano": 10000.00,
  "houve_vitimas": false
}
```

**Resultado Esperado:**
- HTTP Status: 201
- Sinistro criado com número único
- Status = "aberto"
- Data de comunicação = data atual

---

### CT-SIN-002: Registrar Sinistro com Vítimas
**Objetivo:** Validar campos adicionais para sinistros graves

**Dados de Entrada:**
```json
{
  "apolice_id": 1,
  "data_ocorrencia": "2024-01-20",
  "descricao_ocorrido": "Colisão frontal",
  "valor_estimado_dano": 50000.00,
  "houve_vitimas": true,
  "numero_vitimas": 2,
  "gravidade_vitimas": "leve",
  "boletim_ocorrencia": "BO-2024-001"
}
```

**Resultado Esperado:**
- HTTP Status: 201
- Campos de vítimas salvos corretamente

---

### CT-SIN-003: Tentar Registrar Sinistro em Apólice Inativa
**Objetivo:** Validar validação de apólice

**Pré-condições:**
- Apólice com status != "ativa"

**Resultado Esperado:**
- HTTP Status: 400
- Mensagem de erro sobre apólice inativa

---

### CT-SIN-004: Acompanhar Sinistro
**Objetivo:** Validar tracking de sinistro

**Resultado Esperado:**
- HTTP Status: 200
- Campos retornados:
  - `numero_sinistro`
  - `status`
  - `data_comunicacao`
  - `data_analise`
  - `valor_estimado`
  - `valor_aprovado`
  - `valor_indenizacao`
  - `data_pagamento`
  - `observacoes`

---

### CT-SIN-005: Tentar Acessar Sinistro de Outro Cliente
**Objetivo:** Validar isolamento de dados

**Pré-condições:**
- Sinistro pertence a outro cliente

**Resultado Esperado:**
- HTTP Status: 403
- Acesso negado

---

## 7. Testes de Propostas

### CT-PRO-001: Criar Proposta Completa
**Objetivo:** Validar criação de proposta pela corretora

**Dados de Entrada:**
```json
{
  "cliente_id": 1,
  "seguradora_seguro_id": 1,
  "tipo_proposta": "individual",
  "valor_bem": 250000.00,
  "coberturas_selecionadas": [1, 2],
  "bem_id": 1,
  "bem_type": "App\\Models\\Veiculo",
  "parcelas_sugeridas": 12
}
```

**Resultado Esperado:**
- HTTP Status: 201
- Proposta criada com número único
- Status = "rascunho"
- `premio_calculado` com valor correto
- Validade = 30 dias

---

### CT-PRO-002: Enviar Proposta
**Objetivo:** Validar mudança de status da proposta

**Pré-condições:**
- Proposta em status "rascunho"

**Resultado Esperado:**
- HTTP Status: 200
- Status muda para "enviada"
- Data de envio registrada

---

### CT-PRO-003: Converter Proposta Aprovada em Apólice
**Objetivo:** Validar geração de apólice

**Pré-condições:**
- Proposta com status "aprovada"

**Resultado Esperado:**
- HTTP Status: 201
- Apólice criada
- Dados copiados da proposta
- Status da apólice = "pendente_aprovacao"
- Status da proposta = "convertida"

---

### CT-PRO-004: Tentar Converter Proposta Não Aprovada
**Objetivo:** Validar regra de negócio

**Pré-condições:**
- Proposta com status != "aprovada"

**Resultado Esperado:**
- HTTP Status: 400
- Mensagem: "Apenas propostas aprovadas podem ser convertidas"

---

## 8. Testes de Segurança

### CT-SEC-001: Injeção SQL
**Objetivo:** Validar proteção contra SQL Injection

**Dados de Entrada:**
```json
{
  "email": "test@example.com' OR '1'='1",
  "password": "senha123"
}
```

**Resultado Esperado:**
- Nenhuma vulnerabilidade explorada
- Resposta normal (erro de autenticação)

---

### CT-SEC-002: XSS em Campos de Texto
**Objetivo:** Validar sanitização de inputs

**Dados de Entrada:**
```json
{
  "descricao": "<script>alert('XSS')</script>"
}
```

**Resultado Esperado:**
- Script não executado
- Dados sanitizados ou escapados

---

### CT-SEC-003: Token JWT Expirado
**Objetivo:** Validar validação de expiração

**Pré-condições:**
- Token JWT expirado

**Resultado Esperado:**
- HTTP Status: 401
- Mensagem sobre token expirado

---

### CT-SEC-004: Token JWT Manipulado
**Objetivo:** Validar validação de assinatura

**Pré-condições:**
- Token JWT com assinatura inválida

**Resultado Esperado:**
- HTTP Status: 401
- Acesso negado

---

### CT-SEC-005: CORS Headers
**Objetivo:** Validar configuração CORS

**Resultado Esperado:**
- Headers CORS apropriados retornados
- Origens permitidas configuradas

---

## 9. Testes de Performance

### CT-PERF-001: Listagem com Muitos Registros
**Objetivo:** Validar performance de paginação

**Cenário:**
- 10.000 apólices no banco
- Requisição sem paginação

**Resultado Esperado:**
- Resposta em < 2 segundos
- Paginação automática aplicada

---

### CT-PERF-002: Cálculo de Prêmio Complexo
**Objetivo:** Validar performance de cálculos

**Cenário:**
- Proposta com 10 coberturas
- Múltiplos fatores de risco

**Resultado Esperado:**
- Cálculo completo em < 1 segundo

---

### CT-PERF-003: Upload de Comprovante Grande
**Objetivo:** Validar upload de arquivos

**Cenário:**
- Upload de PDF de 5MB

**Resultado Esperado:**
- Upload bem-sucedido em < 10 segundos
- Arquivo salvo corretamente

---

## Matriz de Rastreabilidade

| ID Requisito | Casos de Teste Relacionados |
|--------------|----------------------------|
| REQ-AUTH-001 | CT-AUTH-001, CT-AUTH-002, CT-AUTH-003 |
| REQ-AUTH-002 | CT-AUTH-004, CT-AUTH-005 |
| REQ-CAT-001 | CT-CAT-001, CT-CAT-002 |
| REQ-SEG-001 | CT-SEG-001, CT-SEG-002, CT-SEG-003 |
| REQ-APO-001 | CT-APO-001, CT-APO-002, CT-APO-003 |
| REQ-PAG-001 | CT-PAG-001, CT-PAG-002, CT-PAG-003 |
| REQ-SIN-001 | CT-SIN-001, CT-SIN-002, CT-SIN-003 |
| REQ-PRO-001 | CT-PRO-001, CT-PRO-002, CT-PRO-003 |
| REQ-SEC-001 | CT-SEC-001, CT-SEC-002, CT-SEC-003 |

---

## Como Executar os Testes

### Testes Manuais
1. Siga a ordem dos casos de teste
2. Registre os resultados em planilha
3. Capture screenshots de falhas

### Testes Automatizados (Postman/Newman)
```bash
# Executar collection do Postman
newman run postman_collection.json -e environment.json

# Com relatório HTML
newman run postman_collection.json -e environment.json -r htmlextra
```

### Testes com PHPUnit (Futuro)
```bash
# Executar todos os testes
php artisan test

# Executar testes específicos
php artisan test --filter=AuthenticationTest

# Com cobertura de código
php artisan test --coverage
```

---

## Critérios de Aceite

- ✅ Todos os casos de teste devem passar
- ✅ Cobertura de código > 80%
- ✅ Tempo de resposta < 2s para 95% das requisições
- ✅ Sem vulnerabilidades de segurança críticas
- ✅ Documentação atualizada e completa
