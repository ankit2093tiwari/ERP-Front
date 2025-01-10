// "use client";
// import React, { useState } from 'react';
// import styles from "@/app/students/add-new-student/page.module.css"
// import Preview from '@/app/component/Preview';
// import { Tab, Tabs, Container, Row, Col, FormSelect } from 'react-bootstrap';
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import dynamic from 'next/dynamic';
// import { Form, FormGroup, FormLabel, FormControl, Button } from 'react-bootstrap';
// import { FormCheck } from 'react-bootstrap';

// const transferCertificate = () => {
//   const [formData, setFormData] = useState({
//     admNo: '',
//     feeNo: '',
//     parentID: '',
//     tcNo: '',
//     classSection: '',
//     date: '',
//     dateOfAdmission: '',
//     studentName: '',
//     classSectionW: '',
//     caste: '',
//     dateOfAdmissionW: '',
//     fatherName: '',
//     dob: '',
//     nationality: '',
//     result: '',
//     motherName: '',
//     dobW: '',
//     school: '',
//     subject1: '',
//     subject2: '',
//     subject3: '',
//     subject4: '',
//     subject5: '',
//     subject6: '',
//     promotion: '',
//     guide: '',
//     promotionW: '',
//     games: '',
//     month: '',
//     achievement: '',
//     concession: '',
//     general: '',
//     totalWorking: '',
//     application: '',
//     presentWorking: '',
//     reasonLeave: '',
//     reasonLeave: '',
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log('Form submitted:', formData);
//   };

//   const [startDate, setStartDate] = useState(new Date());

//   const [showPreview, setShowPreview] = useState(false);

//   const togglePreview = () => {
//     setShowPreview((prev) => !prev);
//   }

//   const handleFileChange = (e, fieldName) => {
//     const file = e.target.files[0];
//     setFiles((prevFiles) => ({
//       ...prevFiles,
//       [fieldName]: file,
//     }));
//   };

//   const [selectedValue, setSelectedValue] = useState("");

//   const handleRadioChange = (event) => {
//     setSelectedValue(event.target.value);
//   };

//   const [sourceText, setSourceText] = useState("");
//   const [targetText, setTargetText] = useState("");

//   const handleCopy = () => {
//     setTargetText(sourceText);
//   };

