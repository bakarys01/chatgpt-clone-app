"use client";

import { useEffect, useRef, useState } from 'react';
import { useChat, Message } from 'ai/react';
import VoiceRecorder from './VoiceRecorder';
import TextToSpeech from './TextToSpeech';

// Enhanced markdown rendering function
const renderMarkdown = (content: string) => {
  return content
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Code
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">$1</a>')
    // Lists
    .replace(/^\* (.+$)/gim, '<li class="ml-4">• $1</li>')
    .replace(/^- (.+$)/gim, '<li class="ml-4">• $1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, '<br>');
};

export interface ChatInterfaceProps {
  chatId: string;
  model: string;
  context?: string;
  onConversationUpdate?: (updates: { messageCount?: number; name?: string }) => void;
  userMemory?: {
    preferences: Record<string, any>;
    facts: string[];
    topics: string[];
    lastUpdated: number;
  };
}

export default function ChatInterface({ 
  chatId, 
  model, 
  context, 
  onConversationUpdate,
  userMemory 
}: ChatInterfaceProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setMessages,
    setInput,
    append,
  } = useChat({ api: '/api/chat', id: chatId, body: { model, context } });

  // State for additional features
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  // Update conversation metadata when messages change
  useEffect(() => {
    if (onConversationUpdate && messages.length > 0) {
      const firstUserMessage = messages.find(m => m.role === 'user');
      const shouldUpdateName = firstUserMessage && messages.length <= 2;
      
      onConversationUpdate({
        messageCount: messages.length,
        ...(shouldUpdateName && {
          name: firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
        })
      });
    }
  }, [messages, onConversationUpdate]);

  const clearConversation = () => {
    setMessages([]);
    setInput('');
    setUploadedFiles([]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      const fileId = `${file.name}-${Date.now()}`;
      
      const initialFile = Object.assign(file, {
        id: fileId,
        processing: true,
        extractedText: '',
        fileCategory: 'unknown',
      });
      setUploadedFiles(prev => [...prev, initialFile]);
      setProcessingFiles(prev => new Set([...prev, fileId]));
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileId ? {
              ...f,
              processing: false,
              extractedText: data.text,
              fileCategory: data.fileCategory,
              base64Data: data.base64Data,
            } : f
          ));
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, processing: false, error: true, errorMessage: errorData.error } : f
          ));
        }
      } catch (error) {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, processing: false, error: true } : f
        ));
      } finally {
        setProcessingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBrowseWeb = async (query: string) => {
    setIsBrowsing(true);
    try {
      const response = await fetch('/api/browse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json();
        append({
          role: 'assistant',
          content: `🌐 **Web Search Results for "${query}"**\n\n${data.summary}\n\n**Sources:**\n${data.sources.map((s: any, i: number) => `[${i+1}] [${s.title}](${s.url})`).join('\n')}`,
        });
      }
    } catch (error) {
      console.error('Browsing error:', error);
    } finally {
      setIsBrowsing(false);
    }
  };

  const handleEnhancedSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim() && uploadedFiles.length === 0) return;
    
    const browsingKeywords = ['search for', 'browse', 'find information about', 'latest news', 'current', 'recent'];
    const containsBrowsingKeyword = browsingKeywords.some(keyword => 
      input.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const containsUrl = /https?:\/\/[^\s]+/.test(input);
    
    if (containsBrowsingKeyword || containsUrl) {
      await handleBrowseWeb(input);
      setInput('');
      return;
    }

    let messageContent = input.trim();
    const attachments = [];
    
    if (uploadedFiles.length > 0) {
      const fileContents = uploadedFiles.map((file: any) => {
        if (file.extractedText) {
          return `[Fichier: ${file.name}]\n${file.extractedText}`;
        } else if (file.fileCategory === 'image') {
          return `[Image: ${file.name}]`;
        } else {
          return `[Fichier: ${file.name}] (contenu non extrait)`;
        }
      }).filter(Boolean);
      
      if (fileContents.length > 0) {
        attachments.push(...fileContents);
      }
    }
    
    if (context && context.trim()) {
      attachments.push(`[Sources sélectionnées]\n${context.trim()}`);
    }
    
    if (attachments.length > 0) {
      messageContent = messageContent 
        ? `${messageContent}\n\n--- Contexte ---\n${attachments.join('\n\n')}`
        : `--- Contexte ---\n${attachments.join('\n\n')}`;
    }
    
    if (messageContent) {
      append({
        role: 'user',
        content: messageContent,
      });
      
      setInput('');
      setUploadedFiles([]);
    }
  };

  const handleVoiceTranscription = (text: string) => {
    setInput(text);
  };

  const handleVoiceError = (error: string) => {
    console.error('Voice error:', error);
  };

  const renderMessageContent = (message: Message) => {
    const imageRegex = /!\[.*?\]\((.*?)\)|https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/gi;
    const images = [...message.content.matchAll(imageRegex)];
    
    return (
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {images.length > 0 ? (
              <div className="space-y-2">
                <div 
                  className="prose prose-sm max-w-none leading-relaxed text-gray-800"
                  dangerouslySetInnerHTML={{ __html: `<p class="mb-2">${renderMarkdown(message.content)}</p>` }}
                />
                {images.map((match, index) => {
                  const imageUrl = match[1] || match[0];
                  return (
                    <img
                      key={index}
                      src={imageUrl}
                      alt="Generated or uploaded image"
                      className="max-w-sm rounded-lg shadow-sm"
                      loading="lazy"
                    />
                  );
                })}
              </div>
            ) : (
              <div 
                className="prose prose-sm max-w-none leading-relaxed text-gray-800"
                dangerouslySetInnerHTML={{ __html: `<p class="mb-2">${renderMarkdown(message.content)}</p>` }}
              />
            )}
          </div>
          
          {message.role === 'assistant' && (
            <div className="ml-2 flex-shrink-0">
              <TextToSpeech text={message.content} />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="chat-main">
      {/* Messages Area - Full Width */}
      <div
        ref={messagesEndRef}
        className="messages-container"
      >
        {messages.length === 0 ? (
          // Welcome Screen
          <div className="flex flex-col items-center justify-center h-full text-center" style={{ padding: '3rem 1rem' }}>
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a .7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a .0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a .0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a .79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142.0852-4.7735 2.7818a .7759.7759 0 0 0-.3927.6813v6.7369l-2.0201-1.1685a .071.071 0 0 1-.038-.052V10.657A4.493 4.493 0 0 1 18.9471 8.6597zm-14.49 5.15a .7709.7709 0 0 0 .38-.659V6.4664l2.0201 1.1685a .071.071 0 0 1 .038.052v5.5826l-4.8303 2.7865a .079.079 0 0 1-.038-.0043c-.0447-.0462-.0749-.1239-.1749-.1239zm1.497-1.6617a .7312.7312 0 0 0-.38-.659l5.5832-3.2425a .0757.0757 0 0 1 .071 0l5.5832 3.2425a .7293.7293 0 0 0-.38.659v6.4664l-5.2022-3.0086-5.2022-3.0084z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Comment puis-je vous aider aujourd'hui ?</h2>
            <p className="text-gray-600 max-w-md">
              Commencez une conversation, uploadez un fichier, ou demandez-moi de rechercher quelque chose sur le web.
            </p>
          </div>
        ) : (
          // Messages
          <div className="w-full">
            {messages.map((message: Message) => (
              <div key={message.id} className={`message-wrapper ${message.role}`}>
                <div className="message-content">
                  <div className={`message-avatar ${message.role}`}>
                    {message.role === 'user' ? (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a .7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a .0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a .0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a .79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142.0852-4.7735 2.7818a .7759.7759 0 0 0-.3927.6813v6.7369l-2.0201-1.1685a .071.071 0 0 1-.038-.052V10.657A4.493 4.493 0 0 1 18.9471 8.6597zm-14.49 5.15a .7709.7709 0 0 0 .38-.659V6.4664l2.0201 1.1685a .071.071 0 0 1 .038.052v5.5826l-4.8303 2.7865a .079.079 0 0 1-.038-.0043c-.0447-.0462-.0749-.1239-.1749-.1239zm1.497-1.6617a .7312.7312 0 0 0-.38-.659l5.5832-3.2425a .0757.0757 0 0 1 .071 0l5.5832 3.2425a .7293.7293 0 0 0-.38.659v6.4664l-5.2022-3.0086-5.2022-3.0084z"/>
                      </svg>
                    )}
                  </div>
                  <div className="message-text">
                    {renderMessageContent(message)}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {(isLoading || isBrowsing) && (
              <div className="message-wrapper assistant">
                <div className="message-content">
                  <div className="message-avatar assistant">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a .7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a .0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a .0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a .79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142.0852-4.7735 2.7818a .7759.7759 0 0 0-.3927.6813v6.7369l-2.0201-1.1685a .071.071 0 0 1-.038-.052V10.657A4.493 4.493 0 0 1 18.9471 8.6597zm-14.49 5.15a .7709.7709 0 0 0 .38-.659V6.4664l2.0201 1.1685a .071.071 0 0 1 .038.052v5.5826l-4.8303 2.7865a .079.079 0 0 1-.038-.0043c-.0447-.0462-.0749-.1239-.1749-.1239zm1.497-1.6617a .7312.7312 0 0 0-.38-.659l5.5832-3.2425a .0757.0757 0 0 1 .071 0l5.5832 3.2425a .7293.7293 0 0 0-.38.659v6.4664l-5.2022-3.0086-5.2022-3.0084z"/>
                    </svg>
                  </div>
                  <div className="message-text flex items-center">
                    {isBrowsing && <span className="text-sm mr-3">🌐 Recherche en cours...</span>}
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="error-message" style={{ margin: '1rem', marginBottom: '0' }}>
          {error.message}
        </div>
      )}

      {/* File upload preview */}
      {uploadedFiles.length > 0 && (
        <div className="file-upload-area" style={{ margin: '1rem', marginBottom: '0' }}>
          <div className="flex flex-wrap gap-3">
            {uploadedFiles.map((file, index) => (
              <div key={file.id || index} className="flex items-center bg-white rounded-lg px-3 py-2 border border-blue-200 shadow-sm">
                <div className="flex items-center mr-3">
                  {file.processing ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-sm text-blue-600 font-medium">Processing...</span>
                    </div>
                  ) : file.error ? (
                    <span className="text-sm text-red-600 font-medium" title={file.errorMessage || 'Processing error'}>
                      ❌ Error
                    </span>
                  ) : file.extractedText ? (
                    <span className="text-sm text-green-600 font-medium" title={`${file.extractedText.length} characters extracted`}>
                      ✅ Ready
                    </span>
                  ) : (
                    <span className="text-sm text-gray-600">📎</span>
                  )}
                  <span className="text-sm text-gray-700 ml-2 font-medium">{file.name}</span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-500 font-bold transition-colors"
                  disabled={file.processing}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {uploadedFiles.some(f => f.extractedText) && (
            <div className="success-message mt-3">
              ✅ Files processed and ready for analysis
            </div>
          )}
        </div>
      )}

      {/* Input area */}
      <div className="input-area">
        <form onSubmit={handleEnhancedSubmit}>
          <div className="input-container">
            <textarea
              className="input-field"
              placeholder={
                uploadedFiles.length > 0 
                  ? `Message about the ${uploadedFiles.length} attached file(s)...`
                  : context && context.trim()
                    ? "Your message with selected sources..."
                    : "Tapez votre message..."
              }
              value={input}
              onChange={handleInputChange}
              rows={1}
              maxLength={2000}
              disabled={isLoading || isBrowsing}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleEnhancedSubmit(e as any);
                }
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 160) + 'px';
              }}
            />
            
            {/* Action buttons */}
            <div className="input-actions">
              {/* File upload */}
              <label className="input-button">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.txt,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isLoading || isBrowsing}
                />
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </label>
              
              {/* Voice recorder */}
              <VoiceRecorder 
                onTranscription={handleVoiceTranscription}
                onError={handleVoiceError}
              />
              
              {/* Send button */}
              <button
                type="submit"
                disabled={!input.trim() || isLoading || isBrowsing}
                className={`input-button ${(!input.trim() || isLoading || isBrowsing) ? '' : 'send'}`}
              >
                {isLoading || isBrowsing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Footer info */}
          <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>{input.length} / 2000</span>
              {uploadedFiles.length > 0 && (
                <span>📎 {uploadedFiles.length} file(s)</span>
              )}
            </div>
            <button
              type="button"
              onClick={clearConversation}
              className="text-gray-400 hover:text-red-500 underline transition-colors disabled:text-gray-300"
              disabled={messages.length === 0 && !input && uploadedFiles.length === 0}
            >
              Clear conversation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}