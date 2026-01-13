// resources/js/Pages/Admin/Exercises/components/CodingExerciseConfig.jsx
import React, { useState } from 'react';
import { Plus, Trash2, Code, TestTube } from 'lucide-react';

export default function CodingExerciseConfig({ data, setData, errors }) {
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('basic');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');

  // Python 模板库
  const pythonTemplates = {
    basic: '# Write your solution here\ndef solution():\n    pass\n',
    function: '# Complete the function below\ndef calculate(x, y):\n    # Your code here\n    return 0\n',
    class: 'class Solution:\n    def solve(self):\n        # Your code here\n        pass\n',
    input: '# Read input and solve\ninput_data = input()\n# Your code here\nprint(result)\n',
  };

  const applyTemplate = (templateKey) => {
    setSelectedTemplate(templateKey);
    setData('starter_code', pythonTemplates[templateKey]);
  };

  const addTestCase = () => {
    const newTestCases = [...(data.test_cases || []), {
      input: '',
      expected: '',
      description: `Test case ${(data.test_cases?.length || 0) + 1}`,
    }];
    setData('test_cases', newTestCases);
    setActiveTestCase(newTestCases.length - 1);
  };

  const removeTestCase = (index) => {
    if ((data.test_cases?.length || 0) <= 1) {
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

  // 批量导入测试用例
  const handleBulkImport = () => {
    try {
      // 格式：每3行一组（description, input, expected）
      const lines = bulkImportText.trim().split('\n').filter(line => line.trim() !== '');
      const newTestCases = [];
      
      for (let i = 0; i < lines.length; i += 3) {
        if (i + 2 < lines.length) {
          newTestCases.push({
            description: lines[i].replace(/^#\s*/, '').trim(),
            input: lines[i + 1].trim(),
            expected: lines[i + 2].trim(),
          });
        }
      }
      
      if (newTestCases.length > 0) {
        setData('test_cases', [...(data.test_cases || []), ...newTestCases]);
        setBulkImportText('');
        setShowBulkImport(false);
        alert(`✅ Successfully imported ${newTestCases.length} test case${newTestCases.length > 1 ? 's' : ''}!`);
      } else {
        alert('❌ No valid test cases found. Make sure you have 3 lines per test (description, input, output).');
      }
    } catch (error) {
      alert('❌ Error parsing test cases. Please check the format.');
    }
  };

  // 快速生成模板测试用例 - 更多选项
  const generateTemplateTests = (templateType) => {
    const templates = {
      basic: [
        {
          description: 'Positive numbers',
          input: '5',
          expected: '5',
        },
        {
          description: 'Zero',
          input: '0',
          expected: '0',
        },
        {
          description: 'Negative number',
          input: '-3',
          expected: '-3',
        },
      ],
      comprehensive: [
        {
          description: 'Small positive number',
          input: '1',
          expected: '1',
        },
        {
          description: 'Large positive number',
          input: '1000',
          expected: '1000',
        },
        {
          description: 'Zero',
          input: '0',
          expected: '0',
        },
        {
          description: 'Small negative',
          input: '-1',
          expected: '-1',
        },
        {
          description: 'Large negative',
          input: '-1000',
          expected: '-1000',
        },
      ],
      twoInputs: [
        {
          description: 'Two positive numbers',
          input: '5 3',
          expected: '8',
        },
        {
          description: 'One zero',
          input: '0 5',
          expected: '5',
        },
        {
          description: 'Both zero',
          input: '0 0',
          expected: '0',
        },
        {
          description: 'Negative and positive',
          input: '-5 10',
          expected: '5',
        },
        {
          description: 'Both negative',
          input: '-3 -7',
          expected: '-10',
        },
      ],
      stringTests: [
        {
          description: 'Simple word',
          input: 'hello',
          expected: 'HELLO',
        },
        {
          description: 'Multiple words',
          input: 'hello world',
          expected: 'HELLO WORLD',
        },
        {
          description: 'Empty string',
          input: '',
          expected: '',
        },
        {
          description: 'Special characters',
          input: 'test123!',
          expected: 'TEST123!',
        },
      ],
    };
    
    const selectedTemplate = templates[templateType];
    setData('test_cases', selectedTemplate);
    alert(`✅ Added ${selectedTemplate.length} template test cases! Edit them to match your problem.`);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-blue-600 rounded-xl">
          <Code className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-blue-900">Python Coding Challenge</h3>
          <p className="text-sm text-blue-700">Configure real Python code execution with test cases</p>
        </div>
      </div>

      {/* Live Editor Toggle */}
      <div className="bg-white rounded-lg p-5 border-2 border-blue-200 shadow-sm">
        <label className="flex items-start gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={data.enable_live_editor || false}
            onChange={(e) => setData('enable_live_editor', e.target.checked)}
            className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500 mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900">Enable Live Python Editor</span>
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                RECOMMENDED
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Students can write and execute Python code in real-time with instant feedback
            </p>
          </div>
        </label>
      </div>

      {data.enable_live_editor && (
        <>
          {/* Python Badge */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
                </svg>
              </div>
              <div>
                <div className="font-bold text-lg">Python Programming Language</div>
                <div className="text-sm text-blue-100">All exercises use Python 3.x</div>
              </div>
            </div>
          </div>

          {/* Code Templates */}
          <div className="bg-white rounded-lg p-5 border-2 border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              📝 Select Code Template
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => applyTemplate('basic')}
                className={`p-4 border-2 rounded-lg transition-all text-left ${
                  selectedTemplate === 'basic'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <div className="font-semibold text-gray-900 mb-1">Basic Function</div>
                <div className="text-xs text-gray-600">Simple function template</div>
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('function')}
                className={`p-4 border-2 rounded-lg transition-all text-left ${
                  selectedTemplate === 'function'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <div className="font-semibold text-gray-900 mb-1">Function with Parameters</div>
                <div className="text-xs text-gray-600">Function that takes arguments</div>
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('class')}
                className={`p-4 border-2 rounded-lg transition-all text-left ${
                  selectedTemplate === 'class'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <div className="font-semibold text-gray-900 mb-1">Class Template</div>
                <div className="text-xs text-gray-600">Object-oriented approach</div>
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('input')}
                className={`p-4 border-2 rounded-lg transition-all text-left ${
                  selectedTemplate === 'input'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <div className="font-semibold text-gray-900 mb-1">Input/Output</div>
                <div className="text-xs text-gray-600">Read input and print output</div>
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg p-5 border-2 border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📋 Problem Instructions
            </label>
            <textarea
              value={data.coding_instructions || ''}
              onChange={(e) => setData('coding_instructions', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              rows="5"
              placeholder="Explain the problem clearly:&#10;- What should the function do?&#10;- Input format and constraints&#10;- Expected output format&#10;- Include examples"
            />
            {errors?.coding_instructions && (
              <p className="text-red-600 text-sm mt-1">{errors.coding_instructions}</p>
            )}
          </div>

          {/* Starter Code */}
          <div className="bg-white rounded-lg p-5 border-2 border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              💻 Starter Code Template
            </label>
            <textarea
              value={data.starter_code || ''}
              onChange={(e) => setData('starter_code', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm bg-slate-900 text-green-400"
              rows="10"
              placeholder="# Students will see this code initially&#10;def solution():&#10;    pass"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 This is the initial code students will see. Provide a basic structure to guide them.
            </p>
            {errors?.starter_code && (
              <p className="text-red-600 text-sm mt-1">{errors.starter_code}</p>
            )}
          </div>

          {/* Test Cases */}
          <div className="bg-white rounded-lg p-5 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-blue-600" />
                <h4 className="font-bold text-gray-900">Test Cases</h4>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                  {data.test_cases?.length || 0} tests
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkImport(!showBulkImport)}
                  className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  ⚡ Bulk Import
                </button>
                <button
                  type="button"
                  onClick={addTestCase}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add One
                </button>
              </div>
            </div>

            {/* Quick Template Selector */}
            <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🎯</span>
                    <h5 className="font-semibold text-green-900">Quick Template Generator</h5>
                  </div>
                  <p className="text-xs text-green-700">
                    Select a template to auto-generate test cases, then edit the values to match your problem
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        generateTemplateTests(e.target.value);
                        e.target.value = ''; // Reset selection
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all cursor-pointer border-2 border-green-700"
                    defaultValue=""
                  >
                    <option value="" disabled>Choose Template...</option>
                    <option value="basic">📝 Basic (3 tests)</option>
                    <option value="comprehensive">📊 Comprehensive (5 tests)</option>
                    <option value="twoInputs">➕ Two Inputs (5 tests)</option>
                    <option value="stringTests">🔤 String Tests (4 tests)</option>
                  </select>
                </div>
              </div>
              
              {/* Template Descriptions */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="bg-white/60 rounded p-2 border border-green-200">
                  <span className="font-semibold text-xs text-green-900">📝 Basic:</span>
                  <span className="text-xs text-green-700"> Positive, Zero, Negative</span>
                </div>
                <div className="bg-white/60 rounded p-2 border border-green-200">
                  <span className="font-semibold text-xs text-green-900">📊 Comprehensive:</span>
                  <span className="text-xs text-green-700"> Small/Large numbers, edges</span>
                </div>
                <div className="bg-white/60 rounded p-2 border border-green-200">
                  <span className="font-semibold text-xs text-green-900">➕ Two Inputs:</span>
                  <span className="text-xs text-green-700"> For add, subtract, multiply</span>
                </div>
                <div className="bg-white/60 rounded p-2 border border-green-200">
                  <span className="font-semibold text-xs text-green-900">🔤 String Tests:</span>
                  <span className="text-xs text-green-700"> Text processing problems</span>
                </div>
              </div>
            </div>

            {/* Bulk Import Panel */}
            {showBulkImport && (
              <div className="mb-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border-2 border-purple-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <h5 className="font-bold text-purple-900">Bulk Import Test Cases</h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkImport(false);
                      setBulkImportText('');
                    }}
                    className="text-purple-600 hover:text-purple-800 font-semibold text-sm"
                  >
                    ✕ Close
                  </button>
                </div>
                
                <div className="bg-purple-100 rounded-lg p-4 mb-3 border border-purple-300">
                  <div className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <span>📝</span>
                    <span>How to use:</span>
                  </div>
                  <ol className="text-sm text-purple-800 space-y-1 ml-6 list-decimal">
                    <li><strong>3 lines = 1 test case</strong></li>
                    <li>Line 1: Description (what this test checks)</li>
                    <li>Line 2: Input data (what student enters)</li>
                    <li>Line 3: Expected output (correct answer)</li>
                    <li>Blank lines are ignored (optional separators)</li>
                  </ol>
                </div>

                <div className="bg-white rounded-lg p-4 mb-3 border-2 border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span>💡</span>
                    <span className="font-semibold text-gray-900 text-sm">Example Format:</span>
                  </div>
                  <pre className="font-mono text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded border border-gray-300 overflow-x-auto">
{`Test with small numbers
2 3
5

Test with zero
0 5
5

Test with negative numbers
-3 7
4

Large numbers
100 200
300`}</pre>
                  <button
                    type="button"
                    onClick={() => setBulkImportText(`Test with small numbers
2 3
5

Test with zero
0 5
5

Test with negative numbers
-3 7
4

Large numbers
100 200
300`)}
                    className="mt-2 text-xs text-purple-600 hover:text-purple-800 font-semibold"
                  >
                    📋 Copy this example to editor
                  </button>
                </div>

                <label className="block text-sm font-semibold text-purple-900 mb-2">
                  Paste or type your test cases:
                </label>
                <textarea
                  value={bulkImportText}
                  onChange={(e) => setBulkImportText(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none font-mono text-sm bg-white"
                  rows="10"
                  placeholder="Test with positive numbers&#10;5 3&#10;8&#10;&#10;Test with zero&#10;0 5&#10;5"
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-purple-700">
                    📊 Current: <strong>{bulkImportText.trim().split('\n').filter(l => l.trim()).length}</strong> lines
                    ({Math.floor(bulkImportText.trim().split('\n').filter(l => l.trim()).length / 3)} test cases will be created)
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setBulkImportText('')}
                      className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 text-sm"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkImport}
                      className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-md text-sm"
                      disabled={!bulkImportText.trim()}
                    >
                      Import All →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(!data.test_cases || data.test_cases.length === 0) && (
              <div className="text-center py-8 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300">
                <TestTube className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-3">No test cases yet</p>
                <button
                  type="button"
                  onClick={addTestCase}
                  className="text-blue-600 font-semibold hover:text-blue-800"
                >
                  Create your first test case
                </button>
              </div>
            )}

            {data.test_cases && data.test_cases.length > 0 && (
              <>
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
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Test {index + 1}
                    </button>
                  ))}
                </div>

                {/* Active Test Case Form */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h5 className="font-semibold text-gray-900">Test Case {activeTestCase + 1}</h5>
                    {data.test_cases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTestCase(activeTestCase)}
                        className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Delete</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={data.test_cases[activeTestCase]?.description || ''}
                      onChange={(e) => updateTestCase(activeTestCase, 'description', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., Test with positive numbers"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Input (stdin) - Optional
                    </label>
                    <textarea
                      value={data.test_cases[activeTestCase]?.input || ''}
                      onChange={(e) => updateTestCase(activeTestCase, 'input', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm bg-gray-800 text-gray-100"
                      rows="3"
                      placeholder="Leave empty if no input needed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      If your code uses input(), enter the test data here
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Output <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={data.test_cases[activeTestCase]?.expected || ''}
                      onChange={(e) => updateTestCase(activeTestCase, 'expected', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm bg-gray-800 text-green-400"
                      rows="3"
                      placeholder="Expected output (must match exactly)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ⚠️ Output must match exactly (including whitespace and newlines)
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Solution Code (Optional, Admin Only) */}
          <div className="bg-amber-50 rounded-lg p-5 border-2 border-amber-200">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <span>🔒</span>
              <span>Solution Code (Admin Reference Only)</span>
            </label>
            <textarea
              value={data.solution_code || ''}
              onChange={(e) => setData('solution_code', e.target.value)}
              className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none font-mono text-sm bg-slate-900 text-green-400"
              rows="8"
              placeholder="# Your solution (students won't see this)&#10;def solution():&#10;    return 'correct answer'"
            />
            <p className="text-xs text-amber-700 mt-2 flex items-start gap-2">
              <span>💡</span>
              <span>This is only visible to administrators. Use it as a reference when helping students.</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}