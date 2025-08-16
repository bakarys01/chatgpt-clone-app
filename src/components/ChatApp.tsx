"use client";

import { useState, useEffect } from 'react';
import ChatInterface from './ChatInterface';
import SourceManager, { SourceItem } from './SourceManager';
import ImageGenerator from './ImageGenerator';
import Canvas from './Canvas';

// Modern model configuration
const AVAILABLE_MODELS = [
  // Latest available models
  { value: 'gpt-4o', label: 'GPT-4o', category: 'flagship', description: 'Most capable multimodal model' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', category: 'flagship', description: 'Fast and efficient' },
  
  // GPT-4 family
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', category: 'general', description: 'High-performance model' },
  { value: 'gpt-4', label: 'GPT-4', category: 'general', description: 'Reliable performance' },
  
  // GPT-3.5 family
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', category: 'efficient', description: 'Fast and cost-effective' },
  
  // Future models (mapped to GPT-4o)
  { value: 'gpt-5', label: 'GPT-5 (Preview)', category: 'preview', description: 'Next-gen (uses GPT-4o)' },
  { value: 'o3', label: 'o3 (Preview)', category: 'preview', description: 'Reasoning (uses GPT-4o)' },
  { value: 'o3-pro', label: 'o3-pro (Preview)', category: 'preview', description: 'Advanced reasoning (uses GPT-4o)' },
  { value: 'o4-mini', label: 'o4-mini (Preview)', category: 'preview', description: 'Fast reasoning (uses GPT-4o)' },
];

interface Conversation {
  id: string;
  name: string;
  model: string;
  lastModified: number;
  messageCount: number;
  summary?: string;
}

interface UserMemory {
  preferences: Record<string, any>;
  facts: string[];
  topics: string[];
  lastUpdated: number;
}

export default function ChatApp() {
  // State management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [model, setModel] = useState<string>('gpt-4o');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'sources' | 'images' | 'canvas'>('chat');
  
  // Memory system
  const [userMemory, setUserMemory] = useState<UserMemory>({
    preferences: {},
    facts: [],
    topics: [],
    lastUpdated: Date.now(),
  });

  // Sources for RAG
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);

  // Canvas state
  const [showCanvas, setShowCanvas] = useState(false);
  const [canvasContent, setCanvasContent] = useState('');
  const [canvasType, setCanvasType] = useState<'document' | 'code' | 'html'>('document');

  // Load data on mount
  useEffect(() => {
    loadConversations();
    loadUserMemory();
    loadSources();
  }, []);

  // Persistence
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('userMemory', JSON.stringify(userMemory));
  }, [userMemory]);

  useEffect(() => {
    localStorage.setItem('sources', JSON.stringify(sources));
  }, [sources]);

  const loadConversations = () => {
    try {
      const saved = localStorage.getItem('conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
        if (parsed.length > 0) {
          setActiveId(parsed[0].id);
        }
      } else {
        initializeDefaultConversation();
      }
    } catch {
      initializeDefaultConversation();
    }
  };

  const loadUserMemory = () => {
    try {
      const saved = localStorage.getItem('userMemory');
      if (saved) {
        setUserMemory(JSON.parse(saved));
      }
    } catch {
      localStorage.removeItem('userMemory');
    }
  };

  const loadSources = () => {
    try {
      const saved = localStorage.getItem('sources');
      if (saved) {
        setSources(JSON.parse(saved));
      }
    } catch {
      localStorage.removeItem('sources');
    }
  };

  const initializeDefaultConversation = () => {
    const id = crypto.randomUUID();
    const defaultConv: Conversation = {
      id,
      name: 'New Chat',
      model: 'gpt-4o',
      lastModified: Date.now(),
      messageCount: 0,
    };
    setConversations([defaultConv]);
    setActiveId(id);
  };

  const handleNewChat = () => {
    const id = crypto.randomUUID();
    const newConv: Conversation = {
      id,
      name: `Chat ${conversations.length + 1}`,
      model,
      lastModified: Date.now(),
      messageCount: 0,
    };
    setConversations([newConv, ...conversations]);
    setActiveId(id);
  };

  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === id 
          ? { ...conv, ...updates, lastModified: Date.now() }
          : conv
      )
    );
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => {
      const filtered = prev.filter(conv => conv.id !== id);
      if (activeId === id && filtered.length > 0) {
        setActiveId(filtered[0].id);
      }
      return filtered;
    });
    localStorage.removeItem(`chat_${id}`);
  };

  const updateUserMemory = (newFacts: string[], newTopics: string[], preferences?: Record<string, any>) => {
    setUserMemory(prev => ({
      preferences: { ...prev.preferences, ...(preferences || {}) },
      facts: [...new Set([...prev.facts, ...newFacts])],
      topics: [...new Set([...prev.topics, ...newTopics])],
      lastUpdated: Date.now(),
    }));
  };

  const handleImageGenerated = (imageUrl: string, prompt: string) => {
    setActiveTab('chat');
  };

  const openCanvas = (content = '', type: 'document' | 'code' | 'html' = 'document') => {
    setCanvasContent(content);
    setCanvasType(type);
    setShowCanvas(true);
  };

  const closeCanvas = () => {
    setShowCanvas(false);
    setCanvasContent('');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'flagship': return '🚀';
      case 'general': return '⚡';
      case 'efficient': return '💰';
      case 'preview': return '🔮';
      default: return '🤖';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142.0852-4.7735 2.7818a.7759.7759 0 0 0-.3927.6813v6.7369l-2.0201-1.1685a.071.071 0 0 1-.038-.052V10.657A4.493 4.493 0 0 1 18.9471 8.6597zm-14.49 5.15a.7709.7709 0 0 0 .38-.659V6.4664l2.0201 1.1685a.071.071 0 0 1 .038.052v5.5826l-4.8303 2.7865a.079.079 0 0 1-.038-.0043c-.0447-.0462-.0749-.1239-.1749-.1239zm1.497-1.6617a.7312.7312 0 0 0-.38-.659l5.5832-3.2425a.0757.0757 0 0 1 .071 0l5.5832 3.2425a.7293.7293 0 0 0-.38.659v6.4664l-5.2022-3.0086-5.2022-3.0084z"/>
                </svg>
              </div>
              <h1 className="text-lg font-semibold text-white">ChatGPT</h1>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d={sidebarCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
          </button>
        </div>

        {/* New Chat Button */}
        {!sidebarCollapsed && (
          <div className="p-3">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-transparent border border-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New chat
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        {!sidebarCollapsed && (
          <div className="px-3 mb-4">
            <div className="flex space-x-1">
              {[
                { id: 'chat', label: 'Chats', icon: '💬' },
                { id: 'sources', label: 'Files', icon: '📁' },
                { id: 'images', label: 'Images', icon: '🎨' },
                { id: 'canvas', label: 'Canvas', icon: '📝' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-sm mb-0.5">{tab.icon}</div>
                    <div>{tab.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Chat List */}
          {activeTab === 'chat' && !sidebarCollapsed && (
            <div className="px-3">
              {conversations
                .sort((a, b) => b.lastModified - a.lastModified)
                .map((conv) => (
                <div
                  key={conv.id}
                  className={`sidebar-item ${conv.id === activeId ? 'active' : ''} group relative mb-2 rounded-lg`}
                >
                  <button
                    onClick={() => setActiveId(conv.id)}
                    className="w-full text-left"
                  >
                    <div className="font-medium truncate text-sm">
                      {conv.name}
                    </div>
                    <div className="text-xs mt-1 opacity-75">
                      {conv.messageCount} messages
                    </div>
                  </button>
                  
                  {/* Actions */}
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newName = prompt('Rename conversation:', conv.name);
                        if (newName?.trim()) {
                          updateConversation(conv.id, { name: newName.trim() });
                        }
                      }}
                      className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors"
                      title="Rename"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this conversation?')) {
                          deleteConversation(conv.id);
                        }
                      }}
                      className="p-1 hover:bg-red-600 rounded text-gray-400 hover:text-white transition-colors"
                      title="Delete"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              
              {conversations.length === 0 && (
                <div className="p-4 text-center text-gray-400 text-sm">
                  No conversations yet
                </div>
              )}
            </div>
          )}

          {/* Sources */}
          {activeTab === 'sources' && !sidebarCollapsed && (
            <div className="h-full p-3">
              <SourceManager
                sources={sources}
                setSources={setSources}
                selectedSourceIds={selectedSourceIds}
                setSelectedSourceIds={setSelectedSourceIds}
              />
            </div>
          )}

          {/* Images */}
          {activeTab === 'images' && !sidebarCollapsed && (
            <div className="h-full p-3">
              <ImageGenerator onImageGenerated={handleImageGenerated} />
            </div>
          )}

          {/* Canvas */}
          {activeTab === 'canvas' && !sidebarCollapsed && (
            <div className="p-3">
              <button
                onClick={() => openCanvas()}
                className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
              >
                <div className="text-2xl mb-2">📝</div>
                <div className="text-sm font-medium">Open Canvas</div>
                <div className="text-xs mt-1">Create documents, code, or HTML</div>
              </button>
            </div>
          )}
        </div>

        {/* Model Selection */}
        {activeTab === 'chat' && !sidebarCollapsed && (
          <div className="p-3 border-t border-gray-700">
            <label className="block mb-2 text-xs font-medium text-gray-300">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded-md text-sm bg-gray-800 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            >
              {Object.entries(
                AVAILABLE_MODELS.reduce((acc, model) => {
                  if (!acc[model.category]) acc[model.category] = [];
                  acc[model.category].push(model);
                  return acc;
                }, {} as Record<string, typeof AVAILABLE_MODELS>)
              ).map(([category, models]) => (
                <optgroup key={category} label={`${getCategoryIcon(category)} ${category.charAt(0).toUpperCase() + category.slice(1)}`}>
                  {models.map((m) => (
                    <option key={m.value} value={m.value} title={m.description}>
                      {m.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1.5 leading-tight">
              {AVAILABLE_MODELS.find(m => m.value === model)?.description}
            </p>
          </div>
        )}
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        {activeId && (
          <ChatInterface
            chatId={activeId}
            model={model}
            context={sources
              .filter((s) => selectedSourceIds.includes(s.id))
              .map((s) => s.text)
              .join('\n\n')}
            onConversationUpdate={(updates) => updateConversation(activeId, updates)}
            userMemory={userMemory}
          />
        )}
      </main>

      {/* Canvas Modal */}
      {showCanvas && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
            <Canvas
              initialContent={canvasContent}
              initialType={canvasType}
              onClose={closeCanvas}
              onContentChange={(content) => setCanvasContent(content)}
            />
          </div>
        </div>
      )}
    </div>
  );
}