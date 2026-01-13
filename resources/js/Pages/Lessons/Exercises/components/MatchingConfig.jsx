// resources/js/Pages/Admin/Exercises/components/MatchingConfig.jsx
import React, { useState } from 'react';
import { Plus, Trash2, Link2, Lightbulb, Zap, ArrowRight, Shuffle } from 'lucide-react';

export default function MatchingConfig({ data, setData, errors }) {
  const [pairs, setPairs] = useState(data.content?.pairs || []);
  const [showQuickSetup, setShowQuickSetup] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');

  const updateContent = (newPairs) => {
    setData('content', {
      ...data.content,
      pairs: newPairs,
      shuffleLeft: data.content?.shuffleLeft ?? true,
      shuffleRight: data.content?.shuffleRight ?? true,
    });
  };

  const addPair = () => {
    const newPairs = [...pairs, {
      id: `pair-${Date.now()}`,
      left: '',
      right: '',
    }];
    setPairs(newPairs);
    updateContent(newPairs);
  };

  const removePair = (index) => {
    const newPairs = pairs.filter((_, i) => i !== index);
    setPairs(newPairs);
    updateContent(newPairs);
  };

  const updatePair = (index, side, value) => {
    const newPairs = [...pairs];
    newPairs[index][side] = value;
    setPairs(newPairs);
    updateContent(newPairs);
  };

  // 批量导入
  const handleBulkImport = () => {
    try {
      const lines = bulkImportText.trim().split('\n').filter(line => line.trim() !== '');
      const newPairs = [];
      
      for (let line of lines) {
        // 支持多种分隔符: → | : =
        const separators = [' → ', ' -> ', ' | ', ' : ', ' = '];
        let separator = separators.find(sep => line.includes(sep));
        
        if (!separator) {
          alert(`⚠️ Line "${line}" doesn't have a valid separator. Use: → | : =`);
          return;
        }
        
        const [left, right] = line.split(separator).map(s => s.trim());
        
        if (left && right) {
          newPairs.push({
            id: `pair-${Date.now()}-${newPairs.length}`,
            left: left,
            right: right,
          });
        }
      }
      
      if (newPairs.length > 0) {
        setPairs([...pairs, ...newPairs]);
        updateContent([...pairs, ...newPairs]);
        setBulkImportText('');
        alert(`✅ Successfully imported ${newPairs.length} pair(s)!`);
      } else {
        alert('❌ No valid pairs found. Check the format.');
      }
    } catch (error) {
      alert('❌ Error parsing pairs. Please check the format.');
    }
  };

  // Quick Templates
  const quickSetupTemplates = {
    pythonKeywords: {
      name: 'Python Keywords',
      pairs: [
        { id: 'p1', left: 'def', right: 'Define a function' },
        { id: 'p2', left: 'if', right: 'Conditional statement' },
        { id: 'p3', left: 'for', right: 'Loop through sequence' },
        { id: 'p4', left: 'while', right: 'Loop with condition' },
        { id: 'p5', left: 'return', right: 'Exit function with value' },
        { id: 'p6', left: 'import', right: 'Bring in external module' },
      ],
    },
    dataTypes: {
      name: 'Data Types',
      pairs: [
        { id: 'p1', left: 'int', right: 'Whole numbers: 1, 2, 3' },
        { id: 'p2', left: 'float', right: 'Decimal numbers: 3.14' },
        { id: 'p3', left: 'str', right: 'Text: "hello"' },
        { id: 'p4', left: 'bool', right: 'True or False' },
        { id: 'p5', left: 'list', right: 'Ordered collection: [1,2,3]' },
        { id: 'p6', left: 'dict', right: 'Key-value pairs: {"a":1}' },
      ],
    },
    operators: {
      name: 'Operators',
      pairs: [
        { id: 'p1', left: '+', right: 'Addition' },
        { id: 'p2', left: '-', right: 'Subtraction' },
        { id: 'p3', left: '*', right: 'Multiplication' },
        { id: 'p4', left: '/', right: 'Division' },
        { id: 'p5', left: '==', right: 'Equal to' },
        { id: 'p6', left: '!=', right: 'Not equal to' },
      ],
    },
    methods: {
      name: 'String Methods',
      pairs: [
        { id: 'p1', left: '.upper()', right: 'Convert to uppercase' },
        { id: 'p2', left: '.lower()', right: 'Convert to lowercase' },
        { id: 'p3', left: '.strip()', right: 'Remove whitespace' },
        { id: 'p4', left: '.split()', right: 'Split into list' },
        { id: 'p5', left: '.replace()', right: 'Replace text' },
        { id: 'p6', left: '.find()', right: 'Find substring position' },
      ],
    },
  };

  const applyQuickSetup = (templateKey) => {
    const template = quickSetupTemplates[templateKey];
    setPairs(template.pairs);
    updateContent(template.pairs);
    setShowQuickSetup(false);
    alert(`✅ Applied "${template.name}" template! Edit the pairs to customize.`);
  };

  // Shuffle options
  const toggleShuffle = (side) => {
    const newData = {
      ...data.content,
      [`shuffle${side.charAt(0).toUpperCase() + side.slice(1)}`]: !data.content?.[`shuffle${side.charAt(0).toUpperCase() + side.slice(1)}`]
    };
    setData('content', newData);
  };

  return (
    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border-2 border-pink-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-pink-600 rounded-xl">
          <Link2 className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-pink-900">Matching Exercise Configuration</h3>
          <p className="text-sm text-pink-700">Create pairs for students to match (connect related items)</p>
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
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-5 border-2 border-purple-300">
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
            Start with pre-made matching pairs
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => applyQuickSetup('pythonKeywords')}
              className="p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 mb-1">🐍 Python Keywords</div>
              <div className="text-xs text-gray-600">def, if, for, while, return</div>
            </button>
            <button
              type="button"
              onClick={() => applyQuickSetup('dataTypes')}
              className="p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 mb-1">📊 Data Types</div>
              <div className="text-xs text-gray-600">int, float, str, bool, list</div>
            </button>
            <button
              type="button"
              onClick={() => applyQuickSetup('operators')}
              className="p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 mb-1">➕ Operators</div>
              <div className="text-xs text-gray-600">+, -, *, /, ==, !=</div>
            </button>
            <button
              type="button"
              onClick={() => applyQuickSetup('methods')}
              className="p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 mb-1">🔤 String Methods</div>
              <div className="text-xs text-gray-600">.upper(), .lower(), .split()</div>
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-cyan-50 to-pink-50 border-2 border-cyan-300 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-cyan-500 rounded-lg">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-cyan-900 mb-2">📚 How to Create Matching Exercise</h4>
            <ol className="text-sm text-cyan-800 space-y-2 ml-4 list-decimal">
              <li><strong>Step 1:</strong> Create pairs (Left side → Right side)</li>
              <li><strong>Step 2:</strong> Left = Term/Code, Right = Definition/Explanation</li>
              <li><strong>Step 3:</strong> Students will draw lines to connect matches</li>
              <li><strong>Step 4:</strong> Items can be shuffled to make it challenging</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Bulk Import */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border-2 border-green-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-600" />
            <h4 className="font-bold text-green-900">⚡ Bulk Import (Fast Method)</h4>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 mb-3 border-2 border-green-200">
          <div className="font-semibold text-sm text-green-900 mb-2">📝 Format (one pair per line):</div>
          <pre className="font-mono text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded border border-gray-300">
{`def → Define a function
if → Conditional statement
for → Loop through sequence
while | Loop with condition
return : Exit function with value`}</pre>
          <p className="text-xs text-green-700 mt-2">
            💡 Use any separator: <code className="bg-white px-1 rounded">→</code> <code className="bg-white px-1 rounded">|</code> <code className="bg-white px-1 rounded">:</code> <code className="bg-white px-1 rounded">=</code>
          </p>
        </div>

        <textarea
          value={bulkImportText}
          onChange={(e) => setBulkImportText(e.target.value)}
          className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none font-mono text-sm"
          rows="8"
          placeholder="def → Define a function&#10;if → Conditional statement&#10;for → Loop through sequence"
        />
        
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-green-700">
            📊 Lines: <strong>{bulkImportText.trim().split('\n').filter(l => l.trim()).length}</strong> 
            ({bulkImportText.trim().split('\n').filter(l => l.trim()).length} pairs will be created)
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
              className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-md text-sm"
              disabled={!bulkImportText.trim()}
            >
              Import All →
            </button>
          </div>
        </div>
      </div>

      {/* Shuffle Options */}
      <div className="bg-white rounded-lg p-5 border-2 border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <Shuffle className="h-5 w-5 text-purple-600" />
          <h4 className="font-bold text-gray-900">Shuffle Options</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-3 cursor-pointer bg-purple-50 p-4 rounded-lg border-2 border-purple-200 hover:bg-purple-100 transition">
            <input
              type="checkbox"
              checked={data.content?.shuffleLeft ?? true}
              onChange={() => toggleShuffle('left')}
              className="w-5 h-5 text-purple-600"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Shuffle Left Side</div>
              <div className="text-xs text-gray-600">Randomize left items order</div>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer bg-purple-50 p-4 rounded-lg border-2 border-purple-200 hover:bg-purple-100 transition">
            <input
              type="checkbox"
              checked={data.content?.shuffleRight ?? true}
              onChange={() => toggleShuffle('right')}
              className="w-5 h-5 text-purple-600"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Shuffle Right Side</div>
              <div className="text-xs text-gray-600">Randomize right items order</div>
            </div>
          </label>
        </div>
      </div>

      {/* Manual Entry */}
      <div className="bg-white rounded-lg p-5 border-2 border-pink-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-pink-600" />
            <h4 className="font-bold text-gray-900">Matching Pairs</h4>
            <span className="px-2 py-0.5 bg-pink-100 text-pink-800 text-xs font-bold rounded-full">
              {pairs.length} pair{pairs.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={addPair}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Pair
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4 bg-pink-50 p-3 rounded border border-pink-200">
          💡 <strong>Example:</strong> Left: "def" → Right: "Define a function"
        </p>

        {pairs.length === 0 && (
          <div className="text-center py-8 bg-pink-50 rounded-lg border-2 border-dashed border-pink-300">
            <Link2 className="h-12 w-12 text-pink-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2 font-semibold">No pairs yet</p>
            <p className="text-sm text-gray-500 mb-3">Create matching pairs for students to connect</p>
            <button
              type="button"
              onClick={addPair}
              className="text-pink-600 font-semibold hover:text-pink-800"
            >
              Create your first pair
            </button>
          </div>
        )}

        <div className="space-y-3">
          {pairs.map((pair, index) => (
            <div key={pair.id} className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-4 border-2 border-pink-200">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                
                <div className="flex-1 grid grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Left Side (Term/Code)
                    </label>
                    <input
                      type="text"
                      value={pair.left}
                      onChange={(e) => updatePair(index, 'left', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-pink-300 rounded-lg focus:border-pink-500 focus:outline-none font-mono"
                      placeholder="e.g., def"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-pink-600 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Right Side (Definition)
                      </label>
                      <input
                        type="text"
                        value={pair.right}
                        onChange={(e) => updatePair(index, 'right', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-pink-300 rounded-lg focus:border-pink-500 focus:outline-none"
                        placeholder="e.g., Define a function"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removePair(index)}
                  className="flex-shrink-0 text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                  title="Delete this pair"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-lg p-5">
        <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
          <span>🎮</span>
          <span>Game Preview</span>
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/70 rounded-lg p-4 border-2 border-indigo-200">
            <div className="font-semibold text-sm text-indigo-900 mb-2">📊 Statistics</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Total Pairs:</span>
                <span className="font-bold text-indigo-600">{pairs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Shuffle Left:</span>
                <span className="font-bold text-purple-600">{data.content?.shuffleLeft ?? true ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Shuffle Right:</span>
                <span className="font-bold text-purple-600">{data.content?.shuffleRight ?? true ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
          <div className="bg-white/70 rounded-lg p-4 border-2 border-indigo-200">
            <div className="font-semibold text-sm text-indigo-900 mb-2">🎯 How Students Play</div>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• Left items appear on left side</li>
              <li>• Right items appear on right side</li>
              <li>• Draw lines to connect matches</li>
              <li>• Get instant feedback on correctness</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}