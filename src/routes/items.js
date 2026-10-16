const express = require('express');
const {
  createItemSchema,
  updateItemSchema,
  idParamSchema,
} = require('../validation/itemSchema');

const CREATED_STATUS = 201;
const NO_CONTENT_STATUS = 204;

function createItemsRouter(itemService) {
  const router = express.Router();

  router.get('/', (_req, res) => {
    res.json(itemService.list());
  });

  router.get('/:id', (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    res.json(itemService.get(id));
  });

  router.post('/', (req, res) => {
    const body = createItemSchema.parse(req.body);
    res.status(CREATED_STATUS).json(itemService.create(body));
  });

  router.patch('/:id', (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const changes = updateItemSchema.parse(req.body);
    res.json(itemService.update(id, changes));
  });

  router.delete('/:id', (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    itemService.remove(id);
    res.status(NO_CONTENT_STATUS).end();
  });

  return router;
}

module.exports = { createItemsRouter };
