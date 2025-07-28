"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { FaTrashAlt } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import { Form, Row, Col, Container, FormLabel, FormSelect, FormControl, Button } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import {
  addNewBookSuggestion,
  deleteBookSuggestionById,
  getAllBookSuggestions,
  getBookCategories,
  getLibraryGroups,
} from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const NewBookSuggestion = () => {
  const {hasEditAccess,hasSubmitAccess}=usePagePermission()
  const [bookCategories, setBookCategories] = useState([]);
  const [libraryGroups, setLibraryGroups] = useState([]);
  const [data, setData] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    itemGroup: "",
    bookCategory: "",
    bookName: "",
    itemLang: "",
    authorName: "",
    subject: "",
    publisherName: "",
    publishYear: "",
    edition: ""
  });

  const fetchAll = async () => {
    try {
      const [cats, groups] = await Promise.all([
        getBookCategories(),
        getLibraryGroups(),
      ]);
      setBookCategories(cats?.data || []);
      setLibraryGroups(groups?.data || []);
    } catch (error) {
      toast.error("Failed to load initial data");
      console.error("Fetch error:", error);
    }
  };
  const fetchData = async () => {
    const response = await getAllBookSuggestions();
    response.success && setData(response?.data)
  }

  useEffect(() => {
    fetchData()
    fetchAll();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear the error for the field being updated
    if (formErrors[name]) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      { field: "itemGroup", label: "Item Group" },
      { field: "bookCategory", label: "Item Category" },
      { field: "bookName", label: "Item Name" },
      { field: "itemLang", label: "Item Language" },
      { field: "authorName", label: "Author Name" },
      { field: "subject", label: "Subject" },
      { field: "publisherName", label: "Publisher Name" },
    ];

    const errors = {};
    let firstError = null;

    for (let { field, label } of requiredFields) {
      if (!formData[field]?.trim()) {
        errors[field] = `${label} is required`;
        if (!firstError) firstError = `${label} is required`;
      }
    }

    setFormErrors(errors);

    if (firstError) {
      toast.warn(firstError);
      return;
    }

    try {
      const response = await addNewBookSuggestion(formData)
      if (response?.success) {
        toast.success(response?.message || "Book Suggestion added successfully.")
        fetchData()
        setShowAddForm(false);
        setFormErrors({});
        setFormData({
          itemGroup: "",
          bookCategory: "",
          bookName: "",
          itemLang: "",
          authorName: "",
          subject: "",
          publisherName: "",
          publishYear: "",
          edition: ""
        });
      }
      else {
        toast.error(response?.message)
      }

    } catch (error) {
      console.error("Add suggestion failed:", error?.response?.data || error.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (row) => {
    try {
      if (!confirm("Are You sure to want to delete this record ?")) return
      console.log(row._id)
      const response = await deleteBookSuggestionById(row?._id)
      if (response?.success) {
        toast.success(response?.message || "Record deleted successfully")
        fetchData()
      }
      else {
        toast.error(response?.message || "Failed to  delete this record")
      }
    } catch (error) {
      console.log("Failed to delete book suggestion", error)
      toast.error(error?.response?.data?.message || "Failed to delete book suggestion")
    }
  };
  const breadcrumbItems = [
    { label: "Library", link: "/library/all-module" },
    { label: "New Book Suggestion", link: "null" }
  ];


  const columns = [
    { name: "#", selector: (row, index) => index + 1, sortable: false, width: "80px" },
    { name: "Item Group", selector: (row) => row.itemGroup?.groupName || "N/A" },
    { name: "Book Category", selector: (row) => row.bookCategory?.groupName || "N/A" },
    { name: "Book Name", selector: (row) => row.bookName || "N/A" },
    { name: "Language", selector: (row) => row.itemLang || "N/A" },
    { name: "Author Name", selector: (row) => row.authorName || "N/A" },
    { name: "Subject", selector: (row) => row.subject || "N/A" },
    { name: "Publisher Name", selector: (row) => row.publisherName || "N/A" },
    { name: "Publish Year", selector: (row) => row.publishYear || "N/A" },
    { name: "Edition", selector: (row) => row.edition || "N/A" },
    hasEditAccess &&{
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <button className="editButton btn-danger" onClick={() => handleDelete(row)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];
  const resetForm = () => {
    setFormData({
      itemGroup: "",
      bookCategory: "",
      bookName: "",
      itemLang: "",
      authorName: "",
      subject: "",
      publisherName: "",
      publishYear: "",
      edition: ""
    });
    setFormErrors({});
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
            <Button onClick={() => setShowAddForm(true)} className="btn-add">
            <CgAddR /> Add New Suggestion
          </Button>
          )}

          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>New Book Suggestion</h2>
                <button className="closeForm" onClick={() => { resetForm(); setShowAddForm(false); }}>X</button>
              </div>
              <Form className="formSheet" onSubmit={handleSubmit}>
                <Row className="mb-2">
                  <Col lg={4}>
                    <FormLabel className="labelForm">
                      Library Group<span className="text-danger">*</span>
                    </FormLabel>
                    <FormSelect
                      name="itemGroup"
                      value={formData.itemGroup}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      {libraryGroups?.map((lib) => (
                        <option value={lib._id} key={lib?._id}>
                          {lib.groupName}
                        </option>
                      ))}
                    </FormSelect>
                    {formErrors.itemGroup && (
                      <small className="text-danger">{formErrors.itemGroup}</small>
                    )}
                  </Col>

                  <Col lg={4}>
                    <FormLabel className="labelForm">
                      Subject<span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      name="subject"
                      placeholder="Enter Subject"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                    {formErrors.subject && (
                      <small className="text-danger">{formErrors.subject}</small>
                    )}
                  </Col>

                  <Col lg={4}>
                    <FormLabel className="labelForm">
                      Book Category<span className="text-danger">*</span>
                    </FormLabel>
                    <FormSelect
                      name="bookCategory"
                      value={formData.bookCategory}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      {bookCategories?.map((book) => (
                        <option value={book._id} key={book?._id}>
                          {book.groupName}
                        </option>
                      ))}
                    </FormSelect>
                    {formErrors.bookCategory && (
                      <small className="text-danger">{formErrors.bookCategory}</small>
                    )}
                  </Col>
                </Row>

                <Row className="mb-2">
                  <Col lg={4}>
                    <FormLabel className="labelForm">
                      Publisher Name<span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      name="publisherName"
                      placeholder="Enter Publisher Name"
                      value={formData.publisherName}
                      onChange={handleChange}
                    />
                    {formErrors.publisherName && (
                      <small className="text-danger">{formErrors.publisherName}</small>
                    )}
                  </Col>

                  <Col lg={4}>
                    <FormLabel className="labelForm">
                      Book Name<span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      name="bookName"
                      placeholder="Enter Book Name"
                      value={formData.bookName}
                      onChange={handleChange}
                    />
                    {formErrors.bookName && (
                      <small className="text-danger">{formErrors.bookName}</small>
                    )}
                  </Col>

                  <Col lg={4}>
                    <FormLabel className="labelForm">Publication Year</FormLabel>
                    <FormControl
                      type="text"
                      name="publishYear"
                      placeholder="Enter Publication Year"
                      value={formData.publishYear}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>

                <Row className="mb-2">
                  <Col lg={4}>
                    <FormLabel className="labelForm">
                      Item Language<span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      name="itemLang"
                      placeholder="Enter Language"
                      value={formData.itemLang}
                      onChange={handleChange}
                    />
                    {formErrors.itemLang && (
                      <small className="text-danger">{formErrors.itemLang}</small>
                    )}
                  </Col>

                  <Col lg={4}>
                    <FormLabel className="labelForm">Edition</FormLabel>
                    <FormControl
                      type="text"
                      name="edition"
                      placeholder="Enter Edition"
                      value={formData.edition}
                      onChange={handleChange}
                    />
                  </Col>

                  <Col lg={4}>
                    <FormLabel className="labelForm">
                      Author Name<span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      name="authorName"
                      placeholder="Enter Author Name"
                      value={formData.authorName}
                      onChange={handleChange}
                    />
                    {formErrors.authorName && (
                      <small className="text-danger">{formErrors.authorName}</small>
                    )}
                  </Col>
                </Row>

                <Button type="submit" className="btn btn-primary mt-3">
                  Add New Suggestion
                </Button>
              </Form>

            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Library Book Suggestions</h2>
            <Table columns={columns} data={data} />
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(NewBookSuggestion), { ssr: false });
