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
 * @example
 * <Route path="/dashboard" component={Dashboard} />
 */
const DashboardPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [openCases, setOpenCases] = useState(0);
  const [closedCases, setClosedCases] = useState(0);
  const [topThreeTypes, setTopThreeTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConstituents, setShowConstituents] = useState(false);
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
        setIsLoading(true);

        // Add constituent parameter to endpoints when in constituent view
        const constituentParam = showConstituents ? '?constituent=true' : '';

        // Fetch all data in parallel
        const [complaintsResponse, openResponse, closedResponse, topResponse] = await Promise.all([
          fetch(`http://localhost:8000/api/complaints/allComplaints/${constituentParam}`, {
            headers,
          }),
          fetch(`http://localhost:8000/api/complaints/openCases/${constituentParam}`, { headers }),
          fetch(`http://localhost:8000/api/complaints/closedCases/${constituentParam}`, {
            headers,
          }),
          fetch(`http://localhost:8000/api/complaints/topComplaints/${constituentParam}`, {
            headers,
          }),
        ]);

        // Check if any request failed
        if (!complaintsResponse.ok || !openResponse.ok || !closedResponse.ok || !topResponse.ok) {
          throw new Error('Failed to fetch some dashboard data');
        }

        // Parse all responses
        const [complaintsData, openData, closedData, topData] = await Promise.all([
          complaintsResponse.json(),
          openResponse.json(),
          closedResponse.json(),
          topResponse.json(),
        ]);

        setComplaints(complaintsData);
        setOpenCases(openData.length);
        setClosedCases(closedData.length);
        setTopThreeTypes(topData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [history, showConstituents]);

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
            <div className="stat-card">
              <div className="stat-card top-complaints">
                <h4>Top Complaint Types</h4>
                <div className="top-complaints-list">
                  {topThreeTypes.map((type, index) => (
                    <div key={type.complaint_type} className="top-complaint-item">
                      <span className="complaint-rank">{index + 1}.</span>
                      <span className="complaint-type">{type.complaint_type}</span>
                      <span className="complaint-count">({type.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <div className="section-title-row">
              <h3 className="section-title">
                {showConstituents ? 'Complaints by My Constituents' : 'All District Complaints'}
              </h3>
              <button
                className="view-toggle-button"
                onClick={() => setShowConstituents(!showConstituents)}
              >
                {showConstituents
                  ? 'Show All District Complaints'
                  : "Show My Constituents' Complaints"}
              </button>
            </div>
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
