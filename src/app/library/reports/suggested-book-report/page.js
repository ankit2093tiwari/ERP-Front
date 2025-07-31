"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";

import { Form, Row, Col, Container, } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";

import {
    getAllBookSuggestions,

} from "@/Services";

const NewBookSuggestion = () => {

    const [data, setData] = useState([]);

    const fetchData = async () => {
        const response = await getAllBookSuggestions();
        response.success && setData(response?.data)
    }

    useEffect(() => {
        fetchData()
    }, []);

    const breadcrumbItems = [
        { label: "Library", link: "/library/all-module" },
        { label: "Suggested Book report", link: "null" }
    ];


    const columns = [
        { name: "#", selector: (row, index) => index + 1, sortable: false, width: "80px" },
        { name: "Item Group", selector: (row) => row.itemGroup?.groupName || "N/A" },
        { name: "Book Category", selector: (row) => row.bookCategory?.groupName || "N/A" },
        { name: "Book Name", selector: (row) => row.bookName || "N/A" },
        { name: "Language", selector: (row) => row.itemLang || "N/A" },
        { name: "Author Name", selector: (row) => row.authorName || "N/A" },
        { name: "Subject", selector: (row) => row.subject || "N/A" },
        { name: "Publisher Name", selector: (row) => row.publisherName || "N/A" },
        { name: "Publish Year", selector: (row) => row.publishYear || "N/A" },
        { name: "Edition", selector: (row) => row.edition || "N/A" },

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

                    <div className="tableSheet mt-4">
                        <h2>Library Book Suggestions</h2>
                        <Table columns={columns} data={data} />
                    </div>
                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(NewBookSuggestion), { ssr: false });
