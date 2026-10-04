import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ListChecks, Plus, Trash2, X } from 'lucide-react';

// Authoring for quiz exercises: { questions: [{ question, options, correct, points, explanation }] }.
// correct is the index of the right option. The answer key is stripped before
// a student sees the quiz and is used by the server to grade it.

const MAX_OPTIONS = 6;

const blankQuestion = () => ({ question: '', options: ['', ''], correct: 0, points: null, explanation: '' });

// What would stop this question being gradable, if anything.
export const questionProblems = (question) => {
  const problems = [];
  if (!question.question?.trim()) problems.push('needs a question');
  const options = question.options || [];
  if (options.length < 2) problems.push('needs at least two options');
  if (options.some((option) => !option?.trim())) problems.push('has an empty option');
  if (!(question.correct >= 0 && question.correct < options.length)) problems.push('has no correct option');
  return problems;
};

export default function QuizConfig({ data, setData, errors = {} }) {
  const initial = Array.isArray(data.content?.questions) && data.content.questions.length
    ? data.content.questions
    : [blankQuestion()];
  const [questions, setQuestions] = useState(initial);

  const save = (next) => {
    setQuestions(next);
    setData('content', { ...(data.content || {}), questions: next });
  };

  const updateQuestion = (index, changes) => {
    save(questions.map((q, i) => (i === index ? { ...q, ...changes } : q)));
  };

  const addQuestion = () => save([...questions, blankQuestion()]);

  const removeQuestion = (index) => {
    if (questions.length <= 1) return;
    save(questions.filter((_, i) => i !== index));
  };

  const updateOption = (qIndex, oIndex, value) => {
    const options = [...questions[qIndex].options];
    options[oIndex] = value;
    updateQuestion(qIndex, { options });
  };

  const addOption = (qIndex) => {
    const options = questions[qIndex].options;
    if (options.length >= MAX_OPTIONS) return;
    updateQuestion(qIndex, { options: [...options, ''] });
  };

  // Keep the correct answer pointing at the same option when one is removed.
  const removeOption = (qIndex, oIndex) => {
    const question = questions[qIndex];
    if (question.options.length <= 2) return;
    const options = question.options.filter((_, i) => i !== oIndex);
    const correct = oIndex === question.correct ? 0 : oIndex < question.correct ? question.correct - 1 : question.correct;
    updateQuestion(qIndex, { options, correct });
  };

  const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  const problemCount = questions.filter((q) => questionProblems(q).length > 0).length;

  return (
    <div className="space-y-6 rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-sky-50 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-600 p-3">
            <ListChecks className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-indigo-950">Quiz Configuration</h3>
            <p className="text-sm text-indigo-700">
              Multiple-choice questions. Students never see which option is correct until they submit.
            </p>
          </div>
        </div>
        <div className="text-sm text-indigo-800">
          {questions.length} question{questions.length === 1 ? '' : 's'}
          {totalPoints > 0 && ` · ${totalPoints} points`}
        </div>
      </div>

      <p className="rounded-lg border border-indigo-200 bg-white p-3 text-sm text-indigo-800">
        Points are optional. When none are set, every question is worth the same; otherwise each question
        counts by its points. The score is scaled to the exercise&apos;s max score.
      </p>

      {problemCount > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" role="status">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {problemCount} question{problemCount === 1 ? '' : 's'} can&apos;t be graded yet — see the notes below.
        </div>
      )}

      <ol className="space-y-4">
        {questions.map((question, qIndex) => {
          const problems = questionProblems(question);
          const serverError = errors[`content.questions.${qIndex}.correct`] || errors[`content.questions.${qIndex}.question`];

          return (
            <li key={qIndex} className="rounded-xl border-2 border-indigo-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-bold text-indigo-900">Question {qIndex + 1}</span>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  disabled={questions.length <= 1}
                  className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-30"
                  aria-label={`Remove question ${qIndex + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <label className="mb-1 block text-sm font-semibold text-gray-700" htmlFor={`quiz-q-${qIndex}`}>
                Question
              </label>
              <textarea
                id={`quiz-q-${qIndex}`}
                value={question.question}
                onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                rows={2}
                className="mb-4 w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-gray-900 focus:border-indigo-400 focus:outline-none"
                placeholder="e.g. Which character starts a comment in Python?"
              />

              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-gray-700">Options — pick the correct one</legend>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`quiz-correct-${qIndex}`}
                        checked={question.correct === oIndex}
                        onChange={() => updateQuestion(qIndex, { correct: oIndex })}
                        className="h-4 w-4 text-indigo-600"
                        aria-label={`Question ${qIndex + 1}: option ${oIndex + 1} is correct`}
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        className={`flex-1 rounded-lg border-2 px-3 py-2 font-mono text-sm focus:outline-none ${
                          question.correct === oIndex ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 focus:border-indigo-400'
                        }`}
                        placeholder={`Option ${oIndex + 1}`}
                        aria-label={`Question ${qIndex + 1}: option ${oIndex + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(qIndex, oIndex)}
                        disabled={question.options.length <= 2}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                        aria-label={`Remove option ${oIndex + 1} from question ${qIndex + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {question.options.length < MAX_OPTIONS && (
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
                  >
                    <Plus className="h-4 w-4" /> Add option
                  </button>
                )}
              </fieldset>

              <div className="mt-4 grid gap-3 md:grid-cols-[8rem_1fr]">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700" htmlFor={`quiz-points-${qIndex}`}>
                    Points
                  </label>
                  <input
                    id={`quiz-points-${qIndex}`}
                    type="number"
                    min="0"
                    value={question.points ?? ''}
                    onChange={(e) => updateQuestion(qIndex, { points: e.target.value === '' ? null : Number(e.target.value) })}
                    className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none"
                    placeholder="Equal"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700" htmlFor={`quiz-explain-${qIndex}`}>
                    Explanation <span className="font-normal text-gray-500">(shown after submitting)</span>
                  </label>
                  <input
                    id={`quiz-explain-${qIndex}`}
                    type="text"
                    value={question.explanation ?? ''}
                    onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                    className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none"
                    placeholder="Why the correct option is right"
                  />
                </div>
              </div>

              {problems.length > 0 ? (
                <p className="mt-3 flex items-center gap-1 text-sm text-amber-700">
                  <AlertTriangle className="h-4 w-4" /> This question {problems.join(', ')}.
                </p>
              ) : (
                <p className="mt-3 flex items-center gap-1 text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Ready
                </p>
              )}
              {serverError && <p className="mt-1 text-sm text-rose-600">{serverError}</p>}
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        onClick={addQuestion}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
      >
        <Plus className="h-4 w-4" /> Add question
      </button>
      {errors['content.questions'] && <p className="text-sm text-rose-600">{errors['content.questions']}</p>}
    </div>
  );
}
