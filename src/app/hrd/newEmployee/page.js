"use client";
import { Container, Row, Col, FormSelect } from 'react-bootstrap';
import { Form, FormGroup, FormLabel, FormControl, Button } from 'react-bootstrap';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect, useState } from 'react';
import { motherTongueOptions } from '@/app/utils';
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import { addNewEmployee, deleteEmployeeById, getAllDepartments, getAllDesignations, getAllEmployee, getCastes, getCategories, getReligions, updateEmployeeById } from '@/Services';
import { toast } from 'react-toastify';
import { copyContent, printContent } from '@/app/utils';
import usePagePermission from '@/hooks/usePagePermission';

// Validation Schema
const schema = yup.object().shape({
    // employee_code: yup.string().required("Employee Code is required"),
    employee_name: yup.string().required("Employee name is required"),
    date_of_birth: yup.string().required("Date of birth is required"),
    father_name: yup.string().required("Father's name is required"),
    employee_email: yup.string().email("Invalid email format").required("Email is required"),
    gender: yup.string().required("Gender is required"),
    nationality: yup.string().required("Nationality is required"),
    // social_category: yup.string().required("Social Category is required"),
    mobile_no: yup.string().required("Mobile No. is required").matches(/^[0-9]{10}$/, "Mobile No. must be exactly 10 digits"),
    // religion: yup.string().required("Religion is required"),
    // caste: yup.string().required("Caste is required"),
    aadhar_number: yup.string().required("Aadhar number is required").matches(/^\d{12}$/, "Aadhar number must be exactly 12 digits"),
    permanent_address: yup.string().required("Permanent Address is required"),
    profile_image: yup.mixed().notRequired(),
    // .test("required", "Profile Image is required", value => value && value.length > 0),
    aadhar_card_image: yup.mixed().notRequired()
    // .test("required", "Aadhar Card Image is required", value => value && value.length > 0),
});

