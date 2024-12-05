/**
 * @fileoverview Dashboard component with clear sections and minimal table enhancements
 * @module components/DashboardPage
 */
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './../styles/DashboardPage.css';

/**
 * Dashboard component displays complaints data for the logged-in council member's district.
 * Fetches and displays tabular data of all complaints with their details.
 * Requires authentication token in sessionStorage to access data.
 * 
 * @todo Add num closed complaints, num open complaints, top type of complaints in their district
 * 
 * @example
 * <Route path="/dashboard" component={Dashboard} />
 */
const DashboardPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const history = useHistory();

  /**
   * Configuration for complaint table columns
   * @typedef {Object} TableColumn
   * @property {string} key - The key to access the data in complaint object
   * @property {string} header - Display text for the column header
   * @property {Function} [formatter] - Optional function to format the cell value
   */

  /**
   * Defines the structure and formatting of the complaints table
   * @type {TableColumn[]}
   */
  const DASHBOARD_TABLE_COLUMNS = [
    { key: 'complaint_type', header: 'Type' },
    { key: 'descriptor', header: 'Description' },
    { key: 'zip', header: 'Zipcode' },
    { key: 'borough', header: 'Borough' },
    { key: 'city', header: 'City' },
    { key: 'council_dist', header: 'Council District' },
    { key: 'community_board', header: 'Community Board' },
    { key: 'opendate', header: 'Open Date' },
    { key: 'closedate', header: 'Close Date', formatter: (value) => value || 'Open' }
  ];

  useEffect(() => {
    /**
     * Fetches complaints data for the authenticated user's district
     * Redirects to login if no authentication token is found
     * 
     * @async
     * @function fetchComplaints
     * @throws {Error} When API call fails or returns non-OK response
     */
    const fetchComplaints = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        history.push('/');
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/api/complaints/allComplaints/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch complaints');
        }

        const data = await response.json();
        setComplaints(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, [history]);

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-main">
          <p>Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h2 className="dashboard-title">District Complaints Dashboard</h2>
        </div>

        {error && <div className="dashboard-error">{error}</div>}

        <section className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">All District Complaints</h3>
            <p className="complaint-count">Total Complaints: {complaints.length}</p>
          </div>
          
          <div className="complaint-table-wrapper">
          <table className="complaint-table">
            <thead>
                <tr>
                    {DASHBOARD_TABLE_COLUMNS.map(column => (
                        <th key={column.key}>{column.header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {complaints.map((complaint) => (
                <tr key={complaint.unique_key}>
                    {DASHBOARD_TABLE_COLUMNS.map(column => (
                    <td key={column.key}>
                        {column.formatter 
                        ? column.formatter(complaint[column.key])
                        : complaint[column.key]}
                    </td>
                    ))}
                </tr>
                ))}
            </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;