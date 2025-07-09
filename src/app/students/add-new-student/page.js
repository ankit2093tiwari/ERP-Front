"use client";

import React, { useState, useEffect } from "react";
import styles from "@/app/students/add-new-student/page.module.css";
import { Tab, Tabs, Container, Row, Col, FormSelect } from 'react-bootstrap';
import "react-datepicker/dist/react-datepicker.css";
import dynamic from 'next/dynamic';
import { Form, FormGroup, FormLabel, FormControl, Button, Breadcrumb } from 'react-bootstrap';
import { FormCheck } from 'react-bootstrap';
import { capitalizeFirstLetter, motherTongueOptions } from "@/app/utils";
import { toast } from 'react-toastify';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { getCastes, getSections, getCategories, getClasses, getReligions, getStates, addNewStudent } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";
const AddNewStudentPage = () => {
  const [error, setError] = useState("");
  const { hasViewAccess, hasSubmitAccess } = usePagePermission();


  const initialStudentState = {
    first_name: "",
    middle_name: "",
    last_name: "",
    profile_Pic: "",
    father_name: "",
    mother_name: "",
    father_mobile_no: "",
    phone_no: "",
    date_of_birth: "",
    gender_name: "",
    class_name: "",
    section_name: "",
    religion_name: "",
    category: "",
    mother_tongue: "",
    nationality_name: "Indian",
    enrollment_no: "",
    aadhar_card_no: "",
    fee_book_no: "",
    caste_name: "",
    house: "",
    date_of_admission: "",
    date_of_joining: "",
    scholar_No: "",
    last_School_Name: "",
    sr_No: "",
    board_Registration_Number: "",
    tc_submitted: "No",
    bank_Account_No: "",
    account_Name: "",
    bank_Name: "",
    ifsc_Code: "",
    residence_address: "",
    copy_address: "",
    country_name: "",
    state_name: "",
    city_Or_District: "",
    pin_No: "",
    birth_certificate: "",
    character_certificate: "",
    caste_certificate: "",
    migration_certificate: "",
    marksheet: "",
    previous_result: "",
    transfer_certificate: ""
  };

  const [student, setStudent] = useState(initialStudentState);
  // ... (keep all other state declarations)
  const [studentError, setStudentError] = useState({});
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [religionList, setReligionList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [casteList, setCasteList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [copyChecked, setCopyChecked] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchReligion();
    fetchCategory();
    fetchCaste();
    fetchState();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await getClasses()
      setClassList(response?.data || []);
    } catch (err) {
      setError("Failed to fetch classes.");
    }
  };

  const fetchReligion = async () => {
    try {
      const response = await getReligions()

      setReligionList(response?.data || []);
    } catch (err) {
      setError("Failed to fetch religions.");
    }
  };

  const fetchCategory = async () => {
    try {
      const response = await getCategories()
      setCategoryList(response?.data || []);
    } catch (err) {
      setError("Failed to fetch Categories.");
    }
  };

  const fetchCaste = async () => {
    try {
      const response = await getCastes()
      setCasteList(response?.data || []);
    } catch (err) {
      setError("Failed to fetch Caste.", err);
    }
  };

  const fetchState = async () => {
    try {
      const response = await getStates()
      setStateList(response?.data || []);
    } catch (err) {
      setError("Failed to fetch States.", err);
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await getSections(classId)
      if (response?.success) {
        setSectionList(response?.data);
      } else {
        setSectionList([]);
      }
    } catch (err) {
      setError("Failed to fetch sections.", err);
    }
  };

  const validatePhoneNumber = (phone) => {
    return /^[0-9]{10}$/.test(phone);
  };

  const validateAadharNumber = (aadhar) => {
    return /^[0-9]{12}$/.test(aadhar);
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Required fields validation
    const requiredFields = [
      'first_name', 'father_name', 'father_mobile_no', 'class_name', 'phone_no',
      'section_name', 'date_of_birth', 'gender_name', 'aadhar_card_no',
      'date_of_admission', 'date_of_joining', 'caste_name', 'religion_name'
    ];

    requiredFields.forEach(field => {
      if (!student[field]) {
        const formattedKey = field.replace(/_/g, ' ').split(' ').map(capitalizeFirstLetter).join(' ');
        errors[`${field}_error`] = `${formattedKey} is required`;
        isValid = false;
      }
    });

    if (student.pin_No && !/^\d{6}$/.test(student.pin_No)) {
      errors.pin_No_error = "PIN must be exactly 6 digits";
      isValid = false;
    }


    // Phone number validation
    if (student.father_mobile_no && !validatePhoneNumber(student.father_mobile_no)) {
      errors.father_mobile_no_error = "Father's mobile must be 10 digits";
      isValid = false;
    }

    if (student.phone_no && !validatePhoneNumber(student.phone_no)) {
      errors.phone_no_error = "Phone number must be 10 digits";
      isValid = false;
    }

    // Aadhar validation
    if (student.aadhar_card_no && !validateAadharNumber(student.aadhar_card_no)) {
      errors.aadhar_card_no_error = "Aadhar must be 12 digits";
      isValid = false;
    }

    setStudentError(errors);
    return isValid;
  };

  const handleClassChange = (e) => {
    const { name, value } = e.target;
    setStudent(prev => ({ ...prev, [name]: value }));
    setStudentError(prev => ({ ...prev, [`${name}_error`]: "" }));
    fetchSections(value);
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setStudent(prev => ({ ...prev, [name]: value }));
    setStudentError(prev => ({ ...prev, [`${name}_error`]: "" }));
  };
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    // Handle file input
    if (type === "file") {
      if (files && files.length > 0) {
        setStudent(prev => ({ ...prev, [name]: files[0] }));
        setStudentError(prev => ({ ...prev, [`${name}_error`]: "" }));
      }
      return;
    }

    // Rest of your existing handleChange logic
    if (name === 'father_mobile_no' || name === 'phone_no') {
      if (value && !/^[0-9]*$/.test(value)) return;
      if (value.length > 10) return;
    }

    if (name === 'aadhar_card_no') {
      if (value && !/^[0-9]*$/.test(value)) return;
      if (value.length > 12) return;
    }

    setStudent(prev => ({ ...prev, [name]: value }));
    setStudentError(prev => ({ ...prev, [`${name}_error`]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const formData = new FormData();

      const objectIdFields = ["state_name", "class_name", "section_name", "religion_name", "category"];

      Object.entries(student).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value ?? "");
        }
      });

      const response = await addNewStudent(formData);

      if (response?.success) {
        toast.success(response?.message || "Student Created Successfully");
        setStudent(initialStudentState);
      } else {
        throw new Error(response.message || "Creation failed");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to submit data";
      console.error("Error submitting student data:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const breadcrumbItems = [{ label: "students", link: "/students/all-module" }, { label: "add-new-student", link: "null" }]

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
              <Tabs defaultActiveKey="Basic Details" id="controlled-tab" className="mb-3 TabButton">
                <Tab eventKey="Basic Details" title="Basic Details" className='cover-sheet'>
                  <div className="studentHeading"><h2> Basic Details  </h2> </div>
                  <div className="formSheet">
                    <Form className={styles.form} onSubmit={handleSubmit}>
                      <Row >
                        <FormGroup as={Col} md="3" controlId="validationCustom01">
                          <FormLabel className="labelForm">Student name</FormLabel>
                          <FormControl
                            type="text"
                            name="first_name"
                            value={student?.first_name}
                            onChange={handleChange}
                            placeholder="Student name"
                          />
                          <p className="error"> {studentError.first_name_error}</p>
                        </FormGroup>
                        <FormGroup as={Col} md="3" controlId="validationCustom02">
                          <FormLabel className="labelForm">Middle name</FormLabel>
                          <FormControl
                            type="text"
                            name="middle_name"
                            value={student?.middle_name}
                            onChange={handleChange}
                            placeholder="Middle name"
                          />

                        </FormGroup>
                        <FormGroup as={Col} md="3" controlId="validationCustom03">
                          <FormLabel className="labelForm">Last name</FormLabel>
                          <FormControl
                            type="text"
                            name="last_name"
                            value={student?.last_name}
                            onChange={handleChange}
                            placeholder="Last name"
                          />

                        </FormGroup>
                        {/* <FormGroup as={Col} md="3" className="position-relative ">
                          <FormLabel className="labelForm">Profile Pic</FormLabel>
                          <FormControl
                            type="file"
                            name="profile_Pic"
                            onChange={handleChange}
                          />
                        </FormGroup> */}
                        <FormGroup as={Col} md="3" className="position-relative">
                          <FormLabel className="labelForm">Profile Pic</FormLabel>
                          <FormControl
                            type="file"
                            name="profile_Pic"
                            onChange={handleChange}
                            accept="image/*"
                          />
                          {student.profile_Pic && (
                            <div className="mt-2">
                              <small>Selected: {student.profile_Pic.name}</small>
                            </div>
                          )}
                        </FormGroup>
                      </Row>
                      <Row >
                        <FormGroup as={Col} md="3" controlId="validationCustom04">
                          <FormLabel className="labelForm" >Father Name</FormLabel>
                          <FormControl
                            value={student?.father_name}
                            onChange={handleChange}
                            type="text"
                            name="father_name"
                            placeholder="Father Name"
                          />
                          <p className="error"> {studentError?.father_name_error}</p>
                        </FormGroup>
                        <FormGroup as={Col} md="3" controlId="validationCustom05">
                          <FormLabel className="labelForm">Mother Name</FormLabel>
                          <FormControl
                            value={student?.mother_name}
                            onChange={handleChange}
                            type="text"
                            name="mother_name"
                            placeholder="Mother Name"
                          />
                        </FormGroup>
                        <FormGroup as={Col} md="3" controlId="validationCustom06">
                          <FormLabel className="labelForm" >Father MobileNo</FormLabel>
                          <FormControl
                            value={student?.father_mobile_no}
                            onChange={handleChange}
                            type="text"
                            name="father_mobile_no"
                            placeholder="father Mobile No."
                          />
                          <p className="error"> {studentError.father_mobile_no_error}</p>
                        </FormGroup>
                        <FormGroup as={Col} md="3" controlId="validationCustom07">
                          <FormLabel className="labelForm" >Phone Number</FormLabel>
                          <FormControl
                            value={student?.phone_no}
                            onChange={handleChange}
                            type="text"
                            name="phone_no"
                            placeholder="phone No."
                          />
                          <p className="error"> {studentError.phone_no_error}</p>
                        </FormGroup>
                      </Row>
                      <Row >
                        <FormGroup as={Col} md="3" controlId="validationCustom08">
                          <FormLabel className="labelForm">Select Class</FormLabel>
                          <FormSelect
                            value={student?.class_name}
                            onChange={handleClassChange}
                            name="class_name"
                          >
                            <option value="">Select Class</option>
                            {classList?.length && classList?.map((classItem) => (
                              <option key={classItem?._id} value={classItem?._id}>
                                {classItem?.class_name}
                              </option>
                            ))}
                          </FormSelect>
                          <p className="error">{studentError.class_name_error}</p>
                        </FormGroup>
                        <FormGroup as={Col} md="3" controlId="validationCustom09">
                          <FormLabel className="labelForm">Select Section</FormLabel>
                          <FormSelect
                            value={student.section_name}
                            onChange={(e) => {
                              const selectedValue = e.target.value;
                              setStudent((prev) => ({
                                ...prev,
                                section_name: selectedValue,
                              }));
                              setStudentError((prev) => ({
                                ...prev,
                                section_name_error: "",
                              }));
                            }}

                          >
                            <option value="">Select Section</option>
                            {sectionList?.length > 0 && sectionList?.map((sectionItem) => (
                              <option key={sectionItem?._id} value={sectionItem?._id}>
                                {sectionItem?.section_name} ({sectionItem?.section_code})
                              </option>
                            ))}
                          </FormSelect>
                          <p className="error">{studentError?.section_name_error}</p>
                        </FormGroup>
                        <FormGroup as={Col} md="3" controlId="validationCustom10">
                          <FormLabel className="labelForm">Date Of Birth</FormLabel>
                          <FormControl
                            value={student?.date_of_birth}
                            onChange={handleChange}
                            type="date"
                            name="date_of_birth"
                            placeholder="Date of Birth"
                            max={new Date().toISOString().split("T")[0]} // This ensures only past dates
                          />
                          <p className="error"> {studentError.date_of_birth_error}</p>
                        </FormGroup>

                        <FormGroup as={Col} md="3" controlId="validationCustom11">
                          <FormLabel className="labelForm">Gender</FormLabel><br />
                          <FormCheck inline>
                            <FormCheck.Input
                              type="radio"
                              name="gender_name"
                              value="Male"
                              checked={student.gender_name === "Male"}
                              onChange={handleRadioChange}
                              id="male"
                            />
                            <FormCheck.Label htmlFor="male">Male</FormCheck.Label>
                          </FormCheck>
                          <FormCheck inline>
                            <FormCheck.Input
                              type="radio"
                              name="gender_name"
                              value="Female"
                              checked={student.gender_name === "Female"}
                              onChange={handleRadioChange}
                              id="female"
                            />
                            <FormCheck.Label htmlFor="female">Female</FormCheck.Label>
                          </FormCheck>

                          <p className="error"> {studentError.gender_name_error}</p>
                        </FormGroup>
                      </Row>
                      <Row >
                        <FormGroup as={Col} md="3" controlId="validationCustom08">
                          <FormLabel className="labelForm">Select Religion</FormLabel>
                          <FormSelect
                            value={student?.religion_name}
                            onChange={handleChange}
                            name="religion_name"
                          >
                            <option value="">Select Religion</option>
                            {religionList?.length > 0 && religionList?.map((religionItem) => (
                              <option key={religionItem?._id} value={religionItem?._id}>
                                {religionItem?.religion_name}
                              </option>
                            ))}
                          </FormSelect>
                          <p className="error">{studentError.religion_name_error}</p>
                        </FormGroup>
                        <FormGroup as={Col} md="3" controlId="validationCustom08">
                          <FormLabel className="labelForm">Select Category</FormLabel>
                          <FormSelect
                            value={student?.category_name}
                            onChange={handleChange}
                            name="category_name"
                          >
                            <option value="">Select Category</option>
                            {categoryList?.length > 0 && categoryList?.map((categoryItem) => (
                              <option key={categoryItem?._id} value={categoryItem?._id}>
                                {categoryItem?.category_name}
                              </option>
                            ))}
                          </FormSelect>
                          <p className="error">{studentError.category_name_error}</p>
                        </FormGroup>

                        <FormGroup as={Col} md="3" controlId="validationCustom14">
                          <FormLabel className="labelForm">Mother Tongue</FormLabel>
                          <FormSelect>
                            <option>Select</option>

                            {motherTongueOptions()?.map(item =>

                              <option key={item?.label} value={item?.value}>{item?.label}</option>
                            )}
                          </FormSelect>
                        </FormGroup>
                        <FormGroup as={Col} md="3" controlId="validationCustom15">
                          <FormLabel className="labelForm">Nationality</FormLabel>
                          <FormSelect>
                            <option>Indian</option>
                            <option value="1">Australian</option>
                            <option value="2">Canadian</option>
                            <option value="3">Indian</option>
                            <option value="4">Korean</option>
                            <option value="5">Afghan</option>
                            <option value="6">Chinese</option>
                            <option value="7">Japanese</option>
                            <option value="8">Mexican</option>
                          </FormSelect>
                        </FormGroup>
                      </Row>
                      <Row >
                        <FormGroup as={Col} md="3" controlId="validationCustom16">
                          <FormLabel className="labelForm">Enrollment No</FormLabel>
                          <FormControl
                            value={student?.enrollment_no}
                            onChange={handleChange}
                            type="text"
                            name="enrollment_no"
                            placeholder="Enrollment Number"
                          />
                        </FormGroup>
                        <FormGroup as={Col} md="3" controlId="validationCustom17">
                          <FormLabel className="labelForm">Aadhar Card No</FormLabel>
                          <FormControl
                            value={student?.aadhar_card_no}
                            onChange={handleChange}
                            type="text"
                            name="aadhar_card_no"
                            placeholder="Aadhar Card NO."
                          />
                          <p className="error"> {studentError.aadhar_card_no_error}</p>
                        </FormGroup>
                        <FormGroup as={Col} md="3" controlId="validationCustom18">
                          <FormLabel className="labelForm">Fee Book No</FormLabel>
                          <FormControl
                            value={student?.fee_book_no}
                            onChange={handleChange}
                            type="text"
                            name="fee_book_no"
                            placeholder="Fee Book No."
                          />
                        </FormGroup>
                        <FormGroup as={Col} md="3" controlId="validationCustom08">
                          <FormLabel className="labelForm">Select Caste</FormLabel>
                          <FormSelect
                            value={student?.caste_name}
                            onChange={handleChange}
                            name="caste_name"
                          >
                            <option value="">Select Caste</option>
                            {casteList?.length > 0 && casteList?.map((casteItem) => (
                              <option key={casteItem?._id} value={casteItem?._id}>
                                {casteItem?.caste_name}
                              </option>
                            ))}
                          </FormSelect>
                          <p className="error">{studentError.caste_name_error}</p>
                        </FormGroup>
                      </Row>
                      <Row >
                        <FormGroup as={Col} md="3" controlId="validationCustom20">
                          <FormLabel className="labelForm">House</FormLabel>
                          <FormSelect>
                            <option>Select</option>
                            <option value="1">Red</option>
                            <option value="2">Blue</option>
                            <option value="3">White</option>
                            <option value="4">Green</option>
                          </FormSelect>
                        </FormGroup>
                        <FormGroup as={Col} md="3" controlId="validationCustom21">
                          <FormLabel className="labelForm">Date Of Admission</FormLabel>
                          <FormControl
                            value={student?.date_of_admission}
                            onChange={handleChange}
                            type="date"
                            name="date_of_admission"
                            placeholder="Date of Admission"
                          />
                          <p className="error"> {studentError.date_of_admission_error}</p>
                        </FormGroup>
                        <FormGroup as={Col} md="3" controlId="validationCustom22">
                          <FormLabel className="labelForm">Date Of joining</FormLabel>
                          <FormControl
                            value={student?.date_of_joining}
                            onChange={handleChange}
                            type="date"
                            name="date_of_joining"
                            placeholder="Date of Joining"
                          />
                          <p className="error" > {studentError.date_of_joining_error}</p>
                        </FormGroup>
                        <FormGroup as={Col} md="3" controlId="validationCustom23">
                          <FormLabel className="labelForm">Board Registration Number</FormLabel>
                          <FormControl
                            value={student?.board_Registration_Number}
                            onChange={handleChange}
                            type="text"
                            name="board_Registration_Number"
                            placeholder="Borad Registration Number"
                          />
                        </FormGroup>
                      </Row>
                      <Row className='mb-5'>
                        <FormGroup as={Col} md="3" controlId="validationCustom24">
                          <FormLabel className="labelForm">Scholar No</FormLabel>
                          <FormControl
                            value={student?.scholar_No}
                            onChange={handleChange}
                            type="text"
                            name="scholar_No"
                            placeholder="Scholar No."
                          />

                        </FormGroup>
                        <FormGroup as={Col} md="3" controlId="validationCustom25">
                          <FormLabel className="labelForm">Name of School Last Attended</FormLabel>
                          <FormControl
                            value={student?.last_School_Name}
                            onChange={handleChange}
                            type="text"
                            name="last_School_Name"
                            placeholder="Name of School Last Attended"
                          />

                        </FormGroup>
                        <FormGroup as={Col} md="3" controlId="validationCustom26">
                          <FormLabel className="labelForm">SR. No</FormLabel>
                          <FormControl
                            value={student?.sr_No}
                            onChange={handleChange}
                            type="text"
                            name="sr_No"
                            placeholder="Sr No"
                          />
                        </FormGroup>
                        <FormGroup as={Col} md="3" controlId="validationCustom27">
                          <FormLabel className="labelForm">TC Submitted</FormLabel><br />
                          <FormCheck
                            type="radio"
                            name="tc_submitted"
                            value="Yes"
                            label="Yes"
                            checked={student.tc_submitted === "Yes"}
                            onChange={handleRadioChange}
                            inline
                          />
                          <FormCheck
                            type="radio"
                            name="tc_submitted"
                            value="No"
                            label="No"
                            checked={student.tc_submitted === "No"}
                            onChange={handleRadioChange}
                            inline
                          />
                        </FormGroup>
                      </Row>
                      <Row className='mb-3'>
                        <FormGroup as={Col} md="3" controlId="validationCustom28">
                          <FormLabel className="labelForm">Bank Account No</FormLabel>
                          <FormControl
                            value={student?.bank_Account_No || ""}
                            onChange={handleChange}
                            type="text"
                            name="bank_Account_No"
                            placeholder="Bank Account No"
                            maxLength={18}
                          />
                        </FormGroup>
                        <FormGroup as={Col} md="3" controlId="validationCustom29">
                          <FormLabel className="labelForm">A/C Name</FormLabel>
                          <FormControl
                            value={student?.account_Name}
                            onChange={handleChange}
                            type="text"
                            name="account_Name"
                            placeholder="Account Name"
                          />
                        </FormGroup>
                        <FormGroup as={Col} md="3" controlId="validationCustom30">
                          <FormLabel className="labelForm">Bank Name</FormLabel>
                          <FormControl
                            value={student?.bank_Name}
                            onChange={handleChange}
                            type="text"
                            name="bank_Name"
                            placeholder="Bank Name"
                          />
                        </FormGroup>
                        <FormGroup as={Col} md="3" controlId="validationCustom31">
                          <FormLabel className="labelForm">IFSC Code</FormLabel>
                          <FormControl
                            value={student?.ifsc_Code}
                            onChange={handleChange}
                            type="text"
                            name="ifsc_Code"
                            placeholder="IFSC Code"
                            maxLength={11}
                          />
                        </FormGroup>
                      </Row>
                      <Row className="mb-3">
                        <FormGroup as={Col} md="5">
                          <FormLabel className="labelForm">Residence Address</FormLabel>
                          <FormControl
                            as="textarea"
                            rows={6}
                            style={{ height: '150px' }}
                            name="residence_address"
                            value={student.residence_address}
                            onChange={(e) => {
                              const value = e.target.value;
                              setStudent(prev => ({ ...prev, residence_address: value }));
                              if (copyChecked) {
                                setStudent(prev => ({ ...prev, copy_address: value }));
                              }
                            }}
                          />
                        </FormGroup>

                        <FormGroup as={Col} md="2" className="d-flex align-items-center">
                          <FormCheck
                            type="checkbox"
                            label="Copy Address"
                            checked={copyChecked}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setCopyChecked(checked);
                              if (checked) {
                                setStudent(prev => ({ ...prev, copy_address: prev.residence_address }));
                              }
                            }}
                          />
                        </FormGroup>

                        <FormGroup as={Col} md="5">
                          <FormLabel className="labelForm">Permanent Address</FormLabel>
                          <FormControl
                            as="textarea"
                            rows={6}
                            style={{ height: '150px' }}
                            name="copy_address"
                            value={student.copy_address}
                            onChange={(e) => setStudent(prev => ({ ...prev, copy_address: e.target.value }))}
                            disabled={copyChecked} // Disable when copy is checked
                          />
                        </FormGroup>
                      </Row>

                      <Row className='mb-3'>
                        <FormGroup as={Col} md="6" controlId="validationCustom34">
                          <FormLabel className="labelForm">Country</FormLabel>
                          <FormSelect>
                            <option>Country</option>
                            <option value="1">India</option>
                            <option value="2">Australia</option>
                            <option value="3">Mexico</option>
                            <option value="4">Brazil</option>
                          </FormSelect>
                        </FormGroup>
                        <FormGroup as={Col} md="6" controlId="validationCustom08">
                          <FormLabel className="labelForm">Select State</FormLabel>
                          <FormSelect
                            value={student?.state_name}
                            onChange={handleChange}
                            name="state_name"
                          >
                            <option value="">Select State</option>
                            {stateList?.length > 0 && stateList?.map((stateItem) => (
                              <option key={stateItem?._id} value={stateItem?._id}>
                                {stateItem?.state_name}
                              </option>
                            ))}
                          </FormSelect>
                        </FormGroup>
                      </Row>
                      <Row className='mb-3'>
                        <FormGroup as={Col} md="6" controlId="validationCustom38">
                          <FormLabel className="labelForm">City/District</FormLabel>
                          <FormControl
                            value={student?.city_Or_Districte}
                            onChange={handleChange}
                            type="text"
                            name="city_Or_Districte"
                            placeholder="City/District"
                          />
                        </FormGroup>
                        {/* <FormGroup as={Col} md="6" controlId="validationCustom40">
                          <FormLabel className="labelForm">Pin No</FormLabel>
                          <FormControl
                            value={student?.pin_No}
                            onChange={handleChange}
                            type="text"
                            name="pin_No"
                            placeholder="Pin No."
                          />
                        </FormGroup> */}
                        <FormGroup as={Col} md="6" controlId="validationCustom40">
                          <FormLabel className="labelForm">Pin No</FormLabel>
                          <FormControl
                            value={student?.pin_No}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Only allow numbers and limit to 6 digits
                              if (/^\d*$/.test(value) && value.length <= 6) {
                                setStudent(prev => ({ ...prev, pin_No: value }));
                                // Clear error when valid input
                                setStudentError(prev => ({ ...prev, pin_No_error: "" }));
                              }
                            }}
                            type="text"
                            name="pin_No"
                            placeholder="6-digit PIN"
                            maxLength={6}
                          />
                          {studentError.pin_No_error && (
                            <p className="error">{studentError.pin_No_error}</p>
                          )}
                        </FormGroup>
                      </Row>
                      <Row>
                        <Col>
                          <div className='buttons1'>
                            {hasSubmitAccess && <Button type="submit" className="btn btn-primary mt-4">Submit form</Button>}
                          </div>
                        </Col>
                      </Row>
                    </Form>
                  </div>
                </Tab>

                <Tab eventKey="document-upload" title="Document Uploads" className='cover-sheet'>
                  <Row>
                    <Col>
                      <div className="studentHeading"><h2>Document Upload</h2> </div>
                      <div className="formSheet">
                        <p className="fw-bold text-danger">
                          Important Note: Please fill basic details first, then you can upload
                          documents from this section.
                        </p>
                        <div className="p-4">
                          <Row className="mb-3">
                            <FormGroup as={Col} md="6" controlId="validationCustom001">
                              <FormLabel className="labelForm">Birth Certificate</FormLabel>
                              <FormControl
                                onChange={handleChange}
                                type="file"
                                name="birth_certificate"
                              />
                            </FormGroup>
                          </Row>
                          <Row className="mb-3">
                            <FormGroup as={Col} md="6" controlId="validationCustom002">
                              <FormLabel className="labelForm">Caste Certificate</FormLabel>
                              <FormControl
                                onChange={handleChange}
                                type="file"
                                name="caste_certificate"
                              />
                            </FormGroup>
                          </Row>
                          <Row className="mb-3">
                            <FormGroup as={Col} md="6" controlId="validationCustom003">
                              <FormLabel className="labelForm">Character Certificate</FormLabel>
                              <FormControl
                                onChange={handleChange}
                                type="file"
                                name="character_certificate"
                              />
                            </FormGroup>
                          </Row>
                          <Row className="mb-3">
                            <FormGroup as={Col} md="6" controlId="validationCustom003">
                              <FormLabel className="labelForm">Migration Certificate</FormLabel>
                              <FormControl
                                onChange={handleChange}
                                type="file"
                                name="migration_certificate"
                              />
                            </FormGroup>
                          </Row>
                          <Row className="mb-3">
                            <FormGroup as={Col} md="6" controlId="validationCustom004">
                              <FormLabel className="labelForm">MarkSheet</FormLabel>
                              <FormControl
                                onChange={handleChange}
                                type="file"
                                name="marksheet"
                              />
                            </FormGroup>
                          </Row>
                          <Row className="mb-3">
                            <FormGroup as={Col} md="6" controlId="validationCustom005">
                              <FormLabel className="labelForm">Previous Year Result</FormLabel>
                              <FormControl
                                onChange={handleChange}
                                type="file"
                                name="previous_result"
                              />
                            </FormGroup>
                          </Row>
                          <Row className="mb-3">
                            <FormGroup as={Col} md="6" controlId="validationCustom006">
                              <FormLabel className="labelForm">Doc TTL</FormLabel>
                              <FormControl
                                onChange={handleChange}
                                type="file"
                                name="doc_ttl"
                              />
                            </FormGroup>
                          </Row>
                          <Row className="mb-3">
                            <FormGroup as={Col} md="6" controlId="validationCustom007">
                              <FormLabel className="labelForm">Transfer Certificate (TC)</FormLabel>
                              <FormControl
                                onChange={handleChange}
                                type="file"
                                name="transfer_certificate"
                              />
                            </FormGroup>
                          </Row>
                        </div>
                      </div>
                    </Col>
                  </Row>

                </Tab>
              </Tabs>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(AddNewStudentPage), { ssr: false });