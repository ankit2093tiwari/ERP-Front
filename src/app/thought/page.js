"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
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
import {
  addNewThought,
  deleteThoughtById,
  getAllThoughts,
  updateThoughtById,
} from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const Thought = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission();
  const today = new Date().toISOString().split("T")[0];
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formValues, setFormValues] = useState({
    date: today,
    thought_name: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const validate = (values) => {
    const errors = {};
    if (!values.date) errors.date = "Date is required";
    if (!values.thought_name || values.thought_name.trim() === "")
      errors.thought_name = "Thought name is required";
    return errors;
  };

  const handleFormChange = (e, field) => {
    setFormValues({ ...formValues, [field]: e.target.value });
    setFormErrors({ ...formErrors, [field]: "" });
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllThoughts();
      setData(response.data || []);
    } catch (err) {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForm = async () => {
    const errors = validate(formValues);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.warn("Please fill in all required fields.");
      return;
    }

    try {
      if (isEditing) {
        await updateThoughtById(editingId, formValues);
        toast.success("Thought updated successfully!");
      } else {
        await addNewThought(formValues);
        toast.success("Thought added successfully!");
      }
      setFormValues({ date: today, thought_name: "" });
      setIsEditing(false);
      setEditingId(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save thought.");
    }
  };

  const handleEdit = (thought) => {
    setFormValues({
      date: thought.date?.split("T")[0] || today,
      thought_name: thought.thought_name || "",
    });
    setIsEditing(true);
    setEditingId(thought._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this thought?")) {
      try {
        await deleteThoughtById(id);
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
        `${index + 1}\t${new Date(row.date).toLocaleDateString(
          "en-GB"
        )}\t${row.thought_name || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "80px" },
    {
      name: "Date",
      selector: (row) => new Date(row.date).toLocaleDateString("en-GB"),
    },
    { name: "Thought Name", selector: (row) => row.thought_name || "N/A" },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button
            size="sm"
            variant="success"
            onClick={() => handleEdit(row)}
          >
            <FaEdit />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ];

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
            <Button
              onClick={() => {
                setShowForm(true);
                setIsEditing(false);
                setFormValues({ date: today, thought_name: "" });
              }}
              className="btn-add"
            >
              <CgAddR /> Add Thought
            </Button>
          )}

          {showForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{isEditing ? "Edit Thought" : "Add New Thought"}</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setShowForm(false);
                    setIsEditing(false);
                    setEditingId(null);
                    setFormValues({ date: today, thought_name: "" });
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Date<span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="date"
                      value={formValues.date}
                      onChange={(e) => handleFormChange(e, "date")}
                    />
                    {formErrors.date && (
                      <div className="text-danger">{formErrors.date}</div>
                    )}
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Thought Name<span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Thought Name"
                      value={formValues.thought_name}
                      onChange={(e) => handleFormChange(e, "thought_name")}
                    />
                    {formErrors.thought_name && (
                      <div className="text-danger">
                        {formErrors.thought_name}
                      </div>
                    )}
                  </Col>
                </Row>
                <Button onClick={handleSubmitForm} variant="success">
                  {isEditing ? "Update Thought" : "Add Thought"}
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
