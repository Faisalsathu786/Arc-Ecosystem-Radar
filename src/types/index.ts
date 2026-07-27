export interface ArcProject {
  id: string;
  name: string;
  handle: string | null;
  description: string;
  category: ProjectCategory;
  website?: string;
  twitter?: string;
  status: 'testnet' | 'mainnet' | 'building';
  spotlight?: boolean;
  tags: string[];
  logo?: string;
}

export type ProjectCategory =
  | 'payments'
  | 'defi'
  | 'ai-agents'
  | 'infrastructure'
  | 'crosschain'
  | 'dex'
  | 'rwa'
  | 'community'
  | 'wallets'
  | 'analytics'
  | 'issuers'
  | 'market-makers';

export interface NetworkStats {
  blockNumber: bigint;
  gasPrice: bigint;
  avgBlockTime: number;
  totalTransactions: number;
  usdcPrice: number;
  lastBlockTimestamp: number;
  chainId: number;
}

export interface ActivityItem {
  id: string;
  type: 'project-join' | 'builder-spotlight' | 'milestone' | 'testnet-update' | 'partnership';
  title: string;
  description: string;
  date: string;
  link?: string;
  relatedProject?: string;
}

export interface CategoryInfo {
  id: ProjectCategory;
  label: string;
  count: number;
}
