import { NextResponse } from 'next/server';

// This route performs a simple web search by proxying requests to DuckDuckGo.
// It accepts a `q` query parameter and returns a JSON summary of results.
// Because third‑party search engines may block serverless requests, this
// endpoint is provided as a starting point and may require modification
// depending on your chosen search API. For production use, consider
// commercial search APIs like SerpAPI, Google Custom Search or a self‑hosted
// searx instance.
export const runtime = 'edge';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get('q');
  if (!query) {
    return NextResponse.json({ error: 'Missing q parameter' }, { status: 400 });
  }
  try {
    // Call DuckDuckGo's lite JSON API. Note: this API is undocumented and may
    // stop working at any time. Replace with a reliable provider in
    // production. We encode the query and request JSON output.
    const res = await fetch(
      `https://duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ChatGPT-RAG/1.0)',
        },
      }
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: `Search request failed with status ${res.status}` },
        { status: 500 }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}