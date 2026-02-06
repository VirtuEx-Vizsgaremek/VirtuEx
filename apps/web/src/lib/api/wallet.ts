const API_BASE_URL = process.env.API_BASE_URL;

function getAuthToken(): string {
  if (typeof window === 'undefined') {
    return 'dev-token';
  }
  return localStorage.getItem('jwt') || 'dev-token';
}

function getHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json'
  };
}

export async function fetchWalletBalance() {
  const response = await fetch(`${API_BASE_URL}/v1/wallet/balance`, {
    method: 'GET',
    headers: getHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch wallet balance: ${response.status}`);
  }

  return response.json();
}

export async function fetchWalletTransactions() {
  const response = await fetch(`${API_BASE_URL}/v1/wallet/transactions`, {
    method: 'GET',
    headers: getHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.status}`);
  }

  return response.json();
}

export async function fetchWalletData() {
  const [balanceData, transactionsData] = await Promise.all([
    fetchWalletBalance(),
    fetchWalletTransactions()
  ]);

  return {
    wallet: balanceData,
    transactions: transactionsData
  };
}
