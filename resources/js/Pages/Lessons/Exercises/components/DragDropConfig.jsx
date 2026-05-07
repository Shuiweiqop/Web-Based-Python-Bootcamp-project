// resources/js/Pages/Admin/Exercises/components/DragDropConfig.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Target, Grip, ArrowRight, Lightbulb, X, BarChart3, Play } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function DragDropConfig({ data, setData, errors }) {
  const [items, setItems] = useState(data.content?.items || []);
  const [dropZones, setDropZones] = useState(data.content?.drop_zones || []);
  const [showQuickSetup, setShowQuickSetup] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // 监听主题变化
  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    updateTheme();
    window.addEventListener('theme-changed', updateTheme);
    return () => window.removeEventListener('theme-changed', updateTheme);
  }, []);

  const updateContent = (newItems, newDropZones, instructions = data.content?.instructions) => {
    setData('content', {
      ...data.content,
      instructions,
      items: newItems,
      drop_zones: newDropZones,
    });
  };

  const addItem = () => {
    const newItems = [...items, {
      id: `item-${Date.now()}`,
      text: '',
      correct_zone: dropZones[0]?.id || '',
    }];
    setItems(newItems);
    updateContent(newItems, dropZones);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    updateContent(newItems, dropZones);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
    updateContent(newItems, dropZones);
  };

  const addZone = () => {
    const newZones = [...dropZones, {
      id: `zone-${Date.now()}`,
      name: '',
      description: '',
      max_items: null,
    }];
    setDropZones(newZones);
    updateContent(items, newZones);
  };

  const removeZone = (index) => {
    if (dropZones.length <= 1) {
      alert('⚠️ You must have at least one drop zone!');
      return;
    }
    const zoneId = dropZones[index].id;
    const hasItems = items.some(item => item.correct_zone === zoneId);
    
    if (hasItems) {
      const confirm = window.confirm('⚠️ Some items belong to this zone. Delete anyway?');
      if (!confirm) return;
    }

    const newZones = dropZones.filter((_, i) => i !== index);
    setDropZones(newZones);
    updateContent(items, newZones);
  };

  const updateZone = (index, field, value) => {
    const newZones = [...dropZones];
    newZones[index][field] = value;
    setDropZones(newZones);
    updateContent(items, newZones);
  };

  const quickSetupTemplates = {
    bugClinic: {
      name: 'Bug Clinic',
      instructions: 'A junior developer mixed symptoms, causes, and fixes. Sort each card into the right debugging board.',
      drop_zones: [
        { id: 'zone-symptom', name: 'Symptom', description: 'What the user or program is showing', max_items: 3, color: '#2563eb' },
        { id: 'zone-cause', name: 'Likely Cause', description: 'The bug hiding behind the symptom', max_items: 3, color: '#f97316' },
        { id: 'zone-fix', name: 'Best Fix', description: 'The action that solves the issue cleanly', max_items: 3, color: '#16a34a' },
      ],
      items: [
        { id: 'item-1', text: 'NameError: name score is not defined', correct_zone: 'zone-symptom', description: 'The error message shown in terminal' },
        { id: 'item-2', text: 'The variable was never created before use', correct_zone: 'zone-cause', description: 'Root cause behind the NameError' },
        { id: 'item-3', text: 'Assign score = 0 before the loop starts', correct_zone: 'zone-fix', description: 'A safe initialization fix' },
        { id: 'item-4', text: 'Program repeats forever', correct_zone: 'zone-symptom', description: 'The app never reaches the next line' },
        { id: 'item-5', text: 'Loop condition never becomes False', correct_zone: 'zone-cause', description: 'Common infinite loop cause' },
        { id: 'item-6', text: 'Update the counter inside the loop', correct_zone: 'zone-fix', description: 'Makes progress toward stopping' },
        { id: 'item-7', text: 'Output says 01234 instead of 12345', correct_zone: 'zone-symptom', description: 'The result is close but shifted' },
        { id: 'item-8', text: 'range(5) starts at 0 and stops before 5', correct_zone: 'zone-cause', description: 'Python range boundary behavior' },
        { id: 'item-9', text: 'Use range(1, 6)', correct_zone: 'zone-fix', description: 'Includes 1 through 5' },
      ],
    },
    dataDetective: {
      name: 'Data Detective',
      instructions: 'Classify each clue by the data type a Python program should use.',
      drop_zones: [
        { id: 'zone-number', name: 'Number', description: 'Use for counting, scoring, and calculations', max_items: null, color: '#7c3aed' },
        { id: 'zone-string', name: 'String', description: 'Use for names, labels, and messages', max_items: null, color: '#db2777' },
        { id: 'zone-list', name: 'List', description: 'Use for ordered groups of values', max_items: null, color: '#0891b2' },
        { id: 'zone-boolean', name: 'Boolean', description: 'Use for yes/no decisions', max_items: null, color: '#65a30d' },
      ],
      items: [
        { id: 'item-1', text: 'player_score = 1250', correct_zone: 'zone-number', description: 'A value used in math' },
        { id: 'item-2', text: 'username = "Maya"', correct_zone: 'zone-string', description: 'Text shown to people' },
        { id: 'item-3', text: 'inventory = ["key", "map", "coin"]', correct_zone: 'zone-list', description: 'Multiple ordered items' },
        { id: 'item-4', text: 'is_logged_in = True', correct_zone: 'zone-boolean', description: 'A yes/no state' },
        { id: 'item-5', text: 'temperature = 36.8', correct_zone: 'zone-number', description: 'A decimal measurement' },
        { id: 'item-6', text: 'error_message = "Try again"', correct_zone: 'zone-string', description: 'A message for the user' },
        { id: 'item-7', text: 'quiz_answers = ["A", "C", "B"]', correct_zone: 'zone-list', description: 'A sequence of answers' },
        { id: 'item-8', text: 'has_finished = False', correct_zone: 'zone-boolean', description: 'Tracks completion' },
      ],
    },
    controlRoom: {
      name: 'Control Room',
      instructions: 'A robot only follows commands if the operator is used correctly. Sort the operators by job.',
      drop_zones: [
        { id: 'zone-math', name: 'Math', description: 'Changes numeric values', max_items: null, color: '#ea580c' },
        { id: 'zone-compare', name: 'Compare', description: 'Checks relationships between values', max_items: null, color: '#2563eb' },
        { id: 'zone-logic', name: 'Logic', description: 'Combines True/False conditions', max_items: null, color: '#16a34a' },
      ],
      items: [
        { id: 'item-1', text: 'energy + 10', correct_zone: 'zone-math', description: 'Increase the robot energy' },
        { id: 'item-2', text: 'battery <= 20', correct_zone: 'zone-compare', description: 'Check whether battery is low' },
        { id: 'item-3', text: 'door_open and has_key', correct_zone: 'zone-logic', description: 'Both conditions must be true' },
        { id: 'item-4', text: 'speed * 2', correct_zone: 'zone-math', description: 'Double the speed' },
        { id: 'item-5', text: 'password == saved_password', correct_zone: 'zone-compare', description: 'Check for equality' },
        { id: 'item-6', text: 'is_admin or is_teacher', correct_zone: 'zone-logic', description: 'Either role can pass' },
        { id: 'item-7', text: 'coins % 2', correct_zone: 'zone-math', description: 'Find the remainder' },
        { id: 'item-8', text: 'lives != 0', correct_zone: 'zone-compare', description: 'Check whether player is still alive' },
      ],
    },
  };

  const applyQuickSetup = (templateKey) => {
    const template = quickSetupTemplates[templateKey];
    setDropZones(template.drop_zones);
    setItems(template.items);
    updateContent(template.items, template.drop_zones, template.instructions);
    setShowQuickSetup(false);
    alert(`✅ Applied "${template.name}" template! Edit the items to customize.`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className={cn(
        "rounded-2xl border-2 p-6 card-hover-effect",
        isDark 
          ? "glassmorphism-enhanced border-blue-500/30" 
          : "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-lg"
      )}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/30 animate-glowPulse">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className={cn(
              "text-xl font-bold",
              isDark ? "text-white" : "text-blue-900"
            )}>
              Drag & Drop Matching Game
            </h3>
            <p className={cn(
              "text-sm",
              isDark ? "text-gray-300" : "text-blue-700"
            )}>
              Students drag items into the correct zones
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowQuickSetup(!showQuickSetup)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 font-semibold rounded-xl transition-all ripple-effect hover-lift shadow-md",
              isDark
                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            )}
          >
            <Lightbulb className="h-4 w-4" />
            Quick Setup
          </button>
        </div>
      </div>

      {/* Quick Setup Templates */}
      {showQuickSetup && (
        <div className={cn(
          "rounded-2xl border-2 p-6 animate-slideDown",
          isDark
            ? "glassmorphism-enhanced border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10"
            : "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 shadow-lg"
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className={cn(
                "h-5 w-5",
                isDark ? "text-purple-400" : "text-purple-600"
              )} />
              <h4 className={cn(
                "font-bold",
                isDark ? "text-white" : "text-purple-900"
              )}>
                Quick Setup Templates
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowQuickSetup(false)}
              className={cn(
                "flex items-center gap-1 px-3 py-1 font-semibold text-sm rounded-lg transition-all ripple-effect",
                isDark
                  ? "text-purple-400 hover:text-purple-300 hover:bg-white/10"
                  : "text-purple-600 hover:text-purple-800 hover:bg-purple-100"
              )}
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>
          <p className={cn(
            "text-sm mb-4",
            isDark ? "text-gray-300" : "text-purple-700"
          )}>
            Start with a pre-made template and customize it for your lesson
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(quickSetupTemplates).map(([key, template]) => (
              <button
                key={key}
                type="button"
                onClick={() => applyQuickSetup(key)}
                className={cn(
                  "p-4 border-2 rounded-xl transition-all text-left card-hover-effect ripple-effect",
                  isDark
                    ? "bg-white/5 border-purple-500/30 hover:border-purple-500/60 hover:bg-white/10"
                    : "bg-white border-purple-300 hover:border-purple-500 hover:bg-purple-50 shadow-md"
                )}
              >
                <div className={cn(
                  "font-semibold mb-1",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  {template.name}
                </div>
                <div className={cn(
                  "text-xs",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}>
                  {template.drop_zones.map(z => z.name).join(', ')}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instructions Card */}
      <div className={cn(
        "rounded-2xl border-2 p-6 animate-fadeIn animation-delay-200",
        isDark
          ? "glassmorphism-enhanced border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10"
          : "bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-300 shadow-lg"
      )}>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg shadow-md">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className={cn(
              "font-bold mb-2",
              isDark ? "text-cyan-300" : "text-cyan-900"
            )}>
              📚 How to Create a Drag & Drop Exercise
            </h4>
            <ol className={cn(
              "text-sm space-y-2 ml-4 list-decimal",
              isDark ? "text-gray-300" : "text-cyan-800"
            )}>
              <li><strong>Step 1:</strong> Create "Drop Zones" (categories like "Variables", "Functions")</li>
              <li><strong>Step 2:</strong> Add "Items" that students will drag (like "x = 10", "def hello():")</li>
              <li><strong>Step 3:</strong> For each item, select which zone is the correct answer</li>
              <li><strong>Step 4:</strong> Students will drag items from the left into matching zones on the right</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Drop Zones Section */}
      <div className={cn(
        "rounded-2xl border-2 p-6 card-hover-effect animate-fadeIn animation-delay-400",
        isDark
          ? "glassmorphism-enhanced border-blue-500/30"
          : "bg-white border-blue-200 shadow-lg"
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
              1
            </div>
            <h4 className={cn(
              "font-bold",
              isDark ? "text-white" : "text-gray-900"
            )}>
              Drop Zones (Categories)
            </h4>
            <span className={cn(
              "px-2 py-1 text-xs font-bold rounded-full",
              isDark
                ? "bg-blue-500/20 text-blue-300"
                : "bg-blue-100 text-blue-800"
            )}>
              {dropZones.length} zones
            </span>
          </div>
          <button
            type="button"
            onClick={addZone}
            className={cn(
              "flex items-center gap-2 px-4 py-2 font-semibold rounded-xl transition-all ripple-effect hover-lift shadow-md",
              isDark
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
            )}
          >
            <Plus className="h-4 w-4" />
            Add Zone
          </button>
        </div>

        <div className={cn(
          "text-sm mb-4 p-3 rounded-lg border-2",
          isDark
            ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
            : "bg-blue-50 border-blue-200 text-blue-800"
        )}>
          💡 <strong>Example zones:</strong> "Variables", "Functions", "Loops", "Data Types"
        </div>

        <div className="space-y-3">
          {dropZones.length === 0 && (
            <div className={cn(
              "text-center py-8 rounded-xl border-2 border-dashed",
              isDark
                ? "bg-blue-500/5 border-blue-500/30"
                : "bg-blue-50 border-blue-300"
            )}>
              <Target className={cn(
                "h-12 w-12 mx-auto mb-3",
                isDark ? "text-blue-400" : "text-blue-400"
              )} />
              <p className={cn(
                "mb-2 font-semibold",
                isDark ? "text-gray-300" : "text-gray-600"
              )}>
                No drop zones yet
              </p>
              <p className={cn(
                "text-sm mb-3",
                isDark ? "text-gray-400" : "text-gray-500"
              )}>
                Create categories where students will drop items
              </p>
              <button
                type="button"
                onClick={addZone}
                className={cn(
                  "font-semibold transition-colors",
                  isDark
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-800"
                )}
              >
                Create your first drop zone
              </button>
            </div>
          )}

          {dropZones.map((zone, index) => (
            <div 
              key={zone.id} 
              className={cn(
                "p-4 rounded-xl border-2 space-y-3 card-hover-effect",
                isDark
                  ? "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30"
                  : "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200"
              )}
            >
              <div className="flex gap-3 items-start">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-full font-bold text-sm flex-shrink-0 shadow-md">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={zone.name}
                    onChange={(e) => updateZone(index, 'name', e.target.value)}
                    className={cn(
                      "w-full px-4 py-2 border-2 rounded-xl focus:outline-none font-semibold transition-all",
                      isDark
                        ? "bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400 focus:border-cyan-400"
                        : "bg-white border-blue-300 text-gray-900 focus:border-blue-500"
                    )}
                    placeholder={`Zone ${index + 1} name (e.g., "Variables")`}
                  />
                  <input
                    type="text"
                    value={zone.description || ''}
                    onChange={(e) => updateZone(index, 'description', e.target.value)}
                    className={cn(
                      "w-full px-4 py-2 border-2 rounded-xl focus:outline-none text-sm transition-all",
                      isDark
                        ? "bg-white/5 border-blue-500/20 text-gray-300 placeholder:text-gray-500 focus:border-cyan-400"
                        : "bg-white border-blue-200 text-gray-700 focus:border-blue-400"
                    )}
                    placeholder="Optional: Zone description"
                  />
                </div>
                {dropZones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeZone(index)}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 rounded-lg transition-all ripple-effect",
                      "text-red-500 hover:text-red-400",
                      isDark ? "hover:bg-red-500/10" : "hover:bg-red-50"
                    )}
                    title="Delete this zone"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Draggable Items Section */}
      <div className={cn(
        "rounded-2xl border-2 p-6 card-hover-effect animate-fadeIn animation-delay-600",
        isDark
          ? "glassmorphism-enhanced border-green-500/30"
          : "bg-white border-green-200 shadow-lg"
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
              2
            </div>
            <h4 className={cn(
              "font-bold",
              isDark ? "text-white" : "text-gray-900"
            )}>
              Draggable Items
            </h4>
            <span className={cn(
              "px-2 py-1 text-xs font-bold rounded-full",
              isDark
                ? "bg-green-500/20 text-green-300"
                : "bg-green-100 text-green-800"
            )}>
              {items.length} items
            </span>
          </div>
          <button
            type="button"
            onClick={addItem}
            className={cn(
              "flex items-center gap-2 px-4 py-2 font-semibold rounded-xl transition-all ripple-effect hover-lift shadow-md",
              isDark
                ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white",
              dropZones.length === 0 && "opacity-50 cursor-not-allowed"
            )}
            disabled={dropZones.length === 0}
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>

        {dropZones.length === 0 && (
          <div className={cn(
            "border-2 rounded-xl p-4 mb-4",
            isDark
              ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
              : "bg-amber-50 border-amber-300 text-amber-800"
          )}>
            <p className="font-semibold">⚠️ Create at least one Drop Zone first!</p>
          </div>
        )}

        <div className={cn(
          "text-sm mb-4 p-3 rounded-lg border-2",
          isDark
            ? "bg-green-500/10 border-green-500/30 text-green-300"
            : "bg-green-50 border-green-200 text-green-800"
        )}>
          💡 <strong>Example items:</strong> "x = 10", "def greet():", "for i in range(5):"
        </div>

        <div className="space-y-3">
          {items.length === 0 && dropZones.length > 0 && (
            <div className={cn(
              "text-center py-8 rounded-xl border-2 border-dashed",
              isDark
                ? "bg-green-500/5 border-green-500/30"
                : "bg-green-50 border-green-300"
            )}>
              <Grip className={cn(
                "h-12 w-12 mx-auto mb-3",
                isDark ? "text-green-400" : "text-green-400"
              )} />
              <p className={cn(
                "mb-2 font-semibold",
                isDark ? "text-gray-300" : "text-gray-600"
              )}>
                No items yet
              </p>
              <p className={cn(
                "text-sm mb-3",
                isDark ? "text-gray-400" : "text-gray-500"
              )}>
                Add items that students will drag into zones
              </p>
              <button
                type="button"
                onClick={addItem}
                className={cn(
                  "font-semibold transition-colors",
                  isDark
                    ? "text-green-400 hover:text-green-300"
                    : "text-green-600 hover:text-green-800"
                )}
              >
                Add your first item
              </button>
            </div>
          )}

          {items.map((item, index) => (
            <div 
              key={item.id} 
              className={cn(
                "flex gap-3 items-center p-4 rounded-xl border-2 card-hover-effect",
                isDark
                  ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30"
                  : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
              )}
            >
              <Grip className={cn(
                "h-5 w-5",
                isDark ? "text-green-400" : "text-green-600"
              )} />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={cn(
                    "block text-xs font-semibold mb-1",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}>
                    Item Text (what students see)
                  </label>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateItem(index, 'text', e.target.value)}
                    className={cn(
                      "w-full px-3 py-2 border-2 rounded-xl focus:outline-none font-mono text-sm transition-all",
                      isDark
                        ? "bg-white/5 border-green-500/30 text-white placeholder:text-gray-400 focus:border-emerald-400"
                        : "bg-white border-green-300 text-gray-900 focus:border-green-500"
                    )}
                    placeholder={`Item ${index + 1} (e.g., "x = 10")`}
                  />
                </div>
                <div>
                  <label className={cn(
                    "block text-xs font-semibold mb-1 flex items-center gap-1",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}>
                    Correct Zone <ArrowRight className="inline h-3 w-3" />
                  </label>
                  <select
                    value={item.correct_zone}
                    onChange={(e) => updateItem(index, 'correct_zone', e.target.value)}
                    className={cn(
                      "w-full px-3 py-2 border-2 rounded-xl focus:outline-none font-semibold transition-all",
                      isDark
                        ? "bg-white/5 border-green-500/30 text-white focus:border-emerald-400"
                        : "bg-white border-green-300 text-gray-900 focus:border-green-500"
                    )}
                  >
                    <option value="">-- Select correct zone --</option>
                    {dropZones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name || `Zone ${zone.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className={cn(
                  "p-2 rounded-lg transition-all ripple-effect",
                  "text-red-500 hover:text-red-400",
                  isDark ? "hover:bg-red-500/10" : "hover:bg-red-50"
                )}
                title="Delete this item"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Preview/Summary */}
      <div className={cn(
        "rounded-2xl border-2 p-6 animate-fadeIn animation-delay-800",
        isDark
          ? "glassmorphism-enhanced border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"
          : "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 shadow-lg"
      )}>
        <h4 className={cn(
          "font-bold mb-4 flex items-center gap-2",
          isDark ? "text-white" : "text-indigo-900"
        )}>
          <Play className="h-5 w-5" />
          <span>Game Preview</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={cn(
            "rounded-xl p-4 border-2",
            isDark
              ? "bg-white/5 border-indigo-500/30"
              : "bg-white/70 border-indigo-200"
          )}>
            <div className={cn(
              "font-semibold text-sm mb-2 flex items-center gap-1",
              isDark ? "text-indigo-300" : "text-indigo-900"
            )}>
              <BarChart3 className="h-4 w-4" />
              Statistics
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={isDark ? "text-gray-300" : "text-gray-700"}>Drop Zones:</span>
                <span className={cn(
                  "font-bold",
                  isDark ? "text-indigo-400" : "text-indigo-600"
                )}>
                  {dropZones.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? "text-gray-300" : "text-gray-700"}>Items to Match:</span>
                <span className={cn(
                  "font-bold",
                  isDark ? "text-indigo-400" : "text-indigo-600"
                )}>
                  {items.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? "text-gray-300" : "text-gray-700"}>Completion:</span>
                <span className={cn(
                  "font-bold",
                  isDark ? "text-green-400" : "text-green-600"
                )}>
                  {items.filter(i => i.correct_zone).length}/{items.length} configured
                </span>
              </div>
            </div>
          </div>
          <div className={cn(
            "rounded-xl p-4 border-2",
            isDark
              ? "bg-white/5 border-indigo-500/30"
              : "bg-white/70 border-indigo-200"
          )}>
            <div className={cn(
              "font-semibold text-sm mb-2",
              isDark ? "text-indigo-300" : "text-indigo-900"
            )}>
              🎯 How Students Play
            </div>
            <ul className={cn(
              "text-xs space-y-1",
              isDark ? "text-gray-300" : "text-gray-700"
            )}>
              <li>• Items appear on the left side</li>
              <li>• Drag each item to its correct zone</li>
              <li>• Zones change color when correct</li>
              <li>• Score based on correct matches</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        .animation-delay-800 {
          animation-delay: 0.8s;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes glowPulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
        
        .animate-glowPulse {
          animation: glowPulse 2s ease-in-out infinite;
        }
        
        .glassmorphism-enhanced {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        
        .hover-lift {
          transition: transform 0.2s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
        }
        
        .card-hover-effect {
          transition: all 0.3s ease;
        }
        
        .card-hover-effect:hover {
          transform: translateY(-2px);
        }
        
        .ripple-effect {
          position: relative;
          overflow: hidden;
        }
        
        .ripple-effect:active::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0);
          animation: ripple 0.6s ease-out;
        }
        
        @keyframes ripple {
          to {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
