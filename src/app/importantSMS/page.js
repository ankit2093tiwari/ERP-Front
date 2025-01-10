"use client";
import React from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormSelect, FormControl, Button } from "react-bootstrap";
import { CgAddR } from 'react-icons/cg';

const ImportantSMS = () => {
     const columns = [
        {
          name: "#",
          selector: (row) => row.id,
          sortable: true,
          width: "80px",
        },
        {
          name: "Entry Date",
          selector: (row) => row.entryDate,
          sortable: false,
        },
        {
            name: "Send By",
            selector: (row) => row.sendBy,
            sortable: false,
          },
          {
            name: "Send To",
            selector: (row) => row.sendTo,
            sortable: false,
          },
          {
            name: "Details",
            selector: (row) => row.detail,
            sortable: false,
          },
          {
            name: "Status",
            selector: (row) => row.status,
            sortable: false,
          },
        
      ];
    
      const data = [
        {
          id: 1, 
          entryDate:'',
          sendBy:'',
          sendTo:'',
          detail:'',
          status:'',
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
          <h2 style={{ fontSize: '22px' }}>Important SMS Details</h2>
          <Table columns={columns} data={data} />
          
        </Col>
      </Row>
    </Form>
  </Container>
  )
}

export default dynamic(() => Promise.resolve(ImportantSMS), { ssr: false })