// 'use client';

// import React, { useState, useEffect } from "react";
// import dynamic from "next/dynamic";
// import styles from "@/app/medical/routine-check-up/page.module.css";
// import Table from "@/app/component/DataTable"; // Replace with your data table component
// import { FaEdit, FaTrashAlt } from "react-icons/fa";
// import { Form, Row, Col, Container, Button } from "react-bootstrap";
// import axios from "axios";

// const StudentMasterPage = () => {
//   const [data, setData] = useState([]); // Table data
//   const [loading, setLoading] = useState(false); // Loading state
//   const [error, setError] = useState(""); // Error state
//   const [showAddForm, setShowAddForm] = useState(false); // Toggle Add Form visibility
//   const [student, setStudent] = useState({
//     first_name: "",
//     last_name: "",
//     father_name: "",
//     mother_name: "",
//     father_mobile_no: "",
//     phone_no: "",
//     date_of_birth: "",
//     gender: "",
//     religion: "",
//     aadhar_card_no: "",
//     last_school_attended: "",
//     residence_address: { country: "" },
//     copy_address: { country: "" },
//   });

//   const BASE_URL = "https://erp-backend-fy3n.onrender.com/api/students";

//   const columns = [
//     {
//       name: "#",
//       selector: (row, index) => index + 1,
//       sortable: false,
//       width: "50px",
//     },
//     {
//       name: "First Name",
//       selector: (row) => row.first_name || "N/A",
//       sortable: true,
//     },
//     {
//       name: "Last Name",
//       selector: (row) => row.last_name || "N/A",
//       sortable: true,
//     },
//     {
//       name: "Father's Name",
//       selector: (row) => row.father_name || "N/A",
//       sortable: true,
//     },
//     {
//       name: "Gender",
//       selector: (row) => row.gender || "N/A",
//       sortable: true,
//     },
//     {
//       name: "Phone No",
//       selector: (row) => row.phone_no || "N/A",
//       sortable: true,
//     },
//     {
//       name: "Residence Country",
//       selector: (row) => row.residence_address?.country || "N/A",
//       sortable: true,
//     },
//     {
//       name: "Copy Address Country",
//       selector: (row) => row.copy_address?.country || "N/A",
//       sortable: true,
//     },
//     {
//       name: "Actions",
//       cell: (row) => (
//         <div className="d-flex gap-2">
//           <button className="editButton" onClick={() => handleEdit(row._id)}>
//             <FaEdit />
//           </button>
//           <button
//             className="editButton btn-danger"
//             onClick={() => handleDelete(row._id)}
//           >
//             <FaTrashAlt />
//           </button>
//         </div>
//       ),
//     },
//   ];

//   const fetchData = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const response = await axios.get(BASE_URL);
//       setData(response.data || []);
//     } catch (err) {
//       console.error("Error fetching data:", err.response || err.message);
//       setError("Failed to fetch data. Please check the API endpoint.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async () => {
//     const endpoint = student._id ? `${BASE_URL}/${student._id}` : BASE_URL;
//     const method = student._id ? "put" : "post";

//     try {
//       const response = await axios[method](endpoint, student);
//       if (student._id) {
//         setData((prevData) =>
//           prevData.map((row) =>
//             row._id === student._id ? { ...row, ...student } : row
//           )
//         );
//       } else {
//         setData((prevData) => [...prevData, response.data]);
//       }
//       setShowAddForm(false);
//       resetStudentForm();
//     } catch (error) {
//       console.error("Error submitting data:", error.response || error.message);
//       setError("Failed to submit data. Please check the API endpoint.");
//     }
//   };

//   const handleEdit = async (id) => {
//     try {
//       const response = await axios.get(`${BASE_URL}/${id}`);
//       setStudent(response.data || {});
//       setShowAddForm(true);
//     } catch (err) {
//       console.error("Error fetching student by ID:", err.response || err.message);
//       setError("Failed to fetch student details. Please check the API endpoint.");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (confirm("Are you sure you want to delete this entry?")) {
//       try {
//         await axios.delete(`${BASE_URL}/${id}`);
//         setData((prevData) => prevData.filter((row) => row._id !== id));
//       } catch (error) {
//         console.error("Error deleting data:", error.response || error.message);
//         setError("Failed to delete data. Please check the API endpoint.");
//       }
//     }
//   };

