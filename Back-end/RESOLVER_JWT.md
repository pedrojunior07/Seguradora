# Como Resolver o Erro do JWT

## ⚠️ Erro Atual
```
Class "Tymon\JWTAuth\Providers\JWT\Provider" not found
```

## ✅ Solução Rápida

Execute os seguintes comandos **na ordem**:

### 1. Instalar Dependências (se ainda não fez)
```bash
cd "c:\Users\Pedro Manjate\Documents\GitHub\Seguradora\Back-end"
composer install
```

### 2. Publicar Configuração do JWT
```bash
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
```

### 3. Gerar Chave JWT
```bash
php artisan jwt:secret
```

### 4. Atualizar config/app.php

Adicione o Service Provider do JWT em `config/app.php`:

```php
'providers' => [
    // ... outros providers
    Tymon\JWTAuth\Providers\LaravelServiceProvider::class,
],
```

E os aliases:

```php
'aliases' => [
    // ... outros aliases
    'JWTAuth' => Tymon\JWTAuth\Facades\JWTAuth::class,
    'JWTFactory' => Tymon\JWTAuth\Facades\JWTFactory::class,
],
```

### 5. Atualizar config/auth.php

Adicione o guard JWT:

```php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],

    'api' => [
        'driver' => 'jwt',
        'provider' => 'users',
        'hash' => false,
    ],
],
```

### 6. Limpar Cache
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### 7. Executar Migrations
```bash
php artisan migrate
```

---

## 📋 Checklist Completo

Execute estes comandos na ordem:

```bash
# 1. Entrar no diretório
cd "c:\Users\Pedro Manjate\Documents\GitHub\Seguradora\Back-end"

# 2. Instalar dependências
composer install

# 3. Publicar JWT config
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"

# 4. Gerar JWT secret
php artisan jwt:secret

# 5. Limpar cache
php artisan config:clear

# 6. Executar migrations
php artisan migrate

# 7. Iniciar servidor
php artisan serve
```

---

## 🔧 Se Ainda Não Funcionar

### Opção A: Reinstalar JWT
```bash
composer remove tymon/jwt-auth
composer require tymon/jwt-auth
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
php artisan jwt:secret
```

### Opção B: Verificar Versão do PHP
```bash
php --version
# Deve ser PHP 8.2 ou superior
```

### Opção C: Dump Autoload
```bash
composer dump-autoload
php artisan config:clear
```

---

## 📝 Verificar se JWT Está Configurado

Após seguir os passos, verifique:

1. **Arquivo `config/jwt.php` existe?**
   - Se SIM: JWT configurado ✅
   - Se NÃO: Execute `php artisan vendor:publish` novamente

2. **Variável JWT_SECRET no .env?**
   ```
   JWT_SECRET=sua_chave_super_secreta_aqui
   ```

3. **Guard 'api' configurado em config/auth.php?**
   ```php
   'api' => [
       'driver' => 'jwt',
       'provider' => 'users',
   ],
   ```

---

## ✅ Teste Rápido

Depois de configurar, teste:

```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@example.com",
    "password": "senha123",
    "password_confirmation": "senha123",
    "perfil": "cliente",
    "tipo_cliente": "fisica",
    "nome_completo": "Teste Silva",
    "nuit": "123456789",
    "telefone1": "+258841234567"
  }'
```

Se retornar sucesso, está tudo funcionando! 🎉

---

## 🆘 Problemas Comuns

### Erro: "JWT_SECRET not set"
```bash
php artisan jwt:secret --force
```

### Erro: "Config cache not cleared"
```bash
php artisan config:clear
php artisan cache:clear
```

### Erro: "Class not found"
```bash
composer dump-autoload
```

---

## 📞 Referências

- [JWT Auth Documentation](https://jwt-auth.readthedocs.io/)
- [Laravel 12 Authentication](https://laravel.com/docs/12.x/authentication)

---

**Última atualização:** 15 Dezembro 2025
