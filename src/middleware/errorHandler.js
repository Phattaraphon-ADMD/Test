const { ZodError } = require('zod');
const { HttpError } = require('../errors');

const BAD_REQUEST_STATUS = 400;
const NOT_FOUND_STATUS = 404;
const INTERNAL_ERROR_STATUS = 500;

function notFoundHandler(_req, res) {
  res.status(NOT_FOUND_STATUS).json({ error: 'Not found' });
}

// Deny by default: only known error types expose a message; everything else is generic.
function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    const details = err.issues.map(({ path, message }) => ({ path: path.join('.'), message }));
    return res.status(BAD_REQUEST_STATUS).json({ error: 'Validation failed', details });
  }
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') {
    return res.status(err.statusCode).json({ error: 'Invalid request body' });
  }

  console.error('Unhandled error:', err.message);
  return res.status(INTERNAL_ERROR_STATUS).json({ error: 'Internal server error' });
}

module.exports = { errorHandler, notFoundHandler };
