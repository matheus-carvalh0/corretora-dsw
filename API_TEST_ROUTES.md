# API Test Routes — Corretora DSW

Base URL: `http://localhost:3000/api`

> **Convenção de resposta:**  
> Todas as respostas seguem o padrão `{ "success": true|false, "message": "...", "data": { ... } }`

---

## Ordem Recomendada para Testes

1. Registrar usuário → salvar token  
2. Login (alternativo ao registro)  
3. Consultar perfil (`/user/me`)  
4. Visualizar mercado (`/market`)  
5. Avançar relógio (`/market/advance-minute`)  
6. Gerenciar watchlist (`/stocks`)  
7. Comprar ações (`/portfolio/buy`)  
8. Visualizar carteira (`/portfolio`)  
9. Vender ações (`/portfolio/sell`)  
10. Consultar extrato (`/account`)  
11. Gerenciar ordens (`/orders`)  
12. Troca de senha (`/auth/change-password`)  
13. Logout (`/auth/logout`)  

---

## 1. Autenticação

### Cadastrar usuário

```
POST /api/auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta 201:**
```json
{
  "success": true,
  "message": "Usuário cadastrado com sucesso.",
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": 1,
      "name": "João Silva",
      "email": "joao@email.com",
      "simulationMinute": 0,
      "balance": "10000.00"
    }
  }
}
```

**Erros:**
- `400` — dados inválidos (e-mail, senha curta)
- `409` — e-mail já cadastrado

---

### Login

```
POST /api/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta 200:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso.",
  "data": {
    "token": "eyJhbGci...",
    "user": { "id": 1, "name": "João Silva", ... }
  }
}
```

**Erros:**
- `401` — credenciais inválidas

---

### Logout

```
POST /api/auth/logout
Authorization: Bearer <token>
```

**Resposta 200:**
```json
{
  "success": true,
  "message": "Logout realizado. Descarte o token no cliente.",
  "data": {}
}
```

---

### Recuperar senha (forgot-password)

```
POST /api/auth/forgot-password
Content-Type: application/json
```

**Body:**
```json
{
  "email": "joao@email.com"
}
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "message": "Token de recuperação gerado.",
    "resetToken": "a3f9c1..."
  }
}
```

> Em produção o token seria enviado por e-mail, não retornado diretamente.

---

### Redefinir senha (reset-password)

```
POST /api/auth/reset-password
Content-Type: application/json
```

**Body:**
```json
{
  "resetToken": "a3f9c1...",
  "newPassword": "novaSenha123"
}
```

**Resposta 200:**
```json
{
  "success": true,
  "data": { "message": "Senha redefinida com sucesso." }
}
```

---

### Trocar senha (usuário logado)

```
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "currentPassword": "senha123",
  "newPassword": "novaSenha456"
}
```

**Resposta 200:**
```json
{
  "success": true,
  "data": { "message": "Senha alterada com sucesso." }
}
```

---

## 2. Usuário

### Perfil do usuário autenticado

```
GET /api/user/me
Authorization: Bearer <token>
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "simulationMinute": 3,
    "simulationTime": "14:03",
    "balance": "9500.00"
  }
}
```

---

## 3. Mercado

### Consultar mercado (watchlist com preços)

```
GET /api/market
Authorization: Bearer <token>
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "simulationMinute": 0,
    "simulationTime": "14:00",
    "market": [
      {
        "ticker": "PETR4",
        "current": 31.04,
        "closing": 30.84,
        "nominalChange": 0.20,
        "percentChange": 0.65
      },
      {
        "ticker": "VALE5",
        "current": 32.85,
        "closing": 30.85,
        "nominalChange": 2.00,
        "percentChange": 6.49
      }
    ]
  }
}
```

---

### Listar todos os tickers do mercado

```
GET /api/market/tickers
Authorization: Bearer <token>
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "tickers": [
      { "ticker": "PETR4", "fechamento": 30.84 },
      { "ticker": "VALE5", "fechamento": 30.85 }
    ]
  }
}
```

---

### Avançar relógio +1 minuto

```
POST /api/market/advance-minute
Authorization: Bearer <token>
```

**Resposta 200:**
```json
{
  "success": true,
  "message": "Relógio avançado em +1 minuto.",
  "data": {
    "simulationMinute": 1,
    "simulationTime": "14:01",
    "market": [ ... ]
  }
}
```

---

### Avançar relógio +5 minutos

```
POST /api/market/advance-five-minutes
Authorization: Bearer <token>
```

**Resposta 200:**
```json
{
  "success": true,
  "message": "Relógio avançado em +5 minutos.",
  "data": {
    "simulationMinute": 6,
    "simulationTime": "14:06",
    "market": [ ... ]
  }
}
```

---

## 4. Watchlist (Ações Monitoradas)

### Listar ações da watchlist

```
GET /api/stocks
Authorization: Bearer <token>
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "stocks": [
      { "id": 1, "userId": 1, "ticker": "PETR4" },
      { "id": 2, "userId": 1, "ticker": "VALE5" }
    ]
  }
}
```

---

### Adicionar ação à watchlist

```
POST /api/stocks
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "ticker": "COGN3"
}
```

**Resposta 201:**
```json
{
  "success": true,
  "message": "Ação COGN3 adicionada à lista.",
  "data": {
    "stock": { "id": 11, "userId": 1, "ticker": "COGN3" }
  }
}
```

**Erros:**
- `404` — ticker não existe no mercado
- `409` — ticker já está na watchlist

---

### Remover ação da watchlist

```
DELETE /api/stocks/COGN3
Authorization: Bearer <token>
```

**Resposta 204** (sem corpo)

---

## 5. Carteira (Portfolio)

### Visualizar carteira

```
GET /api/portfolio
Authorization: Bearer <token>
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "ticker": "PETR4",
        "quantity": 100,
        "avgBuyPrice": 30.50,
        "currentPrice": 31.04,
        "pnl": 54.00
      }
    ],
    "totalPnl": 54.00
  }
}
```

---

### Comprar ação (a mercado)

```
POST /api/portfolio/buy
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "ticker": "PETR4",
  "quantity": 50
}
```

**Resposta 201:**
```json
{
  "success": true,
  "data": {
    "message": "Compra realizada a preço de mercado.",
    "executedPrice": 31.04
  }
}
```

---

### Comprar ação (ordem limitada)

```
POST /api/portfolio/buy
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "ticker": "PETR4",
  "quantity": 30,
  "limitPrice": 29.50
}
```

**Resposta 201:**
```json
{
  "success": true,
  "data": {
    "message": "Ordem de compra limitada registrada. Executará quando PETR4 ≤ R$ 29.5."
  }
}
```

**Erros:**
- `400` — saldo insuficiente, quantidade inválida
- `404` — ticker não existe

---

### Vender ação (a mercado)

```
POST /api/portfolio/sell
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "ticker": "PETR4",
  "quantity": 20
}
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "message": "Venda realizada a preço de mercado.",
    "executedPrice": 31.04
  }
}
```

---

### Vender ação (ordem limitada)

```
POST /api/portfolio/sell
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "ticker": "PETR4",
  "quantity": 20,
  "limitPrice": 33.00
}
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "message": "Ordem de venda limitada registrada. Executará quando PETR4 ≥ R$ 33."
  }
}
```

---

## 6. Ordens

### Listar todas as ordens

```
GET /api/orders
Authorization: Bearer <token>
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "ticker": "PETR4",
        "type": "BUY",
        "quantity": 30,
        "limitPrice": "29.50",
        "status": "PENDING",
        "executedPrice": null,
        "executedAt": null,
        "simulationMinute": 2
      }
    ]
  }
}
```

---

### Cancelar ordem pendente

```
DELETE /api/orders/1
Authorization: Bearer <token>
```

**Resposta 204** (sem corpo)

**Erros:**
- `404` — ordem não encontrada ou já finalizada

---

## 7. Conta Corrente

### Visualizar extrato

```
GET /api/account
Authorization: Bearer <token>
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "balance": 8450.00,
    "transactions": [
      {
        "id": 1,
        "type": "DEPOSIT",
        "amount": 10000.00,
        "description": "Depósito inicial",
        "balanceAfter": 10000.00,
        "simulationTime": "14:00",
        "simulationMinute": 0,
        "createdAt": "2026-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "type": "WITHDRAWAL",
        "amount": 1550.00,
        "description": "Compra de 50x PETR4 a R$ 31.00",
        "balanceAfter": 8450.00,
        "simulationTime": "14:03",
        "simulationMinute": 3,
        "createdAt": "2026-01-01T00:03:00.000Z"
      }
    ]
  }
}
```

---

## Exemplos prontos para Postman / Insomnia

### Variáveis de ambiente sugeridas

| Variável    | Valor                        |
|-------------|------------------------------|
| `base_url`  | `http://localhost:3000/api`  |
| `token`     | *(preenchido após o login)*  |

