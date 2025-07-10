"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb } from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { addNewClass, addNewSection, deleteClassById, deleteSectionById, getAllSections, getClasses, updateClassById, updateSectionById } from "@/Services";
import { toast } from "react-toastify";
import useSessionId from "@/hooks/useSessionId";
import usePagePermission from "@/hooks/usePagePermission";

const ClassMasterPage = () => {
  const selectedSessionId = useSessionId();
  const { hasSubmitAccess, hasEditAccess } = usePagePermission()

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isClassFormOpen, setIsClassFormOpen] = useState(false);
  const [isSectionFormOpen, setIsSectionFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    class_name: "",
    class_code: "",
    section_name: "",
    section_code: "",
    class_id: ""
  });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Class Name",
      selector: (row) => row.class_name,
      cell: (row) => (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div>
            {editingClass && editingClass._id === row._id ? (
              <FormControl
                type="text"
                value={formData.class_name}
                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
              />
            ) : (
              row.class_name || "N/A"
            )}
          </div>
          {
            hasEditAccess && (
              <div>
                {editingClass && editingClass._id === row._id ? (
                  <button className="editButton ms-2" onClick={() => handleUpdateClass(row._id)}>
                    <FaSave />
                  </button>
                ) : (
                  <button className="editButton ms-2" onClick={() => handleEditClass(row)}>
                    <FaEdit />
                  </button>
                )}
                <button className="editButton btn-danger ms-2" onClick={() => handleDeleteClass(row._id)}>
                  <FaTrashAlt />
                </button>
              </div>
            )
          }
        </div>
      ),
      sortable: true,
    },
    {
      name: "Class Code",
      cell: (row) => (
        <div>
          {editingClass && editingClass._id === row._id ? (
            <FormControl
              type="text"
              value={formData.class_code}
              onChange={(e) => setFormData({ ...formData, class_code: e.target.value })}
            />
          ) : (
            row.class_code || "N/A"
          )}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Sections",
      cell: (row) => (
        <div className="classSpace">
          {row.sections.length > 0 ? (
            row.sections.map((section, index) => (
              <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  {editingSection && editingSection._id === section._id ? (
                    <>
                      <FormControl
                        type="text"
                        value={formData.section_code}
                        onChange={(e) => setFormData({ ...formData, section_code: e.target.value })}
                      />
                      <FormControl
                        type="text"
                        value={formData.section_name}
                        onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
                      />
                    </>
                  ) : (
                    `${section.section_code} - ${section.section_name}`
                  )}
                </div>
                {
                  hasEditAccess && (
                    <div>
                      {editingSection && editingSection._id === section._id ? (
                        <button className="editButton ms-2" onClick={() => handleUpdateSection(section._id)}>
                          <FaSave />
                        </button>
                      ) : (
                        <button className="editButton ms-2" onClick={() => handleEditSection(section)}>
                          <FaEdit />
                        </button>
                      )}
                      <button className="editButton btn-danger ms-2" onClick={() => handleDeleteSection(section._id)}>
                        <FaTrashAlt />
                      </button>
                    </div>
                  )
                }
              </div>
            ))
          ) : (
            "No sections"
          )}
        </div>
      ),
      sortable: false,
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const classResponse = await getClasses()
      const classes = classResponse.data;

      const sectionResponse = await getAllSections()
      const sections = sectionResponse.data;

      const updatedData = classes.map((classItem) => {
        const classSections = sections
          .filter((section) => section.class && section.class._id === classItem._id)
          .map((section) => ({
            section_name: section.section_name,
            section_code: section.section_code,
            _id: section._id,
          }));

        return { ...classItem, sections: classSections };
      });

      setData(updatedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };


  const handleAddClass = async () => {
    if (!formData.class_name.trim() || !formData.class_code.trim()) {
      setError("Both class name and code are required");
      toast.warn("Please fill all required fields!");
      return;
    }

    try {
      const response = await addNewClass({
        class_name: formData.class_name,
        class_code: formData.class_code,
      })
      toast.success("Class added successfully!")
      fetchData();
      setFormData({ ...formData, class_name: "", class_code: "" });
      setIsClassFormOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add new class:");
      console.error("Error adding class:", err);
      setError("Failed to add class. Please try again later.");
    }
  };

  const handleAddSection = async () => {
    if (!formData.class_id || !formData.section_name.trim() || !formData.section_code.trim()) {
      setError("Class, section name and code are required");
      toast.warn("Please fill all required fields");
      return;
    }

    try {
      const res = await addNewSection({
        class_name: formData.class_id,
        section_name: formData.section_name,
        section_code: formData.section_code,
      })
      toast.success("Section added successfully!")
      fetchData();
      setFormData({ ...formData, section_name: "", section_code: "", class_id: "" });
      setIsSectionFormOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "failed to add new section:");
      console.error("Error adding section:", err);
      setError("Failed to add section. Please try again later.");
    }
  };

  const handleEditClass = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      ...formData,
      class_name: classItem.class_name || "",
      class_code: classItem.class_code || ""
    });
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setFormData({
      ...formData,
      section_name: section.section_name || "",
      section_code: section.section_code || ""
    });
  };

  const handleUpdateClass = async (id) => {
    if (!formData.class_name.trim() || !formData.class_code.trim()) {
      setError("Both class name and code are required");
      toast.warn("fill required fileds first!");
      return;
    }

    try {
      const res = await updateClassById(id, {
        class_name: formData.class_name,
        class_code: formData.class_code,
      })
      toast.success("Class updated successfully!")
      fetchData();
      setEditingClass(null);
      setFormData({ ...formData, class_name: "", class_code: "" });
    } catch (err) {
      console.error("Error updating class:", err);
      toast.error(err?.response?.data?.message || "Failed to update class:");
      setError("Failed to update class. Please try again later.");
    }
  };

  const handleUpdateSection = async (id) => {
    if (!formData.section_name.trim() || !formData.section_code.trim()) {
      setError("Both section name and code are required");
      toast.warn("fill required fileds first!");
      return;
    }

    try {
      const res = await updateSectionById(id, {
        section_name: formData.section_name,
        section_code: formData.section_code,
      })
      toast.success("Section updated successfully!")
      fetchData();
      setEditingSection(null);
      setFormData({ ...formData, section_name: "", section_code: "" });
    } catch (err) {
      console.error("Error updating section:", err);
      toast.error(err?.response?.data?.message || "Failed to update section:");
      setError("Failed to update section. Please try again later.");
    }
  };

  const handleDeleteClass = async (id) => {
    if (confirm("Are you sure you want to delete this class and all its sections?")) {
      try {
        const res = await deleteClassById(id)
        toast.success("Class deleted successfully!")
        fetchData();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to delete class:");
        console.error("Error deleting class:", err);
        setError("Failed to delete class. Please try again later.");
      }
    }
  };

  const handleDeleteSection = async (id) => {
    if (confirm("Are you sure you want to delete this section?")) {
      try {
        await deleteSectionById(id);
        toast.success("Section deleted successfully!")
        fetchData();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to delete section");
        console.error("Error deleting section:", err);
        setError("Failed to delete section. Please try again later.");
      }
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Class Name", "Class Code", "Sections"]];
    const tableRows = data.map((row, index) => {
      const sections = row.sections
        .map((section) => `${section.section_code} - ${section.section_name}`)
        .join(", ");
      return [index + 1, row.class_name || "N/A", row.class_code || "N/A", sections || "No sections"];
    });
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Class Name", "Class Code", "Sections"];
    const rows = data.map((row, index) => {
      const sections = row.sections
        .map((section) => `${section.section_code} - ${section.section_name}`);
      return `${index + 1}\t${row.class_name || "N/A"}\t${row.class_code || "N/A"}\t${sections || "No sections"}`;
    });
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, [selectedSessionId]);

  const breadcrumbItems = [
    { label: "Master Entry", link: "/master-entry/all-module" },
    { label: "class-master", link: "null" }
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
          {
            hasSubmitAccess && (
              <div className="d-flex gap-2 mb-3">
                <Button
                  onClick={() => setIsClassFormOpen(true)}
                  className="btn-add"
                >
                  <CgAddR /> Add Class
                </Button>
                <Button
                  onClick={() => setIsSectionFormOpen(true)}
                  className="btn-add"
                >
                  <CgAddR /> Add Section
                </Button>
              </div>
            )
          }

          {isClassFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{editingClass ? "Update Class" : "Add New Class"}</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsClassFormOpen(false);
                    setError("");
                    setFormData({ ...formData, class_name: "", class_code: "" });
                    setEditingClass(null);
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Class Name<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Class Name"
                      value={formData.class_name}
                      onChange={(e) =>
                        setFormData({ ...formData, class_name: e.target.value })
                      }
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Class Code<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Class Code"
                      value={formData.class_code}
                      onChange={(e) =>
                        setFormData({ ...formData, class_code: e.target.value })
                      }
                    />
                  </Col>
                </Row>
                {error && <div className="text-danger mb-3">{error}</div>}
                <Button
                  onClick={editingClass ? () => handleUpdateClass(editingClass._id) : handleAddClass}
                  className="btn btn-primary"
                >
                  {editingClass ? "Update Class" : "Add Class"}
                </Button>
              </Form>
            </div>
          )}

          {isSectionFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{editingSection ? "Update Section" : "Add New Section"}</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsSectionFormOpen(false);
                    setError("");
                    setFormData({ ...formData, section_name: "", section_code: "", class_id: "" });
                    setEditingSection(null);
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={12}>
                    <FormLabel className="labelForm">Select Class<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      as="select"
                      value={formData.class_id}
                      onChange={(e) =>
                        setFormData({ ...formData, class_id: e.target.value })
                      }
                    >
                      <option value="">Select Class</option>
                      {data.map((classItem) => (
                        <option key={classItem._id} value={classItem._id}>
                          {classItem.class_name}
                        </option>
                      ))}
                    </FormControl>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Section Code<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Section Code"
                      value={formData.section_code}
                      onChange={(e) =>
                        setFormData({ ...formData, section_code: e.target.value })
                      }
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Section Name<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Section Name"
                      value={formData.section_name}
                      onChange={(e) =>
                        setFormData({ ...formData, section_name: e.target.value })
                      }
                    />
                  </Col>
                </Row>
                {error && <div className="text-danger mb-3">{error}</div>}
                <Button
                  onClick={editingSection ? () => handleUpdateSection(editingSection._id) : handleAddSection}
                  className="btn btn-primary"
                >
                  {editingSection ? "Update Section" : "Add Section"}
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Class Records</h2>
            {loading ? (
              <p>Loading...</p>
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

export default dynamic(() => Promise.resolve(ClassMasterPage), { ssr: false });