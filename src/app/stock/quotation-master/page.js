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
    //   name: 'Date',
    //   cell: (row) => {
    //     const date = row.date ? new Date(row.date) : null;
    //     return (
    //       <div>
    //         {editingId === row._id ? (
    //           <DatePicker
    //             selected={editedData.date ? new Date(editedData.date) : new Date()}
    //             onChange={(date) => setEditedData({ ...editedData, date })}
    //             dateFormat="dd/MM/yyyy"
    //             className="form-control"
    //           />
    //         ) : (
    //           date ? date.toLocaleDateString('en-GB') : 'N/A'
    //         )}
    //       </div>
    //     );
    //   },
    //   sortable: true,
    // },
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
              <Button variant="info" size="sm" onClick={() => handlePurchase(row._id)}>
                Purchase
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
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/quotation-stocks");
      setData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchItemCategories = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/itemCategories");
      setItemCategories(response.data.data || []);
    } catch (err) {
      console.error("Error fetching item categories:", err);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/vendors");
      setVendors(response.data.data || []);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    }
  };

  const fetchAllItems = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/itemMasters");
      setAllItems(response.data.data || []);
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
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/items-by-category/${categoryId}`);
      setFilteredItems(response.data.data || []);
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

      await axios.put(`https://erp-backend-fy3n.onrender.com/api/quotation-stock/${id}`, editedData);
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
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/quotation-stock/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete data. Please try again later.");
      }
    }
  };

  const handlePurchase = (id) => {
    console.log("Purchase item with ID:", id);
    // Handle purchase action
  };

  const handleAdd = async () => {
    if (!formData.itemCategory || !formData.itemName || !formData.quotationNo) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/quotation-stock", {
        ...formData,
        date: formData.date.toISOString()
      });
      if (response.data.success) {
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
    const headers = ["#", "Item Name", "Item Category", "Vendor", "Quotation Price/Unit", "Quotation No",  "Actions"];
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
  }, []);

  const breadcrumbItems = [
    { label: "Stock", link: "/stock/all-module" },
    { label: "Quotation Master", link: "null" }
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
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
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