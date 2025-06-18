"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FaEdit, FaTrashAlt, FaSave, FaTimes } from 'react-icons/fa';
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
  const [editingId, setEditingId] = useState(null);
  const [itemCategories, setItemCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [allItems, setAllItems] = useState([]);

  const [formData, setFormData] = useState({
    itemCategory: '',
    itemName: '',
    pricePerUnit: '',
    vendorName: '',
    quotationNo: '',
    remarks: '',
    date: new Date()
  });

  const [editedData, setEditedData] = useState({
    itemCategory: '',
    itemName: '',
    pricePerUnit: '',
    vendorName: '',
    quotationNo: '',
    remarks: '',
    date: new Date()
  });

  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [stores, setStores] = useState([]);
  const [purchaseFormData, setPurchaseFormData] = useState({
    quotation: '',  // Will store the quotation ID
    quantity: '',
    store: '',
    purchaseDate: new Date()
  });
  const fetchStores = async () => {
    try {
      const response = await getAllStores()
      setStores(response.data || []);
    } catch (err) {
      console.error("Error fetching stores:", err);
    }
  };


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
        return editingId === row._id ? (
          <FormSelect
            value={editedData.itemName || ''}
            onChange={(e) => setEditedData({ ...editedData, itemName: e.target.value })}
            required
            disabled={!editedData.itemCategory}
          >
            <option value="">Select Item</option>
            {filteredItems.map(item => (
              <option key={item._id} value={item._id}>
                {item.itemName}
              </option>
            ))}
          </FormSelect>
        ) : (
          item.itemName || 'N/A'
        );
      },
      sortable: true,
    },
    {
      name: 'Item Category',
      cell: (row) =>
        editingId === row._id ? (
          <FormSelect
            value={editedData.itemCategory || ''}
            onChange={(e) => {
              const newCategory = e.target.value;
              setEditedData({
                ...editedData,
                itemCategory: newCategory,
                itemName: ''
              });
              fetchItemsByCategory(newCategory);
            }}
            required
          >
            <option value="">Select Category</option>
            {itemCategories.map(category => (
              <option key={category._id} value={category._id}>
                {category.categoryName}
              </option>
            ))}
          </FormSelect>
        ) : (
          row.itemCategory?.categoryName || 'N/A'
        ),
      sortable: true,
    },
    {
      name: 'Vendor',
      cell: (row) => (
        <div>
          {editingId === row._id ? (
            <FormSelect
              value={editedData.vendorName || ''}
              onChange={(e) => setEditedData({ ...editedData, vendorName: e.target.value })}
            >
              <option value="">Select Vendor</option>
              {vendors.map(vendor => (
                <option key={vendor._id} value={vendor._id}>
                  {vendor.organizationName}
                </option>
              ))}
            </FormSelect>
          ) : (
            <div>
              <strong>{row.vendorName?.organizationName || 'N/A'}</strong>
              {row.vendorName?.contactPersonName && (
                <div className="text-muted small">{row.vendorName.contactPersonName}</div>
              )}
              {row.vendorName?.contactNumber && (
                <div className="text-muted small">{row.vendorName.contactNumber}</div>
              )}
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      name: 'Quotation Price/Unit',
      cell: (row) => (
        <div>
          {editingId === row._id ? (
            <FormControl
              type="number"
              value={editedData.pricePerUnit || ''}
              onChange={(e) => setEditedData({ ...editedData, pricePerUnit: e.target.value })}
              min="0"
              step="0.01"
            />
          ) : (
            row.pricePerUnit ? `${parseFloat(row.pricePerUnit).toFixed(2)}` : 'N/A'
          )}
        </div>
      ),
      sortable: true,
    },
    {
      name: 'Quotation No',
      cell: (row) => (
        <div>
          {editingId === row._id ? (
            <FormControl
              type="text"
              value={editedData.quotationNo || ''}
              onChange={(e) => setEditedData({ ...editedData, quotationNo: e.target.value })}
              required
            />
          ) : (
            row.quotationNo || 'N/A'
          )}
        </div>
      ),
      sortable: true,
    },
    // {
    //   name: 'Actions',
    //   cell: (row) => (
    //     <div className="d-flex gap-2">
    //       {editingId === row._id ? (
    //         <>
    //           <Button variant="success" size="sm" onClick={() => handleUpdate(row._id)}>
    //             <FaSave /> Save
    //           </Button>
    //           <Button variant="secondary" size="sm" onClick={() => setEditingId(null)}>
    //             <FaTimes /> Cancel
    //           </Button>
    //         </>
    //       ) : (
    //         <>
    //           <Button variant="info" size="sm" onClick={() => handlePurchase(row._id)}>
    //             Purchase
    //           </Button>
    //         </>
    //       )}
    //     </div>
    //   ),
    // }
    {
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <>
              <Button variant="success" size="sm" onClick={() => handleUpdate(row._id)}>
                <FaSave /> Save
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setEditingId(null)}>
                <FaTimes /> Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="info" size="sm" onClick={() => handlePurchase(row)} style={{ whiteSpace: 'nowrap' }}>
                Purchase
              </Button>
              <Button variant="warning" size="sm" onClick={() => handleEdit(row)}>
                <FaEdit />
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(row._id)}>
                <FaTrashAlt />
              </Button>
            </>
          )}
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

  const handleEdit = (quotation) => {
    setEditingId(quotation._id);
    setEditedData({
      itemCategory: quotation.itemCategory || '',
      itemName: quotation.itemName || '',
      pricePerUnit: quotation.pricePerUnit || '',
      vendorName: quotation.vendorName || '',
      quotationNo: quotation.quotationNo || '',
      remarks: quotation.remarks || '',
      // date: quotation.date ? new Date(quotation.date) : new Date()
    });
    if (quotation.itemCategory) {
      fetchItemsByCategory(quotation.itemCategory);
    }
  };

  const handleUpdate = async (id) => {
    try {
      if (!editedData.itemCategory || !editedData.itemName || !editedData.quotationNo) {
        setError("Please fill in all required fields.");
        return;
      }

      const response = await updateQuotationStockById(id, editedData)
      toast.success(response.message || "Quotation updated successfully!");
      fetchData();
      setEditingId(null);
      setEditedData({});
      setError("");
    } catch (error) {
      console.error("Error updating data:", error);
      setError(error.response?.data?.message || "Failed to update data. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this quotation?")) {
      try {
        await deleteQuotationStockById(id);
        toast.success("Quotation deleted successfully!");
        setEditingId(null);
        setEditedData({});
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
      quotation: quotation._id,  // Store the quotation ID
      quantity: '',
      store: '',
      purchaseDate: new Date()
    });
    setShowPurchaseForm(true);
  };

  const handleAdd = async () => {
    if (!formData.itemCategory || !formData.itemName || !formData.quotationNo) {
      toast.error("Please fill all required fields.");
      setError("Please fill all required fields.");
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
        setFormData({
          itemCategory: '',
          itemName: '',
          pricePerUnit: '',
          vendorName: '',
          quotationNo: '',
          remarks: '',
          date: new Date()
        });
        setIsPopoverOpen(false);
        setError("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add quotation. Please try again later.");
      console.error("Error adding data:", error);
      setError(error.response?.data?.message || "Failed to add data. Please try again later.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "itemCategory") {
      setFormData({
        ...formData,
        itemCategory: value,
        itemName: ''
      });
      fetchItemsByCategory(value);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Item Name", "Item Category", "Vendor", "Quotation Price/Unit", "Quotation No", "Actions"]];
    const tableRows = data.map((row, index) => {
      // Find the actual item, category, and vendor objects
      const item = allItems.find(i => i._id === row.itemName) || {};
      const category = itemCategories.find(c => c._id === row.itemCategory) || {};
      const vendor = vendors.find(v => v._id === row.vendorName) || {};
      // const date = row.date ? new Date(row.date) : null;

      return [
        index + 1,
        item.itemName || row.itemName || 'N/A',
        category.categoryName || row.itemCategory?.categoryName || row.itemCategory || 'N/A',
        vendor.organizationName || row.vendorName?.organizationName || row.vendorName || 'N/A',
        row.pricePerUnit ? `${parseFloat(row.pricePerUnit).toFixed(2)}` : 'N/A',
        row.quotationNo || 'N/A',
        // date ? date.toLocaleDateString('en-GB') : 'N/A',
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
      const date = row.date ? new Date(row.date) : null;

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
        fetchData(); // Refresh the quotation list
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
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <FormGroup as={Col} md="6" controlId="itemCategory">
                    <FormLabel className="labelForm">Item category*</FormLabel>
                    <FormSelect
                      name="itemCategory"
                      value={formData.itemCategory}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select</option>
                      {itemCategories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.categoryName}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="itemName">
                    <FormLabel className="labelForm">Item Name*</FormLabel>
                    {formData.itemCategory ? (
                      <FormSelect
                        name="itemName"
                        value={formData.itemName}
                        onChange={handleChange}
                        required
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
                      />
                    )}
                  </FormGroup>
                </Row>
                <Row className="mb-3">
                  <FormGroup as={Col} md="6" controlId="pricePerUnit">
                    <FormLabel className="labelForm">Price Per Unit (₹)</FormLabel>
                    <FormControl
                      name="pricePerUnit"
                      value={formData.pricePerUnit}
                      onChange={handleChange}
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="vendorName">
                    <FormLabel className="labelForm">Vendor Name</FormLabel>
                    <FormSelect
                      name="vendorName"
                      value={formData.vendorName}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      {vendors.map(vendor => (
                        <option key={vendor._id} value={vendor._id}>
                          {vendor.organizationName}
                          {vendor.contactPersonName && ` (${vendor.contactPersonName})`}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                </Row>
                <Row className='mb-3'>
                  <FormGroup as={Col} md="6" controlId="quotationNo">
                    <FormLabel className="labelForm">Quotation No*</FormLabel>
                    <FormControl
                      name="quotationNo"
                      value={formData.quotationNo}
                      onChange={handleChange}
                      required
                      type="text"
                    />
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