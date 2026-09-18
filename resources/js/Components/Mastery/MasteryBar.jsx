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
 *
 * The component is used on two different backgrounds — the student area is dark,
 * the admin area is light — and this project sets no `darkMode` in
 * tailwind.config.js, so `dark:` variants never activate. The surface is
 * therefore chosen explicitly via the `theme` prop rather than inferred.
 */
const STATUS_STYLES = {
    light: {
        mastered: { bar: 'bg-emerald-500', text: 'text-emerald-700', label: 'Mastered' },
        developing: { bar: 'bg-amber-500', text: 'text-amber-700', label: 'Developing' },
        weak: { bar: 'bg-rose-500', text: 'text-rose-700', label: 'Needs work' },
        insufficient: { bar: 'bg-slate-400', text: 'text-slate-500', label: 'Not enough data' },
    },
    dark: {
        mastered: { bar: 'bg-emerald-400', text: 'text-emerald-300', label: 'Mastered' },
        developing: { bar: 'bg-amber-400', text: 'text-amber-300', label: 'Developing' },
        weak: { bar: 'bg-rose-400', text: 'text-rose-300', label: 'Needs work' },
        insufficient: { bar: 'bg-slate-500', text: 'text-white/50', label: 'Not enough data' },
    },
};

const SURFACE = {
    light: {
        name: 'text-slate-800',
        meta: 'text-slate-500',
        track: 'bg-slate-200',
        marker: 'bg-slate-900/60',
        gainUp: 'text-emerald-600',
        gainDown: 'text-rose-600',
    },
    dark: {
        name: 'text-white',
        meta: 'text-white/50',
        track: 'bg-white/15',
        marker: 'bg-white/80',
        gainUp: 'text-emerald-300',
        gainDown: 'text-rose-300',
    },
};

export default function MasteryBar({ concept, showBaseline = true, theme = 'light' }) {
    const palette = STATUS_STYLES[theme] ?? STATUS_STYLES.light;
    const surface = SURFACE[theme] ?? SURFACE.light;
    const style = palette[concept.status] ?? palette.insufficient;

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
                <span className={cn('truncate text-sm font-medium', surface.name)}>
                    {concept.name}
                </span>
                <span className="flex shrink-0 items-baseline gap-2">
                    {hasGain && (
                        <span
                            className={cn(
                                'text-xs font-semibold',
                                gain > 0 ? surface.gainUp : surface.gainDown,
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

            <div className={cn('relative h-2.5 w-full overflow-hidden rounded-full', surface.track)}>
                <div
                    className={cn('h-full rounded-full transition-all duration-500', style.bar)}
                    style={{ width: `${percent}%` }}
                />

                {/* Baseline marker sits on the same track so the gap between it
                    and the bar end IS the progress — no mental arithmetic. */}
                {showBaseline && baselinePercent !== null && (
                    <div
                        className={cn('absolute top-0 h-full w-0.5', surface.marker)}
                        style={{ left: `${baselinePercent}%` }}
                        title={`Starting point: ${baselinePercent}%`}
                    />
                )}
            </div>

            <div className={cn('mt-1 flex items-center justify-between text-xs', surface.meta)}>
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
