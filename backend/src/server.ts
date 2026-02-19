import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import connectDB from './config/database';
import { errorHandler, notFound } from './middleware/error';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app: Application = express();

// Security middleware
app.use(helmet());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  })
);

// Compression middleware
app.use(compression());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routers
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import uploadRoutes from './routes/uploadRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);

// Error handler (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Server is running in ${process.env.NODE_ENV} mode on port ${PORT}
📦 Database: ${process.env.MONGODB_URI}
🌍 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

export default app;
