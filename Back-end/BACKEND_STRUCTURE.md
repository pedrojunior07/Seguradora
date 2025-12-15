# Sistema de Gestão de Venda de Seguros - Backend

## Visão Geral

Backend Laravel 12 robusto com JWT para sistema completo de gestão de seguros com três perfis principais: Seguradora, Corretora e Cliente.

## Estrutura de Perfis

### 1. SEGURADORA
Responsável por:
- Cadastrar e gerir produtos de seguro
- Definir preços, prémios e tabelas de valores
- Estabelecer coberturas e franquias
- Criar categorias de seguros
- Aceitar/rejeitar associações com corretoras
- Gerir agentes próprios
- Definir percentagens de comissão
- Aprovar apólices
- Acompanhar pagamentos
- Controlar estados das apólices
- Gerir sinistros

**Endpoints:** `/seguradora/*`

### 2. CORRETORA
Responsável por:
- Associar-se a múltiplas seguradoras
- Gerir agentes próprios
- Definir comissões dos agentes
- Vender seguros em nome das seguradoras
- Intermediar entre cliente e seguradora
- Receber comissões pelas vendas
- Acompanhar vigência das parcerias
- Controlar estado dos agentes
- Emitir propostas de seguro
- Acompanhar renovações

**Endpoints:** `/corretora/*`

### 3. CLIENTE
Responsável por:
- Cadastrar-se no sistema (pessoa física ou jurídica)
- Registar veículos para seguro
- Registar propriedades/imóveis
- Contratar seguros
- Gerir frotas de veículos
- Registar dados bancários
- Efetuar pagamentos em parcelas
- Escolher método de pagamento
- Acompanhar estado das apólices
- Registar bens como garantia
- Consultar coberturas contratadas
- Solicitar acionamento de seguro

**Endpoints:** `/cliente/*`

## Arquitetura de Dados

### Models Principais

#### User
- Autenticação centralizada
- Campo `perfil`: seguradora, corretora, cliente, agente, admin
- Campo `perfil_id`: ID da entidade do perfil
- Suporte JWT com claims customizados

#### Entities
- **Seguradora**: Entidade seguadora
- **Corretora**: Entidade intermediária
- **Cliente**: Entidade cliente (pessoa física/jurídica)
- **Agente**: Agente de venda

#### Insurance Models
- **Seguro**: Produto de seguro
- **Categoria**: Categoria de seguros
- **SeguradoraSeguro**: Relacionamento entre seguradora e seguro
- **DetalhesCobertura**: Coberturas disponíveis
- **Preco**: Tabelas de preços por seguro

#### Policy Models
- **Apolice**: Apólice de seguro contratada
- **Proposta**: Proposta de seguro
- **Pagamento**: Pagamento de apólices
- **Sinistro**: Sinistros registados

#### Relationship Models
- **CorretoraSeguradora**: Parceria entre corretora e seguradora
- **AgenteCorretora**: Agente vinculado a corretora
- **AgenteSeguradora**: Agente vinculado a seguradora
- **CorretoraSeguroSeguradora**: Acesso de corretora a produto
- **AgenteSeguroSeguradora**: Acesso de agente a produto
- **Comissao**: Cálculo e rastreamento de comissões

