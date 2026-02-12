const LOCAL_URL = 'http://localhost:5000/api';
const LIVE_URL = 'https://bloom-k1gb.onrender.com/api';

let API_BASE_URL = LIVE_URL; // Default to live

// Try local first, fallback to live
async function checkAndSetActiveEndpoint(): Promise<void> {
  try {
    // Quick ping to local
    const response = await fetch(`${LOCAL_URL.replace('/api', '')}/health`, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(1000) // 1 second timeout
    });
    if (response.ok) {
      API_BASE_URL = LOCAL_URL;
      console.log('🔗 Using LOCAL backend:', LOCAL_URL);
      return;
    }
  } catch {
    // Local not available, use live
  }
  console.log('🔗 Using LIVE backend:', LIVE_URL);
}

// Check on startup
checkAndSetActiveEndpoint();

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
