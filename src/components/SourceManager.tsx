"use client";

import { useState, ChangeEvent, FormEvent } from 'react';

/**
 * A single source represents a piece of text that can be injected into
 * the prompt for Retrieval‑Augmented Generation (RAG). Sources can come
 * from uploaded documents or web search results. Each source has an id,
 * a human‑readable name, the extracted text and an optional embedding.
 */
export interface SourceItem {
  id: string;
  name: string;
  text: string;
  embedding?: number[];
}

export interface SourceManagerProps {
  sources: SourceItem[];
  setSources: (sources: SourceItem[]) => void;
  selectedSourceIds: string[];
  setSelectedSourceIds: (ids: string[]) => void;
}

/**
 * SourceManager allows users to upload PDF documents, perform a simple
 * web search and select which sources should be included in the next
 * conversation prompt. It lives in the sidebar of the chat application.
 */
export default function SourceManager({
  sources,
  setSources,
  selectedSourceIds,
  setSelectedSourceIds,
}: SourceManagerProps) {
  // Local state for search input and results
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SourceItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handle file uploads: send the selected PDF to the API route,
  // extract text and optionally compute an embedding, then append
  // the result to the list of sources.
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        console.error('Upload failed', await res.text());
        return;
      }
      const data = await res.json();
      const id = crypto.randomUUID();
      const newSource: SourceItem = {
        id,
        name: file.name,
        text: data.text,
        embedding: data.embedding || undefined,
      };
      setSources([...sources, newSource]);
      // Clear the input value so the same file can be uploaded again
      e.target.value = '';
    } catch (err) {
      console.error('Error uploading file:', err);
    }
  };

  // Perform a search using the /api/search endpoint. Extract titles and
  // snippets from the returned JSON and expose them as potential sources.
  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) {
        console.error('Search failed', await res.text());
        setIsSearching(false);
        return;
      }
      const data = await res.json();
      const results: SourceItem[] = [];
      // DuckDuckGo returns results in `RelatedTopics` and `Results` arrays.
      const addItem = (title: string, text: string) => {
        results.push({ id: crypto.randomUUID(), name: title, text });
      };
      if (Array.isArray(data.RelatedTopics)) {
        data.RelatedTopics.forEach((item: any) => {
          if (item.Text && item.FirstURL) {
            addItem(item.Text, `${item.Text}\n${item.FirstURL}`);
          } else if (Array.isArray(item.Topics)) {
            item.Topics.forEach((sub: any) => {
              if (sub.Text && sub.FirstURL) {
                addItem(sub.Text, `${sub.Text}\n${sub.FirstURL}`);
              }
            });
          }
        });
      }
      if (Array.isArray(data.Results)) {
        data.Results.forEach((item: any) => {
          if (item.Text && item.FirstURL) {
            addItem(item.Text, `${item.Text}\n${item.FirstURL}`);
          }
        });
      }
      setSearchResults(results);
    } catch (err) {
      console.error('Error performing search:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Toggle whether a source is selected. Selected sources will be sent as
  // context to the API when generating a response.
  const toggleSource = (id: string) => {
    if (selectedSourceIds.includes(id)) {
      setSelectedSourceIds(selectedSourceIds.filter((sid) => sid !== id));
    } else {
      setSelectedSourceIds([...selectedSourceIds, id]);
    }
  };

  // Add a search result to the persistent sources list.
  const addSearchResult = (item: SourceItem) => {
    setSources([...sources, item]);
    // also select the new source by default
    setSelectedSourceIds([...selectedSourceIds, item.id]);
    // clear search results
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className="p-4 border-t border-gray-200 space-y-4 text-sm">
      <h4 className="font-medium mb-2">Sources</h4>
      {/* File upload */}
      <div>
        <label className="block mb-1" htmlFor="fileUpload">
          Upload PDF
        </label>
        <input
          id="fileUpload"
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          className="block w-full text-sm"
        />
      </div>
      {/* Search */}
      <form onSubmit={handleSearch} className="space-y-2">
        <label className="block" htmlFor="searchInput">
          Web Search
        </label>
        <div className="flex gap-2">
          <input
            id="searchInput"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-1 border border-gray-300 rounded"
            placeholder="Enter a query..."
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-2 py-1 bg-primary text-white rounded disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      {/* Search results: allow adding as sources */}
      {searchResults.length > 0 && (
        <div className="border border-gray-300 rounded p-2 space-y-1 max-h-40 overflow-y-auto bg-white">
          <p className="font-semibold mb-1">Search Results</p>
          {searchResults.map((res) => (
            <div key={res.id} className="flex justify-between items-center gap-2 border-b last:border-b-0 py-1">
              <span className="flex-1 text-xs truncate" title={res.name}>{res.name}</span>
              <button
                className="text-xs text-primary underline"
                onClick={() => addSearchResult(res)}
              >
                Add
              </button>
            </div>
          ))}
        </div>
      )}
      {/* List of uploaded/added sources with checkboxes */}
      {sources.length > 0 && (
        <div className="space-y-1">
          <p className="font-semibold">Saved Sources</p>
          {sources.map((src) => (
            <label
              key={src.id}
              className="flex items-start gap-2 cursor-pointer text-xs"
            >
              <input
                type="checkbox"
                className="mt-0.5"
                checked={selectedSourceIds.includes(src.id)}
                onChange={() => toggleSource(src.id)}
              />
              <span className="truncate flex-1" title={src.name}>{src.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}