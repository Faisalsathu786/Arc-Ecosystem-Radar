'use client';

import { useState, useMemo } from 'react';
import { projects, categoryLabels } from '@/data/projects';
import { ProjectCategory } from '@/types';
import clsx from 'clsx';

const CATEGORIES: { id: ProjectCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'payments', label: 'Payments' },
  { id: 'defi', label: 'DeFi' },
  { id: 'ai-agents', label: 'AI & Agents' },
  { id: 'dex', label: 'DEX & Trading' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'community', label: 'Community' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'wallets', label: 'Wallets' },
  { id: 'crosschain', label: 'Crosschain' },
  { id: 'rwa', label: 'RWA' },
  { id: 'issuers', label: 'Issuers' },
  { id: 'market-makers', label: 'Market Makers' },
];

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    let result = projects;

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [selectedCategory, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Projects</h1>
        <p className="text-sm text-[#8a8a8a] mt-1">
          {projects.length} projects building on Arc ecosystem
        </p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg text-sm text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#818cf8]/50 transition-colors"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg text-sm text-[#e2e2e2] focus:outline-none focus:border-[#818cf8]/50"
        >
          <option value="all">All Status</option>
          <option value="testnet">Live on Testnet</option>
          <option value="building">In Development</option>
          <option value="mainnet">Mainnet</option>
        </select>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const count = cat.id === 'all' ? projects.length : projects.filter((p) => p.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                selectedCategory === cat.id
                  ? 'bg-[#818cf8]/20 text-[#818cf8] border border-[#818cf8]/30'
                  : 'bg-[#0a0a0f] text-[#8a8a8a] border border-[#1a1a2e] hover:border-[#818cf8]/20 hover:text-white'
              )}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Project grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((project) => (
          <div
            key={project.id}
            className="rounded-xl border border-[#1a1a2e] bg-[#0a0a0f] p-4 hover:border-[#818cf8]/30 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#050508] border border-[#1a1a2e] flex items-center justify-center text-[#818cf8] font-bold text-sm">
                {project.name.charAt(0)}
              </div>
              <span
                className={clsx(
                  'text-[10px] px-2 py-0.5 rounded-full font-medium',
                  project.status === 'testnet'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : project.status === 'mainnet'
                    ? 'bg-[#818cf8]/10 text-[#818cf8] border border-[#818cf8]/20'
                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                )}
              >
                {project.status === 'testnet' ? 'Testnet' : project.status === 'mainnet' ? 'Mainnet' : 'Building'}
              </span>
            </div>

            <h3 className="text-sm font-semibold text-white group-hover:text-[#818cf8] transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-[#8a8a8a] mt-1.5 line-clamp-2">{project.description}</p>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {project.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-[#050508] text-[#6b6b80] border border-[#1a1a2e]">
                  {tag}
                </span>
              ))}
              {project.tags.length > 3 && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#050508] text-[#6b6b80]">
                  +{project.tags.length - 3}
                </span>
              )}
            </div>

            <div className="flex gap-2 mt-3 pt-3 border-t border-[#1a1a2e]">
              {project.twitter && (
                <a
                  href={project.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] px-2 py-1 rounded bg-[#050508] text-[#6b6b80] hover:text-[#818cf8] transition-colors"
                >
                  X
                </a>
              )}
              {project.website && (
                <a
                  href={project.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] px-2 py-1 rounded bg-[#050508] text-[#6b6b80] hover:text-[#818cf8] transition-colors"
                >
                  Site
                </a>
              )}
              <span className="text-[10px] px-2 py-1 rounded bg-[#050508] text-[#6b6b80]">
                {categoryLabels[project.category] || project.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-[#6b6b80]">No projects found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
