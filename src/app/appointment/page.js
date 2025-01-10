"use client";
import React from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormSelect, FormControl, Button } from "react-bootstrap";
import { CgAddR } from 'react-icons/cg';

const Appointment = () => {
     const columns = [
        {
          name: "#",
          selector: (row) => row.id,
          sortable: true,
          width: "80px",
        },
        {
          name: "Student",
          selector: (row) => row.student,
          sortable: false,
        },
        {
            name: "Class",
            selector: (row) => row.class,
            sortable: false,
          },
          {
            name: "Personal Name",
            selector: (row) => row.personalName,
            sortable: false,
          },
          {
            name: "Whom to Meet",
            selector: (row) => row.whomeToMeet,
            sortable: false,
          },
          {
            name: "Time Duration",
            selector: (row) => row.timeDuration,
            sortable: false,
          },
          {
            name: "Action",
            selector: (row) => row.action,
            sortable: false,
          },
          {
            name: "Email Id",
            selector: (row) => row.emailId,
            sortable: false,
          },
          {
            name: "Purpose",
            selector: (row) => row.purpose,
            sortable: false,
          },
          {
            name: "Remark",
            selector: (row) => row.remark,
            sortable: false,
          },

      ];
    
      const data = [
        {
          id: 1,
          student: "",
          class:'',
          personalName: "",
          whomeToMeet:'',
          timeDuration:'',
          action:'',
          emailId:'',
          purpose:'',
          remark:'',
        },
        
      ];
      const handleEdit = (id) => {
        const item = data.find((row) => row.id === id);
        const updatedName = prompt("Enter new name:", item.name);
      
        try {
          const parsedSections = JSON.parse(updatedSection);
          setData((prevData) =>
            prevData.map((row) =>
              row.id === id
                ? { ...row, name: updatedName }
                : row
            )
          );
        } catch (error) {
          alert("Invalid JSON for sections. Please try again.");
        }
      };
      const handleDelete = (row) => {
        if (confirm("Are you sure you want to delete this entry?")) {
          setData((prevData) => prevData.filter((item) => item.id !== row.id));
        }
      };
     
  
  

  return (
    <Container className={styles.formContainer}>
    <Form className={styles.form}>
      <Row>
        <Col>
          <h2 style={{ fontSize: '22px' }}>Appointment Records</h2>
          <Table columns={columns} data={data} />
          
        </Col>
      </Row>
    </Form>
  </Container>
  )
}

export default dynamic(() => Promise.resolve(Appointment), { ssr: false })