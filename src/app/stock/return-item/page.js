"use client";
import React, { useEffect, useState, useMemo } from 'react';
import Table from '@/app/component/DataTable';
import { FaEdit, FaUndo, FaTrashAlt } from "react-icons/fa";
import { Container, Row, Col, Form, FormLabel, FormGroup, FormControl, FormSelect, Button } from 'react-bootstrap';
import { CgAddR } from 'react-icons/cg';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import dynamic from 'next/dynamic';
import { addNewIssuedItem, deleteIssuedItemById, getAllDepartments, getAllIssuedItems, getAllStudents, getItemCategories, getItemsByCategoryId } from '@/Services';
import { toast } from 'react-toastify';

const ReturnItem = () => {
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
  const [quantity, setQuantity] = useState();
  const [remarks, setRemarks] = useState('');

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
    {
      name: "Actions",
      cell: (row) => (
        <button
          // onClick={onOpen}
          className="editButton bg-success"
          onClick={() => handleReturn(row._id)}
        >
          Return <FaUndo />
        </button>
      ),
    }
  ];

  const fetchData = async () => {
    try {
      const response = await getAllIssuedItems();
      setData(response.data || []);
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

  const fetchStudents = async () => {
    const response = await getAllStudents();
    setStudents(response.data);
  };

  const fetchDepartments = async () => {
    const response = await getAllDepartments();
    setDepartmentData(response.data);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    let issuedToId = '';
    let issuedToName = '';

    if (issueTo === 'Student') {
      const student = students.find((s) => s._id === selectedStudent);
      if (!student) {
        toast.error("Please select a student.");
        return;
      }
      issuedToId = student._id;
      issuedToName = `${student.first_name} ${student.last_name}`;
    } else if (issueTo === 'Department') {
      const dept = departmentData.find((d) => d._id === selectedDepartment);
      if (!dept) {
        toast.error("Please select a department.");
        return;
      }
      issuedToId = dept._id;
      issuedToName = dept.department_name;
    } else if (issueTo === 'Other') {
      if (!otherName.trim()) {
        toast.error("Please enter a name.");
        return;
      }
      issuedToId = otherName.trim();
      issuedToName = otherName.trim();
    } else {
      toast.error("Please select whom to issue to.");
      return;
    }

    if (!selectedCategory || !selectedItem || !quantity || quantity <= 0 || !remarks.trim()) {
      toast.error("Please fill all required fields properly.");
      return;
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
      const response = await addNewIssuedItem(payload);
      toast.success(response?.message || "Item issued successfully!");
      onClose();
      fetchData();
      setSelectedCategory('');
      setSelectedItem('');
      setIssueTo('');
      setSelectedStudent('');
      setSelectedDepartment('');
      setOtherName('');
      setQuantity(0);
      setRemarks('');
    } catch (error) {
      console.error("Error issuing item:", error);
      toast.error(error?.response?.data?.message || "Failed to issue item. Please try again.");
    }
  };

  const handleReturn = async (id) => {

    const confirmDelete = confirm("Are you sure you want to return this issued item?");
    if (confirmDelete) {
      try {
        const response = await deleteIssuedItemById(id);
        toast.success("Item return successfully!");
        fetchData();
      } catch (error) {
        console.error("Error deleting issued item:", error);
        toast.error(error?.response?.data?.message || "Failed to delete issued item. Please try again.");
      }
    }
  }


  useEffect(() => { fetchItemCategories(); fetchData() }, []);
  useEffect(() => {
    if (selectedCategory) fetchItemsByCategory(selectedCategory);
  }, [selectedCategory]);

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
                        <FormSelect required onChange={(e) => setSelectedCategory(e.target.value)}>
                          <option value="">Select Category</option>
                          {itemCategories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.categoryName}
                            </option>
                          ))}
                        </FormSelect>
                      </FormGroup>

                      <FormGroup as={Col} md="6">
                        <FormLabel>Item Name</FormLabel>
                        <FormSelect required onChange={(e) => setSelectedItem(e.target.value)}>
                          <option value="">Select</option>
                          {items.map((item) => (
                            <option key={item._id} value={item._id}>
                              {item.itemName}
                            </option>
                          ))}
                        </FormSelect>
                      </FormGroup>
                    </Row>

                    <Row>
                      <FormGroup as={Col} md="6">
                        <FormLabel>Select Issue To</FormLabel>
                        <FormSelect
                          required
                          value={issueTo}
                          onChange={(e) => {
                            const selected = e.target.value;
                            setIssueTo(selected);
                            if (selected === "Student") fetchStudents();
                            else if (selected === "Department") fetchDepartments();
                          }}
                        >
                          <option value="">Select</option>
                          <option value="Student">Student</option>
                          <option value="Department">Department</option>
                          <option value="Other">Other</option>
                        </FormSelect>
                      </FormGroup>

                      {issueTo === 'Student' && (
                        <FormGroup as={Col} md="6">
                          <FormLabel>Select Student</FormLabel>
                          <FormSelect required value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
                            <option value="">Select Student</option>
                            {students.map((stu) => (
                              <option key={stu._id} value={stu._id}>
                                {stu.first_name} {stu.last_name} (Father: {stu.father_name})
                              </option>
                            ))}
                          </FormSelect>
                        </FormGroup>
                      )}

                      {issueTo === 'Department' && (
                        <FormGroup as={Col} md="6">
                          <FormLabel>Select Department</FormLabel>
                          <FormSelect required value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                            <option value="">Select Department</option>
                            {departmentData.map((dept) => (
                              <option key={dept._id} value={dept._id}>
                                {dept.department_name}
                              </option>
                            ))}
                          </FormSelect>
                        </FormGroup>
                      )}

                      {issueTo === 'Other' && (
                        <FormGroup as={Col} md="6">
                          <FormLabel>Enter Name</FormLabel>
                          <FormControl
                            type="text"
                            required
                            value={otherName}
                            onChange={(e) => setOtherName(e.target.value)}
                          />
                        </FormGroup>
                      )}
                    </Row>

                    <Row className="mb-3">
                      <FormGroup as={Col} md="6">
                        <FormLabel>Issued Quantity</FormLabel>
                        <FormControl type="number" required value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                      </FormGroup>
                      <FormGroup as={Col} md="6">
                        <FormLabel>Remarks</FormLabel>
                        <FormControl type="text" required value={remarks} onChange={(e) => setRemarks(e.target.value)} />
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
                <Table columns={columns} data={formattedData} />
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(ReturnItem), { ssr: false });