// resources/js/Pages/Admin/Exercises/components/AdventureGameConfig.jsx
import React, { useState } from 'react';
import { Plus, Trash2, Map, MapPin, ArrowRight, Lightbulb, GitBranch } from 'lucide-react';

export default function AdventureGameConfig({ data, setData, errors }) {
  const [scenarios, setScenarios] = useState(data.content?.scenarios || []);
  const [activeScenario, setActiveScenario] = useState(0);
  const [showQuickSetup, setShowQuickSetup] = useState(false);

  const updateContent = (newScenarios) => {
    setData('content', {
      ...data.content,
      scenarios: newScenarios,
    });
  };

  const addScenario = () => {
    const newScenarios = [...scenarios, {
      id: `scene-${Date.now()}`,
      title: '',
      description: '',
      choices: [
        { text: '', next_scene: null, is_correct: true },
        { text: '', next_scene: null, is_correct: false },
      ],
    }];
    setScenarios(newScenarios);
    updateContent(newScenarios);
    setActiveScenario(newScenarios.length - 1);
  };

  const removeScenario = (index) => {
    if (scenarios.length <= 1) {
      alert('⚠️ You must have at least one scenario!');
      return;
    }
    const newScenarios = scenarios.filter((_, i) => i !== index);
    setScenarios(newScenarios);
    updateContent(newScenarios);
    if (activeScenario >= newScenarios.length) {
      setActiveScenario(newScenarios.length - 1);
    }
  };

  const updateScenario = (index, field, value) => {
    const newScenarios = [...scenarios];
    newScenarios[index][field] = value;
    setScenarios(newScenarios);
    updateContent(newScenarios);
  };

  const addChoice = (scenarioIndex) => {
    const newScenarios = [...scenarios];
    newScenarios[scenarioIndex].choices.push({
      text: '',
      next_scene: null,
      is_correct: false,
    });
    setScenarios(newScenarios);
    updateContent(newScenarios);
  };

  const removeChoice = (scenarioIndex, choiceIndex) => {
    const newScenarios = [...scenarios];
    if (newScenarios[scenarioIndex].choices.length <= 1) {
      alert('⚠️ Each scenario must have at least one choice!');
      return;
    }
    newScenarios[scenarioIndex].choices = newScenarios[scenarioIndex].choices.filter((_, i) => i !== choiceIndex);
    setScenarios(newScenarios);
    updateContent(newScenarios);
  };

  const updateChoice = (scenarioIndex, choiceIndex, field, value) => {
    const newScenarios = [...scenarios];
    newScenarios[scenarioIndex].choices[choiceIndex][field] = value;
    setScenarios(newScenarios);
    updateContent(newScenarios);
  };

  // 快速模板
  const quickSetupTemplates = {
    debugging: {
      name: 'Debugging Adventure',
      scenarios: [
        {
          id: 'scene-1',
          title: 'The Mysterious Bug',
          description: 'Your code prints the wrong output. What do you check first?',
          choices: [
            { text: 'Check the syntax errors', next_scene: 'scene-2', is_correct: true },
            { text: 'Restart the computer', next_scene: null, is_correct: false },
            { text: 'Ignore and move on', next_scene: null, is_correct: false },
          ],
        },
        {
          id: 'scene-2',
          title: 'Found the Issue!',
          description: 'You found a missing colon. Great debugging!',
          choices: [
            { text: 'Fix it and test', next_scene: null, is_correct: true },
          ],
        },
      ],
    },
    variables: {
      name: 'Variable Quest',
      scenarios: [
        {
          id: 'scene-1',
          title: 'The Assignment Challenge',
          description: 'You need to store a number. Which is correct?',
          choices: [
            { text: 'x = 10', next_scene: 'scene-2', is_correct: true },
            { text: '10 = x', next_scene: null, is_correct: false },
            { text: 'x == 10', next_scene: null, is_correct: false },
          ],
        },
        {
          id: 'scene-2',
          title: 'Perfect!',
          description: 'You correctly assigned the value. Variables store data!',
          choices: [
            { text: 'Continue learning', next_scene: null, is_correct: true },
          ],
        },
      ],
    },
    loops: {
      name: 'Loop Adventure',
      scenarios: [
        {
          id: 'scene-1',
          title: 'Repeat the Task',
          description: 'You need to print numbers 1 to 5. What do you use?',
          choices: [
            { text: 'for i in range(5):', next_scene: 'scene-2', is_correct: true },
            { text: 'print(1,2,3,4,5)', next_scene: null, is_correct: false },
            { text: 'if i == 5:', next_scene: null, is_correct: false },
          ],
        },
        {
          id: 'scene-2',
          title: 'Loop Master!',
          description: 'Great! Loops help automate repetitive tasks.',
          choices: [
            { text: 'Next challenge', next_scene: null, is_correct: true },
          ],
        },
      ],
    },
  };

  const applyQuickSetup = (templateKey) => {
    const template = quickSetupTemplates[templateKey];
    setScenarios(template.scenarios);
    updateContent(template.scenarios);
    setActiveScenario(0);
    setShowQuickSetup(false);
    alert(`✅ Applied "${template.name}" template! Edit the scenarios to customize.`);
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-green-600 rounded-xl">
          <Map className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-green-900">Adventure Game Configuration</h3>
          <p className="text-sm text-green-700">Create story-based learning scenarios with choices</p>
        </div>
        <button
          type="button"
          onClick={() => setShowQuickSetup(!showQuickSetup)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Lightbulb className="h-4 w-4" />
          Quick Setup
        </button>
      </div>

      {/* Quick Setup Templates */}
      {showQuickSetup && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border-2 border-purple-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              <h4 className="font-bold text-purple-900">Quick Setup Templates</h4>
            </div>
            <button
              type="button"
              onClick={() => setShowQuickSetup(false)}
              className="text-purple-600 hover:text-purple-800 font-semibold text-sm"
            >
              ✕ Close
            </button>
          </div>
          <p className="text-sm text-purple-700 mb-4">
            Start with a pre-made story and customize it
          </p>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => applyQuickSetup('debugging')}
              className="p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 mb-1">🐛 Debugging Adventure</div>
              <div className="text-xs text-gray-600">Find and fix code bugs</div>
            </button>
            <button
              type="button"
              onClick={() => applyQuickSetup('variables')}
              className="p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 mb-1">📦 Variable Quest</div>
              <div className="text-xs text-gray-600">Learn about variables</div>
            </button>
            <button
              type="button"
              onClick={() => applyQuickSetup('loops')}
              className="p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 mb-1">🔄 Loop Adventure</div>
              <div className="text-xs text-gray-600">Master for and while loops</div>
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-cyan-50 to-green-50 border-2 border-cyan-300 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-cyan-500 rounded-lg">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-cyan-900 mb-2">📚 How to Create an Adventure Game</h4>
            <ol className="text-sm text-cyan-800 space-y-2 ml-4 list-decimal">
              <li><strong>Step 1:</strong> Create "Scenarios" (story scenes with descriptions)</li>
              <li><strong>Step 2:</strong> Add "Choices" for each scenario (what students can do)</li>
              <li><strong>Step 3:</strong> Mark which choices are correct (lead to success)</li>
              <li><strong>Step 4:</strong> Link choices to next scenarios (create story branches)</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Scenario Management */}
      <div className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-green-600" />
            <h4 className="font-bold text-gray-900">Story Scenarios</h4>
            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-bold rounded-full">
              {scenarios.length} scenes
            </span>
          </div>
          <button
            type="button"
            onClick={addScenario}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Scenario
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4 bg-green-50 p-3 rounded border border-green-200">
          💡 <strong>Example:</strong> "You found a bug in your code. What do you do first?"
        </p>

        {scenarios.length === 0 && (
          <div className="text-center py-8 bg-green-50 rounded-lg border-2 border-dashed border-green-300">
            <Map className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2 font-semibold">No scenarios yet</p>
            <p className="text-sm text-gray-500 mb-3">Create story scenes with choices</p>
            <button
              type="button"
              onClick={addScenario}
              className="text-green-600 font-semibold hover:text-green-800"
            >
              Create your first scenario
            </button>
          </div>
        )}

        {/* Scenario Tabs */}
        {scenarios.length > 0 && (
          <>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {scenarios.map((scenario, index) => (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => setActiveScenario(index)}
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeScenario === index
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  Scene {index + 1}
                </button>
              ))}
            </div>

            {/* Active Scenario Editor */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border-2 border-green-200">
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-bold text-green-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Scenario {activeScenario + 1}
                </h5>
                {scenarios.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeScenario(activeScenario)}
                    className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Delete Scene</span>
                  </button>
                )}
              </div>

              {/* Scenario Title */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Scene Title
                </label>
                <input
                  type="text"
                  value={scenarios[activeScenario]?.title || ''}
                  onChange={(e) => updateScenario(activeScenario, 'title', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none font-semibold"
                  placeholder="e.g., The Debugging Challenge"
                />
              </div>

              {/* Scenario Description */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Scene Description (Story Text)
                </label>
                <textarea
                  value={scenarios[activeScenario]?.description || ''}
                  onChange={(e) => updateScenario(activeScenario, 'description', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                  rows="4"
                  placeholder="Tell the story... What situation is the student in?"
                />
              </div>

              {/* Choices */}
              <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h6 className="font-semibold text-gray-900">Choices (Student Actions)</h6>
                  <button
                    type="button"
                    onClick={() => addChoice(activeScenario)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700"
                  >
                    <Plus className="h-3 w-3" />
                    Add Choice
                  </button>
                </div>

                <div className="space-y-3">
                  {scenarios[activeScenario]?.choices.map((choice, choiceIndex) => (
                    <div key={choiceIndex} className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-gray-600">Choice {choiceIndex + 1}</span>
                        {scenarios[activeScenario].choices.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeChoice(activeScenario, choiceIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={choice.text}
                        onChange={(e) => updateChoice(activeScenario, choiceIndex, 'text', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded mb-2 focus:border-blue-500 focus:outline-none"
                        placeholder="e.g., Check the syntax errors"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded border-2 border-gray-300 hover:bg-green-50">
                          <input
                            type="checkbox"
                            checked={choice.is_correct || false}
                            onChange={(e) => updateChoice(activeScenario, choiceIndex, 'is_correct', e.target.checked)}
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="text-sm font-medium text-gray-700">✅ Correct Choice</span>
                        </label>

                        <select
                          value={choice.next_scene || ''}
                          onChange={(e) => updateChoice(activeScenario, choiceIndex, 'next_scene', e.target.value || null)}
                          className="px-3 py-2 border-2 border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">End / No next scene</option>
                          {scenarios.map((s, i) => (
                            i !== activeScenario && (
                              <option key={s.id} value={s.id}>
                                → Scene {i + 1}: {s.title || 'Untitled'}
                              </option>
                            )
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-lg p-5">
        <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
          <span>🎮</span>
          <span>Game Flow Preview</span>
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/70 rounded-lg p-4 border-2 border-indigo-200">
            <div className="font-semibold text-sm text-indigo-900 mb-2">📊 Statistics</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Total Scenes:</span>
                <span className="font-bold text-indigo-600">{scenarios.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Total Choices:</span>
                <span className="font-bold text-indigo-600">
                  {scenarios.reduce((sum, s) => sum + (s.choices?.length || 0), 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Branches:</span>
                <span className="font-bold text-green-600">
                  {scenarios.reduce((sum, s) => sum + (s.choices?.filter(c => c.next_scene).length || 0), 0)}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white/70 rounded-lg p-4 border-2 border-indigo-200">
            <div className="font-semibold text-sm text-indigo-900 mb-2">🎯 How Students Play</div>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• Read the scenario description</li>
              <li>• Choose one action from options</li>
              <li>• Progress through story branches</li>
              <li>• Learn from correct/wrong choices</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}