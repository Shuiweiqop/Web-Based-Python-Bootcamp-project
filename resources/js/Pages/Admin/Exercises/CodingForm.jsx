import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus, Trash2, Code, TestTube } from 'lucide-react';

const AdminCodingExerciseForm = ({ lesson, exercise = null }) => {
  const { data, setData, post, put, processing, errors } = useForm({
    title: exercise?.title || '',
    description: exercise?.description || '',
    max_score: exercise?.max_score || 100,
    exercise_type: 'coding',
    language: 'python',
    starter_code: exercise?.content?.starter_code || '# Write your solution here\ndef solution():\n    pass\n',
    instructions: exercise?.content?.instructions || '',
    test_cases: exercise?.content?.test_cases || [
      { input: '', expected_output: '', description: 'Test case 1' }
    ],
    is_active: exercise?.is_active ?? true,
  });

  const [activeTestCase, setActiveTestCase] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();

    const content = {
      language: data.language,
      starter_code: data.starter_code,
      instructions: data.instructions,
      test_cases: data.test_cases,
    };

    const formData = {
      ...data,
      content: JSON.stringify(content),
      lesson_id: lesson.lesson_id,
    };

    if (exercise) {
      put(`/admin/lessons/${lesson.lesson_id}/exercises/${exercise.exercise_id}`, {
        data: formData,
      });
    } else {
      post(`/admin/lessons/${lesson.lesson_id}/exercises`, {
        data: formData,
      });
    }
  };

  const addTestCase = () => {
    setData('test_cases', [
      ...data.test_cases,
      { input: '', expected_output: '', description: `Test case ${data.test_cases.length + 1}` }
    ]);
    setActiveTestCase(data.test_cases.length);
  };

  const removeTestCase = (index) => {
    if (data.test_cases.length === 1) {
      alert('You must have at least one test case');
      return;
    }
    const newTestCases = data.test_cases.filter((_, i) => i !== index);
    setData('test_cases', newTestCases);
    if (activeTestCase >= newTestCases.length) {
      setActiveTestCase(newTestCases.length - 1);
    }
  };

  const updateTestCase = (index, field, value) => {
    const newTestCases = [...data.test_cases];
    newTestCases[index][field] = value;
    setData('test_cases', newTestCases);
  };

  const languageTemplates = {
    python: '# Write your solution here\ndef solution():\n    pass\n',
    javascript: '// Write your solution here\nfunction solution() {\n    \n}\n',
    java: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n',
  };

  const handleLanguageChange = (lang) => {
    setData('language', lang);
    if (!exercise) {
      setData('starter_code', languageTemplates[lang] || '');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Code className="h-8 w-8 mr-3" />
            {exercise ? 'Edit' : 'Create'} Coding Exercise
          </h1>
          <p className="text-purple-100 mt-2">For lesson: {lesson.title}</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Exercise Title *
              </label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                placeholder="e.g., Sum Two Numbers"
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Max Score *
              </label>
              <input
                type="number"
                value={data.max_score}
                onChange={(e) => setData('max_score', parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
              rows="3"
              placeholder="Brief description of the exercise"
            />
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Programming Language *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {['python', 'javascript', 'java', 'cpp', 'c'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    data.language === lang
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Detailed Instructions
            </label>
            <textarea
              value={data.instructions}
              onChange={(e) => setData('instructions', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none font-mono text-sm"
              rows="4"
              placeholder="Explain the problem in detail, including input/output format, constraints, etc."
            />
          </div>

          {/* Starter Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Starter Code Template *
            </label>
            <textarea
              value={data.starter_code}
              onChange={(e) => setData('starter_code', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none font-mono text-sm bg-slate-900 text-green-400"
              rows="10"
            />
            <p className="text-gray-500 text-sm mt-2">
              This is the initial code students will see. Provide a basic structure.
            </p>
          </div>

          {/* Test Cases */}
          <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <TestTube className="h-6 w-6 mr-2 text-blue-600" />
                Test Cases
              </h3>
              <button
                type="button"
                onClick={addTestCase}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Test Case
              </button>
            </div>

            {/* Test Case Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {data.test_cases.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveTestCase(index)}
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    activeTestCase === index
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Test {index + 1}
                </button>
              ))}
            </div>

            {/* Active Test Case inputs */}
            {data.test_cases[activeTestCase] && (
              <div className="bg-white rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-900">Test Case {activeTestCase + 1}</h4>
                  {data.test_cases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTestCase(activeTestCase)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={data.test_cases[activeTestCase].description}
                    onChange={(e) => updateTestCase(activeTestCase, 'description', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., Basic addition test"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Input (stdin)
                  </label>
                  <textarea
                    value={data.test_cases[activeTestCase].input}
                    onChange={(e) => updateTestCase(activeTestCase, 'input', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
                    rows="3"
                    placeholder="Enter input data (if any)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Output *
                  </label>
                  <textarea
                    value={data.test_cases[activeTestCase].expected_output}
                    onChange={(e) => updateTestCase(activeTestCase, 'expected_output', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
                    rows="3"
                    placeholder="Expected output"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={data.is_active}
              onChange={(e) => setData('is_active', e.target.checked)}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Active (visible to students)
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={processing}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {processing ? 'Saving...' : (exercise ? 'Update Exercise' : 'Create Exercise')}
            </button>
            <a
              href={`/admin/lessons/${lesson.lesson_id}/exercises`}
              className="px-8 py-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors text-center"
            >
              Cancel
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCodingExerciseForm;