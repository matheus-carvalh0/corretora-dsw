const { Sequelize } = require('sequelize');
const path = require('path');

// Isso garante que o Node ache o .env na raiz do projeto backend, 
// não importa de qual pasta você disparou o terminal.
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

let sequelize;

// Log temporário para você ver exatamente o que o Node está lendo no terminal
console.log('--------------------------------------------------');
console.log('DIALETO DO BANCO LIDO:', process.env.DB_DIALECT);
console.log('NOME DO BANCO LIDO:', process.env.DB_NAME);
console.log('--------------------------------------------------');

if (process.env.DB_DIALECT === 'mysql') {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    }
  );
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE
      ? path.resolve(__dirname, '../../', process.env.DB_STORAGE)
      : path.resolve(__dirname, '../../database.sqlite'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });
}

module.exports = sequelize;