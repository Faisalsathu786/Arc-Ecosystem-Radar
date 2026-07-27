import { createPublicClient, http } from 'viem';
import { defineChain } from 'viem';

export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USDC',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.arc.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ArcScan',
      url: 'https://testnet.arcscan.app',
    },
  },
});

export function getArcClient() {
  return createPublicClient({
    chain: arcTestnet,
    transport: http('https://rpc.testnet.arc.network', {
      timeout: 10000,
    }),
  });
}

export async function fetchNetworkStats() {
  try {
    const client = getArcClient();
    const blockNumber = await client.getBlockNumber();
    const block = await client.getBlock({ blockNumber });
    const gasPrice = await client.getGasPrice();

    return {
      blockNumber,
      gasPrice,
      lastBlockTimestamp: Number(block.timestamp),
      chainId: arcTestnet.id,
      success: true,
    };
  } catch (error) {
    console.error('Failed to fetch Arc network stats:', error);
    return {
      blockNumber: BigInt(0),
      gasPrice: BigInt(0),
      lastBlockTimestamp: 0,
      chainId: arcTestnet.id,
      success: false,
      error: String(error),
    };
  }
}
