import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import QuizExercise from './QuizExercise';

const exercise = {
  title: 'Syntax Quiz',
  max_score: 40,
  content: {
    questions: [
      { question: 'Comment character?', options: ['//', '#'] },
      { question: 'Print output?', options: ['echo()', 'print()'] },
    ],
  },
};

const submitButton = () => screen.getByRole('button', { name: /Submit Answers/ });

describe('QuizExercise', () => {
  it('holds the submit button until every question is answered', () => {
    render(<QuizExercise exercise={exercise} onComplete={vi.fn()} />);

    expect(submitButton()).toBeDisabled();
    fireEvent.click(screen.getByLabelText('#'));
    expect(submitButton()).toBeDisabled();
    fireEvent.click(screen.getByLabelText('print()'));
    expect(submitButton()).toBeEnabled();
  });

  it('hands the chosen option indexes to onComplete for the server to grade', () => {
    const onComplete = vi.fn();
    render(<QuizExercise exercise={exercise} onComplete={onComplete} />);

    fireEvent.click(screen.getByLabelText('#'));
    fireEvent.click(screen.getByLabelText('echo()'));
    fireEvent.click(submitButton());

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(0, { totalItems: 2 }, { selections: [1, 0] });
  });

  it('submits what has been answered when time runs out', () => {
    const onComplete = vi.fn();
    const { rerender } = render(<QuizExercise exercise={exercise} onComplete={onComplete} />);

    fireEvent.click(screen.getByLabelText('#'));
    rerender(<QuizExercise exercise={exercise} onComplete={onComplete} isTimeUp />);

    expect(onComplete).toHaveBeenCalledWith(0, { totalItems: 2 }, { selections: [1, null] });
  });
});
