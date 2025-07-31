"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Container, Row, Col, } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";
import { getAllIssuedBooks, getFineMaster, returnIssueBookById } from "@/Services";
import Table from "@/app/component/DataTable";

const ReturnBookReport = () => {
    const breadcrumbItems = [
        { label: "Library", link: "/library/all-module" },
        { label: "Return Book", link: "null" },
    ];

    const [data, setData] = useState([]);

    const fetchIssuedBooks = async () => {
        const response = await getAllIssuedBooks();
        setData(response.data);
    };

    useEffect(() => {
        fetchIssuedBooks();
    }, []);


    const columns = [
        { name: "#", selector: (row, index) => index + 1, width: "60px" },
        { name: "Book Name", selector: row => row.bookName, sortable: true },
        { name: "Issued To", selector: row => `${row.issuedToType}: ${row.issuedToName}`, sortable: true },
        { name: "Issue Period", selector: row => `${row.issuePeriod} Days`, sortable: true },
        { name: "Issue Date", selector: row => new Date(row.issueDate).toLocaleDateString(), sortable: true },
        { name: "Return Date", selector: row => row?.returned ? row?.returnDate : "Not Returned Yet", sortable: true },
    ];
    const handleCopyIssuedBooks = () => {
        const headers = ["#", "Book Name", "Issued To", "Issue Period", "Issue Date", "Expected Return"];
        const rows = data.map((entry, index) =>
            `${index + 1}\t${entry.bookName || "N/A"}\t${entry.issuedToType}: ${entry.issuedToName || "N/A"}\t${entry.issuePeriod} Days\t${new Date(entry.issueDate).toLocaleDateString()}\t${new Date(entry.expectedReturnDate).toLocaleDateString()}`
        );
        copyContent(headers, rows);
    };

    const handlePrintIssuedBooks = () => {
        const headers = [["#", "Book Name", "Issued To", "Issue Period", "Issue Date", "Expected Return"]];
        const rows = data.map((entry, index) => [
            index + 1,
            entry.bookName || "N/A",
            `${entry.issuedToType}: ${entry.issuedToName || "N/A"}`,
            `${entry.issuePeriod} Days`,
            new Date(entry.issueDate).toLocaleDateString(),
            new Date(entry.expectedReturnDate).toLocaleDateString()
        ]);
        printContent(headers, rows);
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
                    <div className="tableSheet mt-4">
                        <h2>Returned Book Records</h2>
                        <Table columns={columns}
                            data={data}
                            handleCopy={handleCopyIssuedBooks}
                            handlePrint={handlePrintIssuedBooks} />
                    </div>
                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(ReturnBookReport), { ssr: false });
