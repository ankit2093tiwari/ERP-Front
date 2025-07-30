"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";
import { addNewSchoolAccount, getAllSchoolAccounts, updateSchoolAccountById } from "@/Services";
import { toast } from "react-toastify";
import usePagePermission from "@/hooks/usePagePermission";

const SchoolAccount = () => {
  const { hasEditAccess } = usePagePermission()
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [newAccount, setNewAccount] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedAccount, setEditedAccount] = useState("");


  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllSchoolAccounts()
      setData(response.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch school accounts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newAccount.trim()) {
      setError("School account name cannot be empty");
      toast.warn("School account name cannot be empty");
      return;
    }

    try {
      const response = await addNewSchoolAccount({
        school_account: newAccount,
      })
      toast.success("School Account added successfully")
      setNewAccount("");
      setIsPopoverOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error adding account:", error);
      setError(error.response?.data?.message || "Failed to add school account");
      toast.error(error.response?.data?.message || "Failed to add school account");
    }
  };

  const handleEdit = (row) => {
    setEditingId(row._id);
    setEditedAccount(row.school_account);
  };

  const handleUpdate = async (id) => {
    if (!editedAccount.trim()) {
      setError("School account name cannot be empty");
      toast.warn("School account name cannot be empty");
      return;
    }

    try {
      await updateSchoolAccountById(id, {
        school_account: editedAccount,
      })
      toast.success("School account updated successfully.")
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error("Error updating account:", error);
      setError(error.response?.data?.message || "Failed to update school account");
      toast.error(error.response?.data?.message || "Failed to update school account");
    }
  };

  const handleCopy = () => {
    const headers = ["#", "School Account"];
    const rows = data.map((row, index) => `${index + 1}\t${row.school_account || "N/A"}`);
    copyContent(headers, rows);
  };

  const handlePrint = () => {
    const headers = [["#", "School Account"]];
    const rows = data.map((row, index) => [index + 1, row.school_account || "N/A"]);
    printContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      name: "#",
      selector: (_, index) => index + 1,
      width: "80px",
    },
    {
      name: "School Account",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedAccount}
            onChange={(e) => setEditedAccount(e.target.value)}
            className="inline-edit-input"
          />
        ) : (
          row.school_account || "N/A"
        ),
      sortable: true,
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          {editingId === row._id ? (
            <Button variant="success" size="sm" onClick={() => handleUpdate(row._id)}>
              <FaSave />
            </Button>
          ) : (
            <Button variant="success" size="sm" onClick={() => handleEdit(row)}>
              <FaEdit />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: "Fee", link: "/fees/all-module" },
    { label: "School Account", link: null },
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
          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New School Account</h2>
                <button className="closeForm" onClick={() => setIsPopoverOpen(false)}>X</button>
              </div>
              <Form className="formSheet">
                <Row>
                  <Col lg={12}>
                    <FormLabel>School Account</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter School Account"
                      value={newAccount}
                      onChange={(e) => setNewAccount(e.target.value)}
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary mt-3">
                  Add
                </Button>
                {error && <p className="text-danger mt-2">{error}</p>}
              </Form>
            </div>
          )}
          <div className="tableSheet mt-4">
            <h2>School Account Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && (
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

export default dynamic(() => Promise.resolve(SchoolAccount), { ssr: false });
