"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';

import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { Container, Row, Col, Alert, Button } from 'react-bootstrap';
import axios from 'axios';
import Table from '@/app/component/DataTable';
import { copyContent, printContent } from '@/app/utils';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { getPurchaseOrders } from '@/Services';

const PurchaseList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const columns = [
    {
      name: '#',
      selector: (row, index) => index + 1,
      width: '80px',
      sortable: false,
    },
    {
      name: 'Item',
      selector: row => row.quotation?.itemName?.itemName || 'N/A',
      sortable: true,
    },
    {
      name: 'Item Category',
      selector: row => row.quotation?.itemCategory?.categoryName || 'N/A', // if you populate category name, else fallback
      sortable: true,
    },
    {
      name: 'Vendor',
      cell: row => {
        const vendor = row.quotation?.vendorName;
        return (
          <div>
            <strong>{vendor?.organizationName || 'N/A'}</strong>
            {vendor?.contactPersonName && (
              <div className="text-muted small">{vendor.contactPersonName}</div>
            )}
            {vendor?.contactNumber && (
              <div className="text-muted small">{vendor.contactNumber}</div>
            )}
          </div>
        );
      },
      sortable: true,
    },
    {
      name: 'Price/Unit',
      selector: row => row.quotation?.pricePerUnit ? `₹${row.quotation.pricePerUnit}` : 'N/A',
      sortable: true,
    },
    {
      name: 'Date',
      selector: row => row.purchaseDate ? new Date(row.purchaseDate).toLocaleDateString() : 'N/A',
      sortable: true,
    },
    {
      name: 'Actions',
      cell: row => (
        <Button variant="danger" size="sm" onClick={() => handleDelete(row._id)}>
          <FaTrashAlt />
        </Button>
      ),
    }
  ];
  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this purchase order?");

    if (!confirm) return;

    try {
      const res = await deletePurchaseOrderById(id);
      if (res.data.success) {
        toast.success('Purchase order deleted successfully!');
        fetchData(); // Refresh list
      } else {
        toast.error(res.data.message || 'Failed to delete purchase order');
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error('Something went wrong while deleting!');
    }
  };


  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getPurchaseOrders()
      setData(response.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Item", "Category", "Vendor", "Price/Unit", "Quotation No", "Date"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.quotation?.itemName?.itemName || "N/A",
      row.quotation?.itemCategory?.categoryName || "N/A", // only if populated
      row.quotation?.vendorName?.organizationName || "N/A",
      row.quotation?.pricePerUnit ? `₹${row.quotation.pricePerUnit}` : "N/A",
      row.quotation?.quotationNo || "N/A",
      row.purchaseDate ? new Date(row.purchaseDate).toLocaleDateString() : "N/A"
    ]);
    printContent(tableHeaders, tableRows);
  };


  const handleCopy = () => {
    const headers = ["#", "Item", "Category", "Vendor", "Price/Unit", "Quotation No", "Date"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.quotation?.itemName?.itemName || "N/A"}\t${row.quotation?.itemCategory?.categoryName || "N/A"}\t${row.quotation?.vendorName?.organizationName || "N/A"}\t${row.quotation?.pricePerUnit ? `₹${row.quotation.pricePerUnit}` : "N/A"}\t${row.quotation?.quotationNo || "N/A"}\t${row.purchaseDate ? new Date(row.purchaseDate).toLocaleDateString() : "N/A"}`
    );
    copyContent(headers, rows);
  };


  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Stock", link: "/stock/all-module" },
    { label: "Purchase Master", link: "null" }
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
            <h2>Purchase List</h2>
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

export default dynamic(() => Promise.resolve(PurchaseList), { ssr: false });
