import React, { useState } from 'react';
import { Brain, Lightbulb, Plus, Trash2, Wand2 } from 'lucide-react';

const createPair = (index = 0) => ({
  id: `pair-${Date.now()}-${index}`,
  prompt: '',
  answer: '',
});

const templates = {
  pythonBasics: {
    instructions: 'Match each Python concept with its meaning.',
    pairs: [
      { id: 'pair-variable', prompt: 'Variable', answer: 'A named value stored in memory' },
      { id: 'pair-list', prompt: 'List', answer: 'An ordered collection that can be changed' },
      { id: 'pair-loop', prompt: 'Loop', answer: 'Repeats a block of code' },
      { id: 'pair-function', prompt: 'Function', answer: 'Reusable block of code' },
      { id: 'pair-boolean', prompt: 'Boolean', answer: 'A True or False value' },
      { id: 'pair-string', prompt: 'String', answer: 'Text data wrapped in quotes' },
    ],
  },
  dataTypes: {
    instructions: 'Match each value with its Python data type.',
    pairs: [
      { id: 'pair-int', prompt: '42', answer: 'int' },
      { id: 'pair-float', prompt: '3.14', answer: 'float' },
      { id: 'pair-string-type', prompt: '"hello"', answer: 'str' },
      { id: 'pair-bool', prompt: 'True', answer: 'bool' },
      { id: 'pair-list-type', prompt: '[1, 2, 3]', answer: 'list' },
      { id: 'pair-dict', prompt: '{"name": "Ana"}', answer: 'dict' },
    ],
  },
  operators: {
    instructions: 'Match each operator with what it does.',
    pairs: [
      { id: 'pair-plus', prompt: '+', answer: 'Addition or string concatenation' },
      { id: 'pair-modulo', prompt: '%', answer: 'Remainder after division' },
      { id: 'pair-equals', prompt: '==', answer: 'Checks if two values are equal' },
      { id: 'pair-not-equals', prompt: '!=', answer: 'Checks if two values are different' },
      { id: 'pair-and', prompt: 'and', answer: 'True only when both conditions are true' },
      { id: 'pair-or', prompt: 'or', answer: 'True when at least one condition is true' },
    ],
  },
};

