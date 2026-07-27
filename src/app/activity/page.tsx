'use client';

import { useMemo, useState } from 'react';
import { activityFeed, projects } from '@/data/projects';
import clsx from 'clsx';

const TYPE_LABELS: Record<string, string> = {
  'project-join': 'New Project',
  'builder-spotlight': 'Builder Spotlight',
  milestone: 'Milestone',
  'testnet-update': 'Testnet Update',
  partnership: 'Partnership',
};

export default function ActivityPage() {
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return activityFeed;
    return activityFeed.filter((a) => a.type === typeFilter);
  }, [typeFilter]);

  const getProjectName = (projectId?: string) => {
    if (!projectId) return null;
    const p = projects.find((pr) => pr.id === projectId);
    return p?.name || null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Activity</h1>
        <p className="text-sm text-[#8a8a8a] mt-1">
          Recent ecosystem updates, builder spotlights, and milestones
        </p>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'milestone', label: 'Milestones' },
          { id: 'builder-spotlight', label: 'Builder Spotlight' },
          { id: 'project-join', label: 'New Projects' },
          { id: 'partnership', label: 'Partnerships' },
          { id: 'testnet-update', label: 'Testnet Updates' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTypeFilter(t.id)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              typeFilter === t.id
                ? 'bg-[#818cf8]/20 text-[#818cf8] border border-[#818cf8]/30'
                : 'bg-[#0a0a0f] text-[#8a8a8a] border border-[#1a1a2e] hover:border-[#818cf8]/20 hover:text-white'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Activity timeline */}
      <div className="space-y-3">
        {filtered.map((item, index) => {
          const projectName = getProjectName(item.relatedProject);
          return (
            <div
              key={item.id}
              className="relative rounded-xl border border-[#1a1a2e] bg-[#0a0a0f] p-4 pl-8"
            >
              {/* Timeline line */}
              {index < filtered.length - 1 && (
                <div className="absolute left-[11px] top-8 bottom-0 w-px bg-[#1a1a2e]" />
              )}
              {/* Dot */}
              <div className="absolute left-[7px] top-5 w-[9px] h-[9px] rounded-full bg-[#818cf8]" />

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#818cf8]/10 text-[#818cf8] border border-[#818cf8]/20">
                      {TYPE_LABELS[item.type] || item.type}
                    </span>
                    {projectName && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#050508] text-[#6b6b80] border border-[#1a1a2e]">
                        {projectName}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-white mt-2">{item.title}</h3>
                  <p className="text-xs text-[#8a8a8a] mt-1 leading-relaxed">{item.description}</p>
                  <div className="text-[11px] text-[#6b6b80] mt-2">{item.date}</div>
                </div>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#818cf8] hover:text-[#a78bfa] shrink-0 mt-1 transition-colors"
                  >
                    View
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
