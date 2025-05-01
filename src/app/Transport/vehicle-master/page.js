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
import axios from "axios";
import { CgAddR } from "react-icons/cg";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const VehicleRecords = () => {
  const [data, setData] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [updatedVehicle, setUpdatedVehicle] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState([]);

  const [newVehicle, setNewVehicle] = useState({
    Vehicle_Type: "",
    Vehicle_No: "",
    Chassis_No: "",
    Engine_No: "",
    Driver_Name: "",
    Driver_Mobile_No: "",
    Driver_Licence_No: "",
    Licence_Valid_Till: new Date(),
    Insurance_Company: "",
    Insurance_Policy_No: "",
    Insurance_Valid_Till: new Date(),
    Insurance_Amount: 0,
    Seating_Capacity: 0,
    Type_of_Ownership: "Owned",
    Helper_Name: "",
    Helper_Mobile_No: "",
    Remark: "",
  });

  const handleChange = (e, field) => {
    setUpdatedVehicle({ ...updatedVehicle, [field]: e.target.value });
  };

  const handleDateChange = (date, field) => {
    setUpdatedVehicle({ ...updatedVehicle, [field]: date });
  };

  const handleNewVehicleChange = (e, field) => {
    setNewVehicle({ ...newVehicle, [field]: e.target.value });
  };

  const handleNewDateChange = (date, field) => {
    setNewVehicle({ ...newVehicle, [field]: date });
  };

  const fetchVehicleTypes = async () => {
    try {
      const res = await axios.get(
        "https://erp-backend-fy3n.onrender.com/api/vehicleTypes"
      );
      setVehicleTypes(res.data.data);
    } catch (err) {
      console.error("Failed to fetch vehicle types:", err);
    }
  };

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "80px" },
    {
      name: "Vehicle Type",
      selector: (row) =>
        row._id === editRowId ? (
          <Form.Select
            value={updatedVehicle.Vehicle_Type}
            onChange={(e) => handleChange(e, "Vehicle_Type")}
          >
            <option value="">Select Vehicle Type</option>
            {vehicleTypes.map((type) => (
              <option key={type._id} value={type._id}>
                {type.type_name}
              </option>
            ))}
          </Form.Select>
        ) : (
          row.Vehicle_Type?.type_name || "N/A"
        ),
    },
    {
      name: "Vehicle No",
      selector: (row) =>
        row._id === editRowId ? (
          <FormControl
            type="text"
            value={updatedVehicle.Vehicle_No}
            onChange={(e) => handleChange(e, "Vehicle_No")}
          />
        ) : (
          row.Vehicle_No
        ),
    },
    {
      name: "Driver Name",
      selector: (row) =>
        row._id === editRowId ? (
          <FormControl
            type="text"
            value={updatedVehicle.Driver_Name}
            onChange={(e) => handleChange(e, "Driver_Name")}
          />
        ) : (
          row.Driver_Name
        ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editRowId === row._id ? (
            <button
              className="editButton btn-success"
              onClick={() => handleUpdate(row._id)}
            >
              <FaSave />
            </button>
          ) : (
            <button
              className="editButton"
              onClick={() => handleEditClick(row._id, row)}
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://erp-backend-fy3n.onrender.com/api/all-vehicles"
      );
      setData(res.data.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const requiredFields = [
      "Vehicle_Type",
      "Vehicle_No",
      "Chassis_No",
      "Engine_No",
      "Driver_Name",
      "Driver_Mobile_No",
      "Driver_Licence_No",
      "Licence_Valid_Till",
      "Insurance_Company",
      "Insurance_Policy_No",
      "Insurance_Valid_Till",
      "Insurance_Amount",
      "Seating_Capacity",
      "Type_of_Ownership",
    ];

    const missingFields = requiredFields.filter(
      (field) => !newVehicle[field] || newVehicle[field] === ""
    );

    if (missingFields.length > 0) {
      alert(`Please fill all required fields: ${missingFields.join(", ")}`);
      return;
    }

    try {
      const res = await axios.post(
        "https://erp-backend-fy3n.onrender.com/api/create-vehicles",
        newVehicle
      );
      setData((prevData) => [...prevData, res.data.data]);
      setNewVehicle({
        Vehicle_Type: "",
        Vehicle_No: "",
        Chassis_No: "",
        Engine_No: "",
        Driver_Name: "",
        Driver_Mobile_No: "",
        Driver_Licence_No: "",
        Licence_Valid_Till: new Date(),
        Insurance_Company: "",
        Insurance_Policy_No: "",
        Insurance_Valid_Till: new Date(),
        Insurance_Amount: 0,
        Seating_Capacity: 0,
        Type_of_Ownership: "Owned",
        Helper_Name: "",
        Helper_Mobile_No: "",
        Remark: "",
      });
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      console.error("Error adding vehicle:", err);
      setError("Failed to add vehicle. Please try again.");
    }
  };

  const handleEditClick = (id, row) => {
    setEditRowId(id);
    setUpdatedVehicle({
      ...row,
      Vehicle_Type: row.Vehicle_Type?._id || "",
      Licence_Valid_Till: new Date(row.Licence_Valid_Till),
      Insurance_Valid_Till: new Date(row.Insurance_Valid_Till),
    });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(
        `https://erp-backend-fy3n.onrender.com/api/update-vehicles/${id}`,
        updatedVehicle
      );
      fetchData(); // refresh list
      setEditRowId(null);
    } catch (err) {
      console.error("Failed to update vehicle", err);
      setError("Failed to update vehicle.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await axios.delete(
          `https://erp-backend-fy3n.onrender.com/api/delete-vehicles/${id}`
        );
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (err) {
        console.error("Delete error:", err);
        setError("Failed to delete vehicle.");
      }
    }
  };

  useEffect(() => {
    fetchVehicleTypes();
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Transport", link: "/Transport/all-module" },
    { label: "Vehicle Master", link: "null" },
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
                <h2>Add Vehicle</h2>
                <button
                  className="closeForm"
                  onClick={() => setShowAddForm(false)}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={4}>
                    <FormLabel className="labelForm">Vehicle Type*</FormLabel>
                    <Form.Select
                      value={newVehicle.Vehicle_Type}
                      onChange={(e) => handleNewVehicleChange(e, "Vehicle_Type")}
                      required
                    >
                      <option value="">Select Vehicle Type</option>
                      {vehicleTypes.map((type) => (
                        <option key={type._id} value={type._id}>
                          {type.type_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Vehicle No*</FormLabel>
                    <FormControl
                      type="text"
                      value={newVehicle.Vehicle_No}
                      placeholder="Enter Vehicle No"
                      onChange={(e) => handleNewVehicleChange(e, "Vehicle_No")}
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Chassis No*</FormLabel>
                    <FormControl
                      type="text"
                      value={newVehicle.Chassis_No}
                      placeholder="Enter Chassis No"
                      onChange={(e) => handleNewVehicleChange(e, "Chassis_No")}
                      required
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={4}>
                    <FormLabel className="labelForm">Engine No*</FormLabel>
                    <FormControl
                      type="text"
                      value={newVehicle.Engine_No}
                      placeholder="Enter Engine No"
                      onChange={(e) => handleNewVehicleChange(e, "Engine_No")}
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Driver Name*</FormLabel>
                    <FormControl
                      type="text"
                      value={newVehicle.Driver_Name}
                      placeholder="Enter Driver Name"
                      onChange={(e) => handleNewVehicleChange(e, "Driver_Name")}
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Driver Mobile No*</FormLabel>
                    <FormControl
                      type="text"
                      value={newVehicle.Driver_Mobile_No}
                      placeholder="Enter Driver Mobile No"
                      onChange={(e) =>
                        handleNewVehicleChange(e, "Driver_Mobile_No")
                      }
                      required
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={4}>
                    <FormLabel className="labelForm">Driver Licence No*</FormLabel>
                    <FormControl
                      type="text"
                      value={newVehicle.Driver_Licence_No}
                      placeholder="Enter Driver Licence No"
                      onChange={(e) =>
                        handleNewVehicleChange(e, "Driver_Licence_No")
                      }
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Licence Valid Till*</FormLabel>
                    <DatePicker
                      selected={newVehicle.Licence_Valid_Till}
                      onChange={(date) =>
                        handleNewDateChange(date, "Licence_Valid_Till")
                      }
                      className="form-control"
                      dateFormat="dd/MM/yyyy"
                      minDate={new Date()}
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Insurance Company*</FormLabel>
                    <FormControl
                      type="text"
                      value={newVehicle.Insurance_Company}
                      placeholder="Enter Insurance Company"
                      onChange={(e) =>
                        handleNewVehicleChange(e, "Insurance_Company")
                      }
                      required
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={4}>
                    <FormLabel className="labelForm">Insurance Policy No*</FormLabel>
                    <FormControl
                      type="text"
                      value={newVehicle.Insurance_Policy_No}
                      placeholder="Enter Insurance Policy No"
                      onChange={(e) =>
                        handleNewVehicleChange(e, "Insurance_Policy_No")
                      }
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Insurance Valid Till*</FormLabel>
                    <DatePicker
                      selected={newVehicle.Insurance_Valid_Till}
                      onChange={(date) =>
                        handleNewDateChange(date, "Insurance_Valid_Till")
                      }
                      className="form-control"
                      dateFormat="dd/MM/yyyy"
                      minDate={new Date()}
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Insurance Amount*</FormLabel>
                    <FormControl
                      type="number"
                      value={newVehicle.Insurance_Amount}
                      placeholder="Enter Insurance Amount"
                      onChange={(e) =>
                        handleNewVehicleChange(e, "Insurance_Amount")
                      }
                      required
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={4}>
                    <FormLabel className="labelForm">Seating Capacity*</FormLabel>
                    <FormControl
                      type="number"
                      value={newVehicle.Seating_Capacity}
                      placeholder="Enter Seating Capacity"
                      onChange={(e) =>
                        handleNewVehicleChange(e, "Seating_Capacity")
                      }
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Type of Ownership*</FormLabel>
                    <Form.Select
                      value={newVehicle.Type_of_Ownership}
                      onChange={(e) =>
                        handleNewVehicleChange(e, "Type_of_Ownership")
                      }
                      required
                    >
                      <option value="Owned">Owned</option>
                      <option value="Rental">Rental</option>
                    </Form.Select>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Helper Name</FormLabel>
                    <FormControl
                      type="text"
                      value={newVehicle.Helper_Name}
                      placeholder="Enter Helper Name"
                      onChange={(e) => handleNewVehicleChange(e, "Helper_Name")}
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={4}>
                    <FormLabel className="labelForm">Helper Mobile No</FormLabel>
                    <FormControl
                      type="text"
                      value={newVehicle.Helper_Mobile_No}
                      placeholder="Enter Helper Mobile No"
                      onChange={(e) =>
                        handleNewVehicleChange(e, "Helper_Mobile_No")
                      }
                    />
                  </Col>
                  <Col lg={8}>
                    <FormLabel className="labelForm">Remark</FormLabel>
                    <FormControl
                      as="textarea"
                      value={newVehicle.Remark}
                      placeholder="Enter Remark"
                      onChange={(e) => handleNewVehicleChange(e, "Remark")}
                    />
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

          {/* Expanded Edit Form */}
          {editRowId && (
            <div className="cover-sheet mt-3">
              <div className="studentHeading">
                <h2>Edit Vehicle Details</h2>
                <button
                  className="closeForm"
                  onClick={() => setEditRowId(null)}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={4}>
                    <FormLabel className="labelForm">Vehicle Type*</FormLabel>
                    <Form.Select
                      value={updatedVehicle.Vehicle_Type}
                      onChange={(e) => handleChange(e, "Vehicle_Type")}
                      required
                    >
                      <option value="">Select Vehicle Type</option>
                      {vehicleTypes.map((type) => (
                        <option key={type._id} value={type._id}>
                          {type.type_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Vehicle No*</FormLabel>
                    <FormControl
                      type="text"
                      value={updatedVehicle.Vehicle_No}
                      onChange={(e) => handleChange(e, "Vehicle_No")}
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Chassis No*</FormLabel>
                    <FormControl
                      type="text"
                      value={updatedVehicle.Chassis_No}
                      onChange={(e) => handleChange(e, "Chassis_No")}
                      required
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={4}>
                    <FormLabel className="labelForm">Engine No*</FormLabel>
                    <FormControl
                      type="text"
                      value={updatedVehicle.Engine_No}
                      onChange={(e) => handleChange(e, "Engine_No")}
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Driver Name*</FormLabel>
                    <FormControl
                      type="text"
                      value={updatedVehicle.Driver_Name}
                      onChange={(e) => handleChange(e, "Driver_Name")}
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Driver Mobile No*</FormLabel>
                    <FormControl
                      type="text"
                      value={updatedVehicle.Driver_Mobile_No}
                      onChange={(e) => handleChange(e, "Driver_Mobile_No")}
                      required
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={4}>
                    <FormLabel className="labelForm">Driver Licence No*</FormLabel>
                    <FormControl
                      type="text"
                      value={updatedVehicle.Driver_Licence_No}
                      onChange={(e) => handleChange(e, "Driver_Licence_No")}
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Licence Valid Till*</FormLabel>
                    <DatePicker
                      selected={updatedVehicle.Licence_Valid_Till}
                      onChange={(date) =>
                        handleDateChange(date, "Licence_Valid_Till")
                      }
                      className="form-control"
                      dateFormat="dd/MM/yyyy"
                      minDate={new Date()}
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Insurance Company*</FormLabel>
                    <FormControl
                      type="text"
                      value={updatedVehicle.Insurance_Company}
                      onChange={(e) => handleChange(e, "Insurance_Company")}
                      required
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={4}>
                    <FormLabel className="labelForm">Insurance Policy No*</FormLabel>
                    <FormControl
                      type="text"
                      value={updatedVehicle.Insurance_Policy_No}
                      onChange={(e) => handleChange(e, "Insurance_Policy_No")}
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Insurance Valid Till*</FormLabel>
                    <DatePicker
                      selected={updatedVehicle.Insurance_Valid_Till}
                      onChange={(date) =>
                        handleDateChange(date, "Insurance_Valid_Till")
                      }
                      className="form-control"
                      dateFormat="dd/MM/yyyy"
                      minDate={new Date()}
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Insurance Amount*</FormLabel>
                    <FormControl
                      type="number"
                      value={updatedVehicle.Insurance_Amount}
                      onChange={(e) => handleChange(e, "Insurance_Amount")}
                      required
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={4}>
                    <FormLabel className="labelForm">Seating Capacity*</FormLabel>
                    <FormControl
                      type="number"
                      value={updatedVehicle.Seating_Capacity}
                      onChange={(e) => handleChange(e, "Seating_Capacity")}
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Type of Ownership*</FormLabel>
                    <Form.Select
                      value={updatedVehicle.Type_of_Ownership}
                      onChange={(e) => handleChange(e, "Type_of_Ownership")}
                      required
                    >
                      <option value="Owned">Owned</option>
                      <option value="Rental">Rental</option>
                    </Form.Select>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Helper Name</FormLabel>
                    <FormControl
                      type="text"
                      value={updatedVehicle.Helper_Name || ""}
                      onChange={(e) => handleChange(e, "Helper_Name")}
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={4}>
                    <FormLabel className="labelForm">Helper Mobile No</FormLabel>
                    <FormControl
                      type="text"
                      value={updatedVehicle.Helper_Mobile_No || ""}
                      onChange={(e) => handleChange(e, "Helper_Mobile_No")}
                    />
                  </Col>
                  <Col lg={8}>
                    <FormLabel className="labelForm">Remark</FormLabel>
                    <FormControl
                      as="textarea"
                      value={updatedVehicle.Remark || ""}
                      onChange={(e) => handleChange(e, "Remark")}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Button
                      onClick={() => handleUpdate(editRowId)}
                      className="btn btn-primary mt-4"
                    >
                      Update Vehicle
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          )}

          {/* Table Section */}
          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Vehicle Records</h2>
                {loading ? (
                  <p>Loading...</p>
                ) : error ? (
                  <p style={{ color: "red" }}>{error}</p>
                ) : data.length > 0 ? (
                  <Table columns={columns} data={data} />
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