"use client";

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, FormGroup, Button, Breadcrumb } from "react-bootstrap";
import axios from "axios";
import { jsPDF } from "jspdf";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const CertificateWizard = () => {
  const [student, setStudent] = useState(null);
  const [registrationId, setRegistrationId] = useState("");
  const [error, setError] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState("");

  useEffect(() => {
    if (registrationId.trim() !== "") {
      fetchStudentData();
    }
  }, [registrationId]);

  const fetchStudentData = async () => {
    setError("");
    setStudent(null);

    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/students/search?search_term=${registrationId}`
      );

      if (response?.data?.success) {
        const studentData = response.data.data.find(
          (student) => student.registration_id === registrationId
        );
        if (studentData) {
          setStudent(studentData);
        }
      } else {
        setError("Failed to fetch student data.");
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      setError("Failed to fetch student data. Please try again.");
    }
  };

  const generateCertificatePDF = () => {
    if (!student || !selectedCertificate) return;

    const doc = new jsPDF();
    const { first_name, last_name, father_name, admission_date, joining_date, date_of_birth } = student;

    doc.text(`${selectedCertificate} Certificate`, 10, 10);
    doc.text(`This is to certify that ${first_name} ${last_name},`, 10, 20);
    doc.text(`son/daughter of ${father_name},`, 10, 30);

    if (selectedCertificate === "Bonafide") {
      doc.text(`is a bonafide student of our institution.`, 10, 40);
      doc.text(`Admission Date: ${admission_date}`, 10, 50);
      doc.text(`Joining Date: ${joining_date}`, 10, 60);
    } else if (selectedCertificate === "Character") {
      doc.text(`has shown good conduct and behavior during their time at our institution.`, 10, 40);
      doc.text(`Admission Date: ${admission_date}`, 10, 50);
      doc.text(`Joining Date: ${joining_date}`, 10, 60);
    } else if (selectedCertificate === "Date of Birth Confirmation") {
      doc.text(`was born on ${date_of_birth}.`, 10, 40);
      doc.text(`This confirmation is issued for official purposes.`, 10, 50);
    }

    doc.save(`${selectedCertificate.toLowerCase().replace(/ /g, "_")}_certificate_${student.registration_id}.pdf`);
  };

  
  const breadcrumbItems = [{ label: "students", link: "/students/reports/all-reports" }, { label: "certificate-wizard", link: "null" }]

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

          <Row>
            <Col>
              <div className="cover-sheet">
                <div className="studentHeading">
                  <h2>Certificate Wizard</h2>
                </div>
                <Form className="formSheet">
                  <Row className="mb-3">
                    <Col lg={12}>
                      <FormGroup>
                        <Form.Label>Type Adm No For Search Student & Enter*</Form.Label>
                        <Form.Control
                          type="text"
                          value={registrationId}
                          onChange={(e) => setRegistrationId(e.target.value)}
                          placeholder="Enter Registration ID"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  {error && <div className="text-danger">{error}</div>}

                  <Row className="mb-3">
                    <Col lg={12}>
                      <div>
                        <h3>Select Certificate</h3>
                        <Form.Check
                          type="radio"
                          label="Bonafide Certificate"
                          name="certificate"
                          value="Bonafide"
                          checked={selectedCertificate === "Bonafide"}
                          onChange={(e) => setSelectedCertificate(e.target.value)}
                        />
                        <Form.Check
                          type="radio"
                          label="Character Certificate"
                          name="certificate"
                          value="Character"
                          checked={selectedCertificate === "Character"}
                          onChange={(e) => setSelectedCertificate(e.target.value)}
                        />
                        <Form.Check
                          type="radio"
                          label="Confirmation of Date of Birth"
                          name="certificate"
                          value="Date of Birth Confirmation"
                          checked={selectedCertificate === "Date of Birth Confirmation"}
                          onChange={(e) => setSelectedCertificate(e.target.value)}
                        />
                      </div>
                    </Col>
                  </Row>
                  <Button
                    className="btn btn-warning mt-3 ms-2"
                    onClick={generateCertificatePDF}
                    disabled={!student || !selectedCertificate}
                  >
                    Generate and Download Certificate
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default CertificateWizard;
