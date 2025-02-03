"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
  FormSelect,
} from "react-bootstrap";
import axios from "axios";

const FeeGroup = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFeeGroup, setNewFeeGroup] = useState({
    group_name: "",
    class_name: "",
    section_name: "",
    late_fine_per_day: "",
  });
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Group Name",
      selector: (row) => row.group_name || "N/A",
      sortable: true,
    },
    {
      name: "Class Name",
      selector: (row) => row.class_name?.class_name || "N/A",
      sortable: true,
    },
    {
      name: "Section Name",
      selector: (row) => row.section_name?.section_name || "N/A",
      sortable: true,
    },
    {
      name: "Late Fine Per Day",
      selector: (row) => row.late_fine_per_day || "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button>
          <button
            className="editButton btn-danger"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/fee-groups/fetch");
      if (response.data && response.data.feeGroups.length > 0) {
        setData(response.data.feeGroups);
      } else {
        setData([]); 
        setError("No fee groups found.");
      }
    } catch (err) {
      setData([]); 
      setError("Failed to fetch fee groups.");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/class/fetch");
      const resp = response.data;
      setClassList(resp.data || []);
    
    } catch (err) {
      setError("Failed to fetch classes.");
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/sections/class/${classId}`);

      setSectionList(response.data || []);
      console.log('testddddddddd',response.data)
    } catch (err) {
      setError("Failed to fetch sections.");
    }
  };

  const handleAdd = async () => {
    if (
      newFeeGroup.group_name.trim() &&
      newFeeGroup.class_name &&
      newFeeGroup.section_name &&
      newFeeGroup.late_fine_per_day.trim()
    ) {
      try {
        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/fee-groups/create", newFeeGroup);
        setData((prevData) => [...prevData, response.data.feeGroup]);
        setNewFeeGroup({
          group_name: "",
          class_name: "",
          section_name: "",
          late_fine_per_day: "",
        });
        setShowAddForm(false);
        fetchData(); 
      } catch (err) {
        setError("Failed to add fee group.");
      }
    } else {
      alert("All fields are required.");
    }
  };

  const handleEdit = async (id) => {
    const feeGroup = data.find((row) => row._id === id);
    const updatedGroupName = prompt("Enter new Group Name:", feeGroup?.group_name || "");
    const updatedClassName = prompt("Enter new Class Name:", feeGroup?.class_name?.class_name || "");
    const updatedSectionName = prompt("Enter new Section Name:", feeGroup?.section_name?.section_name || "");
    const updatedLateFine = prompt("Enter new Late Fine Per Day:", feeGroup?.late_fine_per_day || "");

    if (updatedGroupName && updatedClassName && updatedSectionName && updatedLateFine) {
      try {
        await axios.put(
          `https://erp-backend-fy3n.onrender.com/api/fee-groups/update/${id}`,
          { group_name: updatedGroupName, class_name: updatedClassName, section_name: updatedSectionName, late_fine_per_day: updatedLateFine }
        );
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, group_name: updatedGroupName, class_name: updatedClassName, section_name: updatedSectionName, late_fine_per_day: updatedLateFine } : row
          )
        );
      } catch (err) {
        setError("Failed to update fee group.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this fee group?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/fee-groups/delete/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (err) {
        setError("Failed to delete fee group.");
      }
    }
  };

  useEffect(() => {
    fetchData();
    fetchClasses();
  }, []);

  return (
    <Container className={styles.formContainer}>
      <Form className={styles.form}>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`mb-4 ${styles.search}`}
        >
          Add Fee Group
        </Button>
        {showAddForm && (
          <div className="mb-4">
            <Row>
              <Col lg={6}>
                <FormLabel>Group Name</FormLabel>
                <FormControl
                  type="text"
                  value={newFeeGroup.group_name}
                  onChange={(e) =>
                    setNewFeeGroup({ ...newFeeGroup, group_name: e.target.value })
                  }
                />
              </Col>
              <Col lg={6}>
                <FormLabel>Class Name</FormLabel>
                <FormSelect
                  value={newFeeGroup.class_name}
                  onChange={(e) => {
                    setNewFeeGroup({ ...newFeeGroup, class_name: e.target.value });
                    fetchSections(e.target.value); // Fetch sections on class change
                  }}
                >
                  <option value="">Select Class</option>
                  {classList.length > 0 && classList.map((classItem) => (
                    <option key={classItem._id} value={classItem._id}>
                      {classItem.class_name}
                    </option>
                  ))}
                </FormSelect>
              </Col>
              <Col lg={6}>
                <FormLabel>Section Name</FormLabel>
                <FormSelect
                  value={newFeeGroup.section_name}
                  onChange={(e) =>
                    setNewFeeGroup({ ...newFeeGroup, section_name: e.target.value })
                  }
                >
                  <option value="">Select Section</option>
                  {sectionList?.sections?.length > 0 && sectionList?.sections?.map((sectionItem) => (
                    <option key={sectionItem._id} value={sectionItem._id}>
                      {sectionItem.section_name}
                    </option>
                  ))}
                </FormSelect>
              </Col>
              <Col lg={6}>
                <FormLabel>Late Fine Per Day</FormLabel>
                <FormControl
                  type="text"
                  value={newFeeGroup.late_fine_per_day}
                  onChange={(e) =>
                    setNewFeeGroup({ ...newFeeGroup, late_fine_per_day: e.target.value })
                  }
                />
              </Col>
            </Row>
            <Button onClick={handleAdd} className={styles.search}>
              Add Fee Group
            </Button>
          </div>
        )}
        <h2>Fee Group Records</h2>
        {error && <p>{error}</p>}
        {!loading && !error && data.length === 0 && <p>No records found.</p>}
        {!loading && !error && data.length > 0 && <Table columns={columns} data={data} />}
      </Form>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(FeeGroup), { ssr: false });
