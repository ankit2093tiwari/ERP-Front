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
import { deleteTransferCertificateById, generateTransferCertificate, getAllTCRecords, getLastTCNumber, getStudentByRegistrationId, updateTransferCertificateById } from '@/Services';
import { toast } from 'react-toastify';
import useSessionId from '@/hooks/useSessionId';
import usePagePermission from '@/hooks/usePagePermission';

const TransferCertificate = () => {
  const selectedSessionId = useSessionId();
  const { hasSubmitAccess, hasEditAccess } = usePagePermission()

  const [studentData, setStudentData] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tcRecords, setTcRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [errors, setErrors] = useState({});
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
    school_name: 'R.D.S. MEMORIAL PUBLIC SCHOOL (English Medium)',
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

  const requiredFields = [
    'registration_id', 'tc_no', 'date_of_issue', 'date_of_admission',
    'student_name', 'class_section', 'caste', 'father_name', 'mother_name',
    'dob', 'dob_inWords', 'school_name', 'subject_studies_0', 'date_of_application',
    'general_conduct', 'total_working_days', 'reason_for_leaving_school'
  ];

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
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <>
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </>
      ),
    },
  ];
  const fetchTcRecords = async () => {
    setLoading(true);
    try {
      const response = await getAllTCRecords()
      if (response.success) {
        setTcRecords(response.data);
      }
    } catch (error) {
      console.error("Error fetching TC records:", error);
      setError("Failed to fetch TC records");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTcRecords();
    fetchLastTcNumber();
  }, [selectedSessionId]);

  const fetchLastTcNumber = async () => {
    try {
      const response = await getLastTCNumber()
      const lastNumber = response.lastTcNumber || 0;
      const newTcNumber = `TC${String(lastNumber + 1).padStart(4, '0')}`;
      setFormData(prev => ({ ...prev, tc_no: newTcNumber }));
    } catch (error) {
      console.error("Error fetching last TC number:", error);
      setFormData(prev => ({ ...prev, tc_no: `TC${Date.now()}` }));
    }
  };

  const validateField = (name, value) => {
    let error = '';

    if (requiredFields.includes(name) && !value) {
      error = 'This field is required';
    }

    if (name === 'total_working_days' || name === 'present_working_days') {
      if (value && isNaN(value)) {
        error = 'Must be a number';
      }
      if (name === 'present_working_days' && formData.total_working_days &&
        parseInt(value) > parseInt(formData.total_working_days)) {
        error = 'Cannot exceed total working days';
      }
    }

    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    requiredFields.forEach(field => {
      const value = field.startsWith('subject_studies_') ?
        formData.subject_studies[parseInt(field.split('_')[2])] :
        formData[field];

      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    formData.subject_studies.forEach((subject, index) => {
      if (index === 0 && !subject) {
        newErrors[`subject_studies_${index}`] = 'At least one subject is required';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name.startsWith("subject_studies_")) {
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
    setAlreadyExists(false);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await generateTransferCertificate(formData)
      if (response.success) {
        if (response.alreadyExists) {
          setAlreadyExists(true);
          toast.warn("Transfer Certificate already exists for this student.");
          return;
        }
        toast.success("Transfer Certificate generated successfully!");
        fetchTcRecords()
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
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred while submitting the form");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormControl = (name, label, type = 'text', options = {}) => {
    const isRequired = requiredFields.includes(name);
    const value = name.startsWith('subject_studies_') ?
      formData.subject_studies[parseInt(name.split('_')[2])] :
      formData[name] || '';
    const error = errors[name];

    return (
      <FormGroup as={Col} md={options.md || '3'} controlId={name}>
        <FormLabel>
          {label} {isRequired && <span className="text-danger">*</span>}
        </FormLabel>
        <FormControl
          name={name}
          value={value}
          onChange={handleChange}
          type={type}
          isInvalid={!!error}
          {...options}
        />
        {error && (
          <FormControl.Feedback type="invalid">
            {error}
          </FormControl.Feedback>
        )}
      </FormGroup>
    );
  };

  const togglePreview = () => {
    setShowPreview((prev) => !prev);
  };

  useEffect(() => {
    if (!studentId) return;

    const fetchStudentInfo = async () => {
      try {
        const response = await getStudentByRegistrationId(studentId)

        if (response?.success) {
          setStudentData(response?.data[0]);
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
    { label: "students", link: "/students/all-module" },
    { label: "Transfer Certificate", link: "null" }
  ];

  const handlePrint = () => {
    const tableHeaders = [["#", "TC No.", "Date", "Student ID", "Student", "Class#Section"]];
    const tableRows = filteredTcRecords.map((row, index) => [
      index + 1,
      row.tc_no,
      new Date(row.date_of_issue).toISOString().split('T')[0],
      row.registration_id,
      row.student_name,
      row.class_section
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "TC No.", "Date", "Student ID", "Student", "Class#Section"];
    const rows = filteredTcRecords.map((row, index) =>
      `${index + 1}\t${row.tc_no}\t${new Date(row.date_of_issue).toISOString().split('T')[0]}\t${row.registration_id}\t${row.student_name}\t${row.class_section}`
    );
    copyContent(headers, rows);
  };
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this Transfer Certificate?")) {
      try {
        const response = await deleteTransferCertificateById(id)
        if (response.success) {
          fetchTcRecords()
          toast.success("Transfer Certificate deleted successfully!");
        }
      } catch (error) {
        console.error("Error deleting TC:", error);
        toast.error("Failed to delete Transfer Certificate");
      }
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
          <Row>
            <Col>
              <Tabs defaultActiveKey="Generate Transfer Certificate" id="controlled-tab" className="mb-3 TabButton">
                <Tab eventKey="Generate Transfer Certificate" title="Generate Transfer Certificate" className="cover-sheet p-4">
                  {!showPreview ? (
                    <Form className={styles.form} onSubmit={handleSubmit}>
                      {alreadyExists && (
                        <div className="alert alert-warning">
                          A Transfer Certificate already exists for this student.
                        </div>
                      )}

                      <Row className="mb-4">
                        {renderFormControl('registration_id', 'Type Registration ID For Search Student', 'text', { md: '4' })}
                      </Row>

                      <Row className="mb-3">
                        {renderFormControl('tc_no', 'TC No', 'text', { disabled: true })}
                        {renderFormControl('date_of_issue', 'Date of Issue', 'date')}
                        {renderFormControl('date_of_admission', 'Date of Admission', 'date')}
                        {renderFormControl('date_of_admission_inwords', 'Date of Admission (In Words)')}
                      </Row>

                      <Row className="mb-3">
                        {renderFormControl('student_name', 'Student Name', 'text', { readOnly: true })}
                        {renderFormControl('class_section', 'Class & Section (in figures)', 'text', { readOnly: true })}
                        {renderFormControl('class_section_inwords', 'Class & Section (in words)')}
                        {renderFormControl('caste', 'Caste')}
                      </Row>

                      <Row className="mb-3">
                        {renderFormControl('father_name', 'Father\'s/Guardian\'s Name', 'text', { readOnly: true })}
                        {renderFormControl('mother_name', 'Mother\'s Name', 'text')}
                        {renderFormControl('dob', 'Date of Birth (In Figure)', 'date')}
                        {renderFormControl('dob_inWords', 'Date of Birth (In Words)')}
                      </Row>

                      <Row className="mb-3">
                        {renderFormControl('school_name', 'School Name')}
                        {renderFormControl('nationality', 'Nationality', 'text', { readOnly: true })}
                        {renderFormControl('whether_failed', 'Whether Failed (Once / Twice)')}
                        {renderFormControl('subject_studies_0', 'Subject Studies 1')}
                      </Row>

                      <Row className="mb-3">
                        {renderFormControl('subject_studies_1', 'Subject Studies 2')}
                        {renderFormControl('subject_studies_2', 'Subject Studies 3')}
                        {renderFormControl('subject_studies_3', 'Subject Studies 4')}
                        {renderFormControl('subject_studies_4', 'Subject Studies 5')}
                      </Row>

                      <Row className="mb-3">
                        {renderFormControl('subject_studies_5', 'Subject Studies 6')}
                        <Col md="3"></Col>
                        <Col md="3"></Col>
                      </Row>

                      <Row className="mb-3">
                        {renderFormControl('class_promotion', 'Promotion to the higher class (in figures)')}
                        {renderFormControl('class_promotion_inwords', 'Promotion to the higher class (in words)')}
                        {renderFormControl('whether_ncc_cadet', 'Whether NCC Cadet / Boy Scout / Girl Guide')}
                        {renderFormControl('date_of_application', 'Date of application for certificate', 'date')}
                      </Row>

                      <Row className="mb-3">
                        {renderFormControl('fee_concession', 'Any fee concession availed', 'number')}
                        {renderFormControl('general_conduct', 'General Conduct')}
                        {renderFormControl('total_working_days', 'Total Working Days', 'number')}
                        {renderFormControl('present_working_days', 'Days Present', 'number')}
                      </Row>

                      <Row className="mb-3">
                        <FormGroup as={Col} md="6" controlId="reason_for_leaving_school">
                          <FormLabel>
                            Reason for Leaving School <span className="text-danger">*</span>
                          </FormLabel>
                          <FormControl
                            name="reason_for_leaving_school"
                            value={formData.reason_for_leaving_school}
                            onChange={handleChange}
                            isInvalid={!!errors.reason_for_leaving_school}
                            as="textarea"
                            rows={3}
                          />
                          {errors.reason_for_leaving_school && (
                            <FormControl.Feedback type="invalid">
                              {errors.reason_for_leaving_school}
                            </FormControl.Feedback>
                          )}
                        </FormGroup>
                        <FormGroup as={Col} md="6" controlId="remarks">
                          <FormLabel>Remarks</FormLabel>
                          <FormControl
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            as="textarea"
                            rows={3}
                          />
                        </FormGroup>
                      </Row>

                      <Row>
                        <Col>
                          <div className="buttons1">
                            {hasEditAccess && (
                              <Button type="submit" id="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit form'}
                              </Button>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </Form>
                  ) : (
                    <Preview formData={formData} togglePreview={togglePreview} />
                  )}
                </Tab>

                <Tab eventKey="TC Records" title="TC Records">
                  <div className="tableSheet">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h2>Transfer Certificate Records</h2>
                    </div>

                    {loading ? (
                      <p>Loading...</p>
                    ) : error ? (
                      <p style={{ color: "red" }}>{error}</p>
                    ) : (
                      <Table
                        columns={columns}
                        data={filteredTcRecords}
                        handleCopy={handleCopy}
                        handlePrint={handlePrint}
                      />
                    )}
                  </div>
                </Tab>
              </Tabs>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default TransferCertificate;