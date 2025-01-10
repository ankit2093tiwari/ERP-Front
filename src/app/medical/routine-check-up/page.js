"use client";
import React from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormSelect, FormControl, Button } from "react-bootstrap";

const RoutineCheckUp = () => {
  const columns = [
    {
      name: "#",
      selector: (row) => row.id,
      sortable: true,
      width: "80px",
    },
    {
      name: "Date",
      selector: (row) => (
        <div>
          {row.appoints.map((appoint, index) => (
            <div key={index}>
              {appoint.date}<br />{appoint.time}
            </div>
          ))}
        </div>
      ),
      sortable: false,
    },
    {
      name: "Doctor Name",
      selector: (row) => (
        <div>
          {row.doctors.map((doctor, index) => (
            <div key={index}>
              {doctor.name}<br />{doctor.designation}
            </div>
          ))}
        </div>
      ),
      sortable: false,
    },
    {
      name: "Checkup For",
      selector: (row) => row.checkupFor,
      sortable: true,
    },
    {
      name: "Personal Detail",
      selector: (row) => (
        <div>
          {row.personalDetail.map((person, index) => (
            <div key={index}>
              {person.name}<br />{person.designation}
            </div>
          ))}
        </div>
      ),
      sortable: false,
    },
    {
      name: "Remarks",
      selector: (row) => row.remarks,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="twobuttons d-flex">
         
          <button
            className="editButton btn-danger"
            onClick={() => handleDelete(row.id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const data = [
    {
      id: 1,
      appoints: [{ date: "07-11-2024", time: "02:31:24" }],
      doctors: [{ name: "Ravi Kishan", designation: "Specialist Of-test2 ok" }],
      checkupFor: 'staff',
      personalDetail: [{ name: "RIZWANA KHAN", designation: "Teaching" }],
      remarks: 'test',
    },
    {
      id: 2,
      appoints: [{ date: "07-11-2024", time: "02:31:24" }],
      doctors: [{ name: "Ravi Kishan2", designation: "Specialist Of-test2 ok" }],
      checkupFor: 'staff',
      personalDetail: [{ name: "RIZWANA KHAN", designation: "Teaching" }],
      remarks: 'demo2',
    },
  ];

  const handleDelete = (row) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      setData((prevData) => prevData.filter((item) => item.id !== row.id));
    }
  };
  const [showResults, setShowResults] = React.useState(false)
  const onClick = () => setShowResults(true)
  return (
    <Container className={styles.formContainer}>
      <Form className={styles.form}>
        <button onClick={onClick} className={`mb-4 ${styles.search}`}> Add Routine Check up  </button>
        { showResults ?
        <div className="result">
          <Row className="mb-3">
            <Col lg={6}>
              <FormLabel className={styles.class}>Today Date</FormLabel>
              <FormControl required type="date" placeholder="Today Date" readOnly />
            </Col>
            <Col lg={6}>
              <FormLabel className={styles.class}>Form No.</FormLabel>
              <FormControl required type="text" value="14" readOnly />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col lg={6}>
              <FormLabel className={styles.class}>Doctor</FormLabel>
              <FormSelect>
                <option>Select</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </FormSelect>
            </Col>
            <Col lg={6}>
              <FormLabel className={styles.class}>Remarks</FormLabel>
              <Form.Control as="textarea" rows={2} />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col lg={6}>
              <FormLabel className={styles.class}>Check-Up For</FormLabel>
              <FormSelect>
                <option>Select</option>
                <option value="1">Staff</option>
                <option value="2">Student</option>
              </FormSelect>
            </Col>
          </Row><br />
          <Row className="mb-3">
            <Col><Button className={styles.search}>Routine Check up</Button></Col>
          </Row>
        </div>
        : null }
        <br />
        <Row>
          <Col>
            <h2 style={{ fontSize: '22px' }}>Routine Check Up Records</h2>
            <Table columns={columns} data={data} />
            
          </Col>
        </Row>
      </Form>
    </Container>

  )
}

// export default routineCheckUp
export default dynamic(() => Promise.resolve(RoutineCheckUp), { ssr: false })