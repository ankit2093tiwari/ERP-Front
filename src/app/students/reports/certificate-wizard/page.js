"use client";

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, FormGroup, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { jsPDF } from "jspdf";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const CertificateWizard = () => {
  const [student, setStudent] = useState(null);
  const [registrationId, setRegistrationId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState("");
  const [schoolData, setSchoolData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (registrationId.trim() !== "") {
      fetchStudentData();
    } else {
      setStudent(null);
      setSuccess("");
      setError("");
    }
  }, [registrationId]);

  useEffect(() => {
    fetchSchoolData();
  }, []);

  const fetchSchoolData = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/schools/all");
      if (response?.data?.success) {
        setSchoolData(response.data.data[0] || {});
      }
    } catch (error) {
      console.error("Error fetching school data:", error);
    }
  };

  const fetchStudentData = async () => {
    setError("");
    setSuccess("");
    setStudent(null);
    setLoading(true);

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
          setSuccess("Student found successfully!");
          setError("");
        } else {
          setError("No student found with this registration ID.");
          setSuccess("");
        }
      } else {
        setError("Failed to fetch student data.");
        setSuccess("");
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      setError("Failed to fetch student data. Please try again.");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  const getStringValue = (value) => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      return value.class_name || value.section_name || value.name || JSON.stringify(value);
    }
    return String(value || '');
  };

  const generateCertificatePDF = () => {
    if (!student || !selectedCertificate) return;

    try {
      const doc = new jsPDF();
      const { 
        first_name, 
        last_name, 
        father_name, 
        mother_name,
        class_name,
        section_name,
        academic_year,
        date_of_birth,
        residence_address,
        registration_id
      } = student;

      // Get all values as strings
      const studentFirstName = getStringValue(first_name);
      const studentLastName = getStringValue(last_name);
      const studentFatherName = getStringValue(father_name);
      const studentMotherName = getStringValue(mother_name);
      const studentClassName = getStringValue(class_name);
      const studentSectionName = getStringValue(section_name);
      const studentAcademicYear = getStringValue(academic_year);
      const studentDOB = getStringValue(date_of_birth);
      const studentAddress = getStringValue(residence_address);
      const studentRegId = getStringValue(registration_id);

      // Set school name and contact info
      const schoolName = getStringValue(schoolData?.school_name || "R.D.S. MEMORIAL PUBLIC SCHOOL (English Medium)");
      const schoolContact = getStringValue(schoolData?.contact_number || "98989898989");

      // Split school name if it has parentheses
      const schoolNameParts = schoolName.split('(');
      const mainSchoolName = schoolNameParts[0].trim();
      const schoolType = schoolNameParts[1] ? `(${schoolNameParts[1].trim()}` : "";

      // Set initial font styles
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);

      if (selectedCertificate === "Bonafide") {
        // Bonafide Certificate Format
        doc.setFontSize(14);
        doc.text(mainSchoolName, 105, 20, { align: 'center' });
        
        if (schoolType) {
          doc.setFontSize(12);
          doc.text(schoolType, 105, 26, { align: 'center' });
        }

        doc.setFontSize(10);
        doc.text(schoolContact, 105, 38, { align: 'center' });

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Conduct-cum-Bona-fide Certificate", 105, 50, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        const textLines = [
          "This is to certify that",
          `Master ${studentFirstName} ${studentLastName} S/o, D/o Mr. ${studentFatherName} and Mrs. ${studentMotherName}`,
          `is / was studying in class ${studentClassName}${studentSectionName ? ` ${studentSectionName}` : ""}`,
          `during the academic year ${studentAcademicYear || "2020-2021"}.`,
          "He / She is / was a Bona-fide Student of this School. His / Her conduct is / was Good / Average.",
          "He / She is / was very obedient, sincere and hardworking."
        ];

        let yPosition = 70;
        textLines.forEach(line => {
          doc.text(line, 105, yPosition, { align: 'center' });
          yPosition += 8;
        });

        doc.setFontSize(10);
        doc.text("Office Assistant Principal", 40, yPosition + 20, { align: 'left' });
        doc.text("Dated: ___/___/20__", 160, yPosition + 20, { align: 'right' });

      } else if (selectedCertificate === "Character") {
        // Character Certificate Format (First Image)
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("CHARACTER CERTIFICATE", 105, 30, { align: 'center' });

        const today = new Date();
        const formattedDate = `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}`;
        doc.setFontSize(12);
        doc.text(`Date: ${formattedDate}`, 105, 40, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        const textLines = [
          "This is to certify that Master " + studentFirstName + " " + studentLastName + " D/S/o Mr. " + studentFatherName,
          "and Mrs. " + studentMotherName + " is a student of " + studentClassName + " of this institution in the academic year",
          studentAcademicYear + ".",
          "",
          "His conduct and character as recorded by the school during his stay in the school has",
          "been good.",
          "",
          "We wish him every success in his future career."
        ];

        let yPosition = 60;
        textLines.forEach(line => {
          doc.text(line, 105, yPosition, { align: 'center' });
          yPosition += 8;
        });

        doc.setFontSize(10);
        doc.text("Principal", 105, yPosition + 20, { align: 'center' });

      } else if (selectedCertificate === "Date of Birth Confirmation") {
        // Date of Birth Certificate Format (Second Image)
        const today = new Date();
        const formattedDate = `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}`;
        
        doc.setFontSize(12);
        doc.text(`Adm.No : ${studentRegId}    Date: ${formattedDate}`, 105, 20, { align: 'center' });

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("TO WHOMSOEVER IT MAY CONCERN", 105, 30, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        const textLines = [
          "This is to certify that Master " + studentFirstName + " " + studentLastName + " D/S/o Mr. " + studentFatherName,
          "and Mrs. " + studentMotherName + " is student of",
          studentClassName + (studentSectionName ? "#" + studentSectionName : "") + ", academic session " + (studentAcademicYear || "2020-2021") + " in this Institution.",
          "His Date of Birth is " + (studentDOB ? studentDOB : "2014-09-21") + " as per the scholar register."
        ];

        let yPosition = 50;
        textLines.forEach(line => {
          doc.text(line, 105, yPosition, { align: 'center' });
          yPosition += 8;
        });

        doc.setFontSize(12);
        doc.text("Principal", 105, yPosition + 20, { align: 'center' });
        doc.text("......", 105, yPosition + 30, { align: 'center' });
      }

      // Common footer for all certificates
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("Activate Windows", 105, 285, { align: 'center' });
      doc.text("Go to Settings to activate Windows.", 105, 290, { align: 'center' });

      doc.save(`${selectedCertificate.toLowerCase().replace(/ /g, "_")}_certificate_${student.registration_id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate certificate. Please try again.");
    }
  };

  const breadcrumbItems = [
    { label: "students", link: "/students/reports/all-reports" }, 
    { label: "certificate-wizard", link: "null" }
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
                  {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
                  {success && <Alert variant="success" className="mt-2">{success}</Alert>}
                  {loading && <Alert variant="info" className="mt-2">Loading student data...</Alert>}

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
                    disabled={!student || !selectedCertificate || loading}
                  >
                    {loading ? "Processing..." : "Generate and Download Certificate"}
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