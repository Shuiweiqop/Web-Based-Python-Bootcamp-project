// resources/js/Pages/Admin/Exercises/components/FillBlankConfig.jsx
import React, { useState } from 'react';
import { Plus, Trash2, FileText, Lightbulb, Zap, CheckCircle } from 'lucide-react';

export default function FillBlankConfig({ data, setData, errors }) {
  const [sentences, setSentences] = useState(data.content?.sentences || []);
  const [showQuickSetup, setShowQuickSetup] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');

  const updateContent = (newSentences) => {
    setData('content', {
      ...data.content,
      sentences: newSentences,
    });
  };

  const addSentence = () => {
    const newSentences = [...sentences, {
      id: `sentence-${Date.now()}`,
      text: '',
      blanks: [],
      caseSensitive: false,
    }];
    setSentences(newSentences);
    updateContent(newSentences);
  };

  const removeSentence = (index) => {
    const newSentences = sentences.filter((_, i) => i !== index);
    setSentences(newSentences);
    updateContent(newSentences);
  };

  const updateSentence = (index, field, value) => {
    const newSentences = [...sentences];
    newSentences[index][field] = value;
    setSentences(newSentences);
    updateContent(newSentences);
  };

  // 自动检测空格（用 ___ 表示）
  const detectBlanks = (index) => {
    const sentence = sentences[index];
    const blankPattern = /___+/g;
    const matches = [...sentence.text.matchAll(blankPattern)];
    
    const blanks = matches.map((match, i) => ({
      id: `blank-${i}`,
      position: i,
      correctAnswer: '',
      alternativeAnswers: [],
    }));

    updateSentence(index, 'blanks', blanks);
    
    if (blanks.length > 0) {
      alert(`✅ Found ${blanks.length} blank(s)! Now fill in the correct answers below.`);
    } else {
      alert('❌ No blanks found. Use "___" (3 underscores) to mark blanks.');
    }
  };

  const updateBlank = (sentenceIndex, blankIndex, field, value) => {
    const newSentences = [...sentences];
    newSentences[sentenceIndex].blanks[blankIndex][field] = value;
    setSentences(newSentences);
    updateContent(newSentences);
  };

  const addAlternativeAnswer = (sentenceIndex, blankIndex) => {
    const newSentences = [...sentences];
    newSentences[sentenceIndex].blanks[blankIndex].alternativeAnswers.push('');
    setSentences(newSentences);
    updateContent(newSentences);
  };

  const removeAlternativeAnswer = (sentenceIndex, blankIndex, altIndex) => {
    const newSentences = [...sentences];
    newSentences[sentenceIndex].blanks[blankIndex].alternativeAnswers = 
      newSentences[sentenceIndex].blanks[blankIndex].alternativeAnswers.filter((_, i) => i !== altIndex);
    setSentences(newSentences);
    updateContent(newSentences);
  };

  const updateAlternativeAnswer = (sentenceIndex, blankIndex, altIndex, value) => {
    const newSentences = [...sentences];
    newSentences[sentenceIndex].blanks[blankIndex].alternativeAnswers[altIndex] = value;
    setSentences(newSentences);
    updateContent(newSentences);
  };

  // 批量导入
  const handleBulkImport = () => {
    try {
      const lines = bulkImportText.trim().split('\n').filter(line => line.trim() !== '');
      const newSentences = [];
      
      for (let i = 0; i < lines.length; i += 2) {
        if (i + 1 < lines.length) {
          const text = lines[i];
          const answers = lines[i + 1].split('|').map(a => a.trim());
          
          // 计算有多少个空格
          const blankCount = (text.match(/___+/g) || []).length;
          
          if (blankCount !== answers.length) {
            alert(`⚠️ Line ${i + 1}: Found ${blankCount} blank(s) but ${answers.length} answer(s). They must match!`);
            return;
          }
          
          const blanks = answers.map((answer, idx) => ({
            id: `blank-${idx}`,
            position: idx,
            correctAnswer: answer,
            alternativeAnswers: [],
          }));
          
          newSentences.push({
            id: `sentence-${Date.now()}-${i}`,
            text: text,
            blanks: blanks,
            caseSensitive: false,
          });
        }
      }
      
      if (newSentences.length > 0) {
        setSentences([...sentences, ...newSentences]);
        updateContent([...sentences, ...newSentences]);
        setBulkImportText('');
        alert(`✅ Successfully imported ${newSentences.length} sentence(s)!`);
      } else {
        alert('❌ No valid sentences found. Check the format.');
      }
    } catch (error) {
      alert('❌ Error parsing sentences. Please check the format.');
    }
  };

  // Quick Templates
  const quickSetupTemplates = {
    pythonSyntax: {
      name: 'Python Syntax',
      sentences: [
        {
          id: 'sent-1',
          text: 'To define a function in Python, use the ___ keyword.',
          blanks: [{ id: 'b1', position: 0, correctAnswer: 'def', alternativeAnswers: [] }],
          caseSensitive: false,
        },
        {
          id: 'sent-2',
          text: 'A ___ loop is used to iterate over a sequence.',
          blanks: [{ id: 'b1', position: 0, correctAnswer: 'for', alternativeAnswers: ['while'] }],
          caseSensitive: false,
        },
        {
          id: 'sent-3',
          text: 'Use ___ to print output in Python.',
          blanks: [{ id: 'b1', position: 0, correctAnswer: 'print', alternativeAnswers: [] }],
          caseSensitive: false,
        },
      ],
    },
    dataTypes: {
      name: 'Data Types',
      sentences: [
        {
          id: 'sent-1',
          text: 'The ___ data type stores whole numbers.',
          blanks: [{ id: 'b1', position: 0, correctAnswer: 'int', alternativeAnswers: ['integer'] }],
          caseSensitive: false,
        },
        {
          id: 'sent-2',
          text: '___ is used to store text in Python.',
          blanks: [{ id: 'b1', position: 0, correctAnswer: 'str', alternativeAnswers: ['string'] }],
          caseSensitive: false,
        },
        {
          id: 'sent-3',
          text: 'A ___ stores multiple items in a single variable.',
          blanks: [{ id: 'b1', position: 0, correctAnswer: 'list', alternativeAnswers: [] }],
          caseSensitive: false,
        },
      ],
    },
    variables: {
      name: 'Variables',
      sentences: [
        {
          id: 'sent-1',
          text: 'To assign a value to a variable, use the ___ operator.',
          blanks: [{ id: 'b1', position: 0, correctAnswer: '=', alternativeAnswers: [] }],
          caseSensitive: false,
        },
        {
          id: 'sent-2',
          text: 'Variable names cannot start with a ___.',
          blanks: [{ id: 'b1', position: 0, correctAnswer: 'number', alternativeAnswers: ['digit'] }],
          caseSensitive: false,
        },
        {
          id: 'sent-3',
          text: 'Use ___ to check if two values are equal.',
          blanks: [{ id: 'b1', position: 0, correctAnswer: '==', alternativeAnswers: [] }],
          caseSensitive: false,
        },
      ],
    },
  };

  const applyQuickSetup = (templateKey) => {
    const template = quickSetupTemplates[templateKey];
    setSentences(template.sentences);
    updateContent(template.sentences);
    setShowQuickSetup(false);
    alert(`✅ Applied "${template.name}" template! Edit the sentences to customize.`);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-gray-600 rounded-xl">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">Fill in the Blank Configuration</h3>
          <p className="text-sm text-gray-700">Create sentences with missing words for students to complete</p>
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
            Start with pre-made fill-in-the-blank exercises
          </p>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => applyQuickSetup('pythonSyntax')}
              className="p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 mb-1">🐍 Python Syntax</div>
              <div className="text-xs text-gray-600">def, for, print keywords</div>
            </button>
            <button
              type="button"
              onClick={() => applyQuickSetup('dataTypes')}
              className="p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 mb-1">📊 Data Types</div>
              <div className="text-xs text-gray-600">int, str, list types</div>
            </button>
            <button
              type="button"
              onClick={() => applyQuickSetup('variables')}
              className="p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 mb-1">📦 Variables</div>
              <div className="text-xs text-gray-600">Assignment and naming</div>
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-300 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-cyan-500 rounded-lg">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-cyan-900 mb-2">📚 How to Create Fill-in-the-Blank Exercise</h4>
            <ol className="text-sm text-cyan-800 space-y-2 ml-4 list-decimal">
              <li><strong>Step 1:</strong> Write a sentence and use <code className="bg-white px-1 rounded">___</code> (3 underscores) for blanks</li>
              <li><strong>Step 2:</strong> Click "Detect Blanks" to find all blanks automatically</li>
              <li><strong>Step 3:</strong> Fill in the correct answer(s) for each blank</li>
              <li><strong>Step 4:</strong> Add alternative answers if multiple answers are correct</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Bulk Import Option */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border-2 border-green-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-600" />
            <h4 className="font-bold text-green-900">⚡ Bulk Import (Fast Method)</h4>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 mb-3 border-2 border-green-200">
          <div className="font-semibold text-sm text-green-900 mb-2">📝 Format (2 lines per sentence):</div>
          <pre className="font-mono text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded border border-gray-300">
{`Python uses the ___ keyword to define functions.
def

A ___ loop repeats code multiple times.
for|while

Use ___ to display output.
print`}</pre>
          <p className="text-xs text-green-700 mt-2">
            💡 Line 1: Sentence with ___  |  Line 2: Answer(s) separated by |
          </p>
        </div>

        <textarea
          value={bulkImportText}
          onChange={(e) => setBulkImportText(e.target.value)}
          className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none font-mono text-sm"
          rows="6"
          placeholder="Python uses the ___ keyword.&#10;def&#10;&#10;A ___ stores text.&#10;string|str"
        />
        
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-green-700">
            📊 Lines: <strong>{bulkImportText.trim().split('\n').filter(l => l.trim()).length}</strong> 
            ({Math.floor(bulkImportText.trim().split('\n').filter(l => l.trim()).length / 2)} sentences will be created)
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

      {/* Manual Entry Section */}
      <div className="bg-white rounded-lg p-5 border-2 border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <h4 className="font-bold text-gray-900">Sentences</h4>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-bold rounded-full">
              {sentences.length} sentence{sentences.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={addSentence}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Sentence
          </button>
        </div>

        {sentences.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2 font-semibold">No sentences yet</p>
            <p className="text-sm text-gray-500 mb-3">Add sentences with blanks for students to fill</p>
            <button
              type="button"
              onClick={addSentence}
              className="text-gray-600 font-semibold hover:text-gray-800"
            >
              Create your first sentence
            </button>
          </div>
        )}

        <div className="space-y-4">
          {sentences.map((sentence, sentenceIndex) => (
            <div key={sentence.id} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-5 border-2 border-blue-200">
              <div className="flex justify-between items-start mb-3">
                <h5 className="font-semibold text-gray-900">Sentence {sentenceIndex + 1}</h5>
                <button
                  type="button"
                  onClick={() => removeSentence(sentenceIndex)}
                  className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Sentence Text */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sentence (use <code className="bg-white px-1 rounded">___</code> for blanks)
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={sentence.text}
                    onChange={(e) => updateSentence(sentenceIndex, 'text', e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    rows="2"
                    placeholder="Example: Python uses the ___ keyword to define functions."
                  />
                  <button
                    type="button"
                    onClick={() => detectBlanks(sentenceIndex)}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 whitespace-nowrap"
                  >
                    <Zap className="h-4 w-4 inline mr-1" />
                    Detect Blanks
                  </button>
                </div>
              </div>

              {/* Case Sensitive Option */}
              <div className="mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sentence.caseSensitive || false}
                    onChange={(e) => updateSentence(sentenceIndex, 'caseSensitive', e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Case Sensitive (e.g., "Print" ≠ "print")</span>
                </label>
              </div>

              {/* Blanks */}
              {sentence.blanks && sentence.blanks.length > 0 && (
                <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <h6 className="font-semibold text-gray-900">
                      Blank Answers ({sentence.blanks.length} blank{sentence.blanks.length !== 1 ? 's' : ''})
                    </h6>
                  </div>

                  <div className="space-y-3">
                    {sentence.blanks.map((blank, blankIndex) => (
                      <div key={blank.id} className="bg-gray-50 rounded p-3 border border-gray-300">
                        <div className="font-semibold text-xs text-gray-600 mb-2">Blank #{blankIndex + 1}</div>
                        
                        {/* Correct Answer */}
                        <div className="mb-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Correct Answer <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={blank.correctAnswer}
                            onChange={(e) => updateBlank(sentenceIndex, blankIndex, 'correctAnswer', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-green-300 rounded focus:border-green-500 focus:outline-none font-mono"
                            placeholder="e.g., def"
                          />
                        </div>

                        {/* Alternative Answers */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-medium text-gray-700">
                              Alternative Answers (optional)
                            </label>
                            <button
                              type="button"
                              onClick={() => addAlternativeAnswer(sentenceIndex, blankIndex)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              + Add Alternative
                            </button>
                          </div>
                          
                          {blank.alternativeAnswers && blank.alternativeAnswers.length > 0 && (
                            <div className="space-y-1">
                              {blank.alternativeAnswers.map((alt, altIndex) => (
                                <div key={altIndex} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={alt}
                                    onChange={(e) => updateAlternativeAnswer(sentenceIndex, blankIndex, altIndex, e.target.value)}
                                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm font-mono"
                                    placeholder="e.g., define, function"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeAlternativeAnswer(sentenceIndex, blankIndex, altIndex)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sentence.blanks && sentence.blanks.length === 0 && (
                <div className="bg-amber-50 border border-amber-300 rounded p-3 text-sm text-amber-800">
                  ⚠️ No blanks detected yet. Click "Detect Blanks" after writing your sentence.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-lg p-5">
        <h4 className="font-bold text-indigo-900 mb-3">📊 Exercise Statistics</h4>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/70 rounded-lg p-3 border-2 border-indigo-200">
            <div className="text-xs text-gray-600 mb-1">Total Sentences</div>
            <div className="text-lg font-bold text-indigo-600">{sentences.length}</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 border-2 border-indigo-200">
            <div className="text-xs text-gray-600 mb-1">Total Blanks</div>
            <div className="text-lg font-bold text-blue-600">
              {sentences.reduce((sum, s) => sum + (s.blanks?.length || 0), 0)}
            </div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 border-2 border-indigo-200">
            <div className="text-xs text-gray-600 mb-1">With Alternatives</div>
            <div className="text-lg font-bold text-green-600">
              {sentences.reduce((sum, s) => 
                sum + (s.blanks?.filter(b => b.alternativeAnswers?.length > 0).length || 0), 0
              )}
            </div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 border-2 border-indigo-200">
            <div className="text-xs text-gray-600 mb-1">Case Sensitive</div>
            <div className="text-lg font-bold text-purple-600">
              {sentences.filter(s => s.caseSensitive).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}