//   const resetStudentForm = () => {
//     setStudent({
//       first_name: "",
//       last_name: "",
//       father_name: "",
//       mother_name: "",
//       father_mobile_no: "",
//       phone_no: "",
//       date_of_birth: "",
//       gender: "",
//       religion: "",
//       aadhar_card_no: "",
//       last_school_attended: "",
//       residence_address: { country: "" },
//       copy_address: { country: "" },
//     });
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   return (
//     <Container className={styles.formContainer}>
//       <Form className={styles.form}>
//         <Button
//           onClick={() => setShowAddForm(!showAddForm)}
//           className={`mb-4 ${styles.search}`}
//         >
//           Add Student
//         </Button>
//         {showAddForm && (
//           <div className="mb-4">
//             <Form.Group controlId="first_name">
//               <Form.Label>First Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={student.first_name}
//                 onChange={(e) =>
//                   setStudent({ ...student, first_name: e.target.value })
//                 }
//               />
//             </Form.Group>
//             <Form.Group controlId="last_name">
//               <Form.Label>Last Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={student.last_name}
//                 onChange={(e) =>
//                   setStudent({ ...student, last_name: e.target.value })
//                 }
//               />
//             </Form.Group>
//             <Form.Group controlId="father_name">
//               <Form.Label>Father's Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={student.father_name}
//                 onChange={(e) =>
//                   setStudent({ ...student, father_name: e.target.value })
//                 }
//               />
//             </Form.Group>
//             <Form.Group controlId="mother_name">
//               <Form.Label>Mother's Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={student.mother_name}
//                 onChange={(e) =>
//                   setStudent({ ...student, mother_name: e.target.value })
//                 }
//               />
//             </Form.Group>
//             <Form.Group controlId="father_mobile_no">
//               <Form.Label>Father's Mobile No</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={student.father_mobile_no}
//                 onChange={(e) =>
//                   setStudent({ ...student, father_mobile_no: e.target.value })
//                 }
//               />
//             </Form.Group>
//             <Form.Group controlId="phone_no">
//               <Form.Label>Phone No</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={student.phone_no}
//                 onChange={(e) =>
//                   setStudent({ ...student, phone_no: e.target.value })
//                 }
//               />
//             </Form.Group>
//             <Form.Group controlId="date_of_birth">
//               <Form.Label>Date of Birth</Form.Label>
//               <Form.Control
//                 type="date"
//                 value={student.date_of_birth}
//                 onChange={(e) =>
//                   setStudent({ ...student, date_of_birth: e.target.value })
//                 }
//               />
//             </Form.Group>
//             <Form.Group controlId="gender">
//               <Form.Label>Gender</Form.Label>
//               <Form.Control
//                 as="select"
//                 value={student.gender}
//                 onChange={(e) =>
//                   setStudent({ ...student, gender: e.target.value })
//                 }
//               >
//                 <option value="male">Male</option>
//                 <option value="female">Female</option>
//                 <option value="other">Other</option>
//               </Form.Control>
//             </Form.Group>
//             <Form.Group controlId="religion">
//               <Form.Label>Religion</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={student.religion}
//                 onChange={(e) =>
//                   setStudent({ ...student, religion: e.target.value })
//                 }
//               />
//             </Form.Group>
//             <Form.Group controlId="aadhar_card_no">
//               <Form.Label>Aadhar Card No</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={student.aadhar_card_no}
//                 onChange={(e) =>
//                   setStudent({ ...student, aadhar_card_no: e.target.value })
//                 }
//               />
//             </Form.Group>
//             <Form.Group controlId="last_school_attended">
//               <Form.Label>Last School Attended</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={student.last_school_attended}
//                 onChange={(e) =>
//                   setStudent({ ...student, last_school_attended: e.target.value })
//                 }
//               />
//             </Form.Group>
//             <Form.Group controlId="residence_country">
//               <Form.Label>Residence Country</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={student.residence_address.country}
//                 onChange={(e) =>
//                   setStudent({
//                     ...student,
//                     residence_address: { country: e.target.value },
//                   })
//                 }
//               />
//             </Form.Group>
//             <Form.Group controlId="copy_address_country">
//               <Form.Label>Copy Address Country</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={student.copy_address.country}
//                 onChange={(e) =>
//                   setStudent({
//                     ...student,
//                     copy_address: { country: e.target.value },
//                   })
//                 }
//               />
//             </Form.Group>
//             <Button onClick={handleSubmit}>
//               {student._id ? "Update" : "Add"} Student
//             </Button>
//           </div>
//         )}
//         <Row>
//           <Col>
//             <h2 style={{ fontSize: "22px" }}>Student Records</h2>
//             {loading && <p>Loading...</p>}
//             {error && <p style={{ color: "red" }}>{error}</p>}
//             {!loading && !error && <Table columns={columns} data={data} />}
//           </Col>
//         </Row>
//       </Form>
//     </Container>
//   );
// };

// export default StudentMasterPage;
