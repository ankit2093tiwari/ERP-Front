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
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { addNewCaste, deleteCasteById, getCastes, updateCasteById } from "@/Services";

const CasteMasterPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCasteName, setNewCasteName] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [fieldError, setFieldError] = useState("");

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Name",
      selector: (row) => row.caste_name,
      cell: (row) =>
        editingId === row._id ? (
          <>
            <FormControl
              type="text"
              value={editedName}
              isInvalid={!editedName.trim()}
              onChange={(e) => {
                setEditedName(e.target.value);
                if (!e.target.value.trim()) setFieldError("Caste name is required.");
                else setFieldError("");
              }}
            />
            {/* {fieldError && <div className="text-danger mt-1">{fieldError}</div>} */}
          </>
        ) : (
          row.caste_name || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <button className="editButton" onClick={() => handleSave(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button
              className="editButton"
              onClick={() => handleEdit(row._id, row.caste_name)}
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

  const handlePrint = () => {
    const tableHeaders = [["#", "Caste Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.caste_name || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Caste Name"];
    const rows = data.map(
      (row, index) => `${index + 1}\t${row.caste_name || "N/A"}`
    );
    copyContent(headers, rows);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getCastes()
      const fetchedData = response.data || [];
      const normalizedData = fetchedData.map((item) => ({
        ...item,
        caste_name: item.caste_name || "N/A",
      }));
      setData(normalizedData);
    } catch (err) {
      toast.error("Failed to fetch data. Please try again later.");
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
      toast.warn("Caste name is required.")
      setFieldError("Caste name is required.");
      return;
    }

    try {
      await updateCasteById(id, {
        caste_name: editedName.trim(),
      })
      toast.success("Caste updated successfully!");
      fetchData();
      setEditingId(null);
    } catch (error) {
      toast.error("Failed to update data. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        await deleteCasteById(id)
        toast.success("Caste deleted successfully!");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete data. Please try again later.");
      }
    }
  };

  const handleAdd = async () => {
    if (!newCasteName.trim()) {
      setFieldError("Caste name is required.");
      toast.warning("Please enter a valid caste name.");
      return;
    }

    try {
      const existingCaste = data.find(
        (caste) =>
          caste.caste_name.toLowerCase().trim() ===
          newCasteName.toLowerCase().trim()
      );
      if (existingCaste) {
        setNewCasteName("");
        setFieldError("Already present! try another.");
        toast.warning("Caste name already exists!");
        return;
      }

      await addNewCaste({ caste_name: newCasteName.trim() })
      setNewCasteName("");
      setIsPopoverOpen(false);
      fetchData();
      toast.success("Caste added successfully!");
    } catch (error) {
      toast.error("Failed to add data. Please try again later.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Master Entry", link: "/master-entry/all-module" },
    { label: "Caste Master", link: null },
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
            <CgAddR /> Add Caste
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Caste</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setNewCasteName("");
                    setFieldError("");
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Caste Name<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Caste Name"
                      value={newCasteName}
                      isInvalid={!!fieldError && !newCasteName.trim()}
                      onChange={(e) => {
                        setNewCasteName(e.target.value);
                        if (fieldError && e.target.value.trim()) setFieldError("");
                      }}
                    />
                    {fieldError && !newCasteName.trim() && (
                      <div className="text-danger mt-1">{fieldError}</div>
                    )}
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Caste
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Caste Records</h2>
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

export default dynamic(() => Promise.resolve(CasteMasterPage), { ssr: false });
