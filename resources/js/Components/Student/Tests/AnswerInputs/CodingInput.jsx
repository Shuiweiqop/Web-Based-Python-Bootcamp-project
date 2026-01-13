import React, { useState, useEffect } from 'react';
import { Code2, Play, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';

export default function CodingInput({ value, onChange, disabled = false }) {
    const [code, setCode] = useState(value || '');
    const [lineCount, setLineCount] = useState(1);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        setCode(value || '');
        updateLineCount(value || '');
    }, [value]);

    const updateLineCount = (text) => {
        const lines = text.split('\n').length;
        setLineCount(lines);
    };

    const handleChange = (e) => {
        if (disabled) return;
        
        const newValue = e.target.value;
        setCode(newValue);
        updateLineCount(newValue);
        
        if (onChange) {
            onChange(newValue);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newValue = code.substring(0, start) + '    ' + code.substring(end);
            setCode(newValue);
            
            // Set cursor position after tab
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 4;
            }, 0);
            
            if (onChange) {
                onChange(newValue);
            }
        }
    };

    const handleRun = () => {
        setIsRunning(true);
        
        // Simulate code execution (in production, this would call a backend API)
        setTimeout(() => {
            setOutput('Code execution is not available during the test.\nYour code will be evaluated after submission.');
            setIsRunning(false);
        }, 1000);
    };

    const handleReset = () => {
        setCode('');
        setOutput('');
        if (onChange) {
            onChange('');
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Code2 className="w-4 h-4 mr-2" />
                    Write your Python code:
                </label>
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                        {lineCount} line{lineCount !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Code Editor */}
            <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-900">
                {/* Line Numbers */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-800 border-r border-gray-700 text-gray-500 text-right text-sm font-mono pt-3 pb-3 pr-2 select-none">
                    {Array.from({ length: lineCount }, (_, i) => (
                        <div key={i + 1} className="leading-6">
                            {i + 1}
                        </div>
                    ))}
                </div>

                {/* Code Textarea */}
                <textarea
                    value={code}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder="# Write your Python code here..."
                    className={`w-full pl-14 pr-4 py-3 bg-gray-900 text-gray-100 font-mono text-sm leading-6 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        disabled ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    rows={Math.max(10, lineCount)}
                    spellCheck="false"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
                <button
                    type="button"
                    onClick={handleRun}
                    disabled={!code.trim() || isRunning || disabled}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isRunning ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Running...
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4 mr-2" />
                            Run Code
                        </>
                    )}
                </button>

                <button
                    type="button"
                    onClick={handleReset}
                    disabled={!code.trim() || disabled}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                </button>
            </div>

            {/* Output Console */}
            {output && (
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                        <span className="text-xs font-medium text-gray-700">Output:</span>
                    </div>
                    <div className="bg-gray-900 p-4">
                        <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">
                            {output}
                        </pre>
                    </div>
                </div>
            )}

            {/* Code Status */}
            {code.trim() && (
                <div className="flex items-start space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">
                            Code saved
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                            Your code will be evaluated after you submit the test
                        </p>
                    </div>
                </div>
            )}

            {/* Coding Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-800 space-y-1">
                        <p><strong>Coding Tips:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Use proper Python indentation (4 spaces)</li>
                            <li>Press Tab to insert 4 spaces</li>
                            <li>Test your logic before submitting</li>
                            <li>Add comments to explain your solution</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}