//   return (
//     <Container>
//       <Row>
//         <Col>
//           <Tabs defaultActiveKey="Generate Transfer Certificate" id="controlled-tab" className="mb-3">
//             <Tab eventKey="Generate Transfer Certificate" title="Generate Transfer Certificate">
//               {!showPreview ? (
//                 <Form className={styles.form} onSubmit={handleSubmit}>
//                   <Row className="mb-4">
//                     <FormGroup as={Col} md="4" controlId="validationCustom01">
//                       <FormLabel value={formData.admNo} onChange={handleChange} required>Type Adm No For Search Student & Enter</FormLabel>
//                       <FormControl
//                         required
//                         type="number"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="4" controlId="validationCustom02">
//                       <FormLabel value={formData.feeNo} onChange={handleChange} required>Type Fee No For Search Student & Enter</FormLabel>
//                       <FormControl
//                         required
//                         type="number"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="4" controlId="validationCustom03">
//                       <FormLabel value={formData.parentID} onChange={handleChange} required>Type Parent ID For Search Student & Enter</FormLabel>
//                       <FormControl
//                         required
//                         type="number"
//                       />
//                     </FormGroup>
//                   </Row>
//                   <Row className="mb-3">
//                     <FormGroup as={Col} md="3" controlId="validationCustom01">
//                       <FormLabel value={formData.tcNo} onChange={handleChange} required>TC No</FormLabel>
//                       <FormControl
//                         required
//                         type="number"
//                         placeholder="TC No"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="3" controlId="validationCustom02">
//                       <FormLabel value={formData.classSection} onChange={handleChange} required>Class & Section(in figures)</FormLabel>
//                       <FormControl
//                         required
//                         type="number"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="3" controlId="validationCustom03">
//                       <FormLabel value={formData.date} onChange={handleChange} required>Date</FormLabel>
//                       <FormControl
//                         required
//                         type="date"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="3" className="validationCustom04">
//                       <FormLabel value={formData.dateOfAdmission} onChange={handleChange} required>Date of Admission</FormLabel>
//                       <FormControl
//                         required
//                         type="date"
//                       />
//                     </FormGroup>
//                   </Row>
//                   <Row className="mb-3">
//                     <FormGroup as={Col} md="3" controlId="validationCustom01">
//                       <FormLabel value={formData.studentName} onChange={handleChange} required>Student Name</FormLabel>
//                       <FormControl
//                         required
//                         type="text"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="3" controlId="validationCustom02">
//                       <FormLabel value={formData.classSectionW} onChange={handleChange} required>Class & Section(in words)</FormLabel>
//                       <FormControl
//                         required
//                         type="number"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="3" controlId="validationCustom03">
//                       <FormLabel value={formData.caste} onChange={handleChange} required>Caste</FormLabel>
//                       <FormControl
//                         required
//                         type="text"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="3" className="validationCustom04">
//                       <FormLabel value={formData.dateOfAdmissionW} onChange={handleChange} required>Date of Admission</FormLabel>
//                       <FormControl
//                         required
//                         type="date"
//                       />
//                     </FormGroup>
//                   </Row>
//                   <Row className="mb-3">
//                     <FormGroup as={Col} md="3" controlId="validationCustom01">
//                       <FormLabel value={formData.fatherName} onChange={handleChange} required>Father's/Guardian's Name </FormLabel>
//                       <FormControl
//                         required
//                         type="text"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="3" controlId="validationCustom02">
//                       <FormLabel value={formData.dob} onChange={handleChange} required>Date of Birth (In Figure)</FormLabel>
//                       <FormControl
//                         required
//                         type="date"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="3" controlId="validationCustom03">
//                       <FormLabel value={formData.nationality} onChange={handleChange} required>Nationality</FormLabel>
//                       <FormControl
//                         required
//                         type="text"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="3" className="validationCustom04">
//                       <FormLabel value={formData.result} onChange={handleChange} required>Whether failed. If so once / twice in the same result</FormLabel>
//                       <FormControl
//                         required
//                         type="number"
//                       />
//                     </FormGroup>
//                   </Row>
//                   <Row className="mb-3">
//                     <FormGroup as={Col} md="3" controlId="validationCustom01">
//                       <FormLabel value={formData.motherName} onChange={handleChange} required>Mother's Name </FormLabel>
//                       <FormControl
//                         required
//                         type="text"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="3" controlId="validationCustom02">
//                       <FormLabel value={formData.dobW} onChange={handleChange} required>Date of Birth (In words)</FormLabel>
//                       <FormControl
//                         required
//                         type="date"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="3" controlId="validationCustom03">
//                       <FormLabel value={formData.school} onChange={handleChange} required>School/Board Annual Exam. with result</FormLabel>
//                       <FormControl
//                         required
//                         type="text"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="3" className="validationCustom04">
//                       <FormLabel value={formData.subject1} onChange={handleChange} required>Subject Studies 1</FormLabel>
//                       <FormControl
//                         required
//                         type="text"
//                       />
//                     </FormGroup>
//                   </Row>
//                   <Row className="mb-3">
//                     <FormGroup as={Col} md="3" controlId="validationCustom01">
//                       <FormLabel value={formData.subject2} onChange={handleChange} required>Subject Studies 2</FormLabel>
//                       <FormControl
//                         required
//                         type="text"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="3" controlId="validationCustom02">
//                       <FormLabel value={formData.subject3} onChange={handleChange} required>Subject Studies 3</FormLabel>
//                       <FormControl
//                         required
//                         type="text"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="3" controlId="validationCustom03">
//                       <FormLabel value={formData.subject4} onChange={handleChange} required>Subject Studies 4</FormLabel>
//                       <FormControl
//                         required
//                         type="text"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="3" className="validationCustom04">
//                       <FormLabel value={formData.subject5} onChange={handleChange} required>Subject Studies 5</FormLabel>
//                       <FormControl
//                         required
//                         type="text"
//                       />
//                     </FormGroup>
//                   </Row>
//                   <Row className="mb-3">
//                     <FormGroup as={Col} md="3" controlId="validationCustom01">
//                       <FormLabel value={formData.subject6} onChange={handleChange} required>Subject Studies 6</FormLabel>
//                       <FormControl
//                         required
//                         type="text"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="3" controlId="validationCustom02">
//                     </FormGroup>
//                     <FormGroup as={Col} md="3" controlId="validationCustom03">
//                     </FormGroup>
//                     <FormGroup as={Col} md="3" className="validationCustom04">
//                     </FormGroup>
//                   </Row>
//                   <Row className="mb-3">
//                     <FormGroup as={Col} md="6" controlId="validationCustom01">
//                       <FormLabel value={formData.promotion} onChange={handleChange} required>Promotion to the higher class(in figures)</FormLabel>
//                       <FormControl
//                         required
//                         type="number"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="6" controlId="validationCustom02">
//                       <FormLabel value={formData.guide} onChange={handleChange} required>Whether NCC Cadet/ Boy Scout/ Girl Guide(Details may be given)</FormLabel>
//                       <FormControl
//                         required
//                         type="text"
//                       />
//                     </FormGroup>
//                   </Row>
//                   <Row className="mb-3">
//                     <FormGroup as={Col} md="6" controlId="validationCustom01">
//                       <FormLabel value={formData.promotionW} onChange={handleChange} required>Promotion to the higher class(in words)</FormLabel>
//                       <FormControl
//                         required
//                         type="number"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="6" controlId="validationCustom02">
//                       <FormLabel value={formData.games} onChange={handleChange} required>Games played or extra curricular activities in which the pupil usually took part</FormLabel>
//                       <FormControl
//                         required
//                         type="text"
//                       />
//                     </FormGroup>
//                   </Row>
//                   <Row className="mb-3">
//                     <FormGroup as={Col} md="6" controlId="validationCustom01">
//                       <FormLabel value={formData.month} onChange={handleChange} required>Month upto which the pupil has paid school dues</FormLabel>
//                       <FormControl
//                         required
//                         type="number"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="6" controlId="validationCustom02">
//                       <FormLabel value={formData.achievement} onChange={handleChange} required>(mention achievement level therein)</FormLabel>
//                       <FormControl
//                         required
//                         type="text"
//                       />
//                     </FormGroup>
//                   </Row>
//                   <Row className="mb-3">
//                     <FormGroup as={Col} md="6" controlId="validationCustom01">
//                       <FormLabel value={formData.concession} onChange={handleChange} required>Any fee concession availed of : If so, the nature of such concession</FormLabel>
//                       <FormControl
//                         required
//                         type="text"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="6" controlId="validationCustom02">
//                       <FormLabel value={formData.general} onChange={handleChange} required>General conduct</FormLabel>
//                       <FormControl
//                         required
//                         type="text"
//                       />
//                     </FormGroup>
//                   </Row>
//                   <Row className="mb-3">
//                     <FormGroup as={Col} md="6" controlId="validationCustom01">
//                       <FormLabel value={formData.totalWorking} onChange={handleChange} required>Total working days</FormLabel>
//                       <FormControl
//                         required
//                         type="number"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="6" controlId="validationCustom02">
//                       <FormLabel value={formData.application} onChange={handleChange} required>Date of application for certificate</FormLabel>
//                       <FormControl
//                         required
//                         type="date"
//                       />
//                     </FormGroup>
//                   </Row>
//                   <Row className="mb-3">
//                     <FormGroup as={Col} md="6" controlId="validationCustom01">
//                       <FormLabel value={formData.presentWorking} onChange={handleChange} required>Present working days</FormLabel>
//                       <FormControl
//                         required
//                         type="number"
//                       />
//                     </FormGroup>
//                     <FormGroup as={Col} md="6" controlId="validationCustom02">
//                       <FormLabel value={formData.reasonLeave} onChange={handleChange} required>Reason for leaving the school</FormLabel>
//                       <FormControl
//                         required
//                         type="text"
//                       />
//                     </FormGroup>
//                   </Row>
//                   <Row className="mb-3">
//                     <FormGroup as={Col} md="6" controlId="validationCustom01">
//                     </FormGroup>
//                     <FormGroup as={Col} md="6" controlId="validationCustom02">
//                       <FormLabel value={formData.remark} onChange={handleChange} required>Any Other Remarks</FormLabel>
//                       <FormControl
//                         required
//                         type="text"
//                       />
//                     </FormGroup>
//                   </Row>
//                   <Row>
//                     <Col>
//                       <div className='buttons1'>
//                         {/* <Button type="button" id='submit' onClick={togglePreview}>Preview</Button> */}
//                         <Button type="submit" id='submit'>Submit form</Button>
//                       </div>
//                     </Col>
//                   </Row>
//                 </Form>
//               ) : (
//                 <Preview data={formData} onEdit={togglePreview} />
//               )}
//             </Tab>
//           </Tabs>
//         </Col>
//       </Row>
//     </Container>
//   );

// };

// export default dynamic(() => Promise.resolve(transferCertificate), { ssr: false })