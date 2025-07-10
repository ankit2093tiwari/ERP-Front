"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTimes } from "react-icons/fa";
import {
  Form, Row, Col, Container, Button, Alert,
} from "react-bootstrap";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { getAllFeeSetting, updateFeeSetting } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const FeeSetting = () => {
  const {hasEditAccess}=usePagePermission()
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    credit_card_charge: "",
    debit_card_charge: "",
    amex_charge: "",
  });
  const [validationErrors, setValidationErrors] = useState({
    credit_card_charge: "",
    debit_card_charge: "",
    amex_charge: "",
  });

  const validateField = (name, value) => {
    if (!value) return "This field is required";
    if (isNaN(value)) return "Must be a number";
    const numValue = parseFloat(value);
    if (numValue < 0) return "Cannot be negative";
    if (numValue > 100) return "Cannot exceed 100%";
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllFeeSetting();
      if (response?.success && response.feeSetting) {
        setData([response.feeSetting]);
        setFormData({
          credit_card_charge: response.feeSetting.credit_card_charge,
          debit_card_charge: response.feeSetting.debit_card_charge,
          amex_charge: response.feeSetting.amex_charge,
        });
      } else {
        setData([]);
        setError("No fee setting found");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch fee settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const errors = {
      credit_card_charge: validateField('credit_card_charge', formData.credit_card_charge),
      debit_card_charge: validateField('debit_card_charge', formData.debit_card_charge),
      amex_charge: validateField('amex_charge', formData.amex_charge),
    };

    setValidationErrors(errors);

    if (Object.values(errors).some(error => error)) {
      toast.error("Please fix validation errors");
      return;
    }

    try {
      const numericData = {
        credit_card_charge: parseFloat(formData.credit_card_charge),
        debit_card_charge: parseFloat(formData.debit_card_charge),
        amex_charge: parseFloat(formData.amex_charge),
      };

      const response = await updateFeeSetting(numericData);
      if (response?.success) {
        toast.success("Fee settings updated successfully");
        fetchData();
        setIsEditing(false);
      } else {
        toast.error(response?.message || "Failed to update fee settings");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update fee settings");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "80px" },
    { name: "Credit Card Charge", selector: (row) => `${row.credit_card_charge}%` },
    { name: "Debit Card Charge", selector: (row) => `${row.debit_card_charge}%` },
    { name: "AMEX Charge", selector: (row) => `${row.amex_charge}%` },
    hasEditAccess &&{
      name: "Actions",
      cell: (row) => (
        <button
          className="editButton"
          onClick={() => setIsEditing(true)}
          disabled={isEditing}
        >
          <FaEdit className="me-1" />
          Edit
        </button>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: "Settings", link: "/settings" },
    { label: "Fee Setting", link: null }
  ];

  const handleCopy = () => {
    const headers = ["#", "Credit Card Charge", "Debit Card Charge", "AMEX Charge"];
    const rows = data.map((row, index) => `${index + 1}\t${row.credit_card_charge || "N/A"}\t${row.debit_card_charge || "N/A"}\t${row.amex_charge || "N/A"}`);

    copyContent(headers, rows);
  };
  const handlePrint = async () => {
    const tableHeaders = [["#", "Credit Card Charge", "Debit Card Charge", "AMEX Charge"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.credit_card_charge || "N/A",
      row.debit_card_charge || "N/A",
      row.amex_charge || "N/A",
    ]);

    printContent(tableHeaders, tableRows);

  };
  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row>
            <Col>
              <BreadcrumbComp items={breadcrumbItems} />
            </Col>
          </Row>
        </Container>
      </div>

      <section>
        <Container>
          {isEditing && (
            <div className="cover-sheet mt-4">
              <div className="studentHeading">
                <h5>Edit Fee Settings</h5>
                <button
                  className="closeForm"
                  onClick={() => setIsEditing(false)}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="labelForm">Credit Card Charge(%)<span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        name="credit_card_charge"
                        value={formData.credit_card_charge}
                        onChange={handleInputChange}
                        isInvalid={!!validationErrors.credit_card_charge}
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="Enter percentage"
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.credit_card_charge}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="labelForm">Debit Card Charge(%)<span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        name="debit_card_charge"
                        value={formData.debit_card_charge}
                        onChange={handleInputChange}
                        isInvalid={!!validationErrors.debit_card_charge}
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="Enter percentage"
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.debit_card_charge}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="labelForm">AMEX Charge(%)<span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        name="amex_charge"
                        value={formData.amex_charge}
                        onChange={handleInputChange}
                        isInvalid={!!validationErrors.amex_charge}
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="Enter percentage"
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.amex_charge}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="">
                  <Button
                    variant="outline-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={Object.values(validationErrors).some(Boolean)}
                  >
                    Save Changes
                  </Button>
                </div>
              </Form>
            </div>
          )}
          <div className="cover-sheet">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : (
              <div className="tableSheet text-start">
                <h2>Current Fee Settings</h2>
                <Table
                  columns={columns}
                  data={data}
                  handleCopy={handleCopy}
                  handlePrint={handlePrint}
                />
              </div>
            )}
          </div>

        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(FeeSetting), { ssr: false });