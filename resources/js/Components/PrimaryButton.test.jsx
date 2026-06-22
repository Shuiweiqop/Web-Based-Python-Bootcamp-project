import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PrimaryButton from './PrimaryButton';

describe('PrimaryButton', () => {
  it('renders its children', () => {
    render(<PrimaryButton>Save</PrimaryButton>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('fires onClick when enabled', () => {
    const onClick = vi.fn();
    render(<PrimaryButton onClick={onClick}>Go</PrimaryButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('reflects the disabled prop and dims the button', () => {
    render(<PrimaryButton disabled>Go</PrimaryButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-25');
  });
});
