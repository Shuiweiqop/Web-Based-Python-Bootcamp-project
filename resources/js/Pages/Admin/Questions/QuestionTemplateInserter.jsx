// resources/js/Components/Questions/QuestionTemplateInserter.jsx
import React, { useState } from 'react';
import { 
  SparklesIcon, 
  ChevronDownIcon,
  DocumentDuplicateIcon,
  CodeBracketIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// 预定义的题目模板
const QUESTION_TEMPLATES = {
  mcq: [
    {
      id: 'python_basic_syntax',
      name: 'Python Basic Syntax',
      icon: '🐍',
      category: 'Python Basics',
      template: {
        question_text: 'What is the correct syntax to output "Hello World" in Python?',
        code_snippet: '',
        points: 10,
        difficulty_level: 1,
        options: [
          { label: 'A', text: 'print("Hello World")', is_correct: true },
          { label: 'B', text: 'echo("Hello World")', is_correct: false },
          { label: 'C', text: 'console.log("Hello World")', is_correct: false },
          { label: 'D', text: 'System.out.println("Hello World")', is_correct: false },
        ],
        explanation: 'In Python, the print() function is used to output text to the console.'
      }
    },
    {
      id: 'python_data_types',
      name: 'Python Data Types',
      icon: '📊',
      category: 'Python Basics',
      template: {
        question_text: 'Which of the following is a mutable data type in Python?',
        code_snippet: '',
        points: 10,
        difficulty_level: 1,
        options: [
          { label: 'A', text: 'tuple', is_correct: false },
          { label: 'B', text: 'list', is_correct: true },
          { label: 'C', text: 'string', is_correct: false },
          { label: 'D', text: 'int', is_correct: false },
        ],
        explanation: 'Lists are mutable, meaning their contents can be changed after creation.'
      }
    },
    {
      id: 'python_loops',
      name: 'Python For Loop',
      icon: '🔄',
      category: 'Control Flow',
      template: {
        question_text: 'What will be the output of the following code?',
        code_snippet: 'for i in range(3):\n    print(i)',
        points: 10,
        difficulty_level: 2,
        options: [
          { label: 'A', text: '0 1 2', is_correct: true },
          { label: 'B', text: '1 2 3', is_correct: false },
          { label: 'C', text: '0 1 2 3', is_correct: false },
          { label: 'D', text: 'Error', is_correct: false },
        ],
        explanation: 'range(3) generates numbers from 0 to 2 (3 is excluded).'
      }
    },
    {
      id: 'python_functions',
      name: 'Python Function Definition',
      icon: '⚙️',
      category: 'Functions',
      template: {
        question_text: 'What is the correct way to define a function in Python?',
        code_snippet: '',
        points: 10,
        difficulty_level: 1,
        options: [
          { label: 'A', text: 'def myFunction():', is_correct: true },
          { label: 'B', text: 'function myFunction():', is_correct: false },
          { label: 'C', text: 'func myFunction():', is_correct: false },
          { label: 'D', text: 'define myFunction():', is_correct: false },
        ],
        explanation: 'Functions in Python are defined using the "def" keyword.'
      }
    },
  ],
  true_false: [
    {
      id: 'python_indentation',
      name: 'Python Indentation',
      icon: '📏',
      category: 'Python Basics',
      template: {
        question_text: 'Python uses indentation to define code blocks (True or False)?',
        code_snippet: '',
        correct_answer: 'true',
        points: 5,
        difficulty_level: 1,
        explanation: 'True. Python uses indentation (spaces or tabs) to define code blocks, unlike other languages that use curly braces.'
      }
    },
    {
      id: 'python_case_sensitive',
      name: 'Case Sensitivity',
      icon: '🔤',
      category: 'Python Basics',
      template: {
        question_text: 'Python is case-sensitive (True or False)?',
        code_snippet: '',
        correct_answer: 'true',
        points: 5,
        difficulty_level: 1,
        explanation: 'True. In Python, "Variable" and "variable" are two different identifiers.'
      }
    },
    {
      id: 'python_list_immutable',
      name: 'List Mutability',
      icon: '📋',
      category: 'Data Types',
      template: {
        question_text: 'Lists in Python are immutable (True or False)?',
        code_snippet: '',
        correct_answer: 'false',
        points: 5,
        difficulty_level: 2,
        explanation: 'False. Lists are mutable, meaning you can change, add, or remove elements after creation.'
      }
    },
  ],
  short_answer: [
    {
      id: 'python_keyword',
      name: 'Python Keyword',
      icon: '🔑',
      category: 'Python Basics',
      template: {
        question_text: 'What keyword is used to create a class in Python?',
        code_snippet: '',
        correct_answer: 'class',
        points: 10,
        difficulty_level: 1,
        explanation: 'The "class" keyword is used to define a new class in Python.'
      }
    },
    {
      id: 'python_method',
      name: 'Python Method Name',
      icon: '📝',
      category: 'OOP',
      template: {
        question_text: 'What is the name of the method that is automatically called when an object is created?',
        code_snippet: '',
        correct_answer: '__init__',
        points: 10,
        difficulty_level: 2,
        explanation: 'The __init__() method is the constructor method in Python classes.'
      }
    },
  ],
  coding: [
    {
      id: 'print_hello',
      name: 'Hello World',
      icon: '👋',
      category: 'Basics',
      template: {
        question_text: 'Write a Python program that prints "Hello, World!" to the console.',
        code_snippet: '# Write your code here\n',
        correct_answer: 'print("Hello, World!")',
        points: 15,
        difficulty_level: 1,
        explanation: 'Use the print() function to output text.',
        metadata: {
          starter_code: '# Write your code here\n',
          test_cases: [
            { input: '', expected: 'Hello, World!' }
          ]
        }
      }
    },
    {
      id: 'sum_function',
      name: 'Sum Function',
      icon: '➕',
      category: 'Functions',
      template: {
        question_text: 'Write a function called sum_numbers that takes two numbers as parameters and returns their sum.',
        code_snippet: 'def sum_numbers(a, b):\n    # Write your code here\n    pass',
        correct_answer: 'def sum_numbers(a, b):\n    return a + b',
        points: 20,
        difficulty_level: 2,
        explanation: 'Define a function that adds two parameters and returns the result.',
        metadata: {
          starter_code: 'def sum_numbers(a, b):\n    # Write your code here\n    pass',
          test_cases: [
            { input: '5, 3', expected: '8' },
            { input: '10, 20', expected: '30' }
          ]
        }
      }
    },
    {
      id: 'list_max',
      name: 'Find Maximum',
      icon: '🔢',
      category: 'Lists',
      template: {
        question_text: 'Write a function that finds the maximum value in a list of numbers.',
        code_snippet: 'def find_max(numbers):\n    # Write your code here\n    pass',
        correct_answer: 'def find_max(numbers):\n    return max(numbers)',
        points: 20,
        difficulty_level: 2,
        explanation: 'Use the built-in max() function or implement a loop to find the largest number.',
        metadata: {
          starter_code: 'def find_max(numbers):\n    # Write your code here\n    pass',
          test_cases: [
            { input: '[1, 5, 3, 9, 2]', expected: '9' },
            { input: '[10, 20, 5]', expected: '20' }
          ]
        }
      }
    },
  ]
};

export default function QuestionTemplateInserter({ currentType, onInsertTemplate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get templates for current question type
  const availableTemplates = QUESTION_TEMPLATES[currentType] || [];

  // Get unique categories
  const categories = ['all', ...new Set(availableTemplates.map(t => t.category))];

  // Filter templates by category
  const filteredTemplates = selectedCategory === 'all' 
    ? availableTemplates 
    : availableTemplates.filter(t => t.category === selectedCategory);

  const handleInsert = (template) => {
    onInsertTemplate(template.template);
    setIsOpen(false);
  };

  // Get icon component based on type
  const getTypeIcon = (type) => {
    switch(type) {
      case 'mcq': return QuestionMarkCircleIcon;
      case 'true_false': return CheckCircleIcon;
      case 'short_answer': return DocumentDuplicateIcon;
      case 'coding': return CodeBracketIcon;
      default: return QuestionMarkCircleIcon;
    }
  };

  const TypeIcon = getTypeIcon(currentType);

  if (availableTemplates.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Template Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
      >
        <SparklesIcon className="w-5 h-5" />
        <span className="font-medium">Insert Template</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />

          {/* Template Panel - Right aligned to prevent overflow */}
          <div className="absolute top-full right-0 mt-2 w-[95vw] max-w-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 z-20 max-h-[500px] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TypeIcon className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">
                    {currentType.replace('_', ' ').toUpperCase()} Templates
                  </h3>
                </div>
                <span className="text-sm text-gray-500">
                  {filteredTemplates.length} templates
                </span>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {categories.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates List */}
            <div className="overflow-y-auto max-h-[400px]">
              {filteredTemplates.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <QuestionMarkCircleIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No templates found for this category</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleInsert(template)}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                          {template.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-medium text-gray-900 group-hover:text-purple-700">
                              {template.name}
                            </h4>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                              {template.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {template.template.question_text}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                            <span>📊 {template.template.points} points</span>
                            <span>
                              {template.template.difficulty_level === 1 && '⭐ Easy'}
                              {template.template.difficulty_level === 2 && '⭐⭐ Medium'}
                              {template.template.difficulty_level === 3 && '⭐⭐⭐ Hard'}
                            </span>
                          </div>
                        </div>

                        {/* Insert Icon */}
                        <div className="flex-shrink-0 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DocumentDuplicateIcon className="w-5 h-5" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600 text-center">
              💡 Click any template to insert it into your question form
            </div>
          </div>
        </>
      )}
    </div>
  );
}