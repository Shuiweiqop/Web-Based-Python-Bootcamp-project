// resources/js/Pages/Admin/Exercises/components/SimulationConfig.jsx
import React, { useState } from 'react';
import { Plus, Trash2, Play, Lightbulb, Zap, Code, Eye, CheckCircle } from 'lucide-react';

export default function SimulationConfig({ data, setData, errors }) {
  const [simulationType, setSimulationType] = useState(data.content?.simulationType || 'code_execution');
  const [steps, setSteps] = useState(data.content?.steps || []);
  const [variables, setVariables] = useState(data.content?.variables || []);
  const [showQuickSetup, setShowQuickSetup] = useState(false);

  const updateContent = (newData) => {
    setData('content', {
      ...data.content,
      simulationType: simulationType,
      ...newData,
    });
  };

  // Simulation Types
  const simulationTypes = {
    code_execution: {
      name: 'Code Execution',
      icon: '💻',
      description: 'Step-by-step code execution visualization',
    },
    variable_tracking: {
      name: 'Variable Tracking',
      icon: '📦',
      description: 'Track how variables change during execution',
    },
    function_calls: {
      name: 'Function Calls',
      icon: '📞',
      description: 'Visualize function call stack',
    },
    memory_diagram: {
      name: 'Memory Diagram',
      icon: '🧠',
      description: 'Show memory allocation and references',
    },
  };

  const handleTypeChange = (type) => {
    setSimulationType(type);
    updateContent({ simulationType: type, steps, variables });
  };

  // Steps Management
  const addStep = () => {
    const newSteps = [...steps, {
      id: `step-${Date.now()}`,
      lineNumber: steps.length + 1,
      code: '',
      explanation: '',
      variableChanges: {},
      highlight: true,
    }];
    setSteps(newSteps);
    updateContent({ steps: newSteps, variables });
  };

  const removeStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // 重新编号
    const reorderedSteps = newSteps.map((step, idx) => ({
      ...step,
      lineNumber: idx + 1,
    }));
    setSteps(reorderedSteps);
    updateContent({ steps: reorderedSteps, variables });
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
    updateContent({ steps: newSteps, variables });
  };

  // Variables Management
  const addVariable = () => {
    const newVariables = [...variables, {
      id: `var-${Date.now()}`,
      name: '',
      initialValue: '',
      type: 'int',
    }];
    setVariables(newVariables);
    updateContent({ steps, variables: newVariables });
  };

  const removeVariable = (index) => {
    const newVariables = variables.filter((_, i) => i !== index);
    setVariables(newVariables);
    updateContent({ steps, variables: newVariables });
  };

  const updateVariable = (index, field, value) => {
    const newVariables = [...variables];
    newVariables[index][field] = value;
    setVariables(newVariables);
    updateContent({ steps, variables: newVariables });
  };

  // Variable Change in Step
  const updateVariableChange = (stepIndex, varName, value) => {
    const newSteps = [...steps];
    newSteps[stepIndex].variableChanges = {
      ...newSteps[stepIndex].variableChanges,
      [varName]: value,
    };
    setSteps(newSteps);
    updateContent({ steps: newSteps, variables });
  };

  // Quick Templates
  const quickSetupTemplates = {
    simpleLoop: {
      name: 'Simple Loop',
      type: 'code_execution',
      variables: [
        { id: 'v1', name: 'i', initialValue: '0', type: 'int' },
        { id: 'v2', name: 'sum', initialValue: '0', type: 'int' },
      ],
      steps: [
        {
          id: 's1',
          lineNumber: 1,
          code: 'sum = 0',
          explanation: 'Initialize sum to 0',
          variableChanges: { sum: '0' },
          highlight: true,
        },
        {
          id: 's2',
          lineNumber: 2,
          code: 'for i in range(3):',
          explanation: 'Start loop, i = 0',
          variableChanges: { i: '0' },
          highlight: true,
        },
        {
          id: 's3',
          lineNumber: 3,
          code: '    sum = sum + i',
          explanation: 'sum = 0 + 0 = 0',
          variableChanges: { sum: '0' },
          highlight: true,
        },
        {
          id: 's4',
          lineNumber: 2,
          code: 'for i in range(3):',
          explanation: 'Loop continues, i = 1',
          variableChanges: { i: '1' },
          highlight: true,
        },
        {
          id: 's5',
          lineNumber: 3,
          code: '    sum = sum + i',
          explanation: 'sum = 0 + 1 = 1',
          variableChanges: { sum: '1' },
          highlight: true,
        },
        {
          id: 's6',
          lineNumber: 2,
          code: 'for i in range(3):',
          explanation: 'Loop continues, i = 2',
          variableChanges: { i: '2' },
          highlight: true,
        },
        {
          id: 's7',
          lineNumber: 3,
          code: '    sum = sum + i',
          explanation: 'sum = 1 + 2 = 3',
          variableChanges: { sum: '3' },
          highlight: true,
        },
      ],
    },
    conditionalLogic: {
      name: 'Conditional Logic',
      type: 'code_execution',
      variables: [
        { id: 'v1', name: 'x', initialValue: '10', type: 'int' },
        { id: 'v2', name: 'result', initialValue: '', type: 'str' },
      ],
      steps: [
        {
          id: 's1',
          lineNumber: 1,
          code: 'x = 10',
          explanation: 'Initialize x to 10',
          variableChanges: { x: '10' },
          highlight: true,
        },
        {
          id: 's2',
          lineNumber: 2,
          code: 'if x > 5:',
          explanation: 'Check condition: 10 > 5 is True',
          variableChanges: {},
          highlight: true,
        },
        {
          id: 's3',
          lineNumber: 3,
          code: '    result = "big"',
          explanation: 'Condition is True, execute this branch',
          variableChanges: { result: 'big' },
          highlight: true,
        },
        {
          id: 's4',
          lineNumber: 5,
          code: 'else:',
          explanation: 'Skip else branch',
          variableChanges: {},
          highlight: false,
        },
      ],
    },
    functionCall: {
      name: 'Function Call',
      type: 'function_calls',
      variables: [
        { id: 'v1', name: 'a', initialValue: '5', type: 'int' },
        { id: 'v2', name: 'b', initialValue: '3', type: 'int' },
        { id: 'v3', name: 'result', initialValue: '', type: 'int' },
      ],
      steps: [
        {
          id: 's1',
          lineNumber: 1,
          code: 'def add(x, y):',
          explanation: 'Define function add',
          variableChanges: {},
          highlight: true,
        },
        {
          id: 's2',
          lineNumber: 2,
          code: '    return x + y',
          explanation: 'Function body (not executed yet)',
          variableChanges: {},
          highlight: false,
        },
        {
          id: 's3',
          lineNumber: 4,
          code: 'result = add(5, 3)',
          explanation: 'Call add function with 5 and 3',
          variableChanges: { a: '5', b: '3' },
          highlight: true,
        },
        {
          id: 's4',
          lineNumber: 2,
          code: '    return x + y',
          explanation: 'Inside function: 5 + 3 = 8',
          variableChanges: {},
          highlight: true,
        },
        {
          id: 's5',
          lineNumber: 4,
          code: 'result = add(5, 3)',
          explanation: 'Return to caller, result = 8',
          variableChanges: { result: '8' },
          highlight: true,
        },
      ],
    },
  };

  const applyQuickSetup = (templateKey) => {
    const template = quickSetupTemplates[templateKey];
    setSimulationType(template.type);
    setVariables(template.variables);
    setSteps(template.steps);
    updateContent({
      simulationType: template.type,
      variables: template.variables,
      steps: template.steps,
    });
    setShowQuickSetup(false);
    alert(`✅ Applied "${template.name}" template! Edit the steps to customize.`);
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border-2 border-teal-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-teal-600 rounded-xl">
          <Play className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-teal-900">Simulation Configuration</h3>
          <p className="text-sm text-teal-700">Create interactive code execution simulations</p>
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
            Start with pre-made simulation examples
          </p>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => applyQuickSetup('simpleLoop')}
              className="p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 mb-1">🔄 Simple Loop</div>
              <div className="text-xs text-gray-600">For loop with sum calculation</div>
            </button>
            <button
              type="button"
              onClick={() => applyQuickSetup('conditionalLogic')}
              className="p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 mb-1">🔀 Conditional Logic</div>
              <div className="text-xs text-gray-600">If-else statement execution</div>
            </button>
            <button
              type="button"
              onClick={() => applyQuickSetup('functionCall')}
              className="p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 mb-1">📞 Function Call</div>
              <div className="text-xs text-gray-600">Function definition and call</div>
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-cyan-50 to-teal-50 border-2 border-cyan-300 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-cyan-500 rounded-lg">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-cyan-900 mb-2">📚 How to Create a Simulation</h4>
            <ol className="text-sm text-cyan-800 space-y-2 ml-4 list-decimal">
              <li><strong>Step 1:</strong> Choose simulation type (code execution, variables, etc.)</li>
              <li><strong>Step 2:</strong> Define variables that will be tracked</li>
              <li><strong>Step 3:</strong> Create execution steps with code and explanations</li>
              <li><strong>Step 4:</strong> Show how variables change at each step</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Simulation Type Selection */}
      <div className="bg-white rounded-lg p-5 border-2 border-teal-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
          <h4 className="font-bold text-gray-900">Simulation Type</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(simulationTypes).map(([key, type]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTypeChange(key)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                simulationType === key
                  ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                  : 'border-gray-300 hover:border-teal-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{type.icon}</span>
                <span className="font-semibold text-gray-900">{type.name}</span>
              </div>
              <div className="text-xs text-gray-600">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Variables Definition */}
      <div className="bg-white rounded-lg p-5 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
            <h4 className="font-bold text-gray-900">Variables to Track</h4>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
              {variables.length} var{variables.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={addVariable}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Variable
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded border border-blue-200">
          💡 Define variables that students will see changing during execution
        </p>

        {variables.length === 0 && (
          <div className="text-center py-6 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300">
            <p className="text-gray-600 mb-2">No variables yet</p>
            <button
              type="button"
              onClick={addVariable}
              className="text-blue-600 font-semibold hover:text-blue-800"
            >
              Add your first variable
            </button>
          </div>
        )}

        <div className="space-y-2">
          {variables.map((variable, index) => (
            <div key={variable.id} className="bg-blue-50 rounded-lg p-3 border border-blue-200 flex items-center gap-3">
              <div className="flex-1 grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={variable.name}
                  onChange={(e) => updateVariable(index, 'name', e.target.value)}
                  className="px-3 py-2 border-2 border-blue-300 rounded focus:border-blue-500 focus:outline-none font-mono"
                  placeholder="Variable name"
                />
                <input
                  type="text"
                  value={variable.initialValue}
                  onChange={(e) => updateVariable(index, 'initialValue', e.target.value)}
                  className="px-3 py-2 border-2 border-blue-300 rounded focus:border-blue-500 focus:outline-none"
                  placeholder="Initial value"
                />
                <select
                  value={variable.type}
                  onChange={(e) => updateVariable(index, 'type', e.target.value)}
                  className="px-3 py-2 border-2 border-blue-300 rounded focus:border-blue-500 focus:outline-none"
                >
                  <option value="int">int</option>
                  <option value="str">str</option>
                  <option value="float">float</option>
                  <option value="bool">bool</option>
                  <option value="list">list</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeVariable(index)}
                className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Execution Steps */}
      <div className="bg-white rounded-lg p-5 border-2 border-green-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
            <h4 className="font-bold text-gray-900">Execution Steps</h4>
            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-bold rounded-full">
              {steps.length} step{steps.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={addStep}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Step
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4 bg-green-50 p-3 rounded border border-green-200">
          💡 Create steps showing code execution line-by-line with explanations
        </p>

        {steps.length === 0 && (
          <div className="text-center py-6 bg-green-50 rounded-lg border-2 border-dashed border-green-300">
            <Play className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">No steps yet</p>
            <button
              type="button"
              onClick={addStep}
              className="text-green-600 font-semibold hover:text-green-800"
            >
              Create your first step
            </button>
          </div>
        )}

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <h5 className="font-semibold text-gray-900">Step {index + 1}</h5>
                </div>
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Line Number */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Line Number
                  </label>
                  <input
                    type="number"
                    value={step.lineNumber}
                    onChange={(e) => updateStep(index, 'lineNumber', parseInt(e.target.value) || 1)}
                    className="w-24 px-3 py-2 border-2 border-green-300 rounded focus:border-green-500 focus:outline-none"
                    min="1"
                  />
                </div>

                {/* Code */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Code Line
                  </label>
                  <input
                    type="text"
                    value={step.code}
                    onChange={(e) => updateStep(index, 'code', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-green-300 rounded focus:border-green-500 focus:outline-none font-mono text-sm bg-gray-900 text-green-400"
                    placeholder="e.g., sum = sum + i"
                  />
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Explanation (What happens)
                  </label>
                  <textarea
                    value={step.explanation}
                    onChange={(e) => updateStep(index, 'explanation', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-green-300 rounded focus:border-green-500 focus:outline-none"
                    rows="2"
                    placeholder="e.g., Add current value of i to sum"
                  />
                </div>

                {/* Variable Changes */}
                {variables.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Variable Changes (leave empty if no change)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {variables.map((variable) => (
                        <div key={variable.id} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-300">
                          <span className="text-sm font-mono font-semibold text-gray-700 min-w-16">
                            {variable.name}:
                          </span>
                          <input
                            type="text"
                            value={step.variableChanges?.[variable.name] || ''}
                            onChange={(e) => updateVariableChange(index, variable.name, e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="new value"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Highlight Option */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={step.highlight}
                      onChange={(e) => updateStep(index, 'highlight', e.target.checked)}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      💡 Highlight this step (important line)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-5">
        <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
          <Eye className="h-5 w-5" />
          <span>Simulation Preview</span>
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/70 rounded-lg p-4 border-2 border-purple-200">
            <div className="font-semibold text-sm text-purple-900 mb-2">📊 Statistics</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Type:</span>
                <span className="font-bold text-teal-600">
                  {simulationTypes[simulationType]?.icon} {simulationTypes[simulationType]?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Variables:</span>
                <span className="font-bold text-blue-600">{variables.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Steps:</span>
                <span className="font-bold text-green-600">{steps.length}</span>
              </div>
            </div>
          </div>
          <div className="col-span-2 bg-white/70 rounded-lg p-4 border-2 border-purple-200">
            <div className="font-semibold text-sm text-purple-900 mb-2">🎯 How Students Experience</div>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• Step through code execution one line at a time</li>
              <li>• See variables update in real-time</li>
              <li>• Read explanations for each step</li>
              <li>• Understand program flow visually</li>
              <li>• Control playback speed (play/pause/step)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}