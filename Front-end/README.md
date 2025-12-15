# Sistema de Seguros - Front-end

Front-end desenvolvido em React + Vite para o Sistema de Gestão de Seguros. Interface moderna e responsiva com Material-UI, suportando três perfis de usuário: Seguradora, Corretora e Cliente.

## 🚀 Tecnologias Utilizadas

- **React 18.2** - Biblioteca JavaScript para construção de interfaces
- **Vite** - Build tool moderna e rápida
- **Material-UI (MUI) 5** - Biblioteca de componentes React
- **React Router DOM 6** - Roteamento da aplicação
- **Axios** - Cliente HTTP para consumo da API
- **Chart.js** - Biblioteca para gráficos (preparado para uso futuro)

## ✨ Funcionalidades

### Autenticação
- Login com email e senha
- Registro com perfis específicos:
  - **Seguradora**: Empresa seguradora com NUIT, endereço
  - **Corretora**: Corretora de seguros com licença
  - **Cliente**: Pessoa física ou jurídica

### Perfil Seguradora
- Dashboard com estatísticas:
  - Apólices pendentes de aprovação
  - Apólices ativas
  - Sinistros pendentes
  - Receita total
- Gestão de apólices (aprovar/rejeitar)
- Gestão de sinistros

### Perfil Corretora
- Dashboard com estatísticas:
  - Total de propostas
  - Propostas pendentes/aprovadas
  - Apólices convertidas
- Criação de propostas
- Envio de propostas para seguradora
- Conversão de propostas em apólices

### Perfil Cliente
- Dashboard com estatísticas:
  - Apólices ativas
  - Sinistros registrados
  - Pagamentos pendentes/atrasados
- Visualização de apólices
- Registro de sinistros
- Acompanhamento de sinistros
- Gestão de pagamentos

## 📋 Pré-requisitos

- Node.js 16+ instalado
- Back-end da aplicação rodando em `http://127.0.0.1:8000`

## 🛠️ Instalação

1. Clone o repositório (se ainda não o fez):
```bash
git clone <url-do-repositorio>
cd Seguradora/Front-end
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` se necessário para apontar para seu back-end:
```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_APP_NAME=Sistema de Seguros
```

## 🚀 Executando a Aplicação

### Modo Desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em: `http://localhost:5173`

### Build para Produção
```bash
npm run build
```

Os arquivos de produção serão gerados na pasta `dist/`.

### Preview do Build de Produção
```bash
npm run preview
```

## 📁 Estrutura do Projeto

```
Front-end/
├── public/              # Arquivos estáticos
├── src/
│   ├── assets/          # Imagens e recursos
│   ├── components/      # Componentes reutilizáveis
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StatCard.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/         # React Context
│   │   └── AuthContext.jsx
│   ├── layouts/         # Páginas/Layouts
│   │   ├── authentication/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── seguradora/
│   │   │   └── Dashboard.jsx
│   │   ├── corretora/
│   │   │   └── Dashboard.jsx
│   │   └── cliente/
│   │       └── Dashboard.jsx
│   ├── services/        # Serviços de API
│   │   ├── api.js
│   │   ├── auth.service.js
│   │   ├── seguradora.service.js
│   │   ├── corretora.service.js
│   │   └── cliente.service.js
│   ├── App.jsx          # Componente principal
│   ├── main.jsx         # Ponto de entrada
│   └── index.css        # Estilos globais
├── .env                 # Variáveis de ambiente
├── .env.example         # Exemplo de variáveis
├── vite.config.js       # Configuração do Vite
├── package.json         # Dependências
└── README.md            # Este arquivo
```

## 🔑 Fluxo de Autenticação

1. O usuário acessa `/login` ou `/register`
2. Após login/registro bem-sucedido, o JWT token é armazenado no `localStorage`
3. O token é automaticamente incluído em todas as requisições subsequentes
4. O usuário é redirecionado para o dashboard correspondente ao seu perfil
5. Rotas protegidas verificam a autenticação e o perfil do usuário

## 🎨 Design

A aplicação utiliza um design moderno com:
- Gradientes vibrantes
- Cards com sombras e efeitos hover
- Layout responsivo para mobile, tablet e desktop
- Sidebar navegável
- Tema customizado do Material-UI

## 🔗 Integração com a API

Todos os serviços estão localizados em `src/services/`:
- **api.js**: Configuração central do Axios com interceptors
- **auth.service.js**: Autenticação (login, registro, logout)
- **seguradora.service.js**: Endpoints da seguradora
- **corretora.service.js**: Endpoints da corretora
- **cliente.service.js**: Endpoints do cliente

## 🐛 Resolução de Problemas

### A aplicação não conecta com o back-end
- Verifique se o back-end está rodando em `http://127.0.0.1:8000`
- Verifique a configuração do `VITE_API_BASE_URL` no arquivo `.env`
- Verifique o console do navegador para erros de CORS

### Erro 401 Unauthorized
- O token JWT pode ter expirado
- Faça logout e login novamente

### Páginas não carregam após login
- Verifique o console do navegador para erros
- Verifique se o perfil do usuário está correto
- Limpe o `localStorage` e faça login novamente

## 📝 Licença

Este projeto foi desenvolvido como parte do Sistema de Gestão de Seguros.

## 👥 Suporte

Para questões e suporte, entre em contato com a equipe de desenvolvimento.
