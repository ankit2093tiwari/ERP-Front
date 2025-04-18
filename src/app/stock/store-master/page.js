"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaPlus, FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
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
  Alert
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable"; // Ensure the path is correct
import BreadcrumbComp from "@/app/component/Breadcrumb";

const StoreMaster = () => {
  const [data, setData] = useState([]); // Data for the table
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error message
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
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
      // setIsPopoverOpen(false);
      setShowAddForm(false);
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
  const handleEdit = (id, name) => {
    setEditId(id);
    setEditName(name);
  };

  const handleSave = async (id) => {
    setLoading(true);
    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/store/${id}`, {
        storeName: editName,
      });
      setData((prevData) =>
        prevData.map((item) =>
          item._id === id ? { ...item, storeName: editName } : item
        )
      );
      fetchData();
      setEditId(null);
    } catch (err) {
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
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to delete store. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    const tableHeaders = [["#", "Store Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.storeName || "N/A",
    ]);

    autoTable(doc, {
      head: tableHeaders,
      body: tableRows,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Open the print dialog instead of directly downloading
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl);
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleCopy = () => {
    const headers = ["#", "Store Name"].join("\t");
    const rows = data.map((row, index) => `${index + 1}\t${row.storeName || "N/A"}`).join("\n");
    const fullData = `${headers}\n${rows}`;

    navigator.clipboard.writeText(fullData)
      .then(() => alert("Copied to clipboard!"))
      .catch(() => alert("Failed to copy table data to clipboard."));
  };

  useEffect(() => {
    fetchData();
  }, []);
  const columns = [
    { name: "#", selector: (_, index) => index + 1, sortable: false, width: "80px" },
    {
      name: "Store Name",
      selector: (row) =>
        editId === row._id ? (
          <FormControl
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
        ) : (
          row.storeName || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editId === row._id ? (
            <button className="editButton btn-success" onClick={() => handleSave(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button className="editButton" onClick={() => handleEdit(row._id, row.storeName)}>
              <FaEdit />
            </button>
          )}
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];
  const breadcrumbItems = [{ label: "Stock", link: "/stock/all-module" }, { label: "Store Master", link: "null" }]
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
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Row>
            <Col>
              <Button onClick={onOpen} className="btn-add">
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
                  <Table columns={columns} data={data} handleCopy={handleCopy} handlePrint={handlePrint} />
                ) : (
                  <p>No stores available.</p>
                )}
              </div>
            </Col>
          </Row>
        </Container >
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(StoreMaster), { ssr: false });
