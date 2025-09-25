import React from 'react';

const McqSingle = ({ options, selectedValue, onChange }) => {
    const handleChange = (value) => {
        if (onChange) {
            onChange({ selected: value });
        }
    };

    if (!options || Object.keys(options).length === 0) {
        return (
            <div className="text-gray-500 italic">
                No options available for this question.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 mb-4">
                Choose the best answer:
            </p>
            {Object.entries(options).map(([key, value]) => (
                <label 
                    key={key} 
                    className={`
                        flex items-start p-4 border rounded-lg cursor-pointer transition-all duration-200
                        ${selectedValue === key 
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }
                    `}
                >
                    <input
                        type="radio"
                        name="mcq_answer"
                        value={key}
                        checked={selectedValue === key}
                        onChange={(e) => handleChange(e.target.value)}
                        className="mt-1 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="ml-3 flex-1">
                        <span className="text-gray-900">
                            <span className="font-medium text-gray-700">{key}.</span> {value}
                        </span>
                    </div>
                </label>
            ))}
            
            {selectedValue && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-700 text-sm">
                        Selected: <span className="font-medium">{selectedValue}. {options[selectedValue]}</span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default McqSingle;