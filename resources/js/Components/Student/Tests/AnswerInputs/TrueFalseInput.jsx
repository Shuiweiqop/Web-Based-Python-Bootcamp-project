import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';

export default function TrueFalseInput({ value = null, onChange, disabled = false }) {
    const normalize = (v) => {
        if (v === null || v === undefined) return null;
        const s = String(v).trim().toLowerCase();
        if (['true', '1', 'yes'].includes(s)) return 'true';
        if (['false', '0', 'no'].includes(s)) return 'false';
        return null;
    };

    const initialValue = useMemo(() => normalize(value), [value]);
    const [selected, setSelected] = useState(initialValue);

    useEffect(() => {
        setSelected(initialValue);
    }, [initialValue]);

    const handleSelect = (nextValue) => {
        if (disabled) return;
        setSelected(nextValue);
        if (onChange) {
            onChange(nextValue);
        }
    };

    const options = [
        { id: 'true', label: 'True' },
        { id: 'false', label: 'False' },
    ];

    return (
        <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700 mb-3">
                Select one answer:
            </div>

            {options.map((option) => {
                const isSelected = selected === option.id;
                return (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelect(option.id)}
                        disabled={disabled}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                            isSelected
                                ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                {isSelected ? (
                                    <CheckCircle className="w-6 h-6 text-indigo-600" />
                                ) : (
                                    <Circle className="w-6 h-6 text-gray-400" />
                                )}
                            </div>
                            <p className={`text-base ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                                {option.label}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

