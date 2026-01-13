// resources/js/Pages/Admin/Exercises/components/SortingConfig.jsx
import React, { useState } from 'react';
import { Plus, Trash2, ArrowUpDown, Lightbulb, Zap, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

export default function SortingConfig({ data, setData, errors }) {
  const [items, setItems] = useState(data.content?.items || []);
  const [showQuickSetup, setShowQuickSetup] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');

  const updateContent = (newItems) => {
    setData('content', {
      ...data.content,
      items: newItems,
      instruction: data.content?.instruction || 'Arrange the items in the correct order',
    });
  };

  const addItem = () => {
    const newItems = [...items, {
      id: `item-${Date.now()}`,
      text: '',
      correctOrder: items.length + 1,
    }];
    setItems(newItems);
    updateContent(newItems);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    // 重新编号
    const reorderedItems = newItems.map((item, idx) => ({
      ...item,
      correctOrder: idx + 1,
    }));
    setItems(reorderedItems);
    updateContent(reorderedItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
    updateContent(newItems);
  };

  const moveItem = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === items.length - 1)
    ) {
      return;
    }

    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // 交换位置
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    // 重新编号
    const reorderedItems = newItems.map((item, idx) => ({
      ...item,
      correctOrder: idx + 1,
    }));
    
    setItems(reorderedItems);
    updateContent(reorderedItems);
  };

  // 批量导入
  const handleBulkImport = () => {
    try {
      const lines = bulkImportText.trim().split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        alert('❌ No items found. Please enter at least one item per line.');
        return;
      }

      const newItems = lines.map((line, index) => ({
        id: `item-${Date.now()}-${index}`,
        text: line.trim(),
        correctOrder: items.length + index + 1,
      }));
      
      setItems([...items, ...newItems]);
      updateContent([...items, ...newItems]);
      setBulkImportText('');
      alert(`✅ Successfully imported ${newItems.length} item(s)!`);
    } catch (error) {
      alert('❌ Error parsing items. Please check the format.');
    }
  };

  // Quick Templates
  const quickSetupTemplates = {
    pythonSteps: {
      name: 'Python Execution Steps',
      items: [
        { id: 'i1', text: 'Write the code', correctOrder: 1 },
        { id: 'i2', text: 'Save the file with .py extension', correctOrder: 2 },
        { id: 'i3', text: 'Open terminal/command prompt', correctOrder: 3 },
        { id: 'i4', text: 'Navigate to file directory', correctOrder: 4 },
        { id: 'i5', text: 'Run: python filename.py', correctOrder: 5 },
      ],
    },
    loopExecution: {
      name: 'Loop Execution Order',
      items: [
        { id: 'i1', text: 'Initialize counter variable', correctOrder: 1 },
        { id: 'i2', text: 'Check condition', correctOrder: 2 },
        { id: 'i3', text: 'Execute loop body', correctOrder: 3 },
        { id: 'i4', text: 'Update counter', correctOrder: 4 },
        { id: 'i5', text: 'Return to condition check', correctOrder: 5 },
      ],
    },
    debugging: {
      name: 'Debugging Process',
      items: [
        { id: 'i1', text: 'Identify the error', correctOrder: 1 },
        { id: 'i2', text: 'Read error message', correctOrder: 2 },
        { id: 'i3', text: 'Locate the line causing error', correctOrder: 3 },
        { id: 'i4', text: 'Fix the code', correctOrder: 4 },
        { id: 'i5', text: 'Test the fix', correctOrder: 5 },
      ],
    },
    complexity: {
      name: 'Time Complexity (Fastest to Slowest)',
      items: [
        { id: 'i1', text: 'O(1) - Constant time', correctOrder: 1 },
        { id: 'i2', text: 'O(log n) - Logarithmic', correctOrder: 2 },
        { id: 'i3', text: 'O(n) - Linear', correctOrder: 3 },
        { id: 'i4', text: 'O(n log n) - Linearithmic', correctOrder: 4 },
        { id: 'i5', text: 'O(n²) - Quadratic', correctOrder: 5 },
        { id: 'i6', text: 'O(2ⁿ) - Exponential', correctOrder: 6 },
      ],
    },
  };

  const applyQuickSetup = (templateKey) => {
    const template = quickSetupTemplates[templateKey];
    setItems(template.items);
    updateContent(template.items);
    setShowQuickSetup(false);
    alert(`✅ Applied "${template.name}" template! Edit the items to customize.`);
  };

  const updateInstruction = (value) => {
    setData('content', {
      ...data.content,
      items: items,
      instruction: value,
    });
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-indigo-600 rounded-xl">
          <ArrowUpDown className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-indigo-900">Sorting Exercise Configuration</h3>
          <p className="text-sm text-indigo-700">Create a sequence for students to arrange in correct order</p>
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
            Start with pre-made sorting sequences
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => applyQuickSetup('pythonSteps')}
              className="p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 mb-1">🐍 Python Execution</div>
              <div className="text-xs text-gray-600">Steps to run Python code</div>
            </button>
            <button
              type="button"
              onClick={() => applyQuickSetup('loopExecution')}
              className="p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 mb-1">🔄 Loop Execution</div>
              <div className="text-xs text-gray-600">How loops work step by step</div>
            </button>
            <button
              type="button"
              onClick={() => applyQuickSetup('debugging')}
              className="p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 mb-1">🐛 Debugging Process</div>
              <div className="text-xs text-gray-600">Steps to fix code errors</div>
            </button>
            <button
              type="button"
              onClick={() => applyQuickSetup('complexity')}
              className="p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 mb-1">⚡ Time Complexity</div>
              <div className="text-xs text-gray-600">Sort from fastest to slowest</div>
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-cyan-50 to-indigo-50 border-2 border-cyan-300 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-cyan-500 rounded-lg">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-cyan-900 mb-2">📚 How to Create Sorting Exercise</h4>
            <ol className="text-sm text-cyan-800 space-y-2 ml-4 list-decimal">
              <li><strong>Step 1:</strong> Add items in the CORRECT order (1, 2, 3...)</li>
              <li><strong>Step 2:</strong> Items will be shuffled randomly for students</li>
              <li><strong>Step 3:</strong> Students drag items to arrange them correctly</li>
              <li><strong>Step 4:</strong> Use ↑↓ arrows to adjust order if needed</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Instruction Text */}
      <div className="bg-white rounded-lg p-5 border-2 border-indigo-200">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          📝 Instructions for Students
        </label>
        <input
          type="text"
          value={data.content?.instruction || 'Arrange the items in the correct order'}
          onChange={(e) => updateInstruction(e.target.value)}
          className="w-full px-4 py-2 border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:outline-none"
          placeholder="e.g., Sort these steps in the correct execution order"
        />
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
          <div className="font-semibold text-sm text-green-900 mb-2">📝 Format (one item per line, in correct order):</div>
          <pre className="font-mono text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded border border-gray-300">
{`Write the code
Save the file
Open terminal
Run the program
Check the output`}</pre>
          <p className="text-xs text-green-700 mt-2">
            💡 <strong>Important:</strong> Enter items in the CORRECT order (top to bottom = 1st to last)
          </p>
        </div>

        <textarea
          value={bulkImportText}
          onChange={(e) => setBulkImportText(e.target.value)}
          className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none font-mono text-sm"
          rows="8"
          placeholder="Write the code&#10;Save the file&#10;Open terminal&#10;Run python filename.py&#10;Check output"
        />
        
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-green-700">
            📊 Lines: <strong>{bulkImportText.trim().split('\n').filter(l => l.trim()).length}</strong> 
            ({bulkImportText.trim().split('\n').filter(l => l.trim()).length} items will be created)
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

      {/* Manual Entry */}
      <div className="bg-white rounded-lg p-5 border-2 border-indigo-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-indigo-600" />
            <h4 className="font-bold text-gray-900">Items (in Correct Order)</h4>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4 bg-indigo-50 p-3 rounded border border-indigo-200">
          💡 <strong>Add items in the order you want students to achieve.</strong> They will see them shuffled.
        </p>

        {items.length === 0 && (
          <div className="text-center py-8 bg-indigo-50 rounded-lg border-2 border-dashed border-indigo-300">
            <ArrowUpDown className="h-12 w-12 text-indigo-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2 font-semibold">No items yet</p>
            <p className="text-sm text-gray-500 mb-3">Add items for students to sort</p>
            <button
              type="button"
              onClick={addItem}
              className="text-indigo-600 font-semibold hover:text-indigo-800"
            >
              Create your first item
            </button>
          </div>
        )}

        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.id} className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border-2 border-indigo-200">
              <div className="flex items-center gap-3">
                {/* Order Number */}
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>

                {/* Drag Handle */}
                <div className="flex-shrink-0">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                </div>

                {/* Item Text */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateItem(index, 'text', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:outline-none font-medium"
                    placeholder={`Item ${index + 1} (e.g., "Write the code")`}
                  />
                </div>

                {/* Move Buttons */}
                <div className="flex-shrink-0 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className={`p-1 rounded transition-colors ${
                      index === 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-indigo-600 hover:bg-indigo-100'
                    }`}
                    title="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === items.length - 1}
                    className={`p-1 rounded transition-colors ${
                      index === items.length - 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-indigo-600 hover:bg-indigo-100'
                    }`}
                    title="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="flex-shrink-0 text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                  title="Delete this item"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-5">
        <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
          <span>🎮</span>
          <span>Game Preview</span>
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/70 rounded-lg p-4 border-2 border-purple-200">
            <div className="font-semibold text-sm text-purple-900 mb-2">📊 Statistics</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Total Items:</span>
                <span className="font-bold text-indigo-600">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Correct Order:</span>
                <span className="font-bold text-green-600">1 → {items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Display:</span>
                <span className="font-bold text-purple-600">Shuffled</span>
              </div>
            </div>
          </div>
          <div className="bg-white/70 rounded-lg p-4 border-2 border-purple-200">
            <div className="font-semibold text-sm text-purple-900 mb-2">🎯 How Students Play</div>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• Items appear in random order</li>
              <li>• Drag items up/down to reorder</li>
              <li>• Must match your correct sequence</li>
              <li>• Get instant feedback on submission</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}