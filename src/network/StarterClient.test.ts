import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StarterClient } from './StarterClient';
import type { NetworkClient } from '@sudobility/types';

function createMockNetworkClient(
  responseData: unknown = { success: true, data: null }
): NetworkClient {
  const mockResponse = { data: responseData };
  return {
    get: vi.fn().mockResolvedValue(mockResponse),
    post: vi.fn().mockResolvedValue(mockResponse),
    put: vi.fn().mockResolvedValue(mockResponse),
    delete: vi.fn().mockResolvedValue(mockResponse),
  };
}

describe('StarterClient', () => {
  const baseUrl = 'https://api.example.com';
  let mockNetworkClient: NetworkClient;
  let client: StarterClient;

  beforeEach(() => {
    mockNetworkClient = createMockNetworkClient();
    client = new StarterClient({ baseUrl, networkClient: mockNetworkClient });
  });

  describe('constructor', () => {
    it('should create a client instance', () => {
      expect(client).toBeInstanceOf(StarterClient);
    });
  });

  describe('getUser', () => {
    it('should call GET with correct URL', async () => {
      await client.getUser('user-123', 'token-abc');
      expect(mockNetworkClient.get).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/users/user-123',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token-abc',
          }),
        })
      );
    });

    it('should return response data', async () => {
      const userData = {
        success: true,
        data: {
          firebase_uid: 'user-123',
          email: 'test@example.com',
          display_name: 'Test',
          created_at: null,
          updated_at: null,
        },
      };
      mockNetworkClient = createMockNetworkClient(userData);
      client = new StarterClient({ baseUrl, networkClient: mockNetworkClient });

      const result = await client.getUser('user-123', 'token');
      expect(result.success).toBe(true);
      expect(result.data.firebase_uid).toBe('user-123');
    });
  });

  describe('getHistories', () => {
    it('should call GET with correct URL', async () => {
      await client.getHistories('user-123', 'token-abc');
      expect(mockNetworkClient.get).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/users/user-123/histories',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token-abc',
          }),
        })
      );
    });
  });

  describe('createHistory', () => {
    it('should call POST with correct URL and body', async () => {
      const data = { datetime: '2024-01-01T00:00:00Z', value: 100 };
      await client.createHistory('user-123', data, 'token-abc');
      expect(mockNetworkClient.post).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/users/user-123/histories',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token-abc',
          }),
          body: JSON.stringify(data),
        })
      );
    });
  });

  describe('updateHistory', () => {
    it('should call PUT with correct URL and body', async () => {
      const data = { value: 200 };
      await client.updateHistory('user-123', 'hist-456', data, 'token-abc');
      expect(mockNetworkClient.put).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/users/user-123/histories/hist-456',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token-abc',
          }),
          body: JSON.stringify(data),
        })
      );
    });
  });

  describe('deleteHistory', () => {
    it('should call DELETE with correct URL', async () => {
      await client.deleteHistory('user-123', 'hist-456', 'token-abc');
      expect(mockNetworkClient.delete).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/users/user-123/histories/hist-456',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token-abc',
          }),
        })
      );
    });
  });

  describe('getHistoriesTotal', () => {
    it('should call GET with correct URL without auth', async () => {
      await client.getHistoriesTotal();
      expect(mockNetworkClient.get).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/histories/total',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      );
    });

    it('should include Content-Type header', async () => {
      await client.getHistoriesTotal();
      expect(mockNetworkClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('URL construction', () => {
    it('should strip trailing slash from baseUrl', async () => {
      const trailingSlashClient = new StarterClient({
        baseUrl: 'https://api.example.com/',
        networkClient: mockNetworkClient,
      });
      await trailingSlashClient.getHistoriesTotal();
      expect(mockNetworkClient.get).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/histories/total',
        expect.any(Object)
      );
    });
  });
});
