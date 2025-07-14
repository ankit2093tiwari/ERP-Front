"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Container, Row, Col, Breadcrumb, Alert, Table as BootstrapTable, FormGroup, FormLabel, FormControl, FormSelect } from "react-bootstrap";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import { addNewFeeEntry, deleteFeeEntryById, getAllPaymentMode, getClasses, getFeeGroupDataBySectionId, getFeeHistoryByStudentId, getFeeStructureByFeeGroupId, getFeeStructures, getSections, getStudentsByClassAndSection } from "@/Services";
import useSessionId from "@/hooks/useSessionId";
import usePagePermission from "@/hooks/usePagePermission";

const FeeEntry = () => {
  const { hasSubmitAccess, hasEditAccess } = usePagePermission()
  const selectedSessionId = useSessionId()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [feeGroupId, setFeeGroupId] = useState("")
  const [data, setData] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [payFeeData, setPayFeeData] = useState([]);
  const [paymentMode, setPaymentMode] = useState('')
  const [feeData, setFeeData] = useState([])


  useEffect(() => {
    fetchClasses()
  }, [selectedSessionId])
  useEffect(() => {
    if (feeGroupId) {
      getStructureDataByGroupId()
      fetchPaymentModes()
    }
    else {
      setPayFeeData([])
    }
  }, [feeGroupId]);
  useEffect(() => {
    if (selectedClass) {
      fetchSections(selectedClass);
      // Reset section and students when class changes
      setSelectedSection("");
      setStudents([]);
      setSelectedStudent(null);
    }
  }, [selectedClass]);
  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudents();
      fetchFeeGroupData()
    } else {
      // Reset students when section is cleared
      setStudents([]);
      setSelectedStudent(null);
    }
  }, [selectedClass, selectedSection]);
  useEffect(() => {
    if (selectedStudent) getUserHistoryDetail()
  }, [selectedStudent])
  const fetchClasses = async () => {
    try {
      const response = await getClasses();
      setClassList(response?.data || []);
    } catch (err) {
      setError("Failed to fetch classes.", err);
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await getSections(classId);
      if (response?.success) {
        setSectionList(response?.data);
      } else {
        setSectionList([]);
      }
    } catch (err) {
      setError("Failed to fetch sections.", err);
    }
  };
  const fetchPaymentModes = async () => {
    const response = await getAllPaymentMode()
    setPaymentMode(response.data[0]._id); //for cash mode id

  }

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await getStudentsByClassAndSection(selectedClass, selectedSection);
      if (response.data && response.data.length > 0) {
        setStudents(response?.data);
      } else {
        setStudents([]);
      }
      setSelectedStudent(null);
    } catch (error) {
      console.error("Failed to fetch students", error);
      setStudents([]);
    }
    setLoading(false);
  };

  const handleStudentSelect = (studentId) => {
    const student = students.find(s => s._id === studentId);
    setSelectedStudent(student);
  };

  const handleDeleteFeeRecord = async (id) => {
    const confirmation = confirm("Are you sure to want to delete this record?")
    if (confirmation) {
      const response = await deleteFeeEntryById(id);
      // console.log(response);
      if (response.success) {
        toast.success(response?.message);
        getUserHistoryDetail()
      }
      else {
        toast.error(response?.message)
      }
    }

  }
  const feeColumns = [
    { name: "#", selector: (row, index) => index + 1, width: "50px" },
    { name: "RECEIPT NO", selector: (row) => row.receipt_no || "N/A" },
    { name: "INSTALLMENT NAME", selector: (row) => row.installment_name || "N/A" },
    { name: "REMARKS", selector: (row) => row.description || "N/A" },
    { name: "STATUS", selector: (row) => row.status || "N/A" },
    { name: "DATE", selector: (row) => row.date || "N/A" },
    { name: "PAID AMOUNT", selector: (row) => row.paid_amount || "N/A" },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {/* <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button> */}
          <button className="editButton btn-danger" onClick={() => handleDeleteFeeRecord(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const payFeeColumns = [
    {
      name: "",
      cell: (row, index) => (
        <input
          type="checkbox"
          checked={row.selected || false}
          onChange={() => handleCheckboxChange(index)}
          key={`cb-${index}-${row.selected}`}
        />
      ),
      width: "50px"
    },
    {
      name: "Installment",
      selector: (row) => row.month,
    },
    {
      name: "Admission Fee",
      cell: (row, index) => (
        <input
          type="number"
          className="form-control"
          value={row.admissionFee}
          onChange={(e) => handleInputChange(index, 'admissionFee', e.target.value)}
          readOnly
        />
      ),
    },
    {
      name: "Annual Fee",
      cell: (row, index) => (
        <input
          type="number"
          className="form-control"
          value={row.annualFee}
          onChange={(e) => handleInputChange(index, 'annualFee', e.target.value)}
          readOnly
        />
      ),
    },
    {
      name: "Tuition Fee",
      cell: (row, index) => (
        <input
          type="number"
          className="form-control"
          value={row.tuitionFee}
          onChange={(e) => handleInputChange(index, 'tuitionFee', e.target.value)}
          readOnly
        />
      ),
    },
  ];

  const fetchFeeGroupData = async () => {
    try {
      const response = await getFeeGroupDataBySectionId(selectedSection);
      setFeeGroupId(response?.data?._id || "")
    }
    catch (err) {
      console.log("Failed to fetch data", err);

    }
  }
  // console.log(selectedStudent);

  const getStructureDataByGroupId = async () => {
    try {
      const response = await getFeeStructureByFeeGroupId(feeGroupId);
      if (response?.success && response.data?.length > 0) {
        // Transform the monthly_fees data into the format needed for payFeeData
        const monthlyFees = response.data[0].monthly_fees;
        const formattedData = monthlyFees.map(fee => ({
          month: fee.month_name.installment_name,
          selected: false,
          admissionFee: fee.admission_fee,
          annualFee: fee.annual_fee,
          tuitionFee: fee.tuition_fee,
          feeId: fee._id,
          feeMonthId: fee.month_name._id,
          lastDate: fee.fee_submission_last_date
        }));
        setPayFeeData(formattedData);
      }
    } catch (err) {
      console.log("Failed to fetch data", err);
    }
  };


  const handleCheckboxChange = (index) => {
    setPayFeeData(prevData => {
      return prevData.map((item, i) =>
        i === index ? { ...item, selected: !item.selected } : item
      );
    });
  };
  const handleInputChange = (index, field, value) => {
    const updated = [...payFeeData];
    updated[index][field] = value;
    setPayFeeData(updated);
  };
  const getUserHistoryDetail = async () => {
    try {
      const response = await getFeeHistoryByStudentId(selectedStudent._id);

      const transformedData = response.data.map(item => ({
        _id: item._id,
        receipt_no: item.receipt_no || "N/A",
        installment_name: item.installment_name?.installment_name,
        description: item.remarks || "N/A",
        status: "Paid",
        date: new Date(item.date).toLocaleDateString() || "N/A",
        discount: item.other_discount || "0",
        fine: item.late_fee || "0",
        paid_amount: (item?.admission_fee + item?.tution_fee + item?.annual_fee) || "0",
      }));

      setFeeData(transformedData);
    } catch (error) {
      console.error("Failed to fetch fee history:", error);
      toast.error("Failed to load fee history");
      setFeeData([]);
    }
  };

  const assignStudentFee = async () => {
    if (!selectedStudent) {
      toast.error("No student selected");
      return;
    }

    const selectedFees = payFeeData.filter(fee => fee.selected);
    if (selectedFees.length === 0) {
      toast.error("Please select at least one fee");
      return;
    }

    try {
      setLoading(true);

      const errors = [];

      for (const fee of selectedFees) {
        const entry = {
          student: selectedStudent._id,
          fee_group: feeGroupId,
          paymentMode: paymentMode,
          installment_name: fee.feeMonthId,
          remarks: `Fee paid for ${fee.month}`,
          admission_fee: fee.admissionFee || 0,
          tution_fee: fee.tuitionFee || 0,
          annual_fee: fee.annualFee || 0,
          other_discount: 0,
          late_fee: 0,
          special_pay_no: 1,
        };

        try {
          await addNewFeeEntry(entry);
        } catch (err) {
          const errorMsg = err?.response?.data?.message || `Failed for ${fee.month}`;
          errors.push(errorMsg);
        }
      }

      // Refresh data after all requests
      await getUserHistoryDetail();
      setPayFeeData(prev => prev.map(item => ({ ...item, selected: false })));

      if (errors.length > 0) {
        errors.forEach(msg => toast.error(msg)); // Show each error
      } else {
        toast.success("Fees assigned successfully!");
      }

    } catch (err) {
      console.error("Fee assignment failed:", err);
      toast.error("Fee assignment failed");
    } finally {
      setLoading(false);
    }
  };

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
            <Row className="fromSheet">
              <Col>
                <div className="card shadow-none">
                  <div className="studentHeading">
                    <h2> <FaSearch /> Select Criteria </h2>
                  </div>
                  <div className="card-body">
                    <Row className="text-start">
                      <Col lg={4}>
                        <FormGroup controlId="validationCustom08">
                          <FormLabel className="labelForm">Select Class</FormLabel>
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
                        <FormGroup controlId="validationCustom09">
                          <FormLabel className="labelForm">Select Section</FormLabel>
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
                        <FormGroup controlId="validationCustom10">
                          <FormLabel className="labelForm">Select Student</FormLabel>
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
              </Col>
            </Row>
          </div>

          <div className="cover-sheet">
            {!loading && students.length === 0 && selectedClass && selectedSection && (
              <Row className="mt-3">
                <Col>
                  <div className="alert alert-info">
                    No students found for the selected class and section.
                  </div>
                </Col>
              </Row>
            )}
            {selectedStudent && (
              <Row className="mt-3">
                <Col>
                  <div className="tableSheet">
                    <h2> Fees Statement </h2>
                    <div className="card-body">
                      <Row>
                        <Col lg={4}>
                          <div className="idBox">
                            <div className="profilePhoto">
                              {selectedStudent.profile_Pic ? (
                                <img
                                  src={selectedStudent.profile_Pic}
                                  alt="Profile Pic"
                                  width="100"
                                  height="100"
                                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                                />
                              ) : (
                                <img
                                  src="/user.png"
                                  alt="Default Pic"
                                  width="100"
                                  height="100"
                                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                                />
                              )}
                            </div>

                            <h4>{selectedStudent.first_name} {selectedStudent.last_name}</h4>
                          </div>
                        </Col>
                        <Col lg={8}>
                          <BootstrapTable striped bordered hover className="shadow-sm rounded" >
                            <thead className="bg-primary text-white">
                              <tr>
                                <th colSpan={4} className="text-center fs-5">Student Details</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="fw-bold text-uppercase bg-light">Name</td>
                                <td>{selectedStudent.first_name} {selectedStudent.last_name}</td>
                                <td className="fw-bold text-uppercase bg-light">Class / Section</td>
                                <td>
                                  {selectedStudent.class_name?.class_name || 'N/A'}
                                  ({selectedStudent.section_name?.section_name || 'N/A'})
                                </td>
                              </tr>
                              <tr>
                                <td className="fw-bold text-uppercase bg-light">Father Name</td>
                                <td>{selectedStudent.father_name || 'N/A'}</td>
                                <td className="fw-bold text-uppercase bg-light">Admission No.</td>
                                <td>{selectedStudent.registration_id || 'N/A'}</td>
                              </tr>
                              <tr>
                                <td className="fw-bold text-uppercase bg-light">Mobile Number</td>
                                <td>{selectedStudent.phone_no || 'N/A'}</td>
                                <td className="fw-bold text-uppercase bg-light">Roll Number</td>
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
                            key={feeData.length} // Force re-render when data changes
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
                      <Table columns={payFeeColumns} data={payFeeData} key={payFeeData.filter(item => item.selected).length} />
                    </div>
                    <div>{hasSubmitAccess && (<button className="btn btn-secondary mt-2" onClick={assignStudentFee}>Pay Fee</button>)}</div>
                  </div>
                </Col>
              </Row>
            )}
          </div>
          {loading && (
            <Row className="mt-3">
              <Col>
                <div className="text-center">
                  <p>Loading students...</p>
                </div>
              </Col>
            </Row>
          )}
          {!selectedStudent && <Alert variant="info">Please select student to get Detailss.</Alert>}

        </Container>
      </section>
    </>
  );
};

export default FeeEntry;