"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaPlus, FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import {
  Container,
  Row,
  Col,
  Breadcrumb,
  Form,
  FormLabel,
  FormControl,
  Button,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable"; // Ensure the path is correct

const StoreMaster = () => {
  const [data, setData] = useState([]); // Data for the table
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error message
  const [successMessage, setSuccessMessage] = useState(""); // Success message
  // const [showAddForm, setShowAddForm] = useState(false); 
  const [newStore, setNewStore] = useState({ storeName: "" }); // New store form state

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/stores");
      setData(response.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch stores. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add new store
  const handleAdd = async () => {
    if (!newStore.storeName.trim()) {
      alert("Please enter a store name.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "https://erp-backend-fy3n.onrender.com/api/store",
        newStore
      );

      // Update data immediately with the correct structure
      const addedStore = response.data;
      setData((prevData) => [...prevData, addedStore]);
      setNewStore({ storeName: "" });
      setIsPopoverOpen(false);
      setSuccessMessage("Store added successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to add store. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // const handleAdd = async () => {
  //   if (newStoreName.trim()) {
  //     try {
  //       const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/store", {
  //         storeName: newStoreName,
  //       });
  //       setData((prevData) => [...prevData, response.data]);
  //       setNewStoreName("");
  //       setShowAddForm(false);
  //       setSuccessMessage("Store added successfully!");
  //       fetchData();
  //     } catch (error) {
  //       console.error("Error adding data:", error);
  //       setError("Failed to add data. Please try again later.");
  //     }
  //   } else {
  //     alert("Please enter a valid store name.");
  //   }
  // };

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const onOpen = () => setIsPopoverOpen(true);
  const onClose = () => setIsPopoverOpen(false);


  // Edit store
  const handleEdit = async (id) => {
    const store = data.find((item) => item._id === id);
    const updatedName = prompt("Enter new store name:", store?.storeName || "");
    if (!updatedName) return;

    setLoading(true);
    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/store/${id}`, {
        storeName: updatedName,
      });
      setData((prevData) =>
        prevData.map((item) =>
          item._id === id ? { ...item, storeName: updatedName } : item
        )
      );
      setSuccessMessage("Store updated successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to update store. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // Delete store
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this store?")) return;
    setLoading(true);
    try {
      await axios.delete(`https://erp-backend-fy3n.onrender.com/api/store/${id}`);
      setData((prevData) => prevData.filter((item) => item._id !== id));
      setSuccessMessage("Store deleted successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to delete store. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const columns = [
    {
      name: "#",
      selector: (_, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Store Name",
      selector: (row) => row.storeName || "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button>
          <button
            className="editButton btn-danger"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];
  return (
    <Container>
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/stock/all-module">Stock Module</Breadcrumb.Item>
            <Breadcrumb.Item active>Store Master</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Row>
        <Col>
          <Button onClick={onOpen} className="btn btn-primary">
            <CgAddR /> Add Store
          </Button>
          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading"><h2>Add Store</h2> 
              <button className='closeForm' onClick={onClose}> X </button>
              </div>

               <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Store Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Store Name"
                      value={newStore.storeName}
                      onChange={(e) =>
                        setNewStore({
                          ...newStore,
                          storeName: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Button onClick={handleAdd} className="btn btn-primary mt-4">
                      Add Store
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          )}
        </Col>
      </Row>
      <Row>
        <Col>
          <div className="tableSheet">
            <h2>Store Records</h2>
            {loading ? (
              <p>Loading...</p>
            ) : data.length > 0 ? (
              <Table columns={columns} data={data} />
            ) : (
              <p>No stores available.</p>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(StoreMaster), { ssr: false });
