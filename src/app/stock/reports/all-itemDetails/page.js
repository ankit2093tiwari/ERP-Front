"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaTrashAlt } from "react-icons/fa";
import {
  Container,
  Row,
  Col,
  Breadcrumb,
  Button,
  Alert,
} from "react-bootstrap";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";
import { getAllItems } from "@/Services";

const ItemMaster = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px"
    },
    {
      name: "Category",
      selector: (row) => row.itemCategory?.categoryName || "N/A",
      sortable: true
    },
    {
      name: "Item Type",
      selector: (row) => row.itemType || "N/A",
      sortable: true
    },
    {
      name: "Item Name",
      selector: (row) => row.itemName || "N/A",
      sortable: true
    },
    {
      name: "Description",
      selector: (row) => row.description || "N/A",
      sortable: true
    },
    {
      name: "Date",
      selector: (row) => new Date(row.date).toLocaleDateString() || "N/A",
      sortable: true
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllItems()
      setData(response.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };


  const handlePrint = () => {
    const tableHeaders = [["#", "Date", "Category", "Item Type", "Item Name", "Minimum Stock", "Description"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      new Date(row.date).toLocaleDateString(),
      row.itemCategory?.categoryName || "N/A",
      row.itemType || "N/A",
      row.itemName || "N/A",
      row.maintainMinimumStock || "N/A",
      row.description || "N/A"
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Date", "Category", "Item Type", "Item Name", "Minimum Stock", "Description"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${new Date(row.date).toLocaleDateString()}\t${row.itemCategory?.categoryName || "N/A"}\t${row.itemType || "N/A"}\t${row.itemName || "N/A"}\t${row.maintainMinimumStock || 0}\t${row.description || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Stock", link: "/stock/all-module" },
    { label: "Item Master", link: "null" }
  ];

  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row className='mt-1 mb-1'>
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
            <h2>Stock Item Records</h2>
            {loading ? (
              <p>Loading data...</p>
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

export default dynamic(() => Promise.resolve(ItemMaster), { ssr: false });