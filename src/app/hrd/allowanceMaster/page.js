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
  FormSelect,
} from "react-bootstrap";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";
import { toast } from "react-toastify";
import { addnewAllowance, deleteAllowanceById, getAllAllowances, updateAllowanceById } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const AllowanceMasterPage = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission()
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editError, setEditError] = useState("");
  const [newAllowanceName, setNewAllowanceName] = useState("");
  const [newCategory, setNewCategory] = useState("ADDITION");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedCategory, setEditedCategory] = useState("ADDITION");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllAllowances()
      setData(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (!newAllowanceName.trim()) {
      setError("Allowance name is required");
      return;
    }

    const duplicate = data.find(
      (item) =>
        item.allowance_name.toLowerCase() === newAllowanceName.trim().toLowerCase()
    );
    if (duplicate) {
      setError("Allowance name already exists");
      return;
    }

    try {
      await addnewAllowance({
        allowance_name: newAllowanceName.trim(),
        category: newCategory,
      })
      toast.success("Allowance added successfully");
      setNewAllowanceName("");
      setNewCategory("ADDITION");
      setIsPopoverOpen(false);
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error("Failed to add allowance", err)
      toast.error("Failed to add allowance.");
    }
  };

  const handleEdit = (id, name, category) => {
    setEditingId(id);
    setEditedName(name);
    setEditedCategory(category);
    setEditError("");
  };

  const handleSave = async (id) => {
    if (!editedName.trim()) {
      setEditError("Allowance name is required");
      toast.warn("Allowance name is required");
      return;
    }

    const duplicate = data.find(
      (item) =>
        item._id !== id &&
        item.allowance_name.toLowerCase() === editedName.trim().toLowerCase()
    );
    if (duplicate) {
      setEditError("Allowance name already exists");
      toast.warn("Allowance name already exists");
      return;
    }

    try {
      await updateAllowanceById(id, {
        allowance_name: editedName.trim(),
        category: editedCategory,
      })
      toast.success("Allowance updated successfully");
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error("Failed to update allowance", err)
      toast.error("Failed to update allowance.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this allowance?")) {
      try {
        await deleteAllowanceById(id);
        toast.success("Deleted successfully");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete allowance.");
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
      name: "Allowance Name",
      cell: (row) =>
        editingId === row._id ? (
          <>
            <FormControl
              type="text"
              value={editedName}
              onChange={(e) => {
                setEditedName(e.target.value);
                setEditError("");
              }}
              isInvalid={!!editError}
            />

          </>
        ) : (
          row.allowance_name || "N/A"
        ),
    },
    {
      name: "Category",
      cell: (row) =>
        editingId === row._id ? (
          <FormSelect
            value={editedCategory}
            onChange={(e) => setEditedCategory(e.target.value)}
          >
            <option value="ADDITION">ADDITION</option>
            <option value="SUBTRACTION">SUBTRACTION</option>
          </FormSelect>
        ) : (
          row.category || "N/A"
        ),
    },
    hasEditAccess && {
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
              <button
                className="editButton"
                onClick={() => handleEdit(row._id, row.allowance_name, row.category)}
              >
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

  const handleCopy = () => {
    const headers = ["#", "Allowance Name", "Category"];
    const rows = data.map((row, i) => `${i + 1}\t${row.allowance_name}\t${row.category}`);
    copyContent(headers, rows);
  };

  const handlePrint = () => {
    const headers = [["#", "Allowance Name", "Category"]];
    const rows = data.map((row, i) => [i + 1, row.allowance_name, row.category]);
    printContent(headers, rows);
  };

  const breadcrumbItems = [
    { label: "HRD", link: "/hrd/allModule" },
    { label: "Allowance Master", link: "null" },
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
              <CgAddR /> Add Allowance
            </Button>
          )}

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Allowance</h2>
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
                      Allowance Name <span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Allowance Name"
                      value={newAllowanceName}
                      onChange={(e) => {
                        setNewAllowanceName(e.target.value);
                        setError("");
                      }}
                      isInvalid={!!error}
                    />
                    {error && <div className="text-danger mt-1 small">{error}</div>}
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Category <span className="text-danger">*</span></FormLabel>
                    <FormSelect
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      <option value="ADDITION">ADDITION</option>
                      <option value="SUBTRACTION">SUBTRACTION</option>
                    </FormSelect>
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Allowance
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Allowance Records</h2>
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

export default dynamic(() => Promise.resolve(AllowanceMasterPage), { ssr: false });
