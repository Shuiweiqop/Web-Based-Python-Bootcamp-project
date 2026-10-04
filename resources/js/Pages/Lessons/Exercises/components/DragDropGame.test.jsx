import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DragDropGame from './DragDropGame';

// Content as the server sends it: opaque item ids, no correct_zone.
const exercise = {
  max_score: 100,
  content: {
    instructions: 'Match each type to a value',
    items: [
      { id: 'da', text: 'int' },
      { id: 'db', text: 'str' },
    ],
    drop_zones: [
      { id: 'zone_1', name: '42', max_items: 1 },
      { id: 'zone_2', name: '"Hello"', max_items: 1 },
    ],
  },
};

const place = (itemText, zoneName) => {
  fireEvent.click(screen.getByLabelText(`Item ${itemText}`));
  fireEvent.click(screen.getByLabelText(`Zone ${zoneName}`));
};

describe('DragDropGame', () => {
  it('says nothing about right or wrong while placing', () => {
    render(<DragDropGame exercise={exercise} onComplete={vi.fn()} />);

    place('int', '"Hello"');

    expect(screen.queryByText(/correct|not quite|fits better/i)).not.toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('lets any placed item be taken back and moved', () => {
    const onComplete = vi.fn();
    render(<DragDropGame exercise={exercise} onComplete={onComplete} />);

    place('int', '"Hello"');
    fireEvent.click(screen.getByLabelText('Take int back'));
    place('int', '42');
    place('str', '"Hello"');
    fireEvent.click(screen.getByRole('button', { name: 'Submit Answer' }));

    expect(onComplete).toHaveBeenCalledWith(0, { totalItems: 2 }, { placements: { da: 'zone_1', db: 'zone_2' } });
  });

  it('keeps a full zone full', () => {
    render(<DragDropGame exercise={exercise} onComplete={vi.fn()} />);

    place('int', '42');
    place('str', '42');

    expect(screen.getByText(/42 is full/)).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('submits once, and what has been placed when time runs out', () => {
    const onComplete = vi.fn();
    const { rerender } = render(<DragDropGame exercise={exercise} onComplete={onComplete} />);

    place('str', '"Hello"');
    rerender(<DragDropGame exercise={exercise} onComplete={onComplete} isTimeUp />);
    rerender(<DragDropGame exercise={exercise} onComplete={onComplete} isTimeUp />);

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(0, { totalItems: 2 }, { placements: { db: 'zone_2' } });
  });
});
