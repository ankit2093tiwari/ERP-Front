"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import { Form, Row, Col, Container, Button, Breadcrumb, Modal } from "react-bootstrap";
import axios from "axios";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const SchoolAccount = () => {
  const [data, setData] = useState([]); // School records data
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [selectedSchool, setSelectedSchool] = useState(null); // Selected school for editing
  const [schoolName, setSchoolName] = useState(""); // School name input for editing

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
          {/* <button
            className="editButton btn-danger"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrashAlt />
          </button> */}
        </div>
      ),
    },
  ];

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/schools");
      const fetchedData = response.data.data || [];
      setData(fetchedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Delete an entry
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/schools/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete data. Please try again later.");
      }
    }
  };

  // Handle edit button click
  const handleEdit = (school) => {
    setSelectedSchool(school);
    setSchoolName(school.school_name);
    setShowModal(true);
  };

  // Handle update school
  const handleUpdate = async () => {
    if (!selectedSchool) return;

    try {
      const updatedSchool = {
        school_name: schoolName, // Only send the field to be updated
      };

      const response = await axios.put(
        `https://erp-backend-fy3n.onrender.com/api/schools/${selectedSchool._id}`, // Use selectedSchool._id
        updatedSchool
      );

      if (response.data.success) {
        console.log("Updated School:", response.data.data); // Debugging
        // Update the local state with the new data
        setData((prevData) =>
          prevData.map((row) =>
            row._id === selectedSchool._id ? { ...row, school_name: schoolName } : row
          )
        );
        setShowModal(false); // Close the modal
      }
    } catch (error) {
      console.error("Error updating school:", error);
      setError("Failed to update school. Please try again later.");
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [{ label: "Fee", link: "/fees/all-module" }, { label: "school-account", link: "null" }]

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
                <h2>School Account Records</h2>
                {loading && <p>Loading...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
                {!loading && !error && <Table columns={columns} data={data} />}
              </div>
            </Col>
          </Row>

          {/* Edit Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Edit School</Modal.Title>
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
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
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