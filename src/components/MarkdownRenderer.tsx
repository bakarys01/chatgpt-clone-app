"use client";

import React, { useState, useEffect } from 'react';
import CodeHighlighter from './CodeHighlighter';

interface CodeBlockProps {
  children: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, language }) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  return (
    <div className="relative group mb-4">
      {/* Header du bloc de code */}
      <div className="flex items-center justify-between bg-gray-800 text-gray-300 px-4 py-2 rounded-t-lg text-sm">
        <span className="font-medium">{language || 'text'}</span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-700 rounded transition-colors"
          title="Copier le code"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Copié!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copier
            </>
          )}
        </button>
      </div>
      
      {/* Code avec coloration syntaxique */}
      <CodeHighlighter
        code={children}
        language={language}
      />
    </div>
  );
};

const InlineCode: React.FC<{ children: string }> = ({ children }) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  return (
    <span className="group relative inline-block">
      <code 
        className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        onClick={copyToClipboard}
        title="Cliquer pour copier"
      >
        {children}
      </code>
      {copied && (
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded">
          Copié!
        </span>
      )}
    </span>
  );
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Fonction de rendu Markdown améliorée
const renderMarkdown = (content: string) => {
  // Traiter les blocs de code d'abord
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  let processedContent = content;
  const codeBlocks: { id: string; component: JSX.Element }[] = [];
  
  // Extraire les blocs de code
  let match;
  let blockIndex = 0;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const [fullMatch, language, code] = match;
    const blockId = `__CODE_BLOCK_${blockIndex}__`;
    const codeComponent = (
      <CodeBlock key={blockIndex} language={language || 'text'}>
        {code.trim()}
      </CodeBlock>
    );
    codeBlocks.push({ id: blockId, component: codeComponent });
    processedContent = processedContent.replace(fullMatch, blockId);
    blockIndex++;
  }
  
  // Traiter le reste du markdown
  let htmlContent = processedContent
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-5 mb-3 text-gray-900">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4 text-gray-900 border-b border-gray-200 pb-2">$1</h1>')
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>')
    // Inline code
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800 cursor-pointer hover:bg-gray-200 transition-colors" onclick="navigator.clipboard.writeText(\'$1\')" title="Cliquer pour copier">$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-green-600 underline hover:text-green-800 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>')
    // Lists
    .replace(/^\* (.+$)/gim, '<li class="ml-4 mb-1 text-gray-800">• $1</li>')
    .replace(/^- (.+$)/gim, '<li class="ml-4 mb-1 text-gray-800">• $1</li>')
    .replace(/^(\d+)\. (.+$)/gim, '<li class="ml-4 mb-1 text-gray-800">$1. $2</li>')
    // Blockquotes
    .replace(/^> (.+$)/gim, '<blockquote class="border-l-4 border-green-500 pl-4 my-4 italic text-gray-700 bg-green-50 py-2 rounded-r">$1</blockquote>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-4 text-gray-800">')
    .replace(/\n/g, '<br>');

  // Wrapper les paragraphes
  if (!htmlContent.startsWith('<')) {
    htmlContent = `<p class="mb-4 text-gray-800">${htmlContent}</p>`;
  }

  return { htmlContent, codeBlocks };
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = "" 
}) => {
  const [renderedContent, setRenderedContent] = useState<{
    htmlContent: string;
    codeBlocks: { id: string; component: JSX.Element }[];
  }>({ htmlContent: '', codeBlocks: [] });

  useEffect(() => {
    const result = renderMarkdown(content);
    setRenderedContent(result);
  }, [content]);

  const renderWithCodeBlocks = () => {
    let { htmlContent, codeBlocks } = renderedContent;
    const parts = [];
    let lastIndex = 0;

    // Remplacer les placeholders par les composants de code
    codeBlocks.forEach(({ id, component }) => {
      const index = htmlContent.indexOf(id);
      if (index !== -1) {
        // Ajouter le HTML avant le bloc de code
        if (index > lastIndex) {
          const htmlPart = htmlContent.substring(lastIndex, index);
          parts.push(
            <div 
              key={`html-${lastIndex}`}
              dangerouslySetInnerHTML={{ __html: htmlPart }}
            />
          );
        }
        // Ajouter le composant de code
        parts.push(component);
        lastIndex = index + id.length;
      }
    });

    // Ajouter le HTML restant
    if (lastIndex < htmlContent.length) {
      const remainingHtml = htmlContent.substring(lastIndex);
      parts.push(
        <div 
          key={`html-${lastIndex}`}
          dangerouslySetInnerHTML={{ __html: remainingHtml }}
        />
      );
    }

    return parts;
  };

  return (
    <div className={`markdown-content ${className}`}>
      {renderedContent.codeBlocks.length > 0 ? (
        <div>{renderWithCodeBlocks()}</div>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: renderedContent.htmlContent }} />
      )}
    </div>
  );
};

export default MarkdownRenderer;