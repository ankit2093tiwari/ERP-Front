"use client";
import React, { useState, useEffect } from "react";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
  FormSelect,
  FormGroup,
  Table
} from "react-bootstrap";
import axios from "axios";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FeeEntry = () => {
  const [receiptDate, setReceiptDate] = useState(new Date());
  const [receiptNo, setReceiptNo] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [selectedPayType, setSelectedPayType] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentListData, setStudentListData] = useState([]);
  const [studentListOptions, setStudentListOptions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeGroups, setFeeGroups] = useState([]);
  const [selectedFeeGroup, setSelectedFeeGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [feeHeads, setFeeHeads] = useState([]);
  const [feeAmounts, setFeeAmounts] = useState({});
  const [remarks, setRemarks] = useState({});
  const [totalDues, setTotalDues] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [lateFine, setLateFine] = useState(0);
  const [serviceCharges, setServiceCharges] = useState([]);
  const [payMode, setPayMode] = useState("Cash");

  const breadcrumbItems = [
    { label: "Fee", link: "/fees/all-module" },
    { label: "deposit-entry", link: "null" }
  ];

  const accountTypes = [
    { value: "School", label: "School" },
    { value: "Bus", label: "Bus" },
    { value: "School & Bus", label: "School & Bus" }
  ];

  const payModes = [
    { value: "Cheque", label: "Cheque" },
    { value: "Cash", label: "Cash" },
    { value: "RTGS", label: "RTGS" },
    { value: "Debit Card", label: "Debit Card" },
    { value: "Credit Card", label: "Credit Card" },
    { value: "Online", label: "Online" }
  ];

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getAllStudent = async () => {
    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/students/search`
      );
      if (response?.data?.success) {
        const options = response?.data?.data?.map((item) => ({
          value: item?.registration_id,
          label: `${item?.first_name} - Father: ${item?.father_name} - ID: ${item?.registration_id}`,
          data: item
        }));
        setStudentListData(response.data.data);
        setStudentListOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  const getAllSchools = async () => {
    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/schools`
      );
      if (response?.data?.success) {
        setSchools(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch schools", error);
    }
  };

  const getPaymentTypes = async () => {
    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/all-payment-type`
      );
      if (response?.data?.success) {
        const options = response.data.paymentTypes.map(type => ({
          value: type._id,
          label: type.payment_type === 'installment' ? 'Installment' : 'Multi Installment',
          type: type.payment_type
        }));
        setPaymentTypes(options);
      }
    } catch (error) {
      console.error("Failed to fetch payment types", error);
    }
  };

  const getInstallments = async () => {
    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/all-installments`
      );
      if (response?.data?.success) {
        const options = response.data.data.map(installment => ({
          value: installment._id,
          label: installment.installment_name
        }));
        setInstallments(options);
      }
    } catch (error) {
      console.error("Failed to fetch installments", error);
    }
  };

  const getFeeHeads = async () => {
    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/fee-heads`
      );
      if (response?.data?.success) {
        setFeeHeads(response.data.data);
        // Initialize amounts and remarks
        const initialAmounts = {};
        const initialRemarks = {};
        response.data.data.forEach(head => {
          initialAmounts[head._id] = 0;
          initialRemarks[head._id] = "";
        });
        setFeeAmounts(initialAmounts);
        setRemarks(initialRemarks);
      }
    } catch (error) {
      console.error("Failed to fetch fee heads", error);
    }
  };

  const getStudentData = async (selectedOption) => {
    if (!selectedOption) {
      setSelectedStudent(null);
      setFeeGroups([]);
      setSelectedFeeGroup(null);
      setSelectedClass("");
      setSelectedSchool("");
      return;
    }

    const student = studentListData.find(
      (item) => item.registration_id === selectedOption.value
    );

    if (student) {
      setSelectedStudent(student);
      const className = student.class_name?.class_name || "";
      setSelectedClass(className);
      const schoolName = student.school_name?.school_name || "";
      setSelectedSchool(schoolName);

      try {
        setIsLoading(true);
        const feeGroupsResponse = await axios.get(
          `https://erp-backend-fy3n.onrender.com/api/fee-groups/by-class/${encodeURIComponent(className)}`
        );

        if (feeGroupsResponse?.data?.success) {
          const feeGroupOptions = feeGroupsResponse.data.data.map((group) => ({
            value: group._id,
            label: group.group_name,
            data: group
          }));
          setFeeGroups(feeGroupOptions);

          if (feeGroupOptions.length > 0) {
            setSelectedFeeGroup(feeGroupOptions[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching fee groups:", error);
        setFeeGroups([]);
        setSelectedFeeGroup(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    getAllStudent();
    getAllSchools();
    getPaymentTypes();
    getInstallments();
    getFeeHeads();
  }, []);

  useEffect(() => {
    // Calculate total dues whenever fee amounts change
    const total = Object.values(feeAmounts).reduce((sum, amount) => sum + amount, 0);
    setTotalDues(total);
  }, [feeAmounts]);

  const handleFeeAmountChange = (headId, value) => {
    setFeeAmounts(prev => ({
      ...prev,
      [headId]: parseFloat(value) || 0
    }));
  };

  const handleRemarkChange = (headId, value) => {
    setRemarks(prev => ({
      ...prev,
      [headId]: value
    }));
  };

  const handleServiceChargeChange = (month, value) => {
    setServiceCharges(prev => {
      const updated = [...prev];
      const index = updated.findIndex(item => item.month === month);
      if (index >= 0) {
        updated[index].amount = parseFloat(value) || 0;
      } else {
        updated.push({ month, amount: parseFloat(value) || 0 });
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        receiptDate,
        receiptNo,
        studentId: selectedStudent?.registration_id,
        class: selectedClass,
        school: selectedSchool,
        feeGroup: selectedFeeGroup?.value,
        paymentType: selectedPayType?.value,
        installment: selectedInstallment?.value,
        accountType: selectedAccountType,
        feeHeads: feeHeads.map(head => ({
          headId: head._id,
          headName: head.head_name,
          amount: feeAmounts[head._id] || 0,
          remark: remarks[head._id] || ""
        })),
        totalDues,
        paidAmount,
        lateFine,
        serviceCharges,
        payMode,
        balance: totalDues - paidAmount
      };

      const response = await axios.post(
        `https://erp-backend-fy3n.onrender.com/api/fee-entries`,
        payload
      );

      if (response.data.success) {
        alert("Fee entry created successfully!");
        // Reset form
        setReceiptNo("");
        setSelectedStudent(null);
        setSelectedFeeGroup(null);
        setSelectedPayType(null);
        setSelectedInstallment(null);
        setSelectedAccountType("");
        setFeeAmounts({});
        setRemarks({});
        setPaidAmount(0);
        setLateFine(0);
        setServiceCharges([]);
      }
    } catch (error) {
      console.error("Error submitting fee entry:", error);
      alert("Failed to create fee entry");
    }
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
          <div className="cover-sheet">
            <div className="studentHeading">
              <h2>Deposit Entry</h2>
            </div>

            <Form onSubmit={handleSubmit} className="formSheet">
              <Row className="mb-3">
                <Col md={12}>
                  <FormLabel>Search Student *</FormLabel>
                  <Select
                    options={studentListOptions}
                    onChange={getStudentData}
                    onInputChange={setSearchTerm}
                    placeholder="Search student..."
                    isClearable
                    isSearchable
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <FormGroup>
                    <FormLabel>Receipt Date</FormLabel>
                    <DatePicker
                      selected={receiptDate}
                      onChange={(date) => setReceiptDate(date)}
                      className="form-control"
                      dateFormat="MM/dd/yyyy"
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <FormLabel>Class</FormLabel>
                    <FormControl
                      type="text"
                      value={selectedClass}
                      readOnly
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <FormLabel>Installment *</FormLabel>
                    <Select
                      options={installments}
                      value={selectedInstallment}
                      onChange={(option) => setSelectedInstallment(option)}
                      placeholder="Select Installment"
                      isClearable
                      required
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <FormGroup>
                    <FormLabel>Fee Group *</FormLabel>
                    <Select
                      options={feeGroups}
                      value={selectedFeeGroup}
                      onChange={(option) => setSelectedFeeGroup(option)}
                      placeholder={isLoading ? "Loading fee groups..." : "Select Fee Group"}
                      isClearable
                      isDisabled={isLoading || feeGroups.length === 0}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <FormLabel>Pay Type *</FormLabel>
                    <Select
                      options={paymentTypes}
                      value={selectedPayType}
                      onChange={(option) => {
                        setSelectedPayType(option);
                        setSelectedInstallment(null);
                      }}
                      placeholder="Select Pay Type"
                      isClearable
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <FormLabel>Receipt No</FormLabel>
                    <FormControl
                      type="text"
                      value={receiptNo}
                      onChange={(e) => setReceiptNo(e.target.value)}
                      required
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <FormGroup>
                    <FormLabel>A/C Type *</FormLabel>
                    <Select
                      options={accountTypes}
                      value={accountTypes.find(opt => opt.value === selectedAccountType)}
                      onChange={(option) => setSelectedAccountType(option?.value || "")}
                      placeholder="Select A/C Type"
                      isClearable
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <FormLabel>Pay Mode</FormLabel>
                    <Select
                      options={payModes}
                      value={payModes.find(opt => opt.value === payMode)}
                      onChange={(option) => setPayMode(option?.value || "Cash")}
                      placeholder="Select Pay Mode"
                      isClearable
                    />
                  </FormGroup>
                </Col>
              </Row>

              {/* Show fee heads table when A/C Type is School */}
              {selectedAccountType === "School" && (
                <>
                  <Row className="mb-3 mt-4">
                    <Col md={12}>
                      <h4>Student Ledger Details</h4>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Fee Heads</th>
                            <th>Due</th>
                            <th>Con</th>
                            <th>Paid</th>
                            <th>Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {feeHeads.map((head) => (
                            <tr key={head._id}>
                              <td>{head.head_name}</td>
                              <td>
                                <FormControl
                                  type="number"
                                  value={feeAmounts[head._id] || 0}
                                  onChange={(e) => handleFeeAmountChange(head._id, e.target.value)}
                                />
                              </td>
                              <td>
                                <FormControl
                                  type="number"
                                  value={feeAmounts[head._id] || 0}
                                  readOnly
                                />
                              </td>
                              <td>
                                <FormControl
                                  type="number"
                                  value={0}
                                  readOnly
                                />
                              </td>
                              <td>
                                <FormControl
                                  type="text"
                                  value={remarks[head._id] || ""}
                                  onChange={(e) => handleRemarkChange(head._id, e.target.value)}
                                  placeholder="Remark"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <FormGroup>
                        <FormLabel>Total Dues</FormLabel>
                        <FormControl
                          type="number"
                          value={totalDues}
                          readOnly
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <FormLabel>Paid Amount</FormLabel>
                        <FormControl
                          type="number"
                          value={paidAmount}
                          onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                        />
                      </FormGroup>
                    </Col>

                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <FormGroup>
                        <FormLabel>Service Charges</FormLabel>
                        <FormControl
                          type="number"
                          value={lateFine}
                          onChange={(e) => setLateFine(parseFloat(e.target.value) || 0)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <FormLabel>Balance</FormLabel>
                        <FormControl
                          type="number"
                          value={totalDues - paidAmount}
                          readOnly
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <FormGroup>
                        <FormLabel>Remarks</FormLabel>
                        <FormControl
                          type="text"
                          value={lateFine}
                          onChange={(e) => setLateFine(parseFloat(e.target.value) || 0)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <FormLabel>Fee Book Number</FormLabel>
                        <FormControl
                          type="number"
                          value={totalDues - paidAmount}
                          readOnly
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  

                  <Row className="mb-3">
                    <Col md={12}>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            {months.map(month => (
                              <th key={month}>{month}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            {months.map(month => (
                              <td key={month}>
                                <FormControl
                                  type="number"
                                  value={serviceCharges.find(sc => sc.month === month)?.amount || 0}
                                  onChange={(e) => handleServiceChargeChange(month, e.target.value)}
                                />
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                  </Row>
                </>
              )}

              <Row className="mb-5 mt-4">
                <Col md={12}>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!selectedFeeGroup || !selectedPayType || !selectedInstallment || !selectedAccountType}
                  >
                    Save
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </Container>
      </section>
    </>
  );
};

export default FeeEntry;