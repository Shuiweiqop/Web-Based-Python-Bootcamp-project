import React, { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { ArrowLeft, Play, Send, Clock, Trophy, CheckCircle, XCircle, Loader2, MessageCircle, X } from 'lucide-react';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head } from '@inertiajs/react';

export default function CodingExercise({ exercise, lessonId, auth }) {
    // 🔥 添加空值检查和加载状态
    if (!exercise) {
        return (
            <StudentLayout user={auth?.user}>
                <Head title="Loading Exercise..." />
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">Loading exercise...</p>
                    </div>
                </div>
            </StudentLayout>
        );
    }

    // 🔥 安全地获取默认值
    const defaultCode = exercise.starter_code || 
                        exercise.content?.starter_code || 
                        '# Write your Python code here\ndef solution():\n    pass\n';
    
    const [code, setCode] = useState(defaultCode);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [testResults, setTestResults] = useState([]);
    const [score, setScore] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [startTime] = useState(Date.now());
    const editorRef = useRef(null);
    
    // 🔥 AI Chat States
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [hintLevel, setHintLevel] = useState(1);
    const [totalMessages, setTotalMessages] = useState(0);

    // Monaco Editor 加载完成
    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        
        // 自定义主题
        monaco.editor.defineTheme('codingTheme', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6A9955' },
                { token: 'keyword', foreground: 'C586C0' },
                { token: 'string', foreground: 'CE9178' },
            ],
            colors: {
                'editor.background': '#1e1e1e',
                'editor.foreground': '#d4d4d4',
            }
        });
        monaco.editor.setTheme('codingTheme');
    };

    // 运行代码（测试，不提交）
    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('🔄 Running your code...');
        
        try {
            const response = await axios.post('/api/code/execute', {
                code: code,
                language: 'python',
                test_cases: exercise.test_cases || [],
            });

            setOutput(response.data.output || '✅ Code executed successfully!');
            setTestResults(response.data.test_results || []);
            
            // 计算分数（但不提交）
            if (response.data.test_results) {
                const passed = response.data.test_results.filter(t => t.passed).length;
                const total = response.data.test_results.length;
                const calculatedScore = total > 0 ? Math.round((passed / total) * (exercise.max_score || 100)) : 0;
                setScore(calculatedScore);
            }
        } catch (error) {
            console.error('Run error:', error);
            setOutput('❌ Error: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsRunning(false);
        }
    };

    // 提交代码（保存到数据库）
    const handleSubmitCode = async () => {
        setIsRunning(true);
        
        try {
            // 先运行测试
            const executeResponse = await axios.post('/api/code/execute', {
                code: code,
                language: 'python',
                test_cases: exercise.test_cases || [],
            });

            const testResults = executeResponse.data.test_results || [];
            const passed = testResults.filter(t => t.passed).length;
            const total = testResults.length;
            const finalScore = total > 0 ? Math.round((passed / total) * (exercise.max_score || 100)) : 0;
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);

            // 🔥 安全获取 exercise ID
            const exerciseId = exercise.exercise_id || exercise.id;
            
            if (!exerciseId || !lessonId) {
                throw new Error('Missing exercise or lesson ID');
            }

            // 提交到后端
            const submitResponse = await axios.post(
                route('lessons.exercises.api.submit', { lesson: lessonId, exercise: exerciseId }),
                {
                    answer: {
                        code: code,
                        test_results: testResults,
                        output: executeResponse.data.output,
                        completed: passed === total,
                        score: finalScore,
                    },
                    time_spent: timeSpent,
                }
            );

            setScore(finalScore);
            setTestResults(testResults);
            setOutput(`✅ Submitted! Score: ${finalScore}/${exercise.max_score || 100}`);
            setIsSubmitted(true);

            // 显示课程完成提示
            if (submitResponse.data.lesson_progress?.lesson_completed) {
                setTimeout(() => {
                    alert(`🎉 Congratulations! You've completed the lesson and earned ${submitResponse.data.lesson_progress.points_amount} points!`);
                }, 1000);
            }

        } catch (error) {
            console.error('Submit error:', error);
            setOutput('❌ Submission failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsRunning(false);
        }
    };

    // 返回课程页面
    const handleReturnToLesson = () => {
        if (lessonId) {
            sessionStorage.setItem('refresh_lesson_progress', 'true');
            router.visit(`/lessons/${lessonId}`);
        } else {
            window.history.back();
        }
    };

    // 🔥 发送聊天消息（带渐进式提示）
    const sendChatMessage = async () => {
        if (!chatInput.trim() || isChatLoading) return;

        const userMessage = { role: 'user', content: chatInput };
        setChatMessages(prev => [...prev, userMessage]);
        const messageToSend = chatInput;
        setChatInput('');
        setIsChatLoading(true);

        try {
            console.log('Sending message:', messageToSend);
            
            const response = await axios.post('/api/gemini/chat', {
                message: messageToSend,
                lesson_id: lessonId,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });

            console.log('Response received:', response.data);

            if (response.data.success) {
                const aiMessage = { role: 'assistant', content: response.data.message };
                setChatMessages(prev => [...prev, aiMessage]);
                
                // 🔥 更新提示级别
                if (response.data.hint_level) {
                    setHintLevel(response.data.hint_level);
                }
                if (response.data.total_messages !== undefined) {
                    setTotalMessages(response.data.total_messages);
                }
            } else {
                throw new Error(response.data.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Full error object:', error);
            
            let errorMsg = 'Unknown error';
            
            if (error.response?.status === 429) {
                errorMsg = '⏳ AI is currently busy due to high demand. Please wait 30 seconds and try again.';
            } else {
                errorMsg = error.response?.data?.error || error.message || 'Unknown error';
            }
            
            const errorMessage = { 
                role: 'assistant', 
                content: `❌ Error: ${errorMsg}` 
            };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleChatKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    };

    // 🔥 提示级别指示器组件
    const HintLevelIndicator = () => {
        const getLevelColor = (level) => {
            const colors = {
                1: 'bg-blue-500',
                2: 'bg-green-500',
                3: 'bg-yellow-500',
                4: 'bg-orange-500',
                5: 'bg-red-500'
            };
            return colors[level] || 'bg-gray-500';
        };

        const getLevelText = (level) => {
            const texts = {
                1: 'Questions',
                2: 'Concepts',
                3: 'Structure',
                4: 'Pseudocode',
                5: 'Example'
            };
            return texts[level] || 'Unknown';
        };

        return (
            <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-200">Hint Level:</span>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                        <div
                            key={level}
                            className={`w-6 h-2 rounded-full transition-all ${
                                level <= hintLevel ? getLevelColor(level) : 'bg-gray-600'
                            }`}
                            title={getLevelText(level)}
                        />
                    ))}
                </div>
                <span className="text-white font-semibold">{hintLevel}/5</span>
                <span className="text-gray-300">({getLevelText(hintLevel)})</span>
            </div>
        );
    };

    // 🔥 获取提示级别描述
    const getHintLevelDescription = () => {
        const descriptions = {
            1: "I'm asking questions to help you think",
            2: "I'm explaining concepts you'll need",
            3: "I'm describing the algorithm structure",
            4: "I'm providing pseudocode to guide you",
            5: "I'm showing detailed examples to help you understand"
        };
        return descriptions[hintLevel] || "Let me help you learn!";
    };

    // 🔥 安全获取数据
    const maxScore = exercise.max_score || exercise.points || 100;
    const testCases = exercise.test_cases || [];
    const passedTests = testResults.filter(t => t.passed).length;
    const totalTests = testResults.length;
    const allTestsPassed = totalTests > 0 && passedTests === totalTests;

    return (
        <StudentLayout user={auth.user}>
            <Head title={`${exercise.title || 'Coding Exercise'}`} />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
                {/* Header */}
                <div className="bg-gray-900/50 backdrop-blur border-b border-purple-500/30">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleReturnToLesson}
                                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                        💻 {exercise.title || 'Coding Exercise'}
                                    </h1>
                                    {exercise.description && (
                                        <p className="text-gray-400 text-sm mt-1">{exercise.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-3xl font-bold ${
                                    allTestsPassed ? 'text-green-400' : 'text-purple-400'
                                }`}>
                                    {score}/{maxScore}
                                </div>
                                <div className="text-sm text-gray-400">points</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Instructions */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-purple-500/30 sticky top-6">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    📋 Instructions
                                </h2>
                                
                                {/* Instructions Content */}
                                <div className="prose prose-invert prose-sm max-w-none mb-6">
                                    {exercise.coding_instructions ? (
                                        <div 
                                            className="text-gray-300 leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: exercise.coding_instructions }}
                                        />
                                    ) : exercise.description ? (
                                        <div className="text-gray-300 leading-relaxed">
                                            {exercise.description}
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 italic">
                                            No instructions provided. Write your code and test it!
                                        </div>
                                    )}
                                </div>

                                {/* Test Cases Preview */}
                                {testCases.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            🧪 Test Cases ({testCases.length})
                                        </h3>
                                        {testCases.slice(0, 2).map((testCase, index) => (
                                            <div 
                                                key={index}
                                                className="bg-gray-900/50 rounded-lg p-4 mb-3 border border-gray-700"
                                            >
                                                <div className="text-gray-400 text-sm mb-2">Example {index + 1}:</div>
                                                <div className="space-y-1 font-mono text-sm">
                                                    <div className="text-green-400">
                                                        Input: <span className="text-white">{testCase.input || 'None'}</span>
                                                    </div>
                                                    <div className="text-blue-400">
                                                        Expected: <span className="text-white">{testCase.expected || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {testCases.length > 2 && (
                                            <div className="text-gray-500 text-sm">
                                                + {testCases.length - 2} more test case(s)
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Status Badge */}
                                {isSubmitted && (
                                    <div className={`mt-6 p-4 rounded-lg border-2 ${
                                        allTestsPassed 
                                            ? 'bg-green-900/30 border-green-500' 
                                            : 'bg-yellow-900/30 border-yellow-500'
                                    }`}>
                                        <div className="flex items-center gap-2 font-semibold">
                                            {allTestsPassed ? (
                                                <>
                                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                                    <span className="text-green-400">All Tests Passed!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-5 h-5 text-yellow-400" />
                                                    <span className="text-yellow-400">
                                                        {passedTests}/{totalTests} Tests Passed
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* AI Assistant Button */}
                            <button
                                onClick={() => setShowChat(!showChat)}
                                className="mt-6 w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                <MessageCircle className="w-5 h-5" />
                                {showChat ? 'Hide AI Assistant' : 'Ask AI Assistant'}
                            </button>

                            {/* 🤖 AI 聊天窗口 */}
                            {showChat && (
                                <div className="mt-4 bg-gray-900/80 rounded-xl border border-purple-500/30 overflow-hidden">
                                    {/* 聊天标题 + 提示级别 */}
                                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-white font-semibold flex items-center gap-2">
                                                🤖 AI Assistant
                                            </h3>
                                            <button
                                                onClick={() => setShowChat(false)}
                                                className="text-white hover:text-gray-200 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                        
                                        {/* 🔥 提示级别指示器 */}
                                        {totalMessages > 0 && <HintLevelIndicator />}
                                        
                                        {/* 🔥 提示信息 */}
                                        {totalMessages > 0 && (
                                            <div className="mt-2 text-xs text-gray-200 bg-white/10 rounded px-2 py-1">
                                                💡 {getHintLevelDescription()}
                                            </div>
                                        )}
                                    </div>

                                    {/* 聊天消息区域 */}
                                    <div className="h-[300px] overflow-y-auto p-4 space-y-3 bg-gray-800/50">
                                        {chatMessages.length === 0 && (
                                            <div className="text-center text-gray-400 mt-20">
                                                <p className="text-3xl mb-2">💬</p>
                                                <p className="text-sm">Ask me anything about this exercise!</p>
                                                <p className="text-xs text-gray-500 mt-2">I'll guide you step-by-step with progressive hints</p>
                                            </div>
                                        )}

                                        {chatMessages.map((msg, index) => (
                                            <div
                                                key={index}
                                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                {/* AI 头像 */}
                                                {msg.role === 'assistant' && (
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mr-2 mt-1">
                                                        <span className="text-white text-sm">🤖</span>
                                                    </div>
                                                )}

                                                <div
                                                    className={`max-w-[85%] ${
                                                        msg.role === 'user'
                                                            ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-2xl rounded-tr-sm'
                                                            : 'bg-gray-700/80 text-gray-100 rounded-2xl rounded-tl-sm border border-gray-600'
                                                    } p-4 shadow-lg`}
                                                >
                                                    {/* 格式化的消息内容 */}
                                                    <div className="prose prose-invert prose-sm max-w-none">
                                                        {msg.content.split('\n').map((line, i) => {
                                                            // 检测代码块 (反引号包裹)
                                                            if (line.includes('`')) {
                                                                const parts = line.split(/(`[^`]+`)/g);
                                                                return (
                                                                    <p key={i} className="mb-2 last:mb-0">
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
                                                            
                                                            // 检测列表项 (- 或 * 开头)
                                                            if (line.trim().match(/^[-*]\s/)) {
                                                                return (
                                                                    <li key={i} className="ml-4 mb-1">
                                                                        {line.trim().replace(/^[-*]\s/, '')}
                                                                    </li>
                                                                );
                                                            }
                                                            
                                                            // 检测标题 (## 开头)
                                                            if (line.trim().startsWith('##')) {
                                                                return (
                                                                    <h3 key={i} className="font-bold text-lg mt-3 mb-2 text-purple-300">
                                                                        {line.replace(/^#+\s/, '')}
                                                                    </h3>
                                                                );
                                                            }
                                                            
                                                            // 检测粗体 (**text**)
                                                            if (line.includes('**')) {
                                                                const parts = line.split(/(\*\*[^*]+\*\*)/g);
                                                                return (
                                                                    <p key={i} className="mb-2 last:mb-0">
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
                                                            
                                                            // 普通文本
                                                            return line.trim() ? (
                                                                <p key={i} className="mb-2 last:mb-0 leading-relaxed">
                                                                    {line}
                                                                </p>
                                                            ) : (
                                                                <br key={i} />
                                                            );
                                                        })}
                                                    </div>

                                                    {/* 时间戳 */}
                                                    {msg.role === 'assistant' && (
                                                        <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                                            <span>✨</span>
                                                            <span>AI Response</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 用户头像 */}
                                                {msg.role === 'user' && (
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center ml-2 mt-1">
                                                        <span className="text-white text-sm">👤</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {isChatLoading && (
                                            <div className="flex justify-start items-start">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mr-2">
                                                    <span className="text-white text-sm">🤖</span>
                                                </div>
                                                <div className="bg-gray-700/80 p-4 rounded-2xl rounded-tl-sm border border-gray-600">
                                                    <div className="flex space-x-2">
                                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 输入区域 */}
                                    <div className="p-4 bg-gray-900/50 border-t border-purple-500/30">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                onKeyPress={handleChatKeyPress}
                                                placeholder="Type your question..."
                                                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                disabled={isChatLoading}
                                            />
                                            <button
                                                onClick={sendChatMessage}
                                                disabled={isChatLoading || !chatInput.trim()}
                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {isChatLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Send className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Editor & Results */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Code Editor */}
                            <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-purple-500/30 overflow-hidden">
                                {/* Toolbar */}
                                <div className="bg-gray-900/80 px-6 py-4 flex items-center justify-between border-b border-purple-500/30">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-400 flex items-center gap-2">
                                            🐍 Python 3
                                        </span>
                                        <span className="text-gray-600">|</span>
                                        <span className="text-xs text-gray-500">
                                            {code.split('\n').length} lines
                                        </span>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleRunCode}
                                            disabled={isRunning}
                                            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg disabled:cursor-not-allowed"
                                        >
                                            {isRunning ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Play className="w-4 h-4" />
                                            )}
                                            {isRunning ? 'Running...' : 'Run Code'}
                                        </button>
                                        <button
                                            onClick={handleSubmitCode}
                                            disabled={isRunning}
                                            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg disabled:cursor-not-allowed"
                                        >
                                            {isRunning ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                            {isRunning ? 'Submitting...' : 'Submit'}
                                        </button>
                                    </div>
                                </div>

                                {/* Monaco Editor */}
                                <div className="h-[500px]">
                                    <Editor
                                        height="100%"
                                        defaultLanguage="python"
                                        value={code}
                                        onChange={(value) => setCode(value || '')}
                                        onMount={handleEditorDidMount}
                                        theme="vs-dark"
                                        options={{
                                            fontSize: 14,
                                            minimap: { enabled: false },
                                            scrollBeyondLastLine: false,
                                            automaticLayout: true,
                                            tabSize: 4,
                                            wordWrap: 'on',
                                            lineNumbers: 'on',
                                            renderLineHighlight: 'all',
                                            suggestOnTriggerCharacters: true,
                                            quickSuggestions: true,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Output Panel */}
                            <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-purple-500/30 overflow-hidden">
                                <div className="bg-gray-900/80 px-6 py-3 border-b border-purple-500/30">
                                    <h3 className="text-white font-semibold flex items-center gap-2">
                                        📤 Output
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap min-h-[100px]">
                                        {output || 'Click "Run Code" to see output...'}
                                    </pre>
                                </div>
                            </div>

                            {/* Test Results */}
                            {testResults.length > 0 && (
                                <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-purple-500/30 overflow-hidden">
                                    <div className="bg-gray-900/80 px-6 py-3 border-b border-purple-500/30 flex items-center justify-between">
                                        <h3 className="text-white font-semibold flex items-center gap-2">
                                            🧪 Test Results
                                        </h3>
                                        <span className={`text-sm font-medium ${
                                            allTestsPassed ? 'text-green-400' : 'text-yellow-400'
                                        }`}>
                                            {passedTests}/{totalTests} passed
                                        </span>
                                    </div>
                                    <div className="p-6 space-y-3">
                                        {testResults.map((result, index) => (
                                            <div
                                                key={index}
                                                className={`p-4 rounded-lg border-2 transition-all ${
                                                    result.passed
                                                        ? 'bg-green-900/20 border-green-500/50 hover:bg-green-900/30'
                                                        : 'bg-red-900/20 border-red-500/50 hover:bg-red-900/30'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold text-white flex items-center gap-2">
                                                        {result.passed ? (
                                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                                        ) : (
                                                            <XCircle className="w-5 h-5 text-red-400" />
                                                        )}
                                                        Test Case {index + 1}
                                                    </span>
                                                    <span className={`text-sm font-medium ${
                                                        result.passed ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                        {result.passed ? 'Passed' : 'Failed'}
                                                    </span>
                                                </div>
                                                {!result.passed && (
                                                    <div className="text-sm space-y-1 font-mono mt-3">
                                                        <div className="text-gray-400">
                                                            Input: <span className="text-white">{result.input || 'N/A'}</span>
                                                        </div>
                                                        <div className="text-green-400">
                                                            Expected: <span className="text-white">{result.expected || 'N/A'}</span>
                                                        </div>
                                                        <div className="text-red-400">
                                                            Got: <span className="text-white">{result.actual || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}