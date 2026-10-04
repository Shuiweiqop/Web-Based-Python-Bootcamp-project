import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Lightbulb } from 'lucide-react';

// Fill-in-the-blank. The page never has the answers — the server strips them
// — so this component only collects what was typed and hands it to
// onComplete; the server grades it and the results screen shows each blank.
export default function FillBlankExercise({ exercise, onComplete, isTimeUp }) {
  const sentences = exercise.content?.sentences || [];
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const submittedRef = useRef(false);
  const contentSignature = useMemo(() => JSON.stringify(sentences), [sentences]);

  useEffect(() => {
    const initialAnswers = {};
    sentences.forEach((sentence, sentenceIndex) => {
      sentence.blanks?.forEach((blank, blankIndex) => {
        initialAnswers[`${sentenceIndex}-${blankIndex}`] = '';
      });
    });
    setAnswers(initialAnswers);
    setSubmitted(false);
    submittedRef.current = false;
  }, [contentSignature]);

  const totalBlanks = sentences.reduce((total, sentence) => total + (sentence.blanks?.length || 0), 0);
  const answeredBlanks = Object.values(answers).filter((answer) => answer.trim() !== '').length;
  const answerProgress = totalBlanks > 0 ? Math.round((answeredBlanks / totalBlanks) * 100) : 0;

  const handleAnswerChange = (sentenceIndex, blankIndex, value) => {
    setAnswers((previous) => ({
      ...previous,
      [`${sentenceIndex}-${blankIndex}`]: value,
    }));
  };

  const handleSubmit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);

    // What was typed, per sentence then per blank, in order.
    const typed = sentences.map((sentence, sentenceIndex) =>
      (sentence.blanks || []).map((blank, blankIndex) => answers[`${sentenceIndex}-${blankIndex}`] || '')
    );

    // The score is worked out on the server; 0 is only a placeholder.
    onComplete?.(0, { totalItems: totalBlanks }, { answers: typed });
  };

  useEffect(() => {
    if (isTimeUp && !submittedRef.current) {
      handleSubmit();
    }
  }, [isTimeUp]);

  const renderSentenceWithBlanks = (sentence, sentenceIndex) => {
    const parts = [];
    const text = sentence.text || '';
    const matches = [...text.matchAll(/___+/g)];
    let lastIndex = 0;

    matches.forEach((match, blankIndex) => {
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${sentenceIndex}-${blankIndex}-before`}>{text.substring(lastIndex, match.index)}</span>);
      }

      const key = `${sentenceIndex}-${blankIndex}`;

      parts.push(
        <span key={`blank-${key}`} className="inline-block mx-1 align-middle">
          <input
            type="text"
            value={answers[key] ?? ''}
            onChange={(event) => handleAnswerChange(sentenceIndex, blankIndex, event.target.value)}
            disabled={submitted}
            aria-label={`Sentence ${sentenceIndex + 1}, blank ${blankIndex + 1}`}
            className="w-40 px-3 py-2 border-2 rounded-lg font-mono text-center transition-all duration-200 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none hover:border-blue-400 bg-white disabled:bg-gray-100"
            placeholder="Type here..."
            autoComplete="off"
            spellCheck="false"
          />
        </span>
      );

      lastIndex = match.index + match[0].length;
    });

    if (lastIndex < text.length) {
      parts.push(<span key={`text-${sentenceIndex}-end`}>{text.substring(lastIndex)}</span>);
    }

    return parts;
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
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {exercise.title || 'Fill in the Blanks'}
              </h2>
              <p className="text-gray-600">
                {exercise.description || 'Complete the sentences by filling in the missing words.'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-600">{totalBlanks}</div>
              <div className="text-sm text-gray-600">Total Blanks</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-semibold text-gray-700">Answer progress</span>
              <span className="font-bold text-indigo-600">{answeredBlanks}/{totalBlanks} filled</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all"
                style={{ width: `${answerProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-cyan-50 border-2 border-cyan-300 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-cyan-900 mb-1">Instructions</h4>
              <ul className="text-sm text-cyan-800 space-y-1">
                <li>Type your answers in the blank spaces.</li>
                <li>Some questions may accept multiple correct answers.</li>
                <li>Use hints when available, then submit when ready.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {sentences.map((sentence, sentenceIndex) => (
            <div
              key={sentence.id || sentenceIndex}
              className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200 hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-bold text-sm">{sentenceIndex + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="text-lg leading-relaxed text-gray-800">
                    {renderSentenceWithBlanks(sentence, sentenceIndex)}
                  </div>

                  {sentence.caseSensitive && (
                    <div className="mt-2 text-xs text-amber-700">
                      Note: this sentence is case sensitive.
                    </div>
                  )}

                  {sentence.blanks?.some((blank) => blank.hint) && (
                    <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                      <span className="font-semibold">Hint: </span>
                      {sentence.blanks
                        .map((blank, blankIndex) => blank.hint ? `Blank ${blankIndex + 1}: ${blank.hint}` : null)
                        .filter(Boolean)
                        .join(' | ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitted || isTimeUp || answeredBlanks === 0}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-lg rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitted ? 'Submitting...' : answeredBlanks === 0 ? 'Type at least one answer' : 'Submit Answers'}
          </button>
        </div>
      </div>
    </div>
  );
}
