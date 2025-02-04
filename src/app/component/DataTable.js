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

  function handlePrint() {
    // Create a printable table
    const tableHeaders = columns
      .map((col) => `<th>${col.name}</th>`)
      .join("");
    const tableRows = records
      .map(
        (row) =>
          `<tr>${columns
            .map((col) => `<td>${row[col.selector]}</td>`)
            .join("")}</tr>`
      )
      .join("");

    const tableHTML = `
      <table border="1" style="border-collapse: collapse; width: 100%; text-align: left;">
        <thead style="background-color: #f2f2f2;">
          <tr>${tableHeaders}</tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    `;

    // Open a new window and print
    const printWindow = window.open("", "_blank");
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Table</title>
          <style>
            table {
              font-family: Arial, sans-serif;
              font-size: 14px;
              margin: 20px 0;
              border: 1px solid #ddd;
              width: 100%;
            }
            th, td {
              padding: 8px;
              border: 1px solid #ddd;
            }
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          ${tableHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  }

  const customStyles = {
    headRow: {
      style: {
        borderTopStyle: 'solid',
        borderTopWidth: '1px',
        borderTopColor: defaultThemes.default.divider.default,
        fontSize: '14px',
        // width: '900px',
      },
    },
    headCells: {
      style: {
        '&:not(:last-of-type)': {
          borderRightStyle: 'solid',
          borderRightWidth: '1px',
          borderRightColor: defaultThemes.default.divider.default,
          // width: '900px',
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
     
      <button className="editButton">Copy</button>
      <button className="editButton">Paste</button>
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