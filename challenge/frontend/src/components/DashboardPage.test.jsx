import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import DashboardPage from './DashboardPage';

/* Mocks */
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('DashboardPage', () => {
  let history;

  beforeEach(() => {
    history = createMemoryHistory();
    mockFetch.mockClear();
    mockSessionStorage.getItem.mockImplementation(() => 'fake-token');
  });

  const renderWithRouter = component => {
    return render(<Router history={history}>{component}</Router>);
  };

  const mockComplaints = [
    {
      unique_key: '1',
      complaint_type: 'Aging',
      descriptor: 'Senior Centers',
      borough: 'Brooklyn',
      opendate: '2024-01-01',
      closedate: '2024-01-15', // Closed case: has both dates
    },
    {
      unique_key: '2',
      complaint_type: 'Health',
      descriptor: 'Rats/Rodents',
      borough: 'Manhattan',
      opendate: '2024-01-01',
      closedate: null, // Open case: has open date but no close date
    },
    {
      unique_key: '3',
      complaint_type: 'Noise',
      descriptor: 'Loud Music',
      borough: 'Queens',
      opendate: null,
      closedate: null, // Neither open nor closed: no dates
    },
    {
      unique_key: '4',
      complaint_type: 'Traffic',
      descriptor: 'Signal',
      borough: 'Bronx',
      opendate: null,
      closedate: '2024-01-20', // Closed case: has close date but no open date
    },
  ];

  it('redirects to login if no token present', async () => {
    mockSessionStorage.getItem.mockImplementationOnce(() => null);
    renderWithRouter(<DashboardPage />);

    await waitFor(() => {
      expect(history.location.pathname).toBe('/');
    });
  });

  it('renders loading state initially', () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {}));
    renderWithRouter(<DashboardPage />);
    expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument();
  });

  it('renders dashboard with all statistics and complaints data', async () => {
    mockFetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockComplaints),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockComplaints[1]]), // Only the case with opendate and no closedate
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockComplaints[0], mockComplaints[3]]), // Cases with closedate
        })
      );

    renderWithRouter(<DashboardPage />);

    await waitFor(() => {
      // Check header and stats
      expect(screen.getByText('District Complaints Dashboard')).toBeInTheDocument();

      const totalComplaints = screen.getByText('Total Complaints').nextSibling;
      const openCases = screen.getByText('Open Cases').nextSibling;
      const closedCases = screen.getByText('Closed Cases').nextSibling;

      expect(totalComplaints).toHaveTextContent('4');
      expect(openCases).toHaveTextContent('1');
      expect(closedCases).toHaveTextContent('2');

      // Check complaint table data
      expect(screen.getByText('Aging')).toBeInTheDocument();
      expect(screen.getByText('Brooklyn')).toBeInTheDocument();
      expect(screen.getByText('Senior Centers')).toBeInTheDocument();
    });
  });

  it('makes API calls with correct auth headers', async () => {
    mockFetch
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));

    renderWithRouter(<DashboardPage />);

    await waitFor(() => {
      const expectedHeaders = {
        headers: {
          Authorization: 'Token fake-token',
          'Content-Type': 'application/json',
        },
      };

      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        'http://localhost:8000/api/complaints/allComplaints/',
        expectedHeaders
      );

      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        'http://localhost:8000/api/complaints/openCases/',
        expectedHeaders
      );

      expect(mockFetch).toHaveBeenNthCalledWith(
        3,
        'http://localhost:8000/api/complaints/closedCases/',
        expectedHeaders
      );
    });
  });

  it('displays error message when any API call fails', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    renderWithRouter(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch dashboard data')).toBeInTheDocument();
    });
  });

  it('handles network errors', async () => {
    mockFetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
    renderWithRouter(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('displays correct counts when endpoints return empty arrays', async () => {
    mockFetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      );

    renderWithRouter(<DashboardPage />);

    await waitFor(() => {
      const totalComplaints = screen.getByText('Total Complaints').nextSibling;
      const openCases = screen.getByText('Open Cases').nextSibling;
      const closedCases = screen.getByText('Closed Cases').nextSibling;

      expect(totalComplaints).toHaveTextContent('0');
      expect(openCases).toHaveTextContent('0');
      expect(closedCases).toHaveTextContent('0');
    });
  });

  it('handles edge cases for dates correctly', async () => {
    const edgeCaseComplaints = [
      {
        unique_key: '1',
        complaint_type: 'Other',
        descriptor: 'Test',
        borough: 'Manhattan',
        opendate: null,
        closedate: null,
      },
      {
        unique_key: '2',
        complaint_type: 'Other',
        descriptor: 'Test 2',
        borough: 'Manhattan',
        opendate: null,
        closedate: '2024-01-01',
      },
    ];

    mockFetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(edgeCaseComplaints),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]), // Should be empty (no cases with opendate and no closedate)
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([edgeCaseComplaints[1]]), // One closed case
        })
      );

    renderWithRouter(<DashboardPage />);

    await waitFor(() => {
      const totalComplaints = screen.getByText('Total Complaints').nextSibling;
      const openCases = screen.getByText('Open Cases').nextSibling;
      const closedCases = screen.getByText('Closed Cases').nextSibling;

      expect(totalComplaints).toHaveTextContent('2');
      expect(openCases).toHaveTextContent('0'); // No cases with opendate and no closedate
      expect(closedCases).toHaveTextContent('1'); // One case with closedate
    });
  });
});
