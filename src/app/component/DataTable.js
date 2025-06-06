"use client";
import React, { useState, useEffect } from 'react';
import DataTable, { defaultThemes } from 'react-data-table-component';

const Table = ({ columns, data, handlePrint, handleCopy }) => {
  const [records, setRecords] = useState(data);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    filterRecords(searchText);
  }, [data]);

  const flattenObject = (obj, prefix = "") => {
    let result = {};
    for (const key in obj) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "object" && value !== null) {
        Object.assign(result, flattenObject(value, newKey));
      } else {
        result[newKey] = value;
      }
    }
    return result;
  };

  const filterRecords = (text) => {
    const lowerText = text.toLowerCase();
    const filteredData = data.filter((row) => {
      const flatRow = flattenObject(row);
      return Object.values(flatRow).some((val) =>
        val?.toString().toLowerCase().includes(lowerText)
      );
    });
    setRecords(filteredData);
  };

  const handleFilter = (event) => {
    const text = event.target.value;
    setSearchText(text);
    filterRecords(text);
  };

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
        minHeight: '50px',
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
          value={searchText}
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
        <button className="editButton" onClick={handleCopy}>
          Copy
        </button>
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
          dense
          customStyles={customStyles}
        />
      </div>
    </div>
  );
};

export default Table;
