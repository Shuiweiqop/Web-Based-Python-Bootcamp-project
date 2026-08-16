import { cn } from '@/utils/cn';

/**
 * A single concept's mastery as a horizontal bar.
 *
 * Shows the placement baseline as a marker on the same track, so progress is
 * visible as distance travelled rather than an absolute number the learner has
 * no reference for.
 *
 * Status drives colour, and 'insufficient' is deliberately grey rather than red:
 * too little evidence is not the same as a diagnosed weakness, and colouring it
 * like one would tell a student they are bad at something nobody has measured.
 */
const STATUS_STYLES = {
    mastered: { bar: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', label: 'Mastered' },
    developing: { bar: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400', label: 'Developing' },
    weak: { bar: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-400', label: 'Needs work' },
    insufficient: { bar: 'bg-slate-400', text: 'text-slate-500 dark:text-slate-400', label: 'Not enough data' },
};

export default function MasteryBar({ concept, showBaseline = true }) {
    const style = STATUS_STYLES[concept.status] ?? STATUS_STYLES.insufficient;
    const percent = Math.round(concept.mastery * 100);
    const baselinePercent =
        concept.baseline !== null && concept.baseline !== undefined
            ? Math.round(concept.baseline * 100)
            : null;

    const gain = concept.gain;
    const hasGain = gain !== null && gain !== undefined && Math.abs(gain) >= 0.005;

    return (
        <div className="py-3">
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {concept.name}
                </span>
                <span className="flex shrink-0 items-baseline gap-2">
                    {hasGain && (
                        <span
                            className={cn(
                                'text-xs font-semibold',
                                gain > 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-rose-600 dark:text-rose-400',
                            )}
                        >
                            {gain > 0 ? '+' : ''}
                            {Math.round(gain * 100)}
                        </span>
                    )}
                    <span className={cn('text-sm font-semibold tabular-nums', style.text)}>
                        {concept.status === 'insufficient' ? '—' : `${percent}%`}
                    </span>
                </span>
            </div>

            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                    className={cn('h-full rounded-full transition-all duration-500', style.bar)}
                    style={{ width: `${percent}%` }}
                />

                {/* Baseline marker sits on the same track so the gap between it
                    and the bar end IS the progress — no mental arithmetic. */}
                {showBaseline && baselinePercent !== null && (
                    <div
                        className="absolute top-0 h-full w-0.5 bg-slate-900/60 dark:bg-white/70"
                        style={{ left: `${baselinePercent}%` }}
                        title={`Starting point: ${baselinePercent}%`}
                    />
                )}
            </div>

            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className={style.text}>{style.label}</span>
                <span className="tabular-nums">
                    {concept.attempts > 0
                        ? `${concept.correct}/${concept.attempts} correct`
                        : 'Not practised yet'}
                </span>
            </div>
        </div>
    );
}
