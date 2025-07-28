"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
} from "react-bootstrap";
import { toast } from "react-toastify";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";
import {
  addNewHoliday,
  deleteHolidayById,
  getAllHolydays,
  updateHolidayById,
} from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const HolidayMasterPage = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission()
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [holidayName, setHolidayName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [formError, setFormError] = useState({});
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Fetch holiday data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllHolydays();
      setData(response.data || []);
    } catch (err) {
      toast.error("Failed to fetch holidays.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setHolidayName("");
    setFromDate("");
    setToDate("");
    setFormError({});
    setEditingId(null);
    setIsFormVisible(false);
  };

  const handleEdit = (row) => {
    setEditingId(row._id);
    setHolidayName(row.holiday_name);
    setFromDate(row.from_date?.substring(0, 10));
    setToDate(row.to_date?.substring(0, 10));
    setFormError({});
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this holiday?")) {
      try {
        await deleteHolidayById(id);
        toast.success("Holiday deleted successfully.");
        fetchData();
      } catch {
        toast.error("Failed to delete holiday.");
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!holidayName.trim()) errors.holiday_name = "Holiday name is required.";
    if (!fromDate) errors.from_date = "From date is required.";
    if (!toDate) errors.to_date = "To date is required.";
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      errors.to_date = "To Date must be after From Date.";
    }
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const formData = {
        holiday_name: holidayName.trim(),
        from_date: fromDate,
        to_date: toDate,
      };

      if (editingId) {
        await updateHolidayById(editingId, formData);
        toast.success("Holiday updated successfully.");
      } else {
        const exists = data.find(
          (item) =>
            item.holiday_name.toLowerCase() === holidayName.trim().toLowerCase()
        );
        if (exists) {
          toast.warning("Holiday already exists.");
          return;
        }
        await addNewHoliday(formData);
        toast.success("Holiday added successfully.");
      }

      resetForm();
      fetchData();
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "70px",
    },
    {
      name: "Holiday Name",
      selector: (row) => row.holiday_name || "N/A",
      sortable: true,
    },
    {
      name: "From Date",
      selector: (row) =>
        row.from_date ? new Date(row.from_date).toLocaleDateString() : "N/A",
      sortable: true,
    },
    {
      name: "To Date",
      selector: (row) =>
        row.to_date ? new Date(row.to_date).toLocaleDateString() : "N/A",
      sortable: true,
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <button className="editButton" onClick={() => handleEdit(row)}>
            <FaEdit />
          </button>
          <button
            className="editButton btn-danger"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const handleCopy = () => {
    const headers = ["#", "Holiday Name", "From Date", "To Date"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.holiday_name || "N/A"}\t${row.from_date ? new Date(row.from_date).toLocaleDateString() : "N/A"
      }\t${row.to_date ? new Date(row.to_date).toLocaleDateString() : "N/A"}`
    );
    copyContent(headers, rows);
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Holiday Name", "From Date", "To Date"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.holiday_name || "N/A",
      row.from_date ? new Date(row.from_date).toLocaleDateString() : "N/A",
      row.to_date ? new Date(row.to_date).toLocaleDateString() : "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row className="mt-1 mb-1">
            <Col>
              <BreadcrumbComp
                items={[
                  { label: "HRD", link: "/hrd/allModule" },
                  { label: "Holiday Master", link: null },
                ]}
              />
            </Col>
          </Row>
        </Container>
      </div>

      <section>
        <Container>
          {hasSubmitAccess && (
            <Button
              onClick={() => {
                resetForm();
                setIsFormVisible(true);
              }}
              className="btn-add"
            >
              <CgAddR /> Add Holiday
            </Button>
          )}

          {isFormVisible && (
            <div className="cover-sheet mt-3 mb-4">
              <div className="studentHeading">
                <h2>{editingId ? "Edit Holiday" : "Add Holiday"}</h2>
                <button className="closeForm" onClick={resetForm}>
                  X
                </button>
              </div>

              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Holiday Name<span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      value={holidayName}
                      onChange={(e) => {
                        setHolidayName(e.target.value);
                        setFormError((prev) => ({ ...prev, holiday_name: "" }));
                      }}
                      isInvalid={!!formError.holiday_name}
                      placeholder="Enter Holiday Name"
                    />
                    {formError.holiday_name && (
                      <div className="text-danger mt-1">
                        {formError.holiday_name}
                      </div>
                    )}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      From Date<span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="date"
                      value={fromDate}
                      onChange={(e) => {
                        setFromDate(e.target.value);
                        setFormError((prev) => ({ ...prev, from_date: "" }));
                      }}
                      isInvalid={!!formError.from_date}
                    />
                    {formError.from_date && (
                      <div className="text-danger mt-1">
                        {formError.from_date}
                      </div>
                    )}
                  </Col>

                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      To Date<span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="date"
                      value={toDate}
                      onChange={(e) => {
                        setToDate(e.target.value);
                        setFormError((prev) => ({ ...prev, to_date: "" }));
                      }}
                      isInvalid={!!formError.to_date}
                    />
                    {formError.to_date && (
                      <div className="text-danger mt-1">
                        {formError.to_date}
                      </div>
                    )}
                  </Col>
                </Row>

                <Button onClick={handleSubmit} className="btn btn-primary">
                  {editingId ? "Update Holiday" : "Add Holiday"}
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Holiday Records</h2>
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

export default dynamic(() => Promise.resolve(HolidayMasterPage), { ssr: false });
