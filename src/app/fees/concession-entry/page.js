"use client";
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, FormLabel, FormSelect, Button, Form, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import styles from "@/app/medical/routine-check-up/page.module.css";
import { addNewFeeConcessionEntry, BASE_URL, getClasses, getFeeGroupDataBySectionId, getFeeStructureByFeeGroupId, getSections, getStudentsByClassAndSection } from "@/Services";
import axios from 'axios';

const ConcessionEntry = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [feeGroupId, setFeeGroupId] = useState("");
  const [feeStructure, setFeeStructure] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [concessionType, setConcessionType] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");

  useEffect(() => {
    const fetchFeeData = async () => {
      if (!selectedSection) return;

      try {
        setIsLoading(true);
        const response = await getFeeGroupDataBySectionId(selectedSection);
        if (response?.success) {
          setFeeGroupId(response.data._id);
          const feeStructureResponse = await getFeeStructureByFeeGroupId(response.data._id);
          if (feeStructureResponse?.success) {
            setFeeStructure(feeStructureResponse.data[0]?.monthly_fees || []);

            const transformedInstallments = feeStructureResponse.data[0]?.monthly_fees.map(item => ({
              month: item.month_name.installment_name,
              monthId: item.month_name._id, // Store the installment ID
              actualFee: item.tuition_fee.toString(),
              discountAmount: "0",
              totalAmount: item.tuition_fee.toString()
            })) || [];

            setInstallments(transformedInstallments);
          }
        }
      } catch (error) {
        console.error("Error fetching fee data:", error);
        toast.error("Failed to load fee structure");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeeData();
  }, [selectedSection]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const classRes = await getClasses();
      setClassList(classRes.data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to load classes");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSections = async (classId) => {
    try {
      setIsLoading(true);
      const response = await getSections(classId);
      setSectionList(response.data || []);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
      toast.error("Failed to load sections");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassChange = (event) => {
    const classId = event.target.value;
    setSelectedClass(classId);
    setSelectedSection("");
    setStudents([]);
    if (classId) {
      fetchSections(classId);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedClass && selectedSection) {
        try {
          setIsLoading(true);
          const response = await getStudentsByClassAndSection(selectedClass, selectedSection);
          setStudents(response.data || []);
        } catch (error) {
          console.error("Failed to fetch students:", error);
          toast.error("Failed to load students");
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchStudents();
  }, [selectedClass, selectedSection]);

  const handleDiscountPercentChange = (e) => {
    const value = e.target.value;
    setDiscountPercent(value);

    // Only calculate if we have a valid number
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const updated = installments.map((item) => {
        const fee = parseFloat(item.actualFee);
        if (!isNaN(fee)) {
          const discount = (fee * numValue) / 100;
          const total = fee - discount;
          return {
            ...item,
            discountAmount: discount.toFixed(2),
            totalAmount: total.toFixed(2)
          };
        }
        return item;
      });
      setInstallments(updated);
    }
  };

  const handleConcessionTypeChange = (e) => {
    const type = e.target.value;
    setConcessionType(type);

    let discountValue;
    if (type === "FULL") {
      discountValue = 100;
    } else if (type === "HALF") {
      discountValue = 50;
    } else {
      discountValue = discountPercent || 0;
    }

    setDiscountPercent(discountValue.toString());

    const updated = installments.map((item) => {
      const fee = parseFloat(item.actualFee);
      if (!isNaN(fee)) {
        const discount = (fee * discountValue) / 100;
        const total = fee - discount;
        return {
          ...item,
          discountAmount: discount.toFixed(2),
          totalAmount: total.toFixed(2)
        };
      }
      return item;
    });
    setInstallments(updated);
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedSection || !selectedStudent) {
      toast.warn("Please select all fields.");
      return;
    }
    if (!concessionType) {
      toast.warn("Please select a concession type first");
      return;
    }

    if (concessionType === "CUSTOM" && (!discountPercent || isNaN(parseFloat(discountPercent)))) {
      toast.warn("Please enter a valid discount percentage");
      return;
    }

    const payload = {
      student: selectedStudent,
      type: concessionType,
      ...(concessionType === "CUSTOM" && {
        percentage: parseFloat(discountPercent),
        installments: installments.map(item => item.monthId)
      })
    };
    try {
      const response = await addNewFeeConcessionEntry(payload)
      if (response?.success) {
        toast.success(response?.message || "Concession data submitted successfully!");
        setSelectedClass("");
        setSelectedSection("");
        setSelectedStudent("");
        setConcessionType("");
        setDiscountPercent("");
        setInstallments([]);
      }
    } catch (error) {
      console.error("Error submitting concession data:", error);
      const errRes = error.response?.data;
      toast.error(errRes);
    }
    // console.log("Submitting payload:", payload);
    // toast.success("Submitted successfully!");
  };

  const breadcrumbItems = [
    { label: "fees", link: "/fees/all-module" },
    { label: "Concession Entry", link: "null" }
  ];
  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row className="mt-1 mb-1">
            <Col><BreadcrumbComp items={breadcrumbItems} /></Col>
          </Row>
        </Container>
      </div>

      <section>
        <Container>
          <div className='cover-sheet'>
            <div className="studentHeading">
              <h2>Fee Concession</h2>
            </div>
            <div>
              <Form className="formSheet mb-4">
                  <Row>
                    <Col lg={4}>
                      <FormLabel className={styles.labelForm}>Class</FormLabel>
                      <FormSelect
                        value={selectedClass}
                        onChange={handleClassChange}
                        className={styles.formControl}
                        disabled={isLoading}
                      >
                        <option value="">Select Class</option>
                        {classList.map((cls) => (
                          <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                        ))}
                      </FormSelect>
                    </Col>

                    <Col lg={4}>
                      <FormLabel className={styles.labelForm}>Section</FormLabel>
                      <FormSelect
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className={styles.formControl}
                        disabled={!selectedClass || isLoading}
                      >
                        <option value="">Select Section</option>
                        {sectionList.map((sec) => (
                          <option key={sec._id} value={sec._id}>{sec.section_name}</option>
                        ))}
                      </FormSelect>
                    </Col>

                    <Col lg={4}>
                      <FormLabel className={styles.labelForm}>Student</FormLabel>
                      <FormSelect
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        className={styles.formControl}
                        disabled={!selectedSection || isLoading}
                      >
                        <option value="">Select Student</option>
                        {students?.map((std) => (
                          <option key={std._id} value={std._id}>
                            {`${std.first_name || ''} ${std.last_name || ''}`.trim()}
                          </option>
                        ))}
                      </FormSelect>
                    </Col>
                  </Row>


                <Row>
                  <Col lg={12}>
                    <Form.Group className="mb-3" controlId="concessionType">
                      <Form.Label>Concession Type</Form.Label>
                      <FormSelect
                        value={concessionType}
                        onChange={handleConcessionTypeChange}
                        disabled={isLoading || !selectedClass || !selectedSection || !selectedStudent}
                      >
                        <option value="">No Concession</option>
                        <option value="CUSTOM">Custom Concession</option>
                        <option value="HALF">Half Concession (50%)</option>
                        <option value="FULL">Full Concession (100%)</option>
                      </FormSelect>
                    </Form.Group>
                  </Col>
                </Row>
                {concessionType === "CUSTOM" && (
                  <>
                    <Row>
                      <Col lg={12}>
                        <Form.Group className="mb-3" controlId="discountPercent">
                          <Form.Label>Enter Discount % (0-100)</Form.Label>
                          <Form.Control
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Enter discount %"
                            value={discountPercent}
                            onChange={handleDiscountPercentChange}
                            disabled={isLoading}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}

              </Form>


              {installments.length > 0 && (
                <>
                  <h5><strong>Installments Amount</strong></h5>
                  <Row className="mb-2">
                    <Col md={2}></Col>
                    <Col md={3}><strong>Actual Tuition Fee</strong></Col>
                    <Col md={3}><strong>Discount Amount</strong></Col>
                    <Col md={3}><strong>Total Amount</strong></Col>
                  </Row>

                  {installments.map((item, index) => (
                    <Row key={index} className="mb-2 align-items-center">
                      <Col md={2}><strong>{item.month}</strong></Col>
                      <Col md={3}>
                        <Form.Control type="text" value={item.actualFee} disabled />
                      </Col>
                      <Col md={3}>
                        <Form.Control type="text" value={item.discountAmount || ""} disabled />
                      </Col>
                      <Col md={3}>
                        <Form.Control type="text" value={item.totalAmount || ""} disabled />
                      </Col>
                    </Row>
                  ))}
                </>
              )}



              <Button
                className="mt-3"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Submit'}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};

export default ConcessionEntry;