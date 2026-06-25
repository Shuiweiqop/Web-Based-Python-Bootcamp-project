import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';
import { cn } from '@/utils/cn';
import { avatarUrl } from '@/utils/avatar';
import { Crown, Medal, Sparkles, Trophy } from 'lucide-react';

/* Count a number up from 0 with an ease-out, on mount. */
function useCountUp(target, duration = 1000) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        let raf;
        const start = performance.now();
        const tick = (now) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(target * eased));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, duration]);
    return value;
}

/* One-time confetti burst (auto-removes after it finishes). */
function Confetti() {
    const [on, setOn] = useState(true);
    useEffect(() => {
        const t = setTimeout(() => setOn(false), 2800);
        return () => clearTimeout(t);
    }, []);
    if (!on) return null;

    const colors = ['#FACC15', '#F59E0B', '#22D3EE', '#A78BFA', '#F472B6', '#34D399'];
    return (
        <div className="lb-confetti" aria-hidden="true">
            {Array.from({ length: 70 }, (_, i) => {
                const size = 6 + Math.random() * 7;
                return (
                    <span
                        key={i}
                        style={{
                            left: `${Math.random() * 100}%`,
                            width: `${size}px`,
                            height: `${size * 0.5}px`,
                            background: colors[i % colors.length],
                            '--drift': `${(Math.random() * 2 - 1) * 140}px`,
                            '--rot': `${Math.random() * 720 - 360}deg`,
                            animationDelay: `${Math.random() * 0.5}s`,
                            animationDuration: `${1.6 + Math.random() * 1.3}s`,
                        }}
                    />
                );
            })}
        </div>
    );
}

const PODIUM = {
    1: { ring: 'ring-yellow-300', glow: 'shadow-[0_0_34px_-4px_rgba(250,204,21,0.8)]', accent: 'text-yellow-300', h: 130, light: '#FDE68A', mid: '#FACC15', dark: '#A16207' },
    2: { ring: 'ring-slate-200', glow: 'shadow-[0_0_24px_-6px_rgba(226,232,240,0.6)]', accent: 'text-slate-200', h: 96, light: '#F1F5F9', mid: '#CBD5E1', dark: '#64748B' },
    3: { ring: 'ring-amber-500', glow: 'shadow-[0_0_24px_-6px_rgba(245,158,11,0.6)]', accent: 'text-amber-400', h: 78, light: '#FCD34D', mid: '#D97706', dark: '#7C2D12' },
};

function PodiumColumn({ entry, order }) {
    const xp = useCountUp(entry.xp);
    const s = PODIUM[entry.rank];

    return (
        <div
            className="lb-rise flex w-1/3 flex-col items-center justify-end"
            style={{ order, animationDelay: `${(4 - entry.rank) * 130}ms` }}
        >
            {entry.rank === 1 && (
                <Crown className="lb-float mb-1 h-7 w-7 text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
            )}

            <div className="relative">
                {entry.rank === 1 && (
                    <>
                        <span className="lb-aura" aria-hidden="true" />
                        <Sparkles className="lb-twinkle absolute -left-4 top-1 h-4 w-4 text-yellow-200" style={{ animationDelay: '0s' }} />
                        <Sparkles className="lb-twinkle absolute -right-4 top-3 h-3.5 w-3.5 text-amber-200" style={{ animationDelay: '.6s' }} />
                        <Sparkles className="lb-twinkle absolute right-1 -top-3 h-3 w-3 text-yellow-100" style={{ animationDelay: '1.1s' }} />
                    </>
                )}
                <div className="relative overflow-hidden rounded-full">
                    <img
                        src={avatarUrl(entry.name)}
                        alt={entry.name}
                        className={cn('relative z-[1] h-16 w-16 rounded-full ring-4', s.ring, s.glow)}
                    />
                    {entry.rank === 1 && <span className="lb-shine" aria-hidden="true" />}
                </div>
                {entry.avatar_frame && (
                    <img
                        src={entry.avatar_frame}
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute left-1/2 top-1/2 z-[2] h-[5.6rem] w-[5.6rem] -translate-x-1/2 -translate-y-1/2 object-contain"
                    />
                )}
                <span className={cn('absolute -bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/15 bg-black px-2 text-sm font-extrabold', s.accent)}>
                    #{entry.rank}
                </span>
            </div>

            <p className={cn('mt-3 max-w-full truncate px-1 text-center text-sm font-bold', entry.is_me && 'text-yellow-200')}>
                {entry.name}
                {entry.is_me && <span className="ml-1 text-yellow-300">(You)</span>}
            </p>
            <p className="mb-2 text-xs text-white/50">Lv {entry.level} · {entry.level_label}</p>

            {/* 3D pedestal: tilted top face + extruded body + contact shadow */}
            <div
                className="lb-ped w-full"
                style={{ '--c-light': s.light, '--c-mid': s.mid, '--c-dark': s.dark, '--h': `${s.h}px` }}
            >
                <div className="lb-ped__top" />
                <div className="lb-ped__body">
                    {entry.rank === 1 && <span className="lb-shimmer" aria-hidden="true" />}
                    <span className="relative text-lg font-extrabold tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                        {xp.toLocaleString()}
                    </span>
                    <span className="relative text-[10px] font-semibold uppercase tracking-wider text-black/55">XP</span>
                </div>
                <span className="lb-ped__shadow" aria-hidden="true" />
            </div>
        </div>
    );
}

