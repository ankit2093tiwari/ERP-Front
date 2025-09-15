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
import { addNewDepartment, deleteDepartmentById, getAllDepartments, updateDepartmentById } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const DepartmentMasterPage = () => {
  const {hasEditAccess,hasSubmitAccess}=usePagePermission()
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editError, setEditError] = useState("");
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllDepartments()
      setData(response.data || []);
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
    if (!newDepartmentName.trim()) {
      setError("Department name is required");
      return;
    }

    const duplicate = data.find(
      (item) => item.department_name.toLowerCase() === newDepartmentName.trim().toLowerCase()
    );
    if (duplicate) {
      setError("Department name already exists");
      return;
    }

    try {
      await addNewDepartment({
        department_name: newDepartmentName.trim(),
      })
      toast.success("Department added successfully");
      setNewDepartmentName("");
      setIsPopoverOpen(false);
      fetchData();
    } catch (err) {
      console.error('failed to add department!', err)
      toast.error("Failed to add department");
    }
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditedName(name);
    setEditError("");
  };

  const handleSave = async (id) => {
    if (!editedName.trim()) {
      setEditError("Department name is required");
      toast.warn("Department name is required");
      return;
    }

    const duplicate = data.find(
      (item) =>
        item._id !== id &&
        item.department_name.toLowerCase() === editedName.trim().toLowerCase()
    );
    if (duplicate) {
      setEditError("Department name already exists");
      toast.warn("Department name already exists");
      return;
    }

    try {
      await updateDepartmentById(id, {
        department_name: editedName.trim(),
      })
      toast.success("Department updated successfully");
      setEditingId(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to update department");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this department?")) {
      try {
        await deleteDepartmentById(id)
        toast.success("Deleted successfully");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete department");
      }
    }
  };

  const handlePrint = () => {
    const headers = [["#", "Department Name"]];
    const rows = data.map((row, i) => [i + 1, row.department_name || "N/A"]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Department Name"];
    const rows = data.map((row, i) => `${i + 1}\t${row.department_name || "N/A"}`);
    copyContent(headers, rows);
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px",
    },
    {
      name: "Department Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedName}
            onChange={(e) => {
              setEditedName(e.target.value);
              setEditError("");
            }}
            isInvalid={!!editError}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave(row._id);
              if (e.key === "Escape") setEditingId(null);
            }}
          />
        ) : (
          row.department_name || "N/A"
        ),
    },
    hasEditAccess &&{
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          {editingId === row._id ? (
            <>
              <Button size="sm" variant="success" onClick={() => handleSave(row._id)}>
                <FaSave />
              </Button>
              <Button size="sm" variant="danger" onClick={() => setEditingId(null)}>
                <FaTimes />
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="success" onClick={() => handleEdit(row._id, row.department_name)}>
                <FaEdit />
              </Button>
              <Button size="sm" variant="danger"onClick={() => handleDelete(row._id)}>
                <FaTrashAlt />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: "HRD", link: "/hrd/allModule" },
    { label: "Department Master", link: null },
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
            <CgAddR /> Add Department
          </Button>
         )}

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Department</h2>
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
                    <FormLabel className="labelForm">Department Name <span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Department Name"
                      value={newDepartmentName}
                      onChange={(e) => {
                        setNewDepartmentName(e.target.value);
                        setError("");
                      }}
                      isInvalid={!!error}
                    />
                    {error && <div className="text-danger mt-1 small">{error}</div>}
                  </Col>
                </Row>
                <Button onClick={handleAdd} variant="success">
                  Add Department
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Department Records</h2>
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

export default dynamic(() => Promise.resolve(DepartmentMasterPage), { ssr: false });
