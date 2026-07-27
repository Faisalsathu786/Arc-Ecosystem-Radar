'use client';

interface HeaderProps {
  onMenuClick: () => void;
  collapsed: boolean;
}

export function Header({ onMenuClick, collapsed }: HeaderProps) {
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-[#1a1a2e] bg-black/50 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-[#8a8a8a] hover:text-[#e2e2e2] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2.5 5h15M2.5 10h15M2.5 15h15" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="https://arc.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#6b6b80] hover:text-[#818cf8] transition-colors"
        >
          arc.io
        </a>
      </div>
    </header>
  );
}
