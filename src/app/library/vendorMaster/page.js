"use client";

import React, { useEffect, useState } from "react";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import axios from "axios";
import Table from "@/app/component/DataTable";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FaEdit, FaTrash } from "react-icons/fa";

const VendorMaster = () => {
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const schema = Yup.object().shape({
    organizationName: Yup.string().required("Organization Name is required"),
    organizationType: Yup.string().required("Organization Type is required"),
    contactPersonName: Yup.string().required("Contact Person Name is required"),
    statusOfEnterprise: Yup.string().required("Status is required"),
    organizationAddress: Yup.string().required("Address is required"),
    itemCategory: Yup.string().required("Category is required"),
    organizationWebsite: Yup.string().url("Invalid URL").nullable(),
    tinNumber: Yup.string().nullable(),
    contactNumber: Yup.string().matches(/^\d{10,15}$/, "Invalid contact number").required("Contact number is required"),
    panNumber: Yup.string().nullable(),
    email: Yup.string().email("Invalid email").required("Email is required"),
    gstNumber: Yup.string().nullable(),
    remark: Yup.string().nullable(),
    exciseRegistrationNumber: Yup.string().nullable(),
    bankAccountNumber: Yup.string().nullable(),
    bankersNameWithAddress: Yup.string().nullable(),
    ifscCode: Yup.string().nullable(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const fetchVendors = async () => {
    try {
      const res = await axios.get("/api/vendors");
      setVendors(res.data.data);
    } catch {
      toast.error("Failed to fetch vendors");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/item-categories");
      setCategories(res.data.data);
    } catch {
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchCategories();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editId) {
        await axios.put(`/api/vendors/${editId}`, data);
        toast.success("Vendor updated");
      } else {
        await axios.post("/api/vendors", data);
        toast.success("Vendor added");
      }
      reset();
      setEditId(null);
      setIsPopoverOpen(false);
      fetchVendors();
    } catch {
      toast.error("Failed to save vendor");
    }
  };

  const handleEdit = (vendor) => {
    setEditId(vendor._id);
    reset(vendor);
    setIsPopoverOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await axios.delete(`/api/vendors/${id}`);
      toast.success("Vendor deleted");
      fetchVendors();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const columns = [
    { name: "#", selector: (row, i) => i + 1, width: "60px" },
    { name: "Org Name", selector: (row) => row.organizationName },
    { name: "Type", selector: (row) => row.organizationType },
    { name: "Contact Person", selector: (row) => row.contactPersonName },
    { name: "Status", selector: (row) => row.statusOfEnterprise },
    { name: "Category", selector: (row) => row.itemCategory?.categoryName || "-" },
    { name: "Contact", selector: (row) => row.contactNumber },
    { name: "Email", selector: (row) => row.email },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button size="sm" onClick={() => handleEdit(row)}><FaEdit /></Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}><FaTrash /></Button>
        </div>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: "Library", link: "/library/all-module" },
    { label: "Vendor Master", link: null },
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
          <Button onClick={() => setIsPopoverOpen(true)} className="btn-add mb-3">Add Vendor</Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{editId ? "Update Vendor" : "Add New Vendor"}</h2>
                <button className="closeForm" onClick={() => { setIsPopoverOpen(false); setEditId(null); reset(); }}>X</button>
              </div>
              <Form onSubmit={handleSubmit(onSubmit)} className="formSheet">
                <Row>
                  <Col md={4}><FormLabel>Organization Name</FormLabel><FormControl {...register("organizationName")} isInvalid={!!errors.organizationName} /></Col>
                  <Col md={4}><FormLabel>Organization Type</FormLabel><FormControl {...register("organizationType")} isInvalid={!!errors.organizationType} /></Col>
                  <Col md={4}><FormLabel>Contact Person</FormLabel><FormControl {...register("contactPersonName")} isInvalid={!!errors.contactPersonName} /></Col>
                  <Col md={4}><FormLabel>Status</FormLabel><FormControl {...register("statusOfEnterprise")} isInvalid={!!errors.statusOfEnterprise} /></Col>
                  <Col md={4}><FormLabel>Address</FormLabel><FormControl {...register("organizationAddress")} isInvalid={!!errors.organizationAddress} /></Col>
                  <Col md={4}><FormLabel>Item Category</FormLabel>
                    <Form.Select {...register("itemCategory")} isInvalid={!!errors.itemCategory}>
                      <option value="">Select Category</option>
                      {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.categoryName}</option>)}
                    </Form.Select>
                  </Col>
                  <Col md={4}><FormLabel>Website</FormLabel><FormControl {...register("organizationWebsite")} isInvalid={!!errors.organizationWebsite} /></Col>
                  <Col md={4}><FormLabel>TIN Number</FormLabel><FormControl {...register("tinNumber")} isInvalid={!!errors.tinNumber} /></Col>
                  <Col md={4}><FormLabel>Contact Number</FormLabel><FormControl {...register("contactNumber")} isInvalid={!!errors.contactNumber} /></Col>
                  <Col md={4}><FormLabel>PAN Number</FormLabel><FormControl {...register("panNumber")} isInvalid={!!errors.panNumber} /></Col>
                  <Col md={4}><FormLabel>Email</FormLabel><FormControl {...register("email")} isInvalid={!!errors.email} /></Col>
                  <Col md={4}><FormLabel>GST Number</FormLabel><FormControl {...register("gstNumber")} isInvalid={!!errors.gstNumber} /></Col>
                  <Col md={4}><FormLabel>Remark</FormLabel><FormControl {...register("remark")} isInvalid={!!errors.remark} /></Col>
                  <Col md={4}><FormLabel>Excise Reg. Number</FormLabel><FormControl {...register("exciseRegistrationNumber")} isInvalid={!!errors.exciseRegistrationNumber} /></Col>
                  <Col md={4}><FormLabel>Bank A/C Number</FormLabel><FormControl {...register("bankAccountNumber")} isInvalid={!!errors.bankAccountNumber} /></Col>
                  <Col md={4}><FormLabel>Bankers Name & Address</FormLabel><FormControl {...register("bankersNameWithAddress")} isInvalid={!!errors.bankersNameWithAddress} /></Col>
                  <Col md={4}><FormLabel>IFSC Code</FormLabel><FormControl {...register("ifscCode")} isInvalid={!!errors.ifscCode} /></Col>
                </Row>
                <Button type="submit" className="mt-3">{editId ? "Update" : "Add"} Vendor</Button>
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Vendor Records</h2>
            <Table columns={columns} data={vendors} />
          </div>
        </Container>
      </section>
    </>
  );
};

export default VendorMaster;
