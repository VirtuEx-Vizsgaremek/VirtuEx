const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const DEV_WALLET_ID = process.env.NEXT_PUBLIC_DEV_WALLET_ID;

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
  if (!DEV_WALLET_ID) {
    throw new Error('Missing NEXT_PUBLIC_DEV_WALLET_ID');
  }

  const [wallet, transactions] = await Promise.all([
    fetchWalletBalance(DEV_WALLET_ID),
    fetchWalletTransactions(DEV_WALLET_ID)
  ]);

  return { wallet, transactions };
}
