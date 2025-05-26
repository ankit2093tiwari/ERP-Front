// "use client";
// import React, { useEffect, useState } from 'react';
// import styles from "@/app/students/add-new-student/page.module.css"
// import Preview from '@/app/component/Preview';
// import { Tab, Tabs, Container, Row, Col, FormSelect } from 'react-bootstrap';
// import "react-datepicker/dist/react-datepicker.css";
// import dynamic from 'next/dynamic';
// import { Form, FormGroup, FormLabel, FormControl, Button } from 'react-bootstrap';;
// import BreadcrumbComp from "@/app/component/Breadcrumb";
// import axios from 'axios';

// const TransferCertificate = () => {
//   const [studentData, setStudentData] = useState(null)
//   const [formData, setFormData] = useState({
//     registration_id: '',
//     tc_no: `TC${Date.now()}`,
//     student_name: '',
//     class_section: '',
//     class_section_inWords: '',
//     father_name: '',
//     mother_name: '',
//     dob: '',
//     dob_inWords: '',
//     caste: '',
//     nationality: 'Indian',
//     whether_failed: 'No',
//     school_name: '',
//     subject_studies: ['', '', '', '', '', ''],
//     class_promotion: 'false',
//     class_promotion_inwords: '',
//     whether_ncc_cadet: 'No',
//     fee_concession: 0,
//     general_conduct: 'Good',
//     total_working_days: '',
//     present_working_days: '',
//     reason_for_leaving_school: '',
//     date_of_application: '',
//     date_of_issue: new Date().toISOString().split('T')[0],
//     remarks: ''
//   });


