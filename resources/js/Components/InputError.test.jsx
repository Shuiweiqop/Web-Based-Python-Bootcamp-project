import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import InputError from './InputError';

describe('InputError', () => {
  it('renders nothing when there is no message', () => {
    const { container } = render(<InputError message={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the message when present', () => {
    render(<InputError message="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('appends a custom className while keeping the base styles', () => {
    render(<InputError message="oops" className="mt-2" data-testid="err" />);
    const el = screen.getByTestId('err');
    expect(el).toHaveClass('text-red-600');
    expect(el).toHaveClass('mt-2');
  });
});
