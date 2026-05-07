import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Clock, Gamepad2, Trophy } from 'lucide-react';

const formatTime = (seconds) => {
  const safeSeconds = Number(seconds) || 0;
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatType = (type) => {
  if (!type) return 'Interactive';
  return type.replaceAll('_', ' ');
};

const GameHeader = ({
  lesson,
  exercise,
  backRoute = null,
}) => {
  const exerciseType = exercise.exercise_type || exercise.type;
  const timeLimit = Number(exercise.time_limit_sec || exercise.time_limit || 0);
  const defaultBackRoute = backRoute || route('lessons.show', lesson?.lesson_id || lesson?.id);

  return (
    <div className="mb-5">
      <Link
        href={defaultBackRoute}
        className="mb-4 inline-flex items-center gap-2 rounded-xl bg-white/80 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-white hover:text-indigo-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Lesson
      </Link>

      <section className="overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-xl shadow-indigo-100/60 backdrop-blur">
        <div className="bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700 p-6 text-white">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ring-white/20">
                <Gamepad2 className="h-4 w-4" />
                {formatType(exerciseType)}
              </div>
              <h1 className="text-3xl font-black leading-tight sm:text-4xl">{exercise.title}</h1>
              {exercise.description && (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-50">{exercise.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:min-w-[320px]">
              <div className="rounded-2xl bg-white/15 p-4 ring-1 ring-white/20">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-indigo-100">
                  <Trophy className="h-4 w-4 text-amber-200" />
                  Reward
                </div>
                <div className="text-2xl font-black">{exercise.max_score || 100}</div>
                <div className="text-xs text-indigo-100">max points</div>
              </div>

              <div className="rounded-2xl bg-white/15 p-4 ring-1 ring-white/20">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-indigo-100">
                  <Clock className="h-4 w-4 text-sky-200" />
                  Timer
                </div>
                <div className="text-2xl font-black">{timeLimit > 0 ? formatTime(timeLimit) : 'Open'}</div>
                <div className="text-xs text-indigo-100">{timeLimit > 0 ? 'time limit' : 'no limit'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold">From lesson: <span className="text-slate-950">{lesson?.title || lesson?.name || 'Unknown Lesson'}</span></span>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700">
            Focus mode
          </span>
        </div>
      </section>
    </div>
  );
};

export default GameHeader;