//   const [studentId, setStudentId] = useState("")
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     if (name.startsWith("subject_studies_")) {
//       const index = parseInt(name.split("_")[2], 10);
//       const newSubjects = [...formData.subject_studies];
//       newSubjects[index] = value;
//       setFormData((prev) => ({ ...prev, subject_studies: newSubjects }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//       if (name === "registration_id") {
//         setStudentId(value);
//       }
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const url = 'http://localhost:9000/api/transfer-certificates/test'
//     const response = await axios.post(url, formData)
//     console.log(response);
//     if (response.data.success) {
//       alert(response.data.message)
//       setFormData({
//         registration_id: '',
//         tc_no: '',
//         student_name: '',
//         class_section: '',
//         class_section_inWords: '',
//         father_name: '',
//         mother_name: '',
//         dob: '',
//         dob_inWords: '',
//         caste: '',
//         nationality: 'Indian',
//         whether_failed: 'No',
//         school_name: '',
//         subject_studies: ['', '', '', '', '', ''],
//         class_promotion: 'false',
//         class_promotion_inwords: '',
//         whether_ncc_cadet: 'No',
//         fee_concession: 0,
//         general_conduct: 'Good',
//         total_working_days: '',
//         present_working_days: '',
//         reason_for_leaving_school: '',
//         date_of_application: '',
//         date_of_issue: new Date().toISOString().split('T')[0],
//         remarks: ''
//       })
//     }
//     else (
//       alert(response?.data.message)
//     )
//   };


//   const [showPreview, setShowPreview] = useState(false);

//   const togglePreview = () => {
//     setShowPreview((prev) => !prev);
//   }

//   useEffect(() => {
//     if (!studentId) return;
//     const fetchStudentInfo = async () => {
//       try {
//         const url = `https://erp-backend-fy3n.onrender.com/api/students/search?registration_id=${studentId}`;
//         const response = await axios.get(url);
//         // console.log(response.data);

//         if (response?.data.success) {
//           setStudentData(response?.data?.data[0]);
//         }
//       } catch (error) {
//         console.error("Error.......:", error);
//       }
//     };

//     fetchStudentInfo();
//   }, [studentId]);

//   useEffect(() => {
//     if (!studentData) return;
//     setFormData(prev => ({
//       ...prev,
//       student_name: studentData.first_name,
//       father_name: studentData?.father_name,
//       mother_name: studentData?.mother_name,
//       dob: studentData.date_of_birth?.split('T')[0] || '',
//       nationality: studentData?.nationality || 'Indian',
//       caste: studentData?.caste_name?.caste_name || "",
//       class_section: `${studentData?.class_name?.class_name} - ${studentData.section_name?.section_name || ''}`,
//       class_section_inWords: `${studentData?.class_name?.class_name} ${studentData.section_name?.section_name || ''}`,
//       class_promotion: studentData.promoted
//     }));
//   }, [studentData]);



//   const breadcrumbItems = [{ label: "students", link: "/students/all-module" }, { label: "Transfer Certificate", link: "null" }]
//   return (
//     <>
//       <div className="breadcrumbSheet position-relative">
//         <Container>
//           <Row className="mt-1 mb-1">
//             <Col>
//               <BreadcrumbComp items={breadcrumbItems} />
//             </Col>
//           </Row>
//         </Container>
//       </div>
//       <section>
//         <Container>
//           <Row>
//             <Col>
//               <Tabs defaultActiveKey="Generate Transfer Certificate" id="controlled-tab" className="mb-3 TabButton">
//                 <Tab eventKey="Generate Transfer Certificate" title="Generate Transfer Certificate" className="cover-sheet p-4">
//                   {!showPreview ? (
//                     <Form className={styles.form} onSubmit={handleSubmit}>
//                       {/* Initial Search Inputs */}
//                       <Row className="mb-4">
//                         <FormGroup as={Col} md="4" controlId="registration_id">
//                           <FormLabel>Type Registration ID For Search Student</FormLabel>
//                           <FormControl
//                             name="registration_id"
//                             type="text"
//                             value={formData.registration_id}
//                             onChange={handleChange}
//                             required
//                           />
//                         </FormGroup>
//                         {/* <FormGroup as={Col} md="4" controlId="fee_no">
//                           <FormLabel>Type Fee No For Search Student & Enter</FormLabel>
//                           <FormControl
//                             name="fee_no"
//                             type="number"
//                             value={formData.fee_no}
//                             onChange={handleChange}

//                           />
//                         </FormGroup>
//                         <FormGroup as={Col} md="4" controlId="parentID">
//                           <FormLabel>Type Parent ID For Search Student & Enter</FormLabel>
//                           <FormControl
//                             name="parentID"
//                             type="number"
//                             value={formData.parentID}
//                             onChange={handleChange}

//                           />
//                         </FormGroup> */}
//                       </Row>

//                       {/* Student Info Block 1 */}
//                       <Row className="mb-3">
//                         <FormGroup as={Col} md="3" controlId="tc_no">
//                           <FormLabel>TC No</FormLabel>
//                           <FormControl
//                             name="tc_no"
//                             value={formData.tc_no}
//                             onChange={handleChange}
//                             disabled
//                             type="text"
//                           />
//                         </FormGroup>
//                         <FormGroup as={Col} md="3" controlId="date_of_issue">
//                           <FormLabel>Date of Issue</FormLabel>
//                           <FormControl
//                             name="date_of_issue"
//                             value={formData.date_of_issue}
//                             onChange={handleChange}
//                             required
//                             type="date"
//                           />
//                         </FormGroup>
//                         <FormGroup as={Col} md="3" controlId="date_of_admission">
//                           <FormLabel>Date of Admission</FormLabel>
//                           <FormControl
//                             name="date_of_admission"
//                             value={formData.date_of_admission}
//                             onChange={handleChange}
//                             required
//                             type="date"
//                           />
//                         </FormGroup>
//                         <FormGroup as={Col} md="3" controlId="date_of_admission_inwords">
//                           <FormLabel>Date of Admission (In Words)</FormLabel>
//                           <FormControl
//                             name="date_of_admission_inwords"
//                             value={formData.date_of_admission_inwords}
//                             onChange={handleChange}

//                             type="text"
//                           />
//                         </FormGroup>

//                       </Row>

//                       {/* Student Info Block 2 */}
//                       <Row className="mb-3">
//                         <FormGroup as={Col} md="3" controlId="student_name">
//                           <FormLabel>Student Name</FormLabel>
//                           <FormControl
//                             name="student_name"
//                             value={formData.student_name}
//                             onChange={handleChange}
//                             readOnly
//                             type="text"
//                           />
//                         </FormGroup>
//                         <FormGroup as={Col} md="3" controlId="class_section">
//                           <FormLabel>Class & Section (in figures)</FormLabel>
//                           <FormControl
//                             name="class_section"
//                             value={formData.class_section}
//                             onChange={handleChange}
//                             readOnly
//                             type="text"
//                           />
//                         </FormGroup>
//                         <FormGroup as={Col} md="3" controlId="class_section_inwords">
//                           <FormLabel>Class & Section (in words)</FormLabel>
//                           <FormControl
//                             name="class_section_inwords"
//                             value={formData.class_section_inwords}
//                             onChange={handleChange}
//                             type="text"
//                           />
//                         </FormGroup>
//                         <FormGroup as={Col} md="3" controlId="caste">
//                           <FormLabel>Caste</FormLabel>
//                           <FormControl
//                             name="caste"
//                             value={formData.caste}
//                             onChange={handleChange}
//                             required
//                             type="text"
//                           />
//                         </FormGroup>

//                       </Row>

//                       {/* Student Info Block 3 */}
//                       <Row className="mb-3">
//                         <FormGroup as={Col} md="3" controlId="father_name">
//                           <FormLabel>Father's/Guardian's Name</FormLabel>
//                           <FormControl
//                             name="father_name"
//                             value={formData.father_name}
//                             onChange={handleChange}
//                             readOnly
//                             type="text"
//                           />
//                         </FormGroup>
//                         <FormGroup as={Col} md="3" controlId="mother_name">
//                           <FormLabel>Mother's Name</FormLabel>
//                           <FormControl
//                             name="mother_name"
//                             value={formData.mother_name}
//                             onChange={handleChange}
//                             required
//                             type="text"
//                           />
//                         </FormGroup>
//                         <FormGroup as={Col} md="3" controlId="dob">
//                           <FormLabel>Date of Birth (In Figure)</FormLabel>
//                           <FormControl
//                             name="dob"
//                             value={formData.dob}
//                             onChange={handleChange}
//                             required
//                             type="date"
//                           />
//                         </FormGroup>
//                         <FormGroup as={Col} md="3" controlId="dob_inWords">
//                           <FormLabel>Date of Birth (In Words)</FormLabel>
//                           <FormControl
//                             name="dob_inWords"
//                             value={formData.dob_inWords}
//                             onChange={handleChange}
//                             required
//                             type="text"
//                           />
//                         </FormGroup>


//                       </Row>

//                       <Row className="mb-3">

//                         <FormGroup as={Col} md="3" controlId="school_name">
//                           <FormLabel>School Name</FormLabel>
//                           <FormControl
//                             name="school_name"
//                             value={formData.school_name}
//                             onChange={handleChange}
//                             required
//                             type="text"
//                           />
//                         </FormGroup>
//                         <FormGroup as={Col} md="3" controlId="nationality">
//                           <FormLabel>Nationality</FormLabel>
//                           <FormControl
//                             name="nationality"
//                             value={formData.nationality}
//                             onChange={handleChange}
//                             readOnly
//                             type="text"
//                           />
//                         </FormGroup>
//                         <FormGroup as={Col} md="3" controlId="whether_failed">
//                           <FormLabel>Whether Failed (Once / Twice)</FormLabel>
//                           <FormControl
//                             name="whether_failed"
//                             value={formData.whether_failed}
//                             onChange={handleChange}

//                             type="text"
//                           />
//                         </FormGroup>

//                         {/* Subject Studies as array */}
//                         <FormGroup as={Col} md="3" controlId="subject_studies_0">
//                           <FormLabel>Subject Studies 1</FormLabel>
//                           <FormControl
//                             name="subject_studies_0"
//                             value={formData.subject_studies ? formData.subject_studies[0] || "" : ""}
//                             onChange={handleChange}
//                             required
//                             type="text"
//                           />
//                         </FormGroup>
//                       </Row>

//                       {/* Subject fields */}
//                       <Row className="mb-3">
//                         {[1, 2, 3, 4, 5].map(i => (
//                           <FormGroup key={i} as={Col} md="3" controlId={`subject_studies_${i}`}>
//                             <FormLabel>Subject Studies {i + 1}</FormLabel>
//                             <FormControl
//                               name={`subject_studies_${i}`}
//                               value={formData.subject_studies ? formData.subject_studies[i] || "" : ""}
//                               onChange={handleChange}

//                               type="text"
//                             />
//                           </FormGroup>
//                         ))}
//                       </Row>

//                       <Row className="mb-3">
//                         <FormGroup as={Col} md="6" controlId="class_promotion">
//                           <FormLabel>Promotion to the higher class (in figures)</FormLabel>
//                           <FormControl
//                             name="class_promotion"
//                             value={formData.class_promotion}
//                             onChange={handleChange}

//                             type="text"
//                           />
//                         </FormGroup>

//                         <FormGroup as={Col} md="6" controlId="class_promotion_inwords">
//                           <FormLabel>Promotion to the higher class (in words)</FormLabel>
//                           <FormControl
//                             name="class_promotion_inwords"
//                             value={formData.class_promotion_inwords}
//                             onChange={handleChange}

//                             type="text"
//                           />
//                         </FormGroup>
//                       </Row>

//                       <Row className="mb-3">
//                         <FormGroup as={Col} md="6" controlId="whether_ncc_cadet">
//                           <FormLabel>Whether NCC Cadet / Boy Scout / Girl Guide (Details may be given)</FormLabel>
//                           <FormControl
//                             name="whether_ncc_cadet"
//                             value={formData.whether_ncc_cadet}
//                             onChange={handleChange}

//                             type="text"
//                           />
//                         </FormGroup>
//                         <FormGroup as={Col} md="6" controlId="date_of_application">
//                           <FormLabel >Date of application for certificate</FormLabel>
//                           <FormControl
//                             name='date_of_application'
//                             value={formData.date_of_application}
//                             onChange={handleChange}
//                             required
//                             type="date"
//                           />
//                         </FormGroup>
//                       </Row>

//                       <Row className="mb-3">
//                         <FormGroup as={Col} md="6" controlId="fee_concession">
//                           <FormLabel>Any fee concession availed (nature of concession)</FormLabel>
//                           <FormControl
//                             name="fee_concession"
//                             value={formData.fee_concession}
//                             onChange={handleChange}
//                             type="number"
//                           />
//                         </FormGroup>
//                         <FormGroup as={Col} md="6" controlId="general_conduct">
//                           <FormLabel>General Conduct</FormLabel>
//                           <FormControl
//                             name="general_conduct"
//                             value={formData.general_conduct}
//                             onChange={handleChange}
//                             required
//                             type="text"
//                           />
//                         </FormGroup>
//                       </Row>
//                       <Row className="mb-3">
//                         <FormGroup as={Col} md="6" controlId="total_working_days">
//                           <FormLabel>Total Working Days</FormLabel>
//                           <FormControl
//                             name="total_working_days"
//                             value={formData.total_working_days}
//                             onChange={handleChange}
//                             required
//                             type="number"
//                           />
//                         </FormGroup>
//                         <FormGroup as={Col} md="6" controlId="present_working_days">
//                           <FormLabel>Days Present</FormLabel>
//                           <FormControl
//                             name="present_working_days"
//                             value={formData.present_working_days}
//                             onChange={handleChange}

//                             type="number"
//                           />
//                         </FormGroup>
//                       </Row>

//                       <Row className="mb-3">

//                         <FormGroup as={Col} md="6" controlId="reason_for_leaving_school">
//                           <FormLabel>Reason for Leaving School</FormLabel>
//                           <FormControl
//                             name="reason_for_leaving_school"
//                             value={formData.reason_for_leaving_school}
//                             onChange={handleChange}
//                             required
//                             as="textarea"
//                             rows={3}
//                           />
//                         </FormGroup>
//                         <FormGroup as={Col} md="6" controlId="remarks">
//                           <FormLabel>Remarks</FormLabel>
//                           <FormControl
//                             name="remarks"
//                             value={formData.remarks}
//                             onChange={handleChange}

//                             as="textarea"
//                             rows={3}
//                           />
//                         </FormGroup>
//                       </Row>

//                       <Row>
//                         <Col>
//                           <div className='buttons1'>
//                             {/* <Button type="button" id='submit' onClick={togglePreview}>Preview</Button> */}
//                             <Button type="submit" id='submit'>Submit form</Button>
//                           </div>
//                         </Col>
//                       </Row>
//                     </Form>
//                   ) : (
//                     <Preview formData={formData} togglePreview={togglePreview} />
//                   )}
//                 </Tab>
//               </Tabs>
//             </Col>
//           </Row>
//         </Container>
//       </section>
//     </>
//   );

// };
// export default TransferCertificate;

