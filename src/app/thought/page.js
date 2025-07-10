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
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { addNewThought, deleteThoughtById, getAllThoughts, updateThoughtById } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const Thought = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission()
  const today = new Date().toISOString().split("T")[0];
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [newThought, setNewThought] = useState({ date: today, thought_name: "" });
  const [newErrors, setNewErrors] = useState({});

  const [editRowId, setEditRowId] = useState(null);
  const [editValues, setEditValues] = useState({ date: today, thought_name: "" });
  const [editErrors, setEditErrors] = useState({});

  const validate = (values) => {
    const errors = {};
    if (!values.date) errors.date = "Date is required";
    if (!values.thought_name || values.thought_name.trim() === "")
      errors.thought_name = "Thought name is required";
    return errors;
  };

  const handleInputChange = (e, field) => {
    setEditValues({ ...editValues, [field]: e.target.value });
    setEditErrors({ ...editErrors, [field]: "" });
  };

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "80px" },
    {
      name: "Date",
      selector: (row) =>
        editRowId === row._id ? (
          <FormControl
            type="date"
            value={editValues.date || today}
            onChange={(e) => handleInputChange(e, "date")}
          />
        ) : (
          new Date(row.date).toLocaleDateString("en-GB")
        ),
    },
    {
      name: "Thought Name",
      selector: (row) =>
        editRowId === row._id ? (
          <>
            <FormControl
              type="text"
              value={editValues.thought_name}
              onChange={(e) => handleInputChange(e, "thought_name")}
              isInvalid={!!editErrors.thought_name}
            />
            {editErrors.thought_name && (
              <div className="text-danger">{editErrors.thought_name}</div>
            )}
          </>
        ) : (
          row.thought_name || "N/A"
        ),
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editRowId === row._id ? (
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
      const response = await getAllThoughts()
      setData(response.data || []);
    } catch (err) {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const errors = validate(newThought);
    if (Object.keys(errors).length > 0) {
      setNewErrors(errors);
      toast.warn("Please fill in all required fields.");
      return;
    }

    try {
      await addNewThought(newThought)
      toast.success("Thought added successfully!");
      setNewThought({ date: today, thought_name: "" });
      setShowAddForm(false);
      setNewErrors({});
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add thought.");
    }
  };

  const handleEdit = (thought) => {
    setEditRowId(thought._id);
    setEditValues({
      date: thought.date || today,
      thought_name: thought.thought_name || "",
    });
    setEditErrors({});
  };

  const handleSave = async (id) => {
    const errors = validate(editValues);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      toast.warn("Please fix the errors.");
      return;
    }

    try {
      await updateThoughtById(id, { ...editValues, })
      toast.success("Thought updated successfully!");
      setEditRowId(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to update thought.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this thought?")) {
      try {
        await deleteThoughtById(id)
        toast.success("Thought deleted successfully!");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete thought.");
      }
    }
  };

  const handlePrint = () => {
    const headers = [["#", "Date", "Thought Name"]];
    const rows = data.map((row, index) => [
      index + 1,
      new Date(row.date).toLocaleDateString("en-GB"),
      row.thought_name || "N/A",
    ]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Date", "Thought Name"];
    const rows = data.map(
      (row, index) =>
        `${index + 1}\t${new Date(row.date).toLocaleDateString("en-GB")}\t${row.thought_name || "N/A"
        }`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [{ label: "Thought", link: "/thought" }];

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
          {hasSubmitAccess && (
            <Button onClick={() => setShowAddForm(true)} className="btn-add">
              <CgAddR /> Add Thought
            </Button>
          )}

          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Thought</h2>
                <button className="closeForm" onClick={() => setShowAddForm(false)}>X</button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Date</FormLabel>
                    <FormControl
                      type="date"
                      value={newThought.date}
                      onChange={(e) =>
                        setNewThought({ ...newThought, date: e.target.value }) ||
                        setNewErrors({ ...newErrors, date: "" })
                      }
                    />
                    {newErrors.date && <div className="text-danger">{newErrors.date}</div>}
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Thought Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Thought Name"
                      value={newThought.thought_name}
                      onChange={(e) =>
                        setNewThought({ ...newThought, thought_name: e.target.value }) ||
                        setNewErrors({ ...newErrors, thought_name: "" })
                      }
                    />
                    {newErrors.thought_name && (
                      <div className="text-danger">{newErrors.thought_name}</div>
                    )}
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Thought
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Thought Records</h2>
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
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(Thought), { ssr: false });
