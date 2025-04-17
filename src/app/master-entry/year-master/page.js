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
  Alert,
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const YearMasterPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    class: "",
    year_name: ""
  });
  const [classes, setClasses] = useState([]);
  const [classesError, setClassesError] = useState("");
  const [classesLoading, setClassesLoading] = useState(false);

  // Fetch classes when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      setClassesLoading(true);
      try {
        const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-classes");
        
        // Handle different response formats
        let classesData = [];
        if (Array.isArray(response.data)) {
          classesData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          classesData = response.data.data;
        }

        setClasses(classesData);
        setClassesError("");
      } catch (err) {
        console.error("Error fetching classes:", err);
        setClassesError("Failed to fetch classes. Please try again later.");
        setClasses([]);
      } finally {
        setClassesLoading(false);
      }
    };
    fetchClasses();
  }, []);

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
          <Form.Control
            as="select"
            value={formData.class}
            onChange={(e) => setFormData({...formData, class: e.target.value})}
          >
            <option value="">Select Class</option>
            {Array.isArray(classes) && classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.class_name} ({cls.class_code})
              </option>
            ))}
          </Form.Control>
        ) : (
          row.class ? `${row.class.class_name} (${row.class.class_code})` : "N/A"
        ),
      sortable: true,
    },
    {
      name: "Year Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={formData.year_name}
            onChange={(e) => setFormData({...formData, year_name: e.target.value})}
          />
        ) : (
          row.year_name || "N/A"
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
                onClick={() => {
                  setEditingId(null);
                  setFormData({ class: "", year_name: "" });
                  setError("");
                }}
              >
                Cancel
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
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/year/all-year");
      
      // Handle different response formats
      let fetchedData = [];
      if (Array.isArray(response.data)) {
        fetchedData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        fetchedData = response.data.data;
      }

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
      class: year.class?._id || "",
      year_name: year.year_name || ""
    });
    setError("");
    setSuccess("");
  };

  const handleUpdate = async (id) => {
    if (!formData.class.trim()) {
      setError("Please select a class");
      return;
    }
    if (!formData.year_name.trim()) {
      setError("Please enter year name");
      return;
    }

    try {
      const response = await axios.put(`https://erp-backend-fy3n.onrender.com/api/year/update-year/${id}`, {
        class: formData.class,
        year_name: formData.year_name
      });
      
      setSuccess("Year updated successfully");
      setError("");
      fetchData();
      setEditingId(null);
      setFormData({ class: "", year_name: "" });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating data:", error);
      setError(error.response?.data?.message || "Failed to update year. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this year entry?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/year/delete-year/${id}`);
        setSuccess("Year deleted successfully");
        setError("");
        fetchData();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        console.error("Error deleting year:", error);
        setError(error.response?.data?.message || "Failed to delete year. Please try again later.");
      }
    }
  };

  const handleAdd = async () => {
    if (!formData.class.trim()) {
      setError("Please select a class");
      return;
    }
    if (!formData.year_name.trim()) {
      setError("Please enter year name");
      return;
    }

    try {
      const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/year/create-year", {
        class: formData.class,
        year_name: formData.year_name
      });
      
      setSuccess("Year created successfully");
      setError("");
      fetchData();
      setFormData({ class: "", year_name: "" });
      setIsPopoverOpen(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error adding year:", error);
      if (error.response?.data?.error?.code === 11000) {
        setError("A year with this name already exists for the selected class.");
      } else {
        setError(error.response?.data?.message || "Failed to add year. Please try again later.");
      }
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Class Name", "Year Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.class ? `${row.class.class_name} (${row.class.class_code})` : "N/A",
      row.year_name || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Class Name", "Year Name"];
    const rows = data.map((row, index) => 
      `${index + 1}\t${row.class ? `${row.class.class_name} (${row.class.class_code})` : "N/A"}\t${row.year_name || "N/A"}`
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
          {success && (
            <Alert variant="success" onClose={() => setSuccess("")} dismissible>
              {success}
            </Alert>
          )}
          {error && (
            <Alert variant="danger" onClose={() => setError("")} dismissible>
              {error}
            </Alert>
          )}

          <Button
            onClick={() => setIsPopoverOpen(true)}
            className="btn-add mb-3"
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
                    setFormData({ class: "", year_name: "" });
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Class</FormLabel>
                    <Form.Control
                      as="select"
                      value={formData.class}
                      onChange={(e) => setFormData({...formData, class: e.target.value})}
                      disabled={classesLoading}
                    >
                      <option value="">Select Class</option>
                      {Array.isArray(classes) && classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                          {cls.class_name} ({cls.class_code})
                        </option>
                      ))}
                    </Form.Control>
                    {classesLoading && <small>Loading classes...</small>}
                    {classesError && <small className="text-danger">{classesError}</small>}
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Year Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Year Name"
                      value={formData.year_name}
                      onChange={(e) =>
                        setFormData({...formData, year_name: e.target.value})
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