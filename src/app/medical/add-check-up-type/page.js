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
  Alert,
} from "react-bootstrap";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import {
  addNewCheckupType,
  deleteCheckupTypeById,
  getAllCheckupTypes,
  updateCheckupTypeById,
} from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const AddCheckUp = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [formData, setFormData] = useState({ check_up_type: "" });
  const [fieldError, setFieldError] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "Check-Up Type",
      selector: (row) => row.check_up_type || "N/A",
      sortable: true,
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button size="sm" variant="success" onClick={() => handleEdit(row)}>
            <FaEdit />
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ].filter(Boolean);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllCheckupTypes();
      setData(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch check-up types. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Open form for adding
  const openAddForm = () => {
    setFormData({ check_up_type: "" });
    setFieldError({});
    setIsEditMode(false);
    setEditId(null);
    setIsPopoverOpen(true);
  };

  // Open form for editing
  const handleEdit = (checkUp) => {
    setFormData({ check_up_type: checkUp.check_up_type });
    setFieldError({});
    setIsEditMode(true);
    setEditId(checkUp._id);
    setIsPopoverOpen(true);
  };

  // Save form (Add or Update)
  const handleSave = async () => {
    const { check_up_type } = formData;
    let errors = {};
    if (!check_up_type.trim()) {
      errors.check_up_type = "Check-up type is required";
    }
    if (Object.keys(errors).length > 0) {
      setFieldError(errors);
      return;
    }

    try {
      if (isEditMode) {
        await updateCheckupTypeById(editId, { check_up_type: check_up_type.trim() });
        toast.success("Check-up type updated successfully");
      } else {
        const alreadyExists = data.some(
          (item) =>
            item.check_up_type.toLowerCase() === check_up_type.trim().toLowerCase()
        );
        if (alreadyExists) {
          toast.error("Check-up type already exists.");
          return;
        }
        await addNewCheckupType({ check_up_type: check_up_type.trim() });
        toast.success("Check-up type added successfully");
      }
      fetchData();
      setIsPopoverOpen(false);
      setFormData({ check_up_type: "" });
      setEditId(null);
      setIsEditMode(false);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${isEditMode ? "update" : "add"} check-up type`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this check-up type?")) {
      try {
        await deleteCheckupTypeById(id);
        toast.success("Check-up type deleted successfully");
        fetchData();
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete check-up type");
      }
    }
  };

  const handlePrint = () => {
    const headers = [["#", "Check-Up Type"]];
    const rows = data.map((row, index) => [index + 1, row.check_up_type || "N/A"]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Check-Up Type"];
    const rows = data.map(
      (row, index) => `${index + 1}\t${row.check_up_type || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Medical", link: "/medical/all-module" },
    { label: "Add CheckUp Type", link: "null" },
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
          {error && <Alert variant="danger">{error}</Alert>}

          {hasSubmitAccess && (
            <Button onClick={openAddForm} className="btn-add">
              <CgAddR /> Add Check-Up Type
            </Button>
          )}

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{isEditMode ? "Edit Check-Up Type" : "Add New Check-Up Type"}</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setFormData({ check_up_type: "" });
                    setFieldError({});
                    setEditId(null);
                    setIsEditMode(false);
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Check-Up Type</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Check-Up Type"
                      value={formData.check_up_type}
                      onChange={(e) => {
                        setFormData({ check_up_type: e.target.value });
                        if (fieldError.check_up_type) {
                          setFieldError((prev) => ({
                            ...prev,
                            check_up_type: "",
                          }));
                        }
                      }}
                      isInvalid={!!fieldError.check_up_type}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldError.check_up_type}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
                <Button onClick={handleSave} className="btn btn-primary">
                  {isEditMode ? "Update Check-Up Type" : "Add Check-Up Type"}
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Check-Up Type Records</h2>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : (
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

export default dynamic(() => Promise.resolve(AddCheckUp), { ssr: false });
