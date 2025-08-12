"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import {
  addNewClass,
  addNewSection,
  deleteClassById,
  deleteSectionById,
  getAllSections,
  getClasses,
  updateClassById,
  updateSectionById,
} from "@/Services";
import { toast } from "react-toastify";
import useSessionId from "@/hooks/useSessionId";
import usePagePermission from "@/hooks/usePagePermission";

const ClassMasterPage = () => {
  const selectedSessionId = useSessionId();
  const { hasSubmitAccess, hasEditAccess } = usePagePermission();

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
    class_id: "",
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div>{row.class_name || "N/A"}</div>
          {hasEditAccess && (
            <div>
              <Button
                size="sm"
                variant="success"
                className="me-1"
                onClick={() => handleEditClass(row)}
              >
                <FaEdit />
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleDeleteClass(row._id)}
              >
                <FaTrashAlt />
              </Button>
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Class Code",
      selector: (row) => row.class_code || "N/A",
      sortable: true,
    },
    {
      name: "Sections",
      cell: (row) => (
        <div className="classSpace">
          {row.sections.length > 0
            ? row.sections.map((section, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  {section.section_code} - {section.section_name}
                </div>
                {hasEditAccess && (
                  <div className="mb-2">
                    <Button
                      size="sm"
                      variant="success"
                      className="mx-1"
                      onClick={() => handleEditSection(section)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteSection(section._id)}
                    >
                      <FaTrashAlt />
                    </Button>
                  </div>
                )}
              </div>
            ))
            : "No sections"}
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const classResponse = await getClasses();
      const classes = classResponse.data;

      const sectionResponse = await getAllSections();
      const sections = sectionResponse.data;

      const updatedData = classes.map((classItem) => {
        const classSections = sections
          .filter((section) => section.class && section.class._id === classItem._id)
          .map((section) => ({
            section_name: section.section_name,
            section_code: section.section_code,
            _id: section._id,
            class: section.class,
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
      await addNewClass({
        class_name: formData.class_name,
        class_code: formData.class_code,
      });
      toast.success("Class added successfully!");
      fetchData();
      setFormData({ ...formData, class_name: "", class_code: "" });
      setIsClassFormOpen(false);
      setEditingClass(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add new class");
    }
  };

  const handleAddSection = async () => {
    if (!formData.class_id || !formData.section_name.trim() || !formData.section_code.trim()) {
      setError("Class, section name and code are required");
      toast.warn("Please fill all required fields");
      return;
    }

    try {
      await addNewSection({
        class_name: formData.class_id,
        section_name: formData.section_name,
        section_code: formData.section_code,
      });
      toast.success("Section added successfully!");
      fetchData();
      setFormData({ ...formData, section_name: "", section_code: "", class_id: "" });
      setIsSectionFormOpen(false);
      setEditingSection(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add new section");
    }
  };

  const handleEditClass = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      ...formData,
      class_name: classItem.class_name || "",
      class_code: classItem.class_code || "",
    });
    setIsClassFormOpen(true);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setFormData({
      ...formData,
      section_name: section.section_name || "",
      section_code: section.section_code || "",
      class_id: section.class?._id || "",
    });
    setIsSectionFormOpen(true);
  };

  const handleUpdateClass = async (id) => {
    if (!formData.class_name.trim() || !formData.class_code.trim()) {
      setError("Both class name and code are required");
      toast.warn("Fill required fields first!");
      return;
    }

    try {
      await updateClassById(id, {
        class_name: formData.class_name,
        class_code: formData.class_code,
      });
      toast.success("Class updated successfully!");
      fetchData();
      setEditingClass(null);
      setIsClassFormOpen(false);
      setFormData({ ...formData, class_name: "", class_code: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update class");
    }
  };

  const handleUpdateSection = async (id) => {
    if (!formData.section_name.trim() || !formData.section_code.trim()) {
      setError("Both section name and code are required");
      toast.warn("Fill required fields first!");
      return;
    }

    try {
      await updateSectionById(id, {
        section_name: formData.section_name,
        section_code: formData.section_code,
      });
      toast.success("Section updated successfully!");
      fetchData();
      setEditingSection(null);
      setIsSectionFormOpen(false);
      setFormData({ ...formData, section_name: "", section_code: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update section");
    }
  };

  const handleDeleteClass = async (id) => {
    if (confirm("Are you sure you want to delete this class and all its sections?")) {
      try {
        await deleteClassById(id);
        toast.success("Class deleted successfully!");
        fetchData();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to delete class");
      }
    }
  };

  const handleDeleteSection = async (id) => {
    if (confirm("Are you sure you want to delete this section?")) {
      try {
        await deleteSectionById(id);
        toast.success("Section deleted successfully!");
        fetchData();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to delete section");
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
      const sections = row.sections.map(
        (section) => `${section.section_code} - ${section.section_name}`
      );
      return `${index + 1}\t${row.class_name || "N/A"}\t${row.class_code || "N/A"}\t${sections || "No sections"}`;
    });
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, [selectedSessionId]);

  const breadcrumbItems = [
    { label: "Master Entry", link: "/master-entry/all-module" },
    { label: "class-master", link: "null" },
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
          {hasSubmitAccess && (
            <div className="d-flex gap-2 mb-3">
              <Button onClick={() => setIsClassFormOpen(true)} className="btn-add">
                <CgAddR /> Add Class
              </Button>
              <Button onClick={() => setIsSectionFormOpen(true)} className="btn-add">
                <CgAddR /> Add Section
              </Button>
            </div>
          )}

          {/* Class Form */}
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
                    <FormLabel className="labelForm">
                      Class Name<span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Class Name"
                      value={formData.class_name}
                      onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Class Code<span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Class Code"
                      value={formData.class_code}
                      onChange={(e) => setFormData({ ...formData, class_code: e.target.value })}
                    />
                  </Col>
                </Row>
                {error && <div className="text-danger mb-3">{error}</div>}
                <Button
                  variant="success"
                  onClick={
                    editingClass
                      ? () => handleUpdateClass(editingClass._id)
                      : handleAddClass
                  }

                >
                  {editingClass ? "Update Class" : "Add Class"}
                </Button>
              </Form>
            </div>
          )}

          {/* Section Form */}
          {isSectionFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{editingSection ? "Update Section" : "Add New Section"}</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsSectionFormOpen(false);
                    setError("");
                    setFormData({
                      ...formData,
                      section_name: "",
                      section_code: "",
                      class_id: "",
                    });
                    setEditingSection(null);
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={12}>
                    <FormLabel className="labelForm">
                      Select Class<span className="text-danger">*</span>
                    </FormLabel>
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
                    <FormLabel className="labelForm">
                      Section Code<span className="text-danger">*</span>
                    </FormLabel>
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
                    <FormLabel className="labelForm">
                      Section Name<span className="text-danger">*</span>
                    </FormLabel>
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
                  variant="success"
                  onClick={
                    editingSection
                      ? () => handleUpdateSection(editingSection._id)
                      : handleAddSection
                  }

                >
                  {editingSection ? "Update Section" : "Add Section"}
                </Button>
              </Form>
            </div>
          )}

          {/* Table */}
          <div className="tableSheet">
            <h2>Class Records</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Table columns={columns} data={data} handleCopy={handleCopy} handlePrint={handlePrint} />
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(ClassMasterPage), { ssr: false });
