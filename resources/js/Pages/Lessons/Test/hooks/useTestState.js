import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';

export const useTestState = ({ lesson, test, studentStats }) => {
    // Test states: 'instructions', 'active', 'completed'
    const [testState, setTestState] = useState('instructions');
    const [timeRemaining, setTimeRemaining] = useState(test.time_limit ? test.time_limit * 60 : null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    
    // Multi-question state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answersMap, setAnswersMap] = useState({}); // { questionIndex: answerObject }
    
    // Refs for timer management
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);
    const autoSaveRef = useRef(null);

    // Derive questions array - support both single and multi-question tests
    const questions = test.questions || [test]; // Fallback to single question format
    const totalQuestions = questions.length;
    const currentQuestion = questions[currentQuestionIndex] || test;
    const currentAnswer = answersMap[currentQuestionIndex] || {};

    // Timer effect
    useEffect(() => {
        if (testState === 'active' && timeRemaining > 0) {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleTimeUp();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [testState, timeRemaining]);

    // Auto-save effect
    useEffect(() => {
        if (testState === 'active' && Object.keys(answersMap).length > 0) {
            if (autoSaveRef.current) {
                clearTimeout(autoSaveRef.current);
            }
            
            autoSaveRef.current = setTimeout(() => {
                autoSaveAnswers();
            }, 2000);
        }

        return () => {
            if (autoSaveRef.current) {
                clearTimeout(autoSaveRef.current);
            }
        };
    }, [answersMap, testState]);

    // Initialize test and answers
    const startTest = () => {
        setTestState('active');
        startTimeRef.current = Date.now();
        setCurrentQuestionIndex(0);
        
        // Initialize answers map for all questions
        const initialAnswers = {};
        questions.forEach((question, index) => {
            initialAnswers[index] = getInitialAnswer(question.type || test.type);
        });
        setAnswersMap(initialAnswers);
    };

    const getInitialAnswer = (questionType) => {
        switch (questionType) {
            case 'mcq':
                return { selected: '' };
            case 'true_false':
                return { answer: '' };
            case 'short_answer':
                return { text: '' };
            case 'coding':
                return { code: '' };
            default:
                return {};
        }
    };

    const updateAnswer = (newAnswer) => {
        setAnswersMap(prev => ({
            ...prev,
            [currentQuestionIndex]: { ...prev[currentQuestionIndex], ...newAnswer }
        }));
    };

    // Navigation functions
    const nextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const jumpToQuestion = (questionIndex) => {
        if (questionIndex >= 0 && questionIndex < totalQuestions) {
            setCurrentQuestionIndex(questionIndex);
        }
    };

    // Validation functions
    const validateCurrentAnswer = () => {
        const answer = answersMap[currentQuestionIndex];
        const questionType = currentQuestion.type || test.type;
        
        switch (questionType) {
            case 'mcq':
                return answer?.selected && answer.selected.trim() !== '';
            case 'true_false':
                return answer?.answer && answer.answer.trim() !== '';
            case 'short_answer':
                return answer?.text && answer.text.trim() !== '';
            case 'coding':
                return answer?.code && answer.code.trim() !== '';
            default:
                return false;
        }
    };

    const validateAllAnswers = () => {
        return questions.every((question, index) => {
            const answer = answersMap[index];
            const questionType = question.type || test.type;
            
            switch (questionType) {
                case 'mcq':
                    return answer?.selected && answer.selected.trim() !== '';
                case 'true_false':
                    return answer?.answer && answer.answer.trim() !== '';
                case 'short_answer':
                    return answer?.text && answer.text.trim() !== '';
                case 'coding':
                    return answer?.code && answer.code.trim() !== '';
                default:
                    return false;
            }
        });
    };

    const getAnsweredQuestionsCount = () => {
        return questions.filter((question, index) => {
            const answer = answersMap[index];
            const questionType = question.type || test.type;
            
            switch (questionType) {
                case 'mcq':
                    return answer?.selected && answer.selected.trim() !== '';
                case 'true_false':
                    return answer?.answer && answer.answer.trim() !== '';
                case 'short_answer':
                    return answer?.text && answer.text.trim() !== '';
                case 'coding':
                    return answer?.code && answer.code.trim() !== '';
                default:
                    return false;
            }
        }).length;
    };

    // Computed properties
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    const canGoNext = currentQuestionIndex < totalQuestions - 1;
    const canGoPrev = currentQuestionIndex > 0;
    const answeredCount = getAnsweredQuestionsCount();
    const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    // Timer and time utilities
    const calculateTimeTaken = () => {
        if (startTimeRef.current) {
            return Math.floor((Date.now() - startTimeRef.current) / 1000 / 60); // in minutes
        }
        return 0;
    };

    const formatTime = (seconds) => {
        if (seconds === null) return '';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleTimeUp = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        
        alert('Time is up! Your test will be submitted automatically.');
        submitTest(true); // 传递 forceSubmit = true
    };

    // Test submission
    // Test submission - 修复版本
// Test submission - 修复版本
const submitTest = (forceSubmit = false) => {
    if (isSubmitting) return;
    
    // 只有在非强制提交时才验证答案
    if (!forceSubmit && !validateAllAnswers()) {
        alert('Please answer all questions before submitting.');
        return;
    }

    setIsSubmitting(true);
    const timeTaken = calculateTimeTaken();
    
    // Convert answersMap to the format expected by backend
    const submissionData = {
        answers: answersMap,
        time_taken: timeTaken
    };

    if (forceSubmit) {
        submissionData.force_submit = true;
    }

    router.post(
        route('lessons.tests.submit', [lesson.lesson_id, test.test_id]), 
        submissionData,
        {
            onSuccess: (page) => {
                // 🔧 修复：添加详细的调试日志
                console.log('=== TEST SUBMISSION SUCCESS ===');
                console.log('Complete page.props:', page.props);
                console.log('page.props.flash:', page.props.flash);
                
                // 🔧 新增：检查每个可能的位置
                console.log('=== CHECKING ALL POSSIBLE DATA LOCATIONS ===');
                console.log('page.props.submissionResult:', page.props.submissionResult);
                console.log('page.props.success:', page.props.success);
                console.log('page.props.score:', page.props.score);
                console.log('page.props.flash.submissionResult:', page.props.flash?.submissionResult);
                
                // 🔧 修复：检查所有可能的数据位置
                let resultData = null;
                
                // 1. 首先检查 submissionResult（方案2的情况）
                if (page.props.submissionResult && typeof page.props.submissionResult === 'object') {
                    console.log('✅ Found submissionResult in page.props');
                    resultData = page.props.submissionResult;
                }
                // 2. 检查是否直接在 page.props 的顶层
                else if (page.props.score !== undefined && page.props.score !== null) {
                    console.log('✅ Found score in page.props top level');
                    resultData = {
                        success: true,
                        score: page.props.score,
                        max_score: page.props.max_score || page.props.max_possible_score,
                        percentage: page.props.percentage || page.props.percentage_score,
                        grade_letter: page.props.grade_letter,
                        is_passed: page.props.is_passed,
                        feedback: page.props.feedback || page.props.auto_feedback,
                        attempt_number: page.props.attempt_number,
                        submission_id: page.props.submission_id
                    };
                }
                // 3. 检查 flash 数据中是否有有效数据
                else if (page.props.flash && typeof page.props.flash === 'object') {
                    const flashKeys = Object.keys(page.props.flash);
                    console.log('Flash keys:', flashKeys);
                    
                    if (page.props.flash.score !== undefined && page.props.flash.score !== null) {
                        console.log('✅ Found score in flash');
                        resultData = page.props.flash;
                    }
                }
                
                console.log('Final extracted resultData:', resultData);
                
                // 🔧 修复：更严格的数据验证
                if (resultData && resultData.score !== undefined && resultData.score !== null) {
                    console.log('✅ Setting submission result and completing test');
                    setSubmissionResult(resultData);
                    setTestState('completed');
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                    }
                    clearAutoSave();
                } else {
                    // 🔧 修复：显示可用的字段来帮助调试
                    console.error('❌ No valid submission result found');
                    console.log('Available props keys:', Object.keys(page.props));
                    console.log('Flash object keys:', page.props.flash ? Object.keys(page.props.flash) : 'flash is null');
                    
                    // 🔧 新增：检查是否有错误信息
                    if (page.props.errors && Object.keys(page.props.errors).length > 0) {
                        console.log('❌ Validation errors found:', page.props.errors);
                        alert('Submission failed due to validation errors. Check console for details.');
                    } else {
                        alert('Test submitted but unable to display results. The backend might not be returning the expected data structure. Check console for details.');
                    }
                    
                    // 临时显示一个假结果来测试UI
                    console.log('🔧 Setting temporary fake result for UI testing...');
                    setSubmissionResult({
                        success: true,
                        score: 0,
                        max_score: 100,
                        percentage: 0,
                        grade_letter: 'F',
                        is_passed: false,
                        feedback: 'Unable to retrieve actual results from backend. This is a temporary display.',
                        attempt_number: 1
                    });
                    setTestState('completed');
                }
            },
            onError: (errors) => {
                console.error('Submission failed:', errors);
                if (forceSubmit) {
                    alert('Test submitted due to time limit, but there was an error processing it. Returning to lesson.');
                    goBack();
                } else {
                    alert('Failed to submit test. Please try again.');
                }
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        }
    );
};

    // Auto-save functionality
    const autoSaveAnswers = () => {
        try {
            const saveData = {
                testId: test.test_id,
                lessonId: lesson.lesson_id,
                answersMap: answersMap,
                currentQuestionIndex: currentQuestionIndex,
                timestamp: Date.now()
            };
            localStorage.setItem(`test_autosave_${test.test_id}`, JSON.stringify(saveData));
        } catch (error) {
            console.warn('Failed to auto-save answers:', error);
        }
    };

    const loadAutoSavedAnswers = () => {
        try {
            const saved = localStorage.getItem(`test_autosave_${test.test_id}`);
            if (saved) {
                const saveData = JSON.parse(saved);
                if (Date.now() - saveData.timestamp < 3600000) {
                    setAnswersMap(saveData.answersMap);
                    setCurrentQuestionIndex(saveData.currentQuestionIndex);
                    return true;
                }
            }
        } catch (error) {
            console.warn('Failed to load auto-saved answers:', error);
        }
        return false;
    };

    const clearAutoSave = () => {
        try {
            localStorage.removeItem(`test_autosave_${test.test_id}`);
        } catch (error) {
            console.warn('Failed to clear auto-save:', error);
        }
    };

    // Test control
    const cancelTest = () => {
        if (confirm('Are you sure you want to cancel? Your progress will be lost.')) {
            setTestState('instructions');
            setAnswersMap({});
            setCurrentQuestionIndex(0);
            clearAutoSave();
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            setTimeRemaining(test.time_limit ? test.time_limit * 60 : null);
        }
    };

    const goBack = () => {
        router.visit(route('lessons.tests.index', lesson.lesson_id));
    };

    // Return all UI needed values and functions
    return {
        // Core test state
        testState,
        timeRemaining,
        isSubmitting,
        submissionResult,
        
        // Question state
        currentQuestionIndex,
        currentQuestion,
        currentAnswer,
        answersMap,
        totalQuestions,
        
        // Computed properties
        isLastQuestion,
        canGoNext,
        canGoPrev,
        answeredCount,
        progressPercentage,
        
        // Actions
        startTest,
        submitTest,
        updateAnswer,
        cancelTest,
        goBack,
        
        // Navigation
        nextQuestion,
        prevQuestion,
        jumpToQuestion,
        
        // Validation
        validateCurrentAnswer,
        validateAllAnswers,
        getAnsweredQuestionsCount,
        
        // Utilities
        formatTime,
        calculateTimeTaken,
        
        // Auto-save
        loadAutoSavedAnswers,
        clearAutoSave
    };
};