### Fluxo de teste completo (copie e cole)

```
# 1. Registrar
POST {{base_url}}/auth/register
{ "name": "Teste", "email": "teste@dsw.com", "password": "senha123" }

→ Salvar data.token na variável {{token}}

# 2. Ver mercado
GET {{base_url}}/market
Authorization: Bearer {{token}}

# 3. Avançar relógio
POST {{base_url}}/market/advance-minute
Authorization: Bearer {{token}}

# 4. Comprar PETR4
POST {{base_url}}/portfolio/buy
Authorization: Bearer {{token}}
{ "ticker": "PETR4", "quantity": 10 }

# 5. Ver carteira
GET {{base_url}}/portfolio
Authorization: Bearer {{token}}

# 6. Ver extrato
GET {{base_url}}/account
Authorization: Bearer {{token}}

# 7. Vender PETR4
POST {{base_url}}/portfolio/sell
Authorization: Bearer {{token}}
{ "ticker": "PETR4", "quantity": 5 }

# 8. Logout
POST {{base_url}}/auth/logout
Authorization: Bearer {{token}}
```

---

## Códigos de Erro

| Código | Significado                                |
|--------|--------------------------------------------|
| 400    | Dados inválidos / regra de negócio violada |
| 401    | Não autenticado (token ausente ou expirado)|
| 403    | Acesso negado                              |
| 404    | Recurso não encontrado                     |
| 409    | Conflito (ex: e-mail duplicado)            |
| 500    | Erro interno do servidor                   |
