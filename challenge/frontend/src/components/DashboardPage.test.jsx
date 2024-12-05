import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import DashboardPage from './DashboardPage';

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

describe('DashboardPage', () => {
  let history;

  beforeEach(() => {
    history = createMemoryHistory();
    fetch.mockClear();
    mockSessionStorage.getItem.mockImplementation(() => 'fake-token');
  });

  const renderWithRouter = (component) => {
    return render(
      <Router history={history}>
        {component}
      </Router>
    );
  };

  const mockComplaints = [
    {
      unique_key: '1',
      complaint_type: 'Aging',
      descriptor: 'Senior Centers',
      borough: 'Brooklyn',
      closedate: '2024-01-01'
    },
    {
      unique_key: '2',
      complaint_type: 'Health',
      descriptor: 'Rats/Rodents',
      borough: 'Manhattan',
      closedate: null
    }
  ];

  it('redirects to login if no token present', async () => {
    mockSessionStorage.getItem.mockImplementationOnce(() => null);
    renderWithRouter(<DashboardPage />);

    await waitFor(() => {
      expect(history.location.pathname).toBe('/');
    });
  });

  it('renders loading state initially', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    renderWithRouter(<DashboardPage />);
    expect(screen.getByText('Loading complaints...')).toBeInTheDocument();
  });

  it('renders dashboard with complaints data', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockComplaints)
      })
    );

    renderWithRouter(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('District Complaints Dashboard')).toBeInTheDocument();
      expect(screen.getByText('All District Complaints')).toBeInTheDocument();
      expect(screen.getByText(`Total Complaints: ${mockComplaints.length}`)).toBeInTheDocument();
      expect(screen.getByText('Aging')).toBeInTheDocument();
      expect(screen.getByText('Brooklyn')).toBeInTheDocument();
      expect(screen.getByText('Senior Centers')).toBeInTheDocument();
    });
  });

  it('makes API call with correct auth header', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockComplaints)
      })
    );

    renderWithRouter(<DashboardPage />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/complaints/allComplaints/',
        expect.objectContaining({
          headers: {
            'Authorization': 'Token fake-token',
            'Content-Type': 'application/json',
          },
        })
      );
    });
  });

  it('displays error message when API call fails', async () => {
    const errorMessage = 'Failed to fetch complaints';
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500
      })
    );

    renderWithRouter(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('handles network errors', async () => {
    fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

    renderWithRouter(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});