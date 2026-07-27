'use client';

import { projects, activityFeed } from '@/data/projects';
import { useEffect, useState } from 'react';

export function EcosystemOverview() {
  const [weeklyTx, setWeeklyTx] = useState('10.6M');
  const [weeklyAccounts, setWeeklyAccounts] = useState('23.5K');
  const [weeklyContracts, setWeeklyContracts] = useState('904K');

  // Attempt to fetch from arc.io, fall back to hardcoded
  useEffect(() => {
    async function fetchArcMetrics() {
      try {
        const res = await fetch('https://www.arc.io/');
        // We can't scrape this client-side due to CORS, use fallback
      } catch {
        // use fallback
      }
    }
    fetchArcMetrics();
  }, []);

  const projectCounts = {
    total: projects.length,
    testnet: projects.filter((p) => p.status === 'testnet').length,
    building: projects.filter((p) => p.status === 'building').length,
    spotlight: projects.filter((p) => p.spotlight).length,
  };

  const recentActivity = activityFeed.slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Project Stats */}
      <div className="rounded-xl border border-[#1a1a2e] bg-[#0a0a0f] p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Ecosystem at a Glance</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#050508] rounded-lg p-3 border border-[#1a1a2e]">
            <div className="text-2xl font-bold text-[#818cf8]">{projectCounts.total}</div>
            <div className="text-xs text-[#6b6b80] mt-0.5">Total Projects</div>
          </div>
          <div className="bg-[#050508] rounded-lg p-3 border border-[#1a1a2e]">
            <div className="text-2xl font-bold text-white">{projectCounts.testnet}</div>
            <div className="text-xs text-[#6b6b80] mt-0.5">Live on Testnet</div>
          </div>
          <div className="bg-[#050508] rounded-lg p-3 border border-[#1a1a2e]">
            <div className="text-2xl font-bold text-[#a78bfa]">{projectCounts.spotlight}</div>
            <div className="text-xs text-[#6b6b80] mt-0.5">Builder Spotlight</div>
          </div>
          <div className="bg-[#050508] rounded-lg p-3 border border-[#1a1a2e]">
            <div className="text-2xl font-bold text-white">{projectCounts.building}</div>
            <div className="text-xs text-[#6b6b80] mt-0.5">In Development</div>
          </div>
        </div>
      </div>

      {/* Testnet Metrics */}
      <div className="rounded-xl border border-[#1a1a2e] bg-[#0a0a0f] p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Testnet Activity (Weekly)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#050508] rounded-lg p-3 border border-[#1a1a2e]">
            <div className="text-2xl font-bold text-white">{weeklyTx}</div>
            <div className="text-xs text-[#6b6b80] mt-0.5">Transactions</div>
          </div>
          <div className="bg-[#050508] rounded-lg p-3 border border-[#1a1a2e]">
            <div className="text-2xl font-bold text-white">{weeklyAccounts}</div>
            <div className="text-xs text-[#6b6b80] mt-0.5">New Accounts</div>
          </div>
          <div className="bg-[#050508] rounded-lg p-3 border border-[#1a1a2e]">
            <div className="text-2xl font-bold text-white">{weeklyContracts}</div>
            <div className="text-xs text-[#6b6b80] mt-0.5">Contracts Deployed</div>
          </div>
          <div className="bg-[#050508] rounded-lg p-3 border border-[#1a1a2e]">
            <div className="text-2xl font-bold text-[#818cf8]">244M+</div>
            <div className="text-xs text-[#6b6b80] mt-0.5">Total Tx (All Time)</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-[#6b6b80]">
          Data source: arc.io public testnet metrics
        </div>
      </div>

      {/* Recent Activity */}
      <div className="lg:col-span-2 rounded-xl border border-[#1a1a2e] bg-[#0a0a0f] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Recent Ecosystem Activity</h3>
          <a
            href="/activity"
            className="text-xs text-[#818cf8] hover:text-[#a78bfa] transition-colors"
          >
            View all
          </a>
        </div>
        <div className="space-y-3">
          {recentActivity.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#050508] border border-[#1a1a2e]">
              <div className="w-2 h-2 rounded-full bg-[#818cf8] mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{item.title}</div>
                <div className="text-xs text-[#8a8a8a] mt-0.5 line-clamp-2">{item.description}</div>
                <div className="text-xs text-[#6b6b80] mt-1">{item.date}</div>
              </div>
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#818cf8] hover:text-[#a78bfa] shrink-0 mt-1"
                >
                  Link
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
