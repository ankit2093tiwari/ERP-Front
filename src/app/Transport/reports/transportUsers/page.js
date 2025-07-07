"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Table from '@/app/component/DataTable';
import { Container, Row, Col } from 'react-bootstrap';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { getAllStudentVehicles } from '@/Services';
import { copyContent, printContent } from '@/app/utils';

const StudentVehicle = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      name: '#',
      selector: (row, index) => index + 1,
      width: '60px',
    },
    {
      name: 'Vehicle No',
      selector: row => row.vehicle_no,
      sortable: true,
    },
    {
      name: 'Students',
      cell: row => (
        <div>
          {row.students.map((name, index) => (
            <div key={index}>{name}</div>
          ))}
        </div>
      ),
      wrap: true,
    }
  ];

  const fetchStudentVehicles = async () => {
    setLoading(true);
    try {
      const response = await getAllStudentVehicles();
      const rawData = response.data;

      const grouped = rawData.reduce((acc, curr) => {
        const vehicle_no = curr.vehicle_route?.Vehicle_No || "Unknown";
        const studentName = curr.student ? `${curr.student.first_name} ${curr.student.last_name}` : "N/A";

        const found = acc.find(item => item.vehicle_no === vehicle_no);
        if (found) {
          found.students.push(studentName);
        } else {
          acc.push({ vehicle_no, students: [studentName] });
        }

        return acc;
      }, []);

      setData(grouped);
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
    const headers = [["#", "Vehicle No", "Student Names"]];
    const rows = data.map((row, index) => [
      index + 1,
      row.vehicle_no,
      row.students.join(", ")
    ]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Vehicle No", "Student Names"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.vehicle_no}\t${row.students.join(", ")}`
    );
    copyContent(headers, rows);
  };

  const breadcrumbItems = [
    { label: "Transport", link: "/Transport/all-module" },
    { label: "Transport User", link: "null" }
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
                <h2>Transport User</h2>
                {error && <p style={{ color: "red" }}>{error}</p>}

                {loading ? (
                  <p>Loading...</p>
                ) : data.length > 0 ? (
                  <Table
                    columns={columns}
                    data={data}
                    handleCopy={handleCopy}
                    handlePrint={handlePrint}
                  />
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
