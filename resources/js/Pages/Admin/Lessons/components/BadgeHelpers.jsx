// resources/js/Pages/Admin/Lessons/components/BadgeHelpers.jsx
import React from 'react';

/**
 * Badge Helper Functions
 * Reusable badge components for displaying status, difficulty, types, etc.
 * Used across Admin and Student interfaces
 */

// ========================================
// STATUS BADGES
// ========================================

/**
 * Get status badge component
 * @param {string} status - Status value (active, inactive, draft, archived, completed, in_progress, etc.)
 * @param {string} size - Size variant (sm, md, lg)
 * @param {boolean} animated - Enable pulse animation
 * @returns {JSX.Element}
 */
export const getStatusBadge = (status, size = 'md', animated = false) => {
  const configs = {
    // Lesson/Test/Exercise Status
    active: { 
      bg: 'bg-green-100', 
      text: 'text-green-800', 
      border: 'border-green-200',
      label: '✅ Active',
      icon: '✅',
      description: 'Visible and accessible to students'
    },
    inactive: { 
      bg: 'bg-gray-100', 
      text: 'text-gray-800',
      border: 'border-gray-200', 
      label: '❌ Inactive',
      icon: '❌',
      description: 'Hidden from students'
    },
    draft: { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800',
      border: 'border-yellow-200', 
      label: '📝 Draft',
      icon: '📝',
      description: 'Work in progress'
    },
    archived: { 
      bg: 'bg-red-100', 
      text: 'text-red-800',
      border: 'border-red-200', 
      label: '🗄️ Archived',
      icon: '🗄️',
      description: 'No longer available'
    },
    
    // Registration/Submission Status
    completed: { 
      bg: 'bg-green-100', 
      text: 'text-green-800',
      border: 'border-green-200', 
      label: '✓ Completed',
      icon: '✓',
      description: 'Successfully finished'
    },
    in_progress: { 
      bg: 'bg-blue-100', 
      text: 'text-blue-800',
      border: 'border-blue-200', 
      label: '⏳ In Progress',
      icon: '⏳',
      description: 'Currently working on'
    },
    cancelled: { 
      bg: 'bg-red-100', 
      text: 'text-red-800',
      border: 'border-red-200', 
      label: '✕ Cancelled',
      icon: '✕',
      description: 'Registration cancelled'
    },
    pending: { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800',
      border: 'border-yellow-200', 
      label: '⏱️ Pending',
      icon: '⏱️',
      description: 'Waiting to start'
    },
    
    // Test Submission Status
    submitted: { 
      bg: 'bg-blue-100', 
      text: 'text-blue-800',
      border: 'border-blue-200', 
      label: '📤 Submitted',
      icon: '📤',
      description: 'Submitted for grading'
    },
    timeout: { 
      bg: 'bg-orange-100', 
      text: 'text-orange-800',
      border: 'border-orange-200', 
      label: '⏰ Timeout',
      icon: '⏰',
      description: 'Time limit exceeded'
    },
    passed: { 
      bg: 'bg-green-100', 
      text: 'text-green-800',
      border: 'border-green-200', 
      label: '🎉 Passed',
      icon: '🎉',
      description: 'Score above passing threshold'
    },
    failed: { 
      bg: 'bg-red-100', 
      text: 'text-red-800',
      border: 'border-red-200', 
      label: '😞 Failed',
      icon: '😞',
      description: 'Score below passing threshold'
    },
  };

  const config = configs[status] || { 
    bg: 'bg-gray-100', 
    text: 'text-gray-800',
    border: 'border-gray-200', 
    label: status || '—',
    icon: '•',
    description: 'Unknown status'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span 
      className={`inline-flex items-center font-semibold rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} ${animated ? 'animate-pulse' : ''}`}
      title={config.description}
    >
      {config.label}
    </span>
  );
};

// ========================================
// DIFFICULTY BADGES
// ========================================

/**
 * Get difficulty badge component
 * @param {string} difficulty - Difficulty level
 * @param {string} size - Size variant
 * @param {boolean} showIcon - Show emoji icon
 * @returns {JSX.Element}
 */
