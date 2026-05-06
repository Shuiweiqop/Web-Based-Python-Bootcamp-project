import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckCircleIcon,
  MapIcon,
  SparklesIcon,
  TrophyIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const getChoiceIsCorrect = (choice) => Boolean(choice.correct ?? choice.is_correct);

const normalizeScenario = (scenario, index) => ({
  ...scenario,
  id: scenario.id || `scenario-${index}`,
  title: scenario.title || `Scenario ${index + 1}`,
  situation: scenario.situation || scenario.description || '',
  question: scenario.question || 'What should you do next?',
  choices: Array.isArray(scenario.choices) ? scenario.choices : [],
});

export default function AdventureGame({
  exercise,
  onScoreUpdate,
  onComplete,
  isTimeUp = false,
}) {
  const scenarios = useMemo(
    () => (exercise.content?.scenarios || []).map(normalizeScenario),
    [exercise.content?.scenarios]
  );
  const scenarioById = useMemo(
    () => new Map(scenarios.map((scenario) => [String(scenario.id), scenario])),
    [scenarios]
  );

  const [currentScenarioId, setCurrentScenarioId] = useState(scenarios[0]?.id || null);
  const [answers, setAnswers] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const completedRef = useRef(false);

  const currentScenario = scenarioById.get(String(currentScenarioId)) || scenarios[0];
  const currentIndex = Math.max(0, scenarios.findIndex((scenario) => String(scenario.id) === String(currentScenario?.id)));
  const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
  const progress = scenarios.length > 0 ? Math.round(((answers.length + (selectedChoice ? 1 : 0)) / scenarios.length) * 100) : 0;

  const calculateScore = (newAnswers = answers) => {
    if (scenarios.length === 0) return 0;

    const correctCount = newAnswers.filter((answer) => answer.isCorrect).length;
    return Math.round((correctCount / scenarios.length) * (exercise.max_score || 100));
  };

  const finishAdventure = (finalAnswers = answers) => {
    if (completedRef.current) return;

    completedRef.current = true;
    const finalScore = calculateScore(finalAnswers);
    setIsComplete(true);
    onScoreUpdate?.(finalScore);

    setTimeout(() => {
      onComplete?.(finalScore);
    }, 1200);
  };

  const handleChoice = (choice, choiceIndex) => {
    if (selectedChoice || isTimeUp || isComplete) return;

    const isCorrect = getChoiceIsCorrect(choice);
    const nextAnswers = [
      ...answers,
      {
        scenarioId: currentScenario.id,
        choiceIndex,
        isCorrect,
      },
    ];

    setSelectedChoice({ ...choice, choiceIndex, isCorrect });
    setAnswers(nextAnswers);
    onScoreUpdate?.(calculateScore(nextAnswers));
  };

  const continueAdventure = () => {
    if (!selectedChoice) return;

    const nextSceneId = selectedChoice.next_scene || selectedChoice.nextScene;
    const nextScenario = nextSceneId ? scenarioById.get(String(nextSceneId)) : null;

    if (nextScenario) {
      setCurrentScenarioId(nextScenario.id);
      setSelectedChoice(null);
      return;
    }

    const nextLinearScenario = scenarios[currentIndex + 1];
    if (nextLinearScenario && selectedChoice.isCorrect) {
      setCurrentScenarioId(nextLinearScenario.id);
      setSelectedChoice(null);
      return;
    }

    finishAdventure();
  };

  const restartGame = () => {
    completedRef.current = false;
    setCurrentScenarioId(scenarios[0]?.id || null);
    setAnswers([]);
    setSelectedChoice(null);
    setIsComplete(false);
    onScoreUpdate?.(0);
  };

  useEffect(() => {
    if (isTimeUp && !isComplete) {
      finishAdventure();
    }
  }, [isTimeUp, isComplete]);

  if (!currentScenario || currentScenario.choices.length === 0) {
    return (
      <div className="p-8 text-center">
        <XCircleIcon className="w-12 h-12 mx-auto mb-4 text-red-600" />
        <p className="font-semibold text-red-700">Adventure content is incomplete.</p>
        <p className="text-sm text-gray-600">Add at least one scenario with choices before students play.</p>
      </div>
    );
  }

  if (isComplete) {
    const finalScore = calculateScore();
    const percentage = Math.round((finalScore / (exercise.max_score || 100)) * 100);

    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <TrophyIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Adventure Complete</h3>
          <p className="text-gray-600 mb-6">
            You made {answers.length} decision{answers.length === 1 ? '' : 's'} and found {correctAnswers} strong path{correctAnswers === 1 ? '' : 's'}.
          </p>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {finalScore}/{exercise.max_score || 100}
            </div>
            <div className="text-sm text-gray-500">{percentage}% mastery</div>
          </div>

          <button
            type="button"
            onClick={restartGame}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
          >
            Replay Adventure
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white p-6 rounded-2xl mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm opacity-90 mb-2">
              <MapIcon className="w-4 h-4" />
              Scenario {currentIndex + 1} of {scenarios.length}
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {currentScenario.title || exercise.content?.story || 'Your Coding Adventure'}
            </h3>
            <p className="text-white/85 text-sm">
              Choose carefully. Correct choices move the story forward and build your score.
            </p>
          </div>

          <div className="bg-white/20 rounded-xl px-4 py-3 text-right">
            <div className="text-xs uppercase tracking-wide opacity-80">Progress</div>
            <div className="text-2xl font-bold">{Math.min(progress, 100)}%</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <p className="text-lg text-gray-800 leading-relaxed mb-4">
            {currentScenario.situation}
          </p>
          <p className="text-blue-700 font-semibold text-lg mb-6">
            {currentScenario.question}
          </p>

          {currentScenario.code_template && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Code Context</h4>
              <div className="bg-gray-900 text-green-300 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm font-mono">
                  <code>{currentScenario.code_template}</code>
                </pre>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {currentScenario.choices.map((choice, index) => {
              const isAnswered = Boolean(selectedChoice);
              const isSelected = selectedChoice?.choiceIndex === index;
              const isCorrect = getChoiceIsCorrect(choice);

              let buttonClass = 'p-4 rounded-xl text-left transition-all duration-200 border-2 ';

              if (isAnswered) {
                if (isSelected && isCorrect) {
                  buttonClass += 'bg-green-500 text-white border-green-500 shadow-lg';
                } else if (isSelected && !isCorrect) {
                  buttonClass += 'bg-red-500 text-white border-red-500 shadow-lg';
                } else if (isCorrect) {
                  buttonClass += 'bg-green-50 text-green-800 border-green-300';
                } else {
                  buttonClass += 'bg-gray-100 text-gray-600 border-gray-200';
                }
              } else {
                buttonClass += 'bg-gray-50 hover:bg-blue-50 border-transparent hover:border-blue-200 cursor-pointer hover:-translate-y-0.5';
              }

              return (
                <button
                  key={`${currentScenario.id}-${index}`}
                  type="button"
                  onClick={() => handleChoice(choice, index)}
                  disabled={isAnswered || isTimeUp}
                  className={`${buttonClass} disabled:cursor-not-allowed`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {isAnswered && isSelected && (
                        isCorrect ? (
                          <CheckCircleIcon className="w-5 h-5" />
                        ) : (
                          <XCircleIcon className="w-5 h-5" />
                        )
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="font-semibold mb-2">{choice.text || `Choice ${index + 1}`}</div>
                      {choice.code && (
                        <div className="bg-gray-800 text-green-300 p-2 rounded text-sm">
                          <code>{choice.code}</code>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedChoice && (
            <div className={`rounded-xl p-4 mb-4 border ${
              selectedChoice.isCorrect
                ? 'bg-green-50 border-green-200 text-green-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-start gap-3">
                <BookOpenIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">
                    {selectedChoice.isCorrect ? 'Strong choice' : 'Learning moment'}
                  </h4>
                  <p className="text-sm leading-relaxed">
                    {selectedChoice.explanation || currentScenario.explanation || (
                      selectedChoice.isCorrect
                        ? 'This choice keeps the solution on track.'
                        : 'This path has a problem. Compare it with the highlighted correct option.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedChoice && (
            <div className="text-center">
              <button
                type="button"
                onClick={continueAdventure}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-lg transition-all"
              >
                {selectedChoice.next_scene || (selectedChoice.isCorrect && scenarios[currentIndex + 1]) ? 'Continue Adventure' : 'Finish Adventure'}
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
        <SparklesIcon className="w-4 h-4 text-emerald-500" />
        Score updates after every decision, so students can feel the consequence immediately.
      </div>
    </div>
  );
}
