"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import styles from "@/app/medical/routine-check-up/page.module.css";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CasteMasterPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCasteName, setNewCasteName] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        ) : (
          row.caste_name || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <button className="editButton" onClick={() => handleSave(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button
              className="editButton"
              onClick={() => handleEdit(row._id, row.caste_name)}
            >
              <FaEdit />
            </button>
          )}
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

  const handlePrint = () => {
    const tableHeaders = [["#", "Caste Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.caste_name || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Caste Name"];
    const rows = data.map(
      (row, index) => `${index + 1}\t${row.caste_name || "N/A"}`
    );
    copyContent(headers, rows);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://erp-backend-fy3n.onrender.com/api/castes"
      );
      const fetchedData = response.data.data || [];
      const normalizedData = fetchedData.map((item) => ({
        ...item,
        caste_name: item.caste_name || "N/A",
      }));
      setData(normalizedData);
    } catch (err) {
      toast.error("Failed to fetch data. Please try again later.", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditedName(name);
  };

  const handleSave = async (id) => {
    try {
      await axios.put(
        `https://erp-backend-fy3n.onrender.com/api/castes/${id}`,
        {
          caste_name: editedName,
        }
      );
      fetchData();
      setEditingId(null);
      toast.success("Caste updated successfully!", { position: "top-right" });
    } catch (error) {
      toast.error("Failed to update data. Please try again later.", {
        position: "top-right",
      });
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(
          `https://erp-backend-fy3n.onrender.com/api/castes/${id}`
        );
        fetchData();
        toast.success("Caste deleted successfully!", {
          position: "top-right",
        });
      } catch (error) {
        toast.error("Failed to delete data. Please try again later.", {
          position: "top-right",
        });
      }
    }
  };

  const handleAdd = async () => {
    if (newCasteName.trim()) {
      try {
        const existingCaste = data.find(
          (caste) =>
            caste.caste_name.toLowerCase().trim() ===
            newCasteName.toLowerCase().trim()
        );
        if (existingCaste) {
          setIsPopoverOpen(false); // close the form if caste exists
          setNewCasteName(""); // clear input
          toast.warning("Caste name already exists!", {
            position: "top-right",
          });
          return;
        }

        await axios.post("https://erp-backend-fy3n.onrender.com/api/castes", {
          caste_name: newCasteName,
        });

        setNewCasteName("");
        setIsPopoverOpen(false);
        fetchData();
        toast.success("Caste added successfully!", {
          position: "top-right",
        });
      } catch (error) {
        toast.error("Failed to add data. Please try again later.", {
          position: "top-right",
        });
      }
    } else {
      toast.warning("Please enter a valid caste name.", {
        position: "top-right",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Master Entry", link: "/master-entry/all-module" },
    { label: "Caste Master", link: null },
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
          <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
            <CgAddR /> Add Caste
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Caste</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setNewCasteName("");
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Caste Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Caste Name"
                      value={newCasteName}
                      onChange={(e) => setNewCasteName(e.target.value)}
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Caste
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Caste Records</h2>
            {loading && <p>Loading...</p>}
            {!loading && (
              <Table
                columns={columns}
                data={data}
                handleCopy={handleCopy}
                handlePrint={handlePrint}
              />
            )}
          </div>
        </Container>
      </section>

      <ToastContainer />
    </>
  );
};

export default dynamic(() => Promise.resolve(CasteMasterPage), { ssr: false });
