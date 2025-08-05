"use client";

import React, { useState, useEffect } from "react";
import {
  Container, Row, Col, Form, FormLabel, FormSelect, Button, Alert,
} from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import Table from "@/app/component/DataTable";
import {
  getAllLoans, getAllEmployee, getAllIssuedLoans,
  issueNewLoan, deleteIssuedLoanById, updateIssuedLoanById,
} from "@/Services";
import { toast } from "react-toastify";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { copyContent, printContent } from "@/app/utils";

const IssueLoan = () => {
  const [loanTypes, setLoanTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState(initialFormState());
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);

  function initialFormState() {
    return {
      loanType: "",
      employee: "",
      loanAmount: "",
      interest: "0",
      monthlyAmount: "",
      approvedFrom: new Date().toISOString().split("T")[0],
      repaymentStart: new Date().toISOString().split("T")[0],
      installments: "",
    };
  }

  useEffect(() => {
    fetchLoanTypes();
    fetchEmployees();
    fetchIssuedLoans();
  }, []);


   const { loanAmount, installments, interest } = formData;
  useEffect(() => {
    const amount = parseFloat(loanAmount) || 0;
    const installmentCount = parseInt(installments) || 0;
    const interestRate = parseFloat(interest) || 0;

    if (amount > 0 && installmentCount > 0) {
      const totalPayable = amount + (amount * interestRate) / 100;
      const monthly = (totalPayable / installmentCount).toFixed(2);
      setFormData((prev) => ({ ...prev, monthlyAmount: monthly }));
    } else {
      setFormData((prev) => ({ ...prev, monthlyAmount: "" }));
    }
  }, [loanAmount, installments, interest]);
 



  const fetchLoanTypes = async () => {
    try {
      const response = await getAllLoans();
      setLoanTypes(response.data || []);
    } catch (error) {
      console.error("Failed to fetch loan types", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await getAllEmployee();
      setEmployees(response.data || []);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };

  const fetchIssuedLoans = async () => {
    setLoading(true);
    try {
      const response = await getAllIssuedLoans();
      setLoans(response.data || []);
    } catch (error) {
      console.error("Failed to fetch loans", error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormErrors({ ...formErrors, [name]: "" }); // Clear error on change

    if (name === "interest") {
      let interestValue = parseFloat(value);
      if (interestValue > 10) {
        interestValue = 10;
        toast.warning("Interest cannot exceed 10%");
      }
      setFormData({ ...formData, [name]: interestValue.toString() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.loanType) errors.loanType = "Loan Type is required.";
    if (!formData.employee) errors.employee = "Employee is required.";
    if (!formData.loanAmount) errors.loanAmount = "Loan Amount is required.";
    if (!formData.installments) errors.installments = "Installments are required.";
    if (parseFloat(formData.interest) > 10) errors.interest = "Interest cannot exceed 10%.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingId) {
        // Edit Mode
        const response = await updateIssuedLoanById(editingId, formData);
        if (response?.success) {
          toast.success(response?.message || "Loan updated successfully.");
        } else {
          toast.error(response?.message || "Failed to update loan.");
        }
      } else {
        // Add Mode
        const response = await issueNewLoan(formData);
        if (response?.success) {
          toast.success(response?.message || "Loan issued successfully.");
        } else {
          toast.error(response?.message || "Failed to issue loan.");
        }
      }
      fetchIssuedLoans();
      setFormData(initialFormState());
      setEditingId(null);
    } catch (error) {
      console.error("Failed to submit loan", error);
      toast.error("An error occurred.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await deleteIssuedLoanById(id);
      toast.success("Record deleted successfully!");
      fetchIssuedLoans();
    } catch (error) {
      console.error("Failed to delete record", error);
      toast.error("Failed to delete.");
    }
  };

  const handleEdit = (id) => {
    const loan = loans.find((item) => item._id === id);
    if (loan) {
      setFormData({
        loanType: loan.loanType?._id || "",
        employee: loan.employee?._id || "",
        loanAmount: loan.loanAmount || "",
        interest: loan.interest || "0",
        monthlyAmount: loan.monthlyAmount || "",
        approvedFrom: loan.approvedFrom?.split("T")[0] || new Date().toISOString().split("T")[0],
        repaymentStart: loan.repaymentStart?.split("T")[0] || new Date().toISOString().split("T")[0],
        installments: loan.installments || "",
      });
      setEditingId(id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "50px" },
    { name: "Loan Type", selector: (row) => row.loanType?.LoanName || "N/A" },
    { name: "Employee", selector: (row) => row.employee?.employee_name || "N/A" },
    { name: "Loan Amount", selector: (row) => row.loanAmount || "0" },
    { name: "Interest (%)", selector: (row) => row.interest || "0" },
    { name: "Monthly Amount", selector: (row) => row.monthlyAmount || "0" },
    { name: "Installments", selector: (row) => row.installments || "0" },
    { name: "Approved From", selector: (row) => row.approvedFrom?.split("T")[0] || "-" },
    { name: "Repayment Start", selector: (row) => row.repaymentStart?.split("T")[0] || "-" },
    { name: "CreatedBy", selector: (row) => row.createdBy || "-" },
    {
      name: "Actions",
      selector: (row) => (
        <div className="d-flex gap-1">
          <Button size="sm" variant="success" onClick={() => handleEdit(row._id)}><FaEdit /></Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}><FaTrashAlt /></Button>
        </div>
      )
    }
  ];
  const handleCopy = () => {
    const headers = ["#", "Loan Type", "Employee", "Loan Amount", "Interest (%)", "Monthly Amount", "CreatedBy", "UpdatedBy"]
    const rows = loans?.map((row, index) => (
      [index + 1, row.loanType?.LoanName || "N/A", row.employee?.employee_name || "N/A", row.loanAmount || "0", row.interest || "0", row.monthlyAmount || "0", row.createdBy || "N/A", row.updatedBy || "N/A"].join('\t')
    ))
    copyContent(headers, rows)
  }
  const handlePrint = () => {
    const headers = [["#", "Loan Type", "Employee", "Loan Amount", "Interest (%)", "Monthly Amount", "CreatedBy", "UpdatedBy"]]
    const rows = loans?.map((row, index) => (
      [index + 1, row.loanType?.LoanName || "N/A", row.employee?.employee_name || "N/A", row.loanAmount || "0", row.interest || "0", row.monthlyAmount || "0", row.createdBy || "N/A", row.updatedBy || "N/A"]
    ))
    printContent(headers, rows)
  }
  const breadcrumbItems = [
    { label: "HRD", link: "/hrd/all-module" },
    { label: "Issue Loan", link: "null" },
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
          <div className="cover-sheet">
            <div className="studentHeading">
              <h2>{editingId ? "Edit Loan" : "Add New"}</h2>
            </div>

            <Form className="formSheet">
              <Row>
                <Col md={6}>
                  <FormLabel className="labelForm">Loan Types<span className="text-danger">*</span></FormLabel>
                  <FormSelect name="loanType" value={formData.loanType} onChange={handleChange} isInvalid={!!formErrors.loanType}>
                    <option value="">Select</option>
                    {loanTypes.map((loan) => (
                      <option key={loan._id} value={loan._id}>{loan.LoanName}</option>
                    ))}
                  </FormSelect>
                  {formErrors.loanType && <Form.Control.Feedback type="invalid">{formErrors.loanType}</Form.Control.Feedback>}
                </Col>

                <Col md={6}>
                  <FormLabel className="labelForm">Approved From<span className="text-danger">*</span></FormLabel>
                  <Form.Control type="date" name="approvedFrom" value={formData.approvedFrom} onChange={handleChange} />
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <FormLabel className="labelForm">Employee<span className="text-danger">*</span></FormLabel>
                  <FormSelect name="employee" value={formData.employee} onChange={handleChange} isInvalid={!!formErrors.employee}>
                    <option value="">Select</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>{emp.employee_name}</option>
                    ))}
                  </FormSelect>
                  {formErrors.employee && <Form.Control.Feedback type="invalid">{formErrors.employee}</Form.Control.Feedback>}
                </Col>

                <Col md={6}>
                  <FormLabel className="labelForm">Repayment start From<span className="text-danger">*</span></FormLabel>
                  <Form.Control type="date" name="repaymentStart" value={formData.repaymentStart} onChange={handleChange} />
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <FormLabel className="labelForm">Loan Amount<span className="text-danger">*</span></FormLabel>
                  <Form.Control
                    type="number" name="loanAmount" value={formData.loanAmount}
                    onChange={handleChange} isInvalid={!!formErrors.loanAmount}
                  />
                  {formErrors.loanAmount && <Form.Control.Feedback type="invalid">{formErrors.loanAmount}</Form.Control.Feedback>}
                </Col>

                <Col md={4}>
                  <FormLabel className="labelForm">No Of Installments<span className="text-danger">*</span></FormLabel>
                  <Form.Control
                    type="number" name="installments" value={formData.installments}
                    onChange={handleChange} isInvalid={!!formErrors.installments}
                  />
                  {formErrors.installments && <Form.Control.Feedback type="invalid">{formErrors.installments}</Form.Control.Feedback>}
                </Col>

                <Col md={4}>
                  <FormLabel className="labelForm">Interest (%)<span className="text-danger">*</span></FormLabel>
                  <Form.Control
                    type="number" name="interest" min="0" max="10" value={formData.interest}
                    onChange={handleChange} isInvalid={!!formErrors.interest}
                  />
                  {formErrors.interest && <Form.Control.Feedback type="invalid">{formErrors.interest}</Form.Control.Feedback>}
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <FormLabel className="labelForm">Monthly Amount</FormLabel>
                  <Form.Control type="text" name="monthlyAmount" value={formData.monthlyAmount} readOnly />
                </Col>
              </Row>

              <Row className="mt-3">
                <Col>
                  <Button variant="success" onClick={handleSubmit}>
                    {editingId ? "Update Loan" : "Issue Loan"}
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>

          <Row>
            <Col>
              <div className="tableSheet mt-4">
                <h2>Loan Records</h2>
                {loading ? (
                  <p>Loading...</p>
                ) : loans.length > 0 ? (
                  <Table columns={columns} data={loans} handleCopy={handleCopy} handlePrint={handlePrint} />
                ) : (
                  <Alert variant="info">No records found.</Alert>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default IssueLoan;
