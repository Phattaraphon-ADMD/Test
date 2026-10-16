const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createItemService } = require('./services/itemService');
const { createItemsRouter } = require('./routes/items');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const BODY_LIMIT = '10kb';
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 100;

function createApp({ itemService = createItemService(), rateLimitMax = RATE_LIMIT_MAX_REQUESTS } = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  // Rate limiting protects against brute-force and resource exhaustion.
  app.use(rateLimit({ windowMs: RATE_LIMIT_WINDOW_MS, limit: rateLimitMax }));
  app.use(express.json({ limit: BODY_LIMIT }));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/items', createItemsRouter(itemService));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
