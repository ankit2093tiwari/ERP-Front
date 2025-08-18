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
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { addNewAdvertisementType, getAdvertisementTypes, updateAdvertisingTypeById, deleteAdvertisingTypeById } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const CreateType = () => {
  const { hasSubmitAccess, hasEditAccess } = usePagePermission()
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({ type_name: "" });
  const [formError, setFormError] = useState({ type_name: "" });

  const [editFormData, setEditFormData] = useState({ type_name: "" });
  const [editFormError, setEditFormError] = useState({ type_name: "" });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "Type Name",
      selector: (row) => row.type_name,
      cell: (row) =>
        editingId === row._id ? (
          <div>
            <FormControl
              type="text"
              value={editFormData.type_name}
              onChange={(e) => {
                setEditFormData({ ...editFormData, type_name: e.target.value });
                setEditFormError({ ...editFormError, type_name: "" });
              }}
            />
            {editFormError.type_name && (
              <div className="text-danger">{editFormError.type_name}</div>
            )}
          </div>
        ) : (
          row.type_name || "N/A"
        ),
      sortable: true,
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          {editingId === row._id ? (
            <>
              <Button size="sm" variant="success" onClick={() => handleUpdate(row._id)}>
                <FaSave />
              </Button>
              <Button size="sm" variant="danger" onClick={() => setEditingId(null)}>
                <FaTimes />
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="success" onClick={() => handleEdit(row)}>
                <FaEdit />
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}>
                <FaTrashAlt />
              </Button>
            </>
          )}
        </div>
      ),
      sortable: false,
    },
  ].filter(Boolean); // This removes `false` if hasEditAccess is false


  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAdvertisementTypes()
      setData(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch advertising types.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditingId(row._id);
    setEditFormData({ type_name: row.type_name || "" });
    setEditFormError({});
  };

  const handleUpdate = async (id) => {
    if (!editFormData.type_name.trim()) {
      setEditFormError({ type_name: "Type name is required" });
      return;
    }

    try {
      await updateAdvertisingTypeById(id, editFormData)
      toast.success("Type updated successfully!");
      fetchData();
      setEditingId(null);
    } catch (err) {
      toast.error("Failed to update advertising type.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this advertising type?")) {
      try {
        await deleteAdvertisingTypeById(id)
        toast.success("Type deleted successfully!");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete advertising type.");
      }
    }
  };

  const handleAdd = async () => {
    if (!formData.type_name.trim()) {
      setFormError({ type_name: "Type name is required" });
      return;
    }

    const exists = data.find(
      (type) => type.type_name.toLowerCase() === formData.type_name.toLowerCase()
    );

    if (exists) {
      setFormError({ type_name: "Type name already exists" });
      return;
    }

    try {
      await addNewAdvertisementType(formData)
      toast.success("Type added successfully!");
      fetchData();
      setFormData({ type_name: "" });
      setIsPopoverOpen(false);
    } catch (err) {
      toast.error("Failed to add advertising type.");
    }
  };

  const handleCopy = () => {
    const headers = ["#", "Type Name"];
    const rows = data.map((row, index) => `${index + 1}\t${row.type_name || "N/A"}`);
    copyContent(headers, rows);
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Type Name"]];
    const tableRows = data.map((row, index) => [index + 1, row.type_name || "N/A"]);
    printContent(tableHeaders, tableRows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Advertising Management", link: "/advertising-management/all-module" },
    { label: "Create Type", link: "null" },
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
            <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
              <CgAddR /> Add Advertising Type
            </Button>
          )}

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Advertising Type</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setFormError({});
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={12}>
                    <FormLabel className="labelForm">Type Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Type Name"
                      value={formData.type_name}
                      onChange={(e) => {
                        setFormData({ ...formData, type_name: e.target.value });
                        setFormError({ type_name: "" });
                      }}
                      isInvalid={!!formError.type_name}
                    />
                    {formError.type_name && (
                      <div className="text-danger">{formError.type_name}</div>
                    )}
                  </Col>
                </Row>
                <Button onClick={handleAdd} variant="success">
                  Add Type
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Advertising Type Records</h2>
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

export default dynamic(() => Promise.resolve(CreateType), { ssr: false });
