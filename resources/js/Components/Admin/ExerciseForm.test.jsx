import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ExerciseForm from './ExerciseForm';

// A stand-in for Inertia's useForm: real state, and post/put spies that
// capture what would be sent.
const sent = vi.hoisted(() => ({ calls: [] }));

vi.mock('@inertiajs/react', () => ({
  Link: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
  useForm: (initial) => {
    const [data, setDataState] = useState(initial);
    const setData = (key, value) =>
      setDataState((prev) => (typeof key === 'string' ? { ...prev, [key]: value } : key));
    return {
      data,
      setData,
      errors: {},
      processing: false,
      post: (url) => sent.calls.push({ method: 'post', url, data }),
      put: (url) => sent.calls.push({ method: 'put', url, data }),
    };
  },
}));

const solutionBox = () => screen.getByPlaceholderText(/students won't see this/);
const submit = (label) => fireEvent.click(screen.getByRole('button', { name: label }));

const codingExercise = {
  exercise_id: 7,
  lesson_id: 3,
  title: 'Double it',
  exercise_type: 'coding',
  max_score: 100,
  is_active: true,
  enable_live_editor: true,
  content: '{}',
  starter_code: '',
  solution: 'print(int(input()) * 2)',
  test_cases: [{ input: '2', expected: '4' }],
};

describe('ExerciseForm', () => {
  beforeEach(() => {
    sent.calls = [];
  });

  it('shows the saved reference solution when editing', () => {
    render(<ExerciseForm exercise={codingExercise} submitUrl="/update" method="put" cancelHref="/back" />);

    expect(solutionBox()).toHaveValue('print(int(input()) * 2)');
  });

  it('sends the reference solution as `solution`, the column the server saves', () => {
    render(<ExerciseForm lesson={{ lesson_id: 3, title: 'L' }} submitUrl="/store" method="post" cancelHref="/back" />);

    fireEvent.change(screen.getByPlaceholderText(/Python Variables Practice/), { target: { value: 'Answer' } });
    fireEvent.click(screen.getByRole('button', { name: /Coding Challenge/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Enable Live Python Editor/ }));
    fireEvent.change(solutionBox(), { target: { value: 'print(42)' } });
    submit(/Create Exercise/);

    expect(sent.calls).toHaveLength(1);
    expect(sent.calls[0]).toMatchObject({ method: 'post', url: '/store' });
    expect(sent.calls[0].data.solution).toBe('print(42)');
    expect(sent.calls[0].data).not.toHaveProperty('solution_code');
  });

  it('only sends fields the exercise requests accept', () => {
    render(<ExerciseForm exercise={codingExercise} submitUrl="/update" method="put" cancelHref="/back" />);

    submit(/Save Changes/);

    expect(sent.calls[0]).toMatchObject({ method: 'put', url: '/update' });
    expect(Object.keys(sent.calls[0].data).sort()).toEqual([
      'coding_instructions',
      'content',
      'description',
      'difficulty',
      'enable_live_editor',
      'exercise_type',
      'is_active',
      'lesson_id',
      'max_score',
      'solution',
      'starter_code',
      'test_cases',
      'time_limit_sec',
      'title',
    ]);
  });

  it('locks the type when editing and offers the type picker when creating', () => {
    const { unmount } = render(
      <ExerciseForm exercise={codingExercise} submitUrl="/update" method="put" cancelHref="/back" />
    );
    expect(screen.getByText('Exercise Type (Read-only)')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Coding Challenge/ })).not.toBeInTheDocument();
    unmount();

    render(<ExerciseForm lessons={[{ lesson_id: 3, title: 'Loops' }]} submitUrl="/store" cancelHref="/back" />);
    expect(screen.getByText('Choose Exercise Type')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Loops' })).toBeInTheDocument();
  });
});
