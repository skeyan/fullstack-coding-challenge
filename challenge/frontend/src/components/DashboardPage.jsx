import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import ComplaintTable from './ComplaintTable';
import StatsSection from './StatsSection';
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

  /**
   * Fetches all dashboard data including complaints, cases, and complaint types.
   * Uses different endpoints based on whether viewing district or constituent complaints.
   * Requires authentication token.
   *
   * @async
   * @function fetchDashboardData
   * @param {boolean} isConstituentView - Whether to fetch constituent complaints instead of district complaints
   * @returns {Promise<boolean>} True if all data fetched successfully, false if any request fails
   * @throws {Error} When requests fail or return non-OK response
   * @redirects to login page if no authentication token found
   */
  const fetchDashboardData = useCallback(
    async (isConstituentView = false) => {
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
        const complaintsEndpoint = isConstituentView
          ? 'http://localhost:8000/api/complaints/constituentComplaints/'
          : 'http://localhost:8000/api/complaints/allComplaints/';

        const [complaintsResponse, openResponse, closedResponse, topResponse] = await Promise.all([
          fetch(complaintsEndpoint, { headers }),
          fetch(
            `http://localhost:8000/api/complaints/openCases/${isConstituentView ? '?constituent=true' : ''}`,
            { headers }
          ),
          fetch(
            `http://localhost:8000/api/complaints/closedCases/${isConstituentView ? '?constituent=true' : ''}`,
            { headers }
          ),
          fetch(
            `http://localhost:8000/api/complaints/topComplaints/${isConstituentView ? '?constituent=true' : ''}`,
            { headers }
          ),
        ]);

        if (!complaintsResponse.ok || !openResponse.ok || !closedResponse.ok || !topResponse.ok) {
          throw new Error('Failed to fetch some dashboard data');
        }

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
        return true;
      } catch (err) {
        setError(err.message);
        return false;
      }
    },
    [history]
  );

  /**
   * Handles toggling between district and constituent complaint views.
   * Sets loading state, fetches appropriate data, and updates view state on success.
   * Only updates view state if data fetch is successful
   *
   * @async
   * @function handleViewToggle
   * @throws {Error} When data fetch fails
   * @returns {Promise<void>}
   */
  const handleViewToggle = async () => {
    setIsLoading(true);
    try {
      const newView = !showConstituents;
      const success = await fetchDashboardData(newView);
      if (success) {
        setShowConstituents(newView);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchDashboardData(false);
      setIsLoading(false);
    };

    loadInitialData();
  }, [fetchDashboardData]);

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

        <StatsSection
          totalComplaints={complaints.length}
          openCases={openCases}
          closedCases={closedCases}
          topThreeTypes={topThreeTypes}
        />

        <section className="dashboard-section">
          <div className="section-header">
            <div className="section-title-row">
              <h3 className="section-title">
                {showConstituents ? 'Complaints by My Constituents' : 'All District Complaints'}
              </h3>
              <button
                className="view-toggle-button"
                onClick={handleViewToggle}
                disabled={isLoading}
              >
                {isLoading
                  ? 'Loading...'
                  : showConstituents
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
