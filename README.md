# 📈 Corretora DSW — Simulador de Corretora de Ações

**Disciplina:** Desenvolvimento de Software para a Web (2026-01)  
**Repositório:** https://github.com/matheus-carvalh0/corretora-dsw

---

## Visão Geral

Sistema full-stack que simula uma corretora eletrônica de ações. O usuário pode autenticar-se, visualizar o mercado de ações com atualização de preços controlada por um relógio de simulação, gerenciar uma watchlist personalizada, comprar e vender ações (a mercado ou por ordem limitada) e acompanhar o extrato de sua conta corrente.

---

## Stack

| Camada     | Tecnologia                              |
|------------|-----------------------------------------|
| Back-End   | Node.js · Express.js · Sequelize · SQLite |
| Autenticação | JWT · bcryptjs                        |
| Front-End  | Vue 3 · Vue Router · Pinia · Axios · Vite |

---

## Estrutura de Pastas

```
corretora-dsw/
├── backend/
│   ├── scripts/
│   │   └── seed.js              # Popula banco com usuário demo
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js      # Conexão Sequelize + SQLite
│   │   │   └── jwt.js           # Geração e verificação de tokens
│   │   ├── controllers/         # Recebe req/res, chama services
│   │   │   ├── authController.js
│   │   │   ├── marketController.js
│   │   │   ├── stockController.js
│   │   │   ├── portfolioController.js
│   │   │   ├── orderController.js
│   │   │   ├── accountController.js
│   │   │   └── userController.js
│   │   ├── middlewares/
│   │   │   ├── auth.js          # Verificação JWT
│   │   │   └── errorHandler.js  # Tratamento global de erros
│   │   ├── models/              # Entidades Sequelize
│   │   │   ├── index.js         # Associações + syncDatabase
│   │   │   ├── User.js
│   │   │   ├── UserStock.js     # Watchlist (ações monitoradas)
│   │   │   ├── PortfolioItem.js # Carteira (ações possuídas)
│   │   │   ├── Order.js         # Ordens de compra/venda
│   │   │   └── Transaction.js   # Extrato da conta corrente
│   │   ├── repositories/        # Acesso ao banco de dados
│   │   │   ├── userRepository.js
│   │   │   ├── userStockRepository.js
│   │   │   ├── portfolioRepository.js
│   │   │   ├── orderRepository.js
│   │   │   └── transactionRepository.js
│   │   ├── routes/              # Definição de endpoints
│   │   │   ├── index.js
│   │   │   ├── authRoutes.js
│   │   │   ├── marketRoutes.js
│   │   │   ├── stockRoutes.js
│   │   │   ├── portfolioRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── accountRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── services/            # Regras de negócio
│   │   │   ├── authService.js
│   │   │   ├── marketService.js
│   │   │   ├── stockService.js
│   │   │   ├── portfolioService.js
│   │   │   └── accountService.js
│   │   └── utils/
│   │       ├── response.js      # Helpers de resposta HTTP
│   │       └── validators.js    # express-validator + formatação de horário
│   ├── server.js                # Entry point da aplicação
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── router/index.js      # Vue Router com guards de autenticação
│   │   ├── stores/auth.js       # Pinia store de autenticação
│   │   ├── services/api.js      # Axios com interceptors JWT
│   │   └── views/               # Telas da aplicação
│   │       ├── LoginView.vue
│   │       ├── RegisterView.vue
│   │       ├── MarketView.vue
│   │       ├── PortfolioView.vue
│   │       └── AccountView.vue
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── README.md
└── API_TEST_ROUTES.md
```

---

## Requisitos Funcionais Implementados

| # | Requisito                  | Pontos |
|---|----------------------------|--------|
| 1 | Autenticação (JWT + bcrypt) | 1 pt   |
| 2 | Mercado de ações + relógio | 3 pts  |
| 3 | Compra de ações            | 2 pts  |
| 4 | Visualização de carteira   | 1 pt   |
| 5 | Venda de ações             | 1 pt   |
| 6 | Conta corrente             | 2 pts  |

---

## Pré-requisitos

- **Node.js** v18 ou superior
- **npm** v8 ou superior

---

## Configuração e Execução

### 1. Back-End

```bash
cd backend

# Instalar dependências
npm install

# Criar arquivo de variáveis de ambiente
cp .env.example .env

# (Opcional) Popula o banco com um usuário demo
npm run seed

# Iniciar em modo desenvolvimento (nodemon)
npm run dev

# OU iniciar em modo produção
npm start
```

O servidor estará disponível em `http://localhost:3000`.

**Variáveis de ambiente importantes (`.env`):**

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=troque_por_string_segura_aqui
JWT_EXPIRES_IN=7d
DB_STORAGE=./database.sqlite
INITIAL_BALANCE=10000.00
```

### 2. Front-End

```bash
cd frontend

npm install
npm run dev
```

O front estará disponível em `http://localhost:5173`.

> O Vite está configurado para fazer proxy de `/api` para `http://localhost:3000`, então o back-end precisa estar rodando.

---

## Usuário Demo (seed)

Após executar `npm run seed` no back-end:

| Campo | Valor            |
|-------|------------------|
| Email | demo@corretora.com |
| Senha | senha123         |
| Saldo | R$ 10.000,00     |

Para resetar completamente o banco:

```bash
npm run db:reset
```

---

## Simulação do Relógio

- Ao logar, o usuário vê o relógio em **14:00**.
- **+1 min** avança para 14:01, **+5 min** para 14:05, e assim por diante.
- Os preços são buscados em tempo real do endpoint:  
  `https://raw.githubusercontent.com/marciobarros/dsw-simulador-corretora/refs/heads/main/[minuto].json`
- O minuto vai de **0 a 59** (14:00 → 14:59).
- O horário é persistido por usuário — ao sair e voltar, o relógio retoma do ponto onde estava.

---

## Ordens Limitadas

- **Compra limitada:** executa automaticamente quando o preço cai até o valor informado.
- **Venda limitada:** executa automaticamente quando o preço sobe até o valor informado.
- O processamento ocorre toda vez que o relógio é avançado.
- Ordens pendentes podem ser canceladas via `DELETE /api/orders/:id`.

---

## Padrões e Arquitetura

- **MVC**: Controllers tratam HTTP, Services contêm a regra de negócio, Repositories isolam o banco.
- **Baixo acoplamento**: serviços se comunicam via importações, sem acoplamento ao framework.
- **Tratamento de erros**: middleware global captura todas as exceções.
- **Variáveis de ambiente**: nenhum segredo hardcoded no código.
- **Respostas padronizadas**: toda resposta segue `{ success, message, data }`.

---

## Preparação para o GitHub

```bash
# Na raiz do projeto
git init
git add .
git commit -m "feat: implementação inicial do back-end e estrutura do front-end"
git branch -M main
git remote add origin https://github.com/matheus-carvalh0/corretora-dsw.git
git push -u origin main
```
