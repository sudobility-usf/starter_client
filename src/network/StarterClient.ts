import type { NetworkClient } from '@sudobility/types';
import type {
  BaseResponse,
  History,
  HistoryCreateRequest,
  HistoryTotalResponse,
  HistoryUpdateRequest,
  User,
} from '@sudobility/starter_types';
import type { FirebaseIdToken } from '../types';
import {
  buildUrl,
  createAuthHeaders,
  createHeaders,
} from '../utils/starter-helpers';

export class StarterClient {
  private readonly baseUrl: string;
  private readonly networkClient: NetworkClient;

  constructor(config: { baseUrl: string; networkClient: NetworkClient }) {
    this.baseUrl = config.baseUrl;
    this.networkClient = config.networkClient;
  }

  // --- User ---

  async getUser(
    userId: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<User>> {
    const url = buildUrl(this.baseUrl, `/api/v1/users/${userId}`);
    const response = await this.networkClient.get(url, {
      headers: createAuthHeaders(token),
    });
    return response.data as BaseResponse<User>;
  }

  // --- Histories ---

  async getHistories(
    userId: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<History[]>> {
    const url = buildUrl(this.baseUrl, `/api/v1/users/${userId}/histories`);
    const response = await this.networkClient.get(url, {
      headers: createAuthHeaders(token),
    });
    return response.data as BaseResponse<History[]>;
  }

  async createHistory(
    userId: string,
    data: HistoryCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<History>> {
    const url = buildUrl(this.baseUrl, `/api/v1/users/${userId}/histories`);
    const response = await this.networkClient.post(url, {
      headers: createAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return response.data as BaseResponse<History>;
  }

  async updateHistory(
    userId: string,
    historyId: string,
    data: HistoryUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<History>> {
    const url = buildUrl(
      this.baseUrl,
      `/api/v1/users/${userId}/histories/${historyId}`
    );
    const response = await this.networkClient.put(url, {
      headers: createAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return response.data as BaseResponse<History>;
  }

  async deleteHistory(
    userId: string,
    historyId: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<void>> {
    const url = buildUrl(
      this.baseUrl,
      `/api/v1/users/${userId}/histories/${historyId}`
    );
    const response = await this.networkClient.delete(url, {
      headers: createAuthHeaders(token),
    });
    return response.data as BaseResponse<void>;
  }

  // --- Total (public) ---

  async getHistoriesTotal(): Promise<BaseResponse<HistoryTotalResponse>> {
    const url = buildUrl(this.baseUrl, '/api/v1/histories/total');
    const response = await this.networkClient.get(url, {
      headers: createHeaders(),
    });
    return response.data as BaseResponse<HistoryTotalResponse>;
  }
}
