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
import { addNewAppoinmentNature, deleteAppoinmentNatureById, getAllAppoinmentNatures, updateAppoinmentNatureById } from "@/Services";

const NatureOfAppointmentPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editError, setEditError] = useState("");
  const [newAppoName, setNewAppoName] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllAppoinmentNatures()
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
    if (!newAppoName.trim()) {
      setError("Appointment name is required");
      return;
    }

    const duplicate = data.find(
      (item) => item.AppoName.toLowerCase() === newAppoName.trim().toLowerCase()
    );
    if (duplicate) {
      setError("Appointment name already exists");
      return;
    }

    try {
      await addNewAppoinmentNature({ AppoName: newAppoName.trim() })
      toast.success("Appointment added successfully");
      setNewAppoName("");
      setIsPopoverOpen(false);
      fetchData();
    } catch (err) {
      console.error('failed to add appointment nature', err)
      toast.error("Failed to add appointment. Try again.");
    }
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditedName(name);
    setEditError("");
  };

  const handleSave = async (id) => {
    if (!editedName.trim()) {
      setEditError("Appointment name is required");
      toast.warn("Appointment name is required");
      return;
    }

    const duplicate = data.find(
      (item) =>
        item._id !== id &&
        item.AppoName.toLowerCase() === editedName.trim().toLowerCase()
    );
    if (duplicate) {
      setEditError("Appointment name already exists");
      toast.warn("Appointment name already exists");
      return;
    }

    try {
      await updateAppoinmentNatureById(id, { AppoName: editedName.trim() })
      toast.success("Appointment updated successfully");
      setEditingId(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to update appointment");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      try {
        await deleteAppoinmentNatureById(id)
        toast.success("Appointment deleted successfully");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete appointment");
      }
    }
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px",
    },
    {
      name: "Appointment Name",
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
          row.AppoName || "N/A"
        ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
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
              <button className="editButton" onClick={() => handleEdit(row._id, row.AppoName)}>
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

  const handlePrint = () => {
    const headers = [["#", "Appointment Name"]];
    const rows = data.map((row, i) => [i + 1, row.AppoName || "N/A"]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Appointment Name"];
    const rows = data.map((row, i) => `${i + 1}\t${row.AppoName || "N/A"}`);
    copyContent(headers, rows);
  };

  const breadcrumbItems = [
    { label: "HRD", link: "/hrd/allModule" },
    { label: "Nature of Appointment", link: null },
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
          <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
            <CgAddR /> Add Appointment
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Appointment</h2>
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
                      Appointment Name <span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Appointment Name"
                      value={newAppoName}
                      onChange={(e) => {
                        setNewAppoName(e.target.value);
                        setError("");
                      }}
                      isInvalid={!!error}
                    />
                    {error && <div className="text-danger mt-1 small">{error}</div>}
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Appointment Type
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Appointment Records</h2>
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

export default dynamic(() => Promise.resolve(NatureOfAppointmentPage), { ssr: false });

