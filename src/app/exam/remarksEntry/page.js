"use client";

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import { CgAddR } from "react-icons/cg";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

import BreadcrumbComp from "@/app/component/Breadcrumb";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import {
  getAllRemarks,
  addNewRemark,
  updateRemarkById,
  deleteRemarkById
} from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const RemarksMaster = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission();
  const [remarks, setRemarks] = useState([]);
  const [remarkName, setRemarkName] = useState("");
  const [editId, setEditId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchRemarks();
  }, []);

  const fetchRemarks = async () => {
    setFetching(true);
    try {
      const res = await getAllRemarks();
      if (res.success) {
        setRemarks(res.data || []);
      } else {
        toast.error(res.message || "Failed to load remarks");
      }
    } catch {
      toast.error("Server error while fetching remarks");
    } finally {
      setFetching(false);
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!remarkName.trim()) errs.remarkName = "Remark name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      let res;
      if (editId) {
        res = await updateRemarkById(editId, { remarkName });
      } else {
        res = await addNewRemark({ remarkName });
      }
      if (res.success) {
        toast.success(res.message || (editId ? "Updated successfully" : "Added successfully"));
        resetForm();
        setIsPopoverOpen(false);
        fetchRemarks();
      } else {
        toast.error(res.message || "Operation failed");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setRemarkName(item.remarkName);
    setEditId(item._id);
    setIsPopoverOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this remark?")) return;
    try {
      const res = await deleteRemarkById(id);
      if (res.success) {
        toast.success(res.message || "Deleted successfully");
        fetchRemarks();
      } else {
        toast.error(res.message || "Failed to delete");
      }
    } catch {
      toast.error("Server error while deleting");
    }
  };

  const resetForm = () => {
    setRemarkName("");
    setEditId(null);
    setErrors({});
  };

  const handleCopy = () => {
    const headers = ["#", "EntryDate", "Remark"];
    const rows = remarks.map((item, idx) =>
      `${idx + 1}\t${new Date(item.entryDate).toLocaleDateString()}\t${item.remarkName}`
    );
    copyContent(headers, rows);
  };

  const handlePrint = () => {
    const headers = [["#", "EntryDate", "Remark"]];
    const rows = remarks.map((item, idx) => [
      idx + 1,
      new Date(item.entryDate).toLocaleDateString(),
      item.remarkName
    ]);
    printContent(headers, rows);
  };

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "80px" },
    { name: "EntryDate", selector: row => new Date(row.entryDate).toLocaleDateString(), sortable: true },
    { name: "Remark", selector: row => row.remarkName, sortable: true },
    hasEditAccess && {
      name: "Action",
      cell: row => (
        <>
          <Button variant="success" size="sm" className="me-2" onClick={() => handleEdit(row)}>
            <FaEdit />
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </Button>
        </>
      )
    }
  ].filter(Boolean);

  const breadcrumbItems = [
    { label: "Exams", link: "/exam/all-module" },
    { label: "Remarks Master", link: null }
  ];

  return (
    <>
      <div className="breadcrumbSheet">
        <Container>
          <Row>
            <Col><BreadcrumbComp items={breadcrumbItems} /></Col>
          </Row>
        </Container>
      </div>

      <section>
        <Container>
          {hasSubmitAccess && (
            <Button className="btn-add" onClick={() => { resetForm(); setIsPopoverOpen(true); }}>
              <CgAddR /> Add New Remark
            </Button>
          )}

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{editId ? "Edit" : "Add"} Remark</h2>
                <button className="closeForm" onClick={() => { resetForm(); setIsPopoverOpen(false); }}>X</button>
              </div>
              <Form className="formSheet mb-4">
                <Row>
                  <Col md={12}>
                    <Form.Label>Remark Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={remarkName}
                      onChange={(e) => setRemarkName(e.target.value)}
                      placeholder="Enter remark name"
                    />
                    {errors.remarkName && <div className="text-danger small mt-1">{errors.remarkName}</div>}
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>
                    <Button onClick={handleSubmit} disabled={loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : editId ? "Update" : "Submit"}
                    </Button>
                    <Button variant="secondary" className="ms-2" onClick={() => { resetForm(); setIsPopoverOpen(false); }}>
                      Cancel
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Remarks Records</h2>
            {fetching ? (
              <p>Loading...</p>
            ) : (
              <Table
                columns={columns}
                data={remarks}
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

export default dynamic(() => Promise.resolve(RemarksMaster), { ssr: false });
