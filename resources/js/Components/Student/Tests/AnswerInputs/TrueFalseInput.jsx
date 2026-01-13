import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle } from 'lucide-react';

export default function MCQInput({ options, value = [], onChange, disabled = false }) {
    const [selectedOptions, setSelectedOptions] = useState(value || []);

    useEffect(() => {
        setSelectedOptions(value || []);
    }, [value]);

    const handleOptionToggle = (optionId) => {
        if (disabled) return;

        let newSelection;
        if (selectedOptions.includes(optionId)) {
            // Deselect
            newSelection = selectedOptions.filter(id => id !== optionId);
        } else {
            // Select
            newSelection = [...selectedOptions, optionId];
        }

        setSelectedOptions(newSelection);
        if (onChange) {
            onChange(newSelection);
        }
    };

    const isSelected = (optionId) => selectedOptions.includes(optionId);

    return (
        <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700 mb-3">
                Select your answer(s):
            </div>
            
            {options.map((option) => {
                const selected = isSelected(option.option_id);
                
                return (
                    <button
                        key={option.option_id}
                        type="button"
                        onClick={() => handleOptionToggle(option.option_id)}
                        disabled={disabled}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                            selected
                                ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        } ${
                            disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                    >
                        <div className="flex items-start space-x-3">
                            {/* Checkbox/Circle */}
                            <div className="flex-shrink-0 mt-0.5">
                                {selected ? (
                                    <CheckCircle className="w-6 h-6 text-indigo-600" />
                                ) : (
                                    <Circle className="w-6 h-6 text-gray-400" />
                                )}
                            </div>

                            {/* Option Content */}
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-1">
                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                                        selected
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {option.option_label}
                                    </span>
                                </div>
                                <p className={`text-base ${
                                    selected ? 'text-gray-900 font-medium' : 'text-gray-700'
                                }`}>
                                    {option.option_text}
                                </p>
                            </div>
                        </div>
                    </button>
                );
            })}

            {/* Selection Counter */}
            {selectedOptions.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        {selectedOptions.length} option{selectedOptions.length > 1 ? 's' : ''} selected
                    </p>
                </div>
            )}
        </div>
    );
}