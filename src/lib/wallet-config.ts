// عناوين محافظ الإيداع — عدّل هذي القيم بعناوينك الحقيقية.
// يمكنك أيضاً نقلها إلى متغيرات بيئة (Environment Variables) إذا حبيت تغييرها بدون تعديل الكود.

export type WalletNetwork = {
  id: string;
  label: string;
  address: string;
  explorerTxUrl: (txHash: string) => string;
};

export const DEPOSIT_NETWORKS: WalletNetwork[] = [
  {
    id: 'usdt-trc20',
    label: 'USDT (TRC20 - Tron)',
    address: 'TSXxdjqrChHvXfqJ62G7aFEKDMZUoQEeJ1',
    explorerTxUrl: (tx) => `https://tronscan.org/#/transaction/${tx}`,
  },
  {
    id: 'usdt-bep20',
    label: 'USDT (BEP20 - BNB Smart Chain)',
    address: '0xB5B3BEEeAc48415536b5E777a5B850FdCf9A8159',
    explorerTxUrl: (tx) => `https://bscscan.com/tx/${tx}`,
  },
  // يمكنك إضافة شبكات أخرى هنا (ERC20، إلخ) بنفس الشكل
];

export function getNetworkById(id: string): WalletNetwork | undefined {
  return DEPOSIT_NETWORKS.find((n) => n.id === id);
}
