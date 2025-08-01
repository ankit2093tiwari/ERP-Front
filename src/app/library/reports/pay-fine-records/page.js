"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Container, Row, Col } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import Table from "@/app/component/DataTable";
import { getAllIssuedBooks } from "@/Services";
import { copyContent, printContent } from "@/app/utils";

const ReturnedBooks = () => {
    const breadcrumbItems = [
        { label: "Library", link: "/library/all-module" },
        { label: "Pay Fine Records", link: "null" },
    ];

    const [data, setData] = useState([]);

    const fetchReturnedBooks = async () => {
        const response = await getAllIssuedBooks();
        const filtered = response?.data?.filter((item) => item.returned === true);
        setData(filtered);
    };

    useEffect(() => {
        fetchReturnedBooks();
    }, []);

    const columns = [
        { name: "#", selector: (row, index) => index + 1, width: "60px" },
        { name: "BookName", selector: row => row.bookName || "N/A", sortable: true },
        { name: "IssuedTo", selector: row => row.issuedToType || "N/A", sortable: true },
        {
            name: "PersonName",
            selector: row => {
                return `${row.issuedToName || "N/A"}`;
            },
            wrap: true,
            sortable: true,
        },
        { name: "IssuePeriod", selector: row => `${row.issuePeriod} Days`, sortable: true },
        { name: "FineCharged", selector: row => row.fineCharged || 0, sortable: true },
        { name: "FinePaid", selector: row => row.finePaid || 0, sortable: true },
        // { name: "Excuse", selector: row => row.remarks || "-", sortable: true },
        { name: "DateofIssue", selector: row => new Date(row.issueDate).toLocaleDateString(), sortable: true },
        { name: "DateofReturn", selector: row => new Date(row.returnDate).toLocaleDateString(), sortable: true },
    ];

    const handleCopy = () => {
        const headers = [
            "#", "BookName", "IssuedTo", "PersonDetails", "IssuePeriod", "FineCharged", "FinePaid", "Excuse", "DateofIssue", "DateofReturn"
        ];
        const rows = data.map((row, index) =>
            `${index + 1}\t${row.bookName}\t${row.issuedToType}\t${row.issuedToName},${row.issuePeriod} Days\t${row.fineCharged}\t${row.finePaid}\t${row.remarks}\t${new Date(row.issueDate).toLocaleDateString()}\t${new Date(row.returnDate).toLocaleDateString()}`
        );
        copyContent(headers, rows);
    };

    const handlePrint = () => {
        const headers = [[
            "#", "BookName", "IssuedTo", "PersonDetails", "IssuePeriod", "FinePaid", "DateofIssue", "DateofReturn"
        ]];
        const rows = data.map((row, index) => [
            index + 1,
            row.bookName || "N/A",
            row.issuedToType || "N/A",
            `${row.issuedToName || "-"}`,
            `${row.issuePeriod} Days`,
            row.finePaid || 0,
            new Date(row.issueDate).toLocaleDateString(),
            new Date(row.returnDate).toLocaleDateString(),
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
                        <h2>Pay Fine Records</h2>
                        <Table
                            columns={columns}
                            data={data}
                            handleCopy={handleCopy}
                            handlePrint={handlePrint}
                        />
                    </div>
                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(ReturnedBooks), { ssr: false });
