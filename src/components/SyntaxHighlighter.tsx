"use client";

import React, { useEffect, useState } from 'react';

interface SyntaxHighlighterProps {
  code: string;
  language: string;
  className?: string;
}

const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({ 
  code, 
  language, 
  className = "" 
}) => {
  const [highlightedCode, setHighlightedCode] = useState<string>('');
  const [prism, setPrism] = useState<any>(null);

  useEffect(() => {
    const loadPrism = async () => {
      try {
        // Import dynamique de Prism pour éviter les problèmes SSR
        const Prism = (await import('prismjs')).default;
        
        // Import des composants de base
        await import('prismjs/components/prism-core');
        
        // Import des langages courants
        const languageMap: { [key: string]: () => Promise<any> } = {
          javascript: () => import('prismjs/components/prism-javascript'),
          typescript: () => import('prismjs/components/prism-typescript'),
          jsx: () => import('prismjs/components/prism-jsx'),
          tsx: () => import('prismjs/components/prism-tsx'),
          python: () => import('prismjs/components/prism-python'),
          java: () => import('prismjs/components/prism-java'),
          csharp: () => import('prismjs/components/prism-csharp'),
          cpp: () => import('prismjs/components/prism-cpp'),
          c: () => import('prismjs/components/prism-c'),
          php: () => import('prismjs/components/prism-php'),
          ruby: () => import('prismjs/components/prism-ruby'),
          go: () => import('prismjs/components/prism-go'),
          rust: () => import('prismjs/components/prism-rust'),
          swift: () => import('prismjs/components/prism-swift'),
          kotlin: () => import('prismjs/components/prism-kotlin'),
          scala: () => import('prismjs/components/prism-scala'),
          css: () => import('prismjs/components/prism-css'),
          scss: () => import('prismjs/components/prism-scss'),
          sass: () => import('prismjs/components/prism-sass'),
          html: () => import('prismjs/components/prism-markup'),
          xml: () => import('prismjs/components/prism-markup'),
          json: () => import('prismjs/components/prism-json'),
          yaml: () => import('prismjs/components/prism-yaml'),
          sql: () => import('prismjs/components/prism-sql'),
          bash: () => import('prismjs/components/prism-bash'),
          shell: () => import('prismjs/components/prism-bash'),
          powershell: () => import('prismjs/components/prism-powershell'),
          dockerfile: () => import('prismjs/components/prism-docker'),
          markdown: () => import('prismjs/components/prism-markdown'),
        };

        // Charger le langage spécifique
        const normalizedLang = language.toLowerCase();
        if (languageMap[normalizedLang]) {
          try {
            await languageMap[normalizedLang]();
          } catch (err) {
            console.warn(`Failed to load language: ${normalizedLang}`);
          }
        }

        setPrism(Prism);
      } catch (error) {
        console.error('Error loading Prism:', error);
        setPrism(null);
      }
    };

    loadPrism();
  }, [language]);

  useEffect(() => {
    if (prism && code) {
      try {
        const normalizedLang = language.toLowerCase();
        
        // Vérifier si le langage est supporté
        if (prism.languages[normalizedLang]) {
          const highlighted = prism.highlight(code, prism.languages[normalizedLang], normalizedLang);
          setHighlightedCode(highlighted);
        } else {
          // Fallback vers un langage de base ou texte brut
          const fallbackLang = getFallbackLanguage(normalizedLang);
          if (fallbackLang && prism.languages[fallbackLang]) {
            const highlighted = prism.highlight(code, prism.languages[fallbackLang], fallbackLang);
            setHighlightedCode(highlighted);
          } else {
            setHighlightedCode(escapeHtml(code));
          }
        }
      } catch (error) {
        console.warn('Prism highlighting failed:', error);
        setHighlightedCode(escapeHtml(code));
      }
    } else {
      setHighlightedCode(escapeHtml(code));
    }
  }, [prism, code, language]);

  const getFallbackLanguage = (lang: string): string | null => {
    const fallbacks: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'sh': 'bash',
      'yml': 'yaml',
      'htm': 'html',
      'cs': 'csharp',
      'cpp': 'cpp',
      'c++': 'cpp',
      'rb': 'ruby',
      'rs': 'rust',
    };
    return fallbacks[lang] || null;
  };

  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  return (
    <pre className={`language-${language} ${className}`} style={codeStyles.pre}>
      <code 
        className={`language-${language}`}
        style={codeStyles.code}
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    </pre>
  );
};

// Styles de coloration personnalisés (thème sombre inspiré de VS Code)
const codeStyles = {
  pre: {
    background: '#1e1e1e',
    color: '#d4d4d4',
    padding: '16px',
    borderRadius: '0 0 8px 8px',
    overflow: 'auto',
    fontSize: '14px',
    lineHeight: '1.5',
    fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", Consolas, "Courier New", monospace',
    margin: 0,
  } as React.CSSProperties,
  code: {
    background: 'transparent',
    color: 'inherit',
    fontSize: 'inherit',
    fontFamily: 'inherit',
  } as React.CSSProperties,
};

export default SyntaxHighlighter;