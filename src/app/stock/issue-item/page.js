"use client";
import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Table from '@/app/component/DataTable';
import { FaTrashAlt } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import { copyContent, printContent } from "@/app/utils";
import { Container, Row, Col, Form, FormLabel, FormGroup, FormControl, FormSelect, Button } from 'react-bootstrap';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { addNewIssuedItem, deleteIssuedItemById, getAllDepartments, getAllIssuedItems, getAllStudents, getItemCategories, getItemsByCategoryId } from '@/Services';
import { toast } from 'react-toastify';
import usePagePermission from '@/hooks/usePagePermission';

const ItemIssue = () => {
  const {hasSubmitAccess,hasEditAccess}=usePagePermission()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const onOpen = () => setIsPopoverOpen(true);
  const onClose = () => setIsPopoverOpen(false);

  const [data, setData] = useState([]);
  const [itemCategories, setItemCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [departmentData, setDepartmentData] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [issueTo, setIssueTo] = useState('');
  const [otherName, setOtherName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState({});

  const breadcrumbItems = [
    { label: "Stock", link: "/stock/all-module" },
    { label: "Issue Item", link: "null" }
  ];

  const columns = [
    { name: '#', selector: (row, index) => index + 1, width: '60px' },
    { name: 'Item Category', selector: row => row.itemCategory },
    { name: 'Item Name', selector: row => row.itemName },
    { name: 'Issued To', selector: row => row.issuedTo },
    { name: 'Quantity', selector: row => row.quantity },
    { name: 'Remarks', selector: row => row.remarks },
    { name: 'Date & Time', selector: row => row.dateAndTime },
    hasEditAccess &&{
      name: "Actions",
      cell: (row) => (
        <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
          <FaTrashAlt />
        </button>
      ),
    }
  ];

  const fetchData = async () => {
    try {
      const response = await getAllIssuedItems();
      setData(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch issued items.");
    }
  };

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
      console.error(error);
    }
  };

  const fetchItemsByCategory = async (categoryId) => {
    try {
      const response = await getItemsByCategoryId(categoryId);
      setItems(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStudents = async () => {
    const response = await getAllStudents();
    setStudents(response.data);
  };

  const fetchDepartments = async () => {
    const response = await getAllDepartments();
    setDepartmentData(response.data);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedCategory) newErrors.selectedCategory = "Item category is required.";
    if (!selectedItem) newErrors.selectedItem = "Item name is required.";
    if (!issueTo) newErrors.issueTo = "Please select who to issue to.";

    if (issueTo === "Student" && !selectedStudent) newErrors.selectedStudent = "Please select a student.";
    if (issueTo === "Department" && !selectedDepartment) newErrors.selectedDepartment = "Please select a department.";
    if (issueTo === "Other" && !otherName.trim()) newErrors.otherName = "Please enter a name.";

    if (!quantity || quantity <= 0) newErrors.quantity = "Quantity must be greater than 0.";
    if (!remarks.trim()) newErrors.remarks = "Remarks are required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    let issuedToId = '', issuedToName = '';
    if (issueTo === "Student") {
      const stu = students.find((s) => s._id === selectedStudent);
      issuedToId = stu._id;
      issuedToName = `${stu.first_name} ${stu.last_name}`;
    } else if (issueTo === "Department") {
      const dept = departmentData.find((d) => d._id === selectedDepartment);
      issuedToId = dept._id;
      issuedToName = dept.department_name;
    } else {
      issuedToId = otherName.trim();
      issuedToName = otherName.trim();
    }

    const payload = {
      itemCategory: selectedCategory,
      item: selectedItem,
      issuedToType: issueTo,
      issuedToId,
      issuedToName,
      quantity: parseInt(quantity, 10),
      remarks: remarks.trim(),
    };

    try {
      const res = await addNewIssuedItem(payload);
      toast.success(res?.message || "Item issued successfully!");
      onClose();
      fetchData();
      setSelectedCategory('');
      setSelectedItem('');
      setIssueTo('');
      setSelectedStudent('');
      setSelectedDepartment('');
      setOtherName('');
      setQuantity('');
      setRemarks('');
      setErrors({});
    } catch (error) {
      toast.error("Failed to issue item.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this issued item?")) {
      try {
        const res = await deleteIssuedItemById(id);
        toast.success(res?.message || "Deleted successfully!");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete item.");
      }
    }
  };

  useEffect(() => { fetchItemCategories(); fetchData(); }, []);
  useEffect(() => { if (selectedCategory) fetchItemsByCategory(selectedCategory); }, [selectedCategory]);

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
        <Container><Row><Col><BreadcrumbComp items={breadcrumbItems} /></Col></Row></Container>
      </div>

      <section>
        <Container>
          <Row>
            <Col>
              {hasSubmitAccess && (<Button onClick={onOpen} className="btn-add"><CgAddR /> Issue Items</Button>)}
              {isPopoverOpen && (
                <div className="cover-sheet">
                  <div className="studentHeading">
                    <h2>Issue Item</h2>
                    <button className='closeForm' onClick={onClose}>X</button>
                  </div>

                  <Form className="formSheet" onSubmit={handleSubmit}>
                    <Row className="mb-3">
                      <FormGroup as={Col} md="6">
                        <FormLabel>Item Category <span className="text-danger">*</span></FormLabel>
                        <FormSelect value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setErrors({ ...errors, selectedCategory: "" }) }}>
                          <option value="">Select Category</option>
                          {itemCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.categoryName}</option>)}
                        </FormSelect>
                        {errors.selectedCategory && <div className="text-danger">{errors.selectedCategory}</div>}
                      </FormGroup>

                      <FormGroup as={Col} md="6">
                        <FormLabel>Item Name <span className="text-danger">*</span></FormLabel>
                        <FormSelect value={selectedItem} onChange={(e) => { setSelectedItem(e.target.value); setErrors({ ...errors, selectedItem: "" }) }}>
                          <option value="">Select</option>
                          {items.map(item => <option key={item._id} value={item._id}>{item.itemName}</option>)}
                        </FormSelect>
                        {errors.selectedItem && <div className="text-danger">{errors.selectedItem}</div>}
                      </FormGroup>
                    </Row>

                    <Row>
                      <FormGroup as={Col} md="6">
                        <FormLabel>Issue To <span className="text-danger">*</span></FormLabel>
                        <FormSelect value={issueTo} onChange={(e) => {
                          const val = e.target.value;
                          setIssueTo(val);
                          setErrors({ ...errors, issueTo: "" });
                          if (val === "Student") fetchStudents();
                          else if (val === "Department") fetchDepartments();
                        }}>
                          <option value="">Select</option>
                          <option value="Student">Student</option>
                          <option value="Department">Department</option>
                          <option value="Other">Other</option>
                        </FormSelect>
                        {errors.issueTo && <div className="text-danger">{errors.issueTo}</div>}
                      </FormGroup>

                      {issueTo === 'Student' && (
                        <FormGroup as={Col} md="6">
                          <FormLabel>Select Student <span className="text-danger">*</span></FormLabel>
                          <FormSelect value={selectedStudent} onChange={(e) => { setSelectedStudent(e.target.value); setErrors({ ...errors, selectedStudent: "" }) }}>
                            <option value="">Select</option>
                            {students.map(s => (
                              <option key={s._id} value={s._id}>{s.first_name} {s.last_name} (Father: {s.father_name})</option>
                            ))}
                          </FormSelect>
                          {errors.selectedStudent && <div className="text-danger">{errors.selectedStudent}</div>}
                        </FormGroup>
                      )}

                      {issueTo === 'Department' && (
                        <FormGroup as={Col} md="6">
                          <FormLabel>Select Department <span className="text-danger">*</span></FormLabel>
                          <FormSelect value={selectedDepartment} onChange={(e) => { setSelectedDepartment(e.target.value); setErrors({ ...errors, selectedDepartment: "" }) }}>
                            <option value="">Select</option>
                            {departmentData.map(d => (
                              <option key={d._id} value={d._id}>{d.department_name}</option>
                            ))}
                          </FormSelect>
                          {errors.selectedDepartment && <div className="text-danger">{errors.selectedDepartment}</div>}
                        </FormGroup>
                      )}

                      {issueTo === 'Other' && (
                        <FormGroup as={Col} md="6">
                          <FormLabel>Enter Name <span className="text-danger">*</span></FormLabel>
                          <FormControl type="text" value={otherName} onChange={(e) => { setOtherName(e.target.value); setErrors({ ...errors, otherName: "" }) }} />
                          {errors.otherName && <div className="text-danger">{errors.otherName}</div>}
                        </FormGroup>
                      )}
                    </Row>

                    <Row className="mb-3">
                      <FormGroup as={Col} md="6">
                        <FormLabel>Issued Quantity <span className="text-danger">*</span></FormLabel>
                        <FormControl type="number" value={quantity} onChange={(e) => { setQuantity(e.target.value); setErrors({ ...errors, quantity: "" }) }} />
                        {errors.quantity && <div className="text-danger">{errors.quantity}</div>}
                      </FormGroup>

                      <FormGroup as={Col} md="6">
                        <FormLabel>Remarks <span className="text-danger">*</span></FormLabel>
                        <FormControl type="text" value={remarks} onChange={(e) => { setRemarks(e.target.value); setErrors({ ...errors, remarks: "" }) }} />
                        {errors.remarks && <div className="text-danger">{errors.remarks}</div>}
                      </FormGroup>
                    </Row>

                    <Button type="submit">Issue Item</Button>
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
                handlePrint={handlePrint}/>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(ItemIssue), { ssr: false });
