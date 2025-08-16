"use client";

import { useState, useRef, useEffect } from 'react';
import { saveAs } from 'file-saver';

interface CanvasProps {
  initialContent?: string;
  initialType?: 'document' | 'code' | 'html';
  onContentChange?: (content: string) => void;
  onClose?: () => void;
}

interface CanvasDocument {
  id: string;
  title: string;
  type: 'document' | 'code' | 'html';
  content: string;
  lastModified: number;
}

export default function Canvas({ 
  initialContent = '', 
  initialType = 'document', 
  onContentChange,
  onClose 
}: CanvasProps) {
  const [content, setContent] = useState(initialContent);
  const [documentType, setDocumentType] = useState(initialType);
  const [title, setTitle] = useState('Untitled Document');
  const [isEditing, setIsEditing] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [savedDocuments, setSavedDocuments] = useState<CanvasDocument[]>([]);
  const [showDocumentList, setShowDocumentList] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Load saved documents from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('canvasDocuments');
    if (saved) {
      try {
        setSavedDocuments(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved documents:', error);
      }
    }
  }, []);

  // Save documents to localStorage
  useEffect(() => {
    localStorage.setItem('canvasDocuments', JSON.stringify(savedDocuments));
  }, [savedDocuments]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (onContentChange) {
      onContentChange(newContent);
    }
  };

  const saveDocument = () => {
    const doc: CanvasDocument = {
      id: crypto.randomUUID(),
      title,
      type: documentType,
      content,
      lastModified: Date.now(),
    };
    setSavedDocuments(prev => [doc, ...prev.filter(d => d.title !== title)]);
  };

  const loadDocument = (doc: CanvasDocument) => {
    setTitle(doc.title);
    setDocumentType(doc.type);
    setContent(doc.content);
    setShowDocumentList(false);
  };

  const deleteDocument = (docId: string) => {
    setSavedDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const downloadDocument = () => {
    const blob = new Blob([content], { type: getFileType() });
    const filename = `${title}.${getFileExtension()}`;
    saveAs(blob, filename);
  };

  const getFileType = () => {
    switch (documentType) {
      case 'html': return 'text/html';
      case 'code': return 'text/plain';
      default: return 'text/markdown';
    }
  };

  const getFileExtension = () => {
    switch (documentType) {
      case 'html': return 'html';
      case 'code': return 'txt';
      default: return 'md';
    }
  };

  const renderPreview = () => {
    switch (documentType) {
      case 'html':
        return (
          <iframe
            ref={previewRef}
            srcDoc={content}
            className="w-full h-full border-none"
            title="HTML Preview"
          />
        );
      case 'code':
        return (
          <pre className="p-4 bg-gray-100 text-sm font-mono overflow-auto h-full whitespace-pre-wrap">
            {content}
          </pre>
        );
      default:
        // Simple markdown rendering
        return (
          <div 
            className="p-4 prose prose-sm max-w-none h-full overflow-auto"
            dangerouslySetInnerHTML={{ 
              __html: content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>')
            }}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-[95vw] h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:bg-gray-50 px-2 py-1 rounded"
            />
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="document">📄 Document</option>
              <option value="code">💻 Code</option>
              <option value="html">🌐 HTML</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDocumentList(!showDocumentList)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              📁 Documents
            </button>
            <button
              onClick={saveDocument}
              className="px-3 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors"
            >
              💾 Save
            </button>
            <button
              onClick={downloadDocument}
              className="px-3 py-1 text-sm bg-green-500 text-white hover:bg-green-600 rounded transition-colors"
            >
              📥 Download
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm bg-red-500 text-white hover:bg-red-600 rounded transition-colors"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Document List Sidebar */}
        {showDocumentList && (
          <div className="absolute left-0 top-16 w-80 bg-white border-r border-gray-200 h-full z-10 shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold">Saved Documents</h3>
            </div>
            <div className="overflow-y-auto h-full">
              {savedDocuments.map((doc) => (
                <div key={doc.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => loadDocument(doc)}>
                      <h4 className="font-medium text-sm">{doc.title}</h4>
                      <p className="text-xs text-gray-500">
                        {doc.type} • {new Date(doc.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="text-red-500 hover:text-red-700 text-xs ml-2"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              {savedDocuments.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No saved documents
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Editor */}
          <div className="flex-1 flex flex-col border-r border-gray-200">
            <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
              <span className="text-sm font-medium">Editor</span>
              <div className="flex items-center space-x-2">
                <label className="text-xs">Font Size:</label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-16"
                />
                <span className="text-xs w-8">{fontSize}px</span>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={`Start typing your ${documentType}...`}
              className="flex-1 p-4 resize-none border-none focus:outline-none font-mono"
              style={{ fontSize: `${fontSize}px` }}
            />
          </div>

          {/* Preview */}
          <div className="flex-1 flex flex-col">
            <div className="p-2 border-b border-gray-200 bg-gray-50">
              <span className="text-sm font-medium">Preview</span>
            </div>
            <div className="flex-1 overflow-hidden">
              {renderPreview()}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between p-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
          <div>
            Characters: {content.length} | Lines: {content.split('\n').length}
          </div>
          <div>
            Last saved: {savedDocuments.find(d => d.title === title)?.lastModified 
              ? new Date(savedDocuments.find(d => d.title === title)!.lastModified).toLocaleTimeString()
              : 'Never'}
          </div>
        </div>
      </div>
    </div>
  );
}