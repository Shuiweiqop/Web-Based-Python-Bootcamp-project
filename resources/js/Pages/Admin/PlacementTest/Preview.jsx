import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
  ArrowLeft, 
  Clock, 
  FileQuestion, 
  Target, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Code
} from 'lucide-react';

export default function Preview({ test, questions }) {
  const [showAnswers, setShowAnswers] = useState(false);

  const getQuestionIcon = (type) => {
    switch (type) {
      case 'mcq':
        return <FileQuestion className="h-5 w-5 text-purple-600" />;
      case 'coding':
        return <Code className="h-5 w-5 text-blue-600" />;
      case 'true_false':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <FileQuestion className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 1:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 2:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 3:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={route('admin.placement-tests.show', test.test_id)}>
              <button className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-slate-700">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Test Preview
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Preview as students will see it
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                showAnswers
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {showAnswers ? 'Hide Answers' : 'Show Answers'}
            </button>
          </div>
        </div>
      }
    >
      <Head title={`Preview - ${test.title}`} />

      <div className="py-8">
        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
          {/* Test Header Card */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-slate-800">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {test.title}
                </h1>
                {test.description && (
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {test.description}
                  </p>
                )}
              </div>
            </div>

            {/* Test Info Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-slate-900">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                  <FileQuestion className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Questions</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {test.questions_count}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-slate-900">
                <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                  <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Points</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {test.total_points}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-slate-900">
                <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Time Limit</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {test.time_limit ? `${test.time_limit} min` : 'No limit'}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            {test.instructions && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-200">
                      Instructions
                    </h3>
                    <p className="mt-1 text-sm text-blue-800 dark:text-blue-300">
                      {test.instructions}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Questions List */}
          {questions && questions.length > 0 ? (
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div
                  key={question.question_id}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-slate-800"
                >
                  {/* Question Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600 dark:bg-purple-900 dark:text-purple-400">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getQuestionIcon(question.type)}
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {question.type_name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getDifficultyColor(question.difficulty_level)}`}>
                        {question.difficulty_name}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        {question.points} pts
                      </span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="mb-4">
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {question.question_text}
                    </p>
                  </div>

                  {/* Code Snippet (if exists) */}
                  {question.code_snippet && (
                    <div className="mb-4 rounded-lg border border-gray-200 bg-gray-900 p-4 dark:border-gray-700">
                      <pre className="overflow-x-auto text-sm text-gray-100">
                        <code>{question.code_snippet}</code>
                      </pre>
                    </div>
                  )}

                  {/* Options (for MCQ) */}
                  {question.type === 'mcq' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <div
                          key={option.option_id}
                          className={`rounded-lg border p-4 transition-all ${
                            showAnswers && option.is_correct
                              ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                              : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-900 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                              showAnswers && option.is_correct
                                ? 'border-green-600 bg-green-600'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {showAnswers && option.is_correct && (
                                <CheckCircle className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <span className={`font-medium ${
                              showAnswers && option.is_correct
                                ? 'text-green-900 dark:text-green-200'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {option.option_label}.
                            </span>
                            <span className={`flex-1 ${
                              showAnswers && option.is_correct
                                ? 'text-green-900 dark:text-green-200'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {option.option_text}
                            </span>
                            {showAnswers && option.is_correct && (
                              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                                ✓ Correct
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Correct Answer (for non-MCQ) */}
                  {question.type !== 'mcq' && showAnswers && (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-semibold text-green-900 dark:text-green-200">
                            Correct Answer:
                          </p>
                          <p className="mt-1 text-sm text-green-800 dark:text-green-300">
                            {question.correct_answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  {showAnswers && question.explanation && (
                    <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-semibold text-blue-900 dark:text-blue-200">
                            Explanation:
                          </p>
                          <p className="mt-1 text-sm text-blue-800 dark:text-blue-300">
                            {question.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-slate-800">
              <FileQuestion className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                No Questions Yet
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                This test doesn't have any questions yet. Add some questions to see the preview.
              </p>
              <Link href={route('admin.placement-tests.questions.create', test.test_id)}>
                <button className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700">
                  Add Questions
                </button>
              </Link>
            </div>
          )}

          {/* Bottom Actions */}
          {questions && questions.length > 0 && (
            <div className="mt-6 flex justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-slate-800">
              <Link href={route('admin.placement-tests.show', test.test_id)}>
                <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-slate-700">
                  Back to Test
                </button>
              </Link>
              <div className="flex gap-2">
                <Link href={route('admin.placement-tests.questions.index', test.test_id)}>
                  <button className="rounded-lg border border-purple-300 px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900">
                    Manage Questions
                  </button>
                </Link>
                <Link href={route('admin.placement-tests.edit', test.test_id)}>
                  <button className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
                    Edit Test
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
            <h4 className="font-semibold text-purple-900 dark:text-purple-200">
              💡 Preview Mode
            </h4>
            <p className="mt-2 text-sm text-purple-800 dark:text-purple-300">
              This is how students will see the test. Use the "Show Answers" toggle to view correct answers and explanations. 
              Questions {test.shuffle_questions ? 'will be' : 'will not be'} shuffled when students take the test.
            </p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}