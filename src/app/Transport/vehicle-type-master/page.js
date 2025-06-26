"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
  Breadcrumb,
} from "react-bootstrap";
import { CgAddR } from "react-icons/cg";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { addNewVehicleType, deleteVehicleTypeById, getAllVehicleTypes, updateVehicleTypeById } from "@/Services";

const VehicleRecords = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ type_name: "" });
  const [fieldError, setFieldError] = useState("")
  const handleInputChange = (e, field) => {
    setEditValues({ ...editValues, [field]: e.target.value });
  };

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "80px" },
    {
      name: "Vehicle Type",
      selector: (row) =>
        editRowId === row._id ? (
          <FormControl
            type="text"
            value={editValues.type_name}
            onChange={(e) => handleInputChange(e, "type_name")}
          />
        ) : (
          row.type_name || "N/A"
        ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editRowId === row._id ? (
            <button className="editButton" onClick={() => handleSave(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button className="editButton" onClick={() => handleEdit(row._id)}>
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


  const handleAdd = async () => {
    const trimmed = newVehicle.type_name.trim();
    if (!trimmed) {
      toast.warning("Please enter a vehicle type.");
      setFieldError("Please enter a vehicle type.")
      return;
    }

    if (data.some((vehicle) => vehicle.type_name.toLowerCase() === trimmed.toLowerCase())) {
      toast.warning("This vehicle type already exists!");
      setFieldError("This vehicle type already exists!");
      return;
    }

    try {
      const response = await addNewVehicleType({
        type_name: trimmed,
      })
      toast.success("Vehicle type added successfully!");
      fetchData()
      setNewVehicle({ type_name: "" });
      setShowAddForm(false);
      setFieldError("");
    } catch (error) {
      console.log("Failed to add vehicle type..", error)
      toast.error("Failed to add vehicle type.");
    }
  };

  const handleEdit = (id) => {
    setEditRowId(id);
    const item = data.find((row) => row._id === id);
    setEditValues({ ...item });
  };

  const handleSave = async (id) => {
    const trimmed = editValues?.type_name?.trim();
    if (!trimmed) {
      toast.warning("Vehicle type cannot be empty.");
      return;
    }

    const exists = data.find(
      (v) =>
        v.type_name.trim().toLowerCase() === trimmed.toLowerCase() && v._id !== id
    );
    if (exists) {
      toast.warning("Vehicle type already exists.");
      setEditRowId(null); // Auto-close edit on duplicate
      return;
    }

    try {
      await updateVehicleTypeById(id, {
        type_name: trimmed,
      })
      toast.success("Vehicle type updated successfully!");
      fetchData()
      setEditRowId(null);
    } catch (error) {
      toast.error("Failed to update vehicle type.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await deleteVehicleTypeById(id)
        toast.success("Vehicle type deleted successfully!");
        fetchData()
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
    const rows = data.map((row, index) => `${index + 1}\t${row.type_name || "N/A"}`);
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
          <Button onClick={() => setShowAddForm(true)} className="btn-add">
            <CgAddR /> Add Vehicle
          </Button>

          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add Vehicle Type</h2>
                <button className="closeForm" onClick={() => setShowAddForm(false)}>X</button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col>
                    <FormLabel className="labelForm">Vehicle Type<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Vehicle Type"
                      value={newVehicle.type_name}
                      onChange={(e) => { setNewVehicle({ type_name: e.target.value }); if (fieldError) setFieldError("") }}
                      isInvalid={!!fieldError}
                    />
                    {fieldError && <p className="text-danger">{fieldError}</p>}
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Button onClick={handleAdd} className="btn btn-primary mt-4">
                      Add Vehicle
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
                  <Table columns={columns} data={data} handleCopy={handleCopy} handlePrint={handlePrint} />
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
