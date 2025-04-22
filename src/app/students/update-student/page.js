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
import { FaEdit, FaTrashAlt } from "react-icons/fa"
import axios from "axios";
import { useRouter } from "next/navigation";
import Select from 'react-select';
import BreadcrumbComp from "@/app/component/Breadcrumb";


const UpdatePage = () => {
  const router = useRouter();
  const { isReady } = router;
  const [data, setData] = useState([]); // Table data
  const [loading, setLoading] = useState(false); // Loading state
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
    tc_Submitted: "",
    bank_Account_No: "",
    account_Name: "",
    bank_Name: "",
    ifsc_Code: "",
    residence_name: "",
    permanent_Add: "",
    country_name: "",
    state_name: "",
    city_Or_District: "",
    pin_No: "",
  });

  const [studentError, setStudentError] = useState({});
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [religionList, setReligionList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [casteList, setCasteList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReligion, setSelectedReligion] = useState("");
  const [selectedCaste, setSelectedCaste] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");



  //   const TOKEN = "6DJdQZJIv6WpChtccQOceQui2qYoKDWWJik2qTX3";
  // axios.defaults.headers.common["Authorization"] = `Bearer ${TOKEN}`;

  useEffect(() => {

    fetchClasses();
    getAllStudent()
    fetchReligion();
    fetchCategory();
    fetchCaste();
    fetchState();
  }, []);


  const fetchClasses = async () => {
    try {
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/all-classes`);
      const resp = response.data;

      setClassList(resp?.data || []);

    } catch (err) {
      setError("Failed to fetch classes.");
    }
  };

  const fetchReligion = async () => {
    try {
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/religions`);
      const resp = response.data;

      setReligionList(resp.data || []);

    } catch (err) {
      setError("Failed to fetch religions.");
    }
  };

  const fetchCategory = async () => {
    try {
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/categories`);
      const resp = response.data;
      setCategoryList(resp.data || []);

    } catch (err) {
      setError("Failed to fetch Categories.");
    }
  };

  const fetchCaste = async () => {
    try {
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/castes`);
      const resp = response.data;
      setCasteList(resp.data || []);

    } catch (err) {
      setError("Failed to fetch Caste.");
    }
  }

  const fetchState = async () => {
    try {
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/all-states`);
      const resp = response.data;
      setStateList(resp.data || []);

    } catch (err) {
      setError("Failed to fetch States.");
    }
  };

  const fetchSections = async (classId) => {
    try {
      console.log('testinggg', classId)
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/sections/class/${classId} `);
      setSectionList(response.data || []);
      console.log('testingg', response.data);
    } catch (err) {
      setError("Failed to fetch sections.");
    }
  };


  const columns = [
    { name: "#", selector: (row, index) => index + 1, sortable: false, width: "50px" },
    { name: "First Name", selector: (row) => row.first_name || "N/A", sortable: true },
    { name: "Last Name", selector: (row) => row.last_name || "N/A", sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button>
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];


  const inputFields = [
    { id: "birthCertificate", label: "Birth Certificate" },
    { id: "casteCertificate", label: "Caste Certificate" },
    { id: "characterCertificate", label: "Character Certificate" },
    { id: "docTtl", label: "Doc TTL" },
    { id: "marksheet", label: "Marksheet" },
    { id: "migrationCertificate", label: "Migration Certificate" },
    { id: "previousYearResult", label: "Previous Year Result" },
    { id: "transfer-certificate", label: "T.C." },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/students`);
      setData(response?.data || []);
    } catch (err) {
      console.error("Error fetching data:", err.response || err.message);
      setError("Failed to fetch data. Please check the API endpoint.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
    setStudentError((prev) => ({ ...prev, [`${name}_error`]: "" }));
  };

  const handleClassChange = (e) => {
    const { name, value } = e.target;


    setStudent((prev) => ({ ...prev, [name]: value }));
    setStudentError((prev) => ({ ...prev, [`${name}_error`]: "" }));

    fetchSections(value)
  };

  const handleReligionChange = (e) => {
    const { name, value } = e.target;
    setSelectedReligion(value);
    handleChange(e); 
  };

  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setSelectedCategory(value);
    handleChange(e); 
  };

  const handleCasteChange = (e) => {
    const { name, value } = e.target;
    setSelectedCaste(value);
    handleChange(e); 
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    setFiles((prevFiles) => ({
      ...prevFiles,
      [fieldName]: file,
    }));
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

  const [selectedValue, setSelectedValue] = useState("");

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
    setStudentError((prev) => ({ ...prev, [`${name}_error`]: "" }));
  };

  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");

  const handleCopy = () => {
    setTargetText(sourceText);
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault(); // Prevent page reload
  //   if (!validateForm()) return;

  //   if (!student._id) {
  //     setError("Student ID is missing.");
  //     return;
  //   }

  //   const endpoint = `${process.env.NEXT_PUBLIC_SITE_URL}/api/students/${student._id}`;

  //   try {
  //     const response = await axios.put(endpoint, student);
  //     console.log("response", response);

  //     if (response?.data?.success) {
  //       setData((prev) =>
  //         prev.map((row) => (row._id === student._id ? { ...row, ...student } : row))
  //       );

  //       setShowAddForm(false);
  //       resetStudentForm();
  //     } else {
  //       setError(response?.data?.message || "Unknown error occurred.");
  //     }

  //     onClose();
  //   } catch (err) {
  //     console.error("Error submitting data:", err.response?.data?.message || err.message);
  //     setError("Failed to submit data. Please check the API endpoint.");
  //   }
  // };



  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    if (!validateForm()) return;

    const endpoint = `https://erp-backend-fy3n.onrender.com/api/students/${student._id}`;

    try {
      const response = await axios.put(endpoint, student);
      console.log('response', response);
      if (response?.data?.success) {
        setData((prev) =>
          student._id
            ? prev.map((row) => (row._id === student._id ? { ...row, ...student } : row))
            : [...prev, response.data]
        );

        setShowAddForm(false);
        resetStudentForm();
      } else {
        setError(response?.data?.message ? response?.data?.message : response?.data?.error);
      }

      onClose();
    } catch (err) {
      console.error("Error submitting data:", err.response || err?.data?.message);
      setError("Failed to submit data. Please check the API endpoint.");
    }
  };

  const fetchStudent = async (e) => {

    const value = e.target.value;
    setSearchTerm(value);

    if (value.length >= 2) {
      try {
        const response = await axios.get(
          `https://erp-backend-fy3n.onrender.com/api/students/search?search_term=${value}`
        );
        console.log('response', response?.data);
        if (response?.data?.success) {
          // Filter students based on the search term across multiple fields
          const filteredStudent = response?.data?.data?.filter(student =>
            student.first_name.toLowerCase().includes(value.toLowerCase()) ||
            student.father_name.toLowerCase().includes(value.toLowerCase()) ||
            student.registration_id.toLowerCase().includes(value.toLowerCase())
          ).map(student => ({
            id: student.id || `${student.first_name}-${student.registration_id}`,
            first_name: student.first_name,
            father_name: student.father_name,
            registration_id: student.registration_id
          }));

          const searchStudentData = response?.data?.data?.map((item, ind) => {

            return { value: item?.registration_id, label: `${item?.first_name} - Father: ${item?.father_name} ID: ${item?.registration_id}` }
          })

          console.log('filteredStudent', searchStudentData);
          const options = [
            { value: 'chocolate', label: 'Chocolate' },
            { value: 'strawberry', label: 'Strawberry' },
            { value: 'vanilla', label: 'Vanilla' },
          ];

          setStudent(filteredStudent);
        } else {
          setStudent({});
        }

      } catch (error) {
        console.error("Failed to search students", error);
      }
    } else {
      setStudent([]); // Clear results if search term is less than 2 characters
    }
  };

  const getStudentData = async (e) => {
    console.log('e', e);

    const getSingleStudent = studentListData?.filter(item => item.registration_id === e.value);
    setSelectedOption(e)
    console.log('getSingleStudent[0]', getSingleStudent[0]);
    setStudent(getSingleStudent[0]);
  }

  const getAllStudent = async () => {
    console.log('getAllStudent called');

    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/students/search`
      );
      console.log('response', response);
      if (response?.data?.success) {
        const searchStudentOptions = response?.data?.data?.map((item, ind) => {
          return { value: item?.registration_id, label: `${item?.first_name} - Father: ${item?.father_name} - ID: ${item?.registration_id}` }
        })
        console.log('searchStudentOptions', searchStudentOptions);

        setStudentListData(response?.data?.data)
        setStudentListOptions(searchStudentOptions);
      } else {
        setStudentListData([])
        setStudentListOptions({});
      }
    } catch (error) {
      console.error("Failed to search students", error);
    }

  };
  console.log('setStudentListData', studentListData, studentListOptions);

  const handleEdit = async (id) => {
    try {
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/students/${id}`);
      setStudent(response?.data || {});
      setShowAddForm(true);
      onOpen();
    } catch (err) {
      console.error("Error fetching student by ID:", err.response || err.message);
      setError("Failed to fetch student details. Please check the API endpoint.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/students/${id}`);
        setData((prev) => prev.filter((row) => row._id !== id));
      } catch (err) {
        console.error("Error deleting data:", err.response || err.message);
        setError("Failed to delete data. Please check the API endpoint.");
      }
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
      residence_name: "",
      permanent_Add: "",
      country_name: "",
      state_name: "",
      city_Or_District: "",
      pin_No: "",
    });
  };

  const onOpen = () => setIsPopoverOpen(true);
  const onClose = () => setIsPopoverOpen(false);
  const [selectedMotherTongue, setSelectedMotherTongue] = useState("");

  const handleMotherTongueChange = (e) => {
    setSelectedMotherTongue(e.target.value);
    // If you're using a generic handler
    handleChange(e);
  };

  const motherOptions = motherTongueOptions();
  console.log('staudent', student);

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
                    <Row className="mb-3">
                      <Col lg={12}>

                        {console.log('studentListOptions', studentListOptions)}
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
                    <Row className="mb-3">
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
                          name="file"
                          value={student?.profile_Pic}
                          onChange={handleChange}
                        />

                      </FormGroup>
                    </Row>
                    <Row className="mb-3">
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
                      {/* <FormGroup as={Col} md="3" controlId="validationCustom09">
                        <FormLabel className="labelForm">Select Section</FormLabel>
                        <FormSelect
                          value={student?.section_name?._id || ""}
                          onChange={(e) =>
                            setStudent({ ...student, section_name: sectionList?.sections?.find(sec => sec._id === e.target.value) || e.target.value })
                          }
                        >
                          <option value="">Select Section</option>
                          {sectionList?.sections?.length > 0 &&
                            sectionList?.sections.map((sectionItem) => (
                              <option key={sectionItem?._id} value={sectionItem?._id}>
                                {sectionItem?.section_name}
                              </option>
                            ))}
                        </FormSelect>
                      </FormGroup> */}
                      <FormGroup as={Col} md="3" controlId="validationCustom09">
                        <FormLabel className="labelForm">Select Section</FormLabel>
                        <FormSelect
                          value={student?.section_name?._id || ""}
                          onChange={(e) => {
                            const selectedSection = sectionList?.sections?.find(
                              (sec) => sec._id === e.target.value
                            );
                            setStudent((prev) => ({
                              ...prev,
                              section_name: selectedSection || { _id: e.target.value },
                            }));
                          }}
                        >
                          <option value="">Select Section</option>
                          {sectionList?.sections?.map((sectionItem) => (
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
                          value={student?.category_name || ""}
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
                        <FormSelect>
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
                          <option value="5">Duplex</option>
                          <option value="5">Mansion</option>
                        </FormSelect>
                      </FormGroup>
                      {/* <FormGroup as={Col} md="3" controlId="validationCustom10">
                        <FormLabel className="labelForm">Date Of Admission</FormLabel>
                        <FormControl
                          value={student?.date_of_admission ? new Date(student?.date_of_admission).toISOString().split('T')[0] : ""}
                          onChange={(e) => setStudent({ ...student, date_of_admission: e.target.value })}
                          type="date"
                          name="date_of_admission"
                          placeholder="Date of Admission"
                        />
                        <p className="error">{studentError.date_of_admission_error}</p>
                      </FormGroup> */}
                      <FormGroup as={Col} md="3" controlId="validationCustom10">
                        <FormLabel className="labelForm">Date Of Admission</FormLabel>
                        <FormControl
                          value={student?.date_of_admission ? new Date(student?.date_of_admission).toISOString().split('T')[0] : ""}
                          onChange={(e) => setStudent({ ...student, date_of_admission: e.target.value })}
                          type="date"
                          name="date_of_admission"
                          placeholder="Date of Admission"
                        />
                        <p className="error">{studentError.date_of_admission_error}</p>
                      </FormGroup>
                      <FormGroup as={Col} md="3" controlId="validationCustom10">
                        <FormLabel className="labelForm">Date Of Joining</FormLabel>
                        <FormControl
                          value={student?.date_of_joining ? new Date(student?.date_of_joining).toISOString().split('T')[0] : ""}
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
                          value={student?.board_Registration_Number}
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
                        <FormCheck type="radio" value="Yes" label="Yes"
                          checked={selectedValue === "Yes"} onChange={handleRadioChange} inline />
                        <FormCheck type="radio" value="No" label="No"
                          checked={selectedValue === "No"} onChange={handleRadioChange} inline />
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} md="3" controlId="validationCustom28">
                        <FormLabel className="labelForm">Bank Account No</FormLabel>
                        <FormControl
                          value={student?.bank_Account_No}
                          onChange={handleChange}
                          type="text"
                          name="bank_Account_No"
                          placeholder="Bank Account No"
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
                        />
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} md="5">
                        <FormLabel className="labelForm" >Residance Address</FormLabel>
                        <FormControl as="textarea" rows={6} style={{ height: '150px' }} id='sourceTextarea'
                          value={sourceText} onChange={(e) => setSourceText(e.target.value)} />
                      </FormGroup>
                      <FormGroup as={Col} md="2">
                        <FormCheck type='checkbox' label='Copy Adress' onClick={handleCopy} />
                      </FormGroup>
                      <FormGroup as={Col} md="5">
                        <FormLabel className="labelForm">Permanent Address</FormLabel>
                        <FormControl as="textarea" rows={6} style={{ height: '150px' }} id='targetTextarea'
                          value={targetText} onChange={(e) => setTargetText(e.target.value)} />
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
                        <p className="error">{studentError.religion_name_error}</p>
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
                      <FormGroup as={Col} md="6" controlId="validationCustom40">
                        <FormLabel className="labelForm">Pin No</FormLabel>
                        <FormControl
                          value={student?.pin_No}
                          onChange={handleChange}
                          type="text"
                          name="pin_No"
                          placeholder="Pin No."
                        />
                      </FormGroup>
                    </Row>
                    <div className="studentHeading"><h2>Sibilings Details</h2></div>
                    <Row className='mb-3'>
                      <FormGroup as={Col} md="4" controlId="validationCustom06">
                        <FormLabel className="labelForm" >Add Sibiling</FormLabel>
                        <FormControl
                          value={student?.father_mobile_no}
                          onChange={handleChange}
                          type="text"
                          name="father_mobile_no"
                          placeholder="Type Name of Student"
                        />
                        <p className="error"> {studentError.father_mobile_no_error}</p>
                      </FormGroup>
                      <FormGroup as={Col} md="4" controlId="validationCustom08">
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

                      {/* <FormGroup as={Col} md="4" controlId="validationCustom14">
                        <FormLabel className="labelForm">Mother Tongue</FormLabel>
                        <FormSelect>
                          <option>Select</option>

                          {motherOptions?.map(item =>

                            <option key={item?.label} value={item?.value}>{item?.label}</option>
                          )}
                        </FormSelect>
                      </FormGroup> */}
                      <FormGroup as={Col} md="3" controlId="validationCustom14">
                        <FormLabel className="labelForm">Mother Tongue</FormLabel>
                        <FormSelect
                          name="mother_tongue"
                          value={selectedMotherTongue}
                          onChange={handleMotherTongueChange}
                        >
                          <option value="">Select</option>
                          {motherTongueOptions()?.map(item => (
                            <option key={item?.label} value={item?.value}>
                              {item?.label}
                            </option>
                          ))}
                        </FormSelect>
                      </FormGroup>

                    </Row>
                    <Row>
                      <Col>
                        <div className='buttons1'>
                          <Button type="button" className='btn btn-primary mt-4'>Add Sibiling</Button>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <div className='buttons1'>
                          <Button type="button" className='btn btn-primary mt-4'>Preview</Button>
                          <Button type="button" className="btn btn-primary mt-4" onClick={(e) => handleSubmit(e)}>Submit form</Button>
                        </div>
                      </Col>
                    </Row>
                  </Form>

                </Tab>
                <Tab eventKey="document-upload" title="Document Uploads" className='cover-sheet'>
                  <Row>
                    <Col>
                      <div className="studentHeading"><h2>Document Upload</h2> </div>


                      <Form className="formSheet" onSubmit={handleSubmit}>
                        <p style={{ color: "red" }}>
                          Important Note: Please fill basic details first, then you can upload
                          documents from this section.
                        </p>
                        <Row>

                        </Row>
                        <Button type="button" className='btn btn-primary mt-4'>
                          Submit
                        </Button>
                      </Form>
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

export default UpdatePage;

