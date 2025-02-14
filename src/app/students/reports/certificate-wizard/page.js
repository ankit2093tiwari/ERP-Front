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
// import { RiTumblrLine } from "react-icons/ri";
// import { TbBatteryCharging } from "react-icons/tb";
import Select from 'react-select';
// import { hookPropertyMap } from "next/dist/server/require-hook";


const CertificateWizard = () => {
  // const router = useRouter();
  // const { isReady } = useRouter()
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
    social_Category: "",
    mother_Tongue: "",
    nationality_name: "",
    enrollment_No: "",
    aadhar_card_no: "",
    fee_Book_No: "",
    caste_name: "",
    house_name: "",
    admission_date: "",
    joining_date: "",
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



  // const TOKEN = "6DJdQZJIv6WpChtccQOceQui2qYoKDWWJik2qTX3";
  // axios.defaults.headers.common["Authorization"] = `Bearer ${TOKEN}`;

  useEffect(() => {
    // fetchData();
    fetchClasses();
    getAllStudent()
    fetchReligion();
    fetchCategory();
    fetchCaste();
    fetchState();
  }, []);


  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/api/all-classes`);
      const resp = response.data;

      setClassList(resp?.data || []);

    } catch (err) {
      setError("Failed to fetch classes.");
    }
  };

  const fetchReligion = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/api/religions`);
      const resp = response.data;

      setReligionList(resp.data || []);

    } catch (err) {
      setError("Failed to fetch religions.");
    }
  };

  const fetchCategory = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/api/categories`);
      const resp = response.data;
      setCategoryList(resp.data || []);

    } catch (err) {
      setError("Failed to fetch Categories.");
    }
  };

  const fetchCaste = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/api/castes`);
      const resp = response.data;
      setCasteList(resp.data || []);

    } catch (err) {
      setError("Failed to fetch Caste.");
    }
  }

  const fetchState = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/api/all-states`);
      const resp = response.data;
      setStateList(resp.data || []);

    } catch (err) {
      setError("Failed to fetch States.");
    }
  };

  const fetchSections = async (classId) => {
    try {
      console.log('testinggg', classId)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/api/sections/class/${classId} `);
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
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/students`);
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
        key === 'first_name' || key === 'father_name' || key === 'father_mobile_no' || key === 'class_name' || key === 'section_name' || key === 'date_of_birth' || key === 'gender_name' || key === 'admission_date' || key === 'joining_date'
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


  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    if (!validateForm()) return;
    console.log('student._id', student._id)
    const endpoint = student._id
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/students/${id}`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/api/students`;
    const method = student._id ? "put" : "post";

    try {
      const response = await axios[method](endpoint, student);
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
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/api/students/${id}`);
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
        await axios.delete(`${process.env.NEXT_PUBLIC_SITE_URL}/api/students/${id}`);
        setData((prev) => prev.filter((row) => row._id !== id));
      } catch (err) {
        console.error("Error deleting data:", err.response || err.message);
        setError("Failed to delete data. Please check the API endpoint.");
      }
    }
  };

  const onOpen = () => setIsPopoverOpen(true);
  const onClose = () => setIsPopoverOpen(false);

  const motherOptions = motherTongueOptions();
  console.log('staudent', student);

  return (
    <Container>
      <Row className='mt-1 mb-1'>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/students/all-module">
              Student
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Update Student Data </Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
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
              </Form>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );

};

export default CertificateWizard;
