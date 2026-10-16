const { createItemService } = require('../src/services/itemService');
const { HttpError } = require('../src/errors');

describe('itemService', () => {
  let service;

  beforeEach(() => {
    service = createItemService();
  });

  it('creates an item with id and timestamps', () => {
    const item = service.create({ name: 'Pen', description: '' });

    expect(item).toMatchObject({ name: 'Pen', description: '' });
    expect(item.id).toEqual(expect.any(String));
    expect(item.createdAt).toBe(item.updatedAt);
  });

  it('lists created items and returns empty list initially', () => {
    expect(service.list()).toEqual([]);
    service.create({ name: 'A', description: '' });
    expect(service.list()).toHaveLength(1);
  });

  it('updates only the provided fields', () => {
    const { id } = service.create({ name: 'Old', description: 'keep' });

    const updated = service.update(id, { name: 'New' });

    expect(updated).toMatchObject({ id, name: 'New', description: 'keep' });
  });

  it('removes an item', () => {
    const { id } = service.create({ name: 'Temp', description: '' });

    service.remove(id);

    expect(service.list()).toEqual([]);
  });

  it.each([
    ['get', (svc) => svc.get('missing')],
    ['update', (svc) => svc.update('missing', { name: 'x' })],
    ['remove', (svc) => svc.remove('missing')],
  ])('%s throws 404 HttpError for unknown id', (_name, action) => {
    expect(() => action(service)).toThrow(HttpError);
    expect(() => action(service)).toThrow('Item not found');
  });
});
