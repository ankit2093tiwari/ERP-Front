"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';
import { FaPrint, FaTrashAlt } from 'react-icons/fa';
import { Container, Row, Col, Alert, Button, Form, FormLabel, FormControl, FormSelect } from 'react-bootstrap';
import axios from 'axios';
import Table from '@/app/component/DataTable';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { addNewStockReceive, deletePurchaseOrderById, getAllEmployee, getPurchaseOrders } from '@/Services';
import usePagePermission from '@/hooks/usePagePermission';

const PurchaseList = () => {
  const { hasEditAccess } = usePagePermission()

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [employee, setEmployee] = useState([]);

  // Receive form states
  const [isReceiveFormOpen, setIsReceiveFormOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const [receivedQty, setReceivedQty] = useState('');
  const [rejectQty, setRejectQty] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [remarks, setRemarks] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);

  const columns = [
    {
      name: '#',
      selector: (row, index) => index + 1,
      width: '80px',
      sortable: false,
    },
    {
      name: 'Item',
      selector: row => row.quotation?.itemName?.itemName || 'N/A',
      sortable: true,
    },
    {
      name: 'Category',
      selector: row => row.quotation?.itemCategory?.categoryName || 'N/A',
      sortable: true,
    },
    {
      name: 'Vendor',
      cell: row => {
        const vendor = row.quotation?.vendorName;
        return (
          <div>
            <strong>{vendor?.organizationName || 'N/A'}</strong>
            {vendor?.contactPersonName && <div className="text-muted small">{vendor.contactPersonName}</div>}
            {vendor?.contactNumber && <div className="text-muted small">{vendor.contactNumber}</div>}
          </div>
        );
      },
    },
    {
      name: 'Price/Unit',
      selector: row => row.quotation?.pricePerUnit ? `₹${row.quotation.pricePerUnit}` : 'N/A',
      sortable: true,
    },
    {
      name: 'Quantity',
      selector: row => row?.quantity || 'N/A',
      sortable: true,
    },
    {
      name: 'Date',
      selector: row => row.purchaseDate ? new Date(row.purchaseDate).toLocaleDateString() : 'N/A',
      sortable: true,
    },
    hasEditAccess && {
      name: 'Actions',
      cell: row => (
        <>
          <Button variant="danger" size="sm" className='me-2' onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </Button>
          {!row.received && (
            <Button
              variant="success"
              size="sm"
              style={{ whiteSpace: 'nowrap' }}
              onClick={() => {
                setSelectedPurchase(row);
                setReceivedQty('');
                setRejectQty('');
                setReceivedBy('');
                setRemarks('');
                setFormErrors({});
                setTotalAmount(0);
                setIsReceiveFormOpen(true);
              }}
            >
              Receive
            </Button>
          )}

        </>
      ),
    }
  ].filter(Boolean);
  const handleDelete = async (id) => {
    console.log(id);

    const confirm = window.confirm("Are you sure you want to delete this purchase order?");

    if (!confirm) return;

    try {
      const res = await deletePurchaseOrderById(id);
      if (res.success) {
        toast.success('Purchase order deleted successfully!');
        fetchData(); // Refresh list
      } else {
        toast.error(res.message || 'Failed to delete purchase order');
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error('Something went wrong while deleting!');
    }
  }
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getPurchaseOrders();
      setData(response.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchEmployee()
  }, []);

  const fetchEmployee = async () => {
    const res = await getAllEmployee();
    setEmployee(res.data)
  }
  // Calculate total amount
  useEffect(() => {
    if (selectedPurchase && receivedQty && !isNaN(receivedQty)) {
      const price = selectedPurchase.quotation?.pricePerUnit || 0;
      setTotalAmount(receivedQty * price);
    } else {
      setTotalAmount(0);
    }
  }, [receivedQty, selectedPurchase]);
  const validateForm = () => {
    const errors = {};

    const received = Number(receivedQty) || 0;
    const rejected = Number(rejectQty) || 0;
    const orderQty = Number(selectedPurchase?.quantity) || 0;

    if (!receivedQty) errors.receivedQty = "Received quantity required";
    if (!rejectQty) errors.rejectQty = "Reject quantity required";
    if (!receivedBy) errors.receivedBy = "Please select who received";

    if (received < 0 || rejected < 0) {
      errors.receivedQty = "Quantities cannot be negative.";
    } else if (received + rejected > orderQty) {
      errors.receivedQty = `Total quantity exceeds ordered quantity (${orderQty}).`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };



  const handleReceiveSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        purchaseOrderId: selectedPurchase?._id,
        receivedQty: Number(receivedQty),
        rejectQty: Number(rejectQty),
        receivedBy,
        remarks
      };

      const res = await addNewStockReceive(payload);
      if (res.success) {
        toast.success("Item received successfully!");
        fetchData();
        setIsReceiveFormOpen(false);
      } else {
        toast.error(res.message || "Failed to receive item.");
      }
    } catch (err) {
      console.error("Receive submit error:", err);
      toast.error("Something went wrong while submitting.");
    }
  };

  const breadcrumbItems = [
    { label: "Stock", link: "/stock/all-module" },
    { label: "Purchase Master", link: "null" }
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
          {error && <Alert variant="danger">{error}</Alert>}
          {isReceiveFormOpen && selectedPurchase && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Receive Item Against Purchase Order</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsReceiveFormOpen(false);
                    setFormErrors({});
                  }}
                >
                  X
                </button>
              </div>

              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Item Category</FormLabel>
                    <FormControl value={selectedPurchase?.quotation?.itemCategory?.categoryName || ''} readOnly />
                  </Col>
                  <Col lg={6}>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl value={selectedPurchase?.quotation?.itemName?.itemName || ''} readOnly />
                  </Col>
                  <Col lg={6}>
                    <FormLabel>Order Quantity</FormLabel>
                    <FormControl value={selectedPurchase?.quantity || ''} readOnly />
                  </Col>
                  <Col lg={6}>
                    <FormLabel>Price Per Unit</FormLabel>
                    <FormControl value={`₹${selectedPurchase?.quotation?.pricePerUnit || 0}`} readOnly />
                  </Col>

                  <Col lg={6}>
                    <FormLabel>Received Quantity <span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="number"
                      placeholder="Enter received quantity"
                      value={receivedQty}
                      onChange={(e) => setReceivedQty(e.target.value)}
                    />
                    {formErrors.receivedQty && <div className="text-danger mt-1">{formErrors.receivedQty}</div>}
                  </Col>

                  <Col lg={6}>
                    <FormLabel>Reject Quantity <span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="number"
                      placeholder="Enter reject quantity"
                      value={rejectQty}
                      onChange={(e) => setRejectQty(e.target.value)}
                    />
                    {formErrors.rejectQty && <div className="text-danger mt-1">{formErrors.rejectQty}</div>}
                  </Col>
                  <Col lg={6}>
                    <FormLabel>Received By <span className="text-danger">*</span></FormLabel>
                    <FormSelect
                      as="select"
                      value={receivedBy}
                      onChange={(e) => setReceivedBy(e.target.value)}
                    >
                      <option>Select user</option>
                      {
                        employee?.map((emp) => (
                          <option value={emp?.employee_name} key={emp?._id}>{emp?.employee_name}</option>
                        ))
                      }
                    </FormSelect>
                    {formErrors.receivedBy && <div className="text-danger mt-1">{formErrors.receivedBy}</div>}
                  </Col>
                  <Col lg={6}>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl
                      as="textarea"
                      rows={2}
                      placeholder="Enter remarks"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </Col>
                  <Col lg={12}>
                    <div className="mt-2"><strong>Total Amount:</strong> ₹{totalAmount}</div>
                    {formErrors.total && <div className="text-danger mt-1">{formErrors.total}</div>}
                  </Col>
                </Row>
                <Button onClick={handleReceiveSubmit} className="btn btn-primary" >
                  Receive Item
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Purchase List</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Table
                columns={columns}
                data={data}
                handleCopy={() => { }}
                handlePrint={() => { }}
              />
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(PurchaseList), { ssr: false });
