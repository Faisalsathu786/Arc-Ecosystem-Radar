'use client';

import { useState } from 'react';

const CATEGORY_OPTIONS = [
  { value: 'payments', label: 'Payments & Fintech' },
  { value: 'defi', label: 'DeFi & Lending' },
  { value: 'ai-agents', label: 'AI & Agents' },
  { value: 'infrastructure', label: 'Infrastructure & Tools' },
  { value: 'crosschain', label: 'Crosschain & Bridges' },
  { value: 'dex', label: 'DEX & Trading' },
  { value: 'rwa', label: 'RWA & Tokenization' },
  { value: 'community', label: 'Community & Social' },
  { value: 'wallets', label: 'Wallets & Identity' },
  { value: 'analytics', label: 'Analytics & Data' },
  { value: 'issuers', label: 'Stablecoin Issuers' },
  { value: 'market-makers', label: 'Market Makers' },
];

export default function SubmitProjectPage() {
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    description: '',
    category: 'payments',
    twitter: '',
    website: '',
    status: 'building',
    tags: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    setError(null);

    try {
      const tags = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch('/api/submit-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          handle: formData.handle || undefined,
          description: formData.description,
          category: formData.category,
          twitter: formData.twitter || undefined,
          website: formData.website || undefined,
          status: formData.status,
          tags,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, message: data.message || 'Project submitted successfully!' });
        setFormData({
          name: '',
          handle: '',
          description: '',
          category: 'payments',
          twitter: '',
          website: '',
          status: 'building',
          tags: '',
        });
      } else {
        setError(data.error || 'Submission failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Submit Your Project</h1>
        <p className="text-sm text-[#8a8a8a] mt-1">
          Add your Arc ecosystem project to the directory
        </p>
      </div>

      {result?.success && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
          <p className="text-sm text-green-400">{result.message}</p>
          <p className="text-xs text-[#6b6b80] mt-1">
            Your project will appear in the directory after the next refresh.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#8a8a8a] mb-1.5">Project Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. My Arc Project"
              className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg text-sm text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#818cf8]/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8a8a8a] mb-1.5">X Handle</label>
            <input
              type="text"
              name="handle"
              value={formData.handle}
              onChange={handleChange}
              placeholder="e.g. myarcproject"
              className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg text-sm text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#818cf8]/50 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#8a8a8a] mb-1.5">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            placeholder="What does your project do? Max 2-3 sentences."
            className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg text-sm text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#818cf8]/50 transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#8a8a8a] mb-1.5">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg text-sm text-white focus:outline-none focus:border-[#818cf8]/50"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#8a8a8a] mb-1.5">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg text-sm text-white focus:outline-none focus:border-[#818cf8]/50"
            >
              <option value="building">In Development</option>
              <option value="testnet">Live on Testnet</option>
              <option value="mainnet">Mainnet</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#8a8a8a] mb-1.5">X/Twitter URL</label>
            <input
              type="url"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              placeholder="https://x.com/project"
              className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg text-sm text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#818cf8]/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8a8a8a] mb-1.5">Website URL</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://project.com"
              className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg text-sm text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#818cf8]/50 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#8a8a8a] mb-1.5">Tags (comma separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g. defi, lending, stablecoin"
            className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg text-sm text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#818cf8]/50 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-4 py-3 bg-[#818cf8] text-black text-sm font-semibold rounded-lg hover:bg-[#a78bfa] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit Project'}
        </button>
      </form>

      <div className="rounded-xl border border-[#1a1a2e] bg-[#0a0a0f] p-4">
        <h3 className="text-xs font-semibold text-[#8a8a8a] uppercase tracking-wider mb-2">Note</h3>
        <p className="text-xs text-[#6b6b80] leading-relaxed">
          Submitted projects are stored locally and will appear immediately in the directory.
          For production deployment, submissions are saved to the data store and persist across page loads.
        </p>
      </div>
    </div>
  );
}
