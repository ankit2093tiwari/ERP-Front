"use client";

import React, { useState, useEffect, useCallback } from "react";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Container, Row, Col, Breadcrumb, Alert, Table as BootstrapTable, FormGroup, FormLabel, FormControl, FormSelect, Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import { addNewFeeEntry, deleteFeeEntryById, getAllPaymentMode, getClasses, getFeeGroupDataBySectionId, getFeeHistoryByStudentId, getFeeStructureByFeeGroupId, getSections, getStudentsByClassAndSection } from "@/Services";
import useSessionId from "@/hooks/useSessionId";
import usePagePermission from "@/hooks/usePagePermission";
import Image from "next/image";

const FeeEntry = () => {
  const { hasSubmitAccess, hasEditAccess } = usePagePermission()
  const selectedSessionId = useSessionId()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feeGroupId, setFeeGroupId] = useState("")
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [payFeeData, setPayFeeData] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('');
  const [feeData, setFeeData] = useState([])
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingPayment, setPendingPayment] = useState(null)
  const [lateFinePerDay, setLateFinePerDay] = useState(0)

  // Calculate days between two dates
  const calculateDaysLate = (lastDate) => {
    const today = new Date()
    const dueDate = new Date(lastDate)
    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)
    return Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)))
  }

  // Calculate late fee for a fee entry
  const calculateLateFee = (lastDate, finePerDay) => {
    if (!lastDate) return 0
    const daysLate = calculateDaysLate(lastDate)
    return daysLate * finePerDay
  }

  useEffect(() => {
    fetchClasses()
  }, [selectedSessionId])

  useEffect(() => {
    if (feeGroupId) {
      getStructureDataByGroupId()
      fetchPaymentModes()
    } else {
      setPayFeeData([])
    }
  }, [feeGroupId])

  useEffect(() => {
    if (selectedClass) {
      fetchSections(selectedClass)
      setSelectedSection("")
      setStudents([])
      setSelectedStudent(null)
    }
  }, [selectedClass])

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getStudentsByClassAndSection(selectedClass, selectedSection);
      setStudents(response?.data || []);
      setSelectedStudent(null);
    } catch (error) {
      toast.error("Failed to load students");
      setStudents([]);
    }
    setLoading(false);
  }, [selectedClass, selectedSection]);

  const fetchFeeGroupData = useCallback(async () => {
    try {
      const response = await getFeeGroupDataBySectionId(selectedSection);
      setFeeGroupId(response?.data?._id || "");
      setLateFinePerDay(response?.data?.late_fine_per_day || 0);
    } catch (err) {
      toast.error("Failed to load fee group data");
    }
  }, [selectedSection]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudents();
      fetchFeeGroupData();
    } else {
      setStudents([]);
      setSelectedStudent(null);
    }
  }, [selectedClass, selectedSection, fetchStudents, fetchFeeGroupData]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudents();
      fetchFeeGroupData();
    } else {
      setStudents([]);
      setSelectedStudent(null);
    }
  }, [selectedClass, selectedSection, fetchStudents, fetchFeeGroupData]);

  useEffect(() => {
    if (selectedStudent) getUserHistoryDetail()
  }, [selectedStudent])

  const fetchClasses = async () => {
    try {
      const response = await getClasses()
      setClassList(response?.data || [])
    } catch (err) {
      setError("Failed to fetch classes.")
      toast.error("Failed to load classes")
    }
  }

  const fetchSections = async (classId) => {
    try {
      const response = await getSections(classId)
      setSectionList(response?.data || [])
    } catch (err) {
      setError("Failed to fetch sections.")
      toast.error("Failed to load sections")
    }
  }

  const fetchPaymentModes = async () => {
    try {
      const response = await getAllPaymentMode();
      if (response?.data?.length > 0) {
        setPaymentModes(response.data);
        // Add null check before accessing _id
        if (response.data[0] && response.data[0]._id) {
          setSelectedPaymentMode(response.data[0]._id);
        }
      }
    } catch (err) {
      toast.error("Failed to load payment options");
      console.error("Payment mode fetch error:", err);
    }
  };

  const handleStudentSelect = (studentId) => {
    const student = students.find(s => s._id === studentId)
    setSelectedStudent(student)
  }

  const handleDeleteFeeRecord = async (id) => {
    const confirmation = confirm("Are you sure to want to delete this record?")
    if (confirmation) {
      try {
        const response = await deleteFeeEntryById(id)
        if (response.success) {
          toast.success(response?.message)
          getUserHistoryDetail()
        } else {
          toast.error(response?.message)
        }
      } catch (err) {
        toast.error("Failed to delete record")
      }
    }
  }


  const getStructureDataByGroupId = async () => {
    try {
      const response = await getFeeStructureByFeeGroupId(feeGroupId)
      if (response?.success && response.data?.length > 0) {
        const monthlyFees = response.data[0].monthly_fees
        const formattedData = monthlyFees.map(fee => {
          const lateFee = calculateLateFee(fee.fee_submission_last_date, lateFinePerDay)
          const totalFee = (fee.admission_fee || 0) +
            (fee.annual_fee || 0) +
            (fee.tuition_fee || 0) +
            lateFee

          return {
            month: fee.month_name.installment_name,
            selected: false,
            admissionFee: fee.admission_fee,
            annualFee: fee.annual_fee,
            tuitionFee: fee.tuition_fee,
            lateFee,
            applyLateFee: lateFee > 0, // Default to true if there's late fee
            totalFee,
            feeId: fee._id,
            feeMonthId: fee.month_name._id,
            lastDate: fee.fee_submission_last_date,
            daysLate: calculateDaysLate(fee.fee_submission_last_date)
          }
        })
        setPayFeeData(formattedData)
      }
    } catch (err) {
      toast.error("Failed to load fee structure")
    }
  }

  const handleCheckboxChange = (index) => {
    setPayFeeData(prevData => {
      return prevData.map((item, i) =>
        i === index ? { ...item, selected: !item.selected } : item
      )
    })
  }

  const handleLateFeeToggle = (index, applyLateFee) => {
    setPayFeeData(prevData => {
      const newData = [...prevData]
      const item = newData[index]

      // Calculate new total fee based on late fee application
      const newLateFee = applyLateFee ? item.lateFee : 0
      const newTotalFee = (item.admissionFee || 0) +
        (item.annualFee || 0) +
        (item.tuitionFee || 0) +
        newLateFee

      newData[index] = {
        ...item,
        applyLateFee,
        totalFee: newTotalFee
      }

      return newData
    })
  }

  const preparePaymentSummary = () => {
    const selectedFees = payFeeData.filter(fee => fee.selected)
    if (selectedFees.length === 0) return null

    const totalFees = selectedFees.reduce((sum, fee) => sum + fee.totalFee, 0)
    const totalLateFees = selectedFees.reduce((sum, fee) => sum + (fee.applyLateFee ? fee.lateFee : 0), 0)

    return {
      selectedFees,
      totalFees,
      totalLateFees,
      baseFees: totalFees - totalLateFees
    }
  }

  const handlePaymentConfirmation = () => {
    const paymentSummary = preparePaymentSummary()
    if (!paymentSummary) {
      toast.error("Please select at least one fee")
      return
    }
    setPendingPayment(paymentSummary)
    setShowConfirmModal(true)
  }

  const confirmPayment = async () => {
    setShowConfirmModal(false)

    if (!pendingPayment || !selectedStudent || !selectedPaymentMode) {
      toast.error("Payment data incomplete");
      return;
    }

    try {
      setLoading(true)
      const errors = []
      const successfulPayments = []

      for (const fee of pendingPayment.selectedFees) {
        const entry = {
          student: selectedStudent._id,
          fee_group: feeGroupId,
          paymentMode: selectedPaymentMode,
          installment_name: fee.feeMonthId,
          remarks: `Fee paid for ${fee.month}` +
            (fee.daysLate > 0 ? ` (${fee.daysLate} days late)` : ''),
          admission_fee: fee.admissionFee || 0,
          tution_fee: fee.tuitionFee || 0,
          annual_fee: fee.annualFee || 0,
          other_discount: 0,
          late_fee: fee.applyLateFee ? fee.lateFee : 0,
          special_pay_no: 1,
          total_amount: fee.totalFee
        }

        try {
          const response = await addNewFeeEntry(entry);
          if (response.success) {
            successfulPayments.push(fee.month);
          } else {
            errors.push(`Failed for ${fee.month}: ${response.message}`);
          }
        } catch (err) {
          const errorMsg = err?.response?.data?.message ||
            `Failed for ${fee.month}: ${err.message}`;
          errors.push(errorMsg);
        }
      }

      // Refresh data
      await getUserHistoryDetail()

      // Update payFeeData to mark successfully paid fees
      setPayFeeData(prev => prev.map(item => {
        if (pendingPayment.selectedFees.some(f => f.feeId === item.feeId)) {
          return { ...item, selected: false }
        }
        return item
      }))

      if (errors.length > 0) {
        errors.forEach(msg => toast.error(msg))
      }

      if (successfulPayments.length > 0) {
        toast.success(
          `Successfully paid for: ${successfulPayments.join(', ')}`
        )
      }

    } catch (err) {
      toast.error("Payment processing failed")
    } finally {
      setLoading(false)
      setPendingPayment(null)
    }
  }

  const getUserHistoryDetail = async () => {
    try {
      const response = await getFeeHistoryByStudentId(selectedStudent._id)

      const transformedData = response.data.map(item => ({
        _id: item._id,
        receipt_no: item.receipt_no || "N/A",
        installment_name: item.installment_name?.installment_name,
        description: item.remarks || "N/A",
        status: "Paid",
        date: item.date ? new Date(item.date).toLocaleDateString('en-GB') : "N/A",
        discount: item.other_discount || "0",
        fine: item.late_fee || "0",
        paid_amount: item.total_amount ||
          ((item?.admission_fee || 0) +
            (item?.tution_fee || 0) +
            (item?.annual_fee || 0)) || "0",
      }))

      setFeeData(transformedData)
    } catch (error) {
      toast.error("Failed to load payment history")
      setFeeData([])
    }
  }

  const feeColumns = [
    { name: "#", selector: (row, index) => index + 1, width: "50px" },
    { name: "RECEIPT NO", selector: (row) => row.receipt_no || "N/A" },
    { name: "INSTALLMENT", selector: (row) => row.installment_name || "N/A" },
    { name: "REMARKS", selector: (row) => row.description || "N/A" },
    { name: "DATE", selector: (row) => row.date || "N/A" },
    { name: "PAID AMOUNT", selector: (row) => row.paid_amount || "N/A" },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteFeeRecord(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ]

  const payFeeColumns = [
    {
      name: "",
      cell: (row, index) => (
        <input
          type="checkbox"
          checked={row.selected || false}
          onChange={() => handleCheckboxChange(index)}
          disabled={row.isPaid}
          aria-label={`Select ${row.month}`}
        />
      ),
      width: "50px"
    },
    {
      name: "Month",
      selector: row => row.month,
      cell: row => (
        <div>
          {row.month}
          {row.daysLate > 0 && (
            <span className="badge bg-danger ms-2">
              {row.daysLate} day{row.daysLate !== 1 ? 's' : ''} late
            </span>
          )}
        </div>
      )
    },
    {
      name: "Admission",
      cell: row => (
        <input
          type="number"
          className="form-control"
          value={row.admissionFee || 0}
          readOnly
        />
      )
    },
    {
      name: "Annual",
      cell: row => (
        <input
          type="number"
          className="form-control"
          value={row.annualFee || 0}
          readOnly
        />
      )
    },
    {
      name: "Tuition",
      cell: row => (
        <input
          type="number"
          className="form-control"
          value={row.tuitionFee || 0}
          readOnly
        />
      )
    },
    {
      name: "Late Fee",
      cell: (row, index) => row.daysLate > 0 ? (
        <div className="d-flex align-items-center">
          <input
            type="checkbox"
            checked={row.applyLateFee}
            onChange={(e) => handleLateFeeToggle(index, e.target.checked)}
            className="me-2"
          />
          <input
            type="number"
            className="form-control"
            value={row.lateFee || 0}
            readOnly
          />
        </div>
      ) : (
        <input
          type="number"
          className="form-control"
          value={0}
          readOnly
        />
      )
    },
    {
      name: "Total",
      cell: row => (
        <strong>
          {row.totalFee || 0}
        </strong>
      )
    },
    {
      name: "Due Date",
      cell: row => (
        <span className={row.daysLate > 0 ? 'text-danger' : ''}>
          {new Date(row.lastDate).toLocaleDateString('en-GB')}
        </span>
      )
    }
  ]

  const paymentSummary = preparePaymentSummary()

  return (
    <>
      <div className="breadcrumbSheet">
        <Container>
          <Row>
            <Col>
              <Breadcrumb>
                <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                <Breadcrumb.Item href="/fees/all-module">Fees</Breadcrumb.Item>
                <Breadcrumb.Item active>Fee Entry</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
        </Container>
      </div>

      <section>
        <Container>
          <div className="cover-sheet">
            <div className="studentHeading">
              <h2> <FaSearch /> Select Criteria </h2>
            </div>
            <div className="formSheet">
              <Row className="text-start">
                <Col lg={4}>
                  <FormGroup>
                    <FormLabel>Select Class</FormLabel>
                    <FormSelect
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      <option value="">Select Class</option>
                      {classList?.map((classItem) => (
                        <option key={classItem?._id} value={classItem?._id}>
                          {classItem?.class_name}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                </Col>
                <Col lg={4}>
                  <FormGroup>
                    <FormLabel>Select Section</FormLabel>
                    <FormSelect
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      disabled={!selectedClass}
                    >
                      <option value="">Select Section</option>
                      {sectionList?.map((sectionItem) => (
                        <option key={sectionItem?._id} value={sectionItem?._id}>
                          {sectionItem?.section_name} ({sectionItem?.section_code})
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                </Col>
                <Col lg={4}>
                  <FormGroup>
                    <FormLabel>Select Student</FormLabel>
                    <FormSelect
                      value={selectedStudent?._id || ""}
                      onChange={(e) => handleStudentSelect(e.target.value)}
                      disabled={!selectedClass || !selectedSection || students.length === 0}
                    >
                      <option value="">Select Student</option>
                      {students.map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.first_name} {student.last_name} (Roll: {student.roll_no || 'N/A'})
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                </Col>
              </Row>
            </div>
          </div>

          {loading && (
            <Row className="mt-3">
              <Col>
                <div className="text-center">
                  <p>Loading...</p>
                </div>
              </Col>
            </Row>
          )}

          {!loading && students.length === 0 && selectedClass && selectedSection && (
            <Row className="mt-3">
              <Col>
                <div className="alert alert-danger">
                  No students found for the selected class and section.
                </div>
              </Col>
            </Row>
          )}

          {selectedStudent && (
            <div className="cover-sheet">
              <Row className="mt-3">
                <Col>
                  <div className="tableSheet">
                    <h2> Fees Statement </h2>
                    <div className="card-body">
                      <Row>
                        <Col lg={4}>
                          <div className="idBox">
                            <div className="profilePhoto">
                              {selectedStudent.profile_Pic &&
                                (selectedStudent.profile_Pic.startsWith('http://') ||
                                  selectedStudent.profile_Pic.startsWith('https://')) ? (
                                <Image
                                  src={selectedStudent.profile_Pic}
                                  alt="Profile Pic"
                                  width={100}
                                  height={100}
                                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                                />
                              ) : (
                                <Image
                                  src="/user.png"
                                  alt="Default Pic"
                                  width={100}
                                  height={100}
                                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                                />
                              )}
                            </div>
                            <h4>{selectedStudent.first_name} {selectedStudent.last_name}</h4>
                          </div>
                        </Col>
                        <Col lg={8}>
                          <BootstrapTable striped bordered hover>
                            <thead className="bg-primary text-white">
                              <tr>
                                <th colSpan={4} className="text-center">Student Details</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="fw-bold bg-light">Name</td>
                                <td>{selectedStudent.first_name} {selectedStudent.last_name}</td>
                                <td className="fw-bold bg-light">Class/Section</td>
                                <td>
                                  {selectedStudent.class_name?.class_name || 'N/A'} /
                                  {selectedStudent.section_name?.section_name || 'N/A'}
                                </td>
                              </tr>
                              <tr>
                                <td className="fw-bold bg-light">Father Name</td>
                                <td>{selectedStudent.father_name || 'N/A'}</td>
                                <td className="fw-bold bg-light">Admission No.</td>
                                <td>{selectedStudent.registration_id || 'N/A'}</td>
                              </tr>
                              <tr>
                                <td className="fw-bold bg-light">Mobile</td>
                                <td>{selectedStudent.phone_no || 'N/A'}</td>
                                <td className="fw-bold bg-light">Roll No.</td>
                                <td>{selectedStudent.roll_no || 'N/A'}</td>
                              </tr>
                            </tbody>
                          </BootstrapTable>
                        </Col>
                      </Row>
                    </div>

                    <hr />

                    <div className="card-title">
                      <h2>Fees History</h2>
                    </div>
                    <div className="card-body">
                      <div className="tableSheet">
                        {feeData.length > 0 ? (
                          <Table
                            columns={feeColumns}
                            data={feeData}
                          />
                        ) : (
                          <p>No fee records found</p>
                        )}
                      </div>
                    </div>

                    <hr />

                    <div className="card-title">
                      <h2>Pay Fee</h2>
                    </div>
                    <div className="card-body">
                      <Table
                        columns={payFeeColumns}
                        data={payFeeData}
                      />
                    </div>

                    {paymentSummary && (
                      <div className="card-footer bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>Selected:</strong> {paymentSummary.selectedFees.length} month(s) |
                            <strong> Base Fees:</strong> {paymentSummary.baseFees} |
                            <strong> Late Fees:</strong> {paymentSummary.totalLateFees}
                          </div>
                          <div>
                            <strong>Total Payable:</strong> {paymentSummary.totalFees}
                          </div>
                          <button
                            className="btn btn-primary"
                            onClick={handlePaymentConfirmation}
                            disabled={!hasSubmitAccess}
                          >
                            Proceed to Payment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          )}

          {!selectedStudent && (
            <Alert variant="info" className="mt-3">
              Please select a student to view details.
            </Alert>
          )}
        </Container>
      </section>

      {/* Payment Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Fee Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pendingPayment && (
            <div>
              <h5>Payment Summary</h5>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Base Fee</th>
                    <th>Late Fee</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayment.selectedFees.map((fee, index) => (
                    <tr key={index}>
                      <td>{fee.month}</td>
                      <td>{
                        (fee.admissionFee || 0) +
                        (fee.annualFee || 0) +
                        (fee.tuitionFee || 0)
                      }</td>
                      <td>{fee.applyLateFee ? fee.lateFee : 0}</td>
                      <td>{fee.totalFee}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan="3">Total Payable</th>
                    <th>{pendingPayment.totalFees}</th>
                  </tr>
                </tfoot>
              </table>

              <div className="mt-3">
                <FormGroup>
                  <FormLabel className="labelForm">Payment Mode<span className="text-danger">*</span></FormLabel>
                  <FormSelect
                    value={selectedPaymentMode}
                    onChange={(e) => setSelectedPaymentMode(e.target.value)}
                    required
                  >
                    {paymentModes.map((mode) => (
                      <option key={mode._id} value={mode._id}>
                        {mode.payment_mode}
                      </option>
                    ))}
                  </FormSelect>
                </FormGroup>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={confirmPayment}
            disabled={!hasSubmitAccess || loading}
          >
            {loading ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default FeeEntry