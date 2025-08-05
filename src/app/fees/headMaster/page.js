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
import {
  addNewHead,
  deleteHeadById,
  getAllHeads,
  updateHeadById,
} from "@/Services";
import { toast } from "react-toastify";
import usePagePermission from "@/hooks/usePagePermission";

const HeadMasterPage = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [headMasterForm, setHeadMasterForm] = useState({
    head_name: "",
    head_type: "",
  });
  const [errors, setErrors] = useState({});
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const validateForm = () => {
    let formErrors = {};
    if (!headMasterForm.head_name.trim()) formErrors.head_name = "Head Name is Required";
    if (!headMasterForm.head_type.trim()) formErrors.head_type = "Head Type is Required";
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllHeads();
      if (response.success) {
        setData(response.data);
      } else {
        setData([]);
        setError("No records found.");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to fetch HeadMaster records"
      );
      setError("Failed to fetch HeadMasters.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingId) {
        // Update Operation
        const response = await updateHeadById(editingId, headMasterForm);
        toast.success(response?.message || "Updated successfully");
      } else {
        // Check for duplicates
        const existing = data.find(
          (row) =>
            row.head_name.toLowerCase() === headMasterForm.head_name.toLowerCase()
        );
        if (existing) {
          toast.warning("Head Name already exists.");
          return;
        }
        // Add Operation
        const response = await addNewHead(headMasterForm);
        toast.success(response?.message || "Head Master added successfully");
      }

      fetchData();
      setHeadMasterForm({ head_name: "", head_type: "" });
      setErrors({});
      setEditingId(null);
      setIsPopoverOpen(false);

    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (row) => {
    setEditingId(row._id);
    setHeadMasterForm({
      head_name: row.head_name,
      head_type: row.head_type,
    });
    setIsPopoverOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this Head Master?")) {
      try {
        const response = await deleteHeadById(id);
        toast.success(response?.message || "Deleted successfully");
        fetchData();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Delete failed");
      }
    }
  };

  const handlePrint = () => {
    const headers = [["#", "Head Name", "Head Type"]];
    const rows = data.map((row, index) => [
      index + 1,
      row.head_name || "N/A",
      row.head_type || "N/A",
    ]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Head Name", "Head Type"];
    const rows = data.map(
      (row, index) =>
        `${index + 1}\t${row.head_name || "N/A"}\t${row.head_type || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Head Name",
      selector: (row) => row.head_name || "N/A",
      sortable: true,
    },
    {
      name: "Head Type",
      selector: (row) => row.head_type || "N/A",
      sortable: true,
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button size="sm" variant="success" onClick={() => handleEdit(row)}
          >
            <FaEdit />
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}
          >
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ].filter(Boolean);

  const breadcrumbItems = [
    { label: "Fee", link: "/fees/all-module" },
    { label: "Head Master", link: null },
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
          {hasSubmitAccess && (
            <Button
              onClick={() => {
                setIsPopoverOpen(true);
                setEditingId(null); // Ensure it’s in Add Mode
                setHeadMasterForm({ head_name: "", head_type: "" });
              }}
              className="btn-add"
            >
              <CgAddR /> Add Head Master
            </Button>
          )}

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{editingId ? "Edit" : "Add New"} Head Master</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setEditingId(null);
                    setErrors({});
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Head Name <span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Head Name"
                      value={headMasterForm.head_name}
                      isInvalid={!!errors.head_name}
                      onChange={(e) => {
                        setHeadMasterForm({ ...headMasterForm, head_name: e.target.value });
                        if (errors.head_name) setErrors((prev) => ({ ...prev, head_name: "" }));
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.head_name}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Head Type <span className="text-danger">*</span>
                    </FormLabel>
                    <Form.Select
                      value={headMasterForm.head_type}
                      isInvalid={!!errors.head_type}
                      onChange={(e) => {
                        setHeadMasterForm({ ...headMasterForm, head_type: e.target.value });
                        if (errors.head_type) setErrors((prev) => ({ ...prev, head_type: "" }));
                      }}
                    >
                      <option value="">Select Head Type</option>
                      <option value="Installment Type">Installment Type</option>
                      <option value="Lifetime">Lifetime</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.head_type}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
                <Button onClick={handleFormSubmit} className="btn btn-primary mt-3">
                  {editingId ? "Update" : "Add"} Head Master
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Head Master Records</h2>
            {loading ? (
              <p>Loading...</p>
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

export default dynamic(() => Promise.resolve(HeadMasterPage), { ssr: false });
