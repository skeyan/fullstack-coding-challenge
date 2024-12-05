/**
 * @fileoverview Dashboard component with clear sections and minimal table enhancements
 * @module components/DashboardPage
 */
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import ComplaintTable from './ComplaintTable';
import './../styles/DashboardPage.css';

/**
 * Dashboard component displays complaints data for the logged-in council member's district.
 * Fetches and displays tabular data of all complaints with their details.
 * Requires authentication token in sessionStorage to access data.
 *
 * @todo Add top cases
 *
 * @example
 * <Route path="/dashboard" component={Dashboard} />
 */
const DashboardPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [openCases, setOpenCases] = useState(0);
  const [closedCases, setClosedCases] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const history = useHistory();

  useEffect(() => {
    /**
     * Fetches all required data for the dashboard
     * Redirects to login if no authentication token is found
     *
     * @async
     * @function fetchDashboardData
     * @throws {Error} When API calls fail or return non-OK response
     */
    const fetchDashboardData = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        history.push('/');
        return;
      }

      const headers = {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      };

      try {
        // Fetch all data in parallel
        const [complaintsResponse, openResponse, closedResponse] = await Promise.all([
          fetch('http://localhost:8000/api/complaints/allComplaints/', { headers }),
          fetch('http://localhost:8000/api/complaints/openCases/', { headers }),
          fetch('http://localhost:8000/api/complaints/closedCases/', { headers }),
        ]);

        // Check if any request failed
        if (!complaintsResponse.ok || !openResponse.ok || !closedResponse.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        // Parse all responses
        const [complaintsData, openData, closedData] = await Promise.all([
          complaintsResponse.json(),
          openResponse.json(),
          closedResponse.json(),
        ]);

        setComplaints(complaintsData);
        setOpenCases(openData.length);
        setClosedCases(closedData.length);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [history]);

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-main">
          <p>Loading dashboard data...</p>
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

        <section className="dashboard-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Complaints</h4>
              <p className="stat-number">{complaints.length}</p>
            </div>
            <div className="stat-card">
              <h4>Open Cases</h4>
              <p className="stat-number">{openCases}</p>
            </div>
            <div className="stat-card">
              <h4>Closed Cases</h4>
              <p className="stat-number">{closedCases}</p>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">All District Complaints</h3>
          </div>

          <div className="complaint-table-wrapper">
            <ComplaintTable complaints={complaints} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
