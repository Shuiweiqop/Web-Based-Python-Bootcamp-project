import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SortingExercise from './SortingExercise';

// Content as the server sends it: shuffled, opaque ids, no correctOrder.
const exercise = {
  title: 'Debug loop',
  content: {
    instruction: 'Put the steps in order',
    items: [
      { id: 'sa', text: 'Run it' },
      { id: 'sb', text: 'Write the code' },
      { id: 'sc', text: 'Fix the bug' },
    ],
  },
};

describe('SortingExercise', () => {
  // Keep the component's own shuffle out of the way: Math.random() = 0.999
  // makes every Fisher-Yates swap a no-op, so items show in the given order.
  beforeEach(() => vi.spyOn(Math, 'random').mockReturnValue(0.999));
  afterEach(() => vi.restoreAllMocks());

  it('hands the order the student settled on to onComplete', () => {
    const onComplete = vi.fn();
    render(<SortingExercise exercise={exercise} onComplete={onComplete} />);

    fireEvent.click(screen.getByLabelText('Move Write the code up'));
    fireEvent.click(screen.getByRole('button', { name: 'Submit Order' }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(0, { totalItems: 3 }, { order: ['sb', 'sa', 'sc'] });
  });

  it('locks the list once submitted', () => {
    render(<SortingExercise exercise={exercise} onComplete={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit Order' }));

    expect(screen.queryByRole('button', { name: 'Submit Order' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Move Run it down')).not.toBeInTheDocument();
  });

  it('submits the current order when time runs out', () => {
    const onComplete = vi.fn();
    const { rerender } = render(<SortingExercise exercise={exercise} onComplete={onComplete} />);

    rerender(<SortingExercise exercise={exercise} onComplete={onComplete} isTimeUp />);

    expect(onComplete).toHaveBeenCalledWith(0, { totalItems: 3 }, { order: ['sa', 'sb', 'sc'] });
  });
});
