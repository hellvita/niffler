import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders the message prop', () => {
    render(
      <ConfirmDialog
        message="Are you sure you want to archive this category?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('Are you sure you want to archive this category?')).toBeInTheDocument();
  });

  it('does NOT call onConfirm when Cancel is clicked', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmDialog message="Confirm?" onConfirm={onConfirm} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog message="Confirm?" onConfirm={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onConfirm exactly once when Confirm is clicked', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog message="Confirm?" onConfirm={onConfirm} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('does NOT call onCancel when Confirm is clicked', async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog message="Confirm?" onConfirm={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(onCancel).not.toHaveBeenCalled();
  });
});
