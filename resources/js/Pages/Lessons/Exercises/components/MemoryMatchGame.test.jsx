import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import MemoryMatchGame from './MemoryMatchGame';

vi.mock('axios', () => ({ default: { post: vi.fn() } }));

// The deck as the server sends it: no pairing, opaque ids.
const exercise = {
  exercise_id: 9,
  max_score: 100,
  content: {
    cards: [
      { id: 'ma', label: 'len()', role: 'Concept' },
      { id: 'mb', label: 'Length of a sequence', role: 'Match' },
      { id: 'mc', label: 'print()', role: 'Concept' },
      { id: 'md', label: 'Write to the screen', role: 'Match' },
    ],
  },
};
const lesson = { lesson_id: 3 };

// The server's answer key, for the mocked endpoint only.
const pairs = { ma: 'mb', mb: 'ma', mc: 'md', md: 'mc' };

const card = (label) => screen.getAllByRole('button').find((b) => b.textContent.includes(label));

const turn = async (a, b) => {
  fireEvent.click(card(a));
  fireEvent.click(card(b));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(800);
  });
};

describe('MemoryMatchGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    globalThis.route = vi.fn(() => '/flip-url');
    axios.post.mockImplementation(async (url, { first, second }) => ({
      data: { success: true, match: pairs[first] === second },
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    axios.post.mockReset();
    delete globalThis.route;
  });

  it('asks the server about each turn and counts what it says', async () => {
    render(<MemoryMatchGame exercise={exercise} lesson={lesson} onComplete={vi.fn()} />);

    await turn('len()', 'Write to the screen');
    expect(screen.getByText('Misses: 1')).toBeInTheDocument();

    await turn('len()', 'Length of a sequence');
    expect(screen.getByText('1/2')).toBeInTheDocument();

    expect(globalThis.route).toHaveBeenCalledWith('lessons.exercises.api.flip', { lesson: 3, exercise: 9 });
    const [, firstTurn] = axios.post.mock.calls[0];
    const [, secondTurn] = axios.post.mock.calls[1];
    expect(firstTurn).toMatchObject({ first: 'ma', second: 'md' });
    expect(secondTurn.run).toBe(firstTurn.run);
  });

  it('hands the run to onComplete when the board is cleared', async () => {
    const onComplete = vi.fn();
    render(<MemoryMatchGame exercise={exercise} lesson={lesson} onComplete={onComplete} />);

    await turn('len()', 'Length of a sequence');
    await turn('print()', 'Write to the screen');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    const [, summary, payload] = onComplete.mock.calls[0];
    expect(summary).toEqual({ correctCount: 2, totalItems: 2 });
    expect(payload).toEqual({ run: axios.post.mock.calls[0][1].run });
  });

  it('starts a new run on restart', async () => {
    render(<MemoryMatchGame exercise={exercise} lesson={lesson} onComplete={vi.fn()} />);

    await turn('len()', 'Length of a sequence');
    fireEvent.click(screen.getByRole('button', { name: /restart/i }));
    await turn('print()', 'Write to the screen');

    expect(axios.post.mock.calls[1][1].run).not.toBe(axios.post.mock.calls[0][1].run);
  });

  it('does not count a turn the server could not check', async () => {
    axios.post.mockRejectedValueOnce(new Error('offline'));
    render(<MemoryMatchGame exercise={exercise} lesson={lesson} onComplete={vi.fn()} />);

    await turn('len()', 'Write to the screen');

    expect(screen.getByRole('alert')).toHaveTextContent(/could not check/i);
    expect(screen.getByText('Misses: 0')).toBeInTheDocument();
  });
});
