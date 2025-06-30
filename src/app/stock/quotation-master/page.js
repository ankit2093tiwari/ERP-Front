"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FaTrashAlt } from 'react-icons/fa';
import { CgAddR } from 'react-icons/cg';
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl, FormSelect, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import Table from '@/app/component/DataTable';
import { copyContent, printContent } from '@/app/utils';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addNewQuotationStock, BASE_URL, deleteQuotationStockById, getAllItems, getAllStores, getAllVendors, getItemCategories, getItemsByCategoryId, getQuotationStocks, updateQuotationStockById } from '@/Services';
import { toast } from 'react-toastify';

const QuotationMaster = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [itemCategories, setItemCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [stores, setStores] = useState([]);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  const [formData, setFormData] = useState({
    itemCategory: '',
    itemName: '',
    pricePerUnit: '',
    vendorName: '',
    quotationNo: '',
    remarks: '',
    date: new Date()
  });

  const [purchaseFormData, setPurchaseFormData] = useState({
    quotation: '',
    quantity: '',
    store: '',
    purchaseDate: new Date()
  });

  const [validationErrors, setValidationErrors] = useState({
    itemCategory: false,
    itemName: false,
    vendorName: false,
    quotationNo: false,
    pricePerUnit: false
  });

  const columns = [
    {
      name: '#',
      selector: (row, index) => index + 1,
      width: '80px',
      sortable: false,
    },
    {
      name: 'Item Name',
      cell: (row) => {
        const item = allItems.find(i => i._id === row.itemName) || {};
        return item.itemName || 'N/A';
      },
      sortable: true,
    },
    {
      name: 'Item Category',
      cell: (row) => row.itemCategory?.categoryName || 'N/A',
      sortable: true,
    },
    {
      name: 'Vendor',
      cell: (row) => (
        <div>
          <strong>{row.vendorName?.organizationName || 'N/A'}</strong>
          {row.vendorName?.contactPersonName && (
            <div className="text-muted small">{row.vendorName.contactPersonName}</div>
          )}
          {row.vendorName?.contactNumber && (
            <div className="text-muted small">{row.vendorName.contactNumber}</div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      name: 'Quotation Price/Unit',
      cell: (row) => row.pricePerUnit ? `${parseFloat(row.pricePerUnit).toFixed(2)}` : 'N/A',
      sortable: true,
    },
    {
      name: 'Quotation No',
      cell: (row) => row.quotationNo || 'N/A',
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button variant="info" size="sm" onClick={() => handlePurchase(row)} style={{ whiteSpace: 'nowrap' }}>
            Purchase
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </Button>
        </div>
      ),
    }
  ];

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getQuotationStocks();
      setData(response.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchItemCategories = async () => {
    try {
      const response = await getItemCategories();
      setItemCategories(response.data || []);
    } catch (err) {
      console.error("Error fetching item categories:", err);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await getAllVendors()
      setVendors(response.data || []);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    }
  };

  const fetchAllItems = async () => {
    try {
      const response = await getAllItems()
      setAllItems(response.data || []);
    } catch (err) {
      console.error("Error fetching all items:", err);
    }
  };

  const fetchItemsByCategory = async (categoryId) => {
    try {
      if (!categoryId) {
        setFilteredItems([]);
        return;
      }
      const response = await getItemsByCategoryId(categoryId);
      setFilteredItems(response.data || []);
    } catch (err) {
      console.error("Error fetching items by category:", err);
      setFilteredItems([]);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await getAllStores()
      setStores(response.data || []);
    } catch (err) {
      console.error("Error fetching stores:", err);
    }
  };

  const validateForm = (formData) => {
    const errors = {
      itemCategory: !formData.itemCategory,
      itemName: !formData.itemName,
      quotationNo: !formData.quotationNo,
      vendorName: !formData.vendorName,
      pricePerUnit: !formData.pricePerUnit || isNaN(formData.pricePerUnit) || parseFloat(formData.pricePerUnit) <= 0
    };

    setValidationErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this quotation?")) {
      try {
        await deleteQuotationStockById(id);
        toast.success("Quotation deleted successfully!");
        fetchData();
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete data. Please try again later.");
      }
    }
  };

  const handlePurchase = (quotation) => {
    setSelectedQuotation(quotation);
    setPurchaseFormData({
      quotation: quotation._id,
      quantity: '',
      store: '',
      purchaseDate: new Date()
    });
    setShowPurchaseForm(true);
  };

  const handleAdd = async () => {
    if (!validateForm(formData)) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const response = await addNewQuotationStock({
        ...formData,
        date: formData.date.toISOString()
      })
      if (response?.success) {
        toast.success(response?.message || "Quotation added successfully!");
        fetchData();
        resetForm();
        setIsPopoverOpen(false);
        setError("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add quotation. Please try again later.");
      console.error("Error adding data:", error);
      setError(error.response?.data?.message || "Failed to add data. Please try again later.");
    }
  };

  const resetForm = () => {
    setFormData({
      itemCategory: '',
      itemName: '',
      pricePerUnit: '',
      vendorName: '',
      quotationNo: '',
      remarks: '',
      date: new Date()
    });
    setValidationErrors({
      itemCategory: false,
      itemName: false,
      vendorName: false,
      quotationNo: false,
      pricePerUnit: false
    });
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // Update form data
    if (name === "itemCategory") {
      setFormData({
        ...formData,
        itemCategory: value,
        itemName: ''
      });
      fetchItemsByCategory(value);
    } else {
      // Handle number fields specifically
      const processedValue = type === 'number' ?
        (value === "" ? "" : parseFloat(value) || 0) :
        value;

      setFormData({
        ...formData,
        [name]: processedValue
      });
    }

    // Clear validation error for all field types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Item Name", "Item Category", "Vendor", "Quotation Price/Unit", "Quotation No", "Actions"]];
    const tableRows = data.map((row, index) => {
      const item = allItems.find(i => i._id === row.itemName) || {};
      const category = itemCategories.find(c => c._id === row.itemCategory) || {};
      const vendor = vendors.find(v => v._id === row.vendorName) || {};

      return [
        index + 1,
        item.itemName || row.itemName || 'N/A',
        category.categoryName || row.itemCategory?.categoryName || row.itemCategory || 'N/A',
        vendor.organizationName || row.vendorName?.organizationName || row.vendorName || 'N/A',
        row.pricePerUnit ? `${parseFloat(row.pricePerUnit).toFixed(2)}` : 'N/A',
        row.quotationNo || 'N/A',
        "Purchase"
      ];
    });
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Item Name", "Item Category", "Vendor", "Quotation Price/Unit", "Quotation No", "Actions"];
    const rows = data.map((row, index) => {
      const item = allItems.find(i => i._id === row.itemName) || {};
      const category = itemCategories.find(c => c._id === row.itemCategory) || {};
      const vendor = vendors.find(v => v._id === row.vendorName) || {};

      return `${index + 1}\t${item.itemName || row.itemName || 'N/A'}\t${category.categoryName || row.itemCategory?.categoryName || row.itemCategory || 'N/A'}\t${vendor.organizationName || row.vendorName?.organizationName || row.vendorName || 'N/A'}\t${row.pricePerUnit ? `${parseFloat(row.pricePerUnit).toFixed(2)}` : 'N/A'}\t${row.quotationNo || 'N/A'}\tPurchase`;
    });
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
    fetchItemCategories();
    fetchVendors();
    fetchAllItems();
    fetchStores();
  }, []);

  const breadcrumbItems = [
    { label: "Stock", link: "/stock/all-module" },
    { label: "Quotation Master", link: "null" }
  ];

  const PurchaseForm = () => {
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post(`${BASE_URL}/api/add-stock-order`, {
          quotation: purchaseFormData.quotation,
          quantity: Number(purchaseFormData.quantity),
          store: purchaseFormData.store,
          purchaseDate: purchaseFormData.purchaseDate
        });
        toast.success(response?.data?.message || "Purchase order created successfully!");
        setShowPurchaseForm(false);
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to create purchase order");
      }
    };

    const item = allItems.find(i => i._id === selectedQuotation?.itemName);
    const vendor = vendors.find(v => v._id === selectedQuotation?.vendorName);

    return (
      <Container>
        <div className="cover-sheet">
          <div className="purchase-form">
            <div className="studentHeading">
              <h2>Create Purchase Order</h2>
              <button
                className="closeForm"
                onClick={() => setShowPurchaseForm(false)}
              >
                ×
              </button>
            </div>

            <div className="mb-1 p-3 bg-light rounded">
              <h5>Quotation Information</h5>
              <Row className="mb-3">
                <FormGroup as={Col} md="6" controlId="item">
                  <FormLabel className="labelForm">Item</FormLabel>
                  <FormControl
                    value={item?.itemName || 'N/A'}
                    disabled
                  />
                </FormGroup>
                <FormGroup as={Col} md="6" controlId="vendor">
                  <FormLabel className="labelForm">Vendor</FormLabel>
                  <FormControl
                    value={selectedQuotation?.vendorName?.organizationName || 'N/A'}
                    disabled
                  />
                </FormGroup>
              </Row>

              <Row className="mb-3">
                <FormGroup as={Col} md="6" controlId="price">
                  <FormLabel className="labelForm">Quoted Price</FormLabel>
                  <FormControl
                    value={selectedQuotation?.pricePerUnit ? `₹${parseFloat(selectedQuotation.pricePerUnit).toFixed(2)}` : 'N/A'}
                    disabled
                  />
                </FormGroup>
                <FormGroup as={Col} md="6" controlId="quotationNo">
                  <FormLabel className="labelForm">Quotation #</FormLabel>
                  <FormControl
                    value={selectedQuotation?.quotationNo || 'N/A'}
                    disabled
                  />
                </FormGroup>
              </Row>
            </div>

            <Form onSubmit={handleSubmit} className="formSheet">
              <Row className="mb-3">
                <FormGroup as={Col} md="6" controlId="quantity">
                  <FormLabel className="labelForm">Quantity*</FormLabel>
                  <FormControl
                    type="number"
                    min="1"
                    value={purchaseFormData.quantity}
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, quantity: e.target.value })}
                    required
                  />
                </FormGroup>
                <FormGroup as={Col} md="6" controlId="store">
                  <FormLabel className="labelForm">Store*</FormLabel>
                  <FormSelect
                    value={purchaseFormData.store}
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, store: e.target.value })}
                    required
                  >
                    <option value="">Select Store</option>
                    {stores.map(store => (
                      <option key={store._id} value={store._id}>{store.storeName}</option>
                    ))}
                  </FormSelect>
                </FormGroup>
              </Row>

              <FormGroup className="mb-3" controlId="purchaseDate">
                <FormLabel className="labelForm">Purchase Date</FormLabel>
                <DatePicker
                  selected={purchaseFormData.purchaseDate}
                  onChange={(date) => setPurchaseFormData({ ...purchaseFormData, purchaseDate: date })}
                  className="form-control"
                  dateFormat="dd/MM/yyyy"
                />
              </FormGroup>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowPurchaseForm(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Create Purchase
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </Container>
    );
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
      {showPurchaseForm && <PurchaseForm />}

      <section>
        <Container>
          {error && <Alert variant="danger">{error}</Alert>}
          <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
            <CgAddR /> Add Quotation
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Quotation</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setError("");
                    resetForm();
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <FormGroup as={Col} md="6" controlId="itemCategory">
                    <FormLabel className="labelForm">Item category<span className='text-danger'>*</span></FormLabel>
                    <FormSelect
                      name="itemCategory"
                      value={formData.itemCategory}
                      onChange={handleChange}
                      required
                      isInvalid={validationErrors.itemCategory}
                    >
                      <option value="">Select</option>
                      {itemCategories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.categoryName}
                        </option>
                      ))}
                    </FormSelect>
                    {validationErrors.itemCategory && (
                      <FormControl.Feedback type="invalid">
                        Please select an item category
                      </FormControl.Feedback>
                    )}
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="itemName">
                    <FormLabel className="labelForm">Item Name<span className='text-danger'>*</span></FormLabel>
                    {formData.itemCategory ? (
                      <FormSelect
                        name="itemName"
                        value={formData.itemName}
                        onChange={handleChange}
                        required
                        isInvalid={validationErrors.itemName}
                      >
                        <option value="">Select Item</option>
                        {filteredItems.map(item => (
                          <option key={item._id} value={item._id}>
                            {item.itemName}
                          </option>
                        ))}
                      </FormSelect>
                    ) : (
                      <FormControl
                        name="itemName"
                        value={formData.itemName}
                        onChange={handleChange}
                        required
                        type="text"
                        placeholder="Select category first"
                        disabled
                        isInvalid={validationErrors.itemName}
                      />
                    )}
                    {validationErrors.itemName && (
                      <FormControl.Feedback type="invalid">
                        Please select an item
                      </FormControl.Feedback>
                    )}
                  </FormGroup>
                </Row>
                <Row className="mb-3">
                  <FormGroup as={Col} md="6" controlId="pricePerUnit">
                    <FormLabel className="labelForm">Price Per Unit (₹)<span className='text-danger'>*</span></FormLabel>
                    <FormControl
                      name="pricePerUnit"
                      value={formData.pricePerUnit}
                      onChange={handleChange}
                      type="number"
                      min="0.01"
                      step="0.01"
                      isInvalid={validationErrors.pricePerUnit}
                    />
                    {validationErrors.pricePerUnit && (
                      <FormControl.Feedback type="invalid">
                        Please enter a valid positive price
                      </FormControl.Feedback>
                    )}
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="vendorName">
                    <FormLabel className="labelForm">Vendor Name<span className='text-danger'>*</span></FormLabel>
                    <FormSelect
                      name="vendorName"
                      value={formData.vendorName}
                      onChange={handleChange}
                      isInvalid={validationErrors.vendorName}
                    >
                      <option value="">Select</option>
                      {vendors.map(vendor => (
                        <option key={vendor._id} value={vendor._id}>
                          {vendor.organizationName}
                          {vendor.contactPersonName && ` (${vendor.contactPersonName})`}
                        </option>
                      ))}
                    </FormSelect>
                    {validationErrors.vendorName && (
                      <FormControl.Feedback type="invalid">
                        Please select a vendor
                      </FormControl.Feedback>
                    )}
                  </FormGroup>
                </Row>
                <Row className='mb-3'>
                  <FormGroup as={Col} md="6" controlId="quotationNo">
                    <FormLabel className="labelForm">Quotation No<span className='text-danger'>*</span></FormLabel>
                    <FormControl
                      name="quotationNo"
                      value={formData.quotationNo}
                      onChange={handleChange}
                      required
                      type="text"
                      isInvalid={validationErrors.quotationNo}
                    />
                    {validationErrors.quotationNo && (
                      <FormControl.Feedback type="invalid">
                        Please enter quotation number
                      </FormControl.Feedback>
                    )}
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="remarks">
                    <FormLabel className="labelForm">Remarks</FormLabel>
                    <FormControl
                      as="textarea"
                      rows={2}
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Quotation
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Quotation Records</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Table
                columns={columns}
                data={data}
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

export default dynamic(() => Promise.resolve(QuotationMaster), { ssr: false });