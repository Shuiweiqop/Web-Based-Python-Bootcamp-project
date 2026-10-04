import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

// Multiple-choice quiz. The page never has the answer key — the server strips
// it — so this component only collects the student's choices and hands them
// to onComplete; the server grades them and the results screen shows how
// each question went.
export default function QuizExercise({ exercise, onComplete, isTimeUp = false }) {
  const questions = useMemo(
    () => (Array.isArray(exercise.content?.questions) ? exercise.content.questions : []),
    [exercise.content?.questions]
  );

  const [selections, setSelections] = useState(() => questions.map(() => null));
  const submittedRef = useRef(false);

  const answeredCount = selections.filter((s) => s !== null).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  const submit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    // The score is worked out on the server; 0 is only a placeholder.
    onComplete?.(0, { totalItems: questions.length }, { selections });
  };

  // When time runs out, hand in whatever has been answered.
  useEffect(() => {
    if (isTimeUp) submit();
  }, [isTimeUp]);

  const choose = (questionIndex, optionIndex) => {
    setSelections((prev) => prev.map((s, i) => (i === questionIndex ? optionIndex : s)));
  };

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-600">
        This quiz has no questions yet.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <QuestionMarkCircleIcon className="h-8 w-8" />
          <div>
            <div className="text-lg font-bold">{exercise.title}</div>
            <div className="text-sm text-white/80">Pick one answer for each question.</div>
          </div>
        </div>
        <div className="rounded-xl bg-white/20 px-4 py-2 text-right">
          <div className="text-xs uppercase tracking-wide opacity-80">Answered</div>
          <div className="text-xl font-bold">{answeredCount}/{questions.length}</div>
        </div>
      </div>

      <ol className="space-y-5">
        {questions.map((question, qIndex) => (
          <li key={qIndex} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <fieldset>
              <legend className="mb-4 font-semibold text-gray-900">
                <span className="mr-2 text-indigo-600">{qIndex + 1}.</span>
                {question.question}
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(question.options || []).map((option, oIndex) => {
                  const isSelected = selections[qIndex] === oIndex;
                  return (
                    <label
                      key={oIndex}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        checked={isSelected}
                        onChange={() => choose(qIndex, oIndex)}
                        className="h-4 w-4 text-indigo-600"
                      />
                      <span className="font-mono text-sm">{option}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={!allAnswered}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircleIcon className="h-5 w-5" />
          Submit Answers
        </button>
        {!allAnswered && (
          <p className="text-sm text-gray-500">Answer every question to submit.</p>
        )}
      </div>
    </div>
  );
}
