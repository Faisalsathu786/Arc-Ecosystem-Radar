export interface NetworkStatsResult {
  blockNumber: bigint;
  gasPrice: bigint;
  lastBlockTimestamp: number;
  chainId: number;
  error?: string;
  timestamp: number;
}

export async function fetchNetworkStats(): Promise<NetworkStatsResult> {
  try {
    const res = await fetch('/api/network-stats', {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch network stats');
    return await res.json();
  } catch (error) {
    return {
      blockNumber: BigInt(0),
      gasPrice: BigInt(0),
      lastBlockTimestamp: 0,
      chainId: 5042002,
      error: String(error),
      timestamp: Date.now(),
    };
  }
}
