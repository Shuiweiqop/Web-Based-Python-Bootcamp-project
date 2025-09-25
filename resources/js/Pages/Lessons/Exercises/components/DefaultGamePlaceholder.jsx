import React from 'react';
import { 
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

/**
 * 默认游戏占位符组件 - 当游戏类型未实现或出错时显示
 * 文件位置：resources/js/Components/Games/DefaultGamePlaceholder.jsx
 */
const DefaultGamePlaceholder = ({ 
  exercise,
  showError = false,
  errorMessage = null 
}) => {
  // 根据游戏类型获取相应的信息
  const getGameInfo = (type) => {
    const gameTypes = {
      'quiz_game': {
        icon: '❓',
        name: 'Quiz Game',
        description: 'Answer coding questions and test your knowledge',
        features: ['Multiple choice questions', 'Instant feedback', 'Progress tracking'],
        color: 'blue'
      },
      'memory_game': {
        icon: '🧠',
        name: 'Memory Game',
        description: 'Match coding concepts and strengthen your memory',
        features: ['Card matching', 'Concept reinforcement', 'Timed challenges'],
        color: 'purple'
      },
      'typing_game': {
        icon: '⌨️',
        name: 'Code Typing',
        description: 'Practice coding by typing out programs accurately',
        features: ['Speed typing', 'Syntax highlighting', 'Error detection'],
        color: 'green'
      },
      'sandbox_game': {
        icon: '🏖️',
        name: 'Code Sandbox',
        description: 'Free-form coding environment to experiment and create',
        features: ['Live code editor', 'Real-time output', 'Save and share'],
        color: 'yellow'
      },
      'battle_game': {
        icon: '⚔️',
        name: 'Code Battle',
        description: 'Compete with other students in coding challenges',
        features: ['Multiplayer mode', 'Leaderboards', 'Real-time competition'],
        color: 'red'
      },
      'story_game': {
        icon: '📚',
        name: 'Interactive Story',
        description: 'Learn programming through narrative adventures',
        features: ['Branching storylines', 'Character progression', 'Immersive learning'],
        color: 'indigo'
      }
    };

    return gameTypes[type] || {
      icon: '🎮',
      name: 'Interactive Game',
      description: 'An engaging coding challenge awaits you',
      features: ['Interactive elements', 'Hands-on learning', 'Progress tracking'],
      color: 'gray'
    };
  };

  const gameInfo = getGameInfo(exercise.type);
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50 border-blue-200',
    purple: 'from-purple-500 to-purple-600 text-purple-600 bg-purple-50 border-purple-200',
    green: 'from-green-500 to-green-600 text-green-600 bg-green-50 border-green-200',
    yellow: 'from-yellow-500 to-yellow-600 text-yellow-600 bg-yellow-50 border-yellow-200',
    red: 'from-red-500 to-red-600 text-red-600 bg-red-50 border-red-200',
    indigo: 'from-indigo-500 to-indigo-600 text-indigo-600 bg-indigo-50 border-indigo-200',
    gray: 'from-gray-500 to-gray-600 text-gray-600 bg-gray-50 border-gray-200'
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* 错误显示 */}
        {showError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center gap-3 text-red-600 mb-3">
              <ExclamationTriangleIcon className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Game Loading Error</h3>
            </div>
            <p className="text-red-700">
              {errorMessage || "We're having trouble loading this game. Please try refreshing the page or contact your instructor."}
            </p>
          </div>
        )}

        {/* 游戏信息卡片 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* 头部渐变背景 */}
          <div className={`bg-gradient-to-r ${colorClasses[gameInfo.color].split(' ')[0]} ${colorClasses[gameInfo.color].split(' ')[1]} p-8 text-white`}>
            <div className="text-6xl mb-4">{gameInfo.icon}</div>
            <h2 className="text-2xl font-bold mb-2">{gameInfo.name}</h2>
            <p className="text-white text-opacity-90">
              {gameInfo.description}
            </p>
          </div>

          {/* 内容区域 */}
          <div className="p-8">
            {/* 游戏功能 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <LightBulbIcon className="w-5 h-5 text-yellow-500" />
                What to expect:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gameInfo.features.map((feature, index) => (
                  <div key={index} className={`${colorClasses[gameInfo.color].split(' ')[2]} ${colorClasses[gameInfo.color].split(' ')[3]} rounded-lg p-3 text-center`}>
                    <div className={`${colorClasses[gameInfo.color].split(' ')[1]} text-sm font-medium`}>
                      {feature}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 开发状态 */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center gap-3 text-gray-600 mb-3">
                <WrenchScrewdriverIcon className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Currently in Development</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Our development team is working hard to bring you this amazing learning experience. 
                This game will be available soon!
              </p>
              
              {/* 开发进度条（模拟） */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className={`bg-gradient-to-r ${colorClasses[gameInfo.color].split(' ')[0]} ${colorClasses[gameInfo.color].split(' ')[1]} h-3 rounded-full transition-all duration-500`}
                  style={{ width: '75%' }}
                />
              </div>
              <div className="text-sm text-gray-500 text-center">75% Complete</div>
            </div>

            {/* 替代活动建议 */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <RocketLaunchIcon className="w-5 h-5 text-purple-500" />
                Meanwhile, try these activities:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-blue-600 font-semibold mb-2">📝 Practice Exercises</div>
                  <div className="text-blue-800 text-sm">
                    Complete coding challenges in other lessons
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-green-600 font-semibold mb-2">💬 Community Forum</div>
                  <div className="text-green-800 text-sm">
                    Discuss coding topics with fellow students
                  </div>
                </div>
              </div>
            </div>

            {/* 联系信息 */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm mb-4">
                Have questions or suggestions about this game?
              </p>
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <CodeBracketIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Contact your instructor for more information</span>
              </div>
            </div>
          </div>
        </div>

        {/* 临时练习区域 */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-8 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🎯 Quick Practice Challenge
          </h3>
          <p className="text-gray-600 mb-6">
            While waiting for the full game, try this mini coding exercise:
          </p>
          
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm text-left">
            <div className="text-gray-400 mb-2"># Try writing a simple Python function:</div>
            <div className="text-white">def greet(name):</div>
            <div className="text-white ml-4">return f"Hello, {name}!"</div>
            <div className="text-gray-400 mt-2"># What would greet("Python") return?</div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            💡 Think about it, then discuss with your classmates!
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultGamePlaceholder;