"use client";
import React, { useEffect, useState, useMemo } from 'react';
import Table from '@/app/component/DataTable';
import { FaEdit, FaUndo, FaTrashAlt } from "react-icons/fa";
import { copyContent, printContent } from "@/app/utils";
import { Container, Row, Col, Form, FormLabel, FormGroup, FormControl, FormSelect, Button } from 'react-bootstrap';
import { CgAddR } from 'react-icons/cg';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import dynamic from 'next/dynamic';
import { addNewIssuedItem, addNewReturnItem, deleteIssuedItemById, getAllDepartments, getAllIssuedItems, getAllStudents, getItemCategories, getItemsByCategoryId } from '@/Services';
import { toast } from 'react-toastify';
import usePagePermission from '@/hooks/usePagePermission';

const ReturnItem = () => {
const {hasSubmitAccess,hasEditAccess}=usePagePermission()

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const onOpen = () => setIsPopoverOpen(true);
  const onClose = () => {
    setIsPopoverOpen(false);
    setSelectedIssuedItem(null);
    setQuantity(0);
  };
  const [data, setData] = useState([]);
  const [itemCategories, setItemCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [items, setItems] = useState([]);
  const [quantity, setQuantity] = useState();
  const [remarks, setRemarks] = useState('');
  const [selectedIssuedItem, setSelectedIssuedItem] = useState(null);
  const [condition, setCondition] = useState("Good");
  const breadcrumbItems = [
    { label: "Stock", link: "/stock/all-module" },
    { label: "Issue Item", link: "null" }
  ];

  const columns = [
    {
      name: '#',
      selector: (row, index) => index + 1,
      width: '60px',
    },
    { name: 'Item Category', selector: row => row.itemCategory },
    { name: 'Item Name', selector: row => row.itemName },
    { name: 'Issued To', selector: row => row.issuedTo },
    { name: 'Quantity', selector: row => row.quantity },
    { name: 'Remarks', selector: row => row.remarks },
    { name: 'Date & Time', selector: row => row.dateAndTime },
    hasEditAccess &&{
      name: "Actions",
      cell: (row) => (
        <button
          // onClick={onOpen}
          className="editButton bg-success"
          onClick={() => handleReturn(row)}
        >
          Return <FaUndo />
        </button>
      ),
    }
  ];

  const fetchData = async () => {
    try {
      const response = await getAllIssuedItems();
      const filtered = (response.data || []).filter(item => !item.isReturned);
      setData(filtered);
    } catch (error) {
      console.error("Error fetching issued items:", error);
      toast.error("Failed to fetch issued items. Please try again.");
    }
  }
  const formattedData = useMemo(() => {
    return data.map(item => ({
      _id: item._id,
      itemCategory: item.itemCategory?.categoryName || '',
      itemName: item.item?.itemName || '',
      issuedTo: `${item.issuedToType}: ${item.issuedToName}`,
      quantity: item.quantity,
      remarks: item.remarks,
      dateAndTime: new Date(item.issuedAt).toLocaleString(),
    }));
  }, [data]);

  const fetchItemCategories = async () => {
    try {
      const response = await getItemCategories();
      setItemCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchItemsByCategory = async (categoryId) => {
    try {
      const response = await getItemsByCategoryId(categoryId);
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items by category:", error);
    }
  };


  const handleReturn = (item) => {
    setSelectedIssuedItem(item);
    setQuantity(item.quantity);
    setIsPopoverOpen(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        issuedItemId: selectedIssuedItem._id,
        quantity: parseInt(quantity, 10),
        condition: "Good", // or optionally ask the user
        remarks: selectedIssuedItem.remarks,
      };

      const response = await addNewReturnItem(payload)
      toast.success(response?.message || "Item returned successfully!");
      fetchData();
      setIsPopoverOpen(false);
      setSelectedIssuedItem(null);
      setQuantity(0);
    } catch (error) {
      console.error("Error returning item:", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to return item.";
      toast.error(errorMessage);
    }
  };


  useEffect(() => { fetchItemCategories(); fetchData() }, []);
  useEffect(() => {
    if (selectedCategory) fetchItemsByCategory(selectedCategory);
  }, [selectedCategory]);

  // Add these functions to your ReturnItem component
const handlePrint = () => {
  const tableHeaders = [["#", "Item Category", "Item Name", "Issued To", "Quantity", "Remarks", "Date & Time"]];
  const tableRows = formattedData.map((row, index) => [
    index + 1,
    row.itemCategory,
    row.itemName,
    row.issuedTo,
    row.quantity,
    row.remarks,
    row.dateAndTime
  ]);
  printContent(tableHeaders, tableRows);
};

const handleCopy = () => {
  const headers = ["#", "Item Category", "Item Name", "Issued To", "Quantity", "Remarks", "Date & Time"];
  const rows = formattedData.map((row, index) =>
    `${index + 1}\t${row.itemCategory}\t${row.itemName}\t${row.issuedTo}\t${row.quantity}\t${row.remarks}\t${row.dateAndTime}`
  );
  copyContent(headers, rows);
};
  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row>
            <Col><BreadcrumbComp items={breadcrumbItems} /></Col>
          </Row>
        </Container>
      </div>

      <section>
        <Container>
          <Row>
            <Col>

              {isPopoverOpen && (
                <div className="cover-sheet">
                  <div className="studentHeading">
                    <h2>Return Item</h2>
                    <button className='closeForm' onClick={onClose}>X</button>
                  </div>

                  <Form className="formSheet" onSubmit={handleSubmit}>
                    <Row className="mb-3">
                      <FormGroup as={Col} md="6">
                        <FormLabel>Item Category</FormLabel>
                        <FormControl
                          value={selectedIssuedItem?.itemCategory}
                          disabled
                        />
                      </FormGroup>

                      <FormGroup as={Col} md="6">
                        <FormLabel>Item Name</FormLabel>
                        <FormControl
                          value={selectedIssuedItem?.itemName}
                          disabled
                        />
                      </FormGroup>
                    </Row>

                    <Row className="mb-3">
                      <FormGroup as={Col} md="6">
                        <FormLabel>Issued To</FormLabel>
                        <FormControl
                          value={selectedIssuedItem?.issuedTo}
                          disabled
                        />
                      </FormGroup>

                      <FormGroup as={Col} md="6">
                        <FormLabel>Remarks</FormLabel>
                        <FormControl
                          value={selectedIssuedItem?.remarks}
                          disabled
                        />
                      </FormGroup>
                    </Row>

                    <Row className="mb-3">
                      <FormGroup as={Col} md="6">
                        <FormLabel>Condition<span className='text-danger'>*</span></FormLabel>
                        <FormSelect
                          value={condition}
                          onChange={(e) => setCondition(e.target.value)}
                          required
                        >
                          <option value="Good">Good</option>
                          <option value="Damaged">Damaged</option>
                          <option value="Used">Used</option>
                        </FormSelect>
                      </FormGroup>

                      <FormGroup as={Col} md="6">
                        <FormLabel>Return Quantity <span className='text-danger'>*</span></FormLabel>
                        <FormControl
                          type="number"
                          required
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                      </FormGroup>
                    </Row>
                    <Row>
                      <FormGroup as={Col} md="12">
                        <FormLabel>Remarks<span className='text-danger'>*</span></FormLabel>
                        <FormControl
                          required
                          type="text"
                          placeholder="Enter return remarks"
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                        />
                      </FormGroup>


                    </Row>
                    <Button type="submit" className='mt-4' variant='success'>Submit Return</Button>
                  </Form>

                </div>
              )}
            </Col>
          </Row>

          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Issued Items Records</h2>
                <Table columns={columns} data={formattedData} handleCopy={handleCopy}
                handlePrint={handlePrint} />
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(ReturnItem), { ssr: false });