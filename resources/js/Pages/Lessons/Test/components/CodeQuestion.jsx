import React, { useState, useRef, useEffect } from 'react';

const CodeQuestion = ({ 
    value, 
    onChange, 
    language = 'python',
    placeholder = "# Write your Python code here...\n\n",
    height = 300 
}) => {
    const [code, setCode] = useState(value || '');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fontSize, setFontSize] = useState(14);
    const textareaRef = useRef(null);

    // Handle code changes
    const handleCodeChange = (e) => {
        const newCode = e.target.value;
        setCode(newCode);
        if (onChange) {
            onChange({ code: newCode });
        }
    };

    // Handle tab key for proper indentation
    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const textarea = e.target;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            // Insert 4 spaces
            const newCode = code.substring(0, start) + '    ' + code.substring(end);
            setCode(newCode);
            
            // Update onChange
            if (onChange) {
                onChange({ code: newCode });
            }

            // Move cursor position
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 4;
            }, 0);
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.max(height, textarea.scrollHeight) + 'px';
        }
    }, [code, height]);

    // Toggle fullscreen
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Font size controls
    const increaseFontSize = () => {
        setFontSize(prev => Math.min(prev + 2, 24));
    };

    const decreaseFontSize = () => {
        setFontSize(prev => Math.max(prev - 2, 10));
    };

    // Get line numbers
    const getLineNumbers = () => {
        const lines = code.split('\n');
        return lines.map((_, index) => index + 1);
    };

    const lineCount = code.split('\n').length;

    return (
        <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
            {/* Header with controls */}
            <div className="flex items-center justify-between mb-3 p-2 bg-gray-100 rounded-t-lg border border-gray-300">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                        {language.toUpperCase()} Code Editor
                    </span>
                    <span className="text-xs text-gray-500">
                        Lines: {lineCount}
                    </span>
                </div>
                
                <div className="flex items-center space-x-2">
                    {/* Font size controls */}
                    <button
                        onClick={decreaseFontSize}
                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                        title="Decrease font size"
                    >
                        A-
                    </button>
                    <span className="text-xs text-gray-600">{fontSize}px</span>
                    <button
                        onClick={increaseFontSize}
                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                        title="Increase font size"
                    >
                        A+
                    </button>
                    
                    {/* Fullscreen toggle */}
                    <button
                        onClick={toggleFullscreen}
                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                        {isFullscreen ? '🗗' : '🗖'}
                    </button>
                </div>
            </div>

            {/* Code editor area */}
            <div className="relative border border-gray-300 rounded-b-lg bg-white">
                {/* Line numbers */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-50 border-r border-gray-200 text-right text-gray-500 text-sm select-none overflow-hidden">
                    {getLineNumbers().map(num => (
                        <div 
                            key={num} 
                            className="px-2 leading-6" 
                            style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize + 8}px` }}
                        >
                            {num}
                        </div>
                    ))}
                </div>

                {/* Code textarea */}
                <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={handleCodeChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full pl-14 pr-4 py-3 border-0 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
                    style={{
                        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                        fontSize: `${fontSize}px`,
                        lineHeight: `${fontSize + 8}px`,
                        minHeight: isFullscreen ? '80vh' : `${height}px`,
                        tabSize: 4
                    }}
                    spellCheck="false"
                />
            </div>

            {/* Footer with tips */}
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                <p>
                    <strong>Tips:</strong> Use Tab for indentation (4 spaces). 
                    Write clean, readable code with proper comments.
                    {language === 'python' && ' Remember Python syntax: proper indentation, colons after control statements.'}
                </p>
            </div>

            {/* Code preview (if code exists) */}
            {code.trim() && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
                    <p className="text-sm font-medium text-gray-700 mb-2">Code Preview:</p>
                    <pre className="text-xs text-gray-900 overflow-x-auto">
                        <code>{code}</code>
                    </pre>
                </div>
            )}

            {/* Quick shortcuts info */}
            <div className="mt-2 text-xs text-gray-500">
                <span>Press Tab for indentation • Use {isFullscreen ? 'exit button' : 'fullscreen button'} for better view</span>
            </div>
        </div>
    );
};

export default CodeQuestion;