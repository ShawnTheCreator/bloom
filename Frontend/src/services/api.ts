const API_BASE_URL = 'http://localhost:5000/api'; // Change this to your backend URL

class ApiService {
  private async fetchWithErrorHandling(url: string, options?: RequestInit) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Users
  async getUser(userId: number) {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/users/${userId}`);
  }

  async getUserStats(userId: number) {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/users/${userId}/stats`);
  }

  async subscribeUser(userId: number) {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/users/${userId}/subscribe`, {
      method: 'POST',
    });
  }

  // Marketplace
  async getMarketplaceItems(category?: string) {
    const url = category && category !== 'All' 
      ? `${API_BASE_URL}/marketplace?category=${category}`
      : `${API_BASE_URL}/marketplace`;
    return this.fetchWithErrorHandling(url);
  }

  async getItem(itemId: number) {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/marketplace/${itemId}`);
  }

  async buyItem(itemId: number, buyerId: number) {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/marketplace/${itemId}/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buyerId),
    });
  }

  async getCategories() {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/marketplace/categories`);
  }

  // Hive Activities
  async getActivities() {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/hive`);
  }

  async joinActivity(activityId: number, userId: number) {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/hive/${activityId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userId),
    });
  }

  async getHiveStats() {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/hive/stats`);
  }

  // Transactions
  async getUserTransactions(userId: number) {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/transactions/user/${userId}`);
  }

  async getUserSummary(userId: number) {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/transactions/user/${userId}/summary`);
  }
}

export const apiService = new ApiService();