const Employee = () => {
    const { hasSubmitAccess, hasEditAccess } = usePagePermission()
    const breadcrumbItems = [
        { label: "hrd", link: "/hrd/allModule" },
        { label: "Employee Management", link: "null" },
    ];

    const {register,handleSubmit,reset,setValue,watch,formState: { errors },} = useForm({resolver: yupResolver(schema),});

    const [allCategories, setAllCategories] = useState([]);
    const [allReligions, setAllReligions] = useState([]);
    const [allCastes, setAllcastes] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
    const [designations, setDesignations] = useState([])
    const [departments, setdepartments] = useState([])

    const fetchCategories = async () => {
        const response = await getCategories()
        setAllCategories(response?.data);
    };

    const fetchReligions = async () => {
        const response = await getReligions()
        setAllReligions(response?.data);
    };

    const fetchCastes = async () => {
        const response = await getCastes()
        setAllcastes(response?.data);
    };

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await getAllEmployee()
            setEmployees(response.data || []);
        } catch (err) {
            setError("Failed to fetch employees");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEmployee = async (data) => {
        try {
            const formData = new FormData();

            // Explicitly exclude _id and other fields you don't want
            const { _id, createdAt, updatedAt, __v, employee_code, ...createData } = data;

            Object.entries(createData).forEach(([key, value]) => {
                if ((key === 'profile_image' || key === 'aadhar_card_image') && value?.length) {
                    formData.append(key, value[0]);
                }
                else if (value !== undefined && value !== null && value !== '' && value !== 'null') {
                    formData.append(key, value);
                }
            });

            const response = await addNewEmployee(formData);
            if (response?.success) {
                toast.success(response?.message || "Employee Created Successfully..");
                fetchEmployees();
                resetForm();
                setIsFormOpen(false);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Failed to create employee";
            if (errorMsg.includes("duplicate key error")) {
                if (errorMsg.includes("mobile_no")) {
                    toast.error("Mobile number already exists.");
                } else if (errorMsg.includes("aadhar_number")) {
                    toast.error("Aadhar number already exists.");
                } else if (errorMsg.includes("employee_email")) {
                    toast.error("Email already exists.");
                } else {
                    toast.error("Duplicate entry found. Please check your data.");
                }
            }

            setError(error.response?.data?.message || "Failed to create employee");
        }
    };


    const handleUpdateEmployee = async (data) => {
        try {
            const formData = new FormData();

            Object.entries(data).forEach(([key, value]) => {
                if ((key === 'profile_image' || key === 'aadhar_card_image') && value?.length) {
                    formData.append(key, value[0]);
                }
                else if (value !== undefined && value !== null && value !== '' && value !== 'null') {
                    formData.append(key, value);
                }
            });

            const response = await updateEmployeeById(currentEmployeeId, formData)
            if (response?.success) {
                toast.success(response?.message || "Employee updated successfully.");
                fetchEmployees();
                resetForm();
                setIsFormOpen(false);
                setEditMode(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update employee");
            setError(error.response?.data?.message || "Failed to update employee");
        }
    };


    const handleDeleteEmployee = async (id) => {
        if (confirm("Are you sure you want to delete this employee?")) {
            try {
                const response = await deleteEmployeeById(id)
                if (response?.success) {
                    toast.success(response?.message || "Employee Record Deleted Successfully..")
                    fetchEmployees();
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to delete employee")
                setError(error.response?.data?.message || "Failed to delete employee");
            }
        }
    };

    const handleEditEmployee = (employee) => {
        setEditMode(true);
        setCurrentEmployeeId(employee._id);

        // Prepare the data for the form
        const formData = {
            ...employee,
            // Handle nested objects
            department_name: employee.department_name?._id || "",
            designation_name: employee.designation_name?._id || "",
            religion: employee.religion?._id || "",
            caste: employee.caste?._id || "",
            social_category: employee.social_category?._id || "",
            // Handle file fields - you might need a different approach for these
            profile_image: null, // Reset file fields since we can't prefill them
            aadhar_card_image: null
        };

        reset(formData);
        setIsFormOpen(true);
    };

    const fetchDesignations = async () => {
        const response = await getAllDesignations();
        setDesignations(response?.data)
    }
    const fetchDepartments = async () => {
        const response = await getAllDepartments();
        setdepartments(response?.data)
    }

    const columns = [
        {
            name: "#",
            selector: (row, index) => index + 1,
            sortable: false,
            width: "80px",
        },
        {
            name: "Employee Code",
            selector: (row) => row.employee_code || "N/A",
            sortable: true,
        },
        {
            name: "Employee Name",
            selector: (row) => row.employee_name || "N/A",
            sortable: true,
        },
        {
            name: "Email",
            selector: (row) => row.employee_email || "N/A",
            sortable: true,
        },
        {
            name: "Mobile",
            selector: (row) => row.mobile_no || "N/A",
            sortable: true,
        },
        hasEditAccess && {
            name: "Actions",
            cell: (row) => (
                <div className="d-flex gap-1">
                    <Button size='sm' variant='success' onClick={() => handleEditEmployee(row)}>
                        <FaEdit />
                    </Button>
                    <Button size='sm' variant='danger' onClick={() => handleDeleteEmployee(row._id)}>
                        <FaTrashAlt />
                    </Button>
                </div>
            ),
        },
    ];

    useEffect(() => {
        fetchCategories();
        fetchReligions();
        fetchCastes();
        fetchEmployees();
        fetchDesignations()
        fetchDepartments()
    }, []);
    const resetForm = () => {
        const defaultValues = {
            employee_name: "",
            date_of_birth: "",
            father_name: "",
            employee_email: "",
            gender: "",
            nationality: "",
            mobile_no: "",
            aadhar_number: "",
            permanent_address: "",
            profile_image: null,
            aadhar_card_image: null,
            // Reset radio buttons and selects
            employee_pf_limit: "No",
            employer_pf_limit: "No",
            // ... other default values
        };

        // Reset the form with default values
        reset(defaultValues);

        // Reset all state variables
        setEditMode(false);
        setCurrentEmployeeId(null);
        setError("");
    };
    const handleCopy = () => {
        const headers = ["#", "Employee Code", "Employee Name", "Email", "Mobile"];
        const rows = employees.map((row, index) =>
            `${index + 1}\t${row.employee_code || "N/A"}\t${row.employee_name || "N/A"}\t${row.employee_email || "N/A"}\t${row.mobile_no || "N/A"}`
        );
        copyContent(headers, rows);
    };
    const handlePrint = () => {
        const headers = [["#", "Employee Code", "Employee Name", "Email", "Mobile"]];
        const rows = employees.map((row, index) => [
            index + 1,
            row.employee_code || "N/A",
            row.employee_name || "N/A",
            row.employee_email || "N/A",
            row.mobile_no || "N/A",
        ]);
        printContent(headers, rows);
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
                            {hasSubmitAccess && (
                                <Button
                                    onClick={() => {
                                        setIsFormOpen(true);
                                        setEditMode(false);
                                        resetForm();
                                    }}
                                    className="btn-add mb-3"
                                >
                                    <CgAddR /> Add New Employee
                                </Button>
                            )}

                            {isFormOpen && (
                                <div className="cover-sheet mb-4" key={editMode ? `edit-${currentEmployeeId}` : 'create'}>
                                    <div className="studentHeading">
                                        <h2>{editMode ? "Edit Employee" : "Add New Employee"}</h2>
                                        <button
                                            className="closeForm"
                                            onClick={() => {
                                                setIsFormOpen(false);
                                                resetForm();
                                            }}
                                        >
                                            X
                                        </button>
                                    </div>
                                    <Form
                                        className="p-4"
                                        onSubmit={handleSubmit(editMode ? handleUpdateEmployee : handleCreateEmployee)}
                                    >
                                        <Row>
                                            <FormGroup as={Col} md="3" controlId="employee_name">
                                                <FormLabel className="labelForm">Employee Name</FormLabel>
                                                <FormControl
                                                    type="text"
                                                    placeholder="Employee Name"
                                                    {...register("employee_name")}
                                                    isInvalid={!!errors.employee_name}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.employee_name?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="date_of_birth">
                                                <FormLabel className="labelForm">Date of Birth</FormLabel>
                                                <FormControl
                                                    type="date"
                                                    {...register("date_of_birth")}
                                                    isInvalid={!!errors.date_of_birth}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.date_of_birth?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="father_name">
                                                <FormLabel className="labelForm">Father&apos;s Name</FormLabel>
                                                <FormControl
                                                    type="text"
                                                    placeholder="Father&apos;s Name"
                                                    {...register("father_name")}
                                                    isInvalid={!!errors.father_name}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.father_name?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="employee_email">
                                                <FormLabel className="labelForm">Employee Email</FormLabel>
                                                <FormControl
                                                    type="email"
                                                    placeholder="Email"
                                                    {...register("employee_email")}
                                                    isInvalid={!!errors.employee_email}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.employee_email?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>
                                        </Row>

                                        <Row>
                                            <FormGroup as={Col} md="3" controlId="gender">
                                                <FormLabel className="labelForm">Gender</FormLabel>
                                                <FormSelect
                                                    {...register("gender")}
                                                    isInvalid={!!errors.gender}
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </FormSelect>
                                                <FormControl.Feedback type="invalid">
                                                    {errors.gender?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>
                                            <FormGroup as={Col} md="3" controlId="father_occupation">
                                                <FormLabel className="labelForm">Father&apos;s Occupation</FormLabel>
                                                <FormSelect
                                                    {...register("father_occupation")}
                                                    isInvalid={!!errors.father_occupation}
                                                >
                                                    <option value="">Select Occupation</option>
                                                    <option value="Job">Job</option>
                                                    <option value="Business">Business</option>
                                                    <option value="Other">Other</option>
                                                </FormSelect>
                                                <FormControl.Feedback type="invalid">
                                                    {errors.father_occupation?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>
                                            <FormGroup as={Col} md="3" controlId="nationality">
                                                <FormLabel className="labelForm">Nationality</FormLabel>
                                                <FormSelect
                                                    {...register("nationality")}
                                                    isInvalid={!!errors.nationality}
                                                >
                                                    <option value="">Select Nationality</option>
                                                    <option value="Indian">Indian</option>
                                                    <option value="American">American</option>
                                                    <option value="British">British</option>
                                                    <option value="Canadian">Canadian</option>
                                                    <option value="Other">Other</option>
                                                </FormSelect>
                                                <FormControl.Feedback type="invalid">
                                                    {errors.nationality?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>
                                            <FormGroup as={Col} md="3" controlId="social_category">
                                                <FormLabel className="labelForm">Social Category</FormLabel>
                                                <FormSelect
                                                    {...register("social_category")}
                                                    isInvalid={!!errors.social_category}
                                                >
                                                    <option value="">Select Category</option>
                                                    {
                                                        allCategories?.map((cat, idx) => (
                                                            <option key={cat?._id} value={cat._id}>{cat?.category_name}</option>
                                                        ))
                                                    }
                                                </FormSelect>
                                                <FormControl.Feedback type="invalid">
                                                    {errors.category?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                        </Row>

                                        <Row>
                                            <FormGroup as={Col} md="3" controlId="mobile_no">
                                                <FormLabel className="labelForm">Mobile Number</FormLabel>
                                                <FormControl
                                                    type="text"
                                                    placeholder='+91 2323897434'
                                                    {...register("mobile_no")}
                                                    isInvalid={!!errors.mobile_no}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.mobile_no?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>
                                            <FormGroup as={Col} md="3" controlId="religion">
                                                <FormLabel className="labelForm">Religion</FormLabel>
                                                <FormSelect {...register("religion")} isInvalid={!!errors.religion}>
                                                    <option value="">Select Religion</option>
                                                    {
                                                        allReligions?.map((rel, idx) => (
                                                            <option key={rel?._id} value={rel?._id}>{rel?.religion_name}</option>
                                                        ))
                                                    }
                                                </FormSelect>
                                                <FormControl.Feedback type="invalid">
                                                    {errors.religion?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>
                                            <FormGroup as={Col} md="3" controlId="caste">
                                                <FormLabel className="labelForm">Caste</FormLabel>
                                                <FormSelect {...register("caste")} isInvalid={!!errors.caste}>
                                                    <option value="">Select Caste</option>
                                                    {
                                                        allCastes?.map((cas, idx) => (
                                                            <option key={cas?._id} value={cas?._id}>{cas?.caste_name}</option>
                                                        ))
                                                    }
                                                </FormSelect>
                                                <FormControl.Feedback type="invalid">
                                                    {errors.caste?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="mother_tongue">
                                                <FormLabel className="labelForm">Mother Tongue</FormLabel>
                                                <FormSelect {...register("mother_tongue")} isInvalid={!!errors.mother_tongue}>
                                                    <option value="">Select Mother Tongue</option>
                                                    {motherTongueOptions()?.map(item => (
                                                        <option key={item?.label} value={item?.value}>
                                                            {item?.label}
                                                        </option>
                                                    ))}
                                                </FormSelect>
                                                <FormControl.Feedback type="invalid">
                                                    {errors.mother_tongue?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>
                                        </Row>

                                        {/* Row 4 - Marital Status & Aadhar */}
                                        <Row>
                                            <FormGroup as={Col} md="3" controlId="marital_status">
                                                <FormLabel className="labelForm">Marital Status</FormLabel>
                                                <FormSelect {...register("marital_status")} isInvalid={!!errors.marital_status}>
                                                    <option value="">Select</option>
                                                    <option value="Single">Single</option>
                                                    <option value="Married">Married</option>
                                                    <option value="Divorced">Divorced</option>
                                                    <option value="Widowed">Widowed</option>
                                                </FormSelect>
                                                <FormControl.Feedback type="invalid">
                                                    {errors.marital_status?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="aadhar_number">
                                                <FormLabel className="labelForm">Aadhar Number</FormLabel>
                                                <FormControl
                                                    type="text"
                                                    placeholder="Enter 12-digit Aadhar Number"
                                                    {...register("aadhar_number")}
                                                    isInvalid={!!errors.aadhar_number}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.aadhar_number?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>
                                        </Row>

                                        <Row>
                                            <FormGroup as={Col} md="3" controlId="profile_image">
                                                <FormLabel className="labelForm">Profile Image</FormLabel>
                                                <FormControl
                                                    type="file"
                                                    accept="image/*"
                                                    {...register("profile_image")}
                                                    isInvalid={!!errors.profile_image}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.profile_image?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="aadhar_card_image">
                                                <FormLabel className="labelForm">Aadhar Card Image</FormLabel>
                                                <FormControl
                                                    type="file"
                                                    accept="image/*"
                                                    {...register("aadhar_card_image")}
                                                    isInvalid={!!errors.aadhar_card_image}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.aadhar_card_image?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="permanent_address">
                                                <FormLabel className="labelForm">Permanent Address *</FormLabel>
                                                <FormControl
                                                    as="textarea"
                                                    rows={2}
                                                    placeholder="Enter permanent address"
                                                    {...register("permanent_address")}
                                                    isInvalid={!!errors.permanent_address}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.permanent_address?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="correspondence_address">
                                                <FormLabel className="labelForm">Correspondence Address</FormLabel>
                                                <FormControl
                                                    as="textarea"
                                                    rows={2}
                                                    placeholder="Enter correspondence address"
                                                    {...register("correspondence_address")}
                                                    isInvalid={!!errors.correspondence_address}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.correspondence_address?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>
                                        </Row>

                                        <hr />

                                        <Row>
                                            <p className='fw-bold'>Family Details</p>
                                            <FormGroup as={Col} md="3" controlId="wife_or_husband_name">
                                                <FormLabel className="labelForm">Wife&apos;s / Husband Name</FormLabel>
                                                <FormControl
                                                    type="text"
                                                    placeholder="Wife&apos;s / Husband Name"
                                                    {...register("wife_or_husband_name")}
                                                    isInvalid={!!errors.wife_or_husband_name}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.wife_or_husband_name?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="relation">
                                                <FormLabel className="labelForm">Relation</FormLabel>
                                                <FormControl
                                                    type="text"
                                                    placeholder="Relation"
                                                    {...register("relation")}
                                                    isInvalid={!!errors.relation}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.relation?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="mother_name">
                                                <FormLabel className="labelForm">Mother&apos;s Name</FormLabel>
                                                <FormControl
                                                    type="text"
                                                    placeholder="Mother&apos;s Name"
                                                    {...register("mother_name")}
                                                    isInvalid={!!errors.mother_name}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.mother_name?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="telephone_no">
                                                <FormLabel className="labelForm">Telephone No</FormLabel>
                                                <FormControl
                                                    type="text"
                                                    placeholder="Telephone No"
                                                    {...register("telephone_no")}
                                                    isInvalid={!!errors.telephone_no}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.telephone_no?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>
                                        </Row>

                                        <hr />
                                        <Row className="mb-3">
                                            <p className='fw-bold my-2'>Last Qualification</p>
                                            <FormGroup as={Col} md="3" controlId="emp_qualification">
                                                <FormLabel>Qualification</FormLabel>
                                                <FormControl
                                                    type="text"
                                                    placeholder="Qualification"
                                                    {...register("emp_qualification")}
                                                    isInvalid={!!errors.emp_qualification}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.emp_qualification?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="subject">
                                                <FormLabel>Subject</FormLabel>
                                                <FormControl
                                                    type="text"
                                                    placeholder="Subject"
                                                    {...register("subject")}
                                                    isInvalid={!!errors.subject}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.subject?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="trained">
                                                <FormLabel>Trained</FormLabel>
                                                <FormControl
                                                    type="text"
                                                    placeholder="Trained"
                                                    {...register("trained")}
                                                    isInvalid={!!errors.trained}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.trained?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="emp_percentage">
                                                <FormLabel>Percentage</FormLabel>
                                                <FormControl
                                                    type="text"
                                                    placeholder="Percentage"
                                                    {...register("emp_percentage")}
                                                    isInvalid={!!errors.emp_percentage}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.emp_percentage?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>
                                        </Row>
                                        <Row className="mb-3">

                                            <FormGroup as={Col} md="3" controlId="emp_univercity_name">
                                                <FormLabel>University Name</FormLabel>
                                                <FormControl
                                                    type="text"
                                                    placeholder="University Name"
                                                    {...register("emp_univercity_name")}
                                                    isInvalid={!!errors.emp_univercity_name}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.emp_univercity_name?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="emp_experience">
                                                <FormLabel>Experience</FormLabel>
                                                <FormControl
                                                    type="text"
                                                    placeholder="Experience"
                                                    {...register("emp_experience")}
                                                    isInvalid={!!errors.emp_experience}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.emp_experience?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>
                                        </Row>
                                        <hr />
                                        <Row className="mb-3">

                                            <p className='fw-bold my-2'>Bank Details</p>
                                            <FormGroup as={Col} md="3" controlId="emp_bankname">
                                                <FormLabel>Bank Name</FormLabel>
                                                <FormControl
                                                    type="text"
                                                    placeholder="Bank Name"
                                                    {...register("emp_bankname")}
                                                    isInvalid={!!errors.emp_bankname}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.emp_bankname?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="emp_account_no">
                                                <FormLabel>Account Number</FormLabel>
                                                <FormControl
                                                    type="number"
                                                    placeholder="emp_account_no"
                                                    {...register("emp_account_no")}
                                                    isInvalid={!!errors.emp_account_no}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.emp_account_no?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>
                                            <FormGroup as={Col} md="3" controlId="emp_account_no">
                                                <FormLabel>Account IFSC Code</FormLabel>
                                                <FormControl
                                                    type="text"
                                                    placeholder="emp_account_no"
                                                    {...register("emp_ifsc_code")}
                                                    isInvalid={!!errors.emp_ifsc_code}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.emp_ifsc_code?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>
                                        </Row>
                                        <hr />
                                        <Row className="mb-3">
                                            <p className='fw-bold my-2'>Employee LIC Details</p>
                                            <FormGroup as={Col} md="3" controlId="lic_policy_no">
                                                <FormLabel>Policy No</FormLabel>
                                                <FormControl
                                                    type="text"
                                                    placeholder="Policy Number"
                                                    {...register("lic_policy_no")}
                                                    isInvalid={!!errors.lic_policy_no}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.lic_policy_no?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="lic_amount">
                                                <FormLabel>Amount</FormLabel>
                                                <FormControl
                                                    type="text"
                                                    placeholder="Amount"
                                                    {...register("lic_amount")}
                                                    isInvalid={!!errors.lic_amount}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.lic_amount?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="2" controlId="lic_start_date">
                                                <FormLabel>Start Date</FormLabel>
                                                <FormControl
                                                    type="date"
                                                    {...register("lic_start_date")}
                                                    isInvalid={!!errors.lic_start_date}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.lic_start_date?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="2" controlId="lic_end_date">
                                                <FormLabel>End Date</FormLabel>
                                                <FormControl
                                                    type="date"
                                                    {...register("lic_end_date")}
                                                    isInvalid={!!errors.lic_end_date}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.lic_end_date?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="2" controlId="lic_cancle_date">
                                                <FormLabel>Cancel Date</FormLabel>
                                                <FormControl
                                                    type="date"
                                                    {...register("lic_cancle_date")}
                                                    isInvalid={!!errors.lic_cancle_date}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.lic_cancle_date?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>
                                        </Row>
                                        <hr />
                                        <Row>
                                            <p className='fw-bold'>Employment Details</p>
                                            <FormGroup as={Col} md="3" controlId="appointment_date">
                                                <FormLabel className="labelForm">Appointment Date</FormLabel>
                                                <FormControl type="date" {...register("appointment_date")} isInvalid={!!errors.appointment_date} />
                                                <FormControl.Feedback type="invalid">{errors.appointment_date?.message}</FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="department">
                                                <FormLabel className="labelForm">Department</FormLabel>
                                                <FormSelect
                                                    {...register("department_name")}
                                                    isInvalid={!!errors.department}
                                                    value={watch("department_name")} // Ensure the current value is displayed
                                                >
                                                    <option value="">Select</option>
                                                    {departments?.map((dp) => (
                                                        <option key={dp?._id} value={dp?._id}>{dp?.department_name}</option>
                                                    ))}
                                                </FormSelect>
                                                <FormControl.Feedback type="invalid">
                                                    {errors.department?.message}
                                                </FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="department_from">
                                                <FormLabel className="labelForm">Department From</FormLabel>
                                                <FormControl type="date" {...register("department_from")} isInvalid={!!errors.department_from} />
                                                <FormControl.Feedback type="invalid">{errors.department_from?.message}</FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="category">
                                                <FormLabel className="labelForm">Category</FormLabel>
                                                <FormSelect {...register("category")} isInvalid={!!errors.category}>
                                                    <option value="">Select</option>
                                                    <option value="teaching">Teaching</option>
                                                    <option value="non-teaching">Non-Teaching</option>
                                                </FormSelect>
                                                <FormControl.Feedback type="invalid">{errors.category?.message}</FormControl.Feedback>
                                            </FormGroup>
                                        </Row>
                                        <Row>
                                            <FormGroup as={Col} md="3" controlId="category_from">
                                                <FormLabel className="labelForm">Category From</FormLabel>
                                                <FormControl type="date" {...register("category_from")} isInvalid={!!errors.category_from} />
                                                <FormControl.Feedback type="invalid">{errors.category_from?.message}</FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="designation">
                                                <FormLabel className="labelForm">Designation</FormLabel>
                                                <FormSelect {...register("designation_name")} isInvalid={!!errors.designation}>
                                                    <option value="">Select</option>
                                                    {designations?.map((des) => (
                                                        <option key={des?._id} value={des?._id}>{des?.designation_name}</option>
                                                    ))}
                                                </FormSelect>
                                                <FormControl.Feedback type="invalid">{errors.designation?.message}</FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="designation_from">
                                                <FormLabel className="labelForm">Designation From</FormLabel>
                                                <FormControl type="date" {...register("designation_from")} isInvalid={!!errors.designation_from} />
                                                <FormControl.Feedback type="invalid">{errors.designation_from?.message}</FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="school_name">
                                                <FormLabel className="labelForm">School Name</FormLabel>
                                                <FormControl type="text" placeholder="School Name" {...register("school_name")} isInvalid={!!errors.school_name} />
                                                <FormControl.Feedback type="invalid">{errors.school_name?.message}</FormControl.Feedback>
                                            </FormGroup>
                                        </Row>
                                        <Row>
                                            <FormGroup as={Col} md="3" controlId="nature_of_app">
                                                <FormLabel className="labelForm">Nature of App</FormLabel>
                                                <FormSelect {...register("nature_of_app")} isInvalid={!!errors.nature_of_app}>
                                                    <option value="">Select</option>
                                                    <option value="Permanent">Permanent</option>
                                                    <option value="Temporary">Temporary</option>
                                                    <option value="Contract">Contract</option>
                                                </FormSelect>
                                                <FormControl.Feedback type="invalid">{errors.nature_of_app?.message}</FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="nature_of_app_from">
                                                <FormLabel className="labelForm">Nature of App From</FormLabel>
                                                <FormControl type="date" {...register("nature_of_app_from")} isInvalid={!!errors.nature_of_app_from} />
                                                <FormControl.Feedback type="invalid">{errors.nature_of_app_from?.message}</FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="pan_number">
                                                <FormLabel className="labelForm">PAN Number</FormLabel>
                                                <FormControl type="text" placeholder="PAN Number" {...register("pan_number")} isInvalid={!!errors.pan_number} />
                                                <FormControl.Feedback type="invalid">{errors.pan_number?.message}</FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="pay_scale">
                                                <FormLabel className="labelForm">Pay Scale</FormLabel>
                                                <FormSelect {...register("pay_scale")} isInvalid={!!errors.pay_scale}>
                                                    <option value="">Select</option>
                                                    <option value="Level 1">Level 1</option>
                                                    <option value="Level 2">Level 2</option>
                                                    <option value="Level 3">Level 3</option>
                                                </FormSelect>
                                                <FormControl.Feedback type="invalid">{errors.pay_scale?.message}</FormControl.Feedback>
                                            </FormGroup>
                                        </Row>
                                        <Row>
                                            <FormGroup as={Col} md="3" controlId="pay_scale_from">
                                                <FormLabel className="labelForm">Pay Scale From</FormLabel>
                                                <FormControl type="date" {...register("pay_scale_from")} isInvalid={!!errors.pay_scale_from} />
                                                <FormControl.Feedback type="invalid">{errors.pay_scale_from?.message}</FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="grade_pay">
                                                <FormLabel className="labelForm">Grade Pay</FormLabel>
                                                <FormControl type="text" {...register("grade_pay")} isInvalid={!!errors.grade_pay} />
                                                <FormControl.Feedback type="invalid">{errors.grade_pay?.message}</FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="grade_pay_from">
                                                <FormLabel className="labelForm">Grade Pay From</FormLabel>
                                                <FormControl type="date" {...register("grade_pay_from")} isInvalid={!!errors.grade_pay_from} />
                                                <FormControl.Feedback type="invalid">{errors.grade_pay_from?.message}</FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="basic_pay">
                                                <FormLabel className="labelForm">Basic Pay</FormLabel>
                                                <FormControl type="text" {...register("basic_pay")} isInvalid={!!errors.basic_pay} />
                                                <FormControl.Feedback type="invalid">{errors.basic_pay?.message}</FormControl.Feedback>
                                            </FormGroup>
                                        </Row>
                                        <Row>
                                            <FormGroup as={Col} md="3" controlId="basic_pay_from">
                                                <FormLabel className="labelForm">Basic Pay From</FormLabel>
                                                <FormControl type="date" {...register("basic_pay_from")} isInvalid={!!errors.basic_pay_from} />
                                                <FormControl.Feedback type="invalid">{errors.basic_pay_from?.message}</FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="gross_pay">
                                                <FormLabel className="labelForm">Gross Pay</FormLabel>
                                                <FormControl type="text" {...register("gross_pay")} isInvalid={!!errors.gross_pay} />
                                                <FormControl.Feedback type="invalid">{errors.gross_pay?.message}</FormControl.Feedback>
                                            </FormGroup>

                                            <FormGroup as={Col} md="3" controlId="net_pay">
                                                <FormLabel className="labelForm">Net Pay</FormLabel>
                                                <FormControl type="text" {...register("net_pay")} isInvalid={!!errors.net_pay} />
                                                <FormControl.Feedback type="invalid">{errors.net_pay?.message}</FormControl.Feedback>
                                            </FormGroup>
                                        </Row>
                                        <hr />
                                        <Row className="mb-3">
                                            <Col md="3">
                                                <FormLabel>Bus Chrg.</FormLabel>
                                                <FormControl type="text" placeholder="Bus Charges" {...register("bus_charges")} />
                                            </Col>

                                            <Col md="3">
                                                <FormLabel>CONV</FormLabel>
                                                <FormControl type="text" placeholder="Convenience" {...register("conv")} />
                                            </Col>

                                            <Col md="3">
                                                <FormLabel>DA</FormLabel>
                                                <FormControl type="text" placeholder="DA" {...register("da")} />
                                            </Col>

                                            <Col md="3">
                                                <FormLabel>DA Arrear</FormLabel>
                                                <FormControl type="text" placeholder="DA Arrear" {...register("da_arrear")} />
                                            </Col>
                                        </Row>

                                        <Row className="mb-3">
                                            <Col md="3">
                                                <FormLabel>Inc. Tax</FormLabel>
                                                <FormControl type="text" placeholder="Income Tax" {...register("income_tax")} />
                                            </Col>

                                            <Col md="3">
                                                <FormLabel>Other Allow</FormLabel>
                                                <FormControl type="text" placeholder="Other Allowance" {...register("other_allow")} />
                                            </Col>

                                            <Col md="3">
                                                <FormLabel>PTax</FormLabel>
                                                <FormControl type="text" placeholder="Professional Tax" {...register("ptax")} />
                                            </Col>

                                            <Col md="3">
                                                <FormLabel>PF Joining Date</FormLabel>
                                                <FormControl type="date" {...register("pf_joining_date")} />
                                            </Col>
                                        </Row>

                                        <Row className="mb-3">
                                            <Col md="3">
                                                <FormLabel>Select PF Type</FormLabel>
                                                <Form.Select {...register("pf_type")}>
                                                    <option value="">Select</option>
                                                    <option value="EPF">EPF</option>
                                                    <option value="VPF">VPF</option>
                                                    <option value="NPS">NPS</option>
                                                </Form.Select>
                                            </Col>

                                            <Col md="3">
                                                <FormLabel>Employee PF Limit</FormLabel>
                                                <div>
                                                    <Form.Check inline label="Yes" type="radio" value="Yes" {...register("employee_pf_limit")} />
                                                    <Form.Check inline label="No" type="radio" value="No" {...register("employee_pf_limit")} />
                                                </div>
                                            </Col>

                                            <Col md="3">
                                                <FormLabel>Employer PF Limit</FormLabel>
                                                <div>
                                                    <Form.Check inline label="Yes" type="radio" value="Yes" {...register("employer_pf_limit")} />
                                                    <Form.Check inline label="No" type="radio" value="No" {...register("employer_pf_limit")} />
                                                </div>
                                            </Col>

                                            <Col md="3">
                                                <FormLabel>Employee Pension Limit</FormLabel>
                                                <div>
                                                    <Form.Check inline label="Yes" type="radio" value="Yes" {...register("employee_pension_limit")} />
                                                    <Form.Check inline label="No" type="radio" value="No" {...register("employee_pension_limit")} />
                                                </div>
                                            </Col>
                                        </Row>

                                        <Row className="mb-3">
                                            <Col md="3">
                                                <FormLabel>Mess Facility</FormLabel>
                                                <div>
                                                    <Form.Check inline label="Yes" type="radio" value="Yes" {...register("mess_facility")} />
                                                    <Form.Check inline label="No" type="radio" value="No" {...register("mess_facility")} />
                                                </div>
                                            </Col>

                                            <Col md="3">
                                                <FormLabel>Salary Gen. Applicable</FormLabel>
                                                <div>
                                                    <Form.Check inline label="Yes" type="radio" value="Yes" {...register("salary_gen_applicable")} />
                                                    <Form.Check inline label="No" type="radio" value="No" {...register("salary_gen_applicable")} />
                                                </div>
                                            </Col>

                                            <Col md="3">
                                                <FormLabel>ESI</FormLabel>
                                                <div>
                                                    <Form.Check inline label="Yes" type="radio" value="Yes" {...register("esi")} />
                                                    <Form.Check inline label="No" type="radio" value="No" {...register("esi")} />
                                                </div>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col>
                                                <div className="buttons1">
                                                    <Button
                                                        type="button"
                                                        className="btn btn-danger mt-4"
                                                        onClick={() => {
                                                            setIsFormOpen(false);
                                                            resetForm();
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button type="submit" className="btn btn-success mt-4">
                                                        {editMode ? "Update Employee" : "Add Employee"}
                                                    </Button>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Form>
                                </div>
                            )}

                            <div className="tableSheet">
                                <h2>Employee Records</h2>
                                {loading && <p>Loading...</p>}
                                {/* {error && <p className="text-danger">{error}</p>} */}
                                {!loading && !error && (
                                    <Table
                                        columns={columns}
                                        data={employees}
                                        handleCopy={handleCopy}
                                        handlePrint={handlePrint}
                                    />
                                )}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </>
    );
};

export default Employee;