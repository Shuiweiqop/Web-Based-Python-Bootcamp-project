import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Code,
  Eye,
  FastForward,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';

export default function SimulationGame({ exercise, onScoreUpdate, onComplete, isTimeUp }) {
  const config = exercise.content || {};
  const steps = config.steps || [];
  const variables = config.variables || [];

  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);
  const [variableStates, setVariableStates] = useState({});
  const [checkResults, setCheckResults] = useState({});
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  const initialVariableState = useMemo(() => {
    const initialState = {};
    variables.forEach((variable) => {
      initialState[variable.name] = variable.initialValue;
    });
    return initialState;
  }, [variables]);

  const currentStepData = steps[currentStep] || null;
  const changedVariables = currentStepData?.variableChanges
    ? Object.keys(currentStepData.variableChanges).filter((name) => currentStepData.variableChanges[name] !== '')
    : [];
  const hasQuickCheck = currentStep >= 0 && variables.length > 0 && changedVariables.length > 0;
  const currentCheck = checkResults[currentStep];

  useEffect(() => {
    setVariableStates(initialVariableState);
  }, [initialVariableState]);

  const rebuildStateThrough = (stepIndex) => {
    let nextState = { ...initialVariableState };
    for (let index = 0; index <= stepIndex; index += 1) {
      if (steps[index]?.variableChanges) {
        nextState = { ...nextState, ...steps[index].variableChanges };
      }
    }
    setVariableStates(nextState);
  };

  const goToStep = (stepIndex) => {
    const boundedStep = Math.max(-1, Math.min(stepIndex, steps.length - 1));
    setCurrentStep(boundedStep);
    setSelectedPrediction(null);
    rebuildStateThrough(boundedStep);
  };

  const nextStep = () => {
    if (currentStep >= steps.length - 1) {
      completeSimulation();
      return;
    }
    goToStep(currentStep + 1);
  };

  const prevStep = () => {
    goToStep(currentStep - 1);
  };

  const reset = () => {
    setCurrentStep(-1);
    setIsPlaying(false);
    setVariableStates(initialVariableState);
    setCheckResults({});
    setSelectedPrediction(null);
    setIsComplete(false);
    onScoreUpdate?.(0);
  };

  const togglePlay = () => {
    if (currentStep >= steps.length - 1) {
      reset();
      setTimeout(() => setIsPlaying(true), 100);
    } else {
      setIsPlaying((previous) => !previous);
    }
  };

  const answerQuickCheck = (variableName) => {
    if (!hasQuickCheck || currentCheck) return;

    const isCorrect = changedVariables.includes(variableName);
    setSelectedPrediction(variableName);
    setCheckResults((previous) => ({
      ...previous,
      [currentStep]: { variableName, isCorrect },
    }));
  };

  const calculateScore = () => {
    const maxScore = exercise.max_score || 100;
    const completionRatio = steps.length > 0 ? Math.max(0, currentStep + 1) / steps.length : 0;
    const quickCheckCount = Object.keys(checkResults).length;
    const correctCheckCount = Object.values(checkResults).filter((result) => result.isCorrect).length;
    const quickCheckRatio = quickCheckCount > 0 ? correctCheckCount / quickCheckCount : 0;
    const score = Math.round(maxScore * ((completionRatio * 0.6) + (quickCheckRatio * 0.4)));

    return Math.min(maxScore, score);
  };

  const completeSimulation = () => {
    if (isComplete) return;

    setIsComplete(true);
    setIsPlaying(false);
    const score = calculateScore();
    onScoreUpdate?.(score);

    setTimeout(() => {
      onComplete?.(score);
    }, 1600);
  };

  useEffect(() => {
    if (!isPlaying) return undefined;

    if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
      return undefined;
    }

    const timer = setTimeout(() => {
      nextStep();
    }, playbackSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, playbackSpeed]);

  useEffect(() => {
    if (isTimeUp && !isComplete) {
      completeSimulation();
    }
  }, [isTimeUp, isComplete]);

  if (steps.length === 0) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No simulation steps configured.</p>
        </div>
      </div>
    );
  }

  const progress = currentStep >= 0 ? ((currentStep + 1) / steps.length) * 100 : 0;
  const correctChecks = Object.values(checkResults).filter((result) => result.isCorrect).length;

  return (
    <div className="min-h-[600px] bg-gradient-to-br from-teal-50 to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Code className="w-7 h-7 text-teal-600" />
                {exercise.title || 'Code Simulation'}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Step through execution, then answer quick checks when variables change.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="text-2xl font-bold text-teal-600">
                {Math.max(0, currentStep + 1)} / {steps.length}
              </div>
            </div>
          </div>

          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-4 text-sm text-gray-400">code_simulation.py</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400">Watch Mode</span>
                </div>
              </div>

              <div className="p-6 font-mono text-sm">
                {steps.map((step, index) => {
                  const isCurrentLine = index === currentStep;
                  const isPastLine = index < currentStep;

                  return (
                    <div
                      key={step.id || index}
                      className={`flex items-start gap-4 py-2 px-3 rounded transition-all ${
                        isCurrentLine
                          ? 'bg-yellow-500/20 border-l-4 border-yellow-500'
                          : isPastLine
                            ? 'opacity-70'
                            : 'opacity-40'
                      }`}
                    >
                      <div className={`w-8 text-right flex-shrink-0 ${isCurrentLine ? 'text-yellow-400 font-bold' : 'text-gray-500'}`}>
                        {step.lineNumber}
                      </div>
                      <div className={`flex-1 ${isCurrentLine ? 'text-green-300 font-semibold' : 'text-green-400'}`}>
                        {step.code}
                      </div>
                      {isCurrentLine && <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />}
                    </div>
                  );
                })}
              </div>

              {currentStepData && (
                <div className="bg-blue-900/50 px-6 py-4 border-t border-gray-700">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-blue-300 mb-1">What is happening</div>
                      <div className="text-sm text-gray-300">{currentStepData.explanation || 'No explanation provided.'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Playback Controls</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Speed:</span>
                  <select
                    value={playbackSpeed}
                    onChange={(event) => setPlaybackSpeed(Number(event.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value={2000}>0.5x</option>
                    <option value={1000}>1x</option>
                    <option value={500}>2x</option>
                    <option value={250}>4x</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button type="button" onClick={reset} className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg" disabled={currentStep === -1}>
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button type="button" onClick={prevStep} className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg" disabled={currentStep <= -1}>
                  <SkipForward className="w-5 h-5 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  className={`px-8 py-4 rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2 ${
                    isPlaying ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white'
                  }`}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button type="button" onClick={nextStep} className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg" disabled={currentStep >= steps.length - 1}>
                  <FastForward className="w-5 h-5" />
                </button>
                <button type="button" onClick={completeSimulation} className="p-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                </button>
              </div>

              {hasQuickCheck && (
                <div className="mt-5 pt-5 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Quick Check</h4>
                  <p className="text-sm text-gray-600 mb-3">Which variable changed on this step?</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {variables.map((variable) => {
                      const isSelected = selectedPrediction === variable.name;
                      const isCorrectAnswer = changedVariables.includes(variable.name);
                      return (
                        <button
                          key={variable.id || variable.name}
                          type="button"
                          onClick={() => answerQuickCheck(variable.name)}
                          disabled={Boolean(currentCheck)}
                          className={`rounded-lg border px-3 py-2 font-mono text-sm transition ${
                            currentCheck
                              ? isCorrectAnswer
                                ? 'bg-green-100 border-green-300 text-green-800'
                                : isSelected
                                  ? 'bg-red-100 border-red-300 text-red-800'
                                  : 'bg-gray-50 border-gray-200 text-gray-500'
                              : 'bg-white border-gray-300 hover:border-teal-400 hover:bg-teal-50 text-gray-800'
                          }`}
                        >
                          {variable.name}
                        </button>
                      );
                    })}
                  </div>
                  {currentCheck && (
                    <div className={`mt-3 flex items-center gap-2 text-sm font-semibold ${currentCheck.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {currentCheck.isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {currentCheck.isCorrect ? 'Correct prediction.' : `Good try. Changed variable: ${changedVariables.join(', ')}.`}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Variables
              </h3>

              {variables.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No variables to track</div>
              ) : (
                <div className="space-y-3">
                  {variables.map((variable) => {
                    const currentValue = variableStates[variable.name];
                    const hasChanged = currentValue !== variable.initialValue;

                    return (
                      <div
                        key={variable.id || variable.name}
                        className={`p-4 rounded-lg border-2 transition-all ${hasChanged ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-semibold text-gray-900">{variable.name}</span>
                          <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-200 rounded">{variable.type}</span>
                        </div>
                        <div className="text-2xl font-bold text-teal-600 font-mono">
                          {currentValue !== undefined && currentValue !== ''
                            ? variable.type === 'str' ? `"${currentValue}"` : currentValue
                            : <span className="text-gray-400">-</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Quick Checks</span>
                  <span className="text-sm font-bold text-teal-600">{correctChecks} correct</span>
                </div>
                <p className="text-xs text-gray-500">
                  Completion is worth 60% of the score. Quick-check accuracy is worth 40%.
                </p>
              </div>
            </div>
          </div>
        </div>

        {isComplete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4">
              <div className="text-center">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Simulation Complete</h2>
                <p className="text-gray-600 mb-6">You reviewed {Math.max(0, currentStep + 1)} of {steps.length} execution steps.</p>
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 mb-6">
                  <div className="text-sm text-gray-600 mb-2">Quick Checks</div>
                  <div className="text-4xl font-bold text-teal-600 mb-2">{correctChecks}/{Object.keys(checkResults).length || 0}</div>
                </div>
                <button type="button" onClick={reset} className="w-full px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-xl hover:from-teal-700 hover:to-cyan-700 shadow-lg">
                  Watch Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
