"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaTrashAlt } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";

const VendorMaster = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "Organization Name",
      selector: (row) => row.organizationName || "N/A",
      sortable: true,
      cell: (row) => <strong>{row.organizationName || "N/A"}</strong>
    },
    {
      name: "Organization Type",
      selector: (row) => row.organizationType || "N/A",
      sortable: true
    },
    {
      name: "Organization Address",
      selector: (row) => row.organizationAddress || "N/A",
      sortable: true
    },
    {
      name: "Contact Person Details",
      selector: (row) =>
        `${row.contactPersonName || "N/A"} - ${row.contactNumber || "N/A"} - ${row.email || "N/A"}`,
      sortable: false,
      cell: (row) => (
        <div>
          <div><strong>{row.contactPersonName || "N/A"}</strong></div>
          <div>{row.contactNumber || "N/A"}</div>
          <div>{row.email || "N/A"}</div>
        </div>
      )
    }
  ];
  

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/vendors");
      setData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch vendors. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/vendor/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete vendor. Please try again later.");
      }
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Organization", "Type", "Address", "Contact Person", "Phone", "Email"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.organizationName,
      row.organizationType,
      row.organizationAddress,
      row.contactPersonName,
      row.contactNumber,
      row.email
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Organization", "Type", "Address", "Contact Person", "Phone", "Email"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.organizationName}\t${row.organizationType}\t${row.organizationAddress}\t${row.contactPersonName}\t${row.contactNumber}\t${row.email}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Stock", link: "/stock/all-module" },
    { label: "Vendor Master", link: "null" }
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
          {error && <Alert variant="danger">{error}</Alert>}

          <div className="tableSheet">
            <h2>Vendor Records</h2>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : (
              <Table
                columns={columns}
                data={data}
                handleCopy={handleCopy}
                handlePrint={handlePrint}
              />
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(VendorMaster), { ssr: false });