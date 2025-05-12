"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaTrashAlt } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
  Breadcrumb, FormGroup, FormSelect, Table as BootstrapTable
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
const FeeStatement = () => {

  const [data, setData] = useState([]);
  const [feeGroups, setFeeGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const [newFeeSetting, setNewFeeSetting] = useState({
    group_name: "",
    total_amount: "",
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-fee-settings");
      if (response.data?.success && Array.isArray(response.data.feeSettings)) {
        setData(response.data.feeSettings);
      } else {
        setData([]);
        setError("No records found.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setData([]);
      setError("Failed to fetch fee settings.");
    } finally {
      setLoading(false);
    }
  };
  const fetchFeeGroups = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-fee-groups");
      if (response.data?.success && Array.isArray(response.data.data)) {
        setFeeGroups(response.data.data);
      } else {
        setFeeGroups([]);
      }
    } catch (err) {
      console.error("Error fetching fee groups:", err);
      setFeeGroups([]);
    }
  };
  const handleGroupChange = async (e) => {
    const selectedGroup = e.target.value;
    setNewFeeSetting((prev) => ({ ...prev, group_name: selectedGroup }));

    if (!selectedGroup) {
      setNewFeeSetting((prev) => ({ ...prev, total_amount: "" }));
      return;
    }
    try {
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/group-total/${selectedGroup}`);
      if (response.data?.success) {
        setNewFeeSetting((prev) => ({ ...prev, total_amount: response.data.totalAmount }));
      }
    } catch (err) {
      console.error("Error calculating total amount:", err);
    }
  };
  const handleAdd = async () => {
    if (!newFeeSetting.group_name || !newFeeSetting.total_amount) {
      alert("All fields are required.");
      return;
    }
    try {
      await axios.post("https://erp-backend-fy3n.onrender.com/api/add-fee-settings", newFeeSetting);
      fetchData();
      setNewFeeSetting({ group_name: "", total_amount: "" });
      setIsPopoverOpen(false);
    } catch (err) {
      console.error("Add error:", err);
      setError("Failed to add fee setting.");
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    try {
      await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-fee-setting/${id}`);
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete fee setting.");
    }
  };

  useEffect(() => {
    fetchData();
    fetchFeeGroups();
  }, []);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
    },
    {
      name: "Group Name",
      selector: (row) => row.group_name || "N/A",
      sortable: true,
    },
    {
      name: "Total Amount",
      selector: (row) => row.total_amount || "N/A",
      sortable: true,
    },
    {
      name: "Session",
      selector: (row) => row.session || "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>

      <div className="breadcrumbSheet">
        <Container>
          <Row>
            <Col>
              <Breadcrumb>
                <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                <Breadcrumb.Item href="/fees/fee-Statement">Fee Settings</Breadcrumb.Item>
                <Breadcrumb.Item active>Manage Fee Settings</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
        </Container>
      </div>
      <section>
        <Container>
          <div className="position-relative">
            <Button onClick={() => setIsPopoverOpen(true)} className="btn-add mb-4">
              <CgAddR /> New Fee
            </Button>
          </div>
          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Fee</h2>
                <button className="closeForm" onClick={() => setIsPopoverOpen(false)}>X</button>
              </div>
              <Form className="formSheet">
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Group Name</FormLabel>
                    <FormControl as="select" value={newFeeSetting.group_name} onChange={handleGroupChange}>
                      <option value="">Select Group</option>
                      {feeGroups.length > 0 ? (
                        feeGroups.map((group) => (
                          <option key={group._id} value={group.group_name}>
                            {group.group_name}
                          </option>
                        ))
                      ) : (
                        <option disabled>No groups available</option>
                      )}
                    </FormControl>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Total Amount</FormLabel>
                    <FormControl type="text" value={newFeeSetting.total_amount} readOnly />
                  </Col>
                </Row>
                <Row>
                  <Col lg={12}>
                    <BootstrapTable bordered responsive className="tableform mt-3">
                      <thead>
                        <tr>
                          <th></th>
                          <th></th>
                          <th>April</th>
                          <th>May</th>
                          <th>June</th>
                          <th>July</th>
                          <th>August</th>
                          <th>September</th>
                          <th>October</th>
                          <th>November</th>
                          <th>December</th>
                          <th>january</th>
                          <th>February</th>
                          <th>March</th>
                          <th>test</th>
                          <th>Sep</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th>ADMISSION FEE  </th>
                          <td>
                            <FormSelect name="class_name">
                              <option value="">Life Time</option>
                            </FormSelect>
                          </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                        </tr>
                        <tr>
                          <th>ANNUAL FEE </th>
                          <td>
                            <FormSelect name="class_name">
                              <option value="">Life Time</option>
                            </FormSelect>
                          </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                        </tr>
                        <tr>
                          <th>TUITION FEE</th>
                          <td>
                            <FormSelect name="class_name">
                              <option value="">Installment Type</option>
                            </FormSelect>
                          </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                        </tr>
                        <tr>
                          <th>TOTAL FEE	</th>
                          <td>
                          </td>
                          <td> <FormControl type="text" value="0" disabled /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                          <td> <FormControl type="text" value="0" /> </td>
                        </tr>
                        <tr>
                          <th>Fee Submission Last Date</th>
                          <td>

                          </td>
                          <td>  <FormControl type="date" value="0" /> </td>
                          <td>  <FormControl type="date" value="0" /> </td>
                          <td>  <FormControl type="date" value="0" /> </td>
                          <td>  <FormControl type="date" value="0" /> </td>
                          <td>  <FormControl type="date" value="0" /> </td>
                          <td>  <FormControl type="date" value="0" /> </td>
                          <td>  <FormControl type="date" value="0" /> </td>
                          <td>  <FormControl type="date" value="0" /> </td>
                          <td>  <FormControl type="date" value="0" /> </td>
                          <td>  <FormControl type="date" value="0" /> </td>
                          <td>  <FormControl type="date" value="0" /> </td>
                          <td>  <FormControl type="date" value="0" /> </td>
                          <td>  <FormControl type="date" value="0" /> </td>
                          <td>  <FormControl type="date" value="0" /> </td>
                        </tr>


                      </tbody>
                    </BootstrapTable>
                  </Col>

                </Row>
                <Button onClick={handleAdd} className="btn btn-primary mt-3">Add Fee</Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Fee Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && data.length > 0 ? (
              <Table columns={columns} data={data} />
            ) : (
              !loading && !error && <p>No data available.</p>
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default FeeStatement;
