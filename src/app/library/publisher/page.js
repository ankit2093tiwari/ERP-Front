"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import axios from "axios";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { CgAddR } from 'react-icons/cg';

const Publisher = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPublisher, setNewPublisher] = useState({
    publisherName: "",
    publisherPhoneNo: "",
    publisherRegistrationNo: "",
    publisherFaxNo: "",
    publisherLocation: "",
    taxIdentNo: "",
    publisherMobileNo: "",
    publisherEmail: "",
  });

  const columns = [
    { name: "#", selector: (row, index) => index + 1, sortable: false, width: "80px" },
    { name: "Publisher Name", selector: (row) => row.publisherName || "N/A", sortable: true },
    { name: "Phone No.", selector: (row) => row.publisherPhoneNo || "N/A", sortable: true },
    { name: "Registration No.", selector: (row) => row.publisherRegistrationNo || "N/A", sortable: true },
    { name: "Fax No.", selector: (row) => row.publisherFaxNo || "N/A", sortable: true },
    { name: "Location", selector: (row) => row.publisherLocation || "N/A", sortable: true },
    { name: "Tax Ident No.", selector: (row) => row.taxIdentNo || "N/A", sortable: true },
    { name: "Mobile No.", selector: (row) => row.publisherMobileNo || "N/A", sortable: true },
    { name: "Email", selector: (row) => row.publisherEmail || "N/A", sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button>
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/publishers");
      setData(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch publishers.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (newPublisher.publisherName.trim()) {
      try {
        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/publishers", newPublisher);
        setData((prevData) => [...prevData, response.data]);
        setNewPublisher({
          publisherName: "",
          publisherPhoneNo: "",
          publisherRegistrationNo: "",
          publisherFaxNo: "",
          publisherLocation: "",
          taxIdentNo: "",
          publisherMobileNo: "",
          publisherEmail: "",
        });
        setShowAddForm(false);
      } catch {
        setError("Failed to add publisher.");
      }
    } else {
      alert("Publisher Name is required.");
    }
  };

  const handleEdit = async (id) => {
    const publisher = data.find((row) => row._id === id);
    const updatedName = prompt("Enter new publisher name:", publisher?.publisherName || "");
    const updatedPhoneNo = prompt("Enter new phone number:", publisher?.publisherPhoneNo || "");

    if (updatedName && updatedPhoneNo) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/publishers/${id}`, {
          publisherName: updatedName,
          publisherPhoneNo: updatedPhoneNo,
        });
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? {
              ...row,
              publisherName: updatedName, 
              publisherPhoneNo: updatedPhoneNo
            } : row
          )
        );
      } catch {
        setError("Failed to update publisher.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this publisher?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/publishers/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch {
        setError("Failed to delete publisher.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [{ label: "Library", link: "/library/all-module" }, { label: "Publisher Master", link: "null" }]

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
          <Button onClick={() => setShowAddForm(true)} className="btn-add">
            <CgAddR /> Add Publisher
          </Button>
          
          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add Publisher</h2>
                <button className="closeForm" onClick={() => setShowAddForm(false)}>
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Publisher Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Publisher Name"
                      value={newPublisher.publisherName}
                      onChange={(e) => setNewPublisher({
                        ...newPublisher,
                        publisherName: e.target.value
                      })}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Phone No.</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Phone Number"
                      value={newPublisher.publisherPhoneNo}
                      onChange={(e) => setNewPublisher({ 
                        ...newPublisher, 
                        publisherPhoneNo: e.target.value 
                      })}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Registration No.</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Registration Number"
                      value={newPublisher.publisherRegistrationNo}
                      onChange={(e) => setNewPublisher({ 
                        ...newPublisher, 
                        publisherRegistrationNo: e.target.value 
                      })}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Fax No.</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Fax Number"
                      value={newPublisher.publisherFaxNo}
                      onChange={(e) => setNewPublisher({ 
                        ...newPublisher, 
                        publisherFaxNo: e.target.value 
                      })}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Location</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Location"
                      value={newPublisher.publisherLocation}
                      onChange={(e) => setNewPublisher({ 
                        ...newPublisher, 
                        publisherLocation: e.target.value 
                      })}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Tax Ident No.</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Tax Identification Number"
                      value={newPublisher.taxIdentNo}
                      onChange={(e) => setNewPublisher({ 
                        ...newPublisher, 
                        taxIdentNo: e.target.value 
                      })}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Mobile No.</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Mobile Number"
                      value={newPublisher.publisherMobileNo}
                      onChange={(e) => setNewPublisher({ 
                        ...newPublisher, 
                        publisherMobileNo: e.target.value 
                      })}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Email</FormLabel>
                    <FormControl
                      type="email"
                      placeholder="Enter Email"
                      value={newPublisher.publisherEmail}
                      onChange={(e) => setNewPublisher({ 
                        ...newPublisher, 
                        publisherEmail: e.target.value 
                      })}
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary mt-3">
                  Add Publisher
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Publisher Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && <Table columns={columns} data={data} />}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(Publisher), { ssr: false });