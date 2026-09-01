import { getNetworkById } from './wallet-config';

export type VerificationResult =
  | { verified: true; actualAmount: number }
  | { verified: false; reason: string };

const TRC20_MIN_CONFIRMATIONS = 19;
const BEP20_MIN_CONFIRMATIONS = 15;
const AMOUNT_TOLERANCE = 0.01;
const BSC_CHAIN_ID = 56;
const ETHERSCAN_API_BASE = 'https://api.etherscan.io/v2/api';

async function verifyTrc20(txHash: string, expectedAmount: number): Promise<VerificationResult> {
  const network = getNetworkById('usdt-trc20')!;
  const apiKey = process.env.TRONGRID_API_KEY;

  try {
    const res = await fetch(`https://api.trongrid.io/v1/transactions/${txHash}/events`, {
      headers: apiKey ? { 'TRON-PRO-API-KEY': apiKey } : {},
    });
    if (!res.ok) return { verified: false, reason: `TronGrid API error: ${res.status}` };

    const data = (await res.json()) as {
      data?: Array<{
        contract_address: string;
        event_name: string;
        result: { from: string; to: string; value: string };
      }>;
    };

    const transferEvent = data.data?.find(
      (e) => e.event_name === 'Transfer' && e.contract_address.toLowerCase() === network.usdtContract.toLowerCase()
    );
    if (!transferEvent) return { verified: false, reason: 'No matching USDT transfer event found' };

    const infoRes = await fetch('https://api.trongrid.io/wallet/gettransactioninfobyid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'TRON-PRO-API-KEY': apiKey } : {}) },
      body: JSON.stringify({ value: txHash }),
    });
    const info = (await infoRes.json()) as { blockNumber?: number };
    if (!info.blockNumber) return { verified: false, reason: 'Transaction not yet confirmed on-chain' };

    const nowBlockRes = await fetch('https://api.trongrid.io/wallet/getnowblock');
    const nowBlock = (await nowBlockRes.json()) as { block_header?: { raw_data?: { number?: number } } };
    const currentBlock = nowBlock.block_header?.raw_data?.number ?? 0;
    const confirmations = currentBlock - info.blockNumber;
    if (confirmations < TRC20_MIN_CONFIRMATIONS) {
      return { verified: false, reason: `Only ${confirmations} confirmations, need ${TRC20_MIN_CONFIRMATIONS}` };
    }

    const actualAmount = Number(transferEvent.result.value) / 10 ** network.decimals;
    if (Math.abs(actualAmount - expectedAmount) > AMOUNT_TOLERANCE) {
      return { verified: false, reason: `Amount mismatch: expected ${expectedAmount}, got ${actualAmount}` };
    }

    return { verified: true, actualAmount };
  } catch (e) {
    return { verified: false, reason: `Verification error: ${(e as Error).message}` };
  }
}

async function verifyBep20(txHash: string, expectedAmount: number): Promise<VerificationResult> {
  const network = getNetworkById('usdt-bep20')!;
  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (!apiKey) return { verified: false, reason: 'ETHERSCAN_API_KEY is not configured' };

  const url = (params: Record<string, string>) => {
    const qs = new URLSearchParams({ chainid: String(BSC_CHAIN_ID), apikey: apiKey, ...params });
    return `${ETHERSCAN_API_BASE}?${qs.toString()}`;
  };

  try {
    const receiptRes = await fetch(url({ module: 'proxy', action: 'eth_getTransactionReceipt', txhash: txHash }));
    const receiptData = (await receiptRes.json()) as {
      result?: { status: string; logs: Array<{ address: string; topics: string[]; data: string }>; blockNumber: string };
    };
    const receipt = receiptData.result;
    if (!receipt || receipt.status !== '0x1') return { verified: false, reason: 'Transaction not found or failed' };

    const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    const walletTopic = '0x' + network.address.slice(2).toLowerCase().padStart(64, '0');

    const transferLog = receipt.logs.find(
      (l) =>
        l.address.toLowerCase() === network.usdtContract.toLowerCase() &&
        l.topics[0]?.toLowerCase() === TRANSFER_TOPIC &&
        l.topics[2]?.toLowerCase() === walletTopic
    );
    if (!transferLog) return { verified: false, reason: 'No matching USDT transfer to our wallet found' };

    const blockRes = await fetch(url({ module: 'proxy', action: 'eth_blockNumber' }));
    const blockData = (await blockRes.json()) as { result?: string };
    const currentBlock = parseInt(blockData.result || '0x0', 16);
    const txBlock = parseInt(receipt.blockNumber, 16);
    const confirmations = currentBlock - txBlock;
    if (confirmations < BEP20_MIN_CONFIRMATIONS) {
      return { verified: false, reason: `Only ${confirmations} confirmations, need ${BEP20_MIN_CONFIRMATIONS}` };
    }

    const actualAmount = parseInt(transferLog.data, 16) / 10 ** network.decimals;
    if (Math.abs(actualAmount - expectedAmount) > AMOUNT_TOLERANCE) {
      return { verified: false, reason: `Amount mismatch: expected ${expectedAmount}, got ${actualAmount}` };
    }

    return { verified: true, actualAmount };
  } catch (e) {
    return { verified: false, reason: `Verification error: ${(e as Error).message}` };
  }
}

export async function verifyCryptoPayment(
  networkId: string,
  txHash: string,
  expectedAmount: number
): Promise<VerificationResult> {
  if (networkId === 'usdt-trc20') return verifyTrc20(txHash, expectedAmount);
  if (networkId === 'usdt-bep20') return verifyBep20(txHash, expectedAmount);
  return { verified: false, reason: 'Unsupported network' };
}
