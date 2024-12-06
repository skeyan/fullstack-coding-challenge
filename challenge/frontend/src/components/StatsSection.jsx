/**
 * @fileoverview Statistics section component displaying complaint metrics
 * @module components/StatsSection
 */
import React from 'react';
import PropTypes from 'prop-types';
import './../styles/StatsSection.css';

/**
 * StatsSection displays key metrics about complaints in a grid layout
 * Shows total complaints, open cases, closed cases, and top complaint types
 *
 * @component
 * @param {Object} props
 * @param {number} props.totalComplaints - Total number of complaints
 * @param {number} props.openCases - Number of open cases
 * @param {number} props.closedCases - Number of closed cases
 * @param {Array<{complaint_type: string, count: number}>} props.topThreeTypes - Array of top complaint types with counts
 *
 * @example
 * <StatsSection
 *   totalComplaints={150}
 *   openCases={75}
 *   closedCases={75}
 *   topThreeTypes={[
 *     { complaint_type: "Noise", count: 50 },
 *     { complaint_type: "Parking", count: 30 },
 *     { complaint_type: "Trash", count: 20 }
 *   ]}
 * />
 */
const StatsSection = ({ totalComplaints, openCases, closedCases, topThreeTypes }) => {
  return (
    <section className="dashboard-stats">
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Complaints</h4>
          <p className="stat-number">{totalComplaints}</p>
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
                  <span className="complaint-type">
                    {type.complaint_type}
                    <span className="complaint-count"> ({type.count})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

StatsSection.propTypes = {
  totalComplaints: PropTypes.number.isRequired,
  openCases: PropTypes.number.isRequired,
  closedCases: PropTypes.number.isRequired,
  topThreeTypes: PropTypes.arrayOf(
    PropTypes.shape({
      complaint_type: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default StatsSection;
