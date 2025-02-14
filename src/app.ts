import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocs } from './config/swagger';
import authRoutes from './routes/auth.routes';
import { securityMiddleware, errorHandler, notFoundHandler } from './middleware';
import socialAuthRoutes from './routes/social-auth.routes';

dotenv.config();

// Connect to database
connectDB().catch(err => {
  console.error('Failed to connect to database:', err);
});

const app: Application = express();

// Apply middleware
securityMiddleware(app);

// Swagger UI setup
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs)
);

// Auth Routes
app.use('/api/auth', authRoutes);
app.use('/api/social-auth', socialAuthRoutes);

// Error handling
app.use(errorHandler);
app.use(notFoundHandler);

// Start server if running locally
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT ?? 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
