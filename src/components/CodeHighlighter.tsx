"use client";

import React, { useEffect, useState } from 'react';

interface CodeHighlighterProps {
  code: string;
  language: string;
}

const CodeHighlighter: React.FC<CodeHighlighterProps> = ({ code, language }) => {
  const [highlightedCode, setHighlightedCode] = useState<string>('');

  useEffect(() => {
    const highlightCode = () => {
      const normalizedLang = language.toLowerCase();
      
      // Fonction de coloration manuelle simple mais efficace
      let processedCode = escapeHtml(code);
      
      switch (normalizedLang) {
        case 'javascript':
        case 'js':
          processedCode = highlightJavaScript(processedCode);
          break;
        case 'typescript':
        case 'ts':
          processedCode = highlightTypeScript(processedCode);
          break;
        case 'jsx':
          processedCode = highlightJSX(processedCode);
          break;
        case 'tsx':
          processedCode = highlightTSX(processedCode);
          break;
        case 'python':
        case 'py':
          processedCode = highlightPython(processedCode);
          break;
        case 'css':
        case 'scss':
        case 'sass':
          processedCode = highlightCSS(processedCode);
          break;
        case 'html':
        case 'xml':
        case 'markup':
          processedCode = highlightHTML(processedCode);
          break;
        case 'json':
          processedCode = highlightJSON(processedCode);
          break;
        case 'bash':
        case 'shell':
        case 'sh':
          processedCode = highlightBash(processedCode);
          break;
        case 'sql':
          processedCode = highlightSQL(processedCode);
          break;
        case 'java':
          processedCode = highlightJava(processedCode);
          break;
        case 'csharp':
        case 'cs':
          processedCode = highlightCSharp(processedCode);
          break;
        case 'php':
          processedCode = highlightPHP(processedCode);
          break;
        default:
          // Code brut avec coloration basique
          processedCode = highlightGeneric(processedCode);
      }
      
      setHighlightedCode(processedCode);
    };

    highlightCode();
  }, [code, language]);

  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const highlightJavaScript = (code: string): string => {
    return code
      // Commentaires
      .replace(/(\/\/.*$)/gm, '<span style="color: #6a9955;">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6a9955;">$1</span>')
      // Chaînes de caractères
      .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color: #ce9178;">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color: #ce9178;">$1</span>')
      .replace(/(`(?:[^`\\]|\\.)*`)/g, '<span style="color: #ce9178;">$1</span>')
      // Mots-clés
      .replace(/\b(const|let|var|function|class|if|else|for|while|do|switch|case|break|continue|return|try|catch|finally|throw|new|this|super|import|export|from|default|async|await|typeof|instanceof)\b/g, '<span style="color: #569cd6;">$1</span>')
      // Nombres
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color: #b5cea8;">$1</span>')
      // Fonctions
      .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, '<span style="color: #dcdcaa;">$1</span>');
  };

  const highlightPython = (code: string): string => {
    return code
      // Commentaires
      .replace(/(#.*$)/gm, '<span style="color: #6a9955;">$1</span>')
      // Docstrings
      .replace(/("""[\s\S]*?""")/g, '<span style="color: #6a9955;">$1</span>')
      .replace(/('''[\s\S]*?''')/g, '<span style="color: #6a9955;">$1</span>')
      // Chaînes de caractères
      .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color: #ce9178;">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color: #ce9178;">$1</span>')
      // Mots-clés Python
      .replace(/\b(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|break|continue|pass|lambda|and|or|not|in|is|None|True|False|self)\b/g, '<span style="color: #ff7b72;">$1</span>')
      // Nombres
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color: #b5cea8;">$1</span>')
      // Fonctions et méthodes
      .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, '<span style="color: #dcdcaa;">$1</span>');
  };

  const highlightCSS = (code: string): string => {
    return code
      // Commentaires
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6a9955;">$1</span>')
      // Sélecteurs
      .replace(/^([^{]+)(?=\s*{)/gm, '<span style="color: #ffa657;">$1</span>')
      // Propriétés
      .replace(/([a-zA-Z-]+)\s*(?=:)/g, '<span style="color: #92c5f7;">$1</span>')
      // Valeurs
      .replace(/:([^;{}]+);/g, ': <span style="color: #ce9178;">$1</span>;')
      // Unités et couleurs
      .replace(/\b(\d+(?:px|em|rem|%|vh|vw|fr))\b/g, '<span style="color: #b5cea8;">$1</span>')
      .replace(/#[0-9a-fA-F]{3,6}\b/g, '<span style="color: #b5cea8;">$&</span>');
  };

  const highlightHTML = (code: string): string => {
    return code
      // Commentaires HTML
      .replace(/(<!--[\s\S]*?-->)/g, '<span style="color: #6a9955;">$1</span>')
      // Balises
      .replace(/(&lt;\/?[^&\s]*?)(\s[^&]*?)?(&gt;)/g, '<span style="color: #569cd6;">$1</span>$2<span style="color: #569cd6;">$3</span>')
      // Attributs
      .replace(/(\s)([a-zA-Z-]+)(=)/g, '$1<span style="color: #92c5f7;">$2</span>$3')
      // Valeurs d'attributs
      .replace(/=(&quot;[^&]*?&quot;|&#039;[^&]*?&#039;)/g, '=<span style="color: #ce9178;">$1</span>');
  };

  const highlightJSON = (code: string): string => {
    return code
      // Clés JSON
      .replace(/(&quot;[^&]*?&quot;)(\s*:)/g, '<span style="color: #79c0ff;">$1</span>$2')
      // Valeurs chaînes
      .replace(/(:\s*)(&quot;[^&]*?&quot;)/g, '$1<span style="color: #a5d6ff;">$2</span>')
      // Nombres
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color: #b5cea8;">$1</span>')
      // Booléens et null
      .replace(/\b(true|false|null)\b/g, '<span style="color: #569cd6;">$1</span>');
  };

  const highlightBash = (code: string): string => {
    return code
      // Commentaires
      .replace(/(#.*$)/gm, '<span style="color: #6a9955;">$1</span>')
      // Chaînes
      .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color: #a5d6ff;">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color: #a5d6ff;">$1</span>')
      // Commandes
      .replace(/\b(echo|ls|cd|mkdir|rm|cp|mv|grep|find|sed|awk|cat|tail|head|chmod|chown|sudo|git|npm|node|python|pip)\b/g, '<span style="color: #d2a8ff;">$1</span>')
      // Options
      .replace(/\s(-[a-zA-Z-]+)/g, ' <span style="color: #92c5f7;">$1</span>');
  };

  const highlightSQL = (code: string): string => {
    return code
      // Commentaires
      .replace(/(--.*$)/gm, '<span style="color: #6a9955;">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6a9955;">$1</span>')
      // Mots-clés SQL
      .replace(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|TABLE|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES|NOT|NULL|AUTO_INCREMENT|VARCHAR|INT|TEXT|TIMESTAMP|DEFAULT|CURRENT_TIMESTAMP|JOIN|LEFT|RIGHT|INNER|OUTER|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|UNION|ALTER|DROP|DATABASE|USE)\b/gi, '<span style="color: #ff7b72;">$1</span>')
      // Chaînes
      .replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color: #a5d6ff;">$1</span>')
      // Nombres
      .replace(/\b(\d+)\b/g, '<span style="color: #b5cea8;">$1</span>');
  };

  const highlightTypeScript = (code: string): string => {
    return code
      // Commentaires
      .replace(/(\/\/.*$)/gm, '<span style="color: #6a9955;">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6a9955;">$1</span>')
      // Chaînes de caractères
      .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color: #ce9178;">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color: #ce9178;">$1</span>')
      .replace(/(`(?:[^`\\]|\\.)*`)/g, '<span style="color: #ce9178;">$1</span>')
      // Mots-clés TypeScript
      .replace(/\b(const|let|var|function|class|interface|type|enum|namespace|module|declare|abstract|readonly|static|private|protected|public|if|else|for|while|do|switch|case|break|continue|return|try|catch|finally|throw|new|this|super|import|export|from|default|async|await|typeof|instanceof)\b/g, '<span style="color: #569cd6;">$1</span>')
      // Types TypeScript
      .replace(/\b(string|number|boolean|object|undefined|null|void|any|unknown|never)\b/g, '<span style="color: #4ec9b0;">$1</span>')
      // Nombres
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color: #b5cea8;">$1</span>')
      // Fonctions
      .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, '<span style="color: #dcdcaa;">$1</span>');
  };

  const highlightJSX = (code: string): string => {
    return code
      // Commentaires JSX
      .replace(/(\{\/\*[\s\S]*?\*\/\})/g, '<span style="color: #6a9955;">$1</span>')
      .replace(/(\/\/.*$)/gm, '<span style="color: #6a9955;">$1</span>')
      // JSX tags
      .replace(/(&lt;\/?[^&\s]*?)(\s[^&]*?)?(&gt;)/g, '<span style="color: #569cd6;">$1</span>$2<span style="color: #569cd6;">$3</span>')
      // JSX attributes
      .replace(/(\s)([a-zA-Z-]+)(=)/g, '$1<span style="color: #92c5f7;">$2</span>$3')
      // JSX attribute values
      .replace(/=(&quot;[^&]*?&quot;|&#039;[^&]*?&#039;)/g, '=<span style="color: #ce9178;">$1</span>')
      // JSX expressions
      .replace(/(\{[^}]*\})/g, '<span style="color: #d4d4d4;">$1</span>')
      // JavaScript keywords
      .replace(/\b(const|let|var|function|if|else|return|import|export|from)\b/g, '<span style="color: #569cd6;">$1</span>')
      // Chaînes
      .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color: #ce9178;">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color: #ce9178;">$1</span>');
  };

  const highlightTSX = (code: string): string => {
    return code
      // Commentaires TSX
      .replace(/(\{\/\*[\s\S]*?\*\/\})/g, '<span style="color: #6a9955;">$1</span>')
      .replace(/(\/\/.*$)/gm, '<span style="color: #6a9955;">$1</span>')
      // TSX tags
      .replace(/(&lt;\/?[^&\s]*?)(\s[^&]*?)?(&gt;)/g, '<span style="color: #569cd6;">$1</span>$2<span style="color: #569cd6;">$3</span>')
      // TSX attributes
      .replace(/(\s)([a-zA-Z-]+)(=)/g, '$1<span style="color: #92c5f7;">$2</span>$3')
      // TSX attribute values
      .replace(/=(&quot;[^&]*?&quot;|&#039;[^&]*?&#039;)/g, '=<span style="color: #ce9178;">$1</span>')
      // TypeScript keywords
      .replace(/\b(const|let|var|function|interface|type|class|if|else|return|import|export|from)\b/g, '<span style="color: #569cd6;">$1</span>')
      // Types TypeScript
      .replace(/\b(string|number|boolean|object|undefined|null|void|any)\b/g, '<span style="color: #4ec9b0;">$1</span>')
      // Chaînes
      .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color: #ce9178;">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color: #ce9178;">$1</span>');
  };

  const highlightJava = (code: string): string => {
    return code
      // Commentaires
      .replace(/(\/\/.*$)/gm, '<span style="color: #6a9955;">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6a9955;">$1</span>')
      // Chaînes
      .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color: #ce9178;">$1</span>')
      // Mots-clés Java
      .replace(/\b(public|private|protected|static|final|abstract|class|interface|enum|extends|implements|import|package|if|else|for|while|do|switch|case|break|continue|return|try|catch|finally|throw|throws|new|this|super|instanceof)\b/g, '<span style="color: #569cd6;">$1</span>')
      // Types Java
      .replace(/\b(int|long|short|byte|float|double|boolean|char|String|Object|void)\b/g, '<span style="color: #4ec9b0;">$1</span>')
      // Nombres
      .replace(/\b(\d+\.?\d*[fFdDlL]?)\b/g, '<span style="color: #b5cea8;">$1</span>')
      // Annotations
      .replace(/(@[a-zA-Z_][a-zA-Z0-9_]*)/g, '<span style="color: #dcdcaa;">$1</span>');
  };

  const highlightCSharp = (code: string): string => {
    return code
      // Commentaires
      .replace(/(\/\/.*$)/gm, '<span style="color: #6a9955;">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6a9955;">$1</span>')
      // Chaînes
      .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color: #ce9178;">$1</span>')
      .replace(/(@"[^"]*")/g, '<span style="color: #ce9178;">$1</span>')
      // Mots-clés C#
      .replace(/\b(public|private|protected|internal|static|readonly|const|abstract|virtual|override|sealed|class|struct|interface|enum|namespace|using|if|else|for|foreach|while|do|switch|case|break|continue|return|try|catch|finally|throw|new|this|base|typeof|sizeof|is|as|var|dynamic)\b/g, '<span style="color: #569cd6;">$1</span>')
      // Types C#
      .replace(/\b(int|long|short|byte|uint|ulong|ushort|sbyte|float|double|decimal|bool|char|string|object|void)\b/g, '<span style="color: #4ec9b0;">$1</span>')
      // Nombres
      .replace(/\b(\d+\.?\d*[fFdDmM]?)\b/g, '<span style="color: #b5cea8;">$1</span>')
      // Attributs
      .replace(/(\[[^\]]*\])/g, '<span style="color: #dcdcaa;">$1</span>');
  };

  const highlightPHP = (code: string): string => {
    return code
      // Commentaires PHP
      .replace(/(\/\/.*$)/gm, '<span style="color: #6a9955;">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6a9955;">$1</span>')
      .replace(/(#.*$)/gm, '<span style="color: #6a9955;">$1</span>')
      // Chaînes PHP
      .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color: #ce9178;">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color: #ce9178;">$1</span>')
      // Variables PHP
      .replace(/(\$[a-zA-Z_][a-zA-Z0-9_]*)/g, '<span style="color: #9cdcfe;">$1</span>')
      // Mots-clés PHP
      .replace(/\b(class|function|if|else|elseif|for|foreach|while|do|switch|case|break|continue|return|try|catch|finally|throw|new|extends|implements|public|private|protected|static|abstract|final|const|var|echo|print|include|require|include_once|require_once)\b/g, '<span style="color: #569cd6;">$1</span>')
      // Fonctions PHP
      .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, '<span style="color: #dcdcaa;">$1</span>');
  };

  const highlightGeneric = (code: string): string => {
    return code
      // Commentaires génériques
      .replace(/(\/\/.*$|#.*$)/gm, '<span style="color: #6a9955;">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6a9955;">$1</span>')
      // Chaînes génériques
      .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span style="color: #ce9178;">$1</span>')
      // Nombres
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color: #b5cea8;">$1</span>');
  };

  return (
    <pre className="syntax-highlighter" style={{
      background: '#1e1e1e',
      color: '#d4d4d4',
      padding: '16px',
      borderRadius: '0 0 8px 8px',
      overflow: 'auto',
      fontSize: '14px',
      lineHeight: '1.5',
      fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", Consolas, "Courier New", monospace',
      margin: 0,
    }}>
      <code 
        style={{
          background: 'transparent',
          color: 'inherit',
          fontSize: 'inherit',
          fontFamily: 'inherit',
        }}
        dangerouslySetInnerHTML={{ __html: highlightedCode }} 
      />
    </pre>
  );
};

export default CodeHighlighter;