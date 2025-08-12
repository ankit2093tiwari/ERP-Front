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
import usePagePermission from "@/hooks/usePagePermission";

const VehicleRecords = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission()
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [editValues, setEditValues] = useState(null);

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
    setNewVehicle({ ...newVehicle, [field]: e.target.value });
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: "" });
    }
  };

  const handleDateChange = (date, field) => {
    setNewVehicle({ ...newVehicle, [field]: date });
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: "" });
    }
  };

  const handleEditInputChange = (e, field) => {
    setEditValues({ ...editValues, [field]: e.target.value });
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: "" });
    }
  };

  const handleEditDateChange = (date, field) => {
    setEditValues({ ...editValues, [field]: date });
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
      selector: (row) => row.Vehicle_Type?.type_name || "N/A",
    },
    {
      name: "Vehicle No",
      selector: (row) => row.Vehicle_No,
    },
    {
      name: "Chassis No",
      selector: (row) => row.Chassis_No,
    },
    {
      name: "Driver Name",
      selector: (row) => row.Driver_Name,
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button size="sm" variant="success"
            onClick={() => handleEdit(row)}
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
      const res = await getAllVehicles()
      setData(res.data.reverse());
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (formData) => {
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

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field] === '') {
        errors[field] = 'This field is required';
        isValid = false;
      }
    });

    // Vehicle Number validation
    if (formData.Vehicle_No && !/^[A-Z]{2}[- ]?\d{1,2}[- ]?[A-Z]{1,2}[- ]?\d{1,4}$/i.test(formData.Vehicle_No)) {
      errors.Vehicle_No = 'Invalid format (e.g. MH01AB1234)';
      isValid = false;
    }

    // Chassis Number validation
    if (formData.Chassis_No && !/^[A-HJ-NPR-Z0-9]{17}$/i.test(formData.Chassis_No)) {
      errors.Chassis_No = 'Must be exactly 17 alphanumeric characters';
      isValid = false;
    }

    // Date validations
    if (formData.Licence_Valid_Till && new Date(formData.Licence_Valid_Till) <= new Date()) {
      errors.Licence_Valid_Till = 'Must be a future date';
      isValid = false;
    }

    if (formData.Insurance_Valid_Till && new Date(formData.Insurance_Valid_Till) <= new Date()) {
      errors.Insurance_Valid_Till = 'Must be a future date';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleAdd = async () => {
    if (!validateForm(newVehicle)) {
      toast.warning('Please fill all required fields correctly');
      return;
    }

    try {
      await addNewVehicle(newVehicle);
      toast.success('Vehicle added successfully');
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
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add vehicle');
    }
  };

  const handleEdit = (vehicle) => {
    setEditValues({
      ...vehicle,
      Vehicle_Type: vehicle.Vehicle_Type?._id || "",
      Licence_Valid_Till: new Date(vehicle.Licence_Valid_Till),
      Insurance_Valid_Till: new Date(vehicle.Insurance_Valid_Till),
    });
    setShowEditForm(true);
  };

  const handleUpdate = async () => {
    if (!validateForm(editValues)) {
      toast.warning('Please fill all required fields correctly');
      return;
    }

    try {
      await updateVehicleById(editValues._id, editValues)
      toast.success("Vehicle updated successfully");
      fetchData();
      setShowEditForm(false);
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

  const renderForm = (isEdit = false) => {
    const formData = isEdit ? editValues : newVehicle;
    const handleChange = isEdit ? handleEditInputChange : handleInputChange;
    const handleDate = isEdit ? handleEditDateChange : handleDateChange;
    const handleSubmit = isEdit ? handleUpdate : handleAdd;
    const title = isEdit ? "Edit Vehicle" : "Add Vehicle";

    return (
      <div className="cover-sheet">
        <div className="studentHeading">
          <h2>{title}</h2>
          <button
            className="closeForm"
            onClick={() => isEdit ? setShowEditForm(false) : setShowAddForm(false)}
          >
            X
          </button>
        </div>
        <Form className="formSheet">
          <Row className="mb-3">
            <Col lg={4}>
              <FormLabel className="labelForm">Vehicle Type<span className="text-danger">*</span></FormLabel>
              <Form.Select
                value={formData.Vehicle_Type}
                onChange={(e) => handleChange(e, "Vehicle_Type")}
                required
                isInvalid={!!fieldErrors.Vehicle_Type}
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
                value={formData.Vehicle_No}
                placeholder="Enter Vehicle No"
                onChange={(e) => handleChange(e, "Vehicle_No")}
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
                value={formData.Chassis_No}
                placeholder="Enter Chassis No"
                onChange={(e) => handleChange(e, "Chassis_No")}
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
                value={formData.Engine_No}
                placeholder="Enter Engine No"
                onChange={(e) => handleChange(e, "Engine_No")}
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
                value={formData.Driver_Name}
                placeholder="Enter Driver Name"
                onChange={(e) => handleChange(e, "Driver_Name")}
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
                value={formData.Driver_Mobile_No}
                placeholder="Enter Driver Mobile No"
                onChange={(e) => handleChange(e, "Driver_Mobile_No")}
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
                value={formData.Driver_Licence_No}
                placeholder="Enter Driver Licence No"
                onChange={(e) => handleChange(e, "Driver_Licence_No")}
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
                  selected={formData.Licence_Valid_Till}
                  onChange={(date) => handleDate(date, "Licence_Valid_Till")}
                  className={`form-control ${fieldErrors.Licence_Valid_Till ? 'is-invalid' : ''}`}
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  required
                />
                {fieldErrors.Licence_Valid_Till && (
                  <div className="invalid-feedback d-block">
                    {fieldErrors.Licence_Valid_Till}
                  </div>
                )}
              </div>
            </Col>
            <Col lg={4}>
              <FormLabel className="labelForm">Insurance Company<span className="text-danger">*</span></FormLabel>
              <FormControl
                type="text"
                value={formData.Insurance_Company}
                placeholder="Enter Insurance Company"
                onChange={(e) => handleChange(e, "Insurance_Company")}
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
                value={formData.Insurance_Policy_No}
                placeholder="Enter Insurance Policy No"
                onChange={(e) => handleChange(e, "Insurance_Policy_No")}
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
                  selected={formData.Insurance_Valid_Till}
                  onChange={(date) => handleDate(date, "Insurance_Valid_Till")}
                  className={`form-control ${fieldErrors.Insurance_Valid_Till ? 'is-invalid' : ''}`}
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  required
                />
                {fieldErrors.Insurance_Valid_Till && (
                  <div className="invalid-feedback d-block">
                    {fieldErrors.Insurance_Valid_Till}
                  </div>
                )}
              </div>
            </Col>
            <Col lg={4}>
              <FormLabel className="labelForm">Insurance Amount<span className="text-danger">*</span></FormLabel>
              <FormControl
                type="number"
                value={formData.Insurance_Amount}
                placeholder="Enter Insurance Amount"
                onChange={(e) => handleChange(e, "Insurance_Amount")}
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
                value={formData.Seating_Capacity}
                placeholder="Enter Seating Capacity"
                onChange={(e) => handleChange(e, "Seating_Capacity")}
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
                value={formData.Type_of_Ownership}
                onChange={(e) => handleChange(e, "Type_of_Ownership")}
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
                value={formData.Helper_Name}
                placeholder="Enter Helper Name"
                onChange={(e) => handleChange(e, "Helper_Name")}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col lg={4}>
              <FormLabel className="labelForm">Helper Mobile No</FormLabel>
              <FormControl
                type="text"
                value={formData.Helper_Mobile_No}
                placeholder="Enter Helper Mobile No"
                onChange={(e) => handleChange(e, "Helper_Mobile_No")}
              />
            </Col>
            <Col lg={8}>
              <FormLabel className="labelForm">Remark</FormLabel>
              <FormControl
                as="textarea"
                value={formData.Remark}
                placeholder="Enter Remark"
                onChange={(e) => handleChange(e, "Remark")}
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <Button onClick={handleSubmit} variant="success" className="mt-3">
                {isEdit ? 'Update' : 'Add'} Vehicle
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  };

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
              <CgAddR /> Add Vehicle
            </Button>
          )}

          {showAddForm && renderForm(false)}
          {showEditForm && renderForm(true)}

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