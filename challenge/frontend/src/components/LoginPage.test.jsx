import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import LoginPage from './LoginPage';

/* Mocks */
global.fetch = jest.fn();

const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});

describe('LoginPage', () => {
  let history;

  beforeEach(() => {
    history = createMemoryHistory();
    fetch.mockClear();
    mockSessionStorage.clear.mockClear();
    mockSessionStorage.setItem.mockClear();
  });

  const renderWithRouter = (component) => {
    return render(
      <Router history={history}>
        {component}
      </Router>
    );
  };

  it('renders login form elements', () => {
    renderWithRouter(<LoginPage />);
    
    expect(screen.getByText('NYC Council Dashboard')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles input changes', () => {
    renderWithRouter(<LoginPage />);
    
    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    fireEvent.change(usernameInput, { target: { value: 'jdoe' } });
    fireEvent.change(passwordInput, { target: { value: 'doe-1' } });

    expect(usernameInput.value).toBe('jdoe');
    expect(passwordInput.value).toBe('doe-1');
  });

  it('handles successful login', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'fake-token' })
      })
    );

    renderWithRouter(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'jdoe' }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'doe-1' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
      expect(history.location.pathname).toBe('/dashboard');
    });
  });

  it('displays error message on failed login', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ detail: 'Invalid credentials' })
      })
    );

    renderWithRouter(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'wrong' }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'wrong' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('shows loading state during login attempt', async () => {
    fetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => 
        resolve({
          ok: true,
          json: () => Promise.resolve({ token: 'fake-token' })
        }), 100)
      )
    );

    renderWithRouter(<LoginPage />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });

  it('handles network errors', async () => {
    fetch.mockImplementationOnce(() => Promise.reject('Network error'));

    renderWithRouter(<LoginPage />);

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/unable to connect/i)).toBeInTheDocument();
    });
  });
});