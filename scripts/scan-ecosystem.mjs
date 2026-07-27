#!/usr/bin/env node
/**
 * Arc Ecosystem Scanner
 * Run daily to check for new Arc ecosystem projects and activity.
 * Updates submitted-projects.json and pushes to GitHub.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = '/home/node/.openclaw/workspace/arc-ecosystem';
const DATA_FILE = path.join(WORKSPACE, 'data', 'submitted-projects.json');

const KNOWN_HANDLES = [
  'synthra_finance', 'PulsarMoneyApp', 'AIsaOneHQ', 'Xylonet_',
  'TowerExchange', 'tlay_io', 'BlockradarHQ', 'myazahq',
  'payritHQ', 'ViFi_Labs', 'usesfxmoneyapp', 'Mimir_Markets',
  'hinkal_protocol', 'ArcDEXScan', 'MeridianFi', 'KONswap',
  'wirexapp', '0xsequence', 'arckitties', 'arcadiansonarc',
  '8bitarc', 'onchainsharc', 'cctp420', 'sharcbay', 'unemployeeonarc',
];

async function scan() {
  console.log(`[Arc Scanner] Starting scan at ${new Date().toISOString()}`);

  // Read existing submissions
  let submitted = [];
  try {
    submitted = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    submitted = [];
  }

  const submittedHandles = new Set(
    submitted.map((s) => s.handle).filter(Boolean)
  );

  // Check Arc's X profile for recent mentions
  const sources = [
    'https://r.jina.ai/https://x.com/arc',
    'https://r.jina.ai/https://x.com/search?q=%40arc+ecosystem+project&src=typed_query&f=top',
  ];

  let newProjects = [];

  for (const url of sources) {
    try {
      const res = await fetch(url, {
        headers: {
          'Accept': 'text/plain',
          'X-Return-Format': 'text',
          'X-With-Generated-Alt': 'true',
        },
        signal: AbortSignal.timeout(20000),
      });

      if (!res.ok) {
        console.log(`[Arc Scanner] Failed ${url}: ${res.status}`);
        continue;
      }

      const text = await res.text();
      console.log(`[Arc Scanner] Fetched ${url}: ${text.length} chars`);

      // Look for @handle patterns that might be new projects
      const matches = text.match(/@(\w+)/g) || [];
      for (const match of matches) {
        const handle = match.slice(1).toLowerCase();
        if (
          handle.length > 3 &&
          !KNOWN_HANDLES.includes(handle) &&
          !submittedHandles.has(handle)
        ) {
          console.log(`[Arc Scanner] Found potential new project: @${handle}`);
          newProjects.push({
            id: `scanned-${handle}-${Date.now()}`,
            name: handle.charAt(0).toUpperCase() + handle.slice(1),
            handle: handle,
            description: `Arc ecosystem project discovered via scan.`,
            category: 'community',
            twitter: `https://x.com/${handle}`,
            status: 'building',
            tags: ['auto-scanned', 'discovered'],
            submitted: true,
            submittedAt: new Date().toISOString().split('T')[0],
          });
        }
      }
    } catch (e) {
      console.log(`[Arc Scanner] Error fetching ${url}: ${e.message}`);
    }
  }

  if (newProjects.length > 0) {
    // Deduplicate
    const allHandles = new Set(submittedHandles);
    const uniqueNew = newProjects.filter((p) => !allHandles.has(p.handle));

    if (uniqueNew.length > 0) {
      const updated = [...submitted, ...uniqueNew];
      fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2));
      console.log(`[Arc Scanner] Added ${uniqueNew.length} new projects`);

      // Commit and push
      try {
        execSync('git add data/submitted-projects.json', { cwd: WORKSPACE });
        execSync(
          `git commit -m "Auto-scan: discovered ${uniqueNew.length} new ecosystem projects"`,
          { cwd: WORKSPACE }
        );
        execSync('git push', { cwd: WORKSPACE });
        console.log('[Arc Scanner] Pushed to GitHub');
      } catch (e) {
        console.log(`[Arc Scanner] Git error: ${e.message}`);
      }
    }
  } else {
    console.log('[Arc Scanner] No new projects found');
  }

  console.log(`[Arc Scanner] Scan complete. Total submitted: ${submitted.length + newProjects.length}`);
}

scan().catch((e) => {
  console.error('[Arc Scanner] Fatal error:', e);
  process.exit(1);
});
