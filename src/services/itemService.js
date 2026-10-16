const { randomUUID } = require('node:crypto');
const { HttpError } = require('../errors');

const NOT_FOUND_STATUS = 404;

function createItemService() {
  const items = new Map();

  function getById(id) {
    const item = items.get(id);
    if (!item) {
      throw new HttpError(NOT_FOUND_STATUS, 'Item not found');
    }
    return item;
  }

  return {
    list: () => [...items.values()],

    get: (id) => getById(id),

    create({ name, description }) {
      const now = new Date().toISOString();
      const item = { id: randomUUID(), name, description, createdAt: now, updatedAt: now };
      items.set(item.id, item);
      return item;
    },

    update(id, changes) {
      const updated = { ...getById(id), ...changes, updatedAt: new Date().toISOString() };
      items.set(id, updated);
      return updated;
    },

    remove(id) {
      getById(id);
      items.delete(id);
    },
  };
}

module.exports = { createItemService };
