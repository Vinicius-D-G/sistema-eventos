// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gerenciamento de Eventos (Firebase)',
      version: '1.0.0',
      description: 'Documentação dos endpoints simulados para integração com Firebase',
      contact: {
        name: 'Sua Equipe',
        url: 'https://github.com/Vinicius-D-G/sistema-eventos'
      }
    },
    servers: [
      {
        url: 'https://firestore.googleapis.com/v1/projects/desafiobancodetalentos/databases/(default)/documents',
        description: 'Servidor Firebase'
      }
    ],
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
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido no login'
        }
      },
      schemas: {
        Evento: {
          type: 'object',
          required: ['nome', 'data', 'local', 'adminId'],
          properties: {
            id: {
              type: 'string',
              example: 'abc123'
            },
            nome: {
              type: 'string',
              example: 'Conferência de Tecnologia'
            },
            data: {
              type: 'string',
              format: 'date-time',
              example: '2023-12-31T20:00:00Z'
            },
            local: {
              type: 'string',
              example: 'São Paulo'
            },
            imagem: {
              type: 'string',
              example: 'https://exemplo.com/imagem.jpg'
            },
            adminId: {
              type: 'string',
              example: 'user123'
            }
          }
        },
        Administrador: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              example: 'Admin Exemplo'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@exemplo.com'
            },
            criadoEm: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T12:00:00Z'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Mensagem de erro detalhada'
            }
          }
        }
      }
    }
  },
  apis: ['./script.js'], // Ajuste para o caminho correto do seu arquivo principal
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  // Rota da documentação Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  
  // Rota para o arquivo JSON da especificação
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};