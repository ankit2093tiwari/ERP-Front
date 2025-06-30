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
  FormSelect,
  Spinner,
} from "react-bootstrap";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";
import { toast } from "react-toastify";
import { addNewDesignation, deleteDesignationById, getAllDesignations, updateDesignationById } from "@/Services";

const DesignationMasterPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [editError, setEditError] = useState("");

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Teaching");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedType, setEditedType] = useState("Teaching");

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px",
    },
    {
      name: "Designation Name",
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
          />

        ) : (
          row.designation_name || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Designation Type",
      cell: (row) =>
        editingId === row._id ? (
          <FormSelect
            value={editedType}
            onChange={(e) => setEditedType(e.target.value)}
          >
            <option value="Teaching">Teaching</option>
            <option value="Non-Teaching">Non-Teaching</option>
          </FormSelect>
        ) : (
          row.designation_type || "N/A"
        ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <button
              className="editButton"
              onClick={() => handleSave(row._id)}
              disabled={buttonLoading}
            >
              {buttonLoading ? <Spinner size="sm" animation="border" /> : <FaSave />}
            </button>
          ) : (
            <button className="editButton" onClick={() => handleEdit(row)}>
              <FaEdit />
            </button>
          )}
          <button
            className="editButton btn-danger"
            onClick={() => handleDelete(row._id)}
            disabled={buttonLoading}
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllDesignations()
      setData(response.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditingId(row._id);
    setEditedName(row.designation_name);
    setEditedType(row.designation_type);
  };

  const handleSave = async (id) => {
    if (!editedName.trim()) {
      setEditError("Designation name cannot be empty.");
      toast.warn("Designation name cannot be empty.");
      return;
    }

    const duplicate = data.find(
      (item) =>
        item._id !== id &&
        item.designation_name.toLowerCase() === editedName.toLowerCase()
    );

    if (duplicate) {
      setEditError("Designation name already exists.");
      return;
    }

    try {
      setButtonLoading(true);
      await updateDesignationById(id, {
        designation_name: editedName,
        designation_type: editedType,
      })
      toast.success("Designation updated successfully");
      setEditingId(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to update designation.");
    } finally {
      setButtonLoading(false);
    }
  };


  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this designation?")) {
      try {
        setButtonLoading(true);
        await deleteDesignationById(id)
        toast.success("Designation deleted successfully");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete designation.");
      } finally {
        setButtonLoading(false);
      }
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      setAddError("Designation name cannot be empty");
      return;
    }

    try {
      setButtonLoading(true);
      const existing = data.find(
        (item) =>
          item.designation_name.toLowerCase() === newName.toLowerCase()
      );
      if (existing) {
        setAddError("Designation name already exists");
        return;
      }

      await addNewDesignation({
        designation_name: newName,
        designation_type: newType,
      })
      toast.success("Designation added successfully");
      setNewName("");
      setNewType("Teaching");
      setIsPopoverOpen(false);
      fetchData();
    } catch (error) {
      console.error("Add Error:", error);
      toast.error("Failed to add designation.");
    } finally {
      setButtonLoading(false);
    }
  };

  const handleCopy = () => {
    const headers = ["#", "Designation Name", "Designation Type"];
    const rows = data.map(
      (row, index) =>
        `${index + 1}\t${row.designation_name}\t${row.designation_type}`
    );
    copyContent(headers, rows);
  };

  const handlePrint = () => {
    const headers = [["#", "Designation Name", "Designation Type"]];
    const rows = data.map((row, index) => [
      index + 1,
      row.designation_name,
      row.designation_type,
    ]);
    printContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "HRD", link: "/hrd/allModule" },
    { label: "Designation Master", link: "null" },
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
            <CgAddR /> Add Designation
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Designation</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setAddError("");
                  }}
                >
                  X
                </button>
              </div>

              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Designation Name<span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Designation Name"
                      value={newName}
                      onChange={(e) => {
                        setNewName(e.target.value);
                        setAddError("");
                      }}
                    />
                    {addError && <p style={{ color: "red" }}>{addError}</p>}
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Designation Type<span className="text-danger">*</span>
                    </FormLabel>
                    <FormSelect
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                    >
                      <option value="Teaching">Teaching</option>
                      <option value="Non-Teaching">Non-Teaching</option>
                    </FormSelect>
                  </Col>
                </Row>
                <Button
                  onClick={handleAdd}
                  className="btn btn-primary"
                  disabled={buttonLoading}
                >
                  {buttonLoading ? "Saving..." : "Add Designation"}
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Designation Records</h2>
            {loading ? (
              <div className="text-center my-4">
                <Spinner animation="border" variant="primary" />
              </div>
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

export default dynamic(() => Promise.resolve(DesignationMasterPage), { ssr: false, });
