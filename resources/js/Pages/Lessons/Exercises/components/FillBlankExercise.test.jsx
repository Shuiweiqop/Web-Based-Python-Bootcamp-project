import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FillBlankExercise from './FillBlankExercise';

// Content as the server sends it: no correctAnswer or alternativeAnswers.
const exercise = {
  title: 'Fill the gaps',
  max_score: 100,
  content: {
    sentences: [
      { text: '___ is used to show output', blanks: [{ hint: 'A built-in' }] },
      { text: 'A ___ loop repeats while a ___ holds', blanks: [{}, {}] },
    ],
  },
};

const blank = (sentence, b) => screen.getByLabelText(`Sentence ${sentence}, blank ${b}`);
const submitButton = () => screen.getByRole('button', { name: /Submit Answers|Type at least one answer|Submitting/ });

describe('FillBlankExercise', () => {
  it('hands what was typed, per sentence then per blank, to onComplete', () => {
    const onComplete = vi.fn();
    render(<FillBlankExercise exercise={exercise} onComplete={onComplete} />);

    fireEvent.change(blank(1, 1), { target: { value: 'print' } });
    fireEvent.change(blank(2, 2), { target: { value: 'condition' } });
    fireEvent.click(submitButton());

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(0, { totalItems: 3 }, { answers: [['print'], ['', 'condition']] });
  });

  it('needs at least one answer, and submits only once', () => {
    const onComplete = vi.fn();
    render(<FillBlankExercise exercise={exercise} onComplete={onComplete} />);

    expect(submitButton()).toBeDisabled();
    fireEvent.change(blank(1, 1), { target: { value: 'print' } });
    fireEvent.click(submitButton());
    fireEvent.click(submitButton());

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(blank(1, 1)).toBeDisabled();
  });

  it('submits what has been typed when time runs out', () => {
    const onComplete = vi.fn();
    const { rerender } = render(<FillBlankExercise exercise={exercise} onComplete={onComplete} />);

    fireEvent.change(blank(2, 1), { target: { value: 'while' } });
    rerender(<FillBlankExercise exercise={exercise} onComplete={onComplete} isTimeUp />);

    expect(onComplete).toHaveBeenCalledWith(0, { totalItems: 3 }, { answers: [[''], ['while', '']] });
  });

  it('still shows hints', () => {
    render(<FillBlankExercise exercise={exercise} onComplete={vi.fn()} />);

    expect(screen.getByText(/Blank 1: A built-in/)).toBeInTheDocument();
  });
});
