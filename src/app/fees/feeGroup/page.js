"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave, FaPrint, FaCopy } from "react-icons/fa";
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

import "jspdf-autotable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";

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
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Group Name",
      selector: (row) =>
        editId === row._id ? (
          <FormControl
            type="text"
            value={editData.group_name}
            onChange={(e) =>
              setEditData({ ...editData, group_name: e.target.value })
            }
          />
        ) : (
          row.group_name || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Late Fine Per Day",
      selector: (row) =>
        editId === row._id ? (
          <FormControl
            type="text"
            value={editData.late_fine_per_day}
            onChange={(e) =>
              setEditData({ ...editData, late_fine_per_day: e.target.value })
            }
          />
        ) : (
          row.late_fine_per_day || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editId === row._id ? (
            <button className="editButton" onClick={() => handleSave(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button className="editButton" onClick={() => handleEdit(row)}>
              <FaEdit />
            </button>
          )}
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



  const handlePrint = () => {
    const tableHeaders = [["#", "Group Name", "Late Fine Per Day"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.group_name || "N/A",
      row.late_fine_per_day || "N/A",
    ]);

    printContent(tableHeaders, tableRows);

  };

  const handleCopy = () => {
    const headers = ["#", "Group Name", "Late Fine Per Day"];
    const rows = data.map((row, index) => `${index + 1}\t${row.group_name || "N/A"}\t${row.late_fine_per_day || "N/A"}`);

    copyContent(headers, rows);
  };



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
          fetchData();
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

  const handleEdit = (row) => {
    setEditId(row._id);
    setEditData({
      group_name: row.group_name,
      late_fine_per_day: row.late_fine_per_day,
    });
  };

  const handleSave = async (id) => {
    try {
      const response = await axios.put(
        `https://erp-backend-fy3n.onrender.com/api/update-fee-groups/${id}`,
        editData
      );
      if (response.data && response.data.success) {
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, ...editData } : row
          )
        );
        fetchData();
        setEditId(null);
      } else {
        setError("Failed to update fee group.");
      }
    } catch (err) {
      setError("Failed to update fee group.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this fee group?")) {
      try {
        const response = await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-fee-groups/${id}`);
        if (response.data && response.data.success) {
          setData((prevData) => prevData.filter((row) => row._id !== id));
          fetchData();
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

  const breadcrumbItems = [{ label: "Fee", link: "/fees/all-module" }, { label: "fee-Group", link: "null" }]

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

          <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
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
                    <FormLabel className="labelForm">Group Name</FormLabel>
                    <FormControl
                      type="text"
                      value={newFeeGroup.group_name}
                      onChange={(e) =>
                        setNewFeeGroup({ ...newFeeGroup, group_name: e.target.value })
                      }
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Class Name</FormLabel>
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
                    <FormLabel className="labelForm">Section Name</FormLabel>
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
                    <FormLabel className="labelForm">Late Fine Per Day</FormLabel>
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
            {!loading && !error && (
              <Table
                columns={columns}
                data={data}
                handlePrint={handlePrint}
                handleCopy={handleCopy}
              />
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(FeeGroup), { ssr: false });