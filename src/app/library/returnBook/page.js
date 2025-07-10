"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaUndo } from "react-icons/fa";
import { Container, Row, Col, Form, FormLabel, FormControl, Button } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";
import { getAllIssuedBooks, getFineMaster, returnIssueBookById } from "@/Services";
import Table from "@/app/component/DataTable";
import { toast } from "react-toastify";
import usePagePermission from "@/hooks/usePagePermission";

const ReturnBook = () => {
    const {hasSubmitAccess}=usePagePermission()
    const breadcrumbItems = [
        { label: "Library", link: "/library/all-module" },
        { label: "Return Book", link: "null" },
    ];

    const [data, setData] = useState([]);
    const [issuedBooks, setIssuedBooks] = useState([]);
    const [selectedBookId, setSelectedBookId] = useState("");
    const [selectedBook, setSelectedBook] = useState(null);
    const [totalFine, setTotalFine] = useState(0);

    const [payableAmount, setPayableAmount] = useState(0);
    const [perDayFine, setPerDayFine] = useState(0);
    const [remarks, setRemarks] = useState("");

    const fetchIssuedBooks = async () => {
        const response = await getAllIssuedBooks();
        const filtered = response?.data?.filter((item) => item.returned === false);
        setIssuedBooks(filtered);
        setData(filtered);
    };

    useEffect(() => {
        fetchIssuedBooks();
    }, []);

    const fetchFineMaster = async () => {
        const response = await getFineMaster();
        selectedBook?.issuedToType === 'Student'
            ? setPerDayFine(response?.data.studentFine)
            : setPerDayFine(response?.data.teacherFine);
    };

    useEffect(() => {
        if (selectedBook) fetchFineMaster();
    }, [selectedBook]);

    useEffect(() => {
        if (selectedBook && perDayFine) {
            const expectedReturn = new Date(selectedBook.expectedReturnDate);
            const today = new Date();
            expectedReturn.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            const timeDiff = today.getTime() - expectedReturn.getTime();
            const lateDays = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
            const calculatedFine = lateDays * perDayFine;
            setTotalFine(calculatedFine);
            setPayableAmount(calculatedFine);
        } else {
            setTotalFine(0);
            setPayableAmount(0);
        }
    }, [selectedBook, perDayFine]);

    const handleReturnBook = (row) => {
        setSelectedBookId(row._id);
        const book = issuedBooks.find((b) => b._id === row._id);
        setSelectedBook(book || null);
        setRemarks("");
    };

    const handleReturnSubmit = async () => {
        if (!remarks.trim()) {
            toast.warn("Remarks are required before returning the book.");
            return;
        }

        try {
            const response = await returnIssueBookById(selectedBookId, { remarks });
            toast.success(response.message || "Book returned successfully");
            setSelectedBook(null);
            fetchIssuedBooks();
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to return book");
        }
    };

    const columns = [
        { name: "#", selector: (row, index) => index + 1, width: "60px" },
        { name: "Book Name", selector: row => row.bookName, sortable: true },
        { name: "Issued To", selector: row => `${row.issuedToType}: ${row.issuedToName}`, sortable: true },
        { name: "Issue Period", selector: row => `${row.issuePeriod} Days`, sortable: true },
        { name: "Issue Date", selector: row => new Date(row.issueDate).toLocaleDateString(), sortable: true },
        hasSubmitAccess &&{
            name: "Actions",
            cell: (row) => (
                <div className="d-flex gap-2">
                    <button className="editButton bg-success" onClick={() => handleReturnBook(row)}>
                        Return <FaUndo />
                    </button>
                </div>
            ),
        },
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
                    {selectedBook && (
                        <div className="cover-sheet mt-4">
                            <div className="studentHeading">

                                <h2>Book Details</h2>
                                <button className="closeForm" onClick={() => setSelectedBook(null)}>X</button>
                            </div>
                            <Form className="formSheet">

                                {/* <Col lg={6}><FormLabel>Barcode</FormLabel><FormControl className="mb-2" disabled value={selectedBook?.barcode} /></Col> */}
                                <Row>
                                    <Col lg={6}><FormLabel>Book Title</FormLabel><FormControl className="mb-2" disabled value={selectedBook.bookName} /></Col>
                                    <Col lg={6}><FormLabel>Publisher</FormLabel><FormControl className="mb-2" disabled value={selectedBook.publisher} /></Col>
                                    <Col lg={6}><FormLabel>Distributor</FormLabel><FormControl className="mb-2" disabled value={selectedBook.vendor} /></Col>
                                    <Col lg={6}><FormLabel>Author</FormLabel><FormControl className="mb-2" disabled value={selectedBook.authorName} /></Col>
                                    <Col lg={6}><FormLabel>Sub-title</FormLabel><FormControl className="mb-2" disabled value={selectedBook.bookSubTitle} /></Col>
                                    <Col lg={6}><FormLabel>Language</FormLabel><FormControl className="mb-2" disabled value={selectedBook.language} /></Col>
                                    <Col lg={6}><FormLabel>Accession No</FormLabel><FormControl className="mb-2" disabled value={selectedBook.accessionNo} /></Col>
                                    <Col lg={6}><FormLabel>Issued Date</FormLabel><FormControl className="mb-2" disabled value={selectedBook.issueDate} /></Col>
                                    <Col lg={6}><FormLabel>Last Return Date</FormLabel><FormControl className="mb-2" disabled value={selectedBook.expectedReturnDate} /></Col>
                                    <Col lg={6}><FormLabel>Per Day Fine</FormLabel><FormControl className="mb-2" disabled value={perDayFine} /></Col>
                                    <Col lg={6}><FormLabel>Total Fine</FormLabel><FormControl className="mb-2" disabled value={totalFine} /></Col>
                                    <Col lg={6}><FormLabel>Payable Amount</FormLabel><FormControl className="mb-2" disabled value={payableAmount} /></Col>
                                    <Col lg={12}>
                                        <FormLabel>Remarks</FormLabel>
                                        <FormControl className="mb-2"
                                            required
                                            as="textarea"
                                            rows={2}
                                            placeholder="Remarks"
                                            value={remarks}
                                            isInvalid={!remarks.trim()}
                                            onChange={(e) => setRemarks(e.target.value)}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Remarks are required
                                        </Form.Control.Feedback>
                                    </Col>
                                </Row>
                                <Button className="mt-3" onClick={handleReturnSubmit}>Return Book</Button>
                            </Form>
                        </div>
                    )}
                    <div className="tableSheet mt-4">
                        <h2>Issued Book Records</h2>
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

export default dynamic(() => Promise.resolve(ReturnBook), { ssr: false });
