"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const YearMasterPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    className: "",
    yearCodeAndName: ""
  });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "Class Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={formData.className}
            onChange={(e) => setFormData({...formData, className: e.target.value})}
          />
        ) : (
          row.className || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Year Code & Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={formData.yearCodeAndName}
            onChange={(e) => setFormData({...formData, yearCodeAndName: e.target.value})}
          />
        ) : (
          row.yearCodeAndName || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <>
              <button
                className="editButton"
                onClick={() => handleUpdate(row._id)}
              >
                <FaSave />
              </button>
              <button
                className="editButton btn-danger"
                onClick={() => handleDelete(row._id)}
              >
                <FaTrashAlt />
              </button>
            </>
          ) : (
            <>
              <button
                className="editButton"
                onClick={() => handleEdit(row)}
              >
                <FaEdit />
              </button>
              <button
                className="editButton btn-danger"
                onClick={() => handleDelete(row._id)}
              >
                <FaTrashAlt />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/classes");
      const fetchedData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
      setData(fetchedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (year) => {
    setEditingId(year._id);
    setFormData({
      className: year.className || "",
      yearCodeAndName: year.yearCodeAndName || ""
    });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/classes/${id}`, {
        className: formData.className,
        yearCodeAndName: formData.yearCodeAndName
      });
      fetchData();
      setEditingId(null);
      setFormData({ className: "", yearCodeAndName: "" });
    } catch (error) {
      console.error("Error updating data:", error);
      setError("Failed to update year. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this year entry?")) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/classes/${id}`, { is_deleted: true });
        fetchData();
      } catch (error) {
        console.error("Error deleting year:", error);
        setError("Failed to delete year. Please try again later.");
      }
    }
  };

  const handleAdd = async () => {
    if (formData.className.trim() && formData.yearCodeAndName.trim()) {
      try {
        const existingYear = data.find(
          (year) => 
            year.className === formData.className && 
            year.yearCodeAndName === formData.yearCodeAndName
        );
        
        if (existingYear) {
          setError("Year entry with this class name and code already exists.");
          return;
        }

        await axios.post("https://erp-backend-fy3n.onrender.com/api/classes", {
          className: formData.className,
          yearCodeAndName: formData.yearCodeAndName
        });
        fetchData();
        setFormData({ className: "", yearCodeAndName: "" });
        setIsPopoverOpen(false);
      } catch (error) {
        console.error("Error adding year:", error);
        setError("Failed to add year. Please try again later.");
      }
    } else {
      alert("Please enter valid class name and year code.");
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Class Name", "Year Code & Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.className || "N/A",
      row.yearCodeAndName || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Class Name", "Year Code & Name"];
    const rows = data.map((row, index) => 
      `${index + 1}\t${row.className || "N/A"}\t${row.yearCodeAndName || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Master Entry", link: "/master-entry/all-module" },
    { label: "year-master", link: "null" },
  ];

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
          <Button
            onClick={() => setIsPopoverOpen(true)}
            className="btn-add"
          >
            <CgAddR /> Add Year
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Year</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setError("");
                    setFormData({ className: "", yearCodeAndName: "" });
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Class Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Class Name"
                      value={formData.className}
                      onChange={(e) =>
                        setFormData({...formData, className: e.target.value})
                      }
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Year Code & Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Year Code & Name"
                      value={formData.yearCodeAndName}
                      onChange={(e) =>
                        setFormData({...formData, yearCodeAndName: e.target.value})
                      }
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Year
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Year Records</h2>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : (
              <Table
                columns={columns}
                data={data}
                handleCopy={handleCopy}
                handlePrint={handlePrint}
              />
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(YearMasterPage), { ssr: false });