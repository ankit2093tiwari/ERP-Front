
"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { FaEye, FaTrashAlt } from "react-icons/fa";
import { copyContent, printContent } from "@/app/utils";
import { CgAddR } from 'react-icons/cg';
import { Form, Row, Col, Container, FormLabel, FormSelect, FormControl, Button } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { addNewIssuedBook, getAllBooks, getAllStudents, getAllEmployee, getAllIssuedBooks, deleteIssuedBook } from "@/Services";
import { toast } from "react-toastify";

const IssueBook = () => {
  const [data, setData] = useState([]);
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingIssued, setLoadingIssued] = useState(true);


  const [formData, setFormData] = useState({
    book: "",
    issueTo: "",
    issuedToId: "",
    issuePeriod: "",
    issueDate: new Date().toISOString().split('T')[0],
  });

  const breadcrumbItems = [
    { label: "Library", link: "/library/all-module" },
    { label: "Issue Book", link: "null" }
  ];

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "60px" },
    { name: "Book Name", selector: row => row.bookName, sortable: true, },
    { name: "Issued To", selector: row => `${row.issuedToType}: ${row.issuedToName}`, sortable: true, },
    { name: "Issue Period", selector: row => `${row.issuePeriod} Days`, sortable: true, },
    { name: "Issue Date", selector: row => new Date(row.issueDate).toLocaleDateString(), sortable: true, },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton btn-danger" onClick={() => handleDelete(row?._id)}><FaTrashAlt /></button>
        </div>
      )
    }
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.book) newErrors.book = "Book is required";
    if (!formData.issueTo) newErrors.issueTo = "Issue to is required";
    if (!formData.issuedToId) newErrors.issuedToId = `${formData.issueTo || 'Recipient'} is required`;
    if (!formData.issuePeriod) newErrors.issuePeriod = "Issue period is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const fetchIssuedBooks = async () => {
    setLoadingIssued(true);
    const response = await getAllIssuedBooks();
    if (response?.success) {
      const filtered = response?.data?.filter((item) => item.returned === false);
      setData(filtered);
    }
    setLoadingIssued(false);
  };


  const fetchBooks = async () => {
    const response = await getAllBooks()
    if (response?.success) {
      setBooks(response?.data)
    }
  }

  const fetchStudents = async () => {
    const response = await getAllStudents()
    if (response?.success) {
      setStudents(response?.data)
    }
  }

  const fetchEmployees = async () => {
    const response = await getAllEmployee()
    if (response?.success) {
      setEmployees(response?.data)
    }
  }

  useEffect(() => {
    fetchIssuedBooks()
    fetchBooks()
    fetchStudents()
    fetchEmployees()
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const selectedBook = books.find(b => b._id === formData.book);
    const selectedPerson = formData.issueTo === "Student"
      ? students.find(s => s._id === formData.issuedToId)
      : employees.find(e => e._id === formData.issuedToId);

    if (!selectedPerson) {
      toast.error("Selected person not found");
      return;
    }

    const payload = {
      book: formData.book,
      issuedToType: formData.issueTo,
      issuedToId: formData.issuedToId,
      issuedToName: formData.issueTo === "Student"
        ? `${selectedPerson.first_name} ${selectedPerson.last_name}`
        : selectedPerson.employee_name || selectedPerson.full_name,
      issuePeriod: parseInt(formData.issuePeriod),
      issueDate: new Date(formData.issueDate),
      expectedReturnDate: new Date(Date.now() + parseInt(formData.issuePeriod) * 24 * 60 * 60 * 1000)
    };

    try {
      const res = await addNewIssuedBook(payload);
      toast.success(res?.message || "Book issued successfully");
      setShowAddForm(false);
      setFormData({
        book: "",
        issueTo: "",
        issuedToId: "",
        issuePeriod: "",
        issueDate: new Date().toISOString().split('T')[0]
      });
      fetchIssuedBooks();
    } catch (error) {
      console.log("Failed to issue book", error);
      toast.error(error?.response?.data?.message || "Failed to issue book");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure to want to delete this record?")) return;

    try {
      const response = await deleteIssuedBook(id);
      toast.success(response?.message || "Issued Book record deleted successfully");
      fetchIssuedBooks();
    } catch (error) {
      console.log("Failed to delete record", error);
      toast.error(error?.response?.data?.message || "Failed to delete record");
    }
  };

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
            <Col><BreadcrumbComp items={breadcrumbItems} /></Col>
          </Row>
        </Container>
      </div>
      <section>
        <Container>
          <Button onClick={() => setShowAddForm(true)} className="btn-add">
            <CgAddR /> Issue Book
          </Button>

          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Issue Book</h2>
                <button className="closeForm" onClick={() => setShowAddForm(false)}>X</button>
              </div>
              <Form className="formSheet" onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Book <span className="text-danger">*</span></FormLabel>
                    <FormSelect
                      name="book"
                      value={formData.book}
                      onChange={handleChange}
                      isInvalid={!!errors.book}
                    >
                      <option value="">Select Book</option>
                      {books.map(book => (
                        <option key={book._id} value={book._id}>{book.bookTitle}</option>
                      ))}
                    </FormSelect>
                    <Form.Control.Feedback type="invalid">
                      {errors.book}
                    </Form.Control.Feedback>
                  </Col>

                  <Col lg={6}>
                    <FormLabel>Issue To <span className="text-danger">*</span></FormLabel>
                    <FormSelect
                      name="issueTo"
                      value={formData.issueTo}
                      onChange={handleChange}
                      isInvalid={!!errors.issueTo}
                    >
                      <option value="">Select</option>
                      <option value="Student">Student</option>
                      <option value="Employee">Faculty</option>
                    </FormSelect>
                    <Form.Control.Feedback type="invalid">
                      {errors.issueTo}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                {formData.issueTo && (
                  <Row className="mb-3">
                    <Col lg={6}>
                      <FormLabel>Select {formData.issueTo} <span className="text-danger">*</span></FormLabel>
                      <FormSelect
                        name="issuedToId"
                        value={formData.issuedToId}
                        onChange={handleChange}
                        isInvalid={!!errors.issuedToId}
                      >
                        <option value="">Select</option>
                        {(formData.issueTo === "Student" ? students : employees).map(person => (
                          <option key={person._id} value={person._id}>
                            {formData.issueTo === "Student"
                              ? `${person.first_name} ${person.last_name}`
                              : person.employee_name || person.full_name}
                          </option>
                        ))}
                      </FormSelect>
                      <Form.Control.Feedback type="invalid">
                        {errors.issuedToId}
                      </Form.Control.Feedback>
                    </Col>
                    <Col lg={6}>
                      <FormLabel>Issue Period (Days) <span className="text-danger">*</span></FormLabel>
                      <FormSelect
                        name="issuePeriod"
                        value={formData.issuePeriod}
                        onChange={handleChange}
                        isInvalid={!!errors.issuePeriod}
                      >
                        <option value="">Select</option>
                        {[...Array(7)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1} Day{i > 0 && "s"}</option>
                        ))}
                      </FormSelect>
                      <Form.Control.Feedback type="invalid">
                        {errors.issuePeriod}
                      </Form.Control.Feedback>
                    </Col>
                  </Row>
                )}

                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Issue Date</FormLabel>
                    <FormControl type="date" value={formData.issueDate} disabled />
                  </Col>
                </Row>

                <Button type="submit">Issue Book</Button>
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Issued Book Records</h2>
            {loadingIssued ? (
              <div className="text-center py-4">
                <p>Loading..</p>
                {/* <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div> */}
              </div>
            ) : (
              <Table
                columns={columns}
                data={data}
                handleCopy={handleCopyIssuedBooks}
                handlePrint={handlePrintIssuedBooks}
              />
            )}
          </div>

        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(IssueBook), { ssr: false });
