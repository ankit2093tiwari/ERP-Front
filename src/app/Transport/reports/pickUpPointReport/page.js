"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Table from '@/app/component/DataTable';
import { Container, Row, Col } from 'react-bootstrap';
import { copyContent, printContent } from '@/app/utils';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { getAllStudentVehicles } from '@/Services';

const StudentVehicle = () => {
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
      name: 'Vehicle No',
      selector: row => row.vehicle_route?.Vehicle_No || 'N/A',
      sortable: true,
    },
    {
      name: 'Pickup Point',
      selector: row => row.pickUpPoint?.location || 'N/A',
      sortable: true,
    },
    {
      name: 'Amount',
      selector: row =>
        row.pickUpPoint?.amount
          ? `₹${row.pickUpPoint.amount}`
          : 'N/A',
      sortable: true,
    },
    {
      name: 'Student Name',
      selector: row => {
        if (!row.student) return 'N/A';
        const { first_name, middle_name, last_name } = row.student;
        return [first_name, middle_name, last_name].filter(Boolean).join(' ');
      },
      sortable: true,
    },
    {
      name: 'Father Name',
      selector: row => row.student?.father_name || 'N/A',
      sortable: true,
    },
    {
      name: 'Mobile No',
      selector: row => row.student?.phone_no || row.student?.father_mobile_no || 'N/A',
      sortable: true,
    },
  ];

  const fetchStudentVehicles = async () => {
    setLoading(true);
    try {
      const response = await getAllStudentVehicles();
      setData(response.data || []);
    } catch (err) {
      console.error("Error fetching student vehicles:", err);
      setError(err.response?.data?.message || "Failed to fetch student vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentVehicles();
  }, []);

  const handlePrint = () => {
    const headers = [["#", "Vehicle No", "Pickup Point", "Amount", "Student Name", "Father Name", "Mobile No"]];
    const rows = data.map((row, index) => [
      index + 1,
      row.vehicle_route?.Vehicle_No || "N/A",
      row.pickUpPoint?.location || "N/A",
      row.pickUpPoint?.amount || "N/A",
      row.student
        ? [row.student.first_name, row.student.middle_name, row.student.last_name].filter(Boolean).join(' ')
        : "N/A",
      row.student?.father_name || "N/A",
      row.student?.phone_no || row.student?.father_mobile_no || "N/A"
    ]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Vehicle No", "Pickup Point", "Amount", "Student Name", "Father Name", "Mobile No"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.vehicle_route?.Vehicle_No || "N/A"}\t${row.pickUpPoint?.location || "N/A"}\t${row.pickUpPoint?.amount || "N/A"}\t${
        row.student
          ? [row.student.first_name, row.student.middle_name, row.student.last_name].filter(Boolean).join(' ')
          : "N/A"
      }\t${row.student?.father_name || "N/A"}\t${row.student?.phone_no || row.student?.father_mobile_no || "N/A"}`
    );
    copyContent(headers, rows);
  };

  const breadcrumbItems = [
    { label: "Transport", link: "/Transport/all-module" },
    { label: "PickUp Point Reports", link: "null" }
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
              {error && <div className="alert alert-danger mt-3">{error}</div>}
            </Col>
          </Row>

          <Row>
            <Col>
              <div className="tableSheet">
                <h2>PickUp Point Reports</h2>
                {loading ? (
                  <p>Loading...</p>
                ) : data.length > 0 ? (
                  <Table columns={columns} data={data} handleCopy={handleCopy} handlePrint={handlePrint} />
                ) : (
                  <p>No student transport assignments available</p>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(StudentVehicle), { ssr: false });
