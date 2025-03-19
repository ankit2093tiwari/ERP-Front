"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { Container, Row, Col, Breadcrumb, Form, FormGroup, FormLabel, FormControl, FormSelect, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import Table from '@/app/component/DataTable'; // Ensure the path is correct
import { CgAddR } from 'react-icons/cg';
import BreadcrumbComp from "@/app/component/Breadcrumb";

const VendorMaster = () => {
  const [data, setData] = useState([]); // Data for the table
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(''); // Error message
  const [successMessage, setSuccessMessage] = useState(''); // Success message
  // const [showAddForm, setShowAddForm] = useState(false); 
  const [newVendor, setNewVendor] = useState({
    organizationName: '',
    organizationType: '',
    contactPersonName: '',
    organizationAddress: '',
    statusOfEnterprise: '',
    itemCategory: '',
    organizationWebAddress: '',
    tinNo: '',
    contactNo: '',
    panNo: '',
    emailId: '',
    gstNo: '',
    remark: '',
    exciseRegistrationNo: '',
    bankerName: '',
    bankAccountNo: '',
    ifscCode: ''
  }); // New vendor form state
  const [editingVendorId, setEditingVendorId] = useState(null); // Track if we're editing a vendor

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('https://erp-backend-fy3n.onrender.com/api/vendors'); // Replace with actual API endpoint
      setData(response.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch vendors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const onOpen = () => setIsPopoverOpen(true);
  const onClose = () => setIsPopoverOpen(false);

  // Add new vendor
  const handleAdd = async () => {
    if (!newVendor.organizationName.trim()) {
      alert('Please enter an organization name.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('https://erp-backend-fy3n.onrender.com/api/vendor', newVendor); // Replace with actual API endpoint
      setData((prevData) => [...prevData, response.data]);
      setNewVendor({ organizationName: '', organizationType: '', contactPersonName: '', organizationAddress: '', statusOfEnterprise: '', itemCategory: '', organizationWebAddress: '', tinNo: '', contactNo: '', panNo: '', emailId: '', gstNo: '', remark: '', exciseRegistrationNo: '', bankerName: '', bankAccountNo: '', ifscCode: '' });
      setShowAddForm(false);
      setSuccessMessage('Vendor added successfully!');
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Failed to add vendor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Edit vendor
  const handleEdit = async (id) => {
    const vendor = data.find((item) => item._id === id);
    if (!vendor) return;
    setEditingVendorId(id); // Set the vendor ID to mark as editing
    setNewVendor(vendor); // Populate form with vendor data
    setShowAddForm(true); // Show the form
  };

  // Save updated vendor
  const handleUpdate = async () => {
    if (!newVendor.organizationName.trim()) {
      alert('Please enter an organization name.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.put(`https://erp-backend-fy3n.onrender.com/api/vendor/${editingVendorId}`, newVendor); // Replace with actual API endpoint
      setData((prevData) =>
        prevData.map((item) => (item._id === editingVendorId ? { ...item, ...newVendor } : item))
      );
      setNewVendor({ organizationName: '', organizationType: '', contactPersonName: '', organizationAddress: '', statusOfEnterprise: '', itemCategory: '', organizationWebAddress: '', tinNo: '', contactNo: '', panNo: '', emailId: '', gstNo: '', remark: '', exciseRegistrationNo: '', bankerName: '', bankAccountNo: '', ifscCode: '' });
      setShowAddForm(false);
      setEditingVendorId(null);
      setSuccessMessage('Vendor updated successfully!');
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Failed to update vendor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete vendor
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;

    setLoading(true);
    try {
      await axios.delete(`https://erp-backend-fy3n.onrender.com/api/vendor/${id}`); // Replace with actual API endpoint
      setData((prevData) => prevData.filter((item) => item._id !== id));
      setSuccessMessage('Vendor deleted successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to delete vendor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      name: '#',
      selector: (_, index) => index + 1,
      sortable: false,
      width: '80px',
    },
    {
      name: 'Organization Name',
      selector: (row) => row.organizationName || 'N/A',
      sortable: true,
    },
    {
      name: 'Organization Type',
      selector: (row) => row.organizationType || 'N/A',
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button>
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];
  const breadcrumbItems = [{ label: "Stock", link: "/stock/all-module" }, { label: "Vendor  Master", link: "null" }]
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
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
          <Row>
            <Col>
              <Button onClick={onOpen} className="btn-add">
                <CgAddR /> Add New Vendor
              </Button>
              {isPopoverOpen && (
                <div className="cover-sheet">
                  <div className="studentHeading">
                    <h2>Add New Vendor</h2>
                    <button className='closeForm' onClick={onClose}> X </button>
                  </div>
                  <Form className="formSheet">
                    <Row className="mb-3">
                      <FormGroup as={Col} md="6" controlId="validationCustom03">
                        <FormLabel className="labelForm">Organization Name</FormLabel>
                        <FormControl required type="text" value={formData.organizationName} name="organizationName" onChange={handleChange} />
                      </FormGroup>
                      <FormGroup as={Col} md="6" controlId="validationCustom02">
                        <FormLabel className="labelForm"> Organization Type </FormLabel>
                        <FormSelect value={formData.organizationType} name="organizationType" onChange={handleChange} required>
                          <option>Select</option>
                          <option value="1">RECURRING</option>
                          <option value="2">NON RECURRING</option>
                        </FormSelect>
                      </FormGroup>
                    </Row>
                    <Row className="mb-3">
                      <FormGroup as={Col} md="6" controlId="validationCustom01">
                        <FormLabel className="labelForm">Contact Person Name</FormLabel>
                        <FormControl required type="text" value={formData.contactPersonName} name="contactPersonName" onChange={handleChange} />
                      </FormGroup>
                      <FormGroup as={Col} md="6" controlId="validationCustom04">
                        <FormLabel className="labelForm">Status Of Enterprise</FormLabel>
                        <FormSelect value={formData.statusOfEnterprise} name="statusOfEnterprise" onChange={handleChange} required >
                          <option>Select</option>
                          <option value="1">RECURRING</option>
                          <option value="2">NON RECURRING</option>
                        </FormSelect>
                      </FormGroup>
                    </Row>
                    <Row className="mb-3">
                      <FormGroup as={Col} md="6" controlId="validationCustom05">
                        <FormLabel className="labelForm">Organization Address</FormLabel>
                        <FormControl required type="textarea" value={formData.organizationAddress} name="organizationAddress" onChange={handleChange} />
                      </FormGroup>
                      <FormGroup as={Col} md="6" controlId="validationCustom06">
                        <FormLabel className="labelForm">Item category</FormLabel>
                        <FormSelect value={formData.itemCategory} name="itemCategory" onChange={handleChange} required>
                          <option>Select</option>
                          <option value="1">RECURRING</option>
                          <option value="2">NON RECURRING</option>
                        </FormSelect>
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} md="6" controlId="validationCustom07">
                        <FormLabel className="labelForm">Organization Web Address</FormLabel>
                        <FormControl required type="text" value={formData.organizationWebAddress} name="organizationWebAddress" onChange={handleChange} />
                      </FormGroup>
                      <FormGroup as={Col} md="6" controlId="validationCustom08">
                        <FormLabel className="labelForm">TIN No</FormLabel>
                        <FormControl required type="number" value={formData.tinNo} name="tinNo" onChange={handleChange} />
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} md="6" controlId="validationCustom09">
                        <FormLabel className="labelForm">Contact No</FormLabel>
                        <FormControl
                          required
                          type="number"
                          value={formData.contactNo}
                          name="contactNo"
                          onChange={handleChange}
                        />
                      </FormGroup>
                      <FormGroup as={Col} md="6" controlId="validationCustom10">
                        <FormLabel className="labelForm">PAN No</FormLabel>
                        <FormControl
                          required
                          type="number"
                          value={formData.panNo}
                          name="panNo"
                          onChange={handleChange}
                        />
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} md="6" controlId="validationCustom11">
                        <FormLabel className="labelForm">Email ID</FormLabel>
                        <FormControl
                          required
                          type="email"
                          value={formData.emailId}
                          name="emailId"
                          onChange={handleChange}
                        />
                      </FormGroup>
                      <FormGroup as={Col} md="6" controlId="validationCustom12">
                        <FormLabel className="labelForm">G.S.T No</FormLabel>
                        <FormControl
                          required
                          type="number"
                          value={formData.gstNo}
                          name="gstNo"
                          onChange={handleChange}
                        />
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} md="6" controlId="validationCustom13">
                        <FormLabel className="labelForm">Remark</FormLabel>
                        <FormControl
                          required
                          type="text"
                          value={formData.remark}
                          name="remark"
                          onChange={handleChange}
                        />
                      </FormGroup>
                      <FormGroup as={Col} md="6" controlId="validationCustom14">
                        <FormLabel className="labelForm">Excise Registration No</FormLabel>
                        <FormControl
                          required
                          type="number"
                          value={formData.exciseRegistrationNo}
                          name="exciseRegistrationNo"
                          onChange={handleChange}
                        />
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} md="6" controlId="validationCustom15">
                        <FormLabel className="labelForm">Banker&apos;s Name With Address</FormLabel>
                        <FormControl
                          required
                          type="text"
                          value={formData.bankerName}
                          name="bankerName"
                          onChange={handleChange}
                        />
                      </FormGroup>
                      <FormGroup as={Col} md="6" controlId="validationCustom16">
                        <FormLabel className="labelForm">Bank Account No</FormLabel>
                        <FormControl
                          required
                          type="number"
                          value={formData.bankAccountNo}
                          name="bankAccountNo"
                          onChange={handleChange}
                        />
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} md="6" controlId="validationCustom19">
                        <FormLabel className="labelForm">IFSC Code</FormLabel>
                        <FormControl
                          required
                          type="number"
                          value={formData.ifscCode}
                          name="ifscCode"
                          onChange={handleChange}
                        />
                      </FormGroup>
                    </Row>
                    <Row>
                      <Col>
                        <Button type="submit" className="btn btn-primary mt-4">
                          Add New Vendor
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </div>
              )}
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="tableSheet">
                <h2> Stock Vendor Records</h2>
                {loading ? (
                  <p>Loading...</p>
                ) : data.length > 0 ? (
                  <Table columns={columns} data={data} />
                ) : (
                  <p>No vendors available.</p>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(VendorMaster), { ssr: false });
