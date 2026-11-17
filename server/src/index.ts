import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ingestRouter } from './routes/ingest.js';
import { itemsRouter } from './routes/items.js';
import { queryRouter } from './routes/query.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(requestLogger);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: Boolean(config.geminiApiKey),
  });
});

app.use('/api/ingest', ingestRouter);
app.use('/api/items', itemsRouter);
app.use('/api/query', queryRouter);

app.use(errorHandler);

const server = app.listen(config.port, () => {
  console.log(`AI Knowledge Inbox API listening on port ${config.port}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

export default app;
