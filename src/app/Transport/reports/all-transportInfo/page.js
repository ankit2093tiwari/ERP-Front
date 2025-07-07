"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from '@/app/utils';
import { Container, Row, Col, Breadcrumb } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { getAllVehicles } from "@/Services";
const AllTransportInfo = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const columns = [
        { name: "#", selector: (row, index) => index + 1, width: "60px" },
        {
            name: "Vehicle Type",
            selector: (row) => row.Vehicle_Type?.type_name || "N/A",
            sortable: true,
        },
        {
            name: "Vehicle No",
            selector: (row) => row.Vehicle_No,
            sortable: true,
        },
        {
            name: "Chassis No",
            selector: (row) => row.Chassis_No || "N/A",
        },
        {
            name: "Seats",
            selector: (row) => row.Seating_Capacity,
            sortable: true,
        },
        {
            name: "Driver Name",
            selector: (row) => `${row.Driver_Name}`,
            sortable: true,
        },
        {
            name: "Driver Licence",
            selector: (row) => `${row.Driver_Licence_No}`,
        },
        {
            name: "Licence Valid Till",
            selector: (row) => `${new Date(row.Licence_Valid_Till).toLocaleDateString()}`,
        },
        {
            name: "Driver Mobile No",
            selector: (row) => `${row.Driver_Mobile_No}`,
            sortable: true,
        },
        {
            name: "InsuranceDueOn",
            selector: (row) => new Date(row.Insurance_Valid_Till).toLocaleDateString(),
            sortable: true,
        },
        {
            name: "Insurance Company",
            selector: (row) => `${row.Insurance_Company} (${row.Insurance_Policy_No})`,
        },
        {
            name: "Insurance Amount",
            selector: (row) => `₹${row.Insurance_Amount}`,
            sortable: true,
        },
        {
            name: "Insurance Policy No",
            selector: (row) => row.Engine_No || "N/A",
        },
        {
            name: "Helper Name",
            selector: (row) => row.Helper_Name ? `${row.Helper_Name}` : "N/A",
        },
        {
            name: "Helper Mobile No",
            selector: (row) => row.Helper_Name ? ` ${row.Helper_Mobile_No}` : "N/A",
        },
        {
            name: "Remark",
            selector: (row) => row.Remark || "N/A",
            wrap: true,
            width: "200px",
        },
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getAllVehicles()
            setData(res.data);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to fetch data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const breadcrumbItems = [
        { label: "Transport", link: "/Transport/all-module" },
        { label: "Vehicle Master", link: "null" },
    ];
    const handlePrint = () => {
        const headers = [[
            "#", "Vehicle Type", "Vehicle No",
            "Driver Name", "Driver Licence", "Driver Mobile No",
        ]];

        const rows = data.map((row, index) => [
            index + 1,
            row.Vehicle_Type?.type_name || "N/A",
            row.Vehicle_No,
            row.Driver_Name || "N/A",
            row.Driver_Licence_No || "N/A",
            row.Driver_Mobile_No || "N/A",
        ]);

        printContent(headers, rows);
    };

    const handleCopy = () => {
        const headers = [
            "#", "Vehicle Type", "Vehicle No", "Chassis No", "Seats",
            "Driver Name", "Driver Licence", "Licence Valid Till", "Driver Mobile No",
            "Insurance Due On", "Insurance Company", "Insurance Amount",
        ];

        const rows = data.map((row, index) => [
            index + 1,
            row.Vehicle_Type?.type_name || "N/A",
            row.Vehicle_No,
            row.Chassis_No || "N/A",
            row.Seating_Capacity || "N/A",
            row.Driver_Name || "N/A",
            row.Driver_Licence_No || "N/A",
            new Date(row.Licence_Valid_Till).toLocaleDateString(),
            row.Driver_Mobile_No || "N/A",
            new Date(row.Insurance_Valid_Till).toLocaleDateString(),
            row.Insurance_Company ? `${row.Insurance_Company} (${row.Insurance_Policy_No})` : "N/A",
            row.Insurance_Amount ? `₹${row.Insurance_Amount}` : "N/A",
        ].join("\t"));

        copyContent(headers, rows);
    };

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
                                    <h2>Vehicle Records</h2>
                                </div>

                                {loading ? (
                                    <p>Loading...</p>
                                ) : error ? (
                                    <p style={{ color: "red" }}>{error}</p>
                                ) : data.length > 0 ? (
                                    <Table
                                        columns={columns}
                                        data={data}
                                        handleCopy={handleCopy}
                                        handlePrint={handlePrint}
                                        responsive
                                        highlightOnHover
                                        pagination
                                    />
                                ) : (
                                    <p>No vehicle records available</p>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(AllTransportInfo), { ssr: false });