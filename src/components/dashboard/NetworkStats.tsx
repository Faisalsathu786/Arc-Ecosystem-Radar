'use client';

import { useEffect, useState } from 'react';

interface StatsData {
  blockNumber: string;
  gasPrice: string;
  lastBlockTimestamp: number;
  error?: string;
  timestamp: number;
}

export function NetworkStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchStats() {
      try {
        const res = await fetch('/api/network-stats', { cache: 'no-store' });
        const data = await res.json();
        if (mounted) {
          setStats({
            ...data,
            blockNumber: data.blockNumber?.toString() || '0',
            gasPrice: data.gasPrice?.toString() || '0',
          });
        }
      } catch (e) {
        // silent
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const formatGasPrice = (wei: string) => {
    try {
      const gwei = parseInt(wei) / 1e9;
      return gwei.toFixed(2) + ' nUSD';
    } catch {
      return '--';
    }
  };

  const timeSinceLastBlock = () => {
    if (!stats?.lastBlockTimestamp) return '--';
    const seconds = Math.floor((Date.now() - stats.lastBlockTimestamp * 1000) / 1000);
    if (seconds < 1) return 'just now';
    if (seconds < 60) return seconds + 's ago';
    return Math.floor(seconds / 60) + 'm ago';
  };

  const cards = [
    {
      label: 'Latest Block',
      value: stats?.blockNumber && stats.blockNumber !== '0' ? '#' + stats.blockNumber : '--',
      sub: stats ? timeSinceLastBlock() : '',
      status: stats && !stats.error ? 'live' : 'offline',
    },
    {
      label: 'Gas Price',
      value: stats?.gasPrice ? formatGasPrice(stats.gasPrice) : '--',
      sub: 'Gas in NanoUSD',
      status: stats ? 'live' : 'offline',
    },
    {
      label: 'Chain ID',
      value: '5042002',
      sub: 'Arc Testnet',
      status: 'live',
    },
    {
      label: 'Network Status',
      value: stats?.error ? 'Limited' : 'Operational',
      sub: stats?.error ? 'RPC error' : 'Public testnet',
      status: stats?.error ? 'limited' : 'live',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-[#1a1a2e] bg-[#0a0a0f] p-4 hover:border-[#818cf8]/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#6b6b80] uppercase tracking-wider">{card.label}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                card.status === 'live' ? 'bg-green-500' : card.status === 'limited' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            />
          </div>
          <div className="text-lg font-semibold text-white">
            {loading ? (
              <span className="text-[#6b6b80] text-sm">Loading...</span>
            ) : (
              card.value
            )}
          </div>
          {card.sub && <div className="text-xs text-[#6b6b80] mt-0.5">{card.sub}</div>}
        </div>
      ))}
    </div>
  );
}
