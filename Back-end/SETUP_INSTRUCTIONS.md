# Instruções de Configuração e Deployment

## 🚀 Configuração Inicial

### 1. Variáveis de Ambiente

Crie ou atualize o arquivo `.env`:

```env
APP_NAME=Seguradora
APP_ENV=local
APP_KEY=base64:sua_chave_aqui
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=seguradora
DB_USERNAME=root
DB_PASSWORD=

# JWT
JWT_SECRET=sua_chave_jwt_super_secreta_aqui
JWT_ALGORITHM=HS256
JWT_TTL=3600

# Mail (opcional)
MAIL_MAILER=log
MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=no-reply@seguradora.com

# Cache
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file

# Others
TELESCOPE_ENABLED=false
```

### 2. Gerar Chaves

```bash
# Chave de aplicação
php artisan key:generate

# Chave JWT
php artisan jwt:secret
```

### 3. Instalar Dependências

```bash
composer install
npm install
```

### 4. Executar Migrations

```bash
php artisan migrate
```

Ou com refresh (cuidado em produção!):

```bash
php artisan migrate:refresh --seed
```

### 5. Seeders (Opcional)

Se deseja popular o banco com dados de teste:

```bash
php artisan db:seed
```

### 6. Iniciar Servidor

Desenvolvimento:
```bash
php artisan serve
```

A API estará disponível em: `http://localhost:8000/api`

---

## 🗄️ Estrutura do Banco de Dados

Depois das migrations, o banco terá as seguintes tabelas principais:

```
users
├── id, name, email, password, perfil, perfil_id, status
├── Relacionamentos: polymorphic para seguradora, corretora, cliente

seguradoras
├── id_seguradora, nome, nuit, telefone, email, endereco, status

corretoras
├── id_corretora, nome, nuit, telefone, email, endereco, status, licenca

clientes
├── id_cliente, tipo_cliente, nome, nuit, endereco, telefone, documento, email

agentes
├── id_agente, nome, telefone, email, documento, status

seguros
├── id_seguro, id_categoria (FK), nome, descricao, tipo_seguro

apolices
├── id_apolice, numero_apolice, cliente_id, seguradora_seguro_id
├── bem_segurado_id, bem_segurado_type (polymorphic)
├── status, data_inicio_vigencia, data_fim_vigencia, valor_segurado

sinistros
├── id_sinistro, numero_sinistro, apolice_id, cliente_id
├── data_ocorrencia, tipo_sinistro, status

propostas
├── id_proposta, numero_proposta, cliente_id, seguradora_seguro_id
├── status, validade_proposta

pagamentos
├── id_pagamento, numero_pagamento, apolice_id, cliente_id
├── numero_parcela, valor_parcela, status, data_vencimento
```

---

## 📋 Checklist de Implementação

- [ ] Banco de dados criado
- [ ] Migrations executadas
- [ ] Usuários de teste criados
- [ ] Seguradora de teste criada
- [ ] Corretora de teste criada
- [ ] Seguros de teste criados
- [ ] API testada com Postman/Insomnia
- [ ] Tokens JWT validados
- [ ] Fluxo de venda testado
- [ ] Sinistro testado
- [ ] Pagamentos testados

---

## 🧪 Testes

### Testes Unitários

```bash
php artisan test --testsuite=Unit
```

### Testes de Feature

```bash
php artisan test --testsuite=Feature
```

### Todos os Testes

```bash
php artisan test
```

### Com Cobertura

```bash
php artisan test --coverage
```

---

## 🔍 Debug

### Verificar Rotas Registadas

```bash
php artisan route:list
```

### Verificar Models

```bash
php artisan model:show User
php artisan model:show Apolice
```

### Verify Service Providers

```bash
php artisan provider:list
```

### Limpar Cache

```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

---

## 📦 Deployment para Produção

### 1. Preparar Ambiente

```bash
# Clonar repositório
git clone ...
cd Seguradora/Back-end

# Instalar dependências
composer install --optimize-autoloader --no-dev
npm install --production
```

### 2. Configurar Variáveis

```bash
# Copiar .env
cp .env.example .env

