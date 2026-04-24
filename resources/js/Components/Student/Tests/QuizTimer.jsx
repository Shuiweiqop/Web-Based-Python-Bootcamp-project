import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export default function QuizTimer({ startedAt, timeLimit, onTimeUp }) {
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isWarning, setIsWarning] = useState(false);
    const hasTriggeredTimeUpRef = useRef(false);

    useEffect(() => {
        if (!timeLimit || !startedAt) return;

        hasTriggeredTimeUpRef.current = false;

        const calculateTimeRemaining = () => {
            const started = new Date(startedAt);
            const expires = new Date(started.getTime() + timeLimit * 60 * 1000);
            const now = new Date();
            const remaining = Math.max(0, Math.floor((expires - now) / 1000));
            
            return remaining;
        };

        const updateTimer = () => {
            const remaining = calculateTimeRemaining();
            setTimeRemaining(remaining);

            // Show warning when 5 minutes left
            if (remaining <= 300 && remaining > 0) {
                setIsWarning(true);
            }

            // Time's up
            if (remaining === 0 && !hasTriggeredTimeUpRef.current) {
                hasTriggeredTimeUpRef.current = true;
                if (onTimeUp) {
                    onTimeUp();
                }
            }
        };

        // Initial update
        updateTimer();

        // Update every second
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [startedAt, timeLimit, onTimeUp]);

    if (!timeLimit || timeRemaining === null) {
        return null;
    }

    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;

    const formatTime = () => {
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getColorClass = () => {
        if (timeRemaining === 0) {
            return 'bg-red-100 text-red-800 border-red-300';
        }
        if (isWarning) {
            return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        }
        return 'bg-blue-100 text-blue-800 border-blue-300';
    };

    const getProgressPercentage = () => {
        const totalSeconds = timeLimit * 60;
        return (timeRemaining / totalSeconds) * 100;
    };

    return (
        <div className={`fixed top-4 right-4 z-50 ${getColorClass()} rounded-lg border-2 shadow-lg overflow-hidden transition-all duration-300`}>
            {/* Progress Bar */}
            <div className="h-1 bg-gray-200">
                <div 
                    className={`h-full transition-all duration-1000 ${
                        timeRemaining === 0 ? 'bg-red-500' :
                        isWarning ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${getProgressPercentage()}%` }}
                />
            </div>

            <div className="p-4">
                <div className="flex items-center space-x-3">
                    {isWarning ? (
                        <AlertTriangle className="w-6 h-6" />
                    ) : (
                        <Clock className="w-6 h-6" />
                    )}
                    <div>
                        <div className="text-xs font-medium opacity-75 mb-1">
                            {timeRemaining === 0 ? 'Time\'s Up!' : 'Time Remaining'}
                        </div>
                        <div className="text-2xl font-bold font-mono">
                            {formatTime()}
                        </div>
                    </div>
                </div>

                {isWarning && timeRemaining > 0 && (
                    <div className="mt-2 text-xs font-medium">
                        ⚠️ Less than 5 minutes left!
                    </div>
                )}

                {timeRemaining === 0 && (
                    <div className="mt-2 text-xs font-medium">
                        Submitting automatically...
                    </div>
                )}
            </div>
        </div>
    );
}
