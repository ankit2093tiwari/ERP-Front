"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
  Breadcrumb,
  FormSelect,
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import styles from "@/app/medical/routine-check-up/page.module.css";

const FeeGroup = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newFeeGroup, setNewFeeGroup] = useState({
    group_name: "",
    class_name: "",
    section_name: "",
    late_fine_per_day: "",
  });
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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
    // {
    //   name: "Class Name",
    //   selector: (row) => row.class_name?.class_name || "N/A",
    //   sortable: true,
    // },
    // {
    //   name: "Section Name",
    //   selector: (row) => row.section_name?.section_name || "N/A",
    //   sortable: true,
    // },
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
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-fee-groups");
      if (response.data && response.data.success) {
        setData(response.data.data);
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
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-classes");
      setClassList(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch classes.");
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/sections/class/${classId}`);
      setSectionList(response.data.data || []);
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
        // Check if the fee group already exists
        const existingFeeGroup = data.find(
          (row) => row.group_name === newFeeGroup.group_name
        );
        if (existingFeeGroup) {
          alert("Fee group name already exists.");
          return;
        }

        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/add-fee-groups", newFeeGroup);
        if (response.data && response.data.success) {
          setData((prevData) => [...prevData, response.data.data]);
          setNewFeeGroup({
            group_name: "",
            class_name: "",
            section_name: "",
            late_fine_per_day: "",
          });
          setIsPopoverOpen(false);
          fetchData(); // Refresh data after adding
        } else {
          setError("Failed to add fee group.");
        }
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
    // const updatedClassName = prompt("Enter new Class Name:", feeGroup?.class_name?.class_name || "");
    // const updatedSectionName = prompt("Enter new Section Name:", feeGroup?.section_name?.section_name || "");
    const updatedLateFine = prompt("Enter new Late Fine Per Day:", feeGroup?.late_fine_per_day || "");

    if (updatedGroupName && updatedLateFine) {
      try {
        const response = await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-fee-groups/${id}`, {
          group_name: updatedGroupName,
          // class_name: updatedClassName,
          // section_name: updatedSectionName,
          late_fine_per_day: updatedLateFine,
        });
        if (response.data && response.data.success) {
          setData((prevData) =>
            prevData.map((row) =>
              row._id === id
                ? { ...row, group_name: updatedGroupName, late_fine_per_day: updatedLateFine }
                : row
            )
          );
        } else {
          setError("Failed to update fee group.");
        }
      } catch (err) {
        setError("Failed to update fee group.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this fee group?")) {
      try {
        const response = await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-fee-groups/${id}`);
        if (response.data && response.data.success) {
          setData((prevData) => prevData.filter((row) => row._id !== id));
        } else {
          setError("Failed to delete fee group.");
        }
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
    <Container className="">
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/fee-groups">Fee Groups</Breadcrumb.Item>
            <Breadcrumb.Item active>Manage Fee Groups</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <Button onClick={() => setIsPopoverOpen(true)} className="btn btn-primary">
        <CgAddR /> Add Fee Group
      </Button>

      {isPopoverOpen && (
        <div className="cover-sheet">
          <div className="studentHeading">
            <h2>Add New Fee Group</h2>
            <button className="closeForm" onClick={() => setIsPopoverOpen(false)}>
              X
            </button>
          </div>
          <Form className="formSheet">
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
                    fetchSections(e.target.value);
                  }}
                >
                  <option value="">Select Class</option>
                  {classList.map((classItem) => (
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
                  {sectionList.map((sectionItem) => (
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
            <Button onClick={handleAdd} className="btn btn-primary">
              Add Fee Group
            </Button>
          </Form>
        </div>
      )}

      <div className="tableSheet">
        <h2>Fee Group Records</h2>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && <Table columns={columns} data={data} />}
      </div>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(FeeGroup), { ssr: false });