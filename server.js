// Importação dos módulos necessários
const express = require('express');  // Framework para criação do servidor
const swaggerConfig = require('./swagger');  // Configuração do Swagger

// Inicialização do aplicativo Express
const app = express();

// Configuração do Swagger no aplicativo
swaggerConfig(app);

// Inicialização do servidor na porta 3000
app.listen(3000, () => {
  console.log('Swagger UI disponível em http://localhost:3000/api-docs');
});
