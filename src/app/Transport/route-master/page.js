"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt, FaPlus, FaMinus } from "react-icons/fa";
import {Form,Row,Col,Container,FormLabel,FormControl,Button,} from "react-bootstrap";
import { CgAddR } from "react-icons/cg";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { addNewRoute, deleteRouteById, getAllRoutes, getAllVehicles, updateRouteById } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const RouteMaster = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission();
  const [data, setData] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [updatedRoute, setUpdatedRoute] = useState({
    Vehicle_No: "",
    Route_name: "",
    PickupPoints: [{ location: "", amount: "" }],
  });
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [errors, setErrors] = useState({});

  const [newRoute, setNewRoute] = useState({
    Vehicle_No: "",
    Route_name: "",
    PickupPoints: [{ location: "", amount: "" }],
  });

  const validateFields = (fields) => {
    const tempErrors = {};
    if (!fields.Vehicle_No) tempErrors.Vehicle_No = "Vehicle is required";
    if (!fields.Route_name) tempErrors.Route_name = "Route name is required";

    fields.PickupPoints.forEach((point, index) => {
      if (!point.location) {
        tempErrors[`pickupLocation-${index}`] = "Pickup location is required";
      }
      if (!point.amount || isNaN(point.amount)) {
        tempErrors[`pickupAmount-${index}`] = "Valid amount is required";
      }
    });

    return tempErrors;
  };

  const addPickupPoint = (isNewRoute = true) => {
    if (isNewRoute) {
      setNewRoute(prev => ({
        ...prev,
        PickupPoints: [...prev.PickupPoints, { location: "", amount: "" }]
      }));
    } else {
      setUpdatedRoute(prev => ({
        ...prev,
        PickupPoints: [...prev.PickupPoints, { location: "", amount: "" }]
      }));
    }
  };

  const removePickupPoint = (index, isNewRoute = true) => {
    if (isNewRoute) {
      if (newRoute.PickupPoints.length > 1) {
        setNewRoute(prev => ({
          ...prev,
          PickupPoints: prev.PickupPoints.filter((_, i) => i !== index)
        }));
      }
    } else {
      if (updatedRoute.PickupPoints.length > 1) {
        setUpdatedRoute(prev => ({
          ...prev,
          PickupPoints: prev.PickupPoints.filter((_, i) => i !== index)
        }));
      }
    }
  };

  const handlePickupPointChange = (e, index, field, isNewRoute = true) => {
    const value = e.target.value;

    if (isNewRoute) {
      setNewRoute(prev => {
        const updatedPoints = [...prev.PickupPoints];
        updatedPoints[index] = { ...updatedPoints[index], [field]: value };
        return { ...prev, PickupPoints: updatedPoints };
      });
    } else {
      setUpdatedRoute(prev => {
        const updatedPoints = [...prev.PickupPoints];
        updatedPoints[index] = { ...updatedPoints[index], [field]: value };
        return { ...prev, PickupPoints: updatedPoints };
      });
    }

    // Clear error if exists
    const errorKey = `pickup${field === 'location' ? 'Location' : 'Amount'}-${index}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: "" }));
    }
  };

  const handleAdd = async () => {
    const validationErrors = validateFields(newRoute);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.warning("Please fill all required fields correctly");
      return;
    }
    
    try {
      const res = await addNewRoute(newRoute);
      toast.success("Route added successfully!");
      fetchRoutes();
      setNewRoute({
        Vehicle_No: "",
        Route_name: "",
        PickupPoints: [{ location: "", amount: "" }]
      });
      setErrors({});
      setShowAddForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add route");
    }
  };

  const handleNewRouteChange = (e, field) => {
    setNewRoute({ ...newRoute, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const handleEditRouteChange = (e, field) => {
    setUpdatedRoute({ ...updatedRoute, [field]: e.target.value });
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
      const res = await getAllRoutes();
      setData(res.data.reverse());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch routes");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (id, row) => {
    setEditRowId(id);
    setUpdatedRoute({
      ...row,
      PickupPoints: row.PickupPoints || [{ location: "", amount: "" }]
    });
    setShowEditForm(true);
  };

  const handleUpdate = async () => {
    const validationErrors = validateFields(updatedRoute);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.warning("Please correct the form before saving");
      return;
    }

    try {
      await updateRouteById(editRowId, updatedRoute);
      toast.success("Route updated successfully!");
      fetchRoutes();
      setShowEditForm(false);
      setEditRowId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update route");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this route?")) return;
    try {
      await deleteRouteById(id);
      fetchRoutes();
      toast.success("Route deleted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete route");
    }
  };

  const handlePrint = () => {
    const headers = [["#", "Vehicle No", "Route Name", "Pickup Points", "Amounts"]];
    const rows = data.map((row, index) => [
      index + 1,
      row.Vehicle_No || "N/A",
      row.Route_name || "N/A",
      row.PickupPoints?.map(p => p.location).join(", ") || "N/A",
      row.PickupPoints?.map(p => p.amount).join(", ") || "N/A",
    ]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Vehicle No", "Route Name", "Pickup Points", "Amounts"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.Vehicle_No}\t${row.Route_name}\t${row.PickupPoints?.map(p => p.location).join(", ")}\t${row.PickupPoints?.map(p => p.amount).join(", ")}`
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
      selector: (row) => row.Vehicle_No,
      sortable: true,
    },
    {
      name: "Route Name",
      selector: (row) => row.Route_name,
      sortable: true,
    },
    {
      name: "Pickup Points",
      selector: (row) => (
        <div>
          {row.PickupPoints?.map((point, i) => (
            <div key={i}>
              {point.location} (₹{point.amount}){i < row.PickupPoints.length - 1 ? ", " : ""}
            </div>
          ))}
        </div>
      ),
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button size="sm" variant="success" onClick={() => handleEditClick(row._id, row)}>
            <FaEdit />
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ].filter(Boolean);

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
                  <Col>
                    <FormLabel className="labelForm">Pickup Points <span className="text-danger">*</span></FormLabel>
                    {newRoute.PickupPoints.map((point, index) => (
                      <div key={index} className="mb-2 d-flex align-items-center gap-2">
                        <FormControl
                          type="text"
                          value={point.location}
                          placeholder="Location"
                          onChange={(e) => handlePickupPointChange(e, index, "location")}
                        />
                        <FormControl
                          type="number"
                          min="0"
                          value={point.amount}
                          placeholder="Amount"
                          onChange={(e) => handlePickupPointChange(e, index, "amount")}
                          className="w-25"
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removePickupPoint(index)}
                          disabled={newRoute.PickupPoints.length <= 1}
                        >
                          <FaMinus />
                        </Button>
                        {index === newRoute.PickupPoints.length - 1 && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => addPickupPoint()}
                          >
                            <FaPlus />
                          </Button>
                        )}
                      </div>
                    ))}
                    {(errors[`pickupLocation-0`] || errors[`pickupAmount-0`]) && (
                      <div className="text-danger">All pickup points must be filled</div>
                    )}
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Button onClick={handleAdd} variant="success">
                      Add Route
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          )}

          {showEditForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Edit Route</h2>
                <button className="closeForm" onClick={() => setShowEditForm(false)}>
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Vehicle No <span className="text-danger">*</span></FormLabel>
                    <Form.Select
                      value={updatedRoute.Vehicle_No}
                      onChange={(e) => handleEditRouteChange(e, "Vehicle_No")}
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
                      value={updatedRoute.Route_name}
                      placeholder="Enter Route Name"
                      onChange={(e) => handleEditRouteChange(e, "Route_name")}
                    />
                    {errors.Route_name && <div className="text-danger">{errors.Route_name}</div>}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col>
                    <FormLabel className="labelForm">Pickup Points <span className="text-danger">*</span></FormLabel>
                    {updatedRoute.PickupPoints.map((point, index) => (
                      <div key={index} className="mb-2 d-flex align-items-center gap-2">
                        <FormControl
                          type="text"
                          value={point.location}
                          placeholder="Location"
                          onChange={(e) => handlePickupPointChange(e, index, "location", false)}
                        />
                        <FormControl
                          type="number"
                          min="0"
                          value={point.amount}
                          placeholder="Amount"
                          onChange={(e) => handlePickupPointChange(e, index, "amount", false)}
                          className="w-25"
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removePickupPoint(index, false)}
                          disabled={updatedRoute.PickupPoints.length <= 1}
                        >
                          <FaMinus />
                        </Button>
                        {index === updatedRoute.PickupPoints.length - 1 && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => addPickupPoint(false)}
                          >
                            <FaPlus />
                          </Button>
                        )}
                      </div>
                    ))}
                    {(errors[`pickupLocation-0`] || errors[`pickupAmount-0`]) && (
                      <div className="text-danger">All pickup points must be filled</div>
                    )}
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Button onClick={handleUpdate} variant="success">
                      Update Route
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