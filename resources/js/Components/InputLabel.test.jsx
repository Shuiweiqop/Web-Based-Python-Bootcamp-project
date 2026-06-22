import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import InputLabel from './InputLabel';

describe('InputLabel', () => {
  it('prefers the value prop over children', () => {
    render(<InputLabel value="Email">fallback</InputLabel>);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.queryByText('fallback')).not.toBeInTheDocument();
  });

  it('falls back to children when no value is given', () => {
    render(<InputLabel>Password</InputLabel>);
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it('forwards htmlFor and extra props to the label', () => {
    render(<InputLabel value="Name" htmlFor="name" data-testid="label" />);
    expect(screen.getByTestId('label')).toHaveAttribute('for', 'name');
  });
});
