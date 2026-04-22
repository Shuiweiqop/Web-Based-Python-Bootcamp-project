import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, SkipForward, RotateCcw, FastForward, 
  CheckCircle, Trophy, Code, Eye, Zap, AlertCircle 
} from 'lucide-react';

export default function SimulationGame({ exercise, onScoreUpdate, onComplete, isTimeUp }) {
  const config = exercise.content || {};
  const steps = config.steps || [];
  const variables = config.variables || [];
  
  const [currentStep, setCurrentStep] = useState(-1); // -1 = not started
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // milliseconds
  const [variableStates, setVariableStates] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [understanding, setUnderstanding] = useState({}); // Track if student understands each step

  // Initialize variables
  useEffect(() => {
    const initialState = {};
    variables.forEach(v => {
      initialState[v.name] = v.initialValue;
    });
    setVariableStates(initialState);
  }, [variables]);

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      nextStep();
    }, playbackSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, playbackSpeed]);

  // Handle time up
  useEffect(() => {
    if (isTimeUp && !isComplete) {
      completeSimulation();
    }
  }, [isTimeUp]);

  const nextStep = () => {
    if (currentStep >= steps.length - 1) {
      completeSimulation();
      return;
    }

    const nextStepIndex = currentStep + 1;
    setCurrentStep(nextStepIndex);

    // Update variable states
    const step = steps[nextStepIndex];
    if (step.variableChanges) {
      setVariableStates(prev => ({
        ...prev,
        ...step.variableChanges
      }));
    }
  };

  const prevStep = () => {
    if (currentStep > -1) {
      setCurrentStep(prev => prev - 1);
      
      // Recalculate variable states up to previous step
      const initialState = {};
      variables.forEach(v => {
        initialState[v.name] = v.initialValue;
      });
      
      let newState = { ...initialState };
      for (let i = 0; i <= currentStep - 1; i++) {
        if (steps[i].variableChanges) {
          newState = { ...newState, ...steps[i].variableChanges };
        }
      }
      setVariableStates(newState);
    }
  };

  const reset = () => {
    setCurrentStep(-1);
    setIsPlaying(false);
    const initialState = {};
    variables.forEach(v => {
      initialState[v.name] = v.initialValue;
    });
    setVariableStates(initialState);
    setUnderstanding({});
    setIsComplete(false);
  };

  const togglePlay = () => {
    if (currentStep >= steps.length - 1) {
      reset();
      setTimeout(() => setIsPlaying(true), 100);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const markAsUnderstood = (stepIndex) => {
    setUnderstanding(prev => ({
      ...prev,
      [stepIndex]: true
    }));
  };

  const completeSimulation = () => {
    setIsComplete(true);
    setIsPlaying(false);

    // Calculate score based on completion and understanding
    const maxScore = exercise.max_score || 100;
    let score = 0;

    // Base score for completing all steps
    if (currentStep >= steps.length - 1) {
      score = 50;
    }

    // Bonus for marking steps as understood
    const understoodCount = Object.keys(understanding).length;
    score += Math.floor((understoodCount / steps.length) * 50);

    score = Math.min(score, maxScore);

    console.log('🎬 Simulation Complete:', { score, understoodCount, totalSteps: steps.length });

    if (onScoreUpdate) {
      onScoreUpdate(score);
    }

    setTimeout(() => {
      if (onComplete) {
        onComplete(score);
      }
    }, 2000);
  };

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

  const currentStepData = steps[currentStep] || null;
  const progress = currentStep >= 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  return (
    <div className="min-h-[600px] bg-gradient-to-br from-teal-50 to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Code className="w-7 h-7 text-teal-600" />
                {exercise.title || 'Code Simulation'}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Watch the code execute step-by-step
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="text-2xl font-bold text-teal-600">
                {currentStep + 1} / {steps.length}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Code Display */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
              {/* Code Editor Header */}
              <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-4 text-sm text-gray-400">code_simulation.py</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400">Watch Mode</span>
                </div>
              </div>

              {/* Code Lines */}
              <div className="p-6 font-mono text-sm">
                {steps.map((step, index) => {
                  const isCurrentLine = index === currentStep;
                  const isPastLine = index < currentStep;
                  const isHighlighted = step.highlight;

                  return (
                    <div
                      key={step.id}
                      className={`flex items-start gap-4 py-2 px-3 rounded transition-all ${
                        isCurrentLine 
                          ? 'bg-yellow-500/20 border-l-4 border-yellow-500' 
                          : isPastLine
                          ? 'opacity-60'
                          : 'opacity-40'
                      }`}
                    >
                      <div className={`w-8 text-right flex-shrink-0 ${
                        isCurrentLine ? 'text-yellow-400 font-bold' : 'text-gray-500'
                      }`}>
                        {step.lineNumber}
                      </div>
                      <div className={`flex-1 ${
                        isCurrentLine ? 'text-green-300 font-semibold' : 'text-green-400'
                      }`}>
                        {step.code}
                      </div>
                      {isCurrentLine && (
                        <div className="flex-shrink-0">
                          <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation Panel */}
              {currentStepData && (
                <div className="bg-blue-900/50 px-6 py-4 border-t border-gray-700">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-blue-300 mb-1">
                        What's happening:
                      </div>
                      <div className="text-sm text-gray-300">
                        {currentStepData.explanation}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Playback Controls</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Speed:</span>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
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
                <button
                  onClick={reset}
                  className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  disabled={currentStep === -1}
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <button
                  onClick={prevStep}
                  className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  disabled={currentStep <= -1}
                >
                  <SkipForward className="w-5 h-5 rotate-180" />
                </button>

                <button
                  onClick={togglePlay}
                  className={`px-8 py-4 rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2 ${
                    isPlaying
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-6 h-6" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6" />
                      <span>Play</span>
                    </>
                  )}
                </button>

                <button
                  onClick={nextStep}
                  className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  disabled={currentStep >= steps.length - 1}
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                <button
                  onClick={completeSimulation}
                  className="p-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
              </div>

              {currentStepData && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => markAsUnderstood(currentStep)}
                    disabled={understanding[currentStep]}
                    className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                      understanding[currentStep]
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {understanding[currentStep] ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Got it!
                      </span>
                    ) : (
                      'I understand this step'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Variables Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Variables
              </h3>

              {variables.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No variables to track
                </div>
              ) : (
                <div className="space-y-3">
                  {variables.map((variable) => {
                    const currentValue = variableStates[variable.name];
                    const hasChanged = currentValue !== variable.initialValue;

                    return (
                      <div
                        key={variable.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          hasChanged
                            ? 'bg-yellow-50 border-yellow-300 animate-pulse'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-semibold text-gray-900">
                            {variable.name}
                          </span>
                          <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-200 rounded">
                            {variable.type}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-teal-600 font-mono">
                          {currentValue !== undefined && currentValue !== '' 
                            ? variable.type === 'str' ? `"${currentValue}"` : currentValue
                            : <span className="text-gray-400">-</span>
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Understanding Progress */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Understanding</span>
                  <span className="text-sm font-bold text-teal-600">
                    {Object.keys(understanding).length} / {steps.length}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
                    style={{ width: `${(Object.keys(understanding).length / steps.length) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Mark steps as understood to increase your score!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Modal */}
        {isComplete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 animate-scaleIn">
              <div className="text-center">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Simulation Complete!
                </h2>
                <p className="text-gray-600 mb-6">
                  You've watched all {steps.length} execution steps
                </p>

                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 mb-6">
                  <div className="text-sm text-gray-600 mb-2">Steps Understood</div>
                  <div className="text-4xl font-bold text-teal-600 mb-2">
                    {Object.keys(understanding).length}/{steps.length}
                  </div>
                  <div className="text-sm text-gray-500">
                    {Math.round((Object.keys(understanding).length / steps.length) * 100)}% mastery
                  </div>
                </div>

                <button
                  onClick={reset}
                  className="w-full px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg"
                >
                  Watch Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}