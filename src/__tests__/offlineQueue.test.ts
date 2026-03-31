import * as SecureStore from 'expo-secure-store';

// Reset the store before importing
const store = require('expo-secure-store');

// Import the queue functions
const offlineQueue = require('../utils/offlineQueue');

describe('offlineQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.__clear();
  });

  describe('addToQueue', () => {
    it('adds an item to the queue', async () => {
      const id = await offlineQueue.addToQueue('file:///test/image.jpg');

      expect(id).toBeDefined();
      expect(id).toMatch(/^offline_/);
      expect(SecureStore.setItemAsync).toHaveBeenCalled();
    });

    it('throws when queue is full (50 items)', async () => {
      // Fill queue to max
      for (let i = 0; i < 50; i++) {
        await offlineQueue.addToQueue(`file:///test/image${i}.jpg`);
      }

      await expect(offlineQueue.addToQueue('file:///test/overflow.jpg'))
        .rejects.toThrow('cola de facturas está llena');
    });
  });

  describe('getQueue', () => {
    it('returns empty array when no queue exists', async () => {
      const queue = await offlineQueue.getQueue();
      expect(queue).toEqual([]);
    });

    it('returns items after adding', async () => {
      await offlineQueue.addToQueue('file:///test/img1.jpg');
      await offlineQueue.addToQueue('file:///test/img2.jpg');

      const queue = await offlineQueue.getQueue();
      expect(queue).toHaveLength(2);
      expect(queue[0].imageUri).toBe('file:///test/img1.jpg');
      expect(queue[0].status).toBe('pending');
    });
  });

  describe('removeFromQueue', () => {
    it('removes a specific item', async () => {
      const id1 = await offlineQueue.addToQueue('file:///test/img1.jpg');
      const id2 = await offlineQueue.addToQueue('file:///test/img2.jpg');

      await offlineQueue.removeFromQueue(id1);

      const queue = await offlineQueue.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe(id2);
    });
  });

  describe('updateQueueItem', () => {
    it('updates item status', async () => {
      const id = await offlineQueue.addToQueue('file:///test/img.jpg');

      await offlineQueue.updateQueueItem(id, { status: 'uploading' });

      const queue = await offlineQueue.getQueue();
      expect(queue[0].status).toBe('uploading');
    });

    it('tracks retry attempts', async () => {
      const id = await offlineQueue.addToQueue('file:///test/img.jpg');

      await offlineQueue.updateQueueItem(id, {
        status: 'failed',
        attempts: 3,
        lastError: 'Network error'
      });

      const queue = await offlineQueue.getQueue();
      expect(queue[0].attempts).toBe(3);
      expect(queue[0].lastError).toBe('Network error');
    });
  });

  describe('getPendingCount', () => {
    it('counts only pending and failed items', async () => {
      const id1 = await offlineQueue.addToQueue('file:///test/img1.jpg');
      const id2 = await offlineQueue.addToQueue('file:///test/img2.jpg');
      const id3 = await offlineQueue.addToQueue('file:///test/img3.jpg');

      await offlineQueue.updateQueueItem(id2, { status: 'uploading' });

      const count = await offlineQueue.getPendingCount();
      // id1 is pending, id3 is pending, id2 is uploading (not counted)
      expect(count).toBe(2);
    });
  });

  describe('clearQueue', () => {
    it('removes all items', async () => {
      await offlineQueue.addToQueue('file:///test/img1.jpg');
      await offlineQueue.addToQueue('file:///test/img2.jpg');

      await offlineQueue.clearQueue();

      const queue = await offlineQueue.getQueue();
      expect(queue).toEqual([]);
    });
  });
});
