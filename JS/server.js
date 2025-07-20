const express = require('express');
const swaggerConfig = require('./swagger');

const app = express();
swaggerConfig(app);

app.listen(3000, () => {
  console.log('Swagger UI disponível em http://localhost:3000/api-docs');
});