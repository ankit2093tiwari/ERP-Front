"use client";

import React, { useState } from "react";
import { Container, Row, Col, Card, Table, Button } from "react-bootstrap";
import Chart from "react-apexcharts";

const DashboardFee = () => {
  // Bar chart: Monthly fee collection
  const [barChartOptions] = useState({
    chart: { id: "fee-bar" },
    xaxis: {
      categories: ["Apr", "May", "Jun", "July", "August", "September","October","November","December"],
    },
    colors: ["#1976d2"],
  });

  const [barChartSeries] = useState([
    {
      name: "Collected Fee",
      data: [460000, 210000, 190000, 220000, 205000, 230000,200000, 260000, 195000],
    },
  ]);

  // Donut chart: Fee breakdown
  const [donutChartOptions] = useState({
    labels: ["Collected", "Pending", "Defaulters"],
    colors: ["#66bb6a", "#ffa726", "#ef5350"],
    legend: { position: "bottom" },
  });

  const [donutChartSeries] = useState([1235000, 215000, 48000]);

  return (
    <Container className="mt-4">
      <h4 className="mb-4 cover-sheet p-4">Fee Dashboard</h4>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center shadow-sm border-0" style={{ backgroundColor: "#e3f2fd" }}>
            <Card.Body>
              <Card.Title className="text-primary">Total Students</Card.Title>
              <h3>850</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm border-0" style={{ backgroundColor: "#e8f5e9" }}>
            <Card.Body>
              <Card.Title className="text-success">Fee Collected</Card.Title>
              <h3>₹12,35,000</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm border-0" style={{ backgroundColor: "#fff8e1" }}>
            <Card.Body>
              <Card.Title className="text-warning">Pending Dues</Card.Title>
              <h3>₹2,15,000</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm border-0" style={{ backgroundColor: "#ffebee" }}>
            <Card.Body>
              <Card.Title className="text-danger">Defaulters</Card.Title>
              <h3>48</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header style={{ backgroundColor: "#f1f1f1", fontWeight: "bold" }}>Monthly Fee Collection</Card.Header>
            <Card.Body>
              <Chart options={barChartOptions} series={barChartSeries} type="bar" height={300} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header style={{ backgroundColor: "#f1f1f1", fontWeight: "bold" }}>Fee Distribution</Card.Header>
            <Card.Body>
              <Chart options={donutChartOptions} series={donutChartSeries} type="donut" height={300} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4 shadow-sm">
        <Card.Header style={{ backgroundColor: "#f1f1f1", fontWeight: "bold" }}>
          Recent Fee Payments
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive size="sm">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Class</th>
                <th>Amount Paid</th>
                <th>Payment Date</th>
                <th>Mode</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Riya Sharma</td>
                <td>Class 10</td>
                <td>₹12,000</td>
                <td>2025-06-18</td>
                <td>Online</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Arjun Verma</td>
                <td>Class 6</td>
                <td>₹8,000</td>
                <td>2025-06-17</td>
                <td>Cash</td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-end">
        <Button variant="outline-primary">Go to Full Fee Report</Button>
      </div>
    </Container>
  );
};

export default DashboardFee;
