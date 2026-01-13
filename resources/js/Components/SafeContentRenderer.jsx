// resources/js/Components/SafeContentRenderer.jsx
import React from 'react';
import DOMPurify from 'dompurify';

/**
 * SafeContentRenderer - Securely render lesson content
 * Supports: Plain Text, Markdown, HTML
 * Features: XSS Protection, Syntax Highlighting, Custom Styling
 * 
 * @param {Object} props
 * @param {string} props.content - Raw content to render
 * @param {string} props.type - Content type: 'text' | 'markdown' | 'html'
 * @param {string} props.className - Additional CSS classes
 */
export default function SafeContentRenderer({ 
  content, 
  type = 'text', 
  className = '' 
}) {
  if (!content) {
    return (
      <div className="text-gray-400 italic text-sm">
        No content available
      </div>
    );
  }

  // ===== PLAIN TEXT RENDERING =====
  if (type === 'text') {
    return (
      <div className={`whitespace-pre-wrap text-gray-700 leading-relaxed ${className}`}>
        {content}
      </div>
    );
  }

  // ===== MARKDOWN RENDERING =====
  if (type === 'markdown') {
    return <MarkdownRenderer content={content} className={className} />;
  }

  // ===== HTML RENDERING (SANITIZED) =====
  if (type === 'html') {
    return <HTMLRenderer content={content} className={className} />;
  }

  // Fallback
  return (
    <div className={`whitespace-pre-wrap text-gray-700 ${className}`}>
      {content}
    </div>
  );
}

/**
 * MarkdownRenderer - Render Markdown with syntax highlighting
 * Uses a simple Markdown parser (no external deps needed for basic support)
 */
function MarkdownRenderer({ content, className }) {
  // Convert Markdown to safe HTML
  const htmlContent = parseMarkdownToHTML(content);
  
  // Sanitize the HTML
  const sanitizedHTML = DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'strong', 'em', 'u', 's', 'code', 'pre',
      'ul', 'ol', 'li',
      'blockquote',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });

  return (
    <div
      className={`prose prose-sm max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100 ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
}

/**
 * HTMLRenderer - Render sanitized HTML
 */
function HTMLRenderer({ content, className }) {
  // Sanitize HTML with strict rules
  const sanitizedHTML = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr', 'div', 'span',
      'strong', 'em', 'u', 's', 'b', 'i', 'mark', 'small',
      'code', 'pre', 'kbd', 'samp', 'var',
      'ul', 'ol', 'li', 'dl', 'dt', 'dd',
      'blockquote', 'cite', 'q',
      'a', 'img',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
      'details', 'summary',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id',
      'width', 'height', 'style',
      'colspan', 'rowspan',
      'target', 'rel',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // Prevent XSS via style attribute
    ALLOWED_STYLE: ['color', 'background-color', 'font-size', 'font-weight', 'text-align'],
    // Force external links to open in new tab with security
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });

  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
}

/**
 * Simple Markdown to HTML parser
 * Supports basic Markdown syntax without external dependencies
 * For production, consider using 'marked' or 'react-markdown'
 */
function parseMarkdownToHTML(markdown) {
  let html = markdown;

  // Escape HTML to prevent injection
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers (h1-h6)
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Bold and Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Code blocks (```)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre class="language-${lang || 'text'}"><code>${code.trim()}</code></pre>`;
  });

  // Inline code (`)
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Images
  html = html.replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded" />');

  // Unordered lists
  html = html.replace(/^\*\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, (match) => {
    if (!match.includes('<ul>')) {
      return '<ol>' + match + '</ol>';
    }
    return match;
  });

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600">$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-4 border-gray-300" />');

  // Paragraphs (wrap remaining text)
  html = html.replace(/^(?!<[holu]|<pre|<blockquote|<hr)(.+)$/gm, '<p>$1</p>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');

  return html;
}

/**
 * CodeBlock - Syntax-highlighted code block
 * Use this for displaying code snippets separately
 */
export function CodeBlock({ code, language = 'python', className = '' }) {
  if (!code) return null;

  // Sanitize code
  const sanitizedCode = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-2 right-2 text-xs text-gray-400 font-mono">
        {language}
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code className={`language-${language}`}>{sanitizedCode}</code>
      </pre>
    </div>
  );
}

/**
 * InlineCode - Inline code snippet
 */
export function InlineCode({ children, className = '' }) {
  return (
    <code className={`bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono ${className}`}>
      {children}
    </code>
  );
}