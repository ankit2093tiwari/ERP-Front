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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addNewVehicle, deleteVehicleById, getAllVehicles, getAllVehicleTypes, updateVehicleById } from "@/Services";

const VehicleRecords = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

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

  const handleInputChange = (e, field) => {
    setEditValues({ ...editValues, [field]: e.target.value });
  };

  const handleDateChange = (date, field) => {
    setEditValues({ ...editValues, [field]: date });
  };

  const handleNewVehicleChange = (e, field) => {
    setNewVehicle({ ...newVehicle, [field]: e.target.value });
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: "" });
    }
  };

  const handleNewDateChange = (date, field) => {
    setNewVehicle({ ...newVehicle, [field]: date });
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: "" });
    }
  };


  const fetchVehicleTypes = async () => {
    try {
      const res = await getAllVehicleTypes()
      setVehicleTypes(res.data);
    } catch (err) {
      toast.error("Failed to fetch vehicle types");
    }
  };

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "80px" },
    {
      name: "Vehicle Type",
      selector: (row) =>
        row._id === editRowId ? (
          <Form.Select
            value={editValues.Vehicle_Type}
            onChange={(e) => handleInputChange(e, "Vehicle_Type")}
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
            value={editValues.Vehicle_No}
            onChange={(e) => handleInputChange(e, "Vehicle_No")}
          />
        ) : (
          row.Vehicle_No
        ),
    },
    {
      name: "Chassis No",
      selector: (row) =>
        row._id === editRowId ? (
          <FormControl
            type="text"
            value={editValues.Chassis_No}
            onChange={(e) => handleInputChange(e, "Chassis_No")}
          />
        ) : (
          row.Chassis_No
        ),
    },
    {
      name: "Driver Name",
      selector: (row) =>
        row._id === editRowId ? (
          <FormControl
            type="text"
            value={editValues.Driver_Name}
            onChange={(e) => handleInputChange(e, "Driver_Name")}
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
              onClick={() => handleSave(row._id)}
            >
              <FaSave />
            </button>
          ) : (
            <button
              className="editButton"
              onClick={() => handleEdit(row._id, row)}
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
      const res = await getAllVehicles()
      setData(res.data.reverse());
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Required fields validation
    const requiredFields = [
      'Vehicle_Type',
      'Vehicle_No',
      'Chassis_No',
      'Engine_No',
      'Driver_Name',
      'Driver_Mobile_No',
      'Driver_Licence_No',
      'Licence_Valid_Till',
      'Insurance_Company',
      'Insurance_Policy_No',
      'Insurance_Valid_Till',
      'Insurance_Amount',
      'Seating_Capacity',
      'Type_of_Ownership'
    ];

    // Check required fields
    requiredFields.forEach(field => {
      if (!newVehicle[field] || newVehicle[field] === '') {
        errors[field] = 'This field is required';
        isValid = false;
      }
    });

    // Vehicle Number (Indian format: MH01AB1234)
    if (newVehicle.Vehicle_No) {
      if (!/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{1,4}$/i.test(newVehicle.Vehicle_No)) {
        errors.Vehicle_No = 'Invalid format (e.g. MH01AB1234)';
        isValid = false;
      } else if (newVehicle.Vehicle_No.length < 8 || newVehicle.Vehicle_No.length > 15) {
        errors.Vehicle_No = 'Must be 8-15 characters';
        isValid = false;
      }
    }

    // Chassis Number (17 alphanumeric, VIN standard)
    if (newVehicle.Chassis_No) {
      if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(newVehicle.Chassis_No)) {
        errors.Chassis_No = 'Must be exactly 17 alphanumeric characters';
        isValid = false;
      }
    }

    // Engine Number (6-12 alphanumeric)
    if (newVehicle.Engine_No) {
      if (!/^[A-Z0-9]{6,12}$/i.test(newVehicle.Engine_No)) {
        errors.Engine_No = 'Must be 6-12 alphanumeric characters';
        isValid = false;
      }
    }

    // Driver Name (letters and spaces only)
    if (newVehicle.Driver_Name) {
      if (!/^[a-zA-Z ]+$/.test(newVehicle.Driver_Name)) {
        errors.Driver_Name = 'Only letters and spaces allowed';
        isValid = false;
      }
    }

    // Driver Mobile (Indian mobile: 10 digits starting with 6-9)
    if (newVehicle.Driver_Mobile_No) {
      if (!/^[6-9]\d{9}$/.test(newVehicle.Driver_Mobile_No)) {
        errors.Driver_Mobile_No = 'Invalid Indian mobile number';
        isValid = false;
      }
    }

    // Driver License (6-15 alphanumeric)
    if (newVehicle.Driver_Licence_No) {
      if (!/^[A-Z0-9]{6,15}$/i.test(newVehicle.Driver_Licence_No)) {
        errors.Driver_Licence_No = 'Must be 6-15 alphanumeric characters';
        isValid = false;
      }
    }

    // License Valid Till (must be future date)
    if (newVehicle.Licence_Valid_Till) {
      if (new Date(newVehicle.Licence_Valid_Till) <= new Date()) {
        errors.Licence_Valid_Till = 'Must be a future date';
        isValid = false;
      }
    }

    // Insurance Company (letters, numbers and spaces)
    if (newVehicle.Insurance_Company) {
      if (!/^[a-zA-Z0-9 ]+$/.test(newVehicle.Insurance_Company)) {
        errors.Insurance_Company = 'Invalid characters';
        isValid = false;
      }
    }

    // Insurance Policy Number (8-20 alphanumeric with optional hyphens)
    if (newVehicle.Insurance_Policy_No) {
      if (!/^[A-Z0-9-]{8,20}$/i.test(newVehicle.Insurance_Policy_No)) {
        errors.Insurance_Policy_No = '8-20 alphanumeric characters';
        isValid = false;
      }
    }

    // Insurance Valid Till (must be future date)
    if (newVehicle.Insurance_Valid_Till) {
      if (new Date(newVehicle.Insurance_Valid_Till) <= new Date()) {
        errors.Insurance_Valid_Till = 'Must be a future date';
        isValid = false;
      }
    }

    // Insurance Amount (positive number)
    if (newVehicle.Insurance_Amount) {
      if (isNaN(newVehicle.Insurance_Amount) || newVehicle.Insurance_Amount <= 0) {
        errors.Insurance_Amount = 'Must be a positive number';
        isValid = false;
      }
    }

    // Seating Capacity (positive integer)
    if (newVehicle.Seating_Capacity) {
      if (!Number.isInteger(Number(newVehicle.Seating_Capacity))) {
        errors.Seating_Capacity = 'Must be a whole number';
        isValid = false;
      } else if (newVehicle.Seating_Capacity <= 0) {
        errors.Seating_Capacity = 'Must be at least 1';
        isValid = false;
      }
    }

    // Helper Mobile (if provided)
    if (newVehicle.Helper_Mobile_No && newVehicle.Helper_Mobile_No !== '') {
      if (!/^[6-9]\d{9}$/.test(newVehicle.Helper_Mobile_No)) {
        errors.Helper_Mobile_No = 'Invalid Indian mobile number';
        isValid = false;
      }
    }

    // Type of Ownership (must be either "Owned" or "Rental")
    if (newVehicle.Type_of_Ownership) {
      if (!['Owned', 'Rental'].includes(newVehicle.Type_of_Ownership)) {
        errors.Type_of_Ownership = 'Invalid ownership type';
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };
  const handleAdd = async () => {
    if (!validateForm()) {
      toast.warning('Please fill all required fields correctly');
      return;
    }

    try {
      await addNewVehicle(newVehicle);
      toast.success('Vehicle added successfully');
      // Reset form and fetch data
      setNewVehicle({
        Vehicle_Type: "",
        Vehicle_No: "",
        Chassis_No: "",
        Engine_No: "",
        Driver_Name: "",
        Driver_Mobile_No: "",
        Driver_Licence_No: "",
        Insurance_Company: "",
        Insurance_Policy_No: "",
        Insurance_Amount: 0,
        Seating_Capacity: 0,
        Type_of_Ownership: "Owned",
        Helper_Name: "",
        Helper_Mobile_No: "",
        Remark: "",
      });
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add vehicle');
    }
  };


  const handleEdit = (id, row) => {
    setEditRowId(id);
    setEditValues({
      ...row,
      Vehicle_Type: row.Vehicle_Type?._id || "",
      Licence_Valid_Till: new Date(row.Licence_Valid_Till),
      Insurance_Valid_Till: new Date(row.Insurance_Valid_Till),
    });
  };

  const handleSave = async (id) => {
    try {
      await updateVehicleById(id, editValues)
      toast.success("Vehicle updated successfully");
      fetchData();
      setEditRowId(null);
    } catch (err) {
      toast.error("Failed to update vehicle");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await deleteVehicleById(id)
        toast.success("Vehicle deleted successfully");
        fetchData()
      } catch (err) {
        toast.error("Failed to delete vehicle");
      }
    }
  };

  const handlePrint = () => {
    const headers = [
      ["#", "Vehicle Type", "Vehicle No", "Chassis No", "Driver Name"]
    ];
    const rows = data.map((row, index) => [
      index + 1,
      row.Vehicle_Type?.type_name || "N/A",
      row.Vehicle_No,
      row.Chassis_No,
      row.Driver_Name
    ]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Vehicle Type", "Vehicle No", "Chassis No", "Driver Name"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.Vehicle_Type?.type_name || "N/A"}\t${row.Vehicle_No}\t${row.Chassis_No}\t${row.Driver_Name}`
    );
    copyContent(headers, rows);
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
                    <FormLabel className="labelForm">Vehicle Type<span className="text-danger">*</span></FormLabel>
                    <Form.Select
                      value={newVehicle.Vehicle_Type}
                      onChange={(e) => handleNewVehicleChange(e, "Vehicle_Type")}
                      required
                      isInvalid={fieldErrors.Vehicle_Type}
                    >
                      <option value="">Select Vehicle Type</option>
                      {vehicleTypes.map((type) => (
                        <option key={type._id} value={type._id}>
                          {type.type_name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.Vehicle_Type}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Vehicle No<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      value={newVehicle.Vehicle_No}
                      placeholder="Enter Vehicle No"
                      onChange={(e) => handleNewVehicleChange(e, "Vehicle_No")}
                      required
                      isInvalid={!!fieldErrors.Vehicle_No}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.Vehicle_No}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Chassis No<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      value={newVehicle.Chassis_No}
                      placeholder="Enter Chassis No"
                      onChange={(e) => handleNewVehicleChange(e, "Chassis_No")}
                      required
                      isInvalid={!!fieldErrors.Chassis_No}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.Chassis_No}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={4}>
                    <FormLabel className="labelForm">Engine No<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      value={newVehicle.Engine_No}
                      placeholder="Enter Engine No"
                      onChange={(e) => handleNewVehicleChange(e, "Engine_No")}
                      required
                      isInvalid={!!fieldErrors.Engine_No}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.Engine_No}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Driver Name<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      value={newVehicle.Driver_Name}
                      placeholder="Enter Driver Name"
                      onChange={(e) => handleNewVehicleChange(e, "Driver_Name")}
                      required
                      isInvalid={!!fieldErrors.Driver_Name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.Driver_Name}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Driver Mobile No<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      value={newVehicle.Driver_Mobile_No}
                      placeholder="Enter Driver Mobile No"
                      onChange={(e) =>
                        handleNewVehicleChange(e, "Driver_Mobile_No")
                      }
                      required
                      isInvalid={!!fieldErrors.Driver_Mobile_No}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.Driver_Mobile_No}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={4}>
                    <FormLabel className="labelForm">Driver Licence No<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      value={newVehicle.Driver_Licence_No}
                      placeholder="Enter Driver Licence No"
                      onChange={(e) =>
                        handleNewVehicleChange(e, "Driver_Licence_No")
                      }
                      required
                      isInvalid={!!fieldErrors.Driver_Licence_No}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.Driver_Licence_No}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Licence Valid Till<span className="text-danger">*</span></FormLabel>
                    <div>
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
                    </div>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Insurance Company<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      value={newVehicle.Insurance_Company}
                      placeholder="Enter Insurance Company"
                      onChange={(e) =>
                        handleNewVehicleChange(e, "Insurance_Company")
                      }
                      required
                      isInvalid={!!fieldErrors.Insurance_Company}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.Insurance_Company}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={4}>
                    <FormLabel className="labelForm">Insurance Policy No<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      value={newVehicle.Insurance_Policy_No}
                      placeholder="Enter Insurance Policy No"
                      onChange={(e) =>
                        handleNewVehicleChange(e, "Insurance_Policy_No")
                      }
                      required
                      isInvalid={!!fieldErrors.Insurance_Policy_No}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.Insurance_Policy_No}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Insurance Valid Till<span className="text-danger">*</span></FormLabel>
                    <div>
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
                    </div>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Insurance Amount<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="number"
                      value={newVehicle.Insurance_Amount}
                      placeholder="Enter Insurance Amount"
                      onChange={(e) =>
                        handleNewVehicleChange(e, "Insurance_Amount")
                      }
                      required
                      isInvalid={!!fieldErrors.Insurance_Amount}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.Insurance_Amount}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={4}>
                    <FormLabel className="labelForm">Seating Capacity<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="number"
                      value={newVehicle.Seating_Capacity}
                      placeholder="Enter Seating Capacity"
                      onChange={(e) =>
                        handleNewVehicleChange(e, "Seating_Capacity")
                      }
                      required
                      isInvalid={!!fieldErrors.Seating_Capacity}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.Seating_Capacity}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Type of Ownership<span className="text-danger">*</span></FormLabel>
                    <Form.Select
                      value={newVehicle.Type_of_Ownership}
                      onChange={(e) =>
                        handleNewVehicleChange(e, "Type_of_Ownership")
                      }
                      required
                      isInvalid={!!fieldErrors.Type_of_Ownership}
                    >
                      <option value="Owned">Owned</option>
                      <option value="Rental">Rental</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.Type_of_Ownership}
                    </Form.Control.Feedback>
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