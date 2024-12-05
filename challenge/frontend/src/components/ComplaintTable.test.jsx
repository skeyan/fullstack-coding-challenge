import React from 'react';
import { render, screen } from '@testing-library/react';
import ComplaintTable, { COMPLAINT_TABLE_COLUMNS } from './ComplaintTable';

describe('ComplaintTable', () => {
  /* Mocks */
  const mockComplaints = [
    {
      unique_key: '1',
      complaint_type: 'Aging',
      descriptor: 'Senior Centers',
      borough: 'Brooklyn',
      city: 'New York',
      zip: '11201',
      council_dist: 'NYCC01',
      community_board: '301',
      opendate: '2024-01-01',
      closedate: '2024-01-02',
    },
    {
      unique_key: '2',
      complaint_type: 'Health',
      descriptor: 'Rats/Rodents',
      borough: 'Manhattan',
      city: 'New York',
      zip: '10001',
      council_dist: 'NYCC02',
      community_board: '102',
      opendate: '2024-01-01',
      closedate: null,
    },
  ];

  it('renders all column headers', () => {
    render(<ComplaintTable complaints={mockComplaints} />);

    COMPLAINT_TABLE_COLUMNS.forEach(column => {
      expect(screen.getByText(column.header)).toBeInTheDocument();
    });
  });

  it('renders complaint data correctly', () => {
    render(<ComplaintTable complaints={mockComplaints} />);

    expect(screen.getByText('Aging')).toBeInTheDocument();
    expect(screen.getByText('Senior Centers')).toBeInTheDocument();
    expect(screen.getByText('Brooklyn')).toBeInTheDocument();
  });

  it('formats closedate correctly', () => {
    render(<ComplaintTable complaints={mockComplaints} />);

    expect(screen.getByText('2024-01-02')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('handles empty complaints array', () => {
    render(<ComplaintTable complaints={[]} />);

    COMPLAINT_TABLE_COLUMNS.forEach(column => {
      expect(screen.getByText(column.header)).toBeInTheDocument();
    });
  });
});
