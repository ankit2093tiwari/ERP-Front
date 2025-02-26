"use client";
import React, { useState } from 'react';
import DataTable, { defaultThemes } from 'react-data-table-component';

const Table = ({ columns, data, handlePrint, handleCopy }) => {
  const [records, setRecords] = useState(data);

  // Filter data based on search input
  function handleFilter(event) {
    const newData = data.filter(row => {
      return row.className.toLowerCase().includes(event.target.value.toLowerCase());
    });
    setRecords(newData);
  }

  // Custom styles for the table
  const customStyles = {
    headRow: {
      style: {
        borderTopStyle: 'solid',
        borderTopWidth: '1px',
        borderTopColor: defaultThemes.default.divider.default,
        fontSize: '14px',
      },
    },
    headCells: {
      style: {
        '&:not(:last-of-type)': {
          borderRightStyle: 'solid',
          borderRightWidth: '1px',
          borderRightColor: defaultThemes.default.divider.default,
        },
      },
    },
    cells: {
      style: {
        '&:not(:last-of-type)': {
          borderRightStyle: 'solid',
          borderRightWidth: '1px',
          borderRightColor: defaultThemes.default.divider.default,
          fontSize: '13px',
        },
      },
    },
  };

  return (
    <div className='dataTableCover'>
      <div className="searchBar">
        <input
          type="text"
          placeholder="Search..."
          onChange={handleFilter}
          style={{
            marginBottom: '10px',
            padding: '8px',
            width: '79%',
            boxSizing: 'border-box',
            borderRadius: '4px',
            border: '1px solid #ddd',
            marginRight: "5px"
          }}
        />
        {/* Copy Button */}
        <button className="editButton" onClick={handleCopy}>
          Copy
        </button>
        {/* Print Button */}
        <button className="printButton" onClick={handlePrint}>
          Print
        </button>
      </div>
      <div id="printableTable">
        <DataTable
          columns={columns}
          data={records}
          pagination
          highlightOnHover
          selectableRows
          dense
          customStyles={customStyles}
        />
      </div>
    </div>
  );
};

export default Table;