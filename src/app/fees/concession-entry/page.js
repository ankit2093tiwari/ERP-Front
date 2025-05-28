"use client";
import React, { useEffect, useState } from 'react';
import styles from "@/app/students/add-new-student/page.module.css";
import Preview from '@/app/component/Preview';
import { Tab, Tabs, Container, Row, Col } from 'react-bootstrap';
import "react-datepicker/dist/react-datepicker.css";
import { Form, FormGroup, FormLabel, FormControl, Button } from 'react-bootstrap';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import axios from 'axios';
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";

const ConcessionEntry = () => {
  const [studentData, setStudentData] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tcRecords, setTcRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});

  const [formData, setFormData] = useState({
    registration_id: '',
    tc_no: '',
    student_name: '',
    class_section: '',
    class_section_inWords: '',
    father_name: '',
    mother_name: '',
    dob: '',
    dob_inWords: '',
    caste: '',
    nationality: 'Indian',
    whether_failed: 'No',
    school_name: '',
    subject_studies: ['', '', '', '', '', ''],
    class_promotion: 'false',
    class_promotion_inwords: '',
    whether_ncc_cadet: 'No',
    fee_concession: 0,
    general_conduct: 'Good',
    total_working_days: '',
    present_working_days: '',
    reason_for_leaving_school: '',
    date_of_application: new Date().toISOString().split('T')[0],
    date_of_issue: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "TC No.",
      selector: row => row.tc_no,
      sortable: true,
    },
    {
      name: "Date",
      selector: row => new Date(row.date_of_issue).toISOString().split('T')[0],
      sortable: true,
    },
    {
      name: "Student ID",
      selector: row => row.registration_id,
      sortable: true,
    },
    {
      name: "Student",
      selector: row => row.student_name,
      sortable: true,
    },
    {
      name: "Class#Section",
      selector: row => row.class_section,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <>
              <button className="editButton" onClick={() => handleUpdate(row._id)}>
                <FaSave />
              </button>
              <button className="editButton btn-danger" onClick={() => handleCancelEdit()}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button className="editButton" onClick={() => handleEdit(row)}>
                <FaEdit />
              </button>
              <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
                <FaTrashAlt />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Fetch TC records when component mounts
  useEffect(() => {
    const fetchTcRecords = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://erp-backend-fy3n.onrender.com/api/transfer-certificates');
        if (response.data.success) {
          setTcRecords(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching TC records:", error);
        setError("Failed to fetch TC records");
      } finally {
        setLoading(false);
      }
    };

    fetchTcRecords();
    fetchLastTcNumber();
  }, []);

  const fetchLastTcNumber = async () => {
    try {
      const response = await axios.get('https://erp-backend-fy3n.onrender.com/api/transfer-certificates/last-tc-number');
      const lastNumber = response.data.lastTcNumber || 0;
      const newTcNumber = `TC${String(lastNumber + 1).padStart(4, '0')}`;
      setFormData(prev => ({ ...prev, tc_no: newTcNumber }));
    } catch (error) {
      console.error("Error fetching last TC number:", error);
      setFormData(prev => ({ ...prev, tc_no: `TC${Date.now()}` }));
    }
  };

  const handleEdit = (record) => {
    setEditingId(record._id);
    setEditedData({
      tc_no: record.tc_no,
      student_name: record.student_name,
      class_section: record.class_section,
      date_of_issue: record.date_of_issue,
      reason_for_leaving_school: record.reason_for_leaving_school,
      remarks: record.remarks
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedData({});
  };

  const handleUpdate = async (id) => {
    try {
      const response = await axios.put(
        `https://erp-backend-fy3n.onrender.com/api/update-transfer-certificates/${id}`,
        editedData
      );

      if (response.data.success) {
        // Update the local state with the edited data
        setTcRecords(prevRecords =>
          prevRecords.map(record =>
            record._id === id ? { ...record, ...editedData } : record
          )
        );
        setEditingId(null);
        setEditedData({});
        alert("Transfer Certificate updated successfully!");
      }
    } catch (error) {
      console.error("Error updating TC:", error);
      alert("Failed to update Transfer Certificate");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this Transfer Certificate?")) {
      try {
        const response = await axios.delete(
          `https://erp-backend-fy3n.onrender.com/api/delete-transfer-certificates/${id}`
        );

        if (response.data.success) {
          // Remove the deleted record from local state
          setTcRecords(prevRecords =>
            prevRecords.filter(record => record._id !== id)
          );
          alert("Transfer Certificate deleted successfully!");
        }
      } catch (error) {
        console.error("Error deleting TC:", error);
        alert("Failed to delete Transfer Certificate");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editingId) {
      // If in edit mode, update the editedData
      setEditedData(prev => ({ ...prev, [name]: value }));
    } else if (name.startsWith("subject_studies_")) {
      const index = parseInt(name.split("_")[2], 10);
      const newSubjects = [...formData.subject_studies];
      newSubjects[index] = value;
      setFormData(prev => ({ ...prev, subject_studies: newSubjects }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (name === "registration_id") {
        setStudentId(value);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = 'https://erp-backend-fy3n.onrender.com/api/transfer-certificates';
      const response = await axios.post(url, formData);

      if (response.data.success) {
        alert("Transfer Certificate generated successfully!");

        // Refresh TC records
        const recordsResponse = await axios.get('https://erp-backend-fy3n.onrender.com/api/transfer-certificates');
        setTcRecords(recordsResponse.data.data);

        // Reset form with new TC number
        const newNumber = parseInt(formData.tc_no.replace(/^TC0*/, '')) + 1;
        const newTcNumber = `TC${String(newNumber).padStart(4, '0')}`;

        setFormData({
          registration_id: '',
          tc_no: newTcNumber,
          student_name: '',
          class_section: '',
          class_section_inWords: '',
          father_name: '',
          mother_name: '',
          dob: '',
          dob_inWords: '',
          caste: '',
          nationality: 'Indian',
          whether_failed: 'No',
          school_name: '',
          subject_studies: ['', '', '', '', '', ''],
          class_promotion: 'false',
          class_promotion_inwords: '',
          whether_ncc_cadet: 'No',
          fee_concession: 0,
          general_conduct: 'Good',
          total_working_days: '',
          present_working_days: '',
          reason_for_leaving_school: '',
          date_of_application: new Date().toISOString().split('T')[0],
          date_of_issue: new Date().toISOString().split('T')[0],
          remarks: ''
        });

        setStudentData(null);
        setStudentId("");
      } else {
        alert(response.data.message || "Failed to generate Transfer Certificate");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error.response?.data?.message || "An error occurred while submitting the form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePreview = () => {
    setShowPreview((prev) => !prev);
  };

  useEffect(() => {
    if (!studentId) return;

    const fetchStudentInfo = async () => {
      try {
        const url = `https://erp-backend-fy3n.onrender.com/api/students/search?registration_id=${studentId}`;
        const response = await axios.get(url);

        if (response?.data.success) {
          setStudentData(response?.data?.data[0]);
        }
      } catch (error) {
        console.error("Error fetching student info:", error);
      }
    };

    fetchStudentInfo();
  }, [studentId]);

  useEffect(() => {
    if (!studentData) return;

    setFormData(prev => ({
      ...prev,
      student_name: studentData.first_name,
      father_name: studentData?.father_name,
      mother_name: studentData?.mother_name,
      dob: studentData.date_of_birth?.split('T')[0] || '',
      date_of_admission: studentData.date_of_admission?.split('T')[0] || '',
      nationality: studentData?.nationality || 'Indian',
      caste: studentData?.caste_name?.caste_name || "",
      class_section: `${studentData?.class_name?.class_name} - ${studentData.section_name?.section_name || ''}`,
      class_section_inWords: `${studentData?.class_name?.class_name} ${studentData.section_name?.section_name || ''}`,
      class_promotion: studentData.promoted
    }));
  }, [studentData]);

  const filteredTcRecords = tcRecords.filter(record =>
    record.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.registration_id?.toString().includes(searchTerm)
  );

  const breadcrumbItems = [
    { label: "fees", link: "/fees/all-module" },
    { label: "Concession Entry", link: "null" }
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
              <Tabs defaultActiveKey="Generate Transfer Certificate" id="controlled-tab" className="mb-3 TabButton">
                <Tab eventKey="Generate Transfer Certificate" title="Concession Entry" className="cover-sheet p-4">
                  {!showPreview ? (
                    <Form className={styles.form} onSubmit={handleSubmit}>
                      <Row className="mb-4">
                        <FormGroup as={Col} md="4" controlId="registration_id">
                          <FormLabel>Type Registration ID For Search Student</FormLabel>
                          <FormControl
                            name="registration_id"
                            type="text"
                            value={formData.registration_id}
                            onChange={handleChange}
                            required
                          />
                        </FormGroup>
                      </Row>

                      <Row className="mb-3">
                        <FormGroup as={Col} md="3" controlId="class_section">
                          <FormLabel>Class &amp; Section (in figures)</FormLabel>
                          <FormControl
                            name="class_section"
                            value={formData.class_section}
                            onChange={handleChange}
                            readOnly
                            type="text"
                          />
                        </FormGroup>
                      </Row>

                      <Row>
                        <Col>
                          <div className="buttons1">
                            <Button type="submit" id="submit">Submit</Button>
                          </div>
                        </Col>
                      </Row>
                    </Form>
                  ) : (
                    <Preview formData={formData} togglePreview={togglePreview} />
                  )}
                </Tab>
              </Tabs>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default ConcessionEntry;