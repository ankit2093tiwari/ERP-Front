"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
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
import axios from "axios";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const FeeStructure = () => {
  const [data, setData] = useState([]);
  const [feeGroups, setFeeGroups] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({
    group_name: "",
    monthly_fees: [],
    total_amount: 0
  });

  const [newFeeStructure, setNewFeeStructure] = useState({
    group_name: "",
    monthly_fees: [],
    total_amount: 0
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-fee-settings");
      if (response.data?.success && Array.isArray(response.data.feeSettings)) {
        setData(response.data.feeSettings);
      } else {
        setData([]);
        setError("No records found.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setData([]);
      setError("Failed to fetch fee settings.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeGroups = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-fee-groups");
      if (response.data?.success && Array.isArray(response.data.data)) {
        setFeeGroups(response.data.data);
      } else {
        setFeeGroups([]);
      }
    } catch (err) {
      console.error("Error fetching fee groups:", err);
      setFeeGroups([]);
    }
  };

  const fetchInstallments = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-installments");
      if (response.data?.success && Array.isArray(response.data.data)) {
        // Sort installments by month order
        const monthOrder = ["April", "May", "June", "July", "August", "September", 
                           "October", "November", "December", "January", "February", "March"];
        const sortedInstallments = response.data.data.sort((a, b) => {
          return monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name);
        });
        setInstallments(sortedInstallments);
      } else {
        setInstallments([]);
      }
    } catch (err) {
      console.error("Error fetching installments:", err);
      setInstallments([]);
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Group Name", "Total Amount", "Action"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.group_name?.group_name || "N/A",
      row.total_amount || "N/A",
      "💶",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Group Name", "Total Amount", "Action"];
    const rows = data.map((row, index) => `${index + 1}\t${row.group_name?.group_name || "N/A"}\t${row.total_amount || "N/A"}\t💶`);
    copyContent(headers, rows);
  };

  const handleGroupChange = (e) => {
    const selectedGroupId = e.target.value;
    if (editingId) {
      setEditedData(prev => ({ ...prev, group_name: selectedGroupId }));
    } else {
      setNewFeeStructure(prev => ({ ...prev, group_name: selectedGroupId }));
    }
  };

  const handleFeeAmountChange = (monthId, feeType, value) => {
    const updateMonthlyFees = (prev) => {
      const newMonthlyFees = [...prev.monthly_fees];
      const monthIndex = newMonthlyFees.findIndex(m => m.month_name === monthId);
      
      if (monthIndex === -1) {
        // Create new month entry if it doesn't exist
        newMonthlyFees.push({
          month_name: monthId,
          admission_fee: feeType === 'admission_fee' ? parseFloat(value) || 0 : 0,
          annual_fee: feeType === 'annual_fee' ? parseFloat(value) || 0 : 0,
          tuition_fee: feeType === 'tuition_fee' ? parseFloat(value) || 0 : 0,
          total_fee: 0,
          fee_submission_last_date: new Date()
        });
      } else {
        // Update existing month entry
        const monthEntry = { ...newMonthlyFees[monthIndex] };
        monthEntry[feeType] = parseFloat(value) || 0;
        monthEntry.total_fee = (monthEntry.admission_fee || 0) + 
                              (monthEntry.annual_fee || 0) + 
                              (monthEntry.tuition_fee || 0);
        newMonthlyFees[monthIndex] = monthEntry;
      }

      // Calculate total amount
      const total_amount = newMonthlyFees.reduce((sum, month) => sum + month.total_fee, 0);

      return {
        ...prev,
        monthly_fees: newMonthlyFees,
        total_amount
      };
    };

    if (editingId) {
      setEditedData(updateMonthlyFees);
    } else {
      setNewFeeStructure(updateMonthlyFees);
    }
  };

  const handleDateChange = (monthId, date) => {
    const updateMonthlyFees = (prev) => {
      const newMonthlyFees = [...prev.monthly_fees];
      const monthIndex = newMonthlyFees.findIndex(m => m.month_name === monthId);
      
      if (monthIndex === -1) {
        // Create new month entry if it doesn't exist
        newMonthlyFees.push({
          month_name: monthId,
          admission_fee: 0,
          annual_fee: 0,
          tuition_fee: 0,
          total_fee: 0,
          fee_submission_last_date: date ? new Date(date) : new Date()
        });
      } else {
        // Update existing month entry
        const monthEntry = { ...newMonthlyFees[monthIndex] };
        monthEntry.fee_submission_last_date = date ? new Date(date) : new Date();
        newMonthlyFees[monthIndex] = monthEntry;
      }

      return {
        ...prev,
        monthly_fees: newMonthlyFees
      };
    };

    if (editingId) {
      setEditedData(updateMonthlyFees);
    } else {
      setNewFeeStructure(updateMonthlyFees);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        group_name: newFeeStructure.group_name,
        monthly_fees: newFeeStructure.monthly_fees.map(fee => ({
          month_name: fee.month_name,
          admission_fee: fee.admission_fee,
          annual_fee: fee.annual_fee,
          tuition_fee: fee.tuition_fee,
          fee_submission_last_date: fee.fee_submission_last_date
        }))
      };
      
      await axios.post("https://erp-backend-fy3n.onrender.com/add-fee-structure", payload);
      fetchData();
      setIsFormOpen(false);
      setNewFeeStructure({
        group_name: "",
        monthly_fees: [],
        total_amount: 0
      });
    } catch (err) {
      console.error("Error submitting fee structure:", err);
      setError(err.response?.data?.message || "Failed to save fee structure.");
    }
  };

  const handleEdit = (row) => {
    setEditingId(row._id);
    setEditedData({
      group_name: row.group_name._id,
      monthly_fees: row.monthly_fees.map(fee => ({
        month_name: fee.month_name._id,
        admission_fee: fee.admission_fee,
        annual_fee: fee.annual_fee,
        tuition_fee: fee.tuition_fee,
        total_fee: fee.total_fee,
        fee_submission_last_date: fee.fee_submission_last_date
      })),
      total_amount: row.total_amount
    });
    setIsFormOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        group_name: editedData.group_name,
        monthly_fees: editedData.monthly_fees.map(fee => ({
          month_name: fee.month_name,
          admission_fee: fee.admission_fee,
          annual_fee: fee.annual_fee,
          tuition_fee: fee.tuition_fee,
          fee_submission_last_date: fee.fee_submission_last_date
        }))
      };
      
      await axios.put(
        `https://erp-backend-fy3n.onrender.com/api/update-fee-structure/${editingId}`,
        payload
      );
      fetchData();
      setIsFormOpen(false);
      setEditingId(null);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Failed to update fee structure.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this fee structure?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-fee-structure/${id}`);
        fetchData();
      } catch (err) {
        console.error("Delete error:", err);
        setError("Failed to delete fee structure.");
      }
    }
  };

  useEffect(() => {
    fetchData();
    fetchFeeGroups();
    fetchInstallments();
  }, []);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Group Name",
      selector: (row) => row.group_name?.group_name || "N/A",
      sortable: true,
    },
    {
      name: "Total Amount",
      selector: (row) => row.total_amount || "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row)}>
            <FaEdit />
          </button>
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: "Fee", link: "/fees/all-module" },
    { label: "Fee Structure", link: "null" }
  ];

  const getFeeValue = (monthId, feeType, isEditing) => {
    const monthlyFees = isEditing ? editedData.monthly_fees : newFeeStructure.monthly_fees;
    const monthEntry = monthlyFees.find(m => m.month_name === monthId);
    if (!monthEntry) return "";
    return monthEntry[feeType] || "";
  };

  const getDateValue = (monthId, isEditing) => {
    const monthlyFees = isEditing ? editedData.monthly_fees : newFeeStructure.monthly_fees;
    const monthEntry = monthlyFees.find(m => m.month_name === monthId);
    if (!monthEntry || !monthEntry.fee_submission_last_date) return "";
    
    const date = new Date(monthEntry.fee_submission_last_date);
    return date.toISOString().split('T')[0];
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
          <Button onClick={() => setIsFormOpen(true)} className="btn-add">
            <CgAddR /> New Fee Structure
          </Button>

          {isFormOpen && (
            <div className="cover-sheet mt-3">
              <div className="studentHeading">
                <h2>{editingId ? "Edit Fee Structure" : "Create New Fee Structure"}</h2>
                <button className="closeForm" onClick={() => {
                  setIsFormOpen(false);
                  setEditingId(null);
                }}>X</button>
              </div>

              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Group Name</FormLabel>
                    <FormControl
                      as="select"
                      value={editingId ? editedData.group_name : newFeeStructure.group_name}
                      onChange={handleGroupChange}
                    >
                      <option value="">Select Group</option>
                      {feeGroups.map((group) => (
                        <option key={group._id} value={group._id}>
                          {group.group_name}
                        </option>
                      ))}
                    </FormControl>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Total Amount</FormLabel>
                    <FormControl
                      type="number"
                      value={editingId ? editedData.total_amount : newFeeStructure.total_amount}
                      readOnly
                    />
                  </Col>
                </Row>

                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Fee Type</th>
                        {installments.map((installment) => (
                          <th key={`head-${installment._id}`}>{installment.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['admission_fee', 'annual_fee', 'tuition_fee'].map((feeType) => (
                        <tr key={feeType}>
                          <td>{feeType.replace('_', ' ').toUpperCase()}</td>
                          {installments.map((installment) => (
                            <td key={`${feeType}-${installment._id}`}>
                              <FormControl
                                type="number"
                                value={getFeeValue(installment._id, feeType, editingId)}
                                onChange={(e) => handleFeeAmountChange(installment._id, feeType, e.target.value)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}

                      <tr>
                        <td>Fee Submission Last Date</td>
                        {installments.map((installment) => (
                          <td key={`date-${installment._id}`}>
                            <FormControl
                              type="date"
                              value={getDateValue(installment._id, editingId)}
                              onChange={(e) => handleDateChange(installment._id, e.target.value)}
                            />
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <Button
                  onClick={editingId ? handleUpdate : handleSubmit}
                  className="btn btn-primary mt-3"
                >
                  {editingId ? "Update Fee Structure" : "Save Fee Structure"}
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Fee Structure Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && !error && (
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

export default dynamic(() => Promise.resolve(FeeStructure), { ssr: false });