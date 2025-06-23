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
import { addNewHead, deleteHeadById, getAllHeads, updateHeadById } from "@/Services";
import { toast } from "react-toastify";

const HeadMasterPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newHeadMaster, setNewHeadMaster] = useState({
    head_name: "",
    head_type: "",
  });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({
    head_name: "",
    head_type: "",
  });

  const handlePrint = async () => {
    const tableHeaders = [["#", "Head Name", "Head Type"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.head_name || "N/A",
      row.head_type || "N/A",
    ]);

    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Head Name", "Head Type"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.head_name || "N/A"}\t${row.head_type || "N/A"}`
    );

    copyContent(headers, rows);
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllHeads()
      if (response.success) {
        setData(response.data);
      } else {
        setData([]);
        setError("No records found.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch HeadMaster records")
      setError("Failed to fetch HeadMasters.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (newHeadMaster.head_name.trim() && newHeadMaster.head_type.trim()) {
      try {
        const existingHeadMaster = data.find(
          (row) => row.head_name === newHeadMaster.head_name
        );
        if (existingHeadMaster) {
          toast.warn("HeadMaster name already exists.");
          return;
        }

        const response = await addNewHead(newHeadMaster)
        if (response.success) {
          toast.success(response?.message || "HeadMaster record aded succesfully")
          fetchData();
          setNewHeadMaster({ head_name: "", head_type: "" });
          setIsPopoverOpen(false);
        } else {
          setError("Failed to add HeadMaster.");
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to add HeadMaster.")
        setError("Failed to add HeadMaster.");
      }
    } else {
      toast.warn("Both Head Name and Head Type are required.");
    }
  };

  const handleEdit = (row) => {
    setEditingId(row._id);
    setEditedData({
      head_name: row.head_name,
      head_type: row.head_type,
    });
  };

  const handleUpdate = async (id) => {
    if (editedData.head_name.trim() && editedData.head_type.trim()) {
      try {
        const response = await updateHeadById(id, editedData)
        toast.success(response?.message || "HeadMaster record updated successfully.")
        fetchData();
        setEditingId(null);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to update HeadMaster records")
        setError("Failed to update HeadMaster.");
      }
    } else {
      toast.warn("Both Head Name and Head Type are required.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this HeadMaster?")) {
      try {
        const response = await deleteHeadById(id)
        toast.success(response?.message || "HeadMaster record deleted successfully.")
        fetchData();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to delete HeadMaster records")
        setError("Failed to delete HeadMaster.");
      }
    }
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
      name: "Head Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedData.head_name}
            onChange={(e) =>
              setEditedData({ ...editedData, head_name: e.target.value })
            }
          />
        ) : (
          row.head_name || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Head Type",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            as="select"
            value={editedData.head_type}
            onChange={(e) =>
              setEditedData({ ...editedData, head_type: e.target.value })
            }
          >
            <option value="">Select Head Type</option>
            <option value="Installment Type">Installment Type</option>
            <option value="Lifetime">Lifetime</option>
          </FormControl>
        ) : (
          row.head_type || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <>
              <button className="editButton" onClick={() => handleUpdate(row._id)}>
                <FaSave />
              </button>
              <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
                <FaTrashAlt />
              </button>
            </>
          ) : (
            <>
              <button className="editButton" onClick={() => handleEdit(row)}>
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
    { label: "Fee", link: "/fees/all-module" },
    { label: "head-master", link: "null" }
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
            <CgAddR /> Add HeadMaster
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New HeadMaster</h2>
                <button className="closeForm" onClick={() => setIsPopoverOpen(false)}>
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Head Name</FormLabel>
                    <FormControl
                      type="text"
                      value={newHeadMaster.head_name}
                      onChange={(e) =>
                        setNewHeadMaster({ ...newHeadMaster, head_name: e.target.value })
                      }
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Head Type</FormLabel>
                    <FormControl
                      as="select"
                      value={newHeadMaster.head_type}
                      onChange={(e) =>
                        setNewHeadMaster({ ...newHeadMaster, head_type: e.target.value })
                      }
                    >
                      <option value="">Select Head Type</option>
                      <option value="Installment Type">Installment Type</option>
                      <option value="Lifetime">Lifetime</option>
                    </FormControl>
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary mt-3">
                  Add HeadMaster
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>HeadMaster Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
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

export default dynamic(() => Promise.resolve(HeadMasterPage), { ssr: false });