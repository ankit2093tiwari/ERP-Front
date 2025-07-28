"use client";
import React, { useEffect, useState } from 'react';
import Table from '@/app/component/DataTable';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import { Container, Row, Col, Form, FormLabel, FormControl, FormSelect, Button } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { addNewAddressbook, deleteAddressBookById, getAllAddressBooks, updateAddressBookById } from '@/Services';
import { toast } from 'react-toastify';
import { copyContent, printContent } from '@/app/utils';

const AddressBook = () => {
  const [data, setData] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    homePhone: '',
    presentAddress: '',
    mobileNo: '',
    location: '',
    email: '',
    remarks: '',
    faxNo: '',
    officePhone: ''
  });

  const validate = (name, value) => {
    let error = '';
    if (name === 'mobileNo' || name === 'homePhone' || name === 'officePhone' || name === 'faxNo') {
      if (value && !/^\d{10}$/.test(value)) {
        error = `${name} must be 10 digits.`;
      }
    }
    if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Invalid email format.';
    }
    if (!value && ['name', 'homePhone', 'presentAddress', 'mobileNo', 'location', 'email'].includes(name)) {
      error = `${name} is required.`;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const fetchAddressData = async () => {
    const res = await getAllAddressBooks();
    setData(res?.data || []);
  };

  useEffect(() => {
    fetchAddressData();
  }, []);

  const handleCopy = () => {
    const headers = [
      "#", "Name", "Location", "Address", "Mobile No.", "email"
    ];
    const rows = data.map((row, index) => (
      [
        index + 1 || "N/A",
        row.name || "N/A",
        row.location || "N/A",
        row.presentAddress || "N/A",
        row.mobileNo || "N/A",
        row.email || "N/A"
      ].join("\t")
    ))
    copyContent(headers, rows)
  }
  const handlePrint = () => {
    const headers = [
      ["#", "Name", "Location", "Address", "Mobile No.", "email"]
    ];
    const rows = data.map((row, index) => (
      [
        index + 1 || "N/A",
        row.name || "N/A",
        row.location || "N/A",
        row.presentAddress || "N/A",
        row.mobileNo || "N/A",
        row.email || "N/A"
      ]
    ))
    printContent(headers, rows)
  }
  const columns = [
    {
      name: '#',
      selector: (row, index) => index + 1,
      sortable: false,
      width: '70px',
    },
    { name: 'Name', selector: row => row.name || "N/A", sortable: true },
    { name: 'Location', selector: row => row.location || "N/A", sortable: true },
    { name: 'Address', selector: row => row.presentAddress || "N/A", sortable: true },
    { name: 'Mobile No', selector: row => row.mobileNo || "N/A", sortable: true },
    { name: 'Email', selector: row => row.email || "N/A", sortable: true },
    { name: 'Remarks', selector: row => row.remarks || "N/A", sortable: true },
    {
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-1">
          <button className="editButton" onClick={() => handleEdit(row)}><FaEdit /></button>
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}><FaTrashAlt /></button>
        </div>
      )
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validate(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = {};
    Object.entries(formData).forEach(([key, value]) => validate(key, value));
    if (Object.values(errors).some(err => err)) return;

    try {
      if (isEdit) {
        await updateAddressBookById(editId, formData);
        toast.success("Record updated successfully!");
      } else {
        await addNewAddressbook(formData);
        toast.success("Address Book record added!");
      }
      setShowAddForm(false);
      setIsEdit(false);
      setEditId(null);
      setFormData({ name: '', homePhone: '', presentAddress: '', mobileNo: '', location: '', email: '', remarks: '', faxNo: '', officePhone: '' });
      fetchAddressData();
    } catch (error) {
      toast.error("Error occurred while saving record.");
    }
  };

  const handleEdit = (row) => {
    setFormData({ ...row });
    setEditId(row._id);
    setIsEdit(true);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      try {
        const response = await deleteAddressBookById(id);
        toast.success(response?.message || "Addressbook deleted successfully!")
        fetchAddressData()
      } catch (error) {
        console.error('failed to delete addressbook!', error)
        toast.error(error.response?.data.message || 'failed to delete addressbook!')
      }
    }
  };

  const breadcrumbItems = [
    { label: "Front Office", link: "/front-office/all-module" },
    { label: "Address Book", link: "null" }
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
          <Button onClick={() => { setShowAddForm(true); setIsEdit(false); setFormData({ name: '', homePhone: '', presentAddress: '', mobileNo: '', location: '', email: '', remarks: '', faxNo: '', officePhone: '' }); }} className="btn-add">
            <CgAddR /> Add New Contact
          </Button>

          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{isEdit ? 'Edit Contact' : 'Add New Contact'}</h2>
                <button className="closeForm" onClick={() => setShowAddForm(false)}>X</button>
              </div>
              <Form onSubmit={handleSubmit} className="formSheet">
                <Row>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Name</FormLabel>
                    <FormControl type="text" name="name" value={formData.name} onChange={handleChange} isInvalid={!!errors.name} placeholder="Enter Name" />
                    <div className="text-danger">{errors.name}</div>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Home Phone</FormLabel>
                    <FormControl type="text" name="homePhone" value={formData.homePhone} onChange={handleChange} isInvalid={!!errors.homePhone} placeholder="Enter Home Phone" />
                    <div className="text-danger">{errors.homePhone}</div>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Present Address</FormLabel>
                    <FormControl as="textarea" name="presentAddress" value={formData.presentAddress} onChange={handleChange} isInvalid={!!errors.presentAddress} placeholder="Enter Address" />
                    <div className="text-danger">{errors.presentAddress}</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Mobile No</FormLabel>
                    <FormControl type="text" name="mobileNo" value={formData.mobileNo} onChange={handleChange} isInvalid={!!errors.mobileNo} placeholder="Enter Mobile Number" />
                    <div className="text-danger">{errors.mobileNo}</div>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Location</FormLabel>
                    <FormSelect name="location" value={formData.location} onChange={handleChange} isInvalid={!!errors.location}>
                      <option value="">Select Location</option>
                      <option value="Kanpur">Kanpur</option>
                      <option value="Lucknow">Lucknow</option>
                      <option value="Raebareli">Raebareli</option>
                      <option value="prayagRaj">PrayagRaj</option>
                      <option value="Jhanshi">Jhanshi</option>
                      <option value="Varanasi">Varanasi</option>
                      <option value="Oyal">Oyal</option>
                      <option value="Agra">Agra</option>
                    </FormSelect>
                    <div className="text-danger">{errors.location}</div>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Email</FormLabel>
                    <FormControl type="email" name="email" value={formData.email} onChange={handleChange} isInvalid={!!errors.email} placeholder="Enter Email" />
                    <div className="text-danger">{errors.email}</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Remarks</FormLabel>
                    <FormControl type="text" name="remarks" value={formData.remarks} onChange={handleChange} />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Office Phone</FormLabel>
                    <FormControl type="text" name="officePhone" value={formData.officePhone} onChange={handleChange} isInvalid={!!errors.officePhone} placeholder="Enter Office Phone" />
                    <div className="text-danger">{errors.officePhone}</div>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Fax No</FormLabel>
                    <FormControl type="text" name="faxNo" value={formData.faxNo} onChange={handleChange} isInvalid={!!errors.faxNo} placeholder="Enter Fax Number" />
                    <div className="text-danger">{errors.faxNo}</div>
                  </Col>
                </Row>
                <Button type="submit" className="btn btn-primary mt-3">
                  {isEdit ? 'Update' : 'Submit'}
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Address Book Records</h2>
            <Table columns={columns} data={data} handleCopy={handleCopy} handlePrint={handlePrint}/>
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(AddressBook), { ssr: false });
