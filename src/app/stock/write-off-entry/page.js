"use client";

import React, { useState, useEffect } from 'react';
import Table from '@/app/component/DataTable';
import { Container, Row, Col, Form, FormLabel, FormGroup, FormControl, FormSelect, Button } from 'react-bootstrap';
import { CgAddR } from 'react-icons/cg';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import dynamic from 'next/dynamic';
import { getItemCategories, getItemsByCategoryId, getItemById, addWriteOffEntry,getAllWriteOffItems } from '@/Services';
import { toast } from 'react-toastify';
const StockWriteOffEntry = () => {
  const [itemCategories, setItemCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [writeOffData, setWriteOffData] = useState([]);

  const [formData, setFormData] = useState({
    itemCategory: '',
    itemId: '',
    damageQuantity: '',
    remarks: '',
    availableStock: '',
  });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const onOpen = () => setIsPopoverOpen(true);
  const onClose = () => {
    setIsPopoverOpen(false);
    setFormData({
      itemCategory: '',
      itemId: '',
      damageQuantity: '',
      remarks: '',
      availableStock: '',
    });
  };

  const columns = [
    { name: '#', selector: (row, index) => index + 1, width: '60px' },
    { name: 'ItemCategory', selector: row => row.itemCategory },
    { name: 'ItemName', selector: row => row.itemName },
    { name: 'TotalStockQuantity', selector: row => row.totalStock },
    { name: 'DamageQuantity', selector: row => row.damageQuantity },
    { name: 'Remarks', selector: row => row.remarks },
  ];

  const fetchCategories = async () => {
    try {
      const res = await getItemCategories();
      setItemCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchItems = async (categoryId) => {
    try {
      const res = await getItemsByCategoryId(categoryId);
      setItems(res.data || []);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  const fetchStockOfItem = async (itemId) => {
    try {
      const res = await getItemById(itemId);
      setFormData(prev => ({
        ...prev,
        availableStock: res.data?.availableStock || 0
      }));
    } catch (err) {
      console.error("Error fetching item stock:", err);
    }
  };

  const fetchWriteOffData = async () => {
    try {
      const res = await getAllWriteOffItems();
      setWriteOffData(res.data || []);
    } catch (err) {
      console.error("Error fetching write-off data:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'itemCategory') {
      fetchItems(value);
      setFormData(prev => ({ ...prev, itemId: '', availableStock: '' }));
    }

    if (name === 'itemId') {
      fetchStockOfItem(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        item: formData.itemId,
        itemCategory: formData.itemCategory,
        damageQuantity: parseInt(formData.damageQuantity, 10),
        remarks: formData.remarks,
      };


      const res = await addWriteOffEntry(payload);
      toast.success(res.message || "Write off entry added");
      onClose();
      fetchWriteOffData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchWriteOffData();
  }, []);

  const breadcrumbItems = [
    { label: "Stock", link: "/stock/all-module" },
    { label: "Write Off Entry", link: "null" }
  ];

  const displayTableData = writeOffData.map((entry, idx) => ({
    ...entry,
    id: idx + 1,
    itemCategory: entry.itemCategory?.categoryName || '',
    itemName: entry.item?.itemName || '',
    totalStock: entry.totalStock || 0,
  }));

  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container><Row><Col><BreadcrumbComp items={breadcrumbItems} /></Col></Row></Container>
      </div>

      <section>
        <Container>
          <Row><Col>
            <Button onClick={onOpen} className="btn-add"><CgAddR /> Add Item</Button>
            {isPopoverOpen && (
              <div className="cover-sheet">
                <div className="studentHeading">
                  <h2>Write-Off Entry</h2>
                  <button className='closeForm' onClick={onClose}>X</button>
                </div>

                <Form className="formSheet" onSubmit={handleSubmit}>
                  <Row className="mb-3">
                    <FormGroup as={Col} md="6">
                      <FormLabel>Item Category</FormLabel>
                      <FormSelect name="itemCategory" value={formData.itemCategory} onChange={handleChange} required>
                        <option value="">Select Any Category</option>
                        {itemCategories.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                        ))}
                      </FormSelect>
                    </FormGroup>

                    <FormGroup as={Col} md="6">
                      <FormLabel>Item Name</FormLabel>
                      <FormSelect name="itemId" value={formData.itemId} onChange={handleChange} required>
                        <option value="">Select Item</option>
                        {items.map(it => (
                          <option key={it._id} value={it._id}>{it.itemName}</option>
                        ))}
                      </FormSelect>
                    </FormGroup>
                  </Row>

                  <Row className="mb-3">
                    <FormGroup as={Col} md="6">
                      <FormLabel>Available Stock</FormLabel>
                      <FormControl type="text" value={formData.availableStock} disabled />
                    </FormGroup>

                    <FormGroup as={Col} md="6">
                      <FormLabel>Damage Qty</FormLabel>
                      <FormControl name="damageQuantity" type="number" value={formData.damageQuantity} onChange={handleChange} required />
                    </FormGroup>
                  </Row>

                  <Row className="mb-3">
                    <FormGroup as={Col} md="12">
                      <FormLabel>Remarks</FormLabel>
                      <FormControl name="remarks" type="text" value={formData.remarks} onChange={handleChange} required />
                    </FormGroup>
                  </Row>

                  <Button type="submit">Write Off</Button>
                </Form>
              </div>
            )}
          </Col></Row>

          <Row><Col>
            <div className="tableSheet">
              <h2>Write Off Entry Records</h2>
              <Table columns={columns} data={displayTableData} />
            </div>
          </Col></Row>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(StockWriteOffEntry), { ssr: false });
