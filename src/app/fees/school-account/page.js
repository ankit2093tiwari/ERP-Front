"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import { Form, Row, Col, Container, Button, Breadcrumb, Modal } from "react-bootstrap";
import axios from "axios";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";

const SchoolAccount = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [currentSchoolId, setCurrentSchoolId] = useState(null);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "80px",
    },
    {
      name: "School Name",
      selector: (row) => row.school_name || "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="editButton btn-primary"
            onClick={() => handleEdit(row)}
          >
            <FaEdit />
          </button>
        </div>
      ),
    },
  ];

  // Fetch the single school instance
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/schools/all");
      const schoolData = response.data.data || [];
      setData(schoolData);
      if (schoolData.length > 0) {
        setCurrentSchoolId(schoolData[0]._id);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch school data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = (school) => {
    setSchoolName(school.school_name);
    setShowModal(true);
  };

  const handleCopy = () => {
    const headers = ["#", "School Name"];
    const rows = data.map((row, index) => `${index + 1}\t${row.school_name || "N/A"}`);
    copyContent(headers, rows);
  };

  const handlePrint = async () => {
    const tableHeaders = [["#", "School Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.school_name || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  // Handle update school name
  const handleUpdate = async () => {
    if (!schoolName.trim()) {
      setError("School name cannot be empty");
      return;
    }

    try {
      const response = await axios.put(
        "https://erp-backend-fy3n.onrender.com/api/schools", 
        { school_name: schoolName }
      );

      if (response.data.success) {
        // Update the local state with the new data
        setData([response.data.data]);
        setShowModal(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error updating school:", error);
      setError(error.response?.data?.message || "Failed to update school name");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Fee", link: "/fees/all-module" }, 
    { label: "school-account", link: "null" }
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
          <Row>
            <Col>
              <div className="tableSheet">
                <h2>School Account</h2>
                {loading && <p>Loading...</p>}
                {error && <p className="text-danger">{error}</p>}
                {!loading && !error && (
                  <Table 
                    columns={columns} 
                    data={data} 
                    handleCopy={handleCopy} 
                    handlePrint={handlePrint}
                  />
                )}
              </div>
            </Col>
          </Row>

          {/* Edit Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Update School Name</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="schoolName">
                  <Form.Label>School Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                  />
                </Form.Group>
                {error && <p className="text-danger mt-2">{error}</p>}
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => {
                setShowModal(false);
                setError("");
              }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleUpdate}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(SchoolAccount), { ssr: false });