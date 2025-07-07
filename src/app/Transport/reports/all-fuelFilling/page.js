"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Table from '@/app/component/DataTable';
import { Container, Row, Col, Breadcrumb, Button } from 'react-bootstrap';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { getAllFuelFillings } from '@/Services';
import { copyContent, printContent } from '@/app/utils';

const FuelFilling = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const columns = [
    {
      name: '#',
      selector: (row, index) => index + 1,
      width: '60px',
    },
    {
      name: 'Date',
      selector: row => new Date(row.date).toLocaleDateString(),
      sortable: true,
    },
    {
      name: 'Vehicle No',
      selector: row => row.Vehicle_No,
      sortable: true,
    },
    {
      name: 'AmountPerLiter',
      selector: row => row.Amount_per_Liter,
      sortable: true,
    },
    {
      name: 'Quantity Of Diseal/Petrol/CNG',
      selector: row => row.Quantity_of_diesel,
      sortable: true,
    },
    {
      name: 'Previous Reading',
      selector: row => row.PreviousReading,
      sortable: true,
    },
    {
      name: 'New Reading',
      selector: row => row.NewReading,
      sortable: true,
    },
    {
      name: 'Petrol Pump',
      selector: row => row.Filled_Station,
      sortable: true,
    },
    {
      name: 'Total Amount',
      selector: row => row.Quantity_of_diesel * row.Amount_per_Liter,
      sortable: true,
    },
  ];

  const fetchFuelFillings = async () => {
    setLoading(true);
    try {
      const response = await getAllFuelFillings()
      setData(response.data);
    } catch (err) {
      console.error("Error fetching fuel fillings:", err);
      setError(err.response?.data?.message || "Failed to fetch fuel fillings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelFillings();
  }, []);

  const handlePrint = () => {
    const headers = [[
      "#",
      "Date",
      "Vehicle No",
      "Amount Per Liter",
      "Quantity",
      "Previous Reading",
      "New Reading",
      "Petrol Pump",
      "Total Amount"
    ]];

    const rows = data.map((row, index) => [
      index + 1,
      new Date(row.date).toLocaleDateString(),
      row.Vehicle_No || "N/A",
      row.Amount_per_Liter || 0,
      row.Quantity_of_diesel || 0,
      row.PreviousReading || 0,
      row.NewReading || 0,
      row.Filled_Station || "N/A",
      (row.Quantity_of_diesel * row.Amount_per_Liter).toFixed(2) || 0
    ]);

    printContent(headers, rows);
  };
  const handleCopy = () => {
    const headers = [
      "#",
      "Date",
      "Vehicle No",
      "Amount Per Liter",
      "Quantity",
      "Previous Reading",
      "New Reading",
      "Petrol Pump",
      "Total Amount"
    ];

    const rows = data.map((row, index) =>
      `${index + 1}\t${new Date(row.date).toLocaleDateString()}\t${row.Vehicle_No || "N/A"}\t${row.Amount_per_Liter || 0}\t${row.Quantity_of_diesel || 0}\t${row.PreviousReading || 0}\t${row.NewReading || 0}\t${row.Filled_Station || "N/A"}\t${(row.Quantity_of_diesel * row.Amount_per_Liter).toFixed(2) || 0}`
    );

    copyContent(headers, rows);
  };


  const breadcrumbItems = [
    { label: "Transport", link: "/Transport/all-module" },
    { label: "Fuel Filling", link: "null" }
  ];

  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row className="mt-1 mb-1">
            <Col>
              <BreadcrumbComp items={breadcrumbItems} />
            </Col>
          </Row>
        </Container>
      </div>

      <section>
        <Container>
          <Row>
            <Col>
              <div className="tableSheet">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2>Fuel Filling Records</h2>
                </div>
                {
                  error && (<p className='text-danger'>{error}</p>)
                }

                {loading ? (
                  <p>Loading...</p>
                ) : data.length > 0 ? (
                  <Table
                    columns={columns}
                    data={data}
                    handleCopy={handleCopy}
                    handlePrint={handlePrint}
                    responsive
                    highlightOnHover
                    pagination
                  />
                ) : (
                  <p>No fuel filling records available</p>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(FuelFilling), { ssr: false });