"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import Table from '@/app/component/DataTable';
import { copyContent, printContent } from '@/app/utils';
import BreadcrumbComp from "@/app/component/Breadcrumb";

const QuotationMaster = () => {
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
            selector: row => row.itemName || 'N/A',
            sortable: true,
        },
        {
            name: 'Item Category',
            selector: row => row.itemCategory?.categoryName || 'N/A',
            sortable: true,
        },
        // {
        //   name: 'Vendor',
        //   cell: row => (
        //     <div>
        //       <strong>{row.vendorName?.organizationName || 'N/A'}</strong>
        //       {row.vendorName?.contactPersonName && (
        //         <div className="text-muted small">{row.vendorName.contactPersonName}</div>
        //       )}
        //       {row.vendorName?.contactNumber && (
        //         <div className="text-muted small">{row.vendorName.contactNumber}</div>
        //       )}
        //     </div>
        //   ),
        //   sortable: true,
        // },
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
        },
        {
            name: 'Price/Unit',
            selector: row => row.pricePerUnit ? `₹${row.pricePerUnit}` : 'N/A',
            sortable: true,
        },
        {
            name: 'Date',
            selector: row => row.date ? new Date(row.date).toLocaleDateString() : 'N/A',
            sortable: true,
        },
    ];

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/quotation-stocks");
            setData(response.data.data || []);
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
            row.itemName || "N/A",
            row.itemCategory?.categoryName || "N/A",
            row.vendorName?.organizationName || "N/A",
            row.pricePerUnit ? `₹${row.pricePerUnit}` : "N/A",
            row.quotationNo || "N/A",
            row.date ? new Date(row.date).toLocaleDateString() : "N/A"
        ]);
        printContent(tableHeaders, tableRows);
    };

    const handleCopy = () => {
        const headers = ["#", "Item", "Category", "Vendor", "Price/Unit", "Quotation No", "Date"];
        const rows = data.map((row, index) =>
            `${index + 1}\t${row.itemName || "N/A"}\t${row.itemCategory?.categoryName || "N/A"}\t${row.vendorName?.organizationName || "N/A"}\t${row.pricePerUnit ? `₹${row.pricePerUnit}` : "N/A"}\t${row.quotationNo || "N/A"}\t${row.date ? new Date(row.date).toLocaleDateString() : "N/A"}`
        );
        copyContent(headers, rows);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const breadcrumbItems = [
        { label: "Stock", link: "/stock/all-module" },
        { label: "Quotation Master", link: "null" }
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
                        <h2>Quotation Records</h2>
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

export default dynamic(() => Promise.resolve(QuotationMaster), { ssr: false });
