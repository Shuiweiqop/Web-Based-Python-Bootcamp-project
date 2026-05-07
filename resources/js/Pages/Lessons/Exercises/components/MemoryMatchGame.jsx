import React, { useEffect, useMemo, useState } from 'react';
import { Brain, CheckCircle, RotateCcw, Sparkles, Trophy, Zap } from 'lucide-react';

const shuffleCards = (cards) => {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};

const buildCards = (pairs = []) => {
  return pairs.flatMap((pair, index) => {
    const pairId = pair.id || `pair-${index}`;

    return [
      {
        id: `${pairId}-prompt`,
        pairId,
        label: pair.prompt,
        role: 'Concept',
      },
      {
        id: `${pairId}-answer`,
        pairId,
        label: pair.answer,
        role: 'Match',
      },
    ];
  });
};

export default function MemoryMatchGame({ exercise, onScoreUpdate, onComplete, isTimeUp = false }) {
  const content = exercise.content || {};
  const pairs = useMemo(
    () => (Array.isArray(content.pairs) ? content.pairs.filter((pair) => pair.prompt && pair.answer) : []),
    [content.pairs]
  );

  const initialCards = useMemo(() => shuffleCards(buildCards(pairs)), [pairs]);

  const [cards, setCards] = useState(initialCards);
  const [selectedIds, setSelectedIds] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [misses, setMisses] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const totalPairs = pairs.length;
  const matchedPairs = matchedIds.length / 2;
  const attempts = matchedPairs + misses;
  const accuracy = attempts > 0 ? Math.round((matchedPairs / attempts) * 100) : 100;
  const progress = totalPairs > 0 ? Math.round((matchedPairs / totalPairs) * 100) : 0;
  const currentScore = useMemo(() => {
    if (!totalPairs) return 0;

    const completionRatio = matchedPairs / totalPairs;
    const penaltyRatio = Math.max(0.7, accuracy / 100);
    const streakBonus = Math.min(bestStreak * 2, 10);

    return Math.min(
      exercise.max_score || 100,
      Math.round((exercise.max_score || 100) * completionRatio * penaltyRatio + streakBonus)
    );
  }, [accuracy, bestStreak, exercise.max_score, matchedPairs, totalPairs]);

  const deckColumns = cards.length <= 8
    ? 'sm:grid-cols-4'
    : cards.length <= 12
      ? 'sm:grid-cols-3 lg:grid-cols-4'
      : 'sm:grid-cols-4 lg:grid-cols-5';

  const resetGame = () => {
    const nextCards = shuffleCards(buildCards(pairs));
    setCards(nextCards);
    setSelectedIds([]);
    setMatchedIds([]);
    setMisses(0);
    setStreak(0);
    setBestStreak(0);
    setLastResult(null);
    setIsChecking(false);
    setIsComplete(false);
    onScoreUpdate?.(0);
  };

  const completeGame = () => {
    if (isComplete) return;

    setIsComplete(true);
    onScoreUpdate?.(currentScore);

    setTimeout(() => {
      onComplete?.(currentScore);
    }, 1100);
  };

  const handleCardClick = (card) => {
    if (
      isChecking ||
      isComplete ||
      isTimeUp ||
      selectedIds.includes(card.id) ||
      matchedIds.includes(card.id) ||
      selectedIds.length >= 2
    ) {
      return;
    }

    setLastResult(null);
    setSelectedIds((current) => [...current, card.id]);
  };

  useEffect(() => {
    onScoreUpdate?.(currentScore);
  }, [currentScore]);

  useEffect(() => {
    if (selectedIds.length !== 2) return;

    const [firstCard, secondCard] = selectedIds.map((id) => cards.find((card) => card.id === id));
    setIsChecking(true);

    const timeout = window.setTimeout(() => {
      if (firstCard?.pairId && firstCard.pairId === secondCard?.pairId && firstCard.role !== secondCard.role) {
        setMatchedIds((current) => [...current, firstCard.id, secondCard.id]);
        setStreak((current) => {
          const nextStreak = current + 1;
          setBestStreak((best) => Math.max(best, nextStreak));
          return nextStreak;
        });
        setLastResult('match');
      } else {
        setMisses((current) => current + 1);
        setStreak(0);
        setLastResult('miss');
      }

      setSelectedIds([]);
      setIsChecking(false);
    }, 720);

    return () => window.clearTimeout(timeout);
  }, [selectedIds, cards]);

  useEffect(() => {
    if (totalPairs > 0 && matchedIds.length === totalPairs * 2) {
      completeGame();
    }
  }, [matchedIds.length, totalPairs]);

  useEffect(() => {
    if (isTimeUp && !isComplete) {
      completeGame();
    }
  }, [isTimeUp, isComplete]);

  if (!totalPairs) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-slate-50">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Brain className="mx-auto mb-3 h-10 w-10 text-slate-400" />
          <p className="font-semibold text-slate-800">No memory match pairs configured.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] bg-[radial-gradient(circle_at_top_left,#ede9fe,transparent_32%),linear-gradient(135deg,#f8fafc,#ecfeff_45%,#f0fdf4)] p-5 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-xl shadow-violet-100 backdrop-blur">
          <div className="border-b border-slate-100 bg-gradient-to-r from-violet-700 via-indigo-700 to-sky-700 p-5 text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold ring-1 ring-white/20">
                  <Brain className="h-4 w-4" />
                  Memory Match
                </div>
                <h2 className="text-2xl font-bold sm:text-3xl">{exercise.title || 'Match the Cards'}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-violet-50">
                  {content.instructions || 'Flip two cards at a time and match each concept with its partner.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-xl bg-white/15 px-4 py-3 text-center ring-1 ring-white/20">
                  <div className="text-xs font-semibold uppercase text-violet-100">Score</div>
                  <div className="text-2xl font-bold">{currentScore}</div>
                </div>
                <div className="rounded-xl bg-white/15 px-4 py-3 text-center ring-1 ring-white/20">
                  <div className="text-xs font-semibold uppercase text-violet-100">Pairs</div>
                  <div className="text-2xl font-bold">{matchedPairs}/{totalPairs}</div>
                </div>
                <div className="rounded-xl bg-white/15 px-4 py-3 text-center ring-1 ring-white/20">
                  <div className="text-xs font-semibold uppercase text-violet-100">Accuracy</div>
                  <div className="text-2xl font-bold">{accuracy}%</div>
                </div>
                <div className="rounded-xl bg-white/15 px-4 py-3 text-center ring-1 ring-white/20">
                  <div className="text-xs font-semibold uppercase text-violet-100">Streak</div>
                  <div className="text-2xl font-bold">{streak}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="mb-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-800">
                  <Zap className="h-4 w-4" />
                  Best streak: {bestStreak}
                </span>
                <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-800">
                  Misses: {misses}
                </span>
                {lastResult === 'match' && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
                    <CheckCircle className="h-4 w-4" />
                    Nice match
                  </span>
                )}
                {lastResult === 'miss' && (
                  <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800">
                    Try another pair
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={resetGame}
                disabled={isTimeUp}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-violet-200 bg-white px-4 py-2 font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Restart
              </button>
            </div>
          </div>
        </div>

        {isComplete && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center shadow-sm">
            <Trophy className="mx-auto mb-2 h-9 w-9 text-emerald-600" />
            <div className="text-xl font-bold text-emerald-950">Board cleared!</div>
            <p className="mt-1 text-sm text-emerald-800">
              Final score: {currentScore}/{exercise.max_score || 100}. Best streak: {bestStreak}.
            </p>
          </div>
        )}

        <div className={`grid grid-cols-2 gap-3 ${deckColumns}`}>
          {cards.map((card) => {
            const isSelected = selectedIds.includes(card.id);
            const isMatched = matchedIds.includes(card.id);
            const isFaceUp = isSelected || isMatched || isComplete;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(card)}
                disabled={isMatched || isComplete || isTimeUp}
                className="group min-h-[142px] rounded-2xl text-left outline-none transition hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-violet-200 disabled:cursor-default sm:min-h-[156px]"
                style={{ perspective: '900px' }}
              >
                <div
                  className={`relative h-full min-h-[142px] rounded-2xl transition duration-500 sm:min-h-[156px] ${
                    isFaceUp ? '[transform:rotateY(180deg)]' : ''
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div
                    className="absolute inset-0 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-500 p-4 shadow-lg shadow-violet-100 transition group-hover:shadow-xl"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-white">
                      <div className="rounded-full bg-white/15 p-3 ring-1 ring-white/20">
                        <Sparkles className="h-7 w-7" />
                      </div>
                      <div className="text-sm font-bold uppercase tracking-wide">Flip Card</div>
                    </div>
                  </div>

                  <div
                    className={`absolute inset-0 rounded-2xl border-2 p-4 shadow-lg transition ${
                      isMatched
                        ? 'border-emerald-300 bg-emerald-50 shadow-emerald-100'
                        : isSelected
                          ? 'border-violet-400 bg-white shadow-violet-100'
                          : 'border-slate-200 bg-white shadow-slate-100'
                    }`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <div className="flex h-full flex-col justify-between gap-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex w-fit rounded-full bg-slate-100 px-2 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                          {card.role}
                        </span>
                        {isMatched && <CheckCircle className="h-5 w-5 text-emerald-600" />}
                      </div>
                      <div className="text-base font-bold leading-snug text-slate-950">{card.label}</div>
                      <div className={`h-1.5 rounded-full ${isMatched ? 'bg-emerald-400' : 'bg-violet-300'}`} />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
