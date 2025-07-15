"use client";

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import { CgAddR } from "react-icons/cg";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

import BreadcrumbComp from "@/app/component/Breadcrumb";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import {
  getAllSubjectSubCategories,
  addNewSubjectSubCategory,
  updateSubjectSubCategoryById,
  deleteSubjectSubCategoryById,
  getClasses,
  getSections,
  getAllSubjectCategories
} from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const SubjectSubCategory = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission();

  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [form, setForm] = useState({
    category: "",
    subCategoryName: "",
    className: "",
    sectionName: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setFetching(true);
    try {
      const [subRes, catRes, classRes] = await Promise.all([
        getAllSubjectSubCategories(),
        getAllSubjectCategories(),
        getClasses()
      ]);

      if (subRes.success) setSubCategories(subRes.data || []);
      else toast.error(subRes.message || "Failed to load records");

      if (catRes.success) setCategories(catRes.data || []);
      else toast.error(catRes.message || "Failed to load categories");

      if (classRes.success) setClasses(classRes.data || []);
      else toast.error(classRes.message || "Failed to load classes");
    } catch {
      toast.error("Server error while fetching data");
    } finally {
      setFetching(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.category) newErrors.category = "Category is required";
    if (!form.subCategoryName.trim()) newErrors.subCategoryName = "Sub category name is required";
    if (!form.className) newErrors.className = "Class is required";
    if (!form.sectionName) newErrors.sectionName = "Section is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      let res;
      if (editId) {
        res = await updateSubjectSubCategoryById(editId, form);
      } else {
        res = await addNewSubjectSubCategory(form);
      }
      if (res.success) {
        toast.success(res.message || (editId ? "Updated successfully" : "Added successfully"));
        resetForm();
        setIsPopoverOpen(false);
        fetchData();
      } else {
        toast.error(res.message || "Operation failed");
      }
    } catch {
      toast.error("Server error during operation");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      category: item.category?._id || "",
      subCategoryName: item.subCategoryName,
      className: item.className?._id || "",
      sectionName: item.sectionName?._id || ""
    });
    setEditId(item._id);
    loadSections(item.className?._id);
    setIsPopoverOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete?")) return;
    try {
      const res = await deleteSubjectSubCategoryById(id);
      if (res.success) {
        toast.success(res.message || "Deleted successfully");
        fetchData();
      } else {
        toast.error(res.message || "Failed to delete");
      }
    } catch {
      toast.error("Server error while deleting");
    }
  };

  const resetForm = () => {
    setForm({
      category: "",
      subCategoryName: "",
      className: "",
      sectionName: ""
    });
    setEditId(null);
    setErrors({});
    setSections([]);
  };

  const loadSections = async (classId) => {
    if (!classId) {
      setSections([]);
      return;
    }
    try {
      const res = await getSections(classId);
      if (res.success) {
        setSections(res.data || []);
      } else {
        toast.error(res.message || "Failed to load sections");
        setSections([]);
      }
    } catch {
      toast.error("Server error while fetching sections");
      setSections([]);
    }
  };

  const handleCopy = () => {
    const headers = ["#", "EntryDate", "Category", "SubCategoryName", "Class", "Section"];
    const rows = subCategories.map((item, idx) =>
      `${idx + 1}\t${new Date(item.entryDate).toLocaleDateString()}\t${item.category?.name || "-"}\t${item.subCategoryName}\t${item.className?.class_name || "-"}\t${item.sectionName?.section_name || "-"}`
    );
    copyContent(headers, rows);
  };

  const handlePrint = () => {
    const headers = [["#", "EntryDate", "Category", "SubCategoryName", "Class", "Section"]];
    const rows = subCategories.map((item, idx) => [
      idx + 1,
      new Date(item.entryDate).toLocaleDateString(),
      item.category?.name || "-",
      item.subCategoryName,
      item.className?.class_name || "-",
      item.sectionName?.section_name || "-"
    ]);
    printContent(headers, rows);
  };

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "80px" },
    { name: "EntryDate", selector: row => new Date(row.entryDate).toLocaleDateString(), sortable: true },
    { name: "Category", selector: row => row.category?.name || "-", sortable: true },
    { name: "SubCategoryName", selector: row => row.subCategoryName, sortable: true },
    { name: "Class", selector: row => row.className?.class_name || "-", sortable: true },
    { name: "Section", selector: row => row.sectionName?.section_name || "-", sortable: true },
    hasEditAccess && {
      name: "Action",
      cell: row => (
        <>
          <Button variant="success" size="sm" className="me-2" onClick={() => handleEdit(row)}>
            <FaEdit />
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </Button>
        </>
      )
    }
  ].filter(Boolean);

  const breadcrumbItems = [
    { label: "Exams", link: "/exam/all-module" },
    { label: "Subject Sub Category", link: null }
  ];

  return (
    <>
      <div className="breadcrumbSheet">
        <Container>
          <Row>
            <Col><BreadcrumbComp items={breadcrumbItems} /></Col>
          </Row>
        </Container>
      </div>

      <section>
        <Container>
          {hasSubmitAccess && (
            <Button className="btn-add" onClick={() => { resetForm(); setIsPopoverOpen(true); }}>
              <CgAddR /> Add New Sub Category
            </Button>
          )}

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{editId ? "Edit" : "Add"} Subject Sub Category</h2>
                <button className="closeForm" onClick={() => { resetForm(); setIsPopoverOpen(false); }}>X</button>
              </div>
              <Form className="formSheet mb-4">
                <Row>
                  <Col md={6}>
                    <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </Form.Select>
                    {errors.category && <div className="text-danger small mt-1">{errors.category}</div>}
                  </Col>

                  <Col md={6}>
                    <Form.Label>Sub Category Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      value={form.subCategoryName}
                      onChange={(e) => setForm({ ...form, subCategoryName: e.target.value })}
                      placeholder="Enter sub category name"
                    />
                    {errors.subCategoryName && <div className="text-danger small mt-1">{errors.subCategoryName}</div>}
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={6}>
                    <Form.Label>Class <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      value={form.className}
                      onChange={(e) => {
                        const classId = e.target.value;
                        setForm({ ...form, className: classId, sectionName: "" });
                        loadSections(classId);
                      }}
                    >
                      <option value="">Select Class</option>
                      {classes.map(cls => (
                        <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                      ))}
                    </Form.Select>
                    {errors.className && <div className="text-danger small mt-1">{errors.className}</div>}
                  </Col>

                  <Col md={6}>
                    <Form.Label>Section <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      value={form.sectionName}
                      onChange={(e) => setForm({ ...form, sectionName: e.target.value })}
                    >
                      <option value="">Select Section</option>
                      {sections.map(sec => (
                        <option key={sec._id} value={sec._id}>{sec.section_name}</option>
                      ))}
                    </Form.Select>
                    {errors.sectionName && <div className="text-danger small mt-1">{errors.sectionName}</div>}
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col>
                    <Button onClick={handleSubmit} disabled={loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : editId ? "Update" : "Submit"}
                    </Button>
                    <Button variant="secondary" className="ms-2" onClick={() => { resetForm(); setIsPopoverOpen(false); }}>
                      Cancel
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Sub Category Records</h2>
            {fetching ? (
              <p>Loading...</p>
            ) : (
              <Table
                columns={columns}
                data={subCategories}
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

export default dynamic(() => Promise.resolve(SubjectSubCategory), { ssr: false });
