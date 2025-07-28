"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave, FaTimes } from "react-icons/fa";
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
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";
import { toast } from "react-toastify";
import { addNewGrade, deleteGradeById, getAllGrades, updateGradeById } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const GradeMasterPage = () => {
  const {hasEditAccess,hasSubmitAccess}=usePagePermission()
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editError, setEditError] = useState("");
  const [newGradeName, setNewGradeName] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllGrades()
      setData(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (!newGradeName.trim()) {
      setError("Grade name is required");
      return;
    }

    const exists = data.find(
      (g) => g.grade_name.toLowerCase() === newGradeName.trim().toLowerCase()
    );
    if (exists) {
      setError("Grade name already exists");
      return;
    }

    try {
      await addNewGrade({
        grade_name: newGradeName.trim(),
      })
      toast.success("Grade added successfully");
      setNewGradeName("");
      setIsPopoverOpen(false);
      fetchData();
    } catch (err) {
      console.log('failed to add grade!', err)
      toast.error("Failed to add grade");
    }
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditedName(name);
    setEditError("");
  };

  const handleSave = async (id) => {
    if (!editedName.trim()) {
      setEditError("Grade name is required");
      toast.warn("Grade name is required");
      return;
    }

    const exists = data.find(
      (g) =>
        g._id !== id && g.grade_name.toLowerCase() === editedName.trim().toLowerCase()
    );
    if (exists) {
      setEditError("Grade name already exists");
      toast.warn("Grade name already exists");
      return;
    }

    try {
      await updateGradeById(id, {
        grade_name: editedName.trim(),
      })
      toast.success("Grade updated successfully");
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.log('failed to update grade!', err)
      toast.error("Failed to update grade");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this grade?")) {
      try {
        await deleteGradeById(id)
        toast.success("Grade deleted successfully");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete grade");
      }
    }
  };

  const handlePrint = () => {
    const headers = [["#", "Grade Name"]];
    const rows = data.map((row, index) => [index + 1, row.grade_name || "N/A"]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Grade Name"];
    const rows = data.map((row, index) => `${index + 1}\t${row.grade_name || "N/A"}`);
    copyContent(headers, rows);
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px",
    },
    {
      name: "Grade Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedName}
            onChange={(e) => {
              setEditedName(e.target.value);
              setEditError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave(row._id);
              if (e.key === "Escape") setEditingId(null);
            }}
            isInvalid={!!editError}
          />
        ) : (
          row.grade_name || "N/A"
        ),
    },
    hasEditAccess &&{
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          {editingId === row._id ? (
            <>
              <button className="editButton" onClick={() => handleSave(row._id)}>
                <FaSave />
              </button>
              <button className="editButton btn-danger" onClick={() => setEditingId(null)}>
                <FaTimes />
              </button>
            </>
          ) : (
            <>
              <button className="editButton" onClick={() => handleEdit(row._id, row.grade_name)}>
                <FaEdit />
              </button>
              <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
                <FaTrashAlt />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: "HRD", link: "/hrd/allModule" },
    { label: "Grade Master", link: null },
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
          {hasSubmitAccess &&(
            <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
            <CgAddR /> Add Grade
          </Button>
          )}

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Grade</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setError("");
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Grade Name <span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Grade Name"
                      value={newGradeName}
                      onChange={(e) => {
                        setNewGradeName(e.target.value);
                        setError("");
                      }}
                      isInvalid={!!error}
                    />
                    {error && <div className="text-danger small mt-1">{error}</div>}
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Grade
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Grade Records</h2>
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

export default dynamic(() => Promise.resolve(GradeMasterPage), { ssr: false });
