#!/usr/bin/env node
/**
 * Arc Ecosystem Scanner
 * Run daily to check for new Arc ecosystem projects and activity.
 * Uses web search via DONUT_WEB_SEARCH when available, falls back to arc.io.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const WORKSPACE = '/home/node/.openclaw/workspace/arc-ecosystem';
const DATA_FILE = join(WORKSPACE, 'data', 'submitted-projects.json');

const KNOWN_HANDLES = [
  'synthra_finance', 'PulsarMoneyApp', 'AIsaOneHQ', 'Xylonet_',
  'TowerExchange', 'tlay_io', 'BlockradarHQ', 'myazahq',
  'payritHQ', 'ViFi_Labs', 'usesfxmoneyapp', 'Mimir_Markets',
  'hinkal_protocol', 'ArcDEXScan', 'MeridianFi', 'KONswap',
  'wirexapp', '0xsequence', 'arckitties', 'arcadiansonarc',
  '8bitarc', 'onchainsharc', 'cctp420', 'sharcbay', 'unemployeeonarc',
];

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try {
    const logFile = join(WORKSPACE, 'data', 'scan-log.jsonl');
    writeFileSync(logFile, JSON.stringify({ts: new Date().toISOString(), msg}) + '\n', { flag: 'a' });
  } catch {}
}

async function scan() {
  log('Starting Arc ecosystem scan');

  let submitted = [];
  try {
    submitted = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    submitted = [];
  }

  const submittedHandles = new Set(
    submitted.map((s) => s.handle).filter(Boolean)
  );

  // Try fetching from arc.io community page
  const sources = [
    { url: 'https://community.arc.network/latest.json', name: 'Arc Community' },
    { url: 'https://r.jina.ai/https://x.com/arc', name: 'Arc X Profile (jina)' },
  ];

  let allText = '';

  for (const { url, name } of sources) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const text = await res.text();
        allText += text + '\n';
        log(`Fetched ${name}: ${text.length} chars`);
      } else {
        log(`${name} returned ${res.status}`);
      }
    } catch (e) {
      log(`${name} failed: ${e.message}`);
    }
  }

  // Extract potential handles from all text
  // Look for @handle patterns, project names, "building on Arc" mentions
  const handleMatches = allText.match(/@(\w{4,})/g) || [];
  const buildingOnArc = (allText.match(/(\w+)\s+(?:is\s+)?building\s+on\s+Arc/gi) || [])
    .map((s) => s.replace(/\s+(?:is\s+)?building\s+on\s+Arc/i, '').trim());

  let newProjects = [];

  // Process handles
  for (const match of handleMatches) {
    const handle = match.slice(1).toLowerCase();
    if (
      handle.length > 3 &&
      !KNOWN_HANDLES.includes(handle) &&
      !submittedHandles.has(handle) &&
      !['https', 'http', 'arc', 'xcom', 'twitter'].includes(handle)
    ) {
      log(`Potential new project from handle: @${handle}`);
      newProjects.push({
        id: `scanned-${handle}-${Date.now()}`,
        name: handle.charAt(0).toUpperCase() + handle.slice(1),
        handle: handle,
        description: `Arc ecosystem project discovered via automated scan.`,
        category: 'community',
        twitter: `https://x.com/${handle}`,
        status: 'building',
        tags: ['auto-scanned'],
        submitted: true,
        submittedAt: new Date().toISOString().split('T')[0],
      });
    }
  }

  // Process project names
  for (const name of buildingOnArc) {
    const clean = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (
      clean.length > 3 &&
      !KNOWN_HANDLES.includes(clean) &&
      !submittedHandles.has(clean)
    ) {
      log(`Potential new project from name: ${name}`);
      newProjects.push({
        id: `scanned-${clean}-${Date.now()}`,
        name: name,
        handle: clean,
        description: `Project building on Arc ecosystem.`,
        category: 'community',
        status: 'building',
        tags: ['auto-scanned'],
        submitted: true,
        submittedAt: new Date().toISOString().split('T')[0],
      });
    }
  }

  // Deduplicate
  const allSeen = new Set([...submittedHandles]);
  const uniqueNew = newProjects.filter((p) => !allSeen.has(p.handle));

  if (uniqueNew.length > 0) {
    const updated = [...submitted, ...uniqueNew];
    writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2));
    log(`Added ${uniqueNew.length} new projects: ${uniqueNew.map(p => p.handle).join(', ')}`);

    try {
      execSync('git add data/submitted-projects.json', { cwd: WORKSPACE });
      execSync(
        `git commit -m "Auto-scan: discovered ${uniqueNew.length} new ecosystem projects"`,
        { cwd: WORKSPACE }
      );
      execSync('git push', { cwd: WORKSPACE });
      log('Pushed to GitHub successfully');
    } catch (e) {
      log(`Git push error: ${e.message}`);
    }
  } else {
    log('No new projects found. Total known handles: ' + KNOWN_HANDLES.length);
  }

  log(`Scan complete. Total submitted projects: ${submitted.length + uniqueNew.length}`);
}

scan().catch((e) => {
  log(`Fatal error: ${e.message}`);
  process.exit(1);
});
