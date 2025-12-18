# Collection de Testes - Postman/Insomnia

## Importar Collection JSON

Copie o JSON abaixo e importe no Postman ou Insomnia:

```json
{
  "info": {
    "name": "API Seguros - Testes Completos",
    "description": "Collection completa de testes para a API de Seguros",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://127.0.0.1:8000/api",
      "type": "string"
    },
    {
      "key": "token_cliente",
      "value": "",
      "type": "string"
    },
    {
      "key": "token_seguradora",
      "value": "",
      "type": "string"
    },
    {
      "key": "token_corretora",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "1. Autenticação",
      "item": [
        {
          "name": "Registrar Cliente",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"João Silva\",\n  \"email\": \"joao.silva@example.com\",\n  \"password\": \"senha123\",\n  \"password_confirmation\": \"senha123\",\n  \"perfil\": \"cliente\",\n  \"tipo_cliente\": \"fisica\",\n  \"nome_completo\": \"João Alberto Silva\",\n  \"nuit\": \"123456789\",\n  \"documento\": \"BI123456\",\n  \"endereco\": \"Av. Julius Nyerere, 123, Maputo\",\n  \"telefone1\": \"+258 84 123 4567\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/register",
              "host": ["{{base_url}}"],
              "path": ["register"]
            }
          }
        },
        {
          "name": "Registrar Seguradora",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Seguradora Premium\",\n  \"email\": \"contato@seguradorapremium.com\",\n  \"password\": \"senha123\",\n  \"password_confirmation\": \"senha123\",\n  \"perfil\": \"seguradora\",\n  \"nome_empresa\": \"Seguradora Premium Moçambique Lda\",\n  \"nuit\": \"987654321\",\n  \"telefone\": \"+258 21 123 456\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/register",
              "host": ["{{base_url}}"],
              "path": ["register"]
            }
          }
        },
        {
          "name": "Registrar Corretora",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Corretora Confiança\",\n  \"email\": \"contato@corretoraconfianca.com\",\n  \"password\": \"senha123\",\n  \"password_confirmation\": \"senha123\",\n  \"perfil\": \"corretora\",\n  \"nome_empresa\": \"Corretora Confiança Lda\",\n  \"nuit\": \"555666777\",\n  \"licenca\": \"LIC-2024-001\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/register",
              "host": ["{{base_url}}"],
              "path": ["register"]
            }
          }
        },
        {
          "name": "Login Cliente",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const response = pm.response.json();",
                  "pm.collectionVariables.set('token_cliente', response.access_token);"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"joao.silva@example.com\",\n  \"password\": \"senha123\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/login",
              "host": ["{{base_url}}"],
              "path": ["login"]
            }
          }
        },
        {
          "name": "Login Seguradora",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const response = pm.response.json();",
                  "pm.collectionVariables.set('token_seguradora', response.access_token);"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"contato@seguradorapremium.com\",\n  \"password\": \"senha123\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/login",
              "host": ["{{base_url}}"],
              "path": ["login"]
            }
          }
        },
        {
          "name": "Obter Dados do Usuário",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_cliente}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/me",
              "host": ["{{base_url}}"],
              "path": ["me"]
            }
          }
        },
        {
          "name": "Logout",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_cliente}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/logout",
              "host": ["{{base_url}}"],
              "path": ["logout"]
            }
          }
        },
        {
          "name": "Refresh Token",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_cliente}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/refresh",
              "host": ["{{base_url}}"],
              "path": ["refresh"]
            }
          }
        }
      ]
    },
    {
      "name": "2. Categorias",
      "item": [
        {
          "name": "Listar Categorias",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_seguradora}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/categorias",
              "host": ["{{base_url}}"],
              "path": ["categorias"]
            }
          }
        },
        {
          "name": "Criar Categoria",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_seguradora}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"descricao\": \"Seguro de Vida\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/categorias",
              "host": ["{{base_url}}"],
              "path": ["categorias"]
            }
          }
        }
      ]
    },
    {
      "name": "3. Seguradora - Seguros",
      "item": [
        {
          "name": "Listar Seguros",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_seguradora}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/seguradora/seguros?status=ativo&per_page=20",
              "host": ["{{base_url}}"],
              "path": ["seguradora", "seguros"],
              "query": [
                {
                  "key": "status",
                  "value": "ativo"
                },
                {
                  "key": "per_page",
                  "value": "20"
                }
              ]
            }
          }
        },
        {
          "name": "Criar Seguro",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_seguradora}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"nome\": \"Seguro Auto Premium\",\n  \"descricao\": \"Cobertura completa para veículos de passeio\",\n  \"tipo_seguro\": \"automovel\",\n  \"id_categoria\": 1\n}"
            },
            "url": {
              "raw": "{{base_url}}/seguradora/seguros",
              "host": ["{{base_url}}"],
              "path": ["seguradora", "seguros"]
            }
          }
        },
        {
          "name": "Obter Detalhes do Seguro",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_seguradora}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/seguradora/seguros/1",
              "host": ["{{base_url}}"],
              "path": ["seguradora", "seguros", "1"]
            }
          }
        },
        {
          "name": "Adicionar Preço",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_seguradora}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"valor_base\": 1500.00,\n  \"periodicidade\": \"mensal\",\n  \"descricao\": \"Plano básico mensal\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/seguradora/seguros/1/precos",
              "host": ["{{base_url}}"],
              "path": ["seguradora", "seguros", "1", "precos"]
            }
          }
        },
        {
          "name": "Adicionar Cobertura",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_seguradora}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"descricao\": \"Responsabilidade Civil\",\n  \"tipo_cobertura\": \"obrigatoria\",\n  \"valor_cobertura\": 50000.00,\n  \"percentual\": 100\n}"
            },
            "url": {
              "raw": "{{base_url}}/seguradora/seguros/1/coberturas",
              "host": ["{{base_url}}"],
              "path": ["seguradora", "seguros", "1", "coberturas"]
            }
          }
        }
      ]
    },
    {
      "name": "4. Seguradora - Apólices",
      "item": [
        {
          "name": "Listar Apólices Pendentes",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_seguradora}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/seguradora/apolices/pendentes",
              "host": ["{{base_url}}"],
              "path": ["seguradora", "apolices", "pendentes"]
            }
          }
        },
        {
          "name": "Listar Apólices Ativas",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_seguradora}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/seguradora/apolices/ativas",
              "host": ["{{base_url}}"],
              "path": ["seguradora", "apolices", "ativas"]
            }
          }
        },
        {
          "name": "Obter Detalhes da Apólice",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_seguradora}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/seguradora/apolices/1",
              "host": ["{{base_url}}"],
              "path": ["seguradora", "apolices", "1"]
            }
          }
        },
        {
          "name": "Aprovar Apólice",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_seguradora}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"observacoes\": \"Apólice aprovada após análise de risco\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/seguradora/apolices/1/aprovar",
              "host": ["{{base_url}}"],
              "path": ["seguradora", "apolices", "1", "aprovar"]
            }
          }
        },
        {
          "name": "Rejeitar Apólice",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_seguradora}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"motivo\": \"Risco elevado: Cliente possui histórico de múltiplos sinistros\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/seguradora/apolices/1/rejeitar",
              "host": ["{{base_url}}"],
              "path": ["seguradora", "apolices", "1", "rejeitar"]
            }
          }
        },
        {
          "name": "Estatísticas de Apólices",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_seguradora}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/seguradora/apolices/estatisticas",
              "host": ["{{base_url}}"],
              "path": ["seguradora", "apolices", "estatisticas"]
            }
          }
        }
      ]
    },
    {
      "name": "5. Cliente - Pagamentos",
      "item": [
        {
          "name": "Listar Todos os Pagamentos",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_cliente}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/cliente/pagamentos",
              "host": ["{{base_url}}"],
              "path": ["cliente", "pagamentos"]
            }
          }
        },
        {
          "name": "Listar Pagamentos Pendentes",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_cliente}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/cliente/pagamentos/pendentes",
              "host": ["{{base_url}}"],
              "path": ["cliente", "pagamentos", "pendentes"]
            }
          }
        },
        {
          "name": "Listar Pagamentos Atrasados",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_cliente}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/cliente/pagamentos/atrasados",
              "host": ["{{base_url}}"],
              "path": ["cliente", "pagamentos", "atrasados"]
            }
          }
        },
        {
          "name": "Registrar Pagamento",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_cliente}}"
              }
            ],
            "body": {
              "mode": "formdata",
              "formdata": [
                {
                  "key": "metodo_pagamento_id",
                  "value": "1",
                  "type": "text"
                },
                {
                  "key": "referencia_pagamento",
                  "value": "REF-M-PESA-123456",
                  "type": "text"
                },
                {
                  "key": "comprovante",
                  "type": "file",
                  "src": ""
                }
              ]
            },
            "url": {
              "raw": "{{base_url}}/cliente/pagamentos/1/registrar",
              "host": ["{{base_url}}"],
              "path": ["cliente", "pagamentos", "1", "registrar"]
            }
          }
        },
        {
          "name": "Estatísticas de Pagamentos",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_cliente}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/cliente/pagamentos/estatisticas",
              "host": ["{{base_url}}"],
              "path": ["cliente", "pagamentos", "estatisticas"]
            }
          }
        }
      ]
    },
    {
      "name": "6. Cliente - Sinistros",
      "item": [
        {
          "name": "Listar Sinistros",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_cliente}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/cliente/sinistros",
              "host": ["{{base_url}}"],
              "path": ["cliente", "sinistros"]
            }
          }
        },
        {
          "name": "Registrar Sinistro",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_cliente}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"apolice_id\": 1,\n  \"data_ocorrencia\": \"2024-01-15\",\n  \"hora_ocorrencia\": \"14:30:00\",\n  \"local_ocorrencia\": \"Av. Julius Nyerere, Maputo\",\n  \"descricao_ocorrido\": \"Colisão traseira em semáforo\",\n  \"valor_estimado_dano\": 15000.00,\n  \"houve_vitimas\": false,\n  \"boletim_ocorrencia\": \"BO-2024-12345\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/cliente/sinistros",
              "host": ["{{base_url}}"],
              "path": ["cliente", "sinistros"]
            }
          }
        },
        {
          "name": "Obter Detalhes do Sinistro",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_cliente}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/cliente/sinistros/1",
              "host": ["{{base_url}}"],
              "path": ["cliente", "sinistros", "1"]
            }
          }
        },
        {
          "name": "Acompanhar Sinistro",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_cliente}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/cliente/sinistros/1/acompanhamento",
              "host": ["{{base_url}}"],
              "path": ["cliente", "sinistros", "1", "acompanhamento"]
            }
          }
        },
        {
          "name": "Estatísticas de Sinistros",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_cliente}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/cliente/sinistros/estatisticas",
              "host": ["{{base_url}}"],
              "path": ["cliente", "sinistros", "estatisticas"]
            }
          }
        }
      ]
    },
    {
      "name": "7. Corretora - Propostas",
      "item": [
        {
          "name": "Listar Propostas",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_corretora}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/corretora/propostas",
              "host": ["{{base_url}}"],
              "path": ["corretora", "propostas"]
            }
          }
        },
        {
          "name": "Criar Proposta",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_corretora}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"cliente_id\": 1,\n  \"seguradora_seguro_id\": 1,\n  \"tipo_proposta\": \"individual\",\n  \"valor_bem\": 350000.00,\n  \"coberturas_selecionadas\": [1, 2, 3],\n  \"bem_id\": 1,\n  \"bem_type\": \"App\\\\Models\\\\Veiculo\",\n  \"parcelas_sugeridas\": 12\n}"
            },
            "url": {
              "raw": "{{base_url}}/corretora/propostas",
              "host": ["{{base_url}}"],
              "path": ["corretora", "propostas"]
            }
          }
        },
        {
          "name": "Obter Detalhes da Proposta",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_corretora}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/corretora/propostas/1",
              "host": ["{{base_url}}"],
              "path": ["corretora", "propostas", "1"]
            }
          }
        },
        {
          "name": "Enviar Proposta",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_corretora}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/corretora/propostas/1/enviar",
              "host": ["{{base_url}}"],
              "path": ["corretora", "propostas", "1", "enviar"]
            }
          }
        },
        {
          "name": "Converter em Apólice",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token_corretora}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/corretora/propostas/1/converter-apolice",
              "host": ["{{base_url}}"],
              "path": ["corretora", "propostas", "1", "converter-apolice"]
            }
          }
        }
      ]
    }
  ]
}
```

