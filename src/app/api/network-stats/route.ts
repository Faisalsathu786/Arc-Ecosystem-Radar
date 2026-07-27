import { NextResponse } from 'next/server';
import { fetchNetworkStats } from '@/lib/arc';

export async function GET() {
  try {
    const stats = await fetchNetworkStats();
    return NextResponse.json({
      ...stats,
      timestamp: Date.now(),
      blockNumber: stats.blockNumber.toString(),
      gasPrice: stats.gasPrice.toString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        blockNumber: '0',
        gasPrice: '0',
        lastBlockTimestamp: 0,
        chainId: 5042002,
        error: String(error),
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
