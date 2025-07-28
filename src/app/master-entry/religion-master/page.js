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
import { toast } from "react-toastify";
import { addNewReligion, deleteReligionById, getReligions, updateReligionById } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const ReligionMasterPage = () => {
  const { hasSubmitAccess, hasEditAccess } = usePagePermission()

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [newReligionName, setNewReligionName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [fieldError, setFieldError] = useState("")
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
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        ) : (
          row.religion_name || "N/A"
        ),
      sortable: true,
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          {editingId === row._id ? (
            <button className="editButton" onClick={() => handleSave(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button
              className="editButton"
              onClick={() => handleEdit(row._id, row.religion_name)}
            >
              <FaEdit />
            </button>
          )}
          <button
            className="editButton btn-danger"
            onClick={() => handleDelete(row._id)}
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
      const res = await getReligions()
      setData(res.data)
    } catch (err) {
      toast.error("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditedName(name);
  };

  const handleSave = async (id) => {
    if (!editedName.trim()) {
      toast.warning("Religion name cannot be empty.");
      return;
    }

    const exists = data.find(
      (item) =>
        item.religion_name.trim().toLowerCase() === editedName.trim().toLowerCase() &&
        item._id !== id
    );

    if (exists) {
      toast.warning("Religion name already exists!");
      setEditingId(null);
      return;
    }

    try {
      const res = await updateReligionById(id, {
        religion_name: editedName,
      })
      toast.success("Religion updated successfully!");
      fetchData();
      setEditingId(null);
    } catch (err) {
      toast.error("Failed to update religion.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this religion?")) {
      try {
        await deleteReligionById(id)
        toast.success("Religion deleted successfully!");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete religion.");
        console.log("failed to delete record", err)
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
        item.religion_name.trim().toLowerCase() === newReligionName.trim().toLowerCase()
    );
    if (exists) {
      toast.warning("Religion already exists!");
      setFieldError("Religion already exists!");
      return;
    }

    try {
      const res = await addNewReligion({
        religion_name: newReligionName,
      })
      toast.success("Religion added successfully!");
      fetchData()
      setNewReligionName("");
      setIsPopoverOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.messsage || "Failed to add religion.");
      console.log("Failed to add religion", err);

    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Religion Name"]];
    const tableRows = data.map((row, index) => [index + 1, row.religion_name || "N/A"]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Religion Name"];
    const rows = data.map((row, index) => `${index + 1}\t${row.religion_name || "N/A"}`);
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
          {
            hasSubmitAccess && (
              <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
                <CgAddR /> Add Religion
              </Button>
            )
          }

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Religion</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setNewReligionName("");
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Religion Name<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Religion Name"
                      value={newReligionName}
                      isInvalid={!!fieldError}
                      onChange={(e) => { setNewReligionName(e.target.value); if (fieldError) setFieldError("") }}
                    />
                    {fieldError && <p className="text-danger">{fieldError}</p>}
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Religion
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
