// resources/js/Components/Admin/ExerciseHelperTools.jsx
import React, { useState } from 'react';
import { 
  Eye, 
  AlertTriangle, 
  Copy, 
  FileText, 
  CheckCircle, 
  XCircle,
  Download,
  Upload,
  Sparkles
} from 'lucide-react';

export default function ExerciseHelperTools({ exerciseType, data, onFixIssues }) {
  const [showPreview, setShowPreview] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [validationResults, setValidationResults] = useState(null);

  // 🔍 验证函数 - 根据类型检查不同的问题
  const validateExercise = () => {
    const issues = [];
    const warnings = [];

    switch (exerciseType) {
      case 'drag_drop':
        validateDragDrop(issues, warnings);
        break;
      // ❌ 已删除: case 'matching'
      case 'fill_blank':
        validateFillBlank(issues, warnings);
        break;
      case 'sorting':
        validateSorting(issues, warnings);
        break;
      case 'maze_game':
        validateMazeGame(issues, warnings);
        break;
      case 'adventure_game':
        validateAdventureGame(issues, warnings);
        break;
      case 'coding':
        validateCoding(issues, warnings);
        break;
      case 'simulation':
        validateSimulation(issues, warnings);
        break;
    }

    setValidationResults({ issues, warnings });
    setShowValidation(true);
  };

  // 验证 Drag & Drop
  const validateDragDrop = (issues, warnings) => {
    const content = data.content || {};
    
    const zones = content.drop_zones || content.zones || [];
    const items = content.items || [];

    console.log('🔍 Validating Drag & Drop:', {
      zones: zones.length,
      items: items.length,
      contentKeys: Object.keys(content)
    });

    if (zones.length === 0) {
      issues.push('No drop zones created');
    }
    if (items.length === 0) {
      issues.push('No draggable items created');
    }
    
    if (zones.length > 0 && items.length > 0) {
      items.forEach((item, idx) => {
        if (!item.correct_zone) {
          issues.push(`Item ${idx + 1} "${item.text}" has no correct zone assigned`);
        } else {
          const zoneExists = zones.some(z => z.id === item.correct_zone);
          if (!zoneExists) {
            issues.push(`Item ${idx + 1} references non-existent zone "${item.correct_zone}"`);
          }
        }
        if (!item.text || item.text.trim() === '') {
          warnings.push(`Item ${idx + 1} has no text`);
        }
      });

      zones.forEach((zone, idx) => {
        const zoneName = zone.name || zone.label;
        if (!zoneName || zoneName.trim() === '') {
          warnings.push(`Zone ${idx + 1} has no name`);
        }
      });

      zones.forEach((zone) => {
        const isUsed = items.some(item => item.correct_zone === zone.id);
        const zoneName = zone.name || zone.label || `Zone ${zone.id}`;
        if (!isUsed) {
          warnings.push(`Zone "${zoneName}" has no items assigned to it`);
        }
      });
    }
  };

  // ❌ 已删除: validateMatching 函数

  // 验证 Fill in the Blank
  const validateFillBlank = (issues, warnings) => {
    const content = data.content || {};
    const sentences = content.sentences || [];

    if (sentences.length === 0) {
      issues.push('No sentences created');
    }

    sentences.forEach((sentence, idx) => {
      if (!sentence.text || sentence.text.trim() === '') {
        issues.push(`Sentence ${idx + 1}: Text is empty`);
      } else {
        const blankCount = (sentence.text.match(/___+/g) || []).length;
        const answerCount = sentence.blanks?.length || 0;

        if (blankCount === 0) {
          warnings.push(`Sentence ${idx + 1}: No blanks (___) detected in text`);
        } else if (blankCount !== answerCount) {
          issues.push(`Sentence ${idx + 1}: ${blankCount} blank(s) in text but ${answerCount} answer(s) defined`);
        }
      }

      if (sentence.blanks && sentence.blanks.length > 0) {
        sentence.blanks.forEach((blank, bIdx) => {
          if (!blank.correctAnswer || blank.correctAnswer.trim() === '') {
            issues.push(`Sentence ${idx + 1}, Blank ${bIdx + 1}: No correct answer provided`);
          }
        });
      }
    });
  };

  // 验证 Sorting
  const validateSorting = (issues, warnings) => {
    const content = data.content || {};
    const items = content.items || [];

    if (items.length === 0) {
      issues.push('No items to sort');
    } else if (items.length < 3) {
      warnings.push('Only ' + items.length + ' item(s). Sorting exercises work best with 3+ items');
    }

    items.forEach((item, idx) => {
      if (!item.text || item.text.trim() === '') {
        issues.push(`Item ${idx + 1}: Text is empty`);
      }
    });

    const texts = items.map(i => i.text?.toLowerCase());
    const duplicates = texts.filter((text, idx) => texts.indexOf(text) !== idx);
    if (duplicates.length > 0) {
      warnings.push('Duplicate items detected: ' + [...new Set(duplicates)].join(', '));
    }
  };

  // 验证 Maze Game
  const validateMazeGame = (issues, warnings) => {
    const content = data.content || {};
    const { gridSize, startPosition, endPosition, walls } = content;

    if (!gridSize || !gridSize.rows || !gridSize.cols) {
      issues.push('Grid size not configured');
    } else {
      if (gridSize.rows < 3 || gridSize.cols < 3) {
        warnings.push('Grid is very small. Consider at least 5x5 for better gameplay');
      }

      if (startPosition?.row === endPosition?.row && startPosition?.col === endPosition?.col) {
        issues.push('Start and end positions are the same');
      }

      if (walls && walls.length > 0) {
        const startOnWall = walls.some(w => w.row === startPosition?.row && w.col === startPosition?.col);
        const endOnWall = walls.some(w => w.row === endPosition?.row && w.col === endPosition?.col);

        if (startOnWall) {
          issues.push('Start position is on a wall');
        }
        if (endOnWall) {
          issues.push('End position is on a wall');
        }
      }
    }
  };

  // 验证 Adventure Game
  const validateAdventureGame = (issues, warnings) => {
    const content = data.content || {};
    const scenarios = content.scenarios || [];

    if (scenarios.length === 0) {
      issues.push('No scenarios created');
    }

    scenarios.forEach((scenario, idx) => {
      if (!scenario.title || scenario.title.trim() === '') {
        warnings.push(`Scenario ${idx + 1}: No title`);
      }
      if (!scenario.description || scenario.description.trim() === '') {
        issues.push(`Scenario ${idx + 1}: No description`);
      }
      if (!scenario.choices || scenario.choices.length === 0) {
        issues.push(`Scenario ${idx + 1}: No choices`);
      } else {
        const hasCorrectChoice = scenario.choices.some(c => c.is_correct);
        if (!hasCorrectChoice) {
          warnings.push(`Scenario ${idx + 1}: No choice marked as correct`);
        }

        scenario.choices.forEach((choice, cIdx) => {
          if (!choice.text || choice.text.trim() === '') {
            issues.push(`Scenario ${idx + 1}, Choice ${cIdx + 1}: No text`);
          }
        });
      }
    });
  };

  // 验证 Coding
  const validateCoding = (issues, warnings) => {
    if (data.enable_live_editor) {
      if (!data.starter_code || data.starter_code.trim() === '') {
        warnings.push('No starter code provided');
      }
      if (!data.coding_instructions || data.coding_instructions.trim() === '') {
        warnings.push('No instructions provided for students');
      }
      if (!data.test_cases || data.test_cases.length === 0) {
        issues.push('No test cases created');
      } else {
        data.test_cases.forEach((test, idx) => {
          if (!test.expected || test.expected.trim() === '') {
            issues.push(`Test case ${idx + 1}: No expected output`);
          }
        });
      }
    }
  };

  // 验证 Simulation
  const validateSimulation = (issues, warnings) => {
    const content = data.content || {};
    const { variables, steps } = content;

    if (!variables || variables.length === 0) {
      warnings.push('No variables defined');
    }
    if (!steps || steps.length === 0) {
      issues.push('No execution steps created');
    } else {
      steps.forEach((step, idx) => {
        if (!step.code || step.code.trim() === '') {
          issues.push(`Step ${idx + 1}: No code line`);
        }
        if (!step.explanation || step.explanation.trim() === '') {
          warnings.push(`Step ${idx + 1}: No explanation`);
        }
      });
    }
  };

  // 🎨 渲染预览内容
  const renderPreview = () => {
    const content = data.content || {};

    switch (exerciseType) {
      case 'drag_drop':
        const zones = content.drop_zones || content.zones || [];
        const items = content.items || [];
        
        return (
          <div className="space-y-4">
            <div className="font-semibold text-gray-900 mb-3">Drag & Drop Preview</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-2">Drop Zones:</div>
                <div className="space-y-2">
                  {zones.length > 0 ? (
                    zones.map((zone) => {
                      const zoneName = zone.name || zone.label || 'Unnamed Zone';
                      return (
                        <div key={zone.id} className="p-3 bg-blue-100 border-2 border-blue-300 rounded-lg">
                          <div className="font-mono text-sm font-semibold">{zoneName}</div>
                          {zone.description && (
                            <div className="text-xs text-blue-700 mt-1">{zone.description}</div>
                          )}
                          {zone.max_items && (
                            <div className="text-xs text-blue-600 mt-1">Max items: {zone.max_items}</div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-gray-500 text-sm italic">No zones created</div>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-2">Draggable Items:</div>
                <div className="space-y-2">
                  {items.length > 0 ? (
                    items.map((item) => {
                      const zone = zones.find(z => z.id === item.correct_zone);
                      const zoneName = zone?.name || zone?.label || item.correct_zone || 'No zone';
                      
                      return (
                        <div key={item.id} className="p-3 bg-green-100 border-2 border-green-300 rounded-lg cursor-move">
                          <div className="font-mono text-sm">{item.text || 'Empty'}</div>
                          {item.description && (
                            <div className="text-xs text-green-700 mt-1">{item.description}</div>
                          )}
                          <div className="text-xs text-green-700 mt-1 font-semibold">
                            → {zoneName}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-gray-500 text-sm italic">No items created</div>
                  )}
                </div>
              </div>
            </div>
            
            <details className="mt-4 text-xs bg-gray-100 p-3 rounded">
              <summary className="cursor-pointer font-semibold text-gray-700">🔍 Debug Info</summary>
              <pre className="mt-2 overflow-auto text-xs">
                {JSON.stringify({
                  zones: zones.length,
                  items: items.length,
                  contentKeys: Object.keys(content),
                  hasDropZones: !!content.drop_zones,
                  hasZones: !!content.zones,
                }, null, 2)}
              </pre>
            </details>
          </div>
        );

      // ❌ 已删除: case 'matching' 的预览

      case 'fill_blank':
        return (
          <div className="space-y-4">
            <div className="font-semibold text-gray-900 mb-3">Fill in the Blank Preview</div>
            {content.sentences?.length > 0 ? (
              <div className="space-y-4">
                {content.sentences.map((sentence, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
                    <div className="font-semibold text-sm text-gray-700 mb-2">Sentence {idx + 1}:</div>
                    <div className="mb-3">
                      {sentence.text ? (
                        <div className="font-mono text-sm whitespace-pre-wrap">
                          {sentence.text.split(/(___+)/).map((part, i) => 
                            part.match(/___+/) ? (
                              <input 
                                key={i}
                                type="text"
                                className="inline-block w-32 px-2 py-1 border-b-2 border-blue-500 bg-blue-50 mx-1"
                                placeholder="..."
                                disabled
                              />
                            ) : (
                              <span key={i}>{part}</span>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-500 italic">Empty sentence</div>
                      )}
                    </div>
                    {sentence.blanks?.length > 0 && (
                      <div className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                        Answers: {sentence.blanks.map(b => b.correctAnswer).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No sentences created</div>
            )}
          </div>
        );

      case 'sorting':
        return (
          <div className="space-y-4">
            <div className="font-semibold text-gray-900 mb-3">Sorting Preview (Correct Order)</div>
            {content.items?.length > 0 ? (
              <div className="space-y-2">
                {content.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-indigo-50 border-2 border-indigo-200 rounded-lg">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 font-mono text-sm">{item.text || 'Empty'}</div>
                    <div className="text-gray-400">☰</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No items created</div>
            )}
            <div className="text-xs text-gray-600 bg-amber-50 p-3 rounded border border-amber-200">
              💡 Students will see these shuffled and must arrange them in this order
            </div>
          </div>
        );

      case 'maze_game':
        const { gridSize, startPosition, endPosition, walls, obstacles, collectibles } = content;
        return (
          <div className="space-y-4">
            <div className="font-semibold text-gray-900 mb-3">Maze Game Preview</div>
            {gridSize ? (
              <div className="flex justify-center">
                <div className="inline-block bg-gray-100 p-4 rounded-lg">
                  {Array.from({ length: gridSize.rows || 5 }).map((_, row) => (
                    <div key={row} className="flex">
                      {Array.from({ length: gridSize.cols || 5 }).map((_, col) => {
                        const isStart = startPosition?.row === row && startPosition?.col === col;
                        const isEnd = endPosition?.row === row && endPosition?.col === col;
                        const isWall = walls?.some(w => w.row === row && w.col === col);
                        const isObstacle = obstacles?.some(o => o.row === row && o.col === col);
                        const isCollectible = collectibles?.some(c => c.row === row && c.col === col);
                        
                        let cellClass = 'w-10 h-10 border border-gray-300 flex items-center justify-center text-lg';
                        if (isStart) cellClass += ' bg-green-500 text-white';
                        else if (isEnd) cellClass += ' bg-blue-500 text-white';
                        else if (isWall) cellClass += ' bg-gray-800';
                        else if (isObstacle) cellClass += ' bg-red-500';
                        else if (isCollectible) cellClass += ' bg-yellow-400';
                        else cellClass += ' bg-white';

                        return (
                          <div key={col} className={cellClass}>
                            {isStart && '🚀'}
                            {isEnd && '🏁'}
                            {isObstacle && '⚠️'}
                            {isCollectible && '💰'}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No maze configured</div>
            )}
          </div>
        );

      case 'adventure_game':
        return (
          <div className="space-y-4">
            <div className="font-semibold text-gray-900 mb-3">Adventure Game Preview</div>
            {content.scenarios?.length > 0 ? (
              <div className="space-y-4">
                {content.scenarios.map((scenario, idx) => (
                  <div key={idx} className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <div className="font-bold text-gray-900">{scenario.title || 'Untitled'}</div>
                    </div>
                    <div className="text-sm text-gray-700 mb-3 bg-white p-3 rounded">
                      {scenario.description || 'No description'}
                    </div>
                    <div className="space-y-2">
                      {scenario.choices?.map((choice, cIdx) => (
                        <div 
                          key={cIdx} 
                          className={`p-2 rounded border-2 text-sm ${
                            choice.is_correct 
                              ? 'bg-green-100 border-green-400' 
                              : 'bg-white border-gray-300'
                          }`}
                        >
                          {choice.is_correct && '✅ '}
                          {choice.text || 'Empty choice'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No scenarios created</div>
            )}
          </div>
        );

      case 'coding':
        return (
          <div className="space-y-4">
            <div className="font-semibold text-gray-900 mb-3">Coding Exercise Preview</div>
            {data.enable_live_editor ? (
              <div className="space-y-3">
                {data.coding_instructions && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="text-xs font-semibold text-blue-900 mb-1">Instructions:</div>
                    <div className="text-sm text-blue-800">{data.coding_instructions}</div>
                  </div>
                )}
                {data.starter_code && (
                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-1">Starter Code:</div>
                    <pre className="p-3 bg-gray-900 text-green-400 rounded font-mono text-xs overflow-x-auto">
                      {data.starter_code}
                    </pre>
                  </div>
                )}
                {data.test_cases?.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-2">Test Cases:</div>
                    <div className="space-y-2">
                      {data.test_cases.map((test, idx) => (
                        <div key={idx} className="p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                          <div className="font-semibold">Test {idx + 1}: {test.description || 'No description'}</div>
                          {test.input && <div className="text-gray-600">Input: {test.input}</div>}
                          <div className="text-gray-600">Expected: {test.expected}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">Live editor not enabled</div>
            )}
          </div>
        );

      case 'simulation':
        return (
          <div className="space-y-4">
            <div className="font-semibold text-gray-900 mb-3">Simulation Preview</div>
            {content.variables?.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Variables:</div>
                <div className="flex gap-2 flex-wrap">
                  {content.variables.map((v, idx) => (
                    <div key={idx} className="px-3 py-1 bg-blue-100 border border-blue-300 rounded font-mono text-sm">
                      {v.name}: {v.initialValue} ({v.type})
                    </div>
                  ))}
                </div>
              </div>
            )}
            {content.steps?.length > 0 ? (
              <div className="space-y-2">
                {content.steps.map((step, idx) => (
                  <div key={idx} className={`p-3 border-2 rounded-lg ${
                    step.highlight ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-300'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <div className="text-xs text-gray-600">Line {step.lineNumber}</div>
                    </div>
                    <pre className="font-mono text-sm mb-2 bg-gray-900 text-green-400 p-2 rounded">
                      {step.code}
                    </pre>
                    <div className="text-xs text-gray-700">{step.explanation}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No steps created</div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-600 py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p>Preview not available for this exercise type</p>
          </div>
        );
    }
  };

  const exportToJSON = () => {
    const exportData = {
      exercise_type: exerciseType,
      title: data.title,
      description: data.description,
      content: data.content,
      max_score: data.max_score,
      time_limit_sec: data.time_limit_sec,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exercise-${exerciseType}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const exportData = {
      exercise_type: exerciseType,
      content: data.content,
    };
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    alert('✅ Configuration copied to clipboard!');
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-600 rounded-lg">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-purple-900">Admin Helper Tools</h3>
          <p className="text-sm text-purple-700">Validation, preview, and export tools</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={validateExercise}
          className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
        >
          <AlertTriangle className="h-6 w-6 text-orange-600" />
          <span className="text-sm font-semibold text-gray-900">Validate</span>
        </button>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
        >
          <Eye className="h-6 w-6 text-blue-600" />
          <span className="text-sm font-semibold text-gray-900">Preview</span>
        </button>

        <button
          type="button"
          onClick={copyToClipboard}
          className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
        >
          <Copy className="h-6 w-6 text-green-600" />
          <span className="text-sm font-semibold text-gray-900">Copy JSON</span>
        </button>

        <button
          type="button"
          onClick={exportToJSON}
          className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
        >
          <Download className="h-6 w-6 text-indigo-600" />
          <span className="text-sm font-semibold text-gray-900">Export</span>
        </button>
      </div>

      {showValidation && validationResults && (
        <div className="bg-white rounded-lg p-5 border-2 border-purple-300">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Validation Results
            </h4>
            <button
              onClick={() => setShowValidation(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {validationResults.issues.length === 0 && validationResults.warnings.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <div className="font-bold text-green-900">All Good! ✅</div>
                <div className="text-sm text-green-700">No issues or warnings detected</div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {validationResults.issues.length > 0 && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-bold text-red-900">
                      {validationResults.issues.length} Error{validationResults.issues.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <ul className="space-y-1 text-sm text-red-800">
                    {validationResults.issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {validationResults.warnings.length > 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="font-bold text-yellow-900">
                      {validationResults.warnings.length} Warning{validationResults.warnings.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <ul className="space-y-1 text-sm text-yellow-800">
                    {validationResults.warnings.map((warning, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-yellow-600">•</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showPreview && (
        <div className="bg-white rounded-lg p-5 border-2 border-blue-300">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Student View Preview
            </h4>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-300 max-h-96 overflow-y-auto">
            {renderPreview()}
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
            💡 This is a simplified preview. The actual student experience will be fully interactive.
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <span>💡</span>
          <span>Quick Tips</span>
        </div>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click "Validate" before saving to catch common mistakes</li>
          <li>• Use "Copy JSON" to duplicate exercises quickly</li>
          <li>• "Export" creates a backup file you can import later</li>
          <li>• Always test with "Preview" before publishing to students</li>
        </ul>
      </div>
    </div>
  );
}