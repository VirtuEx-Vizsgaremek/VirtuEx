const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const DEV_WALLET_ID = process.env.NEXT_PUBLIC_DEV_WALLET_ID;
let cachedWalletId: string | null = null;

function getApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_API_BASE_URL');
  }
  return API_BASE_URL;
}

export type WalletBalanceResponse = {
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

export type WalletTransactionsResponse = {
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

type DefaultWalletResponse = {
  wallet_id: string;
};

async function resolveWalletId(): Promise<string> {
  if (cachedWalletId) return cachedWalletId;

  if (DEV_WALLET_ID) {
    cachedWalletId = DEV_WALLET_ID;
    return cachedWalletId;
  }

  const response = await fetch(`${getApiBaseUrl()}/v1/wallet/default`, {
    method: 'GET'
  });

  if (!response.ok) {
    throw new Error(`Failed to resolve wallet id: ${response.status}`);
  }

  const data = (await response.json()) as DefaultWalletResponse;
  cachedWalletId = data.wallet_id;
  return cachedWalletId;
}

export async function fetchWalletBalance(
  walletId: string
): Promise<WalletBalanceResponse> {
  const response = await fetch(`${getApiBaseUrl()}/v1/wallet/${walletId}`, {
    method: 'GET'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch wallet balance: ${response.status}`);
  }

  return response.json();
}

export async function fetchWalletTransactions(
  walletId: string
): Promise<WalletTransactionsResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}/v1/wallet/${walletId}/history`,
    {
      method: 'GET'
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.status}`);
  }

  return response.json();
}

export async function fetchWalletData() {
  const walletId = await resolveWalletId();

  const [wallet, transactions] = await Promise.all([
    fetchWalletBalance(walletId),
    fetchWalletTransactions(walletId)
  ]);

  return { wallet, transactions };
}
