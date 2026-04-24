export interface RoadmapIssue {
  number: number;
  title: string;
  url: string;
  body: string;
}

const REPO = 'SoapyRED/freighttools';

export async function getRoadmapIssues(label: 'roadmap-in-progress' | 'roadmap-next'): Promise<RoadmapIssue[]> {
  const url = `https://api.github.com/repos/${REPO}/issues?state=open&labels=${label}&per_page=50`;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'freightutils-roadmap',
  };
  if (process.env.GITHUB_TOKEN) headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;

  try {
    const res = await fetch(url, { headers, next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error('[roadmap] GitHub API', res.status, await res.text().catch(() => ''));
      return [];
    }
    const data = await res.json() as Array<{
      number: number; title: string; html_url: string; body: string | null; pull_request?: unknown;
    }>;
    return data
      .filter(i => !i.pull_request)
      .map(i => ({ number: i.number, title: i.title, url: i.html_url, body: i.body || '' }));
  } catch (err) {
    console.error('[roadmap] fetch failed', err);
    return [];
  }
}
