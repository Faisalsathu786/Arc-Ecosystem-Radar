import { NextResponse } from 'next/server';

const JSONBLOB_ID = '019fa219-474f-7990-906c-c2d5199a89fc';
const JSONBLOB_URL = `https://jsonblob.com/api/jsonBlob/${JSONBLOB_ID}`;

const KNOWN_HANDLES = [
  'synthra_finance', 'PulsarMoneyApp', 'AIsaOneHQ', 'Xylonet_',
  'TowerExchange', 'tlay_io', 'BlockradarHQ', 'myazahq',
  'payritHQ', 'ViFi_Labs', 'usesfxmoneyapp', 'Mimir_Markets',
  'hinkal_protocol', 'ArcDEXScan', 'MeridianFi', 'KONswap',
  'wirexapp', '0xsequence', 'arckitties', 'arcadiansonarc',
  '8bitarc', 'onchainsharc', 'cctp420', 'sharcbay', 'unemployeeonarc',
];

export async function GET() {
  const results: string[] = [];
  const log: string[] = [];

  // 1. Keep-alive: renew jsonblob
  try {
    const readRes = await fetch(JSONBLOB_URL, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });

    if (!readRes.ok) {
      results.push(`Keep-alive failed: blob read error ${readRes.status}`);
    } else {
      const current = await readRes.json();

      const saveRes = await fetch(JSONBLOB_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...current,
          version: Date.now(),
          lastKeepAlive: new Date().toISOString(),
        }),
      });

      if (saveRes.ok) {
        results.push(`Keep-alive OK. ${current.projects?.length || 0} projects preserved.`);
      } else {
        results.push(`Keep-alive failed: blob save error ${saveRes.status}`);
      }
    }
  } catch (e: any) {
    results.push(`Keep-alive error: ${e.message}`);
  }

  // 2. Ecosystem scan: find new projects
  let newProjectCount = 0;

  try {
    const blobRes = await fetch(JSONBLOB_URL, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });

    if (!blobRes.ok) {
      results.push(`Scan failed: blob read error`);
    } else {
      const blobData = await blobRes.json();
      const existing = blobData.projects || [];
      const existingHandles = new Set(
        existing.map((p: any) => p.handle).filter(Boolean)
      );
      const existingNames = new Set(
        existing.map((p: any) => p.name.toLowerCase())
      );

      // Try fetching arc.io
      try {
        const arcRes = await fetch('https://arc.io', {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(15000),
        });

        if (arcRes.ok) {
          const text = await arcRes.text();
          const handleMatches = [...text.matchAll(/@(\w{4,})/g)].map((m) =>
            m[1].toLowerCase()
          );

          let discovered: any[] = [];

          for (const handle of handleMatches) {
            if (
              handle.length > 3 &&
              !KNOWN_HANDLES.includes(handle) &&
              !existingHandles.has(handle) &&
              !['http', 'https', 'twitter', 'xcom'].includes(handle)
            ) {
              const projectName =
                handle.charAt(0).toUpperCase() + handle.slice(1);
              const alreadyFound = discovered.some(
                (p) =>
                  p.handle === handle ||
                  existingNames.has(projectName.toLowerCase())
              );
              if (!alreadyFound) {
                discovered.push({
                  id: `scanned-${handle}-${Date.now()}`,
                  name: projectName,
                  handle,
                  description:
                    'Arc ecosystem project discovered via automated scan.',
                  category: 'community',
                  twitter: `https://x.com/${handle}`,
                  status: 'building',
                  tags: ['auto-scanned'],
                  submitted: true,
                  submittedAt: new Date().toISOString().split('T')[0],
                });
              }
            }
          }

          results.push(`Scan found ${discovered.length} new projects`);

          if (discovered.length > 0) {
            const updated = [...existing, ...discovered];

            const saveRes = await fetch(JSONBLOB_URL, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify({
                id: 'arc-ecosystem-submissions',
                version: Date.now(),
                projects: updated,
                lastScan: new Date().toISOString(),
              }),
            });

            if (saveRes.ok) {
              newProjectCount = discovered.length;
              results.push(`Saved ${discovered.length} new projects`);
              log.push(
                `New projects: ${discovered.map((p) => p.handle).join(', ')}`
              );
            } else {
              results.push(`Save failed: ${saveRes.status}`);
            }
          }
        } else {
          results.push(`Scan: arc.io returned ${arcRes.status}`);
        }
      } catch (e: any) {
        results.push(`Scan fetch error: ${e.message}`);
      }
    }
  } catch (e: any) {
    results.push(`Scan error: ${e.message}`);
  }

  return NextResponse.json({
    status: 'ok',
    results,
    newProjects: newProjectCount,
    log,
    timestamp: new Date().toISOString(),
  });
}
