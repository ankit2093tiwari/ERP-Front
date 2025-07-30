"use client";

import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table } from "react-bootstrap";
import Chart from "react-apexcharts";
import { getAllFeeEntries, getLimitedFeeEntries, getTotalStudentsCount } from "@/Services";
import useSessionId from "@/hooks/useSessionId";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const DashboardFee = () => {
  const selectedSessionId = useSessionId();
  const [studentCount, setStudentCount] = useState(0);
  const [feeEntries, setFeeEntries] = useState([]);
  const [recentFeeEntries, setRecentFeeEntries] = useState([]);
  const [barChartCategories, setBarChartCategories] = useState([]);
  const [barChartSeries, setBarChartSeries] = useState([]);
  const [donutChartSeries, setDonutChartSeries] = useState([0, 0, 0]);

  const totalFeeAmount = 250000; // hardcoded for now. get exact amount to be collected

  const barChartOptions = {
    chart: { id: "fee-bar" },
    xaxis: {
      categories: barChartCategories,
    },
    colors: ["#1976d2"],
  };

  const [donutChartOptions] = useState({
    labels: ["Collected", "Pending", "Defaulters"],
    colors: ["#66bb6a", "#ffa726", "#ef5350"],
    legend: { position: "bottom" },
  });

  useEffect(() => {
    const fetchTotalStudent = async () => {
      const res = await getTotalStudentsCount();
      setStudentCount(res.data.totalStudents);
    };

    const fetchRecentFeeEntries = async () => {
      const res = await getLimitedFeeEntries(3);
      setRecentFeeEntries(res.feeEntries);
    };

    const fetchAllFeeEntries = async () => {
      const response = await getAllFeeEntries();
      const entries = response.feeEntries || [];
      setFeeEntries(entries);

      const totalsByInstallment = {};

      let admissionTotal = 0;
      let annualTotal = 0;
      let tuitionTotal = 0;
      let lateFeeTotal = 0;

      entries.forEach(entry => {
        const inst = entry.installment_name?.installment_name || "Unknown";
        if (!totalsByInstallment[inst]) totalsByInstallment[inst] = 0;

        const admission = entry.admission_fee || 0;
        const annual = entry.annual_fee || 0;
        const tuition = entry.tution_fee || 0;
        const late = entry.late_fee || 0;
        const discount = entry.other_discount || 0;

        const total = admission + annual + tuition + late - discount;

        admissionTotal += admission;
        annualTotal += annual;
        tuitionTotal += tuition;
        lateFeeTotal += late;

        totalsByInstallment[inst] += total;
      });

      const orderedMonths = [
        "April", "May", "June", "July", "August", "September",
        "October", "November", "December"
      ];
      const filteredCategories = orderedMonths.filter(m => m in totalsByInstallment);
      const chartData = filteredCategories.map(m => totalsByInstallment[m]);

      setBarChartCategories(filteredCategories);
      setBarChartSeries([{ name: "Collected Fee", data: chartData }]);

      const totalCollected = admissionTotal + annualTotal + tuitionTotal + lateFeeTotal;
      const pendingAmount = totalFeeAmount - totalCollected;
      const defaulters = Math.floor(pendingAmount / 5000); // or any logic

      setDonutChartSeries([
        totalCollected > 0 ? totalCollected : 0,
        pendingAmount > 0 ? pendingAmount : 0,
        defaulters > 0 ? defaulters : 0
      ]);
    };

    fetchAllFeeEntries();
    fetchRecentFeeEntries();
    fetchTotalStudent();
  }, [selectedSessionId]);

  const formatAmount = (amount) => {
    return amount.toLocaleString("en-IN");
  };
  const breadcrumbItems = [{ label: "Fees", link: "null" },];
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
          <div className="studentHeading">
            <h2>Fee Dashboard</h2>
          </div>
          <Row className="mb-4">
            <Col md={4}>
              <Card className="text-center shadow-sm border-0" style={{ backgroundColor: "#e3f2fd" }}>
                <Card.Body>
                  <Card.Title className="text-primary">Total Students</Card.Title>
                  <h3>{studentCount}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center shadow-sm border-0" style={{ backgroundColor: "#e8f5e9" }}>
                <Card.Body>
                  <Card.Title className="text-success">Fee Collected</Card.Title>
                  <h3>₹{formatAmount(donutChartSeries[0])}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center shadow-sm border-0" style={{ backgroundColor: "#fff8e1" }}>
                <Card.Body>
                  <Card.Title className="text-warning">Pending Dues</Card.Title>
                  <h3>₹{formatAmount(totalFeeAmount - donutChartSeries[0]) || 0}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Header style={{ backgroundColor: "#f1f1f1", fontWeight: "bold" }}>
                  Monthly Fee Collection
                </Card.Header>
                <Card.Body>
                  <Chart options={barChartOptions} series={barChartSeries} type="bar" height={300} />
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Header style={{ backgroundColor: "#f1f1f1", fontWeight: "bold" }}>
                  Fee Distribution
                </Card.Header>
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
                  {
                    recentFeeEntries?.map((entry, index) => (
                      <tr key={entry?._id}>
                        <td>{index + 1}</td>
                        <td className="text-capitalize">{entry?.student?.first_name || "Unknown"}</td>
                        <td>{entry?.student?.class_name?.class_name || "N/A"}</td>
                        <td>
                          ₹{formatAmount(
                            Number(entry.admission_fee || 0) +
                            Number(entry.annual_fee || 0) +
                            Number(entry.tution_fee || 0)
                          )}
                        </td>
                        <td>{new Date(entry.createdAt).toLocaleDateString("en-IN")}</td>
                        <td>{entry?.paymentMode?.payment_mode || "Online"}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Container>
      </section>
    </>
  );
};

export default DashboardFee;
