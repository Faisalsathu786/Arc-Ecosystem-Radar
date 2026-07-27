'use client';

import { NetworkStats } from '@/components/dashboard/NetworkStats';
import { EcosystemOverview } from '@/components/dashboard/EcosystemOverview';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white">Arc Ecosystem Radar</h1>
        <p className="text-sm text-[#8a8a8a] mt-1">
          Live dashboard tracking Circle&apos;s stablecoin-native L1 blockchain ecosystem
        </p>
      </div>

      <NetworkStats />
      <EcosystemOverview />

      <div className="rounded-xl border border-[#1a1a2e] bg-[#0a0a0f] p-5">
        <h2 className="text-sm font-semibold text-white mb-3">About Arc</h2>
        <p className="text-sm text-[#8a8a8a] leading-relaxed">
          Arc is an open Layer-1 blockchain built by Circle, purpose-built for stablecoin finance.
          With USDC as native gas, fees are low, predictable, and dollar-denominated. Backed by
          a16z crypto, BlackRock, Apollo, and ARK Invest. Public testnet live since October 2025,
          mainnet expected in 2026.
        </p>
        <div className="flex flex-wrap gap-4 mt-4">
          <a
            href="https://arc.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-lg bg-[#818cf8]/10 text-[#818cf8] hover:bg-[#818cf8]/20 transition-colors"
          >
            arc.io
          </a>
          <a
            href="https://docs.arc.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-lg bg-[#1a1a2e] text-[#8a8a8a] hover:text-white transition-colors"
          >
            Docs
          </a>
          <a
            href="https://x.com/arc"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-lg bg-[#1a1a2e] text-[#8a8a8a] hover:text-white transition-colors"
          >
            @arc on X
          </a>
          <a
            href="https://testnet.arcscan.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-lg bg-[#1a1a2e] text-[#8a8a8a] hover:text-white transition-colors"
          >
            Block Explorer
          </a>
        </div>
      </div>
    </div>
  );
}
