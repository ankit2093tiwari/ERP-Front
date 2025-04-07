"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { FaTrashAlt } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import { Form, Row, Col, Container, FormLabel, FormSelect, FormControl, Button } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const NewBookSuggestion = () => {
  const [data, setData] = useState([
    {
      id: 1,
      itemGroup: "School Books",
      itemCategory: "Central Library",
      itemName: "Sample Book",
      itemLang: "English",
      authorName: "John Doe",
      subject: "Mathematics",
      publishName: "Sample Publisher",
      publishYear: "2023",
      edition: "1st"
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    itemGroup: "",
    itemCategory: "",
    itemName: "",
    itemLang: "",
    authorName: "",
    subject: "",
    publishName: "",
    publishYear: "",
    edition: ""
  });

  const columns = [
    {
      name: "#",
      selector: (row) => row.id,
      sortable: true,
      width: "80px",
    },
    {
      name: "Item Group",
      selector: (row) => row.itemGroup || "N/A",
      sortable: false,
    },
    {
      name: "Item Category",
      selector: (row) => row.itemCategory || "N/A",
      sortable: false,
    },
    {
      name: "Item Name",
      selector: (row) => row.itemName || "N/A",
      sortable: false,
    },
    {
      name: "Item Language",
      selector: (row) => row.itemLang || "N/A",
      sortable: false,
    },
    {
      name: "Author Name",
      selector: (row) => row.authorName || "N/A",
      sortable: false,
    },
    {
      name: "Subject",
      selector: (row) => row.subject || "N/A",
      sortable: false,
    },
    {
      name: "Publisher Name",
      selector: (row) => row.publishName || "N/A",
      sortable: false,
    },
    {
      name: "Publish Year",
      selector: (row) => row.publishYear || "N/A",
      sortable: false,
    },
    {
      name: "Edition",
      selector: (row) => row.edition || "N/A",
      sortable: false,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button 
            className="editButton btn-danger" 
            onClick={() => handleDelete(row)}
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const handleDelete = (row) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      setData((prevData) => prevData.filter((item) => item.id !== row.id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.itemName || !formData.authorName) {
      alert("Item Name and Author Name are required.");
      return;
    }
    
    const newEntry = {
      id: data.length + 1,
      ...formData
    };
    
    setData([...data, newEntry]);
    setShowAddForm(false);
    setFormData({
      itemGroup: "",
      itemCategory: "",
      itemName: "",
      itemLang: "",
      authorName: "",
      subject: "",
      publishName: "",
      publishYear: "",
      edition: ""
    });
  };

  const breadcrumbItems = [
    { label: "Library", link: "/library/all-module" }, 
    { label: "New Book Suggestion", link: "null" }
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
          <Button onClick={() => setShowAddForm(true)} className="btn-add">
            <CgAddR /> Add New Suggestion
          </Button>
          
          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Suggestion</h2>
                <button className="closeForm" onClick={() => setShowAddForm(false)}>
                  X
                </button>
              </div>
              <Form className="formSheet" onSubmit={handleSubmit}>
                <Row>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Item Group</FormLabel>
                    <FormSelect
                      value={formData.itemGroup}
                      onChange={(e) => setFormData({...formData, itemGroup: e.target.value})}
                    >
                      <option value="">Select</option>
                      <option value="School Books">School Books</option>
                      <option value="Current Affairs">Current Affairs</option>
                      <option value="Comic Book">Comic Book</option>
                    </FormSelect>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Subject</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Item Category</FormLabel>
                    <FormSelect
                      value={formData.itemCategory}
                      onChange={(e) => setFormData({...formData, itemCategory: e.target.value})}
                    >
                      <option value="">Select</option>
                      <option value="Central Library">Central Library</option>
                      <option value="Information Technology">Information Technology</option>
                    </FormSelect>
                  </Col>
                </Row>
                <Row>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Publisher Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Publisher Name"
                      value={formData.publishName}
                      onChange={(e) => setFormData({...formData, publishName: e.target.value})}
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Item Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Item Name"
                      value={formData.itemName}
                      onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Publication Year</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Publication Year"
                      value={formData.publishYear}
                      onChange={(e) => setFormData({...formData, publishYear: e.target.value})}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Item Language</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Language"
                      value={formData.itemLang}
                      onChange={(e) => setFormData({...formData, itemLang: e.target.value})}
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Edition</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Edition"
                      value={formData.edition}
                      onChange={(e) => setFormData({...formData, edition: e.target.value})}
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Author Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Author Name"
                      value={formData.authorName}
                      onChange={(e) => setFormData({...formData, authorName: e.target.value})}
                      required
                    />
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