export const getDifficultyBadge = (difficulty, size = 'md', showIcon = true) => {
  const configs = {
    beginner: { 
      bg: 'bg-green-100', 
      text: 'text-green-800',
      border: 'border-green-200', 
      label: 'Beginner',
      icon: '🟢',
      level: 1,
      description: 'Perfect for newcomers'
    },
    intermediate: { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800',
      border: 'border-yellow-200', 
      label: 'Intermediate',
      icon: '🟡',
      level: 2,
      description: 'Requires some experience'
    },
    advanced: { 
      bg: 'bg-red-100', 
      text: 'text-red-800',
      border: 'border-red-200', 
      label: 'Advanced',
      icon: '🔴',
      level: 3,
      description: 'For experienced learners'
    },
    easy: { 
      bg: 'bg-green-100', 
      text: 'text-green-800',
      border: 'border-green-200', 
      label: 'Easy',
      icon: '🟢',
      level: 1,
      description: 'Simple and straightforward'
    },
    medium: { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800',
      border: 'border-yellow-200', 
      label: 'Medium',
      icon: '🟡',
      level: 2,
      description: 'Moderately challenging'
    },
    hard: { 
      bg: 'bg-red-100', 
      text: 'text-red-800',
      border: 'border-red-200', 
      label: 'Hard',
      icon: '🔴',
      level: 3,
      description: 'Very challenging'
    },
    expert: { 
      bg: 'bg-purple-100', 
      text: 'text-purple-800',
      border: 'border-purple-200', 
      label: 'Expert',
      icon: '🟣',
      level: 4,
      description: 'Only for experts'
    },
  };

  const config = configs[difficulty] || { 
    bg: 'bg-gray-100', 
    text: 'text-gray-800',
    border: 'border-gray-200', 
    label: difficulty || 'Unknown',
    icon: '⚪',
    level: 0,
    description: 'Difficulty not specified'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span 
      className={`inline-flex items-center font-semibold rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
      title={config.description}
    >
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {config.label}
    </span>
  );
};

// ========================================
// EXERCISE TYPE BADGES
// ========================================

/**
 * Get exercise type badge component
 * @param {string} exerciseType - Exercise type
 * @param {string} size - Size variant
 * @returns {JSX.Element}
 */
export const getExerciseTypeBadge = (exerciseType, size = 'md') => {
  const types = {
    coding: { 
      icon: '💻', 
      label: 'Coding', 
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'Write and execute code'
    },
    drag_drop: { 
      icon: '🎯', 
      label: 'Drag & Drop', 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Match by dragging items'
    },
    adventure_game: { 
      icon: '🗺️', 
      label: 'Adventure', 
      color: 'bg-green-100 text-green-800 border-green-200',
      description: 'Interactive story-based game'
    },
    maze_game: { 
      icon: '🧩', 
      label: 'Maze', 
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      description: 'Navigate through a maze'
    },
    fill_blank: { 
      icon: '📝', 
      label: 'Fill Blank', 
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      description: 'Complete missing words'
    },
    sorting: { 
      icon: '🔢', 
      label: 'Sorting', 
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      description: 'Arrange in correct order'
    },
    simulation: { 
      icon: '🎮', 
      label: 'Simulation', 
      color: 'bg-teal-100 text-teal-800 border-teal-200',
      description: 'Interactive simulation'
    },
    multiple_choice: { 
      icon: '☑️', 
      label: 'Multiple Choice', 
      color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      description: 'Select from options'
    },
    quiz: { 
      icon: '❓', 
      label: 'Quiz', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      description: 'Answer questions'
    },
    puzzle: { 
      icon: '🧩', 
      label: 'Puzzle', 
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'Solve the puzzle'
    },
  };

  const typeInfo = types[exerciseType] || { 
    icon: '📄', 
    label: exerciseType || 'Exercise',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Interactive exercise'
  };

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span 
      className={`inline-flex items-center font-medium rounded border ${typeInfo.color} ${sizeClasses[size]}`}
      title={typeInfo.description}
    >
      <span className="mr-1">{typeInfo.icon}</span>
      {typeInfo.label}
    </span>
  );
};

// ========================================
// CONTENT TYPE BADGES
// ========================================

/**
 * Get content type badge component
 * @param {string} contentType - Content type (text, markdown, html)
 * @param {string} size - Size variant
 * @returns {JSX.Element}
 */
export const getContentTypeBadge = (contentType, size = 'md') => {
  const types = {
    text: { 
      icon: '📄', 
      label: 'Plain Text', 
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      description: 'Unformatted text'
    },
    markdown: { 
      icon: '📝', 
      label: 'Markdown', 
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      description: 'Markdown formatted text'
    },
    html: { 
      icon: '💻', 
      label: 'HTML', 
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      description: 'HTML formatted content'
    },
    rich_text: { 
      icon: '✨', 
      label: 'Rich Text', 
      color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      description: 'Rich text editor content'
    },
  };

  const typeInfo = types[contentType] || types.text;

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span 
      className={`inline-flex items-center font-medium rounded border ${typeInfo.color} ${sizeClasses[size]}`}
      title={typeInfo.description}
    >
      <span className="mr-1">{typeInfo.icon}</span>
      {typeInfo.label}
    </span>
  );
};

// ========================================
// QUESTION TYPE BADGES
// ========================================

/**
 * Get question type badge component
 * @param {string} questionType - Question type (mcq, true_false, short_answer, coding)
 * @param {string} size - Size variant
 * @returns {JSX.Element}
 */
export const getQuestionTypeBadge = (questionType, size = 'md') => {
  const types = {
    mcq: { 
      icon: '☑️', 
      label: 'Multiple Choice', 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Select one or more correct answers'
    },
    true_false: { 
      icon: '✓✗', 
      label: 'True/False', 
      color: 'bg-green-100 text-green-800 border-green-200',
      description: 'Answer true or false'
    },
    short_answer: { 
      icon: '📝', 
      label: 'Short Answer', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      description: 'Type a short answer'
    },
    coding: { 
      icon: '💻', 
      label: 'Coding', 
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'Write code to solve problem'
    },
    essay: { 
      icon: '📄', 
      label: 'Essay', 
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      description: 'Write a detailed essay'
    },
    fill_blank: { 
      icon: '___', 
      label: 'Fill in Blank', 
      color: 'bg-pink-100 text-pink-800 border-pink-200',
      description: 'Complete missing words'
    },
  };

  const typeInfo = types[questionType] || { 
    icon: '❓', 
    label: questionType || 'Question',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Question type'
  };

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span 
      className={`inline-flex items-center font-medium rounded border ${typeInfo.color} ${sizeClasses[size]}`}
      title={typeInfo.description}
    >
      <span className="mr-1">{typeInfo.icon}</span>
      {typeInfo.label}
    </span>
  );
};

// ========================================
// SCORE/GRADE BADGES
// ========================================

/**
 * Get score badge with color based on percentage
 * @param {number} score - Score achieved
 * @param {number} maxScore - Maximum possible score
 * @param {string} size - Size variant
 * @returns {JSX.Element}
 */
export const getScoreBadge = (score, maxScore, size = 'md') => {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  
  let config;
  if (percentage >= 90) {
    config = { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: '🏆', label: 'Excellent' };
  } else if (percentage >= 80) {
    config = { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', icon: '⭐', label: 'Great' };
  } else if (percentage >= 70) {
    config = { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: '👍', label: 'Good' };
  } else if (percentage >= 60) {
    config = { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', icon: '📝', label: 'Pass' };
  } else {
    config = { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: '📉', label: 'Need Improvement' };
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span 
      className={`inline-flex items-center font-semibold rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
      title={`${percentage.toFixed(1)}% - ${config.label}`}
    >
      <span className="mr-1">{config.icon}</span>
      {score}/{maxScore}
    </span>
  );
};

// ========================================
// PERCENTAGE BADGE
// ========================================

/**
 * Get percentage badge with color coding
 * @param {number} percentage - Percentage value
 * @param {string} size - Size variant
 * @returns {JSX.Element}
 */
export const getPercentageBadge = (percentage, size = 'md') => {
  let config;
  if (percentage >= 90) {
    config = { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
  } else if (percentage >= 70) {
    config = { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
  } else if (percentage >= 50) {
    config = { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
  } else {
    config = { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span 
      className={`inline-flex items-center font-bold rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      {percentage.toFixed(0)}%
    </span>
  );
};

// ========================================
// PRIORITY BADGES
// ========================================

/**
 * Get priority badge
 * @param {string} priority - Priority level (low, medium, high, urgent)
 * @param {string} size - Size variant
 * @returns {JSX.Element}
 */
export const getPriorityBadge = (priority, size = 'md') => {
  const configs = {
    low: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', icon: '🔵', label: 'Low' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: '🟡', label: 'Medium' },
    high: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', icon: '🟠', label: 'High' },
    urgent: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: '🔴', label: 'Urgent' },
  };

  const config = configs[priority] || configs.low;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span 
      className={`inline-flex items-center font-semibold rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};

// Export all badge helpers
export default {
  getStatusBadge,
  getDifficultyBadge,
  getExerciseTypeBadge,
  getContentTypeBadge,
  getQuestionTypeBadge,
  getScoreBadge,
  getPercentageBadge,
  getPriorityBadge,
};