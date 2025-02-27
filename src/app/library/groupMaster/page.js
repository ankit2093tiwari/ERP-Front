// Updated code working //with data
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb } from "react-bootstrap";
import axios from "axios";
import { CgAddR } from 'react-icons/cg';

const AddLibraryGroup = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // const [showAddForm, setShowAddForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editGroupName, setEditGroupName] = useState("");

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "80px" },
    {
      name: "Group Name",
      selector: (row) =>
        editId === row._id ? (
          <FormControl
            type="text"
            value={editGroupName}
            onChange={(e) => setEditGroupName(e.target.value)}
          />
        ) : (
          row.groupName || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editId === row._id ? (
            <button className="editButton" onClick={() => handleSave(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button className="editButton" onClick={() => handleEdit(row)}>
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


  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/libraryGroup");
      setData(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditId(row._id);
    setEditGroupName(row.groupName);
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/libraryGroup/${id}`, {
        groupName: editGroupName,
      });
      setData((prevData) => prevData.map((row) => (row._id === id ? { ...row, groupName: editGroupName } : row)));
      fetchData();
      setEditId(null);
    } catch (error) {
      setError("Failed to update data.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/libraryGroup/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
        fetchData();
      } catch (error) {
        setError("Failed to delete data.");
      }
    }
  };
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const onOpen = () => setIsPopoverOpen(true);
  const onClose = () => setIsPopoverOpen(false);
  const handleAdd = async () => {
    if (newGroupName.trim()) {
      try {
        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/libraryGroup", {
          groupName: newGroupName,
        });
        setData((prevData) => [...prevData, response.data]);
        setNewGroupName("");
        setIsPopoverOpen(false);
        fetchData();
      } catch (error) {
        setError("Failed to add data.");
      }
    }
  };

   const handlePrint = async () => {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
  
      const doc = new jsPDF();
      const tableHeaders = [["#", "Group Name"]];
      const tableRows = data.map((row, index) => [
        index + 1,
        row.groupName || "N/A",
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
      const headers = ["#", "Group Name"].join("\t");
      const rows = data.map((row, index) => `${index + 1}\t${row.groupName || "N/A"}`).join("\n");
      const fullData = `${headers}\n${rows}`;
  
      navigator.clipboard.writeText(fullData)
        .then(() => alert("Copied to clipboard!"))
        .catch(() => alert("Failed to copy table data to clipboard."));
    };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container className="">
      <Row className='mt-1 mb-1'>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/library/all-module">
              Library
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Add Group</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

       <Button onClick={onOpen} className="btn btn-primary">
        <CgAddR /> Add Group
      </Button>
      {isPopoverOpen && (

        <div className="cover-sheet">
          <div className="studentHeading"><h2> Add New Group</h2>
          <button className='closeForm' onClick={onClose}> X </button></div>
          <Form className="formSheet">
            <Row>
              <Col lg={6}>
                <FormLabel className="labelForm">Group Name</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Enter Group Name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </Col>
            </Row>
            <Button onClick={handleAdd} className="btn btn-primary">
              Add Group
            </Button>
          </Form>
        </div>
      )}


      <div className="tableSheet">
        <h2>Group Records</h2>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && <Table columns={columns} data={data} handleCopy={handleCopy} handlePrint={handlePrint} />}
      </div>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(AddLibraryGroup), { ssr: false });
