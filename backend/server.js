require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { syncDatabase } = require('./src/models');
const routes = require('./src/routes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares globais ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Rota de healthcheck ---
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// --- Rotas da API ---
app.use('/api', routes);

// --- Rota não encontrada ---
app.use((_req, res) => res.status(404).json({ success: false, message: 'Rota não encontrada.' }));

// --- Tratamento global de erros ---
app.use(errorHandler);

// --- Inicialização ---
const start = async () => {
  await syncDatabase();
  app.listen(PORT, () => {
    console.log(` Servidor rodando em http://localhost:${PORT}`);
    console.log(` Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });
};

start().catch((err) => {
  console.error('Erro ao iniciar servidor:', err);
  process.exit(1);
});
