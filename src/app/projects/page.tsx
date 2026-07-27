'use client';

import { useState, useMemo } from 'react';
import { projects as baseProjects, categoryLabels } from '@/data/projects';
import { ProjectCategory } from '@/types';
import clsx from 'clsx';

interface SubmittedProject {
  id: string;
  name: string;
  handle: string | null;
  description: string;
  category: string;
  twitter?: string;
  website?: string;
  status: string;
  tags: string[];
  submitted: boolean;
  submittedAt?: string;
}

const CATEGORIES: { id: string; label: string }[] = [
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [submitted, setSubmitted] = useState<SubmittedProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Load submitted projects on mount
  useState(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        if (data.submittedCount > 0) {
          setSubmitted(data.projects.filter((p: any) => p.submitted));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  });

  const baseCount = baseProjects.length;
  const submittedCount = submitted.length;

  const totalProjects = baseProjects.map((p) => ({
    ...p,
    submitted: false,
    submittedAt: undefined,
  }));

  const merged = [...totalProjects, ...submitted];

  const filtered = useMemo(() => {
    let result = merged;

    if (selectedCategory !== 'all') {
      result = result.filter((p: any) => p.category === selectedCategory);
    }

    if (statusFilter !== 'all') {
      result = result.filter((p: any) => p.status === statusFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p: any) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [selectedCategory, searchQuery, statusFilter, submitted]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Projects</h1>
        <p className="text-sm text-[#8a8a8a] mt-1">
          {merged.length} projects building on Arc ecosystem
          {submittedCount > 0 && (
            <span className="text-[#818cf8]"> ({submittedCount} community submitted)</span>
          )}
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
        <a
          href="/submit"
          className="inline-flex items-center px-4 py-2 bg-[#818cf8] text-black text-sm font-medium rounded-lg hover:bg-[#a78bfa] transition-colors shrink-0"
        >
          + Submit Project
        </a>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const count = cat.id === 'all'
            ? merged.length
            : merged.filter((p: any) => p.category === cat.id).length;
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
        {filtered.map((project: any) => (
          <div
            key={project.id}
            className={clsx(
              'rounded-xl border p-4 transition-colors group',
              project.submitted
                ? 'border-purple-500/20 bg-[#0a0a0f]'
                : 'border-[#1a1a2e] bg-[#0a0a0f] hover:border-[#818cf8]/30'
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#050508] border border-[#1a1a2e] flex items-center justify-center text-[#818cf8] font-bold text-sm">
                {project.name.charAt(0)}
              </div>
              <div className="flex gap-1.5">
                {project.submitted && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Community
                  </span>
                )}
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
            </div>

            <h3 className="text-sm font-semibold text-white group-hover:text-[#818cf8] transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-[#8a8a8a] mt-1.5 line-clamp-2">{project.description}</p>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {project.tags.slice(0, 3).map((tag: string) => (
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
