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
} from "react-bootstrap";
import { CgAddR } from "react-icons/cg";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { addNewRoute, deleteRouteById, getAllRoutes, getAllVehicles, updateRouteById } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const RouteMaster = () => {
  const {hasEditAccess,hasSubmitAccess}=usePagePermission()
  const [data, setData] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [updatedRoute, setUpdatedRoute] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [errors, setErrors] = useState({});

  const [newRoute, setNewRoute] = useState({
    Vehicle_No: "",
    Route_name: "",
    PickupPoint: "",
    Amount: "",
  });


  const validateFields = (fields) => {
    const tempErrors = {};
    if (!fields.Vehicle_No) tempErrors.Vehicle_No = "Vehicle is required";
    if (!fields.Route_name) tempErrors.Route_name = "Route name is required";
    if (!fields.PickupPoint) tempErrors.PickupPoint = "Pickup point is required";
    if (!fields.Amount || isNaN(fields.Amount)) tempErrors.Amount = "Amount is required";
    return tempErrors;
  };

  const handleAdd = async () => {
    const validationErrors = validateFields(newRoute);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.warning("Please fill all required fields correctly");
      return;
    }
    try {
      const res = await addNewRoute(newRoute)
      toast.success("Route added successfully!");
      fetchRoutes()
      setNewRoute({ Vehicle_No: "", Route_name: "", PickupPoint: "", Amount: "" });
      setErrors({});
      setShowAddForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add route");
    }
  };

  const handleChange = (e, field) => {
    setUpdatedRoute({ ...updatedRoute, [field]: e.target.value });
  };

  const handleNewRouteChange = (e, field) => {
    setNewRoute({ ...newRoute, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const fetchVehicles = async () => {
    try {
      const res = await getAllVehicles();
      setVehicles(res.data);
    } catch {
      toast.error("Error fetching vehicles");
    }
  };

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await getAllRoutes()
      setData(res.data.reverse());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch routes");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (id, row) => {
    setEditRowId(id);
    setUpdatedRoute({ ...row });
  };

  const handleUpdate = async (id) => {
    const validationErrors = validateFields(updatedRoute);
    if (Object.keys(validationErrors).length > 0) {
      toast.warning("Please correct the form before saving");
      return;
    }

    try {
      await updateRouteById(id, updatedRoute)
      toast.success("Route updated successfully!");
      fetchRoutes()
      setEditRowId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update route");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this route?")) return;
    try {
      await deleteRouteById(id)
      fetchRoutes()
      toast.success("Route deleted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete route");
    }
  };

  const handlePrint = () => {
    const headers = [["#", "Vehicle No", "Route Name", "Pickup Point", "Amount"]];
    const rows = data.map((row, index) => [
      index + 1,
      row.Vehicle_No || "N/A",
      row.Route_name || "N/A",
      row.PickupPoint || "N/A",
      row.Amount || "N/A",
    ]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Vehicle No", "Route Name", "Pickup Point", "Amount"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.Vehicle_No}\t${row.Route_name}\t${row.PickupPoint}\t${row.Amount}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchVehicles();
    fetchRoutes();
  }, []);

  const breadcrumbItems = [
    { label: "Transport", link: "/Transport/all-module" },
    { label: "Route Master", link: "null" },
  ];

  const columns = [
    { name: "#", selector: (row, i) => i + 1, width: "80px" },
    {
      name: "Vehicle No",
      selector: (row) =>
        row._id === editRowId ? (
          <Form.Select value={updatedRoute.Vehicle_No} onChange={(e) => handleChange(e, "Vehicle_No")}>
            <option value="">Select Vehicle</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v.Vehicle_No}>
                {v.Vehicle_No} - {v.Driver_Name}
              </option>
            ))}
          </Form.Select>
        ) : (
          row.Vehicle_No
        ),
    },
    {
      name: "Route Name",
      selector: (row) =>
        row._id === editRowId ? (
          <FormControl value={updatedRoute.Route_name} onChange={(e) => handleChange(e, "Route_name")} />
        ) : (
          row.Route_name
        ),
    },
    {
      name: "Pickup Point",
      selector: (row) =>
        row._id === editRowId ? (
          <FormControl value={updatedRoute.PickupPoint} onChange={(e) => handleChange(e, "PickupPoint")} />
        ) : (
          row.PickupPoint
        ),
    },
    {
      name: "Amount",
      selector: (row) =>
        row._id === editRowId ? (
          <FormControl
            type="number"
            min="0"
            value={updatedRoute.Amount}
            onChange={(e) => handleChange(e, "Amount")}
          />
        ) : (
          row.Amount
        ),
    },
    hasEditAccess &&{
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editRowId === row._id ? (
            <button className="editButton btn-success" onClick={() => handleUpdate(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button className="editButton" onClick={() => handleEditClick(row._id, row)}>
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
          {hasSubmitAccess &&(
            <Button onClick={() => setShowAddForm(true)} className="btn-add">
            <CgAddR /> Add Route
          </Button>
          )}

          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add Route</h2>
                <button className="closeForm" onClick={() => setShowAddForm(false)}>
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Vehicle No <span className="text-danger">*</span></FormLabel>
                    <Form.Select
                      value={newRoute.Vehicle_No}
                      onChange={(e) => handleNewRouteChange(e, "Vehicle_No")}
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.map((v) => (
                        <option key={v._id} value={v.Vehicle_No}>
                          {v.Vehicle_No} - {v.Driver_Name}
                        </option>
                      ))}
                    </Form.Select>
                    {errors.Vehicle_No && <div className="text-danger">{errors.Vehicle_No}</div>}
                  </Col>

                  <Col lg={6}>
                    <FormLabel className="labelForm">Route Name <span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      value={newRoute.Route_name}
                      placeholder="Enter Route Name"
                      onChange={(e) => handleNewRouteChange(e, "Route_name")}
                    />
                    {errors.Route_name && <div className="text-danger">{errors.Route_name}</div>}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Pickup Point<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      value={newRoute.PickupPoint}
                      placeholder="Enter Pickup Point"
                      onChange={(e) => handleNewRouteChange(e, "PickupPoint")}
                    />
                    {errors.PickupPoint && <div className="text-danger">{errors.PickupPoint}</div>}
                  </Col>

                  <Col lg={6}>
                    <FormLabel className="labelForm">Amount <span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="number"
                      value={newRoute.Amount}
                      placeholder="Enter Amount"
                      onChange={(e) => handleNewRouteChange(e, "Amount")}
                      min="0"
                    />
                    {errors.Amount && <div className="text-danger">{errors.Amount}</div>}
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Button onClick={handleAdd} className="btn btn-primary mt-4">
                      Add Route
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          )}

          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Route Records</h2>
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

export default dynamic(() => Promise.resolve(RouteMaster), { ssr: false });
