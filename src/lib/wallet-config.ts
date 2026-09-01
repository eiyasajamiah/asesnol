export type WalletNetwork = {
  id: 'usdt-trc20' | 'usdt-bep20';
  label: string;
  address: string;
  usdtContract: string;
  decimals: number;
  explorerTxUrl: (txHash: string) => string;
};

export const DEPOSIT_NETWORKS: WalletNetwork[] = [
  {
    id: 'usdt-trc20',
    label: 'USDT (TRC20 - Tron)',
    address: 'TSXxdjqrChHvXfqJ62G7aFEKDMZUoQEeJ1',
    usdtContract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    decimals: 6,
    explorerTxUrl: (tx) => `https://tronscan.org/#/transaction/${tx}`,
  },
  {
    id: 'usdt-bep20',
    label: 'USDT (BEP20 - BNB Smart Chain)',
    address: '0xB5B3BEEeAc48415536b5E777a5B850FdCf9A8159',
    usdtContract: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
    explorerTxUrl: (tx) => `https://bscscan.com/tx/${tx}`,
  },
];

export function getNetworkById(id: string): WalletNetwork | undefined {
  return DEPOSIT_NETWORKS.find((n) => n.id === id);
}
