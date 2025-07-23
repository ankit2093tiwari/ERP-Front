"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Container, Row, Col } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";
import Table from "@/app/component/DataTable";
import { toast } from "react-toastify";
import { getAllBooks } from "@/Services";

const BookBank = () => {
    const breadcrumbItems = [
        { label: "Library", link: "/library/all-module" },
        { label: "Book Bank", link: "null" },
    ];

    const [bookBankData, setBookBankData] = useState([]);

    const fetchBookBankData = async () => {
        try {
            const response = await getAllBooks();
            setBookBankData(response?.data || []);
        } catch (error) {
            toast.error("Failed to fetch book bank data.");
            console.error(error);
        }
    };

    useEffect(() => {
        fetchBookBankData();
    }, []);

    const columns = [
        { name: "#", selector: (row, index) => index + 1, width: "60px" },
        { name: "Title", selector: row => row.bookTitle, sortable: true },
        { name: "Subject", selector: row => row.subject || "N/A", sortable: true },
        { name: "Author", selector: row => row.authorName1 || "N/A", sortable: true },
        { name: "Language", selector: row => row.language || "N/A", sortable: true },
        { name: "Volume", selector: row => row.itemVolume || "N/A" },
        { name: "Accession No", selector: row => row.accessionNo || "N/A" },
        { name: "Status", selector: row => row.itemStatus || "N/A" },
        { name: "Category", selector: row => row.bookCategory?.groupName || "N/A" },
        { name: "Publisher", selector: row => row.publisher?.publisherName || "N/A" },
        { name: "Vendor", selector: row => row.vendor?.organizationName || "N/A" },
        { name: "Rack", selector: row => row.rack?.rackName || "N/A" },
        { name: "Shelf", selector: row => row.shelf || "N/A" },
    ];

    const handleCopy = () => {
        const headers = [
            "Title", "Subject", "Author", "Language", "Volume", "Accession No", "Status", "Category", "Publisher", "Vendor", "Rack", "Shelf"
        ];
        const rows = bookBankData.map(item =>
            `${item.bookTitle}\t${item.subject}\t${item.authorName1}\t${item.language}\t${item.itemVolume}\t${item.accessionNo}\t${item.itemStatus}\t${item.bookCategory?.groupName}\t${item.publisher?.publisherName}\t${item.vendor?.organizationName}\t${item.rack?.rackName}\t${item.shelf}`
        );
        copyContent(headers, rows);
    };

    const handlePrint = () => {
        const headers = [[
            "Title", "Subject", "Author", "Language", "Volume", "Accession No", "Status", "Category", "Publisher", "Vendor", "Rack", "Shelf"
        ]];
        const rows = bookBankData.map(item => [
            item.bookTitle,
            item.subject,
            item.authorName1,
            item.language,
            item.itemVolume,
            item.accessionNo,
            item.itemStatus,
            item.bookCategory?.groupName,
            item.publisher?.publisherName,
            item.vendor?.organizationName,
            item.rack?.rackName,
            item.shelf,
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
                        <h2>Book Bank Records</h2>
                        <Table
                            columns={columns}
                            data={bookBankData}
                            handleCopy={handleCopy}
                            handlePrint={handlePrint}
                        />
                    </div>
                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(BookBank), { ssr: false });
