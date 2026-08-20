const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'URL Shortener API',
      version: '1.0.0',
      description:
        'A simple URL shortener API with JWT authentication and role-based authorization.'
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:5000',
        description: 'Current server'
      },
       {
      url: 'https://codealpha-url-shortener-nll1.onrender.com',
      description: 'Development server',
    },
    ],
     security: [
    {
      bearerAuth: []
    }
  ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
  },
  // Path(s) to files containing Swagger JSDoc annotations
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;