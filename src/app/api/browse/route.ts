import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * API route for web browsing and real-time information retrieval
 * Simulates ChatGPT's browsing feature by fetching and summarizing web content
 */
export async function POST(req: Request) {
  try {
    const { query, urls } = await req.json();
    
    if (!query && !urls) {
      return NextResponse.json(
        { error: 'Missing query or URLs' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not set' },
        { status: 500 }
      );
    }

    let searchResults = [];

    // If URLs are provided, fetch those directly
    if (urls && Array.isArray(urls)) {
      for (const url of urls.slice(0, 3)) { // Limit to 3 URLs
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; ChatGPT-Clone/1.0)',
            },
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const content = await response.text();
            // Extract title and first paragraph for summary
            const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
            const title = titleMatch ? titleMatch[1] : url;
            
            // Simple text extraction (in production, you'd want proper HTML parsing)
            const textContent = content
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .substring(0, 2000);

            searchResults.push({
              title,
              url,
              content: textContent,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error(`Error fetching ${url}:`, error);
        }
      }
    } else if (query) {
      // Perform web search using DuckDuckGo Instant Answer API
      try {
        const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
        const response = await fetch(searchUrl);
        
        if (response.ok) {
          const data = await response.json();
          
          // Extract relevant information from DuckDuckGo response
          if (data.Abstract) {
            searchResults.push({
              title: data.Heading || 'Search Result',
              url: data.AbstractURL || '',
              content: data.Abstract,
              source: data.AbstractSource || 'DuckDuckGo',
              timestamp: new Date().toISOString(),
            });
          }

          // Add related topics
          if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
            data.RelatedTopics.slice(0, 3).forEach((topic: any) => {
              if (topic.Text && topic.FirstURL) {
                searchResults.push({
                  title: topic.Text.substring(0, 100),
                  url: topic.FirstURL,
                  content: topic.Text,
                  source: 'DuckDuckGo',
                  timestamp: new Date().toISOString(),
                });
              }
            });
          }
        }
      } catch (error) {
        console.error('Search error:', error);
      }
    }

    // If we have search results, summarize them using GPT
    if (searchResults.length > 0) {
      const summaryPrompt = `Please provide a comprehensive summary of the following web search results for the query "${query}":

${searchResults.map((result, index) => 
  `${index + 1}. ${result.title}
  URL: ${result.url}
  Content: ${result.content}
  Source: ${result.source || 'Web'}
  Retrieved: ${result.timestamp}
  
`).join('')}

Please synthesize this information into a clear, informative response with proper citations using [1], [2], etc. format.`;

      const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that summarizes web search results. Always include proper citations and be factual.'
            },
            {
              role: 'user',
              content: summaryPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      if (gptResponse.ok) {
        const gptData = await gptResponse.json();
        return NextResponse.json({
          summary: gptData.choices[0].message.content,
          sources: searchResults,
          query: query,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Fallback response if no results or GPT fails
    return NextResponse.json({
      summary: searchResults.length > 0 
        ? `I found ${searchResults.length} relevant result(s) for "${query}". ` + 
          searchResults.map((r, i) => `[${i+1}] ${r.title}: ${r.content.substring(0, 200)}...`).join(' ')
        : `I couldn't find recent information about "${query}". This might be due to search limitations or the query being too specific.`,
      sources: searchResults,
      query: query,
      timestamp: new Date().toISOString(),
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}