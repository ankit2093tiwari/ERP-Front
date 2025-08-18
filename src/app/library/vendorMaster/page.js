"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
} from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FaEdit, FaTrash, FaTrashAlt } from "react-icons/fa";
import { addNewLibraryVendor, deleteLibraryVendorById, getItemCategories, getLibraryVendors, updateLibraryVendorById } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const VendorMaster = () => {
  const {hasEditAccess, hasSubmitAccess}=usePagePermission()
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  //defined schema for validation
  const schema = Yup.object().shape({
    organizationName: Yup.string().required("Organization Name is required"),
    organizationType: Yup.string().required("Organization Type is required"),
    contactPersonName: Yup.string().required("Contact Person Name is required"),
    statusOfEnterprise: Yup.string().required("Status is required"),
    organizationAddress: Yup.string().required("Address is required"),
    itemCategory: Yup.string().required("Category is required"),
    organizationWebsite: Yup.string().url("Invalid URL").nullable().notRequired(),
    tinNumber: Yup.string().nullable(),
    contactNumber: Yup.string()
      .matches(/^\d{10,15}$/, "Invalid contact number")
      .required("Contact number is required"),
    panNumber: Yup.string().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN Number").nullable(),
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
  const defaultFormValues = {
    organizationName: "",
    organizationType: "",
    contactPersonName: "",
    statusOfEnterprise: "",
    organizationAddress: "",
    itemCategory: "",
    organizationWebsite: "",
    tinNumber: "",
    contactNumber: "",
    panNumber: "",
    email: "",
    gstNumber: "",
    remark: "",
    exciseRegistrationNumber: "",
    bankAccountNumber: "",
    bankersNameWithAddress: "",
    ifscCode: "",
  };

  const fetchVendors = async () => {
    try {
      const res = await getLibraryVendors()
      setVendors(res?.data);
    } catch {
      toast.error("Failed to fetch vendors");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getItemCategories();
      setCategories(res.data);
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
        await updateLibraryVendorById(editId, data)
        toast.success("Vendor updated");
      } else {
        await addNewLibraryVendor(data)
        toast.success("Vendor added successfully");
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
    reset({
      ...vendor,
      itemCategory: vendor.itemCategory?._id || "",
    });
    setIsPopoverOpen(true);
  };


  const handleDelete = async (id) => {
    if (!confirm("Are you sure to want to delete this record?")) return;
    try {
      await deleteLibraryVendorById(id)
      toast.success("Vendor deleted successfully..");
      fetchVendors();
    } catch (err) {
      console.log(err);

      toast.error("Failed to delete");
    }
  };

  const columns = [
    { name: "#", selector: (row, i) => i + 1, width: "60px" },
    { name: "Org Name", selector: (row) => row.organizationName },
    { name: "Type", selector: (row) => row.organizationType },
    { name: "Contact Person", selector: (row) => row.contactPersonName },
    { name: "Status", selector: (row) => row.statusOfEnterprise },
    {
      name: "Category",
      selector: (row) => row.itemCategory?.categoryName || "-",
    },
    { name: "Contact", selector: (row) => row.contactNumber },
    { name: "Email", selector: (row) => row.email },
    hasEditAccess &&{
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button
            size="sm"
            variant="success"
            onClick={() => handleEdit(row)}
            title="Edit"
          >
            <FaEdit />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(row._id)}
            title="Delete"
          >
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: "Library", link: "/library/all-module" },
    { label: "Vendor Master", link: null },
  ];

  const formFields = [
    ["organizationName", "Organization Name"],
    // ["organizationType", "Organization Type"],
    ["contactPersonName", "Contact Person"],
    // ["statusOfEnterprise", "Status Of Enterprise"],
    ["organizationAddress", "Address"],
    ["organizationWebsite", "Website"],
    ["tinNumber", "TIN Number"],
    ["contactNumber", "Contact Number"],
    ["panNumber", "PAN Number"],
    ["email", "Email"],
    ["gstNumber", "GST Number"],
    ["exciseRegistrationNumber", "Excise Reg. Number"],
    ["bankAccountNumber", "Bank A/C Number"],
    ["bankersNameWithAddress", "Banker's Name & Address"],
    ["ifscCode", "IFSC Code"],
    ["remark", "Remark"],
  ];

  const handleCopyVendors = () => {
    const headers = ["#", "Org Name", "Type", "Contact Person", "Status", "Category", "Contact", "Email"];
    const rows = vendors.map((vendor, index) =>
      `${index + 1}\t${vendor.organizationName || "N/A"}\t${vendor.organizationType || "N/A"}\t${vendor.contactPersonName || "N/A"}\t${vendor.statusOfEnterprise || "N/A"}\t${vendor.itemCategory?.categoryName || "N/A"}\t${vendor.contactNumber || "N/A"}\t${vendor.email || "N/A"}`
    );
    copyContent(headers, rows);
  };

  const handlePrintVendors = () => {
    const headers = [["#", "Org Name", "Type", "Contact Person", "Status", "Category", "Contact", "Email"]];
    const rows = vendors.map((vendor, index) => [
      index + 1,
      vendor.organizationName || "N/A",
      vendor.organizationType || "N/A",
      vendor.contactPersonName || "N/A",
      vendor.statusOfEnterprise || "N/A",
      vendor.itemCategory?.categoryName || "N/A",
      vendor.contactNumber || "N/A",
      vendor.email || "N/A"
    ]);
    printContent(headers, rows);
  };

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
          {hasSubmitAccess &&(
            <Button
            onClick={() => {
              setEditId(null);
              reset(defaultFormValues);
              setIsPopoverOpen(true);
            }}
            className="btn-add mb-3"
          >
            Add Vendor
          </Button>
          )}
          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{editId ? "Update Vendor" : "Add New Vendor"}</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setEditId(null);
                    reset(defaultFormValues);
                  }}
                >
                  X
                </button>
              </div>
              <Form onSubmit={handleSubmit(onSubmit)} className="formSheet">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-2">
                      <FormLabel>Organization Type</FormLabel>
                      <Form.Select
                        {...register("organizationType")}
                        isInvalid={!!errors.organizationType}
                      >
                        <option value="">Select Organization type</option>
                        {["Manufacturer", "Distributor", "Dealer", "Retailer"].map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.organizationType?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-2">
                      <FormLabel>Status of Enterprise</FormLabel>
                      <Form.Select
                        {...register("statusOfEnterprise")}
                        isInvalid={!!errors.statusOfEnterprise}
                      >
                        <option value="">Select Status</option>
                        {["Proprietorship", "Partnership", "Pvt. Ltd"].map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.statusOfEnterprise?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-2">
                      <FormLabel>Item Category</FormLabel>
                      <Form.Select
                        {...register("itemCategory")}
                        isInvalid={!!errors.itemCategory}
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.categoryName}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.itemCategory?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  {formFields.map(([field, label]) => (
                    <Col md={6} key={field}>
                      <Form.Group className="mb-2">
                        <FormLabel>{label}</FormLabel>
                        <FormControl
                          {...register(field)}
                          isInvalid={!!errors[field]}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors[field]?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  ))}
                </Row>
                <Button type="submit" variant="success" className="mt-3">
                  {editId ? "Update" : "Add"} Vendor
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Vendor Records</h2>
            <Table columns={columns} data={vendors} handleCopy={handleCopyVendors}
              handlePrint={handlePrintVendors} />
          </div>
        </Container>
      </section>
    </>
  );
};

export default VendorMaster;
