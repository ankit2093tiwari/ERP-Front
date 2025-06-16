"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb, FormGroup, FormSelect, Table as BootstrapTable } from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import { getAllInstallments, getFeeGroups, getFeeStructures } from "@/Services";
import { toast } from "react-toastify";

const FeeStatement = () => {
  const [data, setData] = useState([]);
  const [feeGroups, setFeeGroups] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [newFeeSetting, setNewFeeSetting] = useState({
    group_name: "",
    monthly_fees: [],
    total_amount: 0
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getFeeStructures()
      if (response?.success) {
        setData(response?.feeSettings);
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
      const response = await getFeeGroups()
      if (response?.success) {
        setFeeGroups(response.data);
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
      const response = await getAllInstallments();
      if (response?.success) {
        const monthOrder = [
          "April", "May", "June", "July", "August",
          "September", "October", "November", "December",
          "January", "February", "March"
        ];

        const normalizeMonth = {
          Jan: "January",
          Feb: "February",
          Mar: "March",
          Apr: "April",
          May: "May",
          Jun: "June",
          Jul: "July",
          Aug: "August",
          Sep: "September",
          Oct: "October",
          Nov: "November",
          Dec: "December",
          January: "January",
          February: "February",
          March: "March",
          April: "April",
          May: "May",
          June: "June",
          July: "July",
          August: "August",
          September: "September",
          October: "October",
          November: "November",
          December: "December"
        };

        const sortedInstallments = response.data
          .map(inst => ({
            ...inst,
            normalizedName: normalizeMonth[inst.installment_name] || inst.installment_name
          }))
          .sort((a, b) => {
            return monthOrder.indexOf(a.normalizedName) - monthOrder.indexOf(b.normalizedName);
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




  const handleGroupChange = (e) => {
    const selectedGroup = e.target.value;
    setNewFeeSetting(prev => ({ ...prev, group_name: selectedGroup }));
  };

  const handleFeeAmountChange = (monthId, feeType, value) => {
    setNewFeeSetting(prev => {
      const newMonthlyFees = [...prev.monthly_fees];
      const monthIndex = newMonthlyFees.findIndex(m => m.month_name === monthId);

      if (monthIndex === -1) {
        newMonthlyFees.push({
          month_name: monthId,
          admission_fee: feeType === 'admission_fee' ? parseFloat(value) || 0 : 0,
          annual_fee: feeType === 'annual_fee' ? parseFloat(value) || 0 : 0,
          tuition_fee: feeType === 'tuition_fee' ? parseFloat(value) || 0 : 0,
          total_fee: 0,
          fee_submission_last_date: new Date()
        });
      } else {
        const monthEntry = { ...newMonthlyFees[monthIndex] };
        monthEntry[feeType] = parseFloat(value) || 0;
        monthEntry.total_fee = (monthEntry.admission_fee || 0) +
          (monthEntry.annual_fee || 0) +
          (monthEntry.tuition_fee || 0);
        newMonthlyFees[monthIndex] = monthEntry;
      }

      const total_amount = newMonthlyFees.reduce((sum, month) => sum + (month.total_fee || 0), 0);

      return {
        ...prev,
        monthly_fees: newMonthlyFees,
        total_amount
      };
    });
  };

  const handleDateChange = (monthId, date) => {
    setNewFeeSetting(prev => {
      const newMonthlyFees = [...prev.monthly_fees];
      const monthIndex = newMonthlyFees.findIndex(m => m.month_name === monthId);

      if (monthIndex === -1) {
        newMonthlyFees.push({
          month_name: monthId,
          admission_fee: 0,
          annual_fee: 0,
          tuition_fee: 0,
          total_fee: 0,
          fee_submission_last_date: date ? new Date(date) : new Date()
        });
      } else {
        const monthEntry = { ...newMonthlyFees[monthIndex] };
        monthEntry.fee_submission_last_date = date ? new Date(date) : new Date();
        newMonthlyFees[monthIndex] = monthEntry;
      }

      return {
        ...prev,
        monthly_fees: newMonthlyFees
      };
    });
  };

  const getFeeValue = (monthId, feeType) => {
    const monthEntry = newFeeSetting.monthly_fees.find(m => m.month_name === monthId);
    return monthEntry ? monthEntry[feeType] || "" : "";
  };

  const getDateValue = (monthId) => {
    const monthEntry = newFeeSetting.monthly_fees.find(m => m.month_name === monthId);
    if (!monthEntry || !monthEntry.fee_submission_last_date) return "";
    return new Date(monthEntry.fee_submission_last_date).toISOString().split('T')[0];
  };

  const resetForm = () => {
    setNewFeeSetting({
      group_name: "",
      monthly_fees: [],
      total_amount: 0
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleAdd = async () => {
    if (!newFeeSetting.group_name || newFeeSetting.total_amount === 0) {
      alert("Please select a group and enter fee amounts.");
      return;
    }

    try {
      const payload = {
        group_name: newFeeSetting.group_name,
        monthly_fees: newFeeSetting.monthly_fees.map(fee => ({
          month_name: fee.month_name,
          admission_fee: fee.admission_fee,
          annual_fee: fee.annual_fee,
          tuition_fee: fee.tuition_fee,
          fee_submission_last_date: fee.fee_submission_last_date
        })),
        total_amount: newFeeSetting.monthly_fees.reduce((sum, month) => sum + (month.total_fee || 0), 0)
      };

      const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/create-fee-structure", payload);

      if (response.data?.success) {
        toast.success(response.data?.message || "Fee structure added successfully");
        fetchData();
        resetForm();
        setIsPopoverOpen(false);
      } else {
        throw new Error(response.data?.message || "Failed to add fee structure");
      }
    } catch (err) {
      console.error("Add error:", err);
      setError(err.response?.data?.message || "Failed to add fee structure");
    }
  };

  const handleUpdate = async () => {
    if (!currentId || !newFeeSetting.group_name || newFeeSetting.total_amount === 0) {
      alert("Please select a group and enter fee amounts.");
      return;
    }

    try {
      const total_amount = newFeeSetting.monthly_fees.reduce((sum, month) => sum + (month.total_fee || 0), 0);

      const payload = {
        group_name: newFeeSetting.group_name,
        monthly_fees: newFeeSetting.monthly_fees.map(fee => ({
          month_name: fee.month_name,
          admission_fee: fee.admission_fee,
          annual_fee: fee.annual_fee,
          tuition_fee: fee.tuition_fee,
          fee_submission_last_date: fee.fee_submission_last_date
        })),
        total_amount
      };

      const response = await axios.put(
        `https://erp-backend-fy3n.onrender.com/api/update-fee-structure/${currentId}`,
        payload
      );

      if (response.data?.success) {
        setData(prevData =>
          prevData.map(item =>
            item._id === currentId
              ? {
                ...item,
                ...payload,
                group_name: feeGroups.find(g => g._id === payload.group_name),
                monthly_fees: payload.monthly_fees.map(fee => ({
                  ...fee,
                  month_name: installments.find(i => i._id === fee.month_name)
                })),
                total_amount
              }
              : item
          )
        );
        fetchData();

        resetForm();
        setIsPopoverOpen(false);
      } else {
        throw new Error(response.data?.message || "Failed to update fee structure");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Failed to update fee structure");
      fetchData();
    }
  };

  const handleEdit = (id) => {
    const recordToEdit = data.find(item => item._id === id);
    if (!recordToEdit) return;

    setCurrentId(id);
    setIsEditing(true);
    setIsPopoverOpen(true);

    setNewFeeSetting({
      group_name: recordToEdit.group_name?._id || recordToEdit.group_name || "",
      monthly_fees: recordToEdit.monthly_fees.map(fee => ({
        month_name: fee.month_name?._id || fee.month_name,
        admission_fee: fee.admission_fee,
        annual_fee: fee.annual_fee,
        tuition_fee: fee.tuition_fee,
        total_fee: (fee.admission_fee || 0) + (fee.annual_fee || 0) + (fee.tuition_fee || 0),
        fee_submission_last_date: fee.fee_submission_last_date
      })),
      total_amount: recordToEdit.total_amount
    });
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this fee structure?")) return;

    try {
      await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-fee-structure/${id}`);
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete fee structure");
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
      width: "80px",
    },
    {
      name: "Group Name",
      selector: (row) => row.group_name?.group_name || "N/A",
      sortable: true,
    },
    {
      name: "Total Amount",
      selector: (row) => {
        if (!row.total_amount && row.monthly_fees) {
          return row.monthly_fees.reduce((sum, month) => sum + (month.total_fee || 0), 0);
        }
        return row.total_amount || "N/A";
      },
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="editButton btn-primary"
            onClick={() => handleEdit(row._id)}
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            className="editButton btn-danger"
            onClick={() => handleDelete(row._id)}
            title="Delete"
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="breadcrumbSheet">
        <Container>
          <Row>
            <Col>
              <Breadcrumb>
                <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                <Breadcrumb.Item href="/fees/all-module">Fees</Breadcrumb.Item>
                <Breadcrumb.Item active>Manage Fee Structure</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
        </Container>
      </div>
      <section>
        <Container>
          <div className="position-relative">
            <Button
              onClick={() => {
                resetForm();
                setIsPopoverOpen(true);
              }}
              className="btn-add mb-4"
            >
              <CgAddR /> New Fee
            </Button>
          </div>
          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{isEditing ? 'Edit Fee Structure' : 'Add New Fee'}</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    resetForm();
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Group Name</FormLabel>
                    <FormControl
                      as="select"
                      value={newFeeSetting.group_name}
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
                      type="text"
                      value={newFeeSetting.monthly_fees.reduce((sum, month) => sum + (month.total_fee || 0), 0)}
                      readOnly
                    />
                  </Col>
                </Row>
                <Row>
                  <Col lg={12}>
                    <BootstrapTable bordered responsive className="tableform mt-3">
                      <thead>
                        <tr>
                          <th></th>
                          <th></th>
                          {installments.map((installment) => (
                            <th key={installment._id}>
                              <div>{installment.name}</div>
                              {installment.installment_name && (
                                <div className="small text-muted">{installment.installment_name}</div>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th>ADMISSION FEE</th>
                          <td>
                            <FormSelect name="class_name">
                              <option value="">Life Time</option>
                            </FormSelect>
                          </td>
                          {installments.map((installment) => (
                            <td key={`admission-${installment._id}`}>
                              <FormControl
                                type="number"
                                value={getFeeValue(installment._id, 'admission_fee')}
                                onChange={(e) => handleFeeAmountChange(installment._id, 'admission_fee', e.target.value)}
                                disabled={installment.installment_name.toLowerCase() !== 'april'}
                              />
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th>ANNUAL FEE</th>
                          <td>
                            <FormSelect name="class_name">
                              <option value="">Life Time</option>
                            </FormSelect>
                          </td>
                          {installments.map((installment) => (
                            <td key={`annual-${installment._id}`}>
                              <FormControl
                                type="number"
                                value={getFeeValue(installment._id, 'annual_fee')}
                                onChange={(e) => handleFeeAmountChange(installment._id, 'annual_fee', e.target.value)}
                                disabled={installment.installment_name.toLowerCase() !== 'april'}
                              />
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th>TUITION FEE</th>
                          <td>
                            <FormSelect name="class_name">
                              <option value="">Installment Type</option>
                            </FormSelect>
                          </td>
                          {installments.map((installment) => (
                            <td key={`tuition-${installment._id}`}>
                              <FormControl
                                type="number"
                                value={getFeeValue(installment._id, 'tuition_fee')}
                                onChange={(e) => handleFeeAmountChange(installment._id, 'tuition_fee', e.target.value)}
                              />
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th>TOTAL FEE</th>
                          <td></td>
                          {installments.map((installment) => {
                            const monthEntry = newFeeSetting.monthly_fees.find(m => m.month_name === installment._id);
                            const total = monthEntry ? monthEntry.total_fee : 0;
                            return (
                              <td key={`total-${installment._id}`}>
                                <FormControl type="text" value={total} readOnly />
                              </td>
                            );
                          })}
                        </tr>
                        <tr>
                          <th>Fee Submission Last Date</th>
                          <td></td>
                          {installments.map((installment) => (
                            <td key={`date-${installment._id}`}>
                              <FormControl
                                type="date"
                                value={getDateValue(installment._id)}
                                onChange={(e) => handleDateChange(installment._id, e.target.value)}
                              />
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </BootstrapTable>
                  </Col>
                </Row>
                {isEditing ? (
                  <Button onClick={handleUpdate} className="btn btn-primary mt-3">
                    Update Fee
                  </Button>
                ) : (
                  <Button onClick={handleAdd} className="btn btn-primary mt-3">
                    Add Fee
                  </Button>
                )}
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Fee Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && data.length > 0 ? (
              <Table
                columns={columns}
                data={data}
                pagination
                highlightOnHover
                responsive
              />
            ) : (
              !loading && !error && <p>No data available.</p>
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default FeeStatement;