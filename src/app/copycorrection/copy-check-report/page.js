"use client";
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { copyContent, printContent } from "@/app/utils";
import { getAllCopyChecks } from "@/Services";

const CopyCorrectionReport = () => {
    const [records, setRecords] = useState([]);

    useEffect(() => {
        const fetchCorrections = async () => {
            try {
                const res = await getAllCopyChecks()
                setRecords(res.data || []);
            } catch (err) {
                toast.error("Failed to load copy correction records");
            }
        };

        fetchCorrections();
    }, []);

    const columns = [
        { name: "#", selector: (_, i) => i + 1, width: "60px" },
        {
            name: "Class",
            selector: (row) => row.classId?.class_name || "N/A",
            sortable: true,
        },
        {
            name: "Section",
            selector: (row) => row.sectionId?.section_name || "N/A",
            sortable: true,
        },
        {
            name: "Subject",
            selector: (row) => row.subjectId?.subject_details?.subject_name || "N/A",
            sortable: true,
        },
        {
            name: "Checked By",
            selector: (row) => row.checkBy?.userfullname || "N/A",
            sortable: true,
        },
        {
            name: "Check Date",
            selector: (row) => new Date(row.checkDate).toLocaleDateString(),
            sortable: true,
        },
        {
            name: "Students",
            selector: (row) => row.studentIds?.length || 0,
        },
    ];

    const handleCopy = () => {
        const headers = ["#", "Class", "Section", "Subject", "Checked By", "Check Date", "Students"];
        const rows = records.map((row, i) => [
            i + 1,
            row.classId?.class_name || "N/A",
            row.sectionId?.section_name || "N/A",
            row.subjectId?.subject_details?.subject_name || "N/A",
            row.checkBy?.userfullname || "N/A",
            new Date(row.checkDate).toLocaleDateString(),
            row.studentIds?.length || 0,
        ]);
        copyContent(headers, rows);
    };

    const handlePrint = () => {
        const headers = [["#", "Class", "Section", "Subject", "Checked By", "Check Date", "Students"]];
        const rows = records.map((row, i) => [
            i + 1,
            row.classId?.class_name || "N/A",
            row.sectionId?.section_name || "N/A",
            row.subjectId?.subject_details?.subject_name || "N/A",
            row.checkBy?.userfullname || "N/A",
            new Date(row.checkDate).toLocaleDateString(),
            row.studentIds?.length || 0,
        ]);
        printContent(headers, rows);
    };

    const breadcrumbItems = [
        { label: "Copy Correction", link: "/copycorrection/all-module" },
        { label: "Submitted Records", link: "null" },
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


                    <div className="tableSheet">
                        <div className="studentHeading">
                            <h2>Copy Correction Records</h2>
                        </div>
                        <Table
                            columns={columns}
                            data={records}
                            handleCopy={handleCopy}
                            handlePrint={handlePrint}
                        />
                    </div>
                </Container>
            </section>
        </>
    );
};

export default CopyCorrectionReport;
