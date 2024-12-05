import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import DashboardPage from './DashboardPage';

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
      closedate: '2024-01-15',
    },
    {
      unique_key: '2',
      complaint_type: 'Health',
      descriptor: 'Rats/Rodents',
      borough: 'Manhattan',
      opendate: '2024-01-01',
      closedate: null,
    },
    {
      unique_key: '3',
      complaint_type: 'Noise',
      descriptor: 'Loud Music',
      borough: 'Queens',
      opendate: null,
      closedate: null,
    },
    {
      unique_key: '4',
      complaint_type: 'Traffic',
      descriptor: 'Signal',
      borough: 'Bronx',
      opendate: null,
      closedate: '2024-01-20',
    },
  ];

  const mockTopComplaints = [
    { complaint_type: 'Housing and Buildings', count: 6 },
    { complaint_type: 'Transportation', count: 5 },
    { complaint_type: 'Aging', count: 3 },
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

  it('renders dashboard with correct statistics and table data', async () => {
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
          json: () => Promise.resolve([mockComplaints[1]]),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockComplaints[0], mockComplaints[3]]),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTopComplaints),
        })
      );

    renderWithRouter(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard data...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('District Complaints Dashboard')).toBeInTheDocument();

    const totalComplaints = screen.getByText('Total Complaints').nextSibling;
    const openCases = screen.getByText('Open Cases').nextSibling;
    const closedCases = screen.getByText('Closed Cases').nextSibling;

    expect(totalComplaints).toHaveTextContent('4');
    expect(openCases).toHaveTextContent('1');
    expect(closedCases).toHaveTextContent('2');

    const topComplaintsSection = screen.getByText('Top Complaint Types').closest('.stat-card');
    within(topComplaintsSection).getByText('Housing and Buildings');
    within(topComplaintsSection).getByText('(6)');
    within(topComplaintsSection).getByText('Transportation');
    within(topComplaintsSection).getByText('(5)');
    within(topComplaintsSection).getByText('Aging');
    within(topComplaintsSection).getByText('(3)');

    const tableElement = screen.getByRole('table');
    within(tableElement).getByText('Type');
    within(tableElement).getByText('Description');
    within(tableElement).getByText('Borough');

    const rows = within(tableElement).getAllByRole('row');
    const firstRowCells = within(rows[1]).getAllByRole('cell');
    expect(firstRowCells[0]).toHaveTextContent('Aging');
    expect(firstRowCells[1]).toHaveTextContent('Senior Centers');
    expect(firstRowCells[3]).toHaveTextContent('Brooklyn');
  });

  it('makes API calls with correct auth headers', async () => {
    mockFetch
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }))
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

      expect(mockFetch).toHaveBeenNthCalledWith(
        4,
        'http://localhost:8000/api/complaints/topComplaints/',
        expectedHeaders
      );
    });
  });

  it('displays error message when any API call fails', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: 'Server error' }),
      })
    );

    renderWithRouter(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch some dashboard data')).toBeInTheDocument();
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

  it('handles empty top complaints gracefully', async () => {
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
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      );

    renderWithRouter(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Top Complaint Types')).toBeInTheDocument();
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
          json: () => Promise.resolve([]),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([edgeCaseComplaints[1]]),
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

      expect(totalComplaints).toHaveTextContent('2');
      expect(openCases).toHaveTextContent('0');
      expect(closedCases).toHaveTextContent('1');
    });
  });
});