const LEVEL_COLOR = {
    1: { text: 'text-slate-300', bar: 'bg-slate-400', ring: 'ring-slate-400/60' },
    2: { text: 'text-emerald-300', bar: 'bg-emerald-400', ring: 'ring-emerald-400/60' },
    3: { text: 'text-sky-300', bar: 'bg-sky-400', ring: 'ring-sky-400/60' },
    4: { text: 'text-violet-300', bar: 'bg-violet-400', ring: 'ring-violet-400/60' },
    5: { text: 'text-amber-300', bar: 'bg-amber-400', ring: 'ring-amber-400/60' },
};

function ListRow({ entry, index, maxXp }) {
    const xp = useCountUp(entry.xp, 700);
    const lc = LEVEL_COLOR[entry.level] ?? LEVEL_COLOR[1];
    const pct = maxXp > 0 ? Math.max(4, Math.round((entry.xp / maxXp) * 100)) : 0;

    return (
        <li
            className={cn(
                'lb-row group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.06]',
                entry.is_me && 'lb-glow bg-yellow-300/10 ring-1 ring-yellow-300/40'
            )}
            style={{ animationDelay: `${index * 60}ms` }}
        >
            <span className={cn('absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-full', lc.bar)} aria-hidden="true" />
            <div className="w-7 text-center text-sm font-bold text-white/60">#{entry.rank}</div>
            <span className="relative inline-block h-10 w-10 shrink-0">
                <img src={avatarUrl(entry.name)} alt={entry.name} className={cn('h-10 w-10 rounded-full ring-2', lc.ring)} />
                {entry.avatar_frame && (
                    <img
                        src={entry.avatar_frame}
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute left-1/2 top-1/2 h-[3.4rem] w-[3.4rem] -translate-x-1/2 -translate-y-1/2 object-contain"
                    />
                )}
            </span>
            <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                    {entry.name}
                    {entry.is_me && (
                        <span className="ml-2 rounded-full bg-yellow-300/20 px-2 py-0.5 text-xs text-yellow-200">You</span>
                    )}
                </p>
                <div className="mt-1 flex items-center gap-2">
                    <span className={cn('whitespace-nowrap text-[11px] font-medium', lc.text)}>
                        Lv {entry.level} · {entry.level_label}
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <span className={cn('block h-full rounded-full', lc.bar)} style={{ width: `${pct}%` }} />
                    </span>
                </div>
            </div>
            <div className="text-right">
                <p className="font-bold tabular-nums">{xp.toLocaleString()}</p>
                <p className="text-[10px] uppercase tracking-wide text-white/40">XP</p>
            </div>
        </li>
    );
}

