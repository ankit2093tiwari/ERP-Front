"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import { CgAddR } from 'react-icons/cg';
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { addNewRack, addNewShelf, deleteRackById, deleteShelfById, getAllRacks, getAllShelves, updateRackById, updateShelfById } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const RackAndShelfManager = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission()
  const [racks, setRacks] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ rackName: "", shelfName: "", rackId: "" });
  const [errors, setErrors] = useState({});
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editShelfId, setEditShelfId] = useState(null);
  const [editRackId, setEditRackId] = useState(null);

  const fetchRacks = async () => {
    try {
      const response = await getAllRacks();
      setRacks(response.data || []);
    } catch (err) {
      setError("Failed to fetch racks");
    }
  };

  const fetchShelves = async () => {
    try {
      const response = await getAllShelves();
      setShelves(response.data || []);
    } catch (err) {
      setError("Failed to fetch shelves");
    }
  };

  useEffect(() => {
    fetchRacks();
    fetchShelves();
  }, []);

  const handleAddRack = async () => {
    const newErrors = {};
    if (!formData.rackName.trim()) newErrors.rackName = "Rack Name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.warning("Please fill all required fields");
      return;
    }

    try {
      if (editRackId) {
        const res = await updateRackById(editRackId, { rackName: formData.rackName });
        toast.success(res.message || "Rack updated successfully");
      } else {
        const response = await addNewRack({ rackName: formData.rackName });
        toast.success(response.message || "Rack added successfully");
      }
      setFormData({ ...formData, rackName: "" });
      setErrors({});
      setEditRackId(null);
      fetchRacks();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save rack");
    }
  };

  const handleEditRack = (rack) => {
    setFormData({ ...formData, rackName: rack.rackName });
    setEditRackId(rack._id);
    setIsPopoverOpen(true);
  };

  const handleDeleteRack = async (id) => {
    if (!confirm("Are you sure you want to delete this rack and its shelves?")) return;
    try {
      await deleteRackById(id);
      fetchRacks();
      fetchShelves();
      toast.success("Rack deleted successfully!");
    } catch {
      toast.error("Failed to delete rack");
    }
  };

  const handleEditShelf = (shelf) => {
    setFormData({ shelfName: shelf.shelfName, rackId: shelf.rackId?._id || shelf.rackId });
    setEditShelfId(shelf._id);
    setIsPopoverOpen(true);
  };

  const handleAddShelf = async () => {
    const newErrors = {};
    if (!formData.rackId) newErrors.rackId = "Rack is required";
    if (!formData.shelfName.trim()) newErrors.shelfName = "Shelf Name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.warning("Please fill all required fields");
      return;
    }

    try {
      if (editShelfId) {
        const res = await updateShelfById(editShelfId, {
          rackId: formData.rackId,
          shelfName: formData.shelfName,
        });
        toast.success(res.message || "Shelf updated successfully!");
      } else {
        await addNewShelf({ rackId: formData.rackId, shelfName: formData.shelfName });
        toast.success("Shelf added successfully!");
      }
      setFormData({ ...formData, shelfName: "", rackId: "" });
      setErrors({});
      setEditShelfId(null);
      fetchShelves();
    } catch {
      toast.error("Failed to save shelf");
    }
  };

  const handleDeleteShelf = async (id) => {
    if (!confirm("Are you sure you want to delete this shelf?")) return;
    try {
      await deleteShelfById(id);
      fetchShelves();
      toast.success("Shelf deleted successfully!");
    } catch {
      toast.error("Failed to delete shelf");
    }
  };

  const handleCopyRacks = () => {
    const headers = ["#", "Rack Name"];
    const rows = racks.map((row, index) => `${index + 1}\t${row.rackName || "N/A"}`);
    copyContent(headers, rows);
  };

  const handlePrintRacks = () => {
    const headers = [["#", "Rack Name"]];
    const rows = racks.map((row, index) => [index + 1, row.rackName || "N/A"]);
    printContent(headers, rows);
  };

  const handleCopyShelves = () => {
    const headers = ["#", "Rack", "Shelf Name"];
    const rows = shelves.map((row, index) => `${index + 1}\t${row.rackId?.rackName || "N/A"}\t${row.shelfName}`);
    copyContent(headers, rows);
  };

  const handlePrintShelves = () => {
    const headers = [["#", "Rack", "Shelf Name"]];
    const rows = shelves.map((row, index) => [index + 1, row.rackId?.rackName || "N/A", row.shelfName]);
    printContent(headers, rows);
  };

  const shelfColumns = [
    { name: "#", selector: (row, index) => index + 1 },
    { name: "Rack", selector: (row) => row.rackId?.rackName || "N/A", sortable: true },
    { name: "Shelf Name", selector: (row) => row.shelfName },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button variant="info" size="sm" onClick={() => handleEditShelf(row)}><FaEdit /></Button>
          <Button variant="danger" size="sm" onClick={() => handleDeleteShelf(row._id)}><FaTrashAlt /></Button>
        </div>
      ),
    },
  ];

  const rackColumns = [
    { name: "#", selector: (row, index) => index + 1 },
    { name: "Rack Name", selector: (row) => row.rackName, sortable: true },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button variant="info" size="sm" onClick={() => handleEditRack(row)}><FaEdit /></Button>
          <Button variant="danger" size="sm" onClick={() => handleDeleteRack(row._id)}><FaTrashAlt /></Button>
        </div>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: "Library", link: "/library/all-module" },
    { label: "Rack & Shelf Master", link: null },
  ];

  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row className="mt-1 mb-1">
            <Col><BreadcrumbComp items={breadcrumbItems} /></Col>
          </Row>
        </Container>
      </div>

      <section>
        <Container>
          {hasSubmitAccess && (
            <Button onClick={() => setIsPopoverOpen(!isPopoverOpen)} className="btn-add">
              <CgAddR /> Add Rack/Shelf
            </Button>
          )}

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add Rack & Shelf</h2>
                <button className="closeForm" onClick={() => setIsPopoverOpen(false)}>X</button>
              </div>
              <Form className="formSheet">
                <Row className="mt-3">
                  <Col lg={6} className="mb-3">
                    <div className="p-3 shadow-sm rounded bg-white">
                      <h5 className="mb-3">Add Rack</h5>
                      <FormLabel>Rack Name <span className="text-danger">*</span></FormLabel>
                      <FormControl
                        type="text"
                        placeholder="Enter Rack Name"
                        value={formData.rackName}
                        isInvalid={!!errors.rackName}
                        onChange={(e) => {
                          setFormData({ ...formData, rackName: e.target.value });
                          setErrors(prev => ({ ...prev, rackName: null }));
                        }}
                      />
                      <Form.Control.Feedback type="invalid">{errors.rackName}</Form.Control.Feedback>
                      <Button variant="primary" className="mt-3 w-100" onClick={handleAddRack}>
                        {editRackId ? "Update Rack" : "Add Rack"}
                      </Button>
                    </div>
                  </Col>

                  <Col lg={6} className="mb-3">
                    <div className="p-3 shadow-sm rounded bg-white">
                      <h5 className="mb-3">Add Shelf</h5>
                      <FormLabel>Select Rack <span className="text-danger">*</span></FormLabel>
                      <Form.Select
                        value={formData.rackId}
                        isInvalid={!!errors.rackId}
                        onChange={(e) => {
                          setFormData({ ...formData, rackId: e.target.value });
                          setErrors(prev => ({ ...prev, rackId: null }));
                        }}
                      >
                        <option value="">Select Rack</option>
                        {racks.map(rack => (
                          <option key={rack._id} value={rack._id}>{rack.rackName}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.rackId}</Form.Control.Feedback>

                      <FormLabel className="mt-2">Shelf Name <span className="text-danger">*</span></FormLabel>
                      <FormControl
                        type="text"
                        placeholder="Enter Shelf Name"
                        value={formData.shelfName}
                        isInvalid={!!errors.shelfName}
                        onChange={(e) => {
                          setFormData({ ...formData, shelfName: e.target.value });
                          setErrors(prev => ({ ...prev, shelfName: null }));
                        }}
                      />
                      <Form.Control.Feedback type="invalid">{errors.shelfName}</Form.Control.Feedback>
                      <Button variant="primary" className="mt-3 w-100" onClick={handleAddShelf}>
                        {editShelfId ? "Update Shelf" : "Add Shelf"}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Shelf Records</h2>
            {loading ? <p>Loading...</p> : (
              <Table
                columns={shelfColumns}
                data={shelves}
                handleCopy={handleCopyShelves}
                handlePrint={handlePrintShelves}
              />
            )}
          </div>

          <div className="tableSheet mt-4">
            <h2>Rack Records</h2>
            {loading ? <p>Loading...</p> : (
              <Table
                columns={rackColumns}
                data={racks}
                handleCopy={handleCopyRacks}
                handlePrint={handlePrintRacks}
              />
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(RackAndShelfManager), { ssr: false });
