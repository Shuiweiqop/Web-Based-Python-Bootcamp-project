import React, { useState } from 'react';

const McqMulti = ({ options, selectedValues = [], onChange, minSelections = 1, maxSelections = null }) => {
    const [selected, setSelected] = useState(selectedValues || []);

    const handleToggle = (value) => {
        const newSelected = selected.includes(value) 
            ? selected.filter(item => item !== value)
            : [...selected, value];

        // Check max selections limit
        if (maxSelections && newSelected.length > maxSelections) {
            return; // Don't allow more selections
        }

        setSelected(newSelected);
        if (onChange) {
            onChange({ selected: newSelected });
        }
    };

    const isValid = selected.length >= minSelections && 
                   (maxSelections ? selected.length <= maxSelections : true);

    if (!options || Object.keys(options).length === 0) {
        return (
            <div className="text-gray-500 italic">
                No options available for this question.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-700">
                    Select {minSelections === maxSelections 
                        ? `exactly ${minSelections}` 
                        : maxSelections 
                            ? `${minSelections}-${maxSelections}` 
                            : `at least ${minSelections}`} option(s):
                </p>
                <div className="text-sm text-gray-500">
                    {selected.length} of {maxSelections || Object.keys(options).length} selected
                </div>
            </div>

            {Object.entries(options).map(([key, value]) => {
                const isSelected = selected.includes(key);
                const isDisabled = maxSelections && !isSelected && selected.length >= maxSelections;

                return (
                    <label 
                        key={key} 
                        className={`
                            flex items-start p-4 border rounded-lg cursor-pointer transition-all duration-200
                            ${isSelected 
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                                : isDisabled
                                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }
                        `}
                    >
                        <input
                            type="checkbox"
                            name="mcq_multi_answer"
                            value={key}
                            checked={isSelected}
                            disabled={isDisabled}
                            onChange={() => handleToggle(key)}
                            className="mt-1 text-blue-600 focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
                        />
                        <div className="ml-3 flex-1">
                            <span className={`${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
                                <span className="font-medium text-gray-700">{key}.</span> {value}
                            </span>
                        </div>
                        {isSelected && (
                            <div className="ml-2">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </label>
                );
            })}

            {/* Selection feedback */}
            <div className="mt-4">
                {selected.length > 0 && (
                    <div className={`p-3 rounded-md border ${isValid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                        <p className={`text-sm font-medium ${isValid ? 'text-green-700' : 'text-yellow-700'}`}>
                            Selected answers:
                        </p>
                        <ul className={`text-sm mt-2 space-y-1 ${isValid ? 'text-green-600' : 'text-yellow-600'}`}>
                            {selected.map(key => (
                                <li key={key}>
                                    <span className="font-medium">{key}.</span> {options[key]}
                                </li>
                            ))}
                        </ul>
                        {!isValid && (
                            <p className="text-yellow-700 text-xs mt-2">
                                {selected.length < minSelections 
                                    ? `Please select at least ${minSelections} more option(s).`
                                    : `Too many selections. Maximum allowed: ${maxSelections}.`
                                }
                            </p>
                        )}
                    </div>
                )}

                {selected.length === 0 && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-gray-600 text-sm">
                            No options selected yet. Click on the options above to select your answers.
                        </p>
                    </div>
                )}
            </div>

            {/* Quick actions */}
            {selected.length > 0 && (
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={() => {
                            setSelected([]);
                            if (onChange) onChange({ selected: [] });
                        }}
                        className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                        Clear All
                    </button>
                </div>
            )}
        </div>
    );
};

export default McqMulti;