/**
 * @fileoverview ComplaintTable component for displaying complaint data in tabular format
 * @module components/ComplaintTable
 */

import React from 'react';
import PropTypes from 'prop-types';
import './../styles/ComplaintTable.css';

/**
 * @typedef {Object} TableColumn
 * @property {string} key - The key to access the data in complaint object
 * @property {string} header - Display text for the column header
 * @property {Function} [formatter] - Optional function to format the cell value
 */

/**
 * Ordered map that defines the structure and formatting of the complaints table
 * Array index reflects the order of the table columns shown to the member
 * @type {TableColumn[]}
 */
export const COMPLAINT_TABLE_COLUMNS = [
  { key: 'complaint_type', header: 'Type' },
  { key: 'descriptor', header: 'Description' },
  { key: 'zip', header: 'Zipcode' },
  { key: 'borough', header: 'Borough' },
  { key: 'city', header: 'City' },
  { key: 'council_dist', header: 'Council District' },
  { key: 'community_board', header: 'Community Board' },
  { key: 'opendate', header: 'Open Date' },
  { key: 'closedate', header: 'Close Date', formatter: value => value || 'Open' },
];

/**
 * ComplaintTable component renders a table of complaint data
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.complaints - Array of complaint objects to display
 * @returns {JSX.Element} Table containing complaint data
 *
 * @example
 * <ComplaintTable complaints={complaintData} />
 */
const ComplaintTable = ({ complaints }) => (
  <table className="complaint-table">
    <thead>
      <tr>
        {COMPLAINT_TABLE_COLUMNS.map(column => (
          <th key={column.key}>{column.header}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {complaints.map(complaint => (
        <tr key={complaint.unique_key}>
          {COMPLAINT_TABLE_COLUMNS.map(column => (
            <td key={column.key}>
              {column.formatter ? column.formatter(complaint[column.key]) : complaint[column.key]}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

ComplaintTable.propTypes = {
  complaints: PropTypes.arrayOf(
    PropTypes.shape({
      unique_key: PropTypes.string.isRequired,
      complaint_type: PropTypes.string,
      descriptor: PropTypes.string,
      zip: PropTypes.string,
      borough: PropTypes.string,
      city: PropTypes.string,
      council_dist: PropTypes.string,
      community_board: PropTypes.string,
      opendate: PropTypes.string,
      closedate: PropTypes.string,
    })
  ).isRequired,
};

export default ComplaintTable;
