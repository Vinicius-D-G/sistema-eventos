// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configuração principal do Swagger
const options = {
  definition: {
    openapi: '3.0.0',  // Versão do OpenAPI
    info: {
      title: 'API de Gerenciamento de Eventos (Firebase)',
      version: '1.0.0',
      description: 'Documentação dos endpoints simulados para integração com Firebase',
      contact: {
        name: 'Sua Equipe',
        url: 'https://github.com/Vinicius-D-G/sistema-eventos'
      }
    },
    // Configuração dos servidores da API
    servers: [
      {
        url: 'https://firestore.googleapis.com/v1/projects/desafiobancodetalentos/databases/(default)/documents',
        description: 'Servidor Firebase'
      }
    ],
    // Tags para agrupamento de endpoints
    tags: [
      {
        name: 'Autenticação',
        description: 'Operações de login e cadastro'
      },
      {
        name: 'Eventos',
        description: 'Gerenciamento completo de eventos'
      }
    ],
    // Componentes reutilizáveis
    components: {
      // Esquema de autenticação
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido no login'
        }
      },
      // Modelos de dados
      schemas: {
        // Modelo de Evento
        Evento: {
          type: 'object',
          required: ['nome', 'data', 'local', 'adminId'],
          properties: {
            id: { type: 'string', example: 'abc123' },
            nome: { type: 'string', example: 'Conferência de Tecnologia' },
            data: { type: 'string', format: 'date-time', example: '2023-12-31T20:00:00Z' },
            local: { type: 'string', example: 'São Paulo' },
            imagem: { type: 'string', example: 'https://exemplo.com/imagem.jpg' },
            adminId: { type: 'string', example: 'user123' }
          }
        },
        // Modelo de Administrador
        Administrador: {
          type: 'object',
          properties: {
            nome: { type: 'string', example: 'Admin Exemplo' },
            email: { type: 'string', format: 'email', example: 'admin@exemplo.com' },
            criadoEm: { type: 'string', format: 'date-time', example: '2023-01-01T12:00:00Z' }
          }
        },
        // Modelo de Erro
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Mensagem de erro detalhada' }
          }
        }
      }
    }
  },
  // Caminho para os arquivos com as rotas documentadas
  apis: ['./script.js'],
};

// Geração da especificação Swagger
const specs = swaggerJsdoc(options);

// Configuração das rotas de documentação
module.exports = (app) => {
  // Rota para a interface Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  
  // Rota para o JSON da documentação
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};