export default function Leaderboard({ leaderboard = [], me }) {
    const top3 = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);
    const maxXp = leaderboard[0]?.xp ?? 0;
    const meXp = useCountUp(me?.xp ?? 0);

    // Subtle mouse parallax over the podium card.
    const [par, setPar] = useState({ x: 0, y: 0 });
    const handleParallax = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPar({
            x: ((e.clientX - r.left) / r.width) * 2 - 1,
            y: ((e.clientY - r.top) / r.height) * 2 - 1,
        });
    };
    const resetParallax = () => setPar({ x: 0, y: 0 });

    // Fill the progress bar after mount so it animates from 0.
    const [barWidth, setBarWidth] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setBarWidth(me?.progress_percent ?? 0), 150);
        return () => clearTimeout(t);
    }, [me?.progress_percent]);

    const header = (
        <div className="overflow-hidden rounded-3xl border border-white/20 bg-black/70 p-8 text-white shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-4">
                <Trophy className="lb-float h-10 w-10 text-yellow-300" />
                <div>
                    <h1 className="text-2xl font-bold">Leaderboard</h1>
                    <p className="text-sm text-white/70">Climb the ranks — earn XP to level up</p>
                </div>
            </div>

            {me && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                        <span>Your rank: <strong className="text-yellow-300">#{me.rank}</strong><span className="text-white/50"> / {me.total_players}</span></span>
                        <span className="inline-flex items-center gap-1">
                            <Sparkles className="h-4 w-4 text-yellow-300" />
                            Level <strong>{me.level}</strong> · {me.label}
                        </span>
                        <span><strong className="tabular-nums">{meXp.toLocaleString()}</strong> XP</span>
                    </div>

                    {me.next_label ? (
                        <div className="mt-3">
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-amber-500 transition-[width] duration-1000 ease-out"
                                    style={{ width: `${barWidth}%` }}
                                />
                            </div>
                            <p className="mt-1 text-xs text-white/50">{me.xp_needed} XP to {me.next_label}</p>
                        </div>
                    ) : (
                        <p className="mt-3 text-xs text-yellow-200">Max level reached 🎉</p>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <StudentLayout header={header}>
            <Head title="Leaderboard" />

            {/* Component-scoped animations (no external deps). */}
            <style>{`
                @keyframes lbRise { from { opacity:0; transform: translateY(40px) } to { opacity:1; transform:none } }
                @keyframes lbRow { from { opacity:0; transform: translateX(-14px) } to { opacity:1; transform:none } }
                @keyframes lbFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }
                @keyframes lbGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(250,204,21,.45) } 50% { box-shadow: 0 0 0 6px rgba(250,204,21,0) } }
                .lb-rise { animation: lbRise .6s cubic-bezier(.22,1,.36,1) both }
                .lb-row { animation: lbRow .45s ease-out both }
                .lb-float { animation: lbFloat 2.4s ease-in-out infinite }
                .lb-glow { animation: lbGlow 2s ease-in-out infinite }

                /* Atmosphere: drifting aurora orbs + champion spotlight */
                .lb-aurora { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
                .lb-orb { position:absolute; border-radius:9999px; filter: blur(45px); }
                .lb-orb--a { width:260px; height:260px; background:#7c3aed; opacity:.35; top:-70px; left:4%; animation: lbDrift 15s ease-in-out infinite }
                .lb-orb--b { width:230px; height:230px; background:#0ea5e9; opacity:.30; bottom:-60px; right:6%; animation: lbDrift 19s ease-in-out infinite reverse }
                .lb-orb--c { width:320px; height:320px; background:#f59e0b; opacity:.16; top:10%; left:38%; animation: lbDrift 23s ease-in-out infinite }
                @keyframes lbDrift { 0%,100%{transform:translate(0,0)} 33%{transform:translate(34px,-22px)} 66%{transform:translate(-22px,16px)} }
                .lb-spotlight { position:absolute; top:-50px; left:50%; width:420px; height:300px; transform:translateX(-50%); pointer-events:none;
                    background: radial-gradient(ellipse at top, rgba(250,204,21,.30), transparent 64%); animation: lbSpot 4s ease-in-out infinite }
                @keyframes lbSpot { 0%,100%{opacity:.65} 50%{opacity:1} }

                /* #1 sparkles + aura + gold sheen */
                .lb-twinkle { animation: lbTwinkle 1.9s ease-in-out infinite }
                @keyframes lbTwinkle { 0%,100%{opacity:.2; transform:scale(.7)} 50%{opacity:1; transform:scale(1.12)} }
                .lb-aura { position:absolute; inset:-10px; border-radius:9999px; pointer-events:none;
                    background: radial-gradient(circle, rgba(250,204,21,.45), transparent 70%); animation: lbAura 2.4s ease-in-out infinite }
                @keyframes lbAura { 0%,100%{opacity:.5; transform:scale(.95)} 50%{opacity:.9; transform:scale(1.08)} }
                .lb-shimmer { position:absolute; inset:0; border-radius:0 0 10px 10px; overflow:hidden; pointer-events:none }
                .lb-shimmer::after { content:''; position:absolute; top:0; left:-60%; width:55%; height:100%;
                    background: linear-gradient(105deg, transparent, rgba(255,255,255,.5), transparent); animation: lbSheen 3.6s ease-in-out infinite }
                @keyframes lbSheen { 0%{left:-60%} 55%,100%{left:130%} }

                .lb-confetti { position:absolute; inset:0; overflow:hidden; pointer-events:none; z-index:20 }
                .lb-confetti span { position:absolute; top:-14px; border-radius:2px; opacity:0;
                    animation-name: lbConfetti; animation-timing-function: cubic-bezier(.3,.7,.4,1); animation-fill-mode: forwards }
                @keyframes lbConfetti {
                    0% { opacity:1; transform: translate(0,0) rotate(0) }
                    100% { opacity:0; transform: translate(var(--drift), 320px) rotate(var(--rot)) }
                }
                /* 3D pedestal */
                .lb-ped { position: relative; transform-style: preserve-3d; }
                .lb-ped__top {
                    height: 16px; border-radius: 8px 8px 0 0;
                    background: linear-gradient(180deg, var(--c-light), var(--c-mid));
                    transform: perspective(240px) rotateX(42deg);
                    transform-origin: bottom center;
                    box-shadow: inset 0 1px 2px rgba(255,255,255,.6);
                }
                .lb-ped__body {
                    position: relative; height: var(--h); margin-top: -1px;
                    display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
                    padding-top: 10px; color: #1f2937;
                    border-radius: 0 0 10px 10px;
                    background:
                        linear-gradient(95deg, rgba(255,255,255,.45) 0%, rgba(255,255,255,0) 22%),
                        linear-gradient(265deg, rgba(0,0,0,.30) 0%, rgba(0,0,0,0) 26%),
                        linear-gradient(180deg, var(--c-mid), var(--c-dark));
                    box-shadow:
                        inset 0 2px 3px rgba(255,255,255,.35),
                        inset 0 -10px 18px rgba(0,0,0,.30),
                        0 22px 28px -12px rgba(0,0,0,.7);
                }
                .lb-ped__shadow {
                    position: absolute; left: 8%; right: 8%; bottom: -10px; height: 14px;
                    background: radial-gradient(ellipse at center, rgba(0,0,0,.55), transparent 70%);
                    filter: blur(3px); z-index: -1;
                }
                .lb-shine { position:absolute; inset:0; border-radius:9999px; pointer-events:none;
                    background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,.85) 50%, transparent 70%);
                    transform: translateX(-120%); animation: lbShine 1.1s ease-out .35s 1 forwards }
                @keyframes lbShine { to { transform: translateX(120%) } }

                @media (prefers-reduced-motion: reduce) {
                    .lb-rise,.lb-row,.lb-float,.lb-glow,.lb-shine,.lb-orb,.lb-spotlight,.lb-twinkle,.lb-aura { animation: none }
                    .lb-shimmer::after { animation: none }
                    .lb-confetti { display: none }
                }
            `}</style>

            {leaderboard.length === 0 ? (
                <div className="rounded-3xl border border-white/20 bg-black/70 p-12 text-center text-white/60 shadow-2xl backdrop-blur-xl">
                    No ranked learners yet — be the first to earn XP! 🚀
                </div>
            ) : (
                <div className="space-y-6">
                    {top3.length >= 3 && (
                        <div
                            className="relative overflow-hidden rounded-3xl border border-white/20 bg-black/70 p-6 text-white shadow-2xl backdrop-blur-xl"
                            onMouseMove={handleParallax}
                            onMouseLeave={resetParallax}
                        >
                            <div
                                className="lb-aurora"
                                aria-hidden="true"
                                style={{ transform: `translate(${par.x * 22}px, ${par.y * 16}px)`, transition: 'transform .25s ease-out' }}
                            >
                                <span className="lb-orb lb-orb--a" />
                                <span className="lb-orb lb-orb--b" />
                                <span className="lb-orb lb-orb--c" />
                            </div>
                            <span
                                className="lb-spotlight"
                                aria-hidden="true"
                                style={{ transform: `translateX(calc(-50% + ${par.x * 26}px))`, transition: 'transform .25s ease-out' }}
                            />
                            <Confetti />
                            <div
                                className="relative flex items-end justify-center gap-3 sm:gap-6"
                                style={{ transform: `translate(${par.x * -8}px, ${par.y * -5}px)`, transition: 'transform .25s ease-out' }}
                            >
                                {top3.map((entry) => (
                                    <PodiumColumn
                                        key={entry.student_id}
                                        entry={entry}
                                        order={entry.rank === 1 ? 2 : entry.rank === 2 ? 1 : 3}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="rounded-3xl border border-white/20 bg-black/70 p-4 text-white shadow-2xl backdrop-blur-xl sm:p-6">
                        <ul className="divide-y divide-white/10">
                            {(top3.length >= 3 ? rest : leaderboard).map((entry, i) => (
                                <ListRow key={entry.student_id} entry={entry} index={i} maxXp={maxXp} />
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </StudentLayout>
    );
}
