import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse, delay } from 'msw';
import { server } from '@/src/test/msw/server';
import { renderWithProviders } from '@/src/test/utils/render';
import { CategoryExpenseRow } from '@/components/day/CategoryExpenseRow';

const DEFAULT_PROPS = {
  date: '2026-05-14',
  categoryId: 'cat-1',
  categoryName: 'Groceries',
  amount: 0,
};

describe('CategoryExpenseRow', () => {
  it('renders the category name and current amount as static text', () => {
    renderWithProviders(<CategoryExpenseRow {...DEFAULT_PROPS} amount={42.5} />);
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('42.50')).toBeInTheDocument();
  });

  it('renders a dash for zero amount', () => {
    renderWithProviders(<CategoryExpenseRow {...DEFAULT_PROPS} amount={0} />);
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows a focused text input pre-filled with the current value when amount is clicked', async () => {
    renderWithProviders(<CategoryExpenseRow {...DEFAULT_PROPS} amount={42.5} />);
    await userEvent.click(screen.getByText('42.50'));
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe('42.5');
  });

  it('sends PUT to /api/proxy/expenses/:date/:categoryId on Enter with a positive value', async () => {
    let capturedBody: unknown;
    server.use(
      http.put('/api/proxy/expenses/:date/:categoryId', async ({ request }) => {
        capturedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    renderWithProviders(<CategoryExpenseRow {...DEFAULT_PROPS} amount={0} />);
    await userEvent.click(screen.getByText('—'));
    await userEvent.clear(screen.getByRole('textbox'));
    await userEvent.type(screen.getByRole('textbox'), '99.99');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(capturedBody).toEqual({ amount: 99.99 });
    });
  });

  it('evaluates a math expression and sends the computed value to the API', async () => {
    let capturedBody: unknown;
    server.use(
      http.put('/api/proxy/expenses/:date/:categoryId', async ({ request }) => {
        capturedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    renderWithProviders(<CategoryExpenseRow {...DEFAULT_PROPS} amount={0} />);
    await userEvent.click(screen.getByText('—'));
    await userEvent.type(screen.getByRole('textbox'), '17+20');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(capturedBody).toEqual({ amount: 37 });
    });
  });

  it('shows an error for an incomplete expression', async () => {
    renderWithProviders(<CategoryExpenseRow {...DEFAULT_PROPS} amount={0} />);
    await userEvent.click(screen.getByText('—'));
    await userEvent.type(screen.getByRole('textbox'), '17+');
    await userEvent.keyboard('{Enter}');

    expect(screen.getByText('Invalid expression')).toBeInTheDocument();
  });

  it('ignores operators typed as the first character', async () => {
    renderWithProviders(<CategoryExpenseRow {...DEFAULT_PROPS} amount={0} />);
    await userEvent.click(screen.getByText('—'));
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '+');
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('sends DELETE to /api/proxy/expenses/:date/:categoryId when the field is cleared and Enter is pressed', async () => {
    let deleteWasCalled = false;
    server.use(
      http.delete('/api/proxy/expenses/:date/:categoryId', () => {
        deleteWasCalled = true;
        return new HttpResponse(null, { status: 204 });
      })
    );

    renderWithProviders(<CategoryExpenseRow {...DEFAULT_PROPS} amount={42.5} />);
    await userEvent.click(screen.getByText('42.50'));
    await userEvent.clear(screen.getByRole('textbox'));
    await userEvent.keyboard('{Enter}');

    await waitFor(() => expect(deleteWasCalled).toBe(true));
  });

  it('makes no network request and returns to static text when Escape is pressed', async () => {
    let requestMade = false;
    server.use(
      http.put('/api/proxy/expenses/:date/:categoryId', () => {
        requestMade = true;
        return new HttpResponse(null, { status: 204 });
      })
    );

    renderWithProviders(<CategoryExpenseRow {...DEFAULT_PROPS} amount={10} />);
    await userEvent.click(screen.getByText('10.00'));
    await userEvent.clear(screen.getByRole('textbox'));
    await userEvent.type(screen.getByRole('textbox'), '99');
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(requestMade).toBe(false);
  });

  it('disables the input while the mutation is pending', async () => {
    server.use(
      http.put('/api/proxy/expenses/:date/:categoryId', async () => {
        await delay('infinite');
        return new HttpResponse(null, { status: 204 });
      })
    );

    renderWithProviders(<CategoryExpenseRow {...DEFAULT_PROPS} amount={0} />);
    await userEvent.click(screen.getByText('—'));
    await userEvent.type(screen.getByRole('textbox'), '25');

    const input = screen.getByRole('textbox');
    // trigger blur to start mutation
    input.blur();

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });
});
