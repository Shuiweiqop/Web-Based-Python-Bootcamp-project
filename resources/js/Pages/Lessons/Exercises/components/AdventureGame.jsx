import React, { useState, useEffect } from 'react';
import { 
  TrophyIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowRightIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

/**
 * 冒险游戏组件 - 互动式编程故事
 * 文件位置: resources/js/Components/Games/AdventureGame.jsx
 */
const AdventureGame = ({ 
  exercise, 
  onScoreUpdate,
  onComplete, // 🔥 添加 onComplete prop
  isTimeUp = false 
}) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // 计算并更新分数
  const calculateScore = (newAnswers = answers) => {
    if (!exercise.content?.scenarios) return 0;
    
    let totalScore = 0;
    const pointsPerScenario = Math.floor(exercise.max_score / exercise.content.scenarios.length);
    
    exercise.content.scenarios.forEach((scenario, index) => {
      if (newAnswers[index] !== undefined) {
        const selectedChoice = scenario.choices[newAnswers[index]];
        if (selectedChoice?.correct) {
          totalScore += pointsPerScenario;
        }
      }
    });
    
    console.log('📊 Adventure Game Score Calculation:', {
      totalScenarios: exercise.content.scenarios.length,
      answeredScenarios: newAnswers.filter(a => a !== undefined).length,
      pointsPerScenario,
      totalScore,
      answers: newAnswers
    });
    
    return totalScore;
  };

  // 处理选择
  const handleChoice = (choiceIndex) => {
    if (answers[currentScenario] !== undefined || isTimeUp) return;

    const newAnswers = [...answers];
    newAnswers[currentScenario] = choiceIndex;
    setAnswers(newAnswers);
    
    // 计算新分数
    const score = calculateScore(newAnswers);
    
    console.log('✅ Choice made:', {
      scenario: currentScenario,
      choiceIndex,
      isCorrect: exercise.content.scenarios[currentScenario].choices[choiceIndex].correct,
      currentScore: score
    });
    
    // 🔥 立即更新父组件的分数
    if (onScoreUpdate) {
      onScoreUpdate(score);
    }
    
    // 显示解释
    setShowExplanation(true);
    
    // 自动进入下一个场景或完成游戏
    setTimeout(() => {
      if (currentScenario < exercise.content.scenarios.length - 1) {
        setCurrentScenario(currentScenario + 1);
        setShowExplanation(false);
      } else {
        // 🔥 游戏完成 - 调用 onComplete 并传递最终分数
        setIsComplete(true);
        if (onComplete) {
          console.log('🏁 Game complete, calling onComplete with score:', score);
          setTimeout(() => {
            onComplete(score);
          }, 1500);
        }
      }
    }, 3000);
  };

  // 手动跳到下一个场景
  const nextScenario = () => {
    if (currentScenario < exercise.content.scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
      setShowExplanation(false);
    }
  };

  // 重新开始游戏
  const restartGame = () => {
    setCurrentScenario(0);
    setAnswers([]);
    setShowExplanation(false);
    setIsComplete(false);
    if (onScoreUpdate) {
      onScoreUpdate(0);
    }
  };

  // 🔥 自动处理时间到期
  useEffect(() => {
    if (isTimeUp && !isComplete) {
      const finalScore = calculateScore();
      setIsComplete(true);
      if (onComplete) {
        console.log('⏰ Time up, calling onComplete with score:', finalScore);
        onComplete(finalScore);
      }
    }
  }, [isTimeUp]);

  const scenario = exercise.content?.scenarios?.[currentScenario];
  
  if (!scenario) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600">
          <XCircleIcon className="w-12 h-12 mx-auto mb-4" />
          <p>Game content not found. Please contact your instructor.</p>
        </div>
      </div>
    );
  }

  // 游戏完成视图
  if (isComplete) {
    const finalScore = calculateScore();
    const percentage = Math.round((finalScore / exercise.max_score) * 100);
    
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <TrophyIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Adventure Complete!
            </h3>
            <p className="text-gray-600">
              You've finished your coding journey.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {finalScore}/{exercise.max_score}
            </div>
            <div className="text-lg text-gray-700 mb-1">Final Score</div>
            <div className="text-sm text-gray-500">{percentage}% Complete</div>
          </div>
          
          <button
            onClick={restartGame}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* 故事背景 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg mb-8 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">
              {exercise.content.story || "Your Coding Adventure"}
            </h3>
            <div className="text-sm opacity-90 flex items-center gap-2">
              <BookOpenIcon className="w-4 h-4" />
              Scenario {currentScenario + 1} of {exercise.content.scenarios.length}
            </div>
          </div>
          
          {/* 进度条 */}
          <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
            <div className="text-xs font-semibold">
              {Math.round(((currentScenario + 1) / exercise.content.scenarios.length) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* 场景内容 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          {/* 情况描述 */}
          <div className="mb-6">
            <p className="text-lg text-gray-800 leading-relaxed mb-4">
              {scenario.situation}
            </p>
            <p className="text-blue-600 font-semibold text-lg">
              {scenario.question}
            </p>
          </div>

          {/* 代码模板 */}
          {scenario.code_template && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Code Context:</h4>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm font-mono">
                  <code>{scenario.code_template}</code>
                </pre>
              </div>
            </div>
          )}

          {/* 选择按钮 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {scenario.choices.map((choice, index) => {
              const isAnswered = answers[currentScenario] !== undefined;
              const isSelected = answers[currentScenario] === index;
              const isCorrect = choice.correct;
              
              let buttonClass = "p-4 rounded-lg text-left transition-all duration-200 border-2 ";
              
              if (isAnswered) {
                if (isSelected && isCorrect) {
                  buttonClass += "bg-green-500 text-white border-green-500";
                } else if (isSelected && !isCorrect) {
                  buttonClass += "bg-red-500 text-white border-red-500";
                } else if (!isSelected && isCorrect) {
                  buttonClass += "bg-green-100 text-green-800 border-green-300";
                } else {
                  buttonClass += "bg-gray-100 text-gray-600 border-gray-200";
                }
              } else {
                buttonClass += "bg-gray-50 hover:bg-blue-50 border-transparent hover:border-blue-200 cursor-pointer transform hover:scale-[1.02]";
              }
              
              return (
                <button
                  key={index}
                  onClick={() => handleChoice(index)}
                  disabled={isAnswered || isTimeUp}
                  className={`${buttonClass} disabled:cursor-not-allowed`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {isAnswered && isSelected && (
                        isCorrect ? (
                          <CheckCircleIcon className="w-5 h-5 text-white" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-white" />
                        )
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-semibold mb-2">{choice.text}</div>
                      <div className="bg-gray-800 text-green-400 p-2 rounded text-sm">
                        <code>{choice.code}</code>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 解释 */}
          {showExplanation && scenario.explanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <BookOpenIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    {scenario.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 下一步按钮 */}
          {showExplanation && currentScenario < exercise.content.scenarios.length - 1 && (
            <div className="text-center">
              <button
                onClick={nextScenario}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
              >
                Continue Adventure
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdventureGame;