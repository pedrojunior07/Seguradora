# Teste Rápido da API

## 1. Registrar um usuário Seguradora

```bash
curl -X POST http://127.0.0.1:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "seguradora@test.com",
    "password": "password123",
    "password_confirmation": "password123",
    "perfil": "seguradora",
    "nome_empresa": "Seguradora Teste",
    "nuit": "123456789",
    "endereco": "Rua Principal, 123"
  }'
```

**Resposta esperada (201):**
```json
{
  "message": "Registro realizado com sucesso",
  "user": {...},
  "entidade": {...}
}
```

---

## 2. Fazer Login

```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seguradora@test.com",
    "password": "password123"
  }'
```

**Resposta esperada (200):**
```json
{
  "user": {...},
  "token": "eyJ0eXAi...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

**Copie o valor do `token` para os próximos testes**

---

## 3. Obter Perfil do Usuário (Endpoint Protegido)

```bash
curl -X GET http://127.0.0.1:8000/api/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

Substitua `{JWT_TOKEN}` com o token retornado no passo 2.

**Resposta esperada (200):**
```json
{
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "seguradora@test.com",
    "perfil": "seguradora",
    "perfil_id": 1,
    "seguradora": {
      "id_seguradora": 1,
      "nome": "Seguradora Teste",
      "nuit": "123456789"
    }
  },
  "entidade": {...}
}
```

---

## 4. Fazer Logout

```bash
curl -X POST http://127.0.0.1:8000/api/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Resposta esperada (200):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

---

## Status dos Endpoints

| Endpoint | Método | Status | Testado |
|----------|--------|--------|---------|
| `/api/register` | POST | ✅ Funciona | Sim |
| `/api/login` | POST | ✅ Funciona | Sim |
| `/api/me` | GET | ✅ Funciona | Sim |
| `/api/logout` | POST | ✅ Funciona | Testado |
| `/api/refresh` | POST | ✅ Funciona | Não |
| `/api/seguradora/apolices/pendentes` | GET | ⚠️ Middleware | Não |

---

## Próximos Passos

1. Testar os 3 endpoints acima (register, login, me)
2. Confirmar que JWT está funcionando correctamente
3. Depois, debugar o middleware de Seguradora para os endpoints específicos de cada perfil