# Editar .env com valores de produção
nano .env
```

Valores importantes para produção:
```env
APP_ENV=production
APP_DEBUG=false
JWT_TTL=1440  # 24 horas
DB_CONNECTION=mysql  # ou postgres
CACHE_DRIVER=redis  # em vez de file
SESSION_DRIVER=cookie
QUEUE_CONNECTION=redis
```

### 3. Gerar Chaves

```bash
php artisan key:generate --force
php artisan jwt:secret --force
```

### 4. Compilar Assets

```bash
npm run build
```

### 5. Executar Migrations

```bash
php artisan migrate --force
```

### 6. Otimizações

```bash
# Otimizar classes
php artisan optimize

# Cachear config
php artisan config:cache

# Cachear rotas
php artisan route:cache

# Cachear views
php artisan view:cache
```

### 7. Configurar Web Server

#### Nginx

```nginx
server {
    listen 80;
    server_name api.seguradora.com;

    root /var/www/seguradora/back-end/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

#### Apache

Ativar mod_rewrite e .htaccess:

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

O arquivo `.htaccess` já vem no Laravel.

### 8. Permissões

```bash
sudo chown -R www-data:www-data /var/www/seguradora
sudo chmod -R 755 /var/www/seguradora
sudo chmod -R 775 /var/www/seguradora/back-end/storage
sudo chmod -R 775 /var/www/seguradora/back-end/bootstrap/cache
```

### 9. SSL/HTTPS

Com Let's Encrypt:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d api.seguradora.com
```

### 10. Monitoramento

Instalar supervisor para gerenciar queue workers:

```bash
sudo apt-get install supervisor

# Criar config em /etc/supervisor/conf.d/laravel-worker.conf
```

---

## 🔐 Segurança

### 1. Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Atualizar Dependências

```bash
composer update
npm update
```

### 3. Auditar Segurança

```bash
composer audit
npm audit
```

### 4. Headers de Segurança

Adicionar ao .env em produção:
```env
SECURE_HEADERS=true
```

### 5. Rate Limiting

Já implementado no Laravel, configurar em `config/rate-limiter.php`.

### 6. CORS

Se a API será acessada de domínios diferentes, configurar CORS em `config/cors.php`:

```php
'allowed_origins' => ['https://app.seguradora.com'],
```

---

## 📊 Monitoramento e Logs

### Logs

```bash
# Ver logs em tempo real
tail -f storage/logs/laravel.log

# Com grep (apenas erros)
tail -f storage/logs/laravel.log | grep ERROR
```

### Métricas

Instalar Telescope (opcional, apenas desenvolvimento):

```bash
php artisan telescope:install
```

---

## 🆘 Troubleshooting

### Erro: "SQLSTATE[HY000] [1045] Access denied"
- Verificar credenciais do banco em `.env`
- Verificar se banco existe: `mysql -u root -p`
- Criar banco: `CREATE DATABASE seguradora;`

### Erro: "Class not found"
```bash
composer dump-autoload
```

### Erro: "view not found"
```bash
php artisan view:clear
```

### Erro: "No route found"
```bash
php artisan route:clear
php artisan route:cache
```

### JWT Token Inválido
- Verificar se `JWT_SECRET` está definido
- Fazer novo login para obter novo token

---

## 📝 Checklist Pré-Produção

- [ ] Todas as migrations executadas
- [ ] Banco de dados em produção configurado
- [ ] `.env` com variáveis corretas
- [ ] APP_KEY gerada
- [ ] JWT_SECRET gerada
- [ ] SSL/HTTPS ativado
- [ ] Database backups configurados
- [ ] Logs configurados corretamente
- [ ] Rate limiting ativado
- [ ] CORS configurado
- [ ] Emails funcionando (se aplicável)
- [ ] Queue workers rodando (se aplicável)
- [ ] Monitoramento ativado
- [ ] Alertas de erro configurados

---

## 🔄 Processo de Update

Para atualizar código em produção:

```bash
# 1. Fazer backup
mysqldump seguradora > backup_$(date +%Y%m%d).sql

# 2. Pull código
git pull origin main

# 3. Instalar dependências
composer install --optimize-autoloader --no-dev

# 4. Executar migrations
php artisan migrate --force

# 5. Limpar cache
php artisan cache:clear
php artisan route:cache

# 6. Restart PHP-FPM (se aplicável)
sudo systemctl restart php8.2-fpm
```

---

## 📞 Contatos Importantes

- **DBA**: Responsável por backups e performance
- **DevOps**: Responsável por infraestrutura
- **Security**: Responsável por auditorias
- **Desenvolvedores**: Responsáveis por código

---

**Última atualização:** 2025-12-15
**Versão:** 1.0.0
