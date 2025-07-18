"use client";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormSelect, FormControl, Button } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import Table from "@/app/component/DataTable";
import { getAllEmployee } from "@/Services";

const HrdSallary = () => {
  const [employeedata, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    setLoading(true)
    const response = await getAllEmployee();
    setEmployeeData(response?.data || []);
    setLoading(false)
  };

  // Mapping API data to table rows
  const tableData = employeedata.map((item, index) => ({
    id: index + 1,
    salDate: item.pay_scale_from ? new Date(item.pay_scale_from).toLocaleDateString("en-GB", { month: "2-digit", year: "numeric" }) : '',
    empcode: item.employee_code || '',
    name: item.employee_name || '',
    actBasic: item.basic_pay || '',
    basic: item.gross_pay || '',
    ve: item.conv || '',
    grossPay: item.gross_pay || '',
    pf: item.income_tax || '',
    lic: item.lic_amount || '',
    vd: item.da || '',
    esi: item.esi || '',
    netSalary: item.net_pay || '',
  }));

  const columns = [
    { name: "#", selector: (row) => row.id, width: "60px" },
    { name: "Sal. Date", selector: (row) => row.salDate },
    { name: "Emp. Code", selector: (row) => row.empcode },
    { name: "Name", selector: (row) => row.name },
    { name: "Act. Basic", selector: (row) => row.actBasic },
    { name: "Basic", selector: (row) => row.basic },
    { name: "VE", selector: (row) => row.ve },
    { name: "Gross Pay", selector: (row) => row.grossPay },
    { name: "PF", selector: (row) => row.pf },
    { name: "LIC", selector: (row) => row.lic },
    { name: "VD", selector: (row) => row.vd },
    { name: "ESI", selector: (row) => row.esi },
    { name: "Net Salary", selector: (row) => row.netSalary },
  ];

  const breadcrumbItems = [
    { label: "Accounts", link: "/accounts/all-module" },
    { label: "HRD Salary", link: null },
  ];

  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row>
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
                <h2>HRD Salary Records</h2>
                {loading ? <p>Loading..</p> : (
                  <Table columns={columns} data={tableData} />
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default HrdSallary;
