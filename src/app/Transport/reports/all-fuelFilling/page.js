"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Table from '@/app/component/DataTable';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Container, Row, Col, Breadcrumb, Button } from 'react-bootstrap';
import { CgAddR } from 'react-icons/cg';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import axios from 'axios';

const FuelFilling = () => {
  const API_BASE_URL = "https://erp-backend-fy3n.onrender.com/api";
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
      const response = await axios.get(`${API_BASE_URL}/all-fuel-fillings`);
      setData(response.data.data);
    } catch (err) {
      console.error("Error fetching fuel fillings:", err);
      setError(err.response?.data?.message || "Failed to fetch fuel fillings");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    // Implement edit functionality if needed
    console.log("Edit fuel filling with id:", id);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this fuel filling record?")) {
      try {
        await axios.delete(`${API_BASE_URL}/delete-fuel-fillings/${id}`);
        setData(data.filter(item => item._id !== id));
      } catch (err) {
        console.error("Error deleting fuel filling:", err);
        setError(err.response?.data?.message || "Failed to delete fuel filling");
      }
    }
  };

  useEffect(() => {
    fetchFuelFillings();
  }, []);

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
                
                {loading ? (
                  <p>Loading...</p>
                ) : error ? (
                  <p style={{ color: "red" }}>{error}</p>
                ) : data.length > 0 ? (
                  <Table 
                    columns={columns} 
                    data={data}
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