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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    class: "",
    year_name: ""
  });
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);

  // Fetch classes when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      setClassesLoading(true);
      try {
        const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-classes");
        
        let classesData = [];
        if (Array.isArray(response.data)) {
          classesData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          classesData = response.data.data;
        }

        setClasses(classesData);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setClasses([]);
      } finally {
        setClassesLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // Group data by class with multiple year names
  const groupedData = data.reduce((acc, item) => {
    const classId = item.class?._id;
    if (!classId) return acc;
    
    const existingClass = acc.find(x => x.class?._id === classId);
    if (existingClass) {
      if (!existingClass.year_names.includes(item.year_name)) {
        existingClass.year_names.push(item.year_name);
      }
    } else {
      acc.push({
        ...item,
        year_names: [item.year_name]
      });
    }
    return acc;
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
        row.class
          ? `${row.class.class_name} (${row.class.class_code})`
          : "N/A",
      sortable: true,
    },
    {
      name: "Year Names",
      cell: (row) => (
        <div className="d-flex flex-column gap-2">
          {row.year_names.map((yearName, idx) => (
            <div key={idx} className="d-flex justify-content-between align-items-center">
              <span>{yearName}</span>
              <div className="d-flex gap-1">
                <button
                  className="editButton"
                  onClick={() => handleEdit({ ...row, year_name: yearName })}
                >
                  <FaEdit />
                </button>
                <button
                  className="editButton btn-danger"
                  onClick={() => {
                    const matching = data.find(
                      (item) =>
                        item.class?._id === row.class?._id &&
                        item.year_name === yearName
                    );
                    if (matching) handleDelete(matching._id);
                  }}
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))}
        </div>
      ),
      sortable: false,
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/year/all-year");
      
      let fetchedData = [];
      if (Array.isArray(response.data)) {
        fetchedData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        fetchedData = response.data.data;
      }

      setData(fetchedData);
    } catch (err) {
      console.error("Error fetching data:", err);
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
    setIsPopoverOpen(true);
  };

  const handleUpdate = async (id) => {
    if (!formData.class.trim() || !formData.year_name.trim()) return;

    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/year/update-year/${id}`, {
        class: formData.class,
        year_name: formData.year_name
      });
      
      fetchData();
      setEditingId(null);
      setFormData({ class: "", year_name: "" });
      setIsPopoverOpen(false);
    } catch (error) {
      console.error("Error updating data:", error);
      if (error.response?.data?.error?.code === 11000) {
        alert("A year with this name already exists for the selected class.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this year entry?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/year/delete-year/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting year:", error);
      }
    }
  };

  const handleAdd = async () => {
    if (!formData.class.trim() || !formData.year_name.trim()) return;

    try {
      // Check if year already exists for this class
      const exists = data.some(item => 
        item.class?._id === formData.class && 
        item.year_name === formData.year_name
      );
      
      if (exists) {
        alert("This year already exists for the selected class.");
        return;
      }

      await axios.post("https://erp-backend-fy3n.onrender.com/api/year/create-year", {
        class: formData.class,
        year_name: formData.year_name
      });
      
      fetchData();
      setFormData({ class: "", year_name: "" });
      setIsPopoverOpen(false);
    } catch (error) {
      console.error("Error adding year:", error);
      if (error.response?.data?.error?.code === 11000) {
        alert("This year already exists for the selected class.");
      }
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Class Name", "Year Names"]];
    const tableRows = groupedData.map((row, index) => [
      index + 1,
      row.class ? `${row.class.class_name} (${row.class.class_code})` : "N/A",
      row.year_names.join(", "),
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Class Name", "Year Names"];
    const rows = groupedData.map((row, index) => 
      `${index + 1}\t${row.class ? `${row.class.class_name} (${row.class.class_code})` : "N/A"}\t${row.year_names.join(", ")}`
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
            onClick={() => {
              setIsPopoverOpen(true);
              setEditingId(null);
              setFormData({ class: "", year_name: "" });
            }}
            className="btn-add mb-3"
          >
            <CgAddR /> {editingId ? "Edit Year" : "Add Year"}
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{editingId ? "Edit Year" : "Add New Year"}</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setFormData({ class: "", year_name: "" });
                    setEditingId(null);
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
                <Button 
                  onClick={editingId ? () => handleUpdate(editingId) : handleAdd} 
                  className="btn btn-primary"
                >
                  {editingId ? "Update Year" : "Add Year"}
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Year Records</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Table
                columns={columns}
                data={groupedData}
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