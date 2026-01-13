import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    ArrowLeft, 
    User, 
    BookOpen, 
    Calendar,
    MessageSquare,
    Bot,
    Download,
    Copy,
    CheckCircle
} from 'lucide-react';

export default function AILogsSession({ logs, session_id, student, lesson }) {
    const [copied, setCopied] = React.useState(false);

    const handleCopySession = () => {
        const sessionText = logs.map(log => 
            `[${new Date(log.timestamp).toLocaleString()}]\n` +
            `👤 Student: ${log.prompt}\n` +
            `🤖 AI: ${log.response}\n\n`
        ).join('---\n\n');
        
        navigator.clipboard.writeText(sessionText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExportSession = () => {
        const sessionData = {
            session_id,
            student: student?.user?.name,
            lesson: lesson?.title,
            messages: logs.map(log => ({
                timestamp: log.timestamp,
                prompt: log.prompt,
                response: log.response
            }))
        };
        
        const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-session-${session_id.substring(0, 8)}.json`;
        a.click();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <Head title={`AI Session - ${student?.user?.name}`} />

            {/* Header */}
            <div className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin/ai-logs"
                                className="p-2 bg-slate-800 border border-white/10 rounded-lg hover:bg-slate-700 transition-all"
                            >
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                    AI Chat Session
                                </h1>
                                <p className="text-sm text-slate-400 mt-1">
                                    Session ID: {session_id.substring(0, 13)}...
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCopySession}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-white/10 text-white rounded-lg hover:bg-slate-700 transition-all"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copy
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleExportSession}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar - Session Info */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Student Info */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
                            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <User className="w-5 h-5 text-purple-400" />
                                    <h3 className="font-semibold text-white">Student</h3>
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                        <span className="text-lg font-bold text-white">
                                            {student?.user?.name?.charAt(0).toUpperCase() || 'S'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">
                                            {student?.user?.name || 'Unknown'}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {student?.user?.email || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lesson Info */}
                        {lesson && (
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
                                <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <BookOpen className="w-5 h-5 text-cyan-400" />
                                        <h3 className="font-semibold text-white">Lesson</h3>
                                    </div>
                                    <p className="text-sm text-slate-300">{lesson.title}</p>
                                    {lesson.description && (
                                        <p className="text-xs text-slate-500 mt-2 line-clamp-3">
                                            {lesson.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Session Stats */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
                            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <MessageSquare className="w-5 h-5 text-blue-400" />
                                    <h3 className="font-semibold text-white">Stats</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-400">Messages</span>
                                        <span className="text-lg font-bold text-white">{logs.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-400">Duration</span>
                                        <span className="text-sm font-medium text-white">
                                            {calculateDuration(logs)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-400">Started</span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(logs[0]?.timestamp).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Chat Messages */}
                    <div className="lg:col-span-3">
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-white/10">
                                <h2 className="text-xl font-bold text-white">Conversation Timeline</h2>
                                <p className="text-sm text-slate-400 mt-1">
                                    {logs.length} messages exchanged
                                </p>
                            </div>

                            <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                                {logs.map((log, index) => (
                                    <div key={log.ai_session_log_id} className="space-y-4">
                                        {/* Student Question */}
                                        <div className="flex justify-end">
                                            <div className="flex items-start gap-3 max-w-[85%]">
                                                <div className="flex-1 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl rounded-tr-sm p-4 shadow-lg">
                                                    <div className="prose prose-invert prose-sm max-w-none">
                                                        <p className="text-white leading-relaxed whitespace-pre-wrap">
                                                            {log.prompt}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-purple-200">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center mt-1">
                                                    <User className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Response */}
                                        <div className="flex justify-start">
                                            <div className="flex items-start gap-3 max-w-[85%]">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mt-1">
                                                    <Bot className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1 bg-gray-700/80 rounded-2xl rounded-tl-sm p-4 border border-gray-600 shadow-lg">
                                                    <div className="prose prose-invert prose-sm max-w-none">
                                                        <FormattedResponse content={log.response} />
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                                                        <span>✨</span>
                                                        <span>AI Response</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Divider between conversations (except last) */}
                                        {index < logs.length - 1 && (
                                            <div className="flex items-center gap-3 py-2">
                                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                                <span className="text-xs text-slate-600">•</span>
                                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper: Format AI response with markdown-like styling
function FormattedResponse({ content }) {
    return content.split('\n').map((line, i) => {
        // Code blocks
        if (line.includes('`')) {
            const parts = line.split(/(`[^`]+`)/g);
            return (
                <p key={i} className="mb-2 last:mb-0 leading-relaxed">
                    {parts.map((part, j) => {
                        if (part.startsWith('`') && part.endsWith('`')) {
                            return (
                                <code key={j} className="bg-gray-900/50 text-purple-300 px-2 py-0.5 rounded font-mono text-sm">
                                    {part.slice(1, -1)}
                                </code>
                            );
                        }
                        return <span key={j}>{part}</span>;
                    })}
                </p>
            );
        }
        
        // List items
        if (line.trim().match(/^[-*]\s/)) {
            return (
                <li key={i} className="ml-4 mb-1 text-gray-100">
                    {line.trim().replace(/^[-*]\s/, '')}
                </li>
            );
        }
        
        // Headers
        if (line.trim().startsWith('##')) {
            return (
                <h3 key={i} className="font-bold text-lg mt-3 mb-2 text-purple-300">
                    {line.replace(/^#+\s/, '')}
                </h3>
            );
        }
        
        // Bold text
        if (line.includes('**')) {
            const parts = line.split(/(\*\*[^*]+\*\*)/g);
            return (
                <p key={i} className="mb-2 last:mb-0 leading-relaxed text-gray-100">
                    {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return (
                                <strong key={j} className="font-semibold text-white">
                                    {part.slice(2, -2)}
                                </strong>
                            );
                        }
                        return <span key={j}>{part}</span>;
                    })}
                </p>
            );
        }
        
        // Normal text
        return line.trim() ? (
            <p key={i} className="mb-2 last:mb-0 leading-relaxed text-gray-100">
                {line}
            </p>
        ) : (
            <br key={i} />
        );
    });
}

// Helper: Calculate session duration
function calculateDuration(logs) {
    if (logs.length < 2) return 'N/A';
    
    const start = new Date(logs[0].timestamp);
    const end = new Date(logs[logs.length - 1].timestamp);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return '< 1 min';
    if (diffMins < 60) return `${diffMins} min`;
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
}