"use client";

import React, { useState, useEffect } from "react";
import styles from "@/app/students/add-new-student/page.module.css";
import Preview from '@/app/component/Preview';
import { Tab, Tabs, Container, Row, Col, FormSelect } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dynamic from 'next/dynamic';
import { Form, FormGroup, FormLabel, FormControl, Button, Breadcrumb } from 'react-bootstrap';
import { FormCheck } from 'react-bootstrap';
import { capitalizeFirstLetter, motherTongueOptions } from "@/app/utils";
import { useRouter } from "next/navigation";
import Select from 'react-select';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from 'react-toastify';
import { getAllStudents, getCastes, getCategories, getClasses, getReligions, getSections, getStates, updateStudent } from "@/Services";
import useSessionId from "@/hooks/useSessionId";
import usePagePermission from "@/hooks/usePagePermission";

const UpdatePage = () => {
  const selectedSessionId = useSessionId();
  const { hasEditAccess } = usePagePermission()

  const router = useRouter();
  const [data, setData] = useState([]); // Table data
  const [error, setError] = useState(""); // Error state
  const [showAddForm, setShowAddForm] = useState(false); // Toggle Add Form visibility
  const [studentListData, setStudentListData] = useState([]);
  const [studentListOptions, setStudentListOptions] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [student, setStudent] = useState({
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
    category_name: "",
    mother_tongue: "",
    nationality_name: "",
    enrollment_no: "",
    aadhar_card_no: "",
    fee_book_no: "",
    caste_name: "",
    house: "",
    admission_date: "",
    date_of_joining: "",
    scholar_No: "",
    last_School_Name: "",
    sr_No: "",
    board_Registration_Number: "",
    tc_submitted: "",
    bank_Account_No: "",
    account_Name: "",
    bank_Name: "",
    ifsc_Code: "",
    residence_address: "",
    copy_address: "",
    country_name: "",
    state_name: "",
    city_district: "",
    pin_no: "",
  });

  const [studentError, setStudentError] = useState({});
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [religionList, setReligionList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [casteList, setCasteList] = useState([]);
  const [stateList, setStateList] = useState([]);

  useEffect(() => {
    fetchClasses();
    getAllStudent()
    fetchReligion();
    fetchCategory();
    fetchCaste();
    fetchState();
  }, [selectedSessionId]);


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


  const handleClassChange = (e) => {
    const selectedClassId = e.target.value;
    const selectedClass = classList.find(
      (cls) => cls._id === selectedClassId
    );

    setStudent((prev) => ({
      ...prev,
      class_name: selectedClass || {},  // fallback to empty object
      section_name: "", // optional: reset section if needed
    }));

    if (selectedClassId) {
      fetchSections(selectedClassId); // fetch sections for selected class
    }
  };

  const validateForm = () => {
    const errors = {};
    Object.entries(student).forEach(([key, value]) => {
      if (
        key === 'first_name' || key === 'father_name' || key === 'father_mobile_no' || key === 'class_name' || key === 'section_name' || key === 'date_of_birth' || key === 'gender_name' || key === 'admission_date' || key === 'date_of_joining'
      ) {
        if (!value || (typeof value === 'object' && !Object.values(value).some(Boolean))) {
          const formattedKey = key.replace(/_/g, ' ').split(' ').map(capitalizeFirstLetter).join(' ');
          errors[`${key}_error`] = `${formattedKey} is required`;
        }
      }
    });
    setStudentError(errors);

    return Object.keys(errors).length === 0;
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
    setStudentError((prev) => ({ ...prev, [`${name}_error`]: "" }));
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setStudent((prev) => ({
        ...prev,
        [name]: files[0], // File object
      }));
    } else {
      setStudent((prev) => ({
        ...prev,
        [name]: value, // Normal text input
      }));
    }

    // Reset error
    setStudentError((prev) => ({
      ...prev,
      [`${name}_error`]: "",
    }));
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    if (!validateForm()) return;
    const formData = new FormData();

    // Append all simple fields
    Object.entries(student).forEach(([key, value]) => {
      if (
        value &&
        typeof value === "object" &&
        value._id // For dropdowns like caste_name, class_name etc.
      ) {
        formData.append(key, value._id);
      } else if (value instanceof File) {
        formData.append(key, value); // Actual File object
      } else {
        formData.append(key, value);
      }
    });
    // console.log(formData, "formdata");

    try {
      const response = await updateStudent(student._id, formData)
      if (response?.success) {
        // alert("Data Updated Successfully")
        toast.success("Data Updated Successfully");
        setData((prev) =>
          student._id
            ? prev.map((row) =>
              row._id === student._id ? { ...row, ...student } : row
            )
            : [...prev, response.data]
        );

        setShowAddForm(false);
        resetStudentForm();
      } else {
        alert("Failed to Update Data")
        setError(response?.data?.message || response?.data?.error);
      }

      onClose();
    } catch (err) {
      console.error("Error submitting data:", err.response || err?.message);
      setError("Failed to submit data. Please check the API endpoint.");
    }
  };

  const getStudentData = async (e) => {
    const selectedStudent = studentListData.find(item => item.registration_id === e?.value);
    setSelectedOption(e);

    if (selectedStudent) {
      // Fetch sections for student's class first
      await fetchSections(selectedStudent?.class_name?._id);

      // Then set student but transform section_name to section _id
      setStudent({
        ...selectedStudent,
        section_name: selectedStudent.section_name?._id || "",  // store _id here
      });
    }
  };

  const getAllStudent = async () => {
    try {
      const response = await getAllStudents()
      if (response?.success) {
        const searchStudentOptions = response?.data?.map((item, ind) => {
          return { value: item?.registration_id, label: `${item?.first_name} - Father: ${item?.father_name} - ID: ${item?.registration_id}` }
        })
        setStudentListData(response?.data)
        setStudentListOptions(searchStudentOptions);
      } else {
        setStudentListData([])
        setStudentListOptions({});
      }
    } catch (error) {
      console.error("Failed to search students", error);
    }

  };
  const resetStudentForm = () => {
    setStudent({
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
      category_name: "",
      mother_tongue: "",
      nationality_name: "",
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
      tc_Submitted: "",
      bank_Account_No: "",
      account_Name: "",
      bank_Name: "",
      ifsc_Code: "",
      residence_address: "",
      copy_address: "",
      country_name: "",
      state_name: "",
      city_district: "",
      pin_no: "",
    });
  };
  const onOpen = () => setIsPopoverOpen(true);
  const onClose = () => setIsPopoverOpen(false);
  const [selectedMotherTongue, setSelectedMotherTongue] = useState("");

  const motherOptions = motherTongueOptions();
  const breadcrumbItems = [{ label: "students", link: "/students/all-module" }, { label: "update-student", link: "null" }]

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
                  <div className="studentHeading"><h2> Search & Update Fields of Student  </h2> </div>
                  <Form className="formSheet" >
                    <Row className="mb-1">
                      <Col lg={12}>
                        <FormGroup as={Col} lg="12" md="12">

                          <Select
                            isSearchable
                            value={selectedOption}
                            options={studentListOptions}
                            onChange={getStudentData}
                            isClearable
                          />
                        </FormGroup>

                      </Col>
                    </Row>
                    <Row className="mb-1">
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
                      <FormGroup as={Col} md="3" className="position-relative mb-3">
                        <FormLabel className="labelForm">Profile Pic</FormLabel>
                        <FormControl
                          type="file"
                          name="profile_Pic"
                          // value={student?.profile_Pic}
                          onChange={handleChange}
                        />

                      </FormGroup>
                    </Row>
                    <Row className="mb-1">
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
                    <Row className='mb-3'>
                      <FormGroup as={Col} md="3" controlId="validationCustom08">
                        <FormLabel className="labelForm">Select Class</FormLabel>
                        <FormSelect
                          value={student?.class_name?._id || ""}
                          onChange={handleClassChange}
                          name="class_name"
                        >
                          <option value="">Select Class</option>
                          {classList?.length > 0 &&
                            classList.map((classItem) => (
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
                          value={student?.section_name || ""}
                          onChange={(e) => {
                            const selectedSectionId = e.target.value;
                            setStudent((prev) => ({
                              ...prev,
                              section_name: selectedSectionId,
                            }));
                          }}
                        >
                          <option value="">Select Section</option>
                          {sectionList.map((sectionItem) => (
                            <option key={sectionItem._id} value={sectionItem._id}>
                              {sectionItem.section_name}
                            </option>
                          ))}
                        </FormSelect>
                      </FormGroup>


                      <FormGroup as={Col} md="3" controlId="validationCustom10">
                        <FormLabel className="labelForm">Date Of Birth</FormLabel>
                        <FormControl
                          value={student?.date_of_birth ? new Date(student?.date_of_birth).toISOString().split('T')[0] : ""}
                          onChange={(e) => setStudent({ ...student, date_of_birth: e.target.value })}
                          type="date"
                          name="date_of_birth"
                          placeholder="Date of Birth"
                        />
                        <p className="error">{studentError.date_of_birth_error}</p>
                      </FormGroup>

                      <FormGroup as={Col} md="3" controlId="validationCustom11">
                        <FormLabel className="labelForm">Gender</FormLabel><br />
                        <FormCheck
                          type="radio"
                          name="gender_name"
                          value="Male"
                          label="Male"
                          checked={student.gender_name === "Male"}
                          onChange={handleRadioChange}
                          inline
                        />
                        <FormCheck
                          type="radio"
                          name="gender_name"
                          value="Female"
                          label="Female"
                          checked={student.gender_name === "Female"}
                          onChange={handleRadioChange}
                          inline
                        />
                        <p className="error"> {studentError.gender_name_error}</p>
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} md="3" controlId="validationCustom08">
                        <FormLabel className="labelForm">Select Religion</FormLabel>
                        <FormSelect
                          value={student?.religion_name?._id || ""}
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
                          value={student?.category_name?._id || ""}
                          onChange={handleChange}
                          name="category_name"
                        >
                          <option value="">Select Category</option>
                          {categoryList?.length > 0 && categoryList.map((categoryItem) => (
                            <option key={categoryItem?._id} value={categoryItem?._id}>
                              {categoryItem?.category_name}
                            </option>
                          ))}
                        </FormSelect>
                        <p className="error">{studentError?.category_name_error}</p>
                      </FormGroup>


                      <FormGroup as={Col} md="3" controlId="validationCustom14">
                        <FormLabel className="labelForm">Mother Tongue</FormLabel>
                        <FormSelect
                          onChange={handleChange}
                          value={student?.mother_tongue || ""}
                          name="mother_tongue"
                        >
                          <option>Select</option>

                          {motherOptions?.map(item =>

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
                    <Row className='mb-3'>
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
                          value={student?.caste_name?._id || ""}
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
                    <Row className='mb-3'>
                      <FormGroup as={Col} md="3" controlId="validationCustom20">
                        <FormLabel className="labelForm">House</FormLabel>
                        <FormSelect>
                          <option>Select</option>
                          <option value="1">Condo</option>
                          <option value="2">Apartment</option>
                          <option value="3">Cottage</option>
                          <option value="4">Movable Dwelling</option>
                          <option value="5">Bungalow</option>
                          <option value="6">Duplex</option>
                          <option value="7">Mansion</option>
                        </FormSelect>
                      </FormGroup>
                      <FormGroup as={Col} md="3" controlId="validationCustom21">
                        <FormLabel className="labelForm">Date Of Admission</FormLabel>
                        <FormControl
                          value={student.date_of_admission ? new Date(student.date_of_admission).toISOString().split('T')[0] : ""}
                          onChange={(e) => setStudent({ ...student, date_of_admission: e.target.value })}
                          type="date"
                          name="date_of_admission"
                          placeholder="Date of Admission"
                        />
                        <p className="error">{studentError.date_of_admission_error}</p>
                      </FormGroup>
                      <FormGroup as={Col} md="3" controlId="validationCustom22">
                        <FormLabel className="labelForm">Date Of Joining</FormLabel>
                        <FormControl
                          value={student.date_of_joining ? new Date(student.date_of_joining).toISOString().split('T')[0] : ""}
                          onChange={(e) => setStudent({ ...student, date_of_joining: e.target.value })}
                          type="date"
                          name="date_of_joining "
                          placeholder="Date of Joining"
                        />
                        <p className="error">{studentError.date_of_joining_error}</p>
                      </FormGroup>
                      <FormGroup as={Col} md="3" controlId="validationCustom23">
                        <FormLabel className="labelForm">Board Registration Number</FormLabel>
                        <FormControl
                          value={student.board_Registration_Number || ""}
                          onChange={handleChange}
                          type="text"
                          name="board_Registration_Number"
                          placeholder="Borad Registration Number"
                        />
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} md="3" controlId="validationCustom24">
                        <FormLabel className="labelForm">Scholar No</FormLabel>
                        <FormControl
                          value={student.scholar_No || ""}
                          onChange={handleChange}
                          type="text"
                          name="scholar_No"
                          placeholder="Scholar No."
                        />

                      </FormGroup>
                      <FormGroup as={Col} md="3" controlId="validationCustom25">
                        <FormLabel className="labelForm">Name of School Last Attended</FormLabel>
                        <FormControl
                          value={student.last_School_Name || ""}
                          onChange={handleChange}
                          type="text"
                          name="last_School_Name"
                          placeholder="Name of School Last Attended"
                        />

                      </FormGroup>
                      <FormGroup as={Col} md="3" controlId="validationCustom26">
                        <FormLabel className="labelForm">SR. No</FormLabel>
                        <FormControl
                          value={student.sr_No || ""}
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
                          value={student.bank_Account_No || ""}
                          onChange={handleChange}
                          type="text"
                          name="bank_Account_No"
                          placeholder="Bank Account No"
                        />
                      </FormGroup>
                      <FormGroup as={Col} md="3" controlId="validationCustom29">
                        <FormLabel className="labelForm">A/C Name</FormLabel>
                        <FormControl
                          value={student.account_Name || ""}
                          onChange={handleChange}
                          type="text"
                          name="account_Name"
                          placeholder="Account Name"
                        />
                      </FormGroup>
                      <FormGroup as={Col} md="3" controlId="validationCustom30">
                        <FormLabel className="labelForm">Bank Name</FormLabel>
                        <FormControl
                          value={student.bank_Name || ""}
                          onChange={handleChange}
                          type="text"
                          name="bank_Name"
                          placeholder="Bank Name"
                        />
                      </FormGroup>
                      <FormGroup as={Col} md="3" controlId="validationCustom31">
                        <FormLabel className="labelForm">IFSC Code</FormLabel>
                        <FormControl
                          value={student.ifsc_Code || ""}
                          onChange={handleChange}
                          type="text"
                          name="ifsc_Code"
                          placeholder="IFSC Code"
                        />
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} md="5">
                        <FormLabel className="labelForm" >Residance Address</FormLabel>
                        <FormControl
                          as="textarea"
                          rows={6}
                          style={{ height: '150px' }}
                          name="residence_address"
                          value={student?.residence_address || ""}
                          onChange={handleChange}
                        />
                      </FormGroup>
                      <FormGroup as={Col} md="2">
                        <FormCheck
                          type='checkbox'
                          label='Copy Address'
                          onChange={() => {
                            setStudent(prev => ({
                              ...prev,
                              copy_address: prev.residence_address
                            }))
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
                          value={student?.copy_address || ""}
                          onChange={handleChange}
                        />
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} md="6" controlId="validationCustom34">
                        <FormLabel className="labelForm">Country</FormLabel>
                        <FormSelect
                          name="country_name"
                          value={student.country_name}
                          onChange={handleChange}
                        >
                          <option value="">Select Country</option>
                          <option value="India">India</option>
                          <option value="Australia">Australia</option>
                          <option value="Mexico">Mexico</option>
                          <option value="Brazil">Brazil</option>
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
                        <p className="error">{studentError.religion_name_error}</p>
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} md="6" controlId="validationCustom40">
                        <FormLabel className="labelForm">Pin No</FormLabel>
                        <FormControl
                          value={student.pin_no || ""}
                          onChange={handleChange}
                          type="text"
                          name="pin_no"
                          maxLength={6}
                          placeholder="Pin No."
                        />
                      </FormGroup>
                    </Row>
                    <Row>
                      <Col>
                        <div className='buttons1'>
                          {/* <Button type="button" className='btn btn-primary mt-4'>Preview</Button> */}
                          {hasEditAccess && <Button type="button" variant="success" className="mt-4" onClick={(e) => handleSubmit(e)}>Submit form</Button>}
                        </div>
                      </Col>
                    </Row>
                  </Form>
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
                          <Row className="mb-1">
                            <FormGroup as={Col} md="6" controlId="validationCustom001">
                              <FormLabel className="labelForm">Birth Certificate</FormLabel>
                              <FormControl
                                onChange={handleChange}
                                type="file"
                                name="birth_certificate"
                              />
                            </FormGroup>
                          </Row>
                          <Row className="mb-1">
                            <FormGroup as={Col} md="6" controlId="validationCustom002">
                              <FormLabel className="labelForm">Caste Certificate</FormLabel>
                              <FormControl
                                onChange={handleChange}
                                type="file"
                                name="caste_certificate"
                              />
                            </FormGroup>
                          </Row>
                          <Row className="mb-1">
                            <FormGroup as={Col} md="6" controlId="validationCustom003">
                              <FormLabel className="labelForm">Character Certificate</FormLabel>
                              <FormControl
                                onChange={handleChange}
                                type="file"
                                name="character_certificate"
                              />
                            </FormGroup>
                          </Row>
                          <Row className="mb-1">
                            <FormGroup as={Col} md="6" controlId="validationCustom003">
                              <FormLabel className="labelForm">Migration Certificate</FormLabel>
                              <FormControl
                                onChange={handleChange}
                                type="file"
                                name="migration_certificate"
                              />
                            </FormGroup>
                          </Row>
                          <Row className="mb-1">
                            <FormGroup as={Col} md="6" controlId="validationCustom004">
                              <FormLabel className="labelForm">MarkSheet</FormLabel>
                              <FormControl
                                onChange={handleChange}
                                type="file"
                                name="marksheet"
                              />
                            </FormGroup>
                          </Row>
                          <Row className="mb-1">
                            <FormGroup as={Col} md="6" controlId="validationCustom005">
                              <FormLabel className="labelForm">Previous Year Result</FormLabel>
                              <FormControl
                                onChange={handleChange}
                                type="file"
                                name="previous_result"
                              />
                            </FormGroup>
                          </Row>
                          <Row className="mb-1">
                            <FormGroup as={Col} md="6" controlId="validationCustom006">
                              <FormLabel className="labelForm">Doc TTL</FormLabel>
                              <FormControl
                                onChange={handleChange}
                                type="file"
                                name="doc_ttl"
                              />
                            </FormGroup>
                          </Row>
                          <Row className="mb-1">
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

// export default UpdatePage;
export default dynamic(() => Promise.resolve(UpdatePage), { ssr: false });
