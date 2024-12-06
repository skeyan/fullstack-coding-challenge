import React from 'react';
import { render, screen, within } from '@testing-library/react';
import StatsSection from './StatsSection';

describe('StatsSection', () => {
  const defaultProps = {
    totalComplaints: 150,
    openCases: 75,
    closedCases: 25,
    topThreeTypes: [
      { complaint_type: 'Housing and Buildings', count: 50 },
      { complaint_type: 'Transportation', count: 30 },
      { complaint_type: 'Aging', count: 20 },
    ],
  };

  it('renders all stat cards with correct values', () => {
    render(<StatsSection {...defaultProps} />);

    const totalComplaints = screen.getByText('Total Complaints').nextSibling;
    const openCases = screen.getByText('Open Cases').nextSibling;
    const closedCases = screen.getByText('Closed Cases').nextSibling;

    expect(totalComplaints).toHaveTextContent('150');
    expect(openCases).toHaveTextContent('75');
    expect(closedCases).toHaveTextContent('25');
  });

  it('renders top complaints with correct order and counts', () => {
    render(<StatsSection {...defaultProps} />);

    const complaintItems = screen.getAllByText(/Housing and Buildings|Transportation|Aging/);
    const counts = screen.getAllByText(/\(\d+\)/);

    expect(complaintItems[0]).toHaveTextContent('Housing and Buildings');
    expect(counts[0]).toHaveTextContent('(50)');
    expect(complaintItems[1]).toHaveTextContent('Transportation');
    expect(counts[1]).toHaveTextContent('(30)');
    expect(complaintItems[2]).toHaveTextContent('Aging');
    expect(counts[2]).toHaveTextContent('(20)');
  });

  it('handles zero values correctly', () => {
    const propsWithZeros = {
      totalComplaints: 0,
      openCases: 0,
      closedCases: 0,
      topThreeTypes: [],
    };

    render(<StatsSection {...propsWithZeros} />);

    const totalComplaints = screen.getByText('Total Complaints').nextSibling;
    const openCases = screen.getByText('Open Cases').nextSibling;
    const closedCases = screen.getByText('Closed Cases').nextSibling;

    expect(totalComplaints).toHaveTextContent('0');
    expect(openCases).toHaveTextContent('0');
    expect(closedCases).toHaveTextContent('0');
  });

  it('handles large numbers correctly', () => {
    const propsWithLargeNumbers = {
      ...defaultProps,
      totalComplaints: 1000000,
      openCases: 500000,
      closedCases: 500000,
    };

    render(<StatsSection {...propsWithLargeNumbers} />);

    const totalComplaints = screen.getByText('Total Complaints').nextSibling;
    const openCases = screen.getByText('Open Cases').nextSibling;
    const closedCases = screen.getByText('Closed Cases').nextSibling;

    expect(totalComplaints).toHaveTextContent('1000000');
    expect(openCases).toHaveTextContent('500000');
    expect(closedCases).toHaveTextContent('500000');
  });
});
