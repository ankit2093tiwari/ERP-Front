"use client";
import React, { useState } from 'react';
import DataTable, { defaultThemes } from 'react-data-table-component';

const Table = ({ columns, data }) => {
  const [records, setRecords] = useState(data);

  function handleFilter(event) {
    const newData = records.filter(row => {
      return row.className.toLowerCase().includes(event.target.value.toLowerCase())
    })
    setRecords(newData)
  }

  const customStyles = {
    headRow: {
      style: {
        borderTopStyle: 'solid',
        borderTopWidth: '1px',
        borderTopColor: defaultThemes.default.divider.default,
        fontSize: '14px',
        width: '900px',
      },
    },
    headCells: {
      style: {
        '&:not(:last-of-type)': {
          borderRightStyle: 'solid',
          borderRightWidth: '1px',
          borderRightColor: defaultThemes.default.divider.default,
          width: '900px',
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
    <div style={{  border: '1px solid #ddd', borderRadius: '8px', padding: '20px', boxShadow: '2px 2px 2px 2px rgba(0, 0, 0, 0.3)' }}>
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
      <div style={{ float: "right", marginTop: "-12px" }}>
      <button className="editButton">Copy</button>
      <button className="editButton">Paste</button>
      </div>
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
  );
};

export default Table;