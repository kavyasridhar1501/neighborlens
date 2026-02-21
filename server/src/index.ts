import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectToDatabase } from './lib/mongodb';
import neighborhoodRouter from './routes/neighborhood';
import savedRouter from './routes/saved';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT ?? 3001;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://kavyasridhar1501.github.io',
    ],
  })
);

// Body parsing
app.use(express.json());

// Rate limiting: 100 requests per 15 minutes
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Routes
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/neighborhood', neighborhoodRouter);
app.use('/api/saved', savedRouter);

// Error handler must be last
app.use(errorHandler);

/** Bootstraps the database connection and starts the HTTP server */
async function main(): Promise<void> {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
