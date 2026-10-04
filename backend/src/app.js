import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { notFound } from './middlewares/notFound.middleware.js';
import { requestLogger } from './middlewares/requestLogger.middleware.js';
import { apiLimiter } from './middlewares/rateLimit.middleware.js';
import { setupSwagger } from './docs/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(apiLimiter);

// Webhook Route (Needs raw body)
import { stripeWebhook } from './modules/payments/payment.controller.js';
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Request Parsing & Logging
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(requestLogger);

// Static Uploads Serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger Documentation
setupSwagger(app);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// API Routes
app.use('/api/v1', routes);
app.use('/api', routes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
