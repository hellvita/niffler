import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { format } from 'date-fns';
import { DateNavigator } from '@/components/shared/DateNavigator';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('DateNavigator', () => {
  beforeEach(() => mockPush.mockClear());

  it('renders the formatted date string for the passed prop', () => {
    render(<DateNavigator date="2026-05-14" />);
    expect(screen.getByText('Thursday, May 14, 2026')).toBeInTheDocument();
  });

  it('calls router.push with the previous date when the back arrow is clicked', async () => {
    render(<DateNavigator date="2026-05-14" />);
    await userEvent.click(screen.getByRole('button', { name: /previous day/i }));
    expect(mockPush).toHaveBeenCalledWith('/day/2026-05-13');
  });

  it('calls router.push with the next date when the forward arrow is clicked', async () => {
    render(<DateNavigator date="2026-05-14" />);
    await userEvent.click(screen.getByRole('button', { name: /next day/i }));
    expect(mockPush).toHaveBeenCalledWith('/day/2026-05-15');
  });

  it('calls router.push with today\'s date when the Today button is clicked', async () => {
    render(<DateNavigator date="2026-05-14" />);
    await userEvent.click(screen.getByRole('button', { name: /today/i }));
    const today = format(new Date(), 'yyyy-MM-dd');
    expect(mockPush).toHaveBeenCalledWith(`/day/${today}`);
  });
});