## Estrutura de Diretórios

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php
│   │   ├── Seguradora/
│   │   │   ├── ApoliceController.php
│   │   │   ├── SinistroController.php
│   │   │   └── ...
│   │   ├── Corretora/
│   │   │   ├── PropostaController.php
│   │   │   └── ...
│   │   └── Cliente/
│   │       ├── ApoliceController.php
│   │       ├── SinistroController.php
│   │       ├── PagamentoController.php
│   │       └── ...
│   ├── Middleware/
│   │   ├── CheckPerfil.php
│   │   ├── CheckSeguradora.php
│   │   ├── CheckCorretora.php
│   │   └── CheckCliente.php
│   ├── Requests/
│   │   ├── Auth/
│   │   ├── Seguradora/
│   │   ├── Corretora/
│   │   └── Cliente/
│   └── Resources/
├── Models/
│   ├── User.php
│   ├── Seguradora.php
│   ├── Corretora.php
│   ├── Cliente.php
│   ├── Agente.php
│   ├── Seguro.php
│   ├── Apolice.php
│   ├── Proposta.php
│   ├── Sinistro.php
│   ├── Pagamento.php
│   ├── Comissao.php
│   └── ...
├── Services/
│   ├── AuthService.php
│   ├── ApoliceService.php
│   ├── ComissaoService.php
│   └── SinistroService.php
└── Policies/
```

## Migrations

Total de **10 novas migrations** criadas:

1. `update_users_table_add_perfil` - Adiciona campos de perfil ao usuário
2. `update_corretora_seguradoras_table` - Completa estrutura de parceria
3. `create_apolices_table` - Apólices de seguro
4. `create_sinistros_table` - Sinistros registados
5. `create_propostas_table` - Propostas de seguro
6. `create_pagamentos_table` - Pagamentos de apólices
7. `update_agente_corretora_add_comissao` - Adiciona comissões
8. `update_metodo_pagamentos_table` - Completa métodos de pagamento
9. `add_status_corretora` - Adiciona status e licença
10. `create_detalhes_bancarios_cliente_table` - Dados bancários de clientes

## Autenticação

### Flow de Registro
```
POST /register
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "perfil": "cliente|seguradora|corretora",
  // Campos específicos por perfil
}

Response:
{
  "user": { ... },
  "entidade": { ... }
}
```

### Flow de Login
```
POST /login
{
  "email": "joao@example.com",
  "password": "senha123"
}

