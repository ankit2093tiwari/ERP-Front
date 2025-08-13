"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
} from "react-bootstrap";
import { CgAddR } from "react-icons/cg";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import {
  addNewVehicleType,
  deleteVehicleTypeById,
  getAllVehicleTypes,
  updateVehicleTypeById,
} from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const VehicleRecords = () => {
  const { hasSubmitAccess, hasEditAccess } = usePagePermission();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formValues, setFormValues] = useState({ type_name: "" });
  const [editId, setEditId] = useState(null);
  const [fieldError, setFieldError] = useState("");

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "80px" },
    { name: "Vehicle Type", selector: (row) => row.type_name || "N/A",sortable:true },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button size="sm" variant="success"
            onClick={() => handleEditClick(row)}
          >
            <FaEdit />
          </Button>
          <Button size="sm" variant="danger"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ].filter(Boolean);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllVehicleTypes();
      const result = Array.isArray(response.data) ? response.data : [];
      setData(result.reverse());
    } catch (err) {
      console.error("Error fetching vehicle types:", err);
      toast.error("Failed to fetch vehicle types.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormValues({ ...formValues, type_name: e.target.value });
    if (fieldError) setFieldError("");
  };

  const handleFormSubmit = async () => {
    const trimmed = formValues.type_name.trim();
    if (!trimmed) {
      setFieldError("Please enter a vehicle type.");
      return;
    }
    if (
      data.some(
        (v) =>
          v.type_name.toLowerCase() === trimmed.toLowerCase() &&
          v._id !== editId
      )
    ) {
      setFieldError("This vehicle type already exists!");
      return;
    }

    try {
      if (isEditMode) {
        await updateVehicleTypeById(editId, { type_name: trimmed });
        toast.success("Vehicle type updated successfully!");
      } else {
        await addNewVehicleType({ type_name: trimmed });
        toast.success("Vehicle type added successfully!");
      }
      fetchData();
      handleFormClose();
    } catch (error) {
      toast.error(
        isEditMode
          ? "Failed to update vehicle type."
          : "Failed to add vehicle type."
      );
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setIsEditMode(false);
    setFormValues({ type_name: "" });
    setEditId(null);
    setFieldError("");
  };

  const handleAddClick = () => {
    setIsEditMode(false);
    setFormValues({ type_name: "" });
    setShowForm(true);
  };

  const handleEditClick = (row) => {
    setIsEditMode(true);
    setFormValues({ type_name: row.type_name });
    setEditId(row._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await deleteVehicleTypeById(id);
        toast.success("Vehicle type deleted successfully!");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete vehicle type.");
      }
    }
  };

  const handlePrint = () => {
    const headers = [["#", "Vehicle Type Name"]];
    const rows = data.map((row, index) => [index + 1, row.type_name || "N/A"]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Vehicle Type Name"];
    const rows = data.map(
      (row, index) => `${index + 1}\t${row.type_name || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Transport", link: "/Transport/all-module" },
    { label: "Vehicle Type Master", link: null },
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
            <Button onClick={handleAddClick} className="btn-add">
              <CgAddR /> Add Vehicle
            </Button>
          )}

          {showForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>
                  {isEditMode ? "Edit Vehicle Type" : "Add Vehicle Type"}
                </h2>
                <button className="closeForm" onClick={handleFormClose}>
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col>
                    <FormLabel className="labelForm">
                      Vehicle Type<span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Vehicle Type"
                      value={formValues.type_name}
                      onChange={handleFormChange}
                      isInvalid={!!fieldError}
                    />
                    {fieldError && (
                      <p className="text-danger">{fieldError}</p>
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Button
                    variant="success"
                      onClick={handleFormSubmit}
                    >
                      {isEditMode ? "Update Vehicle" : "Add Vehicle"}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          )}

          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Vehicle Records</h2>
                {loading ? (
                  <p>Loading...</p>
                ) : data.length > 0 ? (
                  <Table
                    columns={columns}
                    data={data}
                    handleCopy={handleCopy}
                    handlePrint={handlePrint}
                  />
                ) : (
                  <p>No data available.</p>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(VehicleRecords), { ssr: false });
