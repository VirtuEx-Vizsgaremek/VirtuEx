const API_BASE_URL = process.env.API_BASE_URL;

type UserMeResponse = {
  wallet: string | number;
};

type WalletBalanceResponse = {
  wallet_id: string;
  total_assets: number;
  assets: Array<{
    id: string;
    currency: string;
    symbol: string;
    amount: string;
    type: 'fiat' | 'crypto';
    precision: number;
  }>;
};

type WalletTransactionsResponse = {
  wallet_id: string;
  total_transactions: number;
  transactions: Array<{
    id: string;
    asset_id: string;
    currency: string;
    symbol: string;
    amount: string;
    direction: 'in' | 'out';
    status: 'pending' | 'completed' | 'failed';
    created_at: string;
    updated_at: string;
  }>;
};

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

async function fetchMe(): Promise<UserMeResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/user/@me`, {
    method: 'GET',
    headers: getHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${response.status}`);
  }

  return response.json();
}

export async function fetchWalletBalance(walletId: string) {
  const response = await fetch(`${API_BASE_URL}/v1/wallet/${walletId}`, {
    method: 'GET',
    headers: getHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch wallet balance: ${response.status}`);
  }

  return response.json() as Promise<WalletBalanceResponse>;
}

export async function fetchWalletTransactions(walletId: string) {
  const response = await fetch(
    `${API_BASE_URL}/v1/wallet/${walletId}/history`,
    {
      method: 'GET',
      headers: getHeaders()
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.status}`);
  }

  return response.json() as Promise<WalletTransactionsResponse>;
}

export async function fetchWalletData() {
  const me = await fetchMe();
  const walletId = String(me.wallet);

  const [balanceData, transactionsData] = await Promise.all([
    fetchWalletBalance(walletId),
    fetchWalletTransactions(walletId)
  ]);

  return {
    wallet: balanceData,
    transactions: transactionsData
  };
}
