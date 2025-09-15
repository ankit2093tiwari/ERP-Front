"use client";

import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  Button,
  Breadcrumb,
  FormSelect,
  Alert,
  Modal,
} from "react-bootstrap";
import DataTable from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { getClasses, getSchools, getSections, getStudentsByClassAndSection } from "@/Services";
import useSessionId from "@/hooks/useSessionId";

const GenerateIdCard = () => {
  const selectedSessionId = useSessionId();

  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noRecordsFound, setNoRecordsFound] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const iframeRef = useRef(null);

  useEffect(() => {
    fetchClasses();
  }, [selectedSessionId]);

  useEffect(() => {
    if (selectedClass) {
      fetchSections(selectedClass);
      setSelectedSection("");
      setStudents([]);
      setSelectedStudents([]);
      setNoRecordsFound(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setNoRecordsFound(false);
      try {
        const response = await getStudentsByClassAndSection(selectedClass, selectedSection)
        if (response.data?.length > 0) {

          setStudents(response.data);
        } else {
          setStudents([]);
          setNoRecordsFound(true);
        }
        setSelectedStudents([]);
        setSelectAll(false);
      } catch (error) {
        console.error("Failed to fetch students", error);
        setStudents([]);
        setNoRecordsFound(true);
      }
      setLoading(false);
    };
    if (selectedClass && selectedSection) {
      fetchStudents();
    } else {
      setStudents([]);
      setSelectedStudents([]);
      setNoRecordsFound(false);
    }
  }, [selectedClass, selectedSection]);

  const fetchClasses = async () => {
    try {
      const response = await getClasses()
      setClassList(response.data || []);
    } catch (error) {
      console.error("Failed to fetch classes", error);
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await getSections(classId)
      setSectionList(response.data || []);
    } catch (error) {
      console.error("Failed to fetch sections", error);
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedStudents(selectAll ? [] : students.map((student) => student._id));
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toBase64 = async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const generatePDFBuffer = async () => {
    const schoolResponse = await getSchools()
    const schoolData = schoolResponse.data || [];
    const schoolName = schoolData[0]?.school_name || "R.D.S. MEMORIAL PUBLIC SCHOOL";
    const schoolSub = schoolName.includes("(") ? `(${schoolName.split("(")[1]}` : "English Medium";
    const schoolPhone = schoolData[0]?.phone_no || "9876543210";
    const schoolCity = schoolData[0]?.city || "Lucknow";

    //  Convert principal signature to Base64
    const principalSignBase64 = await toBase64("/principal_sign.png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [90, 65],
    });

    for (let index = 0; index < selectedStudents.length; index++) {
      const studentId = selectedStudents[index];
      const student = students.find((s) => s._id === studentId);
      if (!student) continue;
      if (index !== 0) pdf.addPage();

      const marginX = 6;
      const cardWidth = 90 - marginX * 2;
      const centerX = marginX + cardWidth / 2;

      // Border
      pdf.setDrawColor(0);
      pdf.rect(marginX, marginX, cardWidth, 60 - marginX * 2);

      // Header
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text(schoolName.split("(")[0].trim(), centerX, 10, { align: "center" });

      pdf.setFontSize(7.5);
      pdf.text(schoolSub, centerX, 14, { align: "center" });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.5);
      pdf.text(`${schoolCity} | Phone: ${schoolPhone}`, centerX, 18, { align: "center" });

      // Header divider
      pdf.line(marginX + 2, 20, marginX + cardWidth - 2, 20);

      // Photo position
      const imgX = marginX + 4;
      const imgY = 23;
      const imgW = 22;
      const imgH = 28;

      try {
        if (student?.profile_Pic) {
          const imgBase64 = await toBase64(student.profile_Pic);
          pdf.addImage(imgBase64, "JPEG", imgX, imgY, imgW, imgH);
        } else {
          throw new Error("No Image");
        }
      } catch (error) {
        // Placeholder if image fails
        pdf.setDrawColor(150);
        pdf.setFillColor(235);
        pdf.roundedRect(imgX, imgY, imgW, imgH, 2, 2, "FD");
        pdf.setFontSize(6);
        pdf.setTextColor(120);
        pdf.text("Image", imgX + imgW / 2, imgY + 11, { align: "center" });
        pdf.text("Not Available", imgX + imgW / 2, imgY + 15, { align: "center" });
        pdf.setTextColor(0);
      }

      // Student Info
      const infoX = imgX + imgW + 4;
      let infoY = imgY + 2;
      const spacing = 6;

      const labelValue = (label, value) => {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(6.5);
        pdf.text(`${label}:`, infoX, infoY);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${value || "N/A"}`, infoX + 18, infoY);
        infoY += spacing;
      };

      labelValue("Name", `${student.first_name} ${student.last_name}`);
      labelValue("Father's", student.father_name);
      labelValue("Class", student.class_name?.class_name);
      labelValue("Section", student.section_name?.section_name);
      labelValue("Roll No", student.roll_no);

      // Footer line
      pdf.line(marginX + 2, 54, marginX + cardWidth - 2, 54);

      // Signature Image
      const signW = 14;
      const signH = 5;
      const signX = marginX + cardWidth - signW - 2;
      const signY = 54; // top of the image
      pdf.addImage(principalSignBase64, "PNG", signX, signY, signW, signH);

      // Signature Label (just below image)
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.5);
      pdf.text("Signature", signX + signW - 1, signY + signH + 4, { align: "right" });
    }

    return pdf.output("blob");
  };

  const handlePreviewPDF = async () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student.");
      return;
    }

    const pdfBlob = await generatePDFBuffer();
    const blobUrl = URL.createObjectURL(pdfBlob);
    setPreviewUrl(blobUrl);
    setShowPreviewModal(true);
  };

  const handleDownloadPDF = async () => {
    const pdfBlob = await generatePDFBuffer();
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "Student_ID_Cards.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowPreviewModal(false);
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Class", "Section", "Roll No", "Student Name", "Father Name", "Mobile No"]];
    const tableRows = students.map((row, index) => [
      index + 1,
      row.class_name?.class_name || "N/A",
      row.section_name?.section_name || "N/A",
      row.roll_no || "N/A",
      `${row.first_name} ${row.last_name}`,
      row.father_name || "N/A",
      row.phone_no || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Class", "Section", "Roll No", "Student Name", "Father Name", "Mobile No"];
    const rows = students.map((row, index) => [
      index + 1,
      row.class_name?.class_name || "N/A",
      row.section_name?.section_name || "N/A",
      row.roll_no || "N/A",
      `${row.first_name} ${row.last_name}`,
      row.father_name || "N/A",
      row.phone_no || "N/A",
    ]);
    copyContent(headers, rows);
  };

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "50px" },
    {
      name: "Select",
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedStudents.includes(row._id)}
          onChange={() => handleStudentSelect(row._id)}
        />
      ),
      width: "70px",
    },
    { name: "Class", selector: (row) => row.class_name?.class_name || "N/A" },
    { name: "Section", selector: (row) => row.section_name?.section_name || "N/A" },
    { name: "Roll No", selector: (row) => row.roll_no || "N/A" },
    { name: "Student Name", selector: (row) => `${row.first_name} ${row.last_name}` },
    { name: "Father Name", selector: (row) => row.father_name || "N/A" },
    { name: "Mobile No", selector: (row) => row.phone_no || "N/A" },
  ];

  const breadcrumbItems = [
    { label: "students", link: "/students/all-module" },
    { label: "id-card", link: "null" },
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
              <h2>Search Student Class Wise</h2>
            </div>
            <Form className="formSheet">
              <Row className="mb-3">
                <Col lg={6}>
                  <FormLabel className="labelForm">Select Class</FormLabel>
                  <FormSelect value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                    <option value="">Select Class</option>
                    {classList.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.class_name}
                      </option>
                    ))}
                  </FormSelect>
                </Col>
                <Col lg={6}>
                  <FormLabel className="labelForm">Select Section</FormLabel>
                  <FormSelect
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    disabled={!selectedClass}
                  >
                    <option value="">Select Section</option>
                    {sectionList.map((sec) => (
                      <option key={sec._id} value={sec._id}>
                        {sec.section_name}
                      </option>
                    ))}
                  </FormSelect>
                </Col>
              </Row>
            </Form>
          </div>

          {students.length > 0 && (
            <div className="mb-3 mt-3">
              <Button variant="primary" onClick={handleSelectAll} className="me-2">
                {selectAll ? "Deselect All" : "Select All"}
              </Button>
              <Button
                variant="success"
                onClick={handlePreviewPDF}
                disabled={selectedStudents.length === 0}
              >
                Preview & Download ID Cards ({selectedStudents.length})
              </Button>
            </div>
          )}

          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Students Details</h2>
                {loading ? (
                  <p>Loading...</p>
                ) : noRecordsFound ? (
                  <Alert variant="info">There is no record to display.</Alert>
                ) : (
                  <DataTable columns={columns} data={students} handlePrint={handlePrint} handleCopy={handleCopy} />
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* PDF Preview Modal */}
      <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>Preview ID Card</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "80vh" }}>
          {previewUrl && (
            <iframe ref={iframeRef} src={previewUrl} width="100%" height="100%" style={{ border: "none" }} />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-add" onClick={() => setShowPreviewModal(false)}>
            Close
          </Button>
          <Button className="btn-add" onClick={handleDownloadPDF}>
            Download PDF
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GenerateIdCard;
