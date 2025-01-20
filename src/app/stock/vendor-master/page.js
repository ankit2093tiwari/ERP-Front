"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormControl, FormSelect, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import Table from '@/app/component/DataTable'; // Ensure the path is correct

const VendorMaster = () => {
  const [data, setData] = useState([]); // Data for the table
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(''); // Error message
  const [successMessage, setSuccessMessage] = useState(''); // Success message
  const [showAddForm, setShowAddForm] = useState(false); // Form visibility toggle
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

  return (
    <Container>
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/stock/all-module">Stock Module</Breadcrumb.Item>
            <Breadcrumb.Item active>Vendor Master</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col>
          <Button onClick={() => setShowAddForm((prev) => !prev)} className="mb-4">
            <FaPlus /> {editingVendorId ? 'Edit Vendor' : 'Add Vendor'}
          </Button>
          {showAddForm && (
            <div className="cover-sheet">
              <h2>{editingVendorId ? 'Edit Vendor' : 'Add Vendor'}</h2>
              <Form>
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Organization Name"
                      value={newVendor.organizationName}
                      onChange={(e) => setNewVendor({ ...newVendor, organizationName: e.target.value })}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel>Organization Type</FormLabel>
                    <FormSelect
                      value={newVendor.organizationType}
                      onChange={(e) => setNewVendor({ ...newVendor, organizationType: e.target.value })}
                    >
                      <option>Select</option>
                      <option value="1">Manufacturer</option>
                      <option value="2">Distributor</option>
                      <option value="2">Super Stockiest</option>
                      <option value="2">Dealer</option>
                      <option value="2">Retailer</option>
                    </FormSelect>
                  </Col>
                </Row>
                {/* Add more fields here for other vendor data */}
                <Row>
                  <Col>
                    <Button onClick={editingVendorId ? handleUpdate : handleAdd} className="btn btn-primary mt-4">
                      {editingVendorId ? 'Update Vendor' : 'Add Vendor'}
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
            <h2>Vendor Records</h2>
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
  );
};

export default dynamic(() => Promise.resolve(VendorMaster), { ssr: false });
