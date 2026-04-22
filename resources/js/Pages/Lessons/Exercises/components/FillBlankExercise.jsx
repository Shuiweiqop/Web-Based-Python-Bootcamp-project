import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Award, Lightbulb, ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function FillBlankExercise({ exercise, lesson, onScoreUpdate, onComplete, isTimeUp, timeLeft }) {
  const sentences = exercise.content?.sentences || [];
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({});
  const [currentScore, setCurrentScore] = useState(0);

  // Initialize empty answers for all blanks - only run once
  useEffect(() => {
    const initialAnswers = {};
    sentences.forEach((sentence, sentenceIdx) => {
      sentence.blanks?.forEach((blank, blankIdx) => {
        const key = `${sentenceIdx}-${blankIdx}`;
        initialAnswers[key] = '';
      });
    });
    setAnswers(initialAnswers);
  }, [sentences.length]);

  // Auto-submit when time is up
  useEffect(() => {
    if (isTimeUp && !showResults) {
      handleSubmit();
    }
  }, [isTimeUp]);

  const handleAnswerChange = (sentenceIdx, blankIdx, value) => {
    const key = `${sentenceIdx}-${blankIdx}`;
    
    setAnswers(prevAnswers => {
      const updated = {
        ...prevAnswers,
        [key]: value
      };
      return updated;
    });
  };

  const checkAnswer = (sentence, blank, userAnswer) => {
    const trimmedAnswer = userAnswer.trim();
    
    if (!trimmedAnswer) {
      return false;
    }

    const correctAnswer = blank.correctAnswer;
    const alternatives = blank.alternativeAnswers || [];
    const allAcceptableAnswers = [correctAnswer, ...alternatives];

    // Check case sensitivity
    if (sentence.caseSensitive) {
      return allAcceptableAnswers.includes(trimmedAnswer);
    } else {
      const lowerAnswer = trimmedAnswer.toLowerCase();
      return allAcceptableAnswers.some(ans => ans.toLowerCase() === lowerAnswer);
    }
  };

  const handleSubmit = () => {
    let correct = 0;
    let total = 0;
    const newResults = {};

    sentences.forEach((sentence, sentenceIdx) => {
      sentence.blanks?.forEach((blank, blankIdx) => {
        total++;
        const key = `${sentenceIdx}-${blankIdx}`;
        const userAnswer = answers[key] || '';
        const isCorrect = checkAnswer(sentence, blank, userAnswer);
        
        newResults[key] = {
          isCorrect,
          userAnswer,
          correctAnswer: blank.correctAnswer,
          alternatives: blank.alternativeAnswers || []
        };

        if (isCorrect) {
          correct++;
        }
      });
    });

    console.log('📊 Results:', { correct, total, newResults });
    setResults(newResults);
    setShowResults(true);

    // Calculate score
    const calculatedScore = total > 0 ? Math.round((correct / total) * exercise.max_score) : 0;
    setCurrentScore(calculatedScore);
    
    console.log('📊 Fill Blank Results:', {
      correct,
      total,
      maxScore: exercise.max_score,
      calculatedScore
    });
    
    // 🔥 Update parent score first
    if (onScoreUpdate) {
      console.log('📤 Calling onScoreUpdate with score:', calculatedScore);
      onScoreUpdate(calculatedScore);
    }

    // 🔥 Wait to show results, then complete with the calculated score
    setTimeout(() => {
      if (onComplete) {
        console.log('✅ Calling onComplete with score:', calculatedScore);
        onComplete(calculatedScore);
      }
    }, 2000);
  };

  const renderSentenceWithBlanks = (sentence, sentenceIdx) => {
    const parts = [];
    const text = sentence.text;
    const blankPattern = /___+/g;
    const matches = [...text.matchAll(blankPattern)];
    
    let lastIndex = 0;

    matches.forEach((match, blankIdx) => {
      // Add text before the blank
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${sentenceIdx}-${blankIdx}-before`}>
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }

      const blank = sentence.blanks?.[blankIdx];
      const key = `${sentenceIdx}-${blankIdx}`;
      const userAnswer = answers[key] !== undefined ? answers[key] : '';
      const result = results[key];

      // Add the blank input
      parts.push(
        <span key={`blank-${key}`} className="inline-block mx-1">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => {
              const newValue = e.target.value;
              handleAnswerChange(sentenceIdx, blankIdx, newValue);
            }}
            disabled={showResults}
            className={`
              px-3 py-2 border-2 rounded-lg font-mono text-center
              transition-all duration-200
              ${showResults 
                ? result?.isCorrect 
                  ? 'border-green-500 bg-green-50 text-green-800' 
                  : 'border-red-500 bg-red-50 text-red-800'
                : 'border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none hover:border-blue-400 bg-white'
              }
            `}
            style={{ 
              width: `${Math.max(120, (blank?.correctAnswer?.length || 5) * 15)}px`,
              minWidth: '120px'
            }}
            placeholder="Type here..."
            autoComplete="off"
            spellCheck="false"
          />
          {showResults && result && !result.isCorrect && (
            <div className="text-xs text-green-600 mt-1 font-mono">
              ✓ {result.correctAnswer}
              {result.alternatives.length > 0 && (
                <span className="text-gray-500"> (or {result.alternatives.join(', ')})</span>
              )}
            </div>
          )}
        </span>
      );

      lastIndex = match.index + match[0].length;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${sentenceIdx}-end`}>
          {text.substring(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  const getTotalBlanks = () => {
    return sentences.reduce((total, sentence) => {
      return total + (sentence.blanks?.length || 0);
    }, 0);
  };

  const getCorrectAnswers = () => {
    return Object.values(results).filter(r => r.isCorrect).length;
  };

  if (sentences.length === 0) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">No sentences configured for this exercise.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link
          href={`/lessons/${lesson.lesson_id}`}
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lesson
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {exercise.title || 'Fill in the Blanks'}
              </h2>
              <p className="text-gray-600">
                {exercise.description || 'Complete the sentences by filling in the missing words'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-600">
                {getTotalBlanks()}
              </div>
              <div className="text-sm text-gray-600">Total Blanks</div>
            </div>
          </div>

          {showResults && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-600">
                      {getCorrectAnswers()} Correct
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-600">
                      {getTotalBlanks() - getCorrectAnswers()} Incorrect
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span className="font-bold text-yellow-600">
                    Score: {currentScore}/{exercise.max_score}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        {!showResults && (
          <div className="bg-cyan-50 border-2 border-cyan-300 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-cyan-900 mb-1">Instructions</h4>
                <ul className="text-sm text-cyan-800 space-y-1">
                  <li>• Type your answers in the blank spaces</li>
                  <li>• Some questions may accept multiple correct answers</li>
                  <li>• Click "Submit Answers" when you're ready</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Sentences */}
        <div className="space-y-4">
          {sentences.map((sentence, sentenceIdx) => (
            <div
              key={sentence.id}
              className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200 hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-bold text-sm">
                    {sentenceIdx + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-lg leading-relaxed text-gray-800">
                    {renderSentenceWithBlanks(sentence, sentenceIdx)}
                  </div>
                  {sentence.caseSensitive && !showResults && (
                    <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                      <span>⚠️</span>
                      <span>Case sensitive - capitalization matters!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        {!showResults && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={isTimeUp}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-lg rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Answers
            </button>
          </div>
        )}

        {/* Results Message */}
        {showResults && (
          <div className="mt-8 text-center">
            <div className={`inline-block px-6 py-3 rounded-xl font-semibold ${
              getCorrectAnswers() === getTotalBlanks()
                ? 'bg-green-100 text-green-800'
                : getCorrectAnswers() >= getTotalBlanks() * 0.7
                ? 'bg-blue-100 text-blue-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {getCorrectAnswers() === getTotalBlanks()
                ? '🎉 Perfect! All answers correct!'
                : getCorrectAnswers() >= getTotalBlanks() * 0.7
                ? '✨ Great job! Keep it up!'
                : '💪 Keep practicing!'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}