## Como Usar

### No Postman:
1. Abra o Postman
2. Clique em "Import" no canto superior esquerdo
3. Cole o JSON acima
4. Clique em "Import"

### No Insomnia:
1. Abra o Insomnia
2. Clique em "Application" > "Preferences" > "Data"
3. Clique em "Import Data" > "From Clipboard"
4. Cole o JSON acima

## Variáveis de Ambiente

A collection usa as seguintes variáveis:

- `base_url`: URL base da API (http://127.0.0.1:8000/api)
- `token_cliente`: Token JWT do cliente (preenchido automaticamente após login)
- `token_seguradora`: Token JWT da seguradora (preenchido automaticamente após login)
- `token_corretora`: Token JWT da corretora (preenchido automaticamente após login)

## Ordem de Execução Recomendada

1. **Registrar usuários:**
   - Registrar Cliente
   - Registrar Seguradora
   - Registrar Corretora

2. **Fazer login:**
   - Login Cliente
   - Login Seguradora
   - Login Corretora

3. **Testar funcionalidades específicas:**
   - Use o token apropriado para cada perfil
   - Siga os fluxos descritos na documentação principal

## Scripts de Teste

Os requests de login incluem scripts que automaticamente salvam os tokens nas variáveis de ambiente. Isso facilita o uso subsequente dos endpoints autenticados.
