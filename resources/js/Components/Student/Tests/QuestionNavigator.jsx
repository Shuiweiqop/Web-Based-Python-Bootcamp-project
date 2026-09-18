import React from 'react';
import { CheckCircle2 } from 'lucide-react';

/**
 * Jump-to-question strip for a test in progress.
 *
 * This file previously held a copy-pasted duplicate of QuizTimer — same timer
 * code under the wrong name, positioned at the identical `fixed top-4 right-4
 * z-50` as the real one. It rendered nothing only because Taking.jsx passes it
 * navigator props and no timeLimit, so its null-guard fired. Any future caller
 * passing timer props would have got two overlapping timers.
 *
 * Replaced with the component the props actually describe: which question the
 * student is on, which ones are answered, and a way to move between them.
 */
export default function QuestionNavigator({
    currentIndex = 0,
    totalQuestions = 0,
    answeredQuestions = [],
    onNavigate,
}) {
    if (!totalQuestions) {
        return null;
    }

    // answeredQuestions may arrive as an array of indices or a Set; normalise so
    // callers are not forced into one shape.
    const answered =
        answeredQuestions instanceof Set
            ? answeredQuestions
            : new Set(Array.isArray(answeredQuestions) ? answeredQuestions : []);

    const answeredCount = answered.size;

    return (
        <div className="mx-auto mt-4 max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-white/20 bg-black/60 p-4 shadow-lg backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                        Question {currentIndex + 1} of {totalQuestions}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        {answeredCount} answered
                    </span>
                </div>

                <div className="flex flex-wrap gap-2">
                    {Array.from({ length: totalQuestions }, (_, index) => {
                        const isCurrent = index === currentIndex;
                        const isAnswered = answered.has(index);

                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => onNavigate?.(index)}
                                aria-label={`Go to question ${index + 1}${isAnswered ? ' (answered)' : ''}`}
                                aria-current={isCurrent ? 'true' : undefined}
                                className={[
                                    // 40px keeps this a comfortable thumb target
                                    // on the phone viewport the audit checks.
                                    'flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold transition-all',
                                    isCurrent
                                        ? 'bg-blue-500 text-white ring-2 ring-blue-300 ring-offset-2 ring-offset-black/60'
                                        : isAnswered
                                          ? 'bg-emerald-500/25 text-emerald-200 hover:bg-emerald-500/40'
                                          : 'bg-white/10 text-gray-300 hover:bg-white/20',
                                ].join(' ')}
                            >
                                {index + 1}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
