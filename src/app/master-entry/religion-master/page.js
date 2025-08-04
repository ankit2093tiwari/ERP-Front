"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
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
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import {
  addNewReligion,
  deleteReligionById,
  getReligions,
  updateReligionById,
} from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const ReligionMasterPage = () => {
  const { hasSubmitAccess, hasEditAccess } = usePagePermission();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [newReligionName, setNewReligionName] = useState("");
  const [editReligionId, setEditReligionId] = useState(null);
  const [editReligionName, setEditReligionName] = useState("");
  const [fieldError, setFieldError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getReligions();
      setData(res.data);
    } catch (err) {
      toast.error("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id, name) => {
    setEditReligionId(id);
    setEditReligionName(name);
    setIsEditFormOpen(true);
  };

  const handleUpdate = async () => {
    if (!editReligionName.trim()) {
      toast.warning("Religion name cannot be empty.");
      return;
    }

    const exists = data.find(
      (item) =>
        item.religion_name.trim().toLowerCase() ===
          editReligionName.trim().toLowerCase() && item._id !== editReligionId
    );

    if (exists) {
      toast.warning("Religion name already exists!");
      return;
    }

    try {
      await updateReligionById(editReligionId, {
        religion_name: editReligionName,
      });
      toast.success("Religion updated successfully!");
      fetchData();
      setIsEditFormOpen(false);
    } catch (err) {
      toast.error("Failed to update religion.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this religion?")) {
      try {
        await deleteReligionById(id);
        toast.success("Religion deleted successfully!");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete religion.");
      }
    }
  };

  const handleAdd = async () => {
    if (!newReligionName.trim()) {
      setFieldError("Religion Name is required!");
      toast.warning("Please enter a valid religion name.");
      return;
    }
    const exists = data.find(
      (item) =>
        item.religion_name.trim().toLowerCase() ===
        newReligionName.trim().toLowerCase()
    );
    if (exists) {
      toast.warning("Religion already exists!");
      setFieldError("Religion already exists!");
      return;
    }

    try {
      await addNewReligion({
        religion_name: newReligionName,
      });
      toast.success("Religion added successfully!");
      fetchData();
      setNewReligionName("");
      setIsAddFormOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add religion.");
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Religion Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.religion_name || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Religion Name"];
    const rows = data.map(
      (row, index) => `${index + 1}\t${row.religion_name || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Religion Name",
      selector: (row) => row.religion_name,
      sortable: true,
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button
            size="sm" variant="success"
            onClick={() => handleEdit(row._id, row.religion_name)}
          >
            <FaEdit />
          </Button>
          <Button
            size="sm" variant="danger"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ].filter(Boolean); // Remove false if hasEditAccess is false

  const breadcrumbItems = [
    { label: "Master Entry", link: "/master-entry/all-module" },
    { label: "Religion Master", link: null },
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
            <Button onClick={() => setIsAddFormOpen(true)} className="btn-add">
              <CgAddR /> Add Religion
            </Button>
          )}

          {isAddFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Religion</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsAddFormOpen(false);
                    setNewReligionName("");
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Religion Name<span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Religion Name"
                      value={newReligionName}
                      isInvalid={!!fieldError}
                      onChange={(e) => {
                        setNewReligionName(e.target.value);
                        if (fieldError) setFieldError("");
                      }}
                    />
                    {fieldError && (
                      <p className="text-danger">{fieldError}</p>
                    )}
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Religion
                </Button>
              </Form>
            </div>
          )}

          {isEditFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Edit Religion</h2>
                <button
                  className="closeForm"
                  onClick={() => setIsEditFormOpen(false)}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Religion Name<span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Religion Name"
                      value={editReligionName}
                      onChange={(e) => setEditReligionName(e.target.value)}
                    />
                  </Col>
                </Row>
                <Button onClick={handleUpdate} className="btn btn-primary">
                  Update Religion
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Religion Records</h2>
            {loading && <p>Loading...</p>}
            {!loading && (
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

export default dynamic(() => Promise.resolve(ReligionMasterPage), { ssr: false });