export default function MemoryMatchConfig({ data, setData }) {
  const initialPairs = Array.isArray(data.content?.pairs) ? data.content.pairs : [];
  const [pairs, setPairs] = useState(initialPairs);
  const [showTemplates, setShowTemplates] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const updateContent = (nextPairs, nextInstructions = data.content?.instructions) => {
    setData('content', {
      ...data.content,
      instructions: nextInstructions || 'Match each card with its correct partner.',
      pairs: nextPairs,
    });
  };

  const addPair = () => {
    const nextPairs = [...pairs, createPair(pairs.length)];
    setPairs(nextPairs);
    updateContent(nextPairs);
  };

  const removePair = (index) => {
    const nextPairs = pairs.filter((_, pairIndex) => pairIndex !== index);
    setPairs(nextPairs);
    updateContent(nextPairs);
  };

  const updatePair = (index, field, value) => {
    const nextPairs = [...pairs];
    nextPairs[index] = {
      ...nextPairs[index],
      [field]: value,
    };
    setPairs(nextPairs);
    updateContent(nextPairs);
  };

  const updateInstructions = (value) => {
    updateContent(pairs, value);
  };

  const applyTemplate = (templateKey) => {
    const template = templates[templateKey];
    if (!template) return;

    setPairs(template.pairs);
    updateContent(template.pairs, template.instructions);
    setShowTemplates(false);
  };

  const importBulkPairs = () => {
    const importedPairs = bulkText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const [prompt, answer] = line.split('|').map((part) => part?.trim());

        return {
          id: `pair-${Date.now()}-${index}`,
          prompt: prompt || '',
          answer: answer || '',
        };
      })
      .filter((pair) => pair.prompt && pair.answer);

    if (!importedPairs.length) return;

    const nextPairs = [...pairs, ...importedPairs];
    setPairs(nextPairs);
    updateContent(nextPairs);
    setBulkText('');
  };

  return (
    <div className="rounded-xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-sky-50 p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-600 p-3">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-violet-950">Memory Match Configuration</h3>
            <p className="text-sm text-violet-700">Create concept cards and matching answer cards.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowTemplates((current) => !current)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white transition hover:bg-violet-700"
        >
          <Lightbulb className="h-4 w-4" />
          Quick Setup
        </button>
      </div>

      {showTemplates && (
        <div className="rounded-lg border-2 border-violet-300 bg-white p-5">
          <h4 className="mb-3 font-bold text-violet-950">Starter Templates</h4>
          <div className="grid gap-3 md:grid-cols-3">
            {Object.entries(templates).map(([key, template]) => (
              <button
                key={key}
                type="button"
                onClick={() => applyTemplate(key)}
                className="rounded-lg border-2 border-violet-200 p-4 text-left transition hover:border-violet-500 hover:bg-violet-50"
              >
                <div className="font-semibold text-gray-950">
                  {key === 'pythonBasics' ? 'Python Basics' : key === 'dataTypes' ? 'Data Types' : 'Operators'}
                </div>
                <div className="text-xs text-gray-600">{template.instructions}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border-2 border-sky-200 bg-white p-5">
        <label className="mb-2 block text-sm font-bold text-gray-900">Instructions for Students</label>
        <input
          type="text"
          value={data.content?.instructions || 'Match each card with its correct partner.'}
          onChange={(event) => updateInstructions(event.target.value)}
          className="w-full rounded-lg border-2 border-sky-200 px-4 py-2 focus:border-sky-500 focus:outline-none"
          placeholder="Match each Python concept with its definition."
        />
      </div>

      <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-emerald-700" />
          <h4 className="font-bold text-emerald-950">Bulk Import</h4>
        </div>
        <p className="mb-3 text-sm text-emerald-800">
          Add one pair per line using this format: concept | matching answer
        </p>
        <textarea
          value={bulkText}
          onChange={(event) => setBulkText(event.target.value)}
          rows="5"
          className="w-full rounded-lg border-2 border-emerald-200 px-4 py-3 font-mono text-sm focus:border-emerald-500 focus:outline-none"
          placeholder={'Variable | A named value stored in memory\nfor loop | Repeats over a sequence'}
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={importBulkPairs}
            disabled={!bulkText.trim()}
            className="rounded-lg bg-emerald-600 px-5 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Import Pairs
          </button>
        </div>
      </div>

      <div className="rounded-lg border-2 border-violet-200 bg-white p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h4 className="font-bold text-gray-950">Card Pairs</h4>
            <p className="text-sm text-gray-600">Each row creates two cards in the student game.</p>
          </div>
          <button
            type="button"
            onClick={addPair}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white transition hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
            Add Pair
          </button>
        </div>

        {pairs.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-violet-200 bg-violet-50 py-8 text-center">
            <p className="font-semibold text-violet-950">No pairs yet</p>
            <p className="mt-1 text-sm text-violet-700">Use a template or add your first pair.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pairs.map((pair, index) => (
              <div key={pair.id || index} className="rounded-lg border-2 border-violet-100 bg-violet-50 p-4">
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-center">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-violet-800">Card A</label>
                    <input
                      type="text"
                      value={pair.prompt}
                      onChange={(event) => updatePair(index, 'prompt', event.target.value)}
                      className="w-full rounded-lg border-2 border-violet-200 px-3 py-2 focus:border-violet-500 focus:outline-none"
                      placeholder="Concept, code, or value"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-violet-800">Card B</label>
                    <input
                      type="text"
                      value={pair.answer}
                      onChange={(event) => updatePair(index, 'answer', event.target.value)}
                      className="w-full rounded-lg border-2 border-violet-200 px-3 py-2 focus:border-violet-500 focus:outline-none"
                      placeholder="Definition, output, or matching value"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePair(index)}
                    className="inline-flex items-center justify-center rounded-lg p-3 text-red-600 transition hover:bg-red-50"
                    title="Remove pair"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border-2 border-violet-200 bg-violet-50 p-4 text-sm text-violet-900">
        Student board size: <span className="font-bold">{pairs.length * 2}</span> cards from{' '}
        <span className="font-bold">{pairs.length}</span> pair{pairs.length === 1 ? '' : 's'}.
      </div>
    </div>
  );
}