Response:
{
  "user": { ... },
  "token": "eyJ0eXAi...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Headers Autenticados
```
Authorization: Bearer eyJ0eXAi...
```

## Endpoints Principais

### Autenticação
- `POST /register` - Registar novo usuário
- `POST /login` - Autenticar usuário
- `GET /me` - Dados do usuário autenticado
- `POST /logout` - Sair
- `POST /refresh` - Renovar token

### Seguradora - Apólices
- `GET /seguradora/apolices/pendentes` - Apólices pendentes aprovação
- `GET /seguradora/apolices/ativas` - Apólices ativas
- `GET /seguradora/apolices/{id}` - Detalhes da apólice
- `POST /seguradora/apolices/{id}/aprovar` - Aprovar apólice
- `POST /seguradora/apolices/{id}/rejeitar` - Rejeitar apólice
- `GET /seguradora/apolices/estatisticas` - Estatísticas

### Seguradora - Sinistros
- `GET /seguradora/sinistros/pendentes` - Sinistros abertos
- `GET /seguradora/sinistros/{id}` - Detalhes do sinistro
- `POST /seguradora/sinistros/{id}/analisar` - Iniciar análise
- `POST /seguradora/sinistros/{id}/aprovar` - Aprovar sinistro
- `POST /seguradora/sinistros/{id}/negar` - Negar sinistro
- `GET /seguradora/sinistros/estatisticas` - Estatísticas

### Corretora - Propostas
- `GET /corretora/propostas` - Listar propostas
- `POST /corretora/propostas` - Criar proposta
- `GET /corretora/propostas/{id}` - Detalhes
- `POST /corretora/propostas/{id}/enviar` - Enviar proposta
- `POST /corretora/propostas/{id}/converter-apolice` - Converter em apólice

### Cliente - Apólices
- `GET /cliente/apolices` - Listar apólices
- `GET /cliente/apolices/ativas` - Apólices ativas
- `GET /cliente/apolices/{id}` - Detalhes
- `GET /cliente/apolices/{id}/pagamentos` - Pagamentos
- `GET /cliente/apolices/estatisticas` - Estatísticas

### Cliente - Sinistros
- `GET /cliente/sinistros` - Listar sinistros
- `POST /cliente/sinistros` - Registar sinistro
- `GET /cliente/sinistros/{id}` - Detalhes
- `GET /cliente/sinistros/{id}/acompanhamento` - Status
- `GET /cliente/sinistros/estatisticas` - Estatísticas

### Cliente - Pagamentos
- `GET /cliente/pagamentos` - Listar pagamentos
- `GET /cliente/pagamentos/pendentes` - Pagamentos pendentes
- `GET /cliente/pagamentos/atrasados` - Pagamentos atrasados
- `GET /cliente/pagamentos/{id}` - Detalhes
- `POST /cliente/pagamentos/{id}/registrar` - Registar pagamento
- `GET /cliente/pagamentos/estatisticas` - Estatísticas

## Services

### ApoliceService
- `criarApolice()` - Cria nova apólice
- `aprovarApolice()` - Aprova e ativa apólice
- `cancelarApolice()` - Cancela apólice
- `calcularPremio()` - Calcula prémio
- `gerarParcelas()` - Gera parcelas de pagamento
- `renovarApolice()` - Renova apólice expirada

### SinistroService
- `registrarSinistro()` - Registra novo sinistro
- `iniciarAnalise()` - Inicia análise
- `aprovarSinistro()` - Aprova sinistro
- `negarSinistro()` - Nega sinistro
- `registrarPagamento()` - Registra pagamento
- `adicionarDocumento()` - Adiciona documentos
- `estatisticasSinistros()` - Retorna estatísticas

### ComissaoService
- `calcularComissaoApolice()` - Calcula comissão
- `registrarComissao()` - Registra comissão
- `pagarComissao()` - Marca como paga
- `listarComissoesPendentes()` - Lista pendências
- `totalizarComissoes()` - Totaliza por período

### AuthService
- `registrar()` - Registra novo usuário e entidade
- `login()` - Autentica usuário
- `criarAgente()` - Cria novo agente com vínculo

## Middleware

### CheckPerfil
Valida se usuário possui perfil autorizado:
```
Route::post('criar-admin')->middleware('auth:api', 'perfil:admin,seguradora')
```

### CheckSeguradora, CheckCorretora, CheckCliente
Validações específicas por perfil com injeção de entidade na request:
```
Route::middleware('auth.seguradora')->group(...)
Route::middleware('auth.corretora')->group(...)
Route::middleware('auth.cliente')->group(...)
```

## Form Requests

Validação automática com mensagens em português:
- `RegisterRequest` - Validação de registro
- `StoreSeguroRequest` - Seguro
- `StoreApoliceRequest` - Apólice
- `StoreSinistroRequest` - Sinistro
- `StorePropostaRequest` - Proposta
- `StorePagamentoRequest` - Pagamento
- E mais...

## Recursos Avançados

### Cálculo de Prémios
Sistema flexível com:
- Prémio por percentagem do valor
- Prémio por valor fixo
- Múltiplas coberturas com franquias
- Tabelas de preço com datas de validade

### Gestão de Parcelas
- Geração automática de parcelas
- Rastreamento de atrasos
- Cálculo de juros e multas
- Métodos de pagamento flexíveis

### Processamento de Sinistros
- Fluxo completo: aberto → análise → aprovação/negação → pagamento
- Suporte a documentação
- Parecer técnico
- Dados de terceiros envolvidos
- Boletim de ocorrência

### Comissões
- Cálculo automático por venda
- Suporte a múltiplos níveis (corretora, agente)
- Rastreamento de pagamentos
- Relatórios por período

## Validação de Dados

Todos os endpoints com Form Requests validam:
- Tipos de dados
- Campos obrigatórios
- Unicidade
- Relacionamentos existentes
- Datas válidas
- Valores numéricos

## Tratamento de Erros

Respostas padronizadas:
```json
{
  "message": "Descrição do erro",
  "error": "Detalhes técnicos (opcional)"
}
```

Códigos HTTP:
- 200: Sucesso
- 201: Criado com sucesso
- 400: Validação ou erro de negócio
- 401: Não autenticado
- 403: Não autorizado
- 404: Não encontrado
- 500: Erro do servidor

## Segurança

- Autenticação JWT com TTL configurável
- Validação de acesso por perfil
- Proteção contra ataques CSRF
- Sanitização de inputs
- Prevenção de acesso cruzado (usuários só vêem seus dados)

## Transações de Banco

Operações críticas usam transações DB:
- Criação de apólice com parcelas
- Aprovação de sinistros
- Cálculo de comissões
- Renovação de apólices

## Próximas Melhorias (Opcional)

- API Resources para melhor formatting
- Soft deletes em mais models
- Event listeners para notificações
- File uploads para documentação
- Relatórios em PDF
- Agendamento de renovações
- Notificações por email
