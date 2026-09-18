/**
 * Ability profile as a radar chart, drawn with inline SVG.
 *
 * Hand-rolled rather than pulling in a charting library: this is one shape on a
 * fixed axis set, and a dependency would cost far more bundle weight than the
 * ~60 lines of geometry below.
 *
 * Two overlaid polygons — the placement baseline and current mastery — because
 * the gap between them is the point. A single polygon shows where a student is;
 * two show how far they have come.
 */

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 58; // leave room for labels outside the plot
const RINGS = [0.25, 0.5, 0.75, 1];

/** Polar to cartesian, starting at 12 o'clock and going clockwise. */
function point(index, total, value) {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = RADIUS * Math.max(0, Math.min(1, value));

    return {
        x: CENTER + r * Math.cos(angle),
        y: CENTER + r * Math.sin(angle),
    };
}

function polygon(values) {
    return values
        .map((value, i) => {
            const p = point(i, values.length, value);

            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        })
        .join(' ');
}

export default function MasteryRadar({ concepts, theme = 'light' }) {
    const isDark = theme === 'dark';
    // Below three axes a radar degenerates into a line or a point.
    if (!concepts || concepts.length < 3) {
        return null;
    }

    const current = concepts.map((c) => c.mastery ?? 0);
    const baseline = concepts.map((c) => c.baseline ?? 0);
    const hasBaseline = concepts.some((c) => c.baseline !== null && c.baseline !== undefined);

    return (
        <div className="flex justify-center">
            <svg
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                className="h-auto w-full max-w-sm"
                role="img"
                aria-label="Mastery by concept"
            >
                {/* Grid rings */}
                {RINGS.map((ring) => (
                    <polygon
                        key={ring}
                        points={polygon(concepts.map(() => ring))}
                        className={isDark ? "fill-none stroke-white/15" : "fill-none stroke-slate-200"}
                        strokeWidth="1"
                    />
                ))}

                {/* Spokes */}
                {concepts.map((concept, i) => {
                    const p = point(i, concepts.length, 1);

                    return (
                        <line
                            key={concept.concept_id}
                            x1={CENTER}
                            y1={CENTER}
                            x2={p.x}
                            y2={p.y}
                            className={isDark ? "stroke-white/15" : "stroke-slate-200"}
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Baseline: dashed and unfilled so it reads as "where you started"
                    rather than competing with the current figure. */}
                {hasBaseline && (
                    <polygon
                        points={polygon(baseline)}
                        className={isDark ? "fill-none stroke-white/50" : "fill-none stroke-slate-400"}
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                    />
                )}

                {/* Current mastery */}
                <polygon
                    points={polygon(current)}
                    className={isDark ? "fill-indigo-400/30 stroke-indigo-300" : "fill-indigo-500/25 stroke-indigo-500"}
                    strokeWidth="2"
                />

                {/* Vertices */}
                {current.map((value, i) => {
                    const p = point(i, current.length, value);

                    return (
                        <circle
                            key={concepts[i].concept_id}
                            cx={p.x}
                            cy={p.y}
                            r="3"
                            className={isDark ? "fill-indigo-300" : "fill-indigo-500"}
                        />
                    );
                })}

                {/* Axis labels, nudged outside the plot and anchored by side so
                    they never overlap the shape. */}
                {concepts.map((concept, i) => {
                    const p = point(i, concepts.length, 1.18);
                    const isRight = p.x > CENTER + 6;
                    const isLeft = p.x < CENTER - 6;

                    return (
                        <text
                            key={concept.concept_id}
                            x={p.x}
                            y={p.y}
                            textAnchor={isRight ? 'start' : isLeft ? 'end' : 'middle'}
                            dominantBaseline="middle"
                            className={isDark ? "fill-white/80 text-[9px]" : "fill-slate-500 text-[9px]"}
                        >
                            {concept.short_name ?? concept.name}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}
