import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import QuizConfig, { questionProblems } from './QuizConfig';

// Hosts the config the way ExerciseForm does, exposing the saved content.
let saved;
function Host({ content }) {
  const [data, setDataState] = useState({ content });
  const setData = (key, value) => {
    saved = value;
    setDataState((prev) => ({ ...prev, [key]: value }));
  };
  return <QuizConfig data={data} setData={setData} errors={{}} />;
}

describe('QuizConfig', () => {
  it('builds a question with its options and the correct one marked', () => {
    render(<Host content={{ questions: [{ question: '', options: ['', ''], correct: 0 }] }} />);

    fireEvent.change(screen.getByLabelText('Question'), { target: { value: 'Comment character?' } });
    fireEvent.change(screen.getByLabelText('Question 1: option 1'), { target: { value: '//' } });
    fireEvent.change(screen.getByLabelText('Question 1: option 2'), { target: { value: '#' } });
    fireEvent.click(screen.getByLabelText('Question 1: option 2 is correct'));
    fireEvent.change(screen.getByLabelText(/Explanation/), { target: { value: 'Python uses #.' } });

    expect(saved.questions).toHaveLength(1);
    expect(saved.questions[0]).toMatchObject({
      question: 'Comment character?',
      options: ['//', '#'],
      correct: 1,
      explanation: 'Python uses #.',
    });
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('keeps the correct answer on the same option when another is removed', () => {
    render(<Host content={{ questions: [{ question: 'Q?', options: ['a', 'b', 'c'], correct: 2 }] }} />);

    fireEvent.click(screen.getByLabelText('Remove option 1 from question 1'));

    expect(saved.questions[0].options).toEqual(['b', 'c']);
    expect(saved.questions[0].correct).toBe(1);
  });

  it('adds and removes questions, keeping at least one', () => {
    render(<Host content={{ questions: [{ question: 'Q?', options: ['a', 'b'], correct: 0 }] }} />);

    expect(screen.getByLabelText('Remove question 1')).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /Add question/ }));
    expect(saved.questions).toHaveLength(2);
    fireEvent.click(screen.getByLabelText('Remove question 1'));
    expect(saved.questions).toHaveLength(1);
  });

  it('flags a question that could not be graded', () => {
    expect(questionProblems({ question: '', options: ['a', ''], correct: 5 })).toEqual([
      'needs a question',
      'has an empty option',
      'has no correct option',
    ]);
    expect(questionProblems({ question: 'Q?', options: ['a', 'b'], correct: 0 })).toEqual([]);

    render(<Host content={{ questions: [{ question: 'Q?', options: ['a', ''], correct: 0 }] }} />);
    expect(screen.getByRole('status')).toHaveTextContent("1 question can't be graded yet");
  });
});
