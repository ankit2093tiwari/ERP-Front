"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import axios from "axios";

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
    {
      name: "Publisher Name", selector: (row) => row.
        publisherName || "N/A", sortable: true
    },
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
  };


  // const handleAdd = async () => {

  //   if (newPublisher.publisherName) {
  //     try {
  //       const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/publishers", newPublisher);
  //       setData((prevData) => [...prevData, response.data]);
  //       setNewPublisher({
  //         publisherName: "",
  //         publisherPhoneNo: "",
  //         publisherRegistrationNo: "",
  //         publisherFaxNo: "",
  //         publisherLocation: "",
  //         taxIdentNo: "",
  //         publisherMobileNo: "",
  //         publisherEmail: "",
  //       });
  //       setShowAddForm(false);
  //     } catch {
  //       setError("Failed to add publisher.");
  //     }
  //   } else {
  //     alert("Publisher Name is required.");
  //   }
  // };

  const handleEdit = async (id) => {
    const publisher = data.find((row) => row._id === id);
    const updatedName = prompt("Enter new publisher name:", publisher?.
      publisherName || "");
    const updatedPhoneNo = prompt("Enter new phone number:", publisher?.publisherPhoneNo || "");

    if (updatedName && updatedPhoneNo) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/publishers/${id}`, {

          publisherName: updatedName,
          publisherPhoneNo: updatedPhoneNo,
        });
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, 
              publisherName: updatedName, publisherPhoneNo: updatedPhoneNo } : row
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

  return (
    <Container className={styles.formContainer}>
      <Form className={styles.form}>
        <Button onClick={() => setShowAddForm(!showAddForm)} className={`mb-4 ${styles.search}`}>
          Add Publisher
        </Button>
        {showAddForm && (
          <div className="mb-4">
            <Row>
              <Col lg={6}>
                <FormLabel>Publisher Name</FormLabel>
                <FormControl
                  type="text"
                  value={newPublisher.
                    publisherName}
                  onChange={(e) => setNewPublisher({ ...newPublisher, 
                    publisherName: e.target.value })}
                />
              </Col>
              <Col lg={6}>
                <FormLabel>Phone No.</FormLabel>
                <FormControl
                  type="text"
                  value={newPublisher.publisherPhoneNo}
                  onChange={(e) => setNewPublisher({ ...newPublisher, publisherPhoneNo: e.target.value })}
                />
              </Col>
            </Row>
            <Row>
              <Col lg={6}>
                <FormLabel>Registration No.</FormLabel>
                <FormControl
                  type="text"
                  value={newPublisher.publisherRegistrationNo}
                  onChange={(e) => setNewPublisher({ ...newPublisher, publisherRegistrationNo: e.target.value })}
                />
              </Col>
              <Col lg={6}>
                <FormLabel>Fax No.</FormLabel>
                <FormControl
                  type="text"
                  value={newPublisher.publisherFaxNo}
                  onChange={(e) => setNewPublisher({ ...newPublisher, publisherFaxNo: e.target.value })}
                />
              </Col>
            </Row>
            <Row>
              <Col lg={6}>
                <FormLabel>Location</FormLabel>
                <FormControl
                  type="text"
                  value={newPublisher.publisherLocation}
                  onChange={(e) => setNewPublisher({ ...newPublisher, publisherLocation: e.target.value })}
                />
              </Col>
              <Col lg={6}>
                <FormLabel>Tax Ident No.</FormLabel>
                <FormControl
                  type="text"
                  value={newPublisher.taxIdentNo}
                  onChange={(e) => setNewPublisher({ ...newPublisher, taxIdentNo: e.target.value })}
                />
              </Col>
            </Row>
            <Row>
              <Col lg={6}>
                <FormLabel>Mobile No.</FormLabel>
                <FormControl
                  type="text"
                  value={newPublisher.publisherMobileNo}
                  onChange={(e) => setNewPublisher({ ...newPublisher, publisherMobileNo: e.target.value })}
                />
              </Col>
              <Col lg={6}>
                <FormLabel>Email</FormLabel>
                <FormControl
                  type="email"
                  value={newPublisher.publisherEmail}
                  onChange={(e) => setNewPublisher({ ...newPublisher, publisherEmail: e.target.value })}
                />
              </Col>
            </Row>
            <Button onClick={handleAdd} className={styles.search}>
              Add Publisher
            </Button>
          </div>
        )}
        <h2>Publisher Records</h2>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && <Table columns={columns} data={data} />}
      </Form>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(Publisher), { ssr: false });
