import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/src/test/msw/server';
import { renderWithProviders } from '@/src/test/utils/render';
import { AddCategoryInline } from '@/components/day/AddCategoryInline';

describe('AddCategoryInline', () => {
  it('initially renders only a "+" button with no text input visible', () => {
    renderWithProviders(<AddCategoryInline />);
    expect(screen.getByRole('button', { name: /add category/i })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/category name/i)).not.toBeInTheDocument();
  });

  it('shows a focused text input after clicking the "+" button', async () => {
    renderWithProviders(<AddCategoryInline />);
    await userEvent.click(screen.getByRole('button', { name: /add category/i }));
    const input = screen.getByPlaceholderText(/category name/i);
    expect(input).toBeInTheDocument();
  });

  it('calls POST /api/proxy/categories and clears the input on success', async () => {
    let capturedBody: unknown;
    server.use(
      http.post('/api/proxy/categories', async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json(
          { id: 'cat-new', name: 'Dining', isArchived: false },
          { status: 201 }
        );
      })
    );

    renderWithProviders(<AddCategoryInline />);
    await userEvent.click(screen.getByRole('button', { name: /add category/i }));
    await userEvent.type(screen.getByPlaceholderText(/category name/i), 'Dining');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(capturedBody).toEqual({ name: 'Dining' });
    });
    // Input should be hidden after success
    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/category name/i)).not.toBeInTheDocument();
    });
  });

  it('shows "A category with this name already exists" error on 409', async () => {
    server.use(http.post('/api/proxy/categories', () => new HttpResponse(null, { status: 409 })));

    renderWithProviders(<AddCategoryInline />);
    await userEvent.click(screen.getByRole('button', { name: /add category/i }));
    await userEvent.type(screen.getByPlaceholderText(/category name/i), 'Groceries');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText(/a category with this name already exists/i)).toBeInTheDocument();
    });
  });

  it('hides the input and makes no network request when Escape is pressed', async () => {
    let requestMade = false;
    server.use(
      http.post('/api/proxy/categories', () => {
        requestMade = true;
        return HttpResponse.json({}, { status: 201 });
      })
    );

    renderWithProviders(<AddCategoryInline />);
    await userEvent.click(screen.getByRole('button', { name: /add category/i }));
    await userEvent.type(screen.getByPlaceholderText(/category name/i), 'Groceries');
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByPlaceholderText(/category name/i)).not.toBeInTheDocument();
    expect(requestMade).toBe(false);
  });
});
