import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Connect API',
      version: '1.0.0',
      description: 'API documentation for Connect application',
    },
    servers: [
      {
        url: process.env.SERVER_URL ?? 'http://localhost:5000',
        description: 'Development server',
      },
    ],
  },
  apis: [
    path.join(__dirname, '../**/*.ts'),
    path.join(__dirname, '../**/*.js'),
    path.join(__dirname, '../routes/*'),
  ],
};

export const swaggerDocs = swaggerJsdoc(swaggerOptions);
