"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { Form, Row, Col, Container, } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";

import { getAllPublishers } from "@/Services";


const Publisher = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await getAllPublishers();
            setData(response?.data || []);
        } catch {
            setError("Failed to fetch publishers.");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        { name: "#", selector: (_, index) => index + 1, width: "80px" },
        { name: "Publisher Name", selector: (row) => row.publisherName || "N/A", sortable: true },
        { name: "Phone No.", selector: (row) => row.publisherPhoneNo || "N/A", sortable: true },
        { name: "Registration No.", selector: (row) => row.publisherRegistrationNo || "N/A", sortable: true },
        { name: "Fax No.", selector: (row) => row.publisherFaxNo || "N/A", sortable: true },
        { name: "Location", selector: (row) => row.publisherLocation || "N/A", sortable: true },
        { name: "Tax Ident No.", selector: (row) => row.taxIdentNo || "N/A", sortable: true },
        { name: "Mobile No.", selector: (row) => row.publisherMobileNo || "N/A", sortable: true },
        { name: "Email", selector: (row) => row.publisherEmail || "N/A", sortable: true },
    ];

    const breadcrumbItems = [
        { label: "Library", link: "/library/all-module" },
        { label: "Publisher Master reports", link: "null" },
    ];

    return (
        <>
            <div className="breadcrumbSheet position-relative">
                <Container>
                    <Row className="mt-1 mb-1">
                        <Col><BreadcrumbComp items={breadcrumbItems} /></Col>
                    </Row>
                </Container>
            </div>
            <section>
                <Container>
                    <div className="tableSheet mt-4">
                        <h2>Publisher Records</h2>
                        {loading && <p>Loading...</p>}
                        {error && <p className="text-danger">{error}</p>}
                        {!loading && !error && <Table columns={columns} data={data} />}
                    </div>
                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(Publisher), { ssr: false });
