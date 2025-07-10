"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  FormControl,
  FormLabel,
  Button,
} from "react-bootstrap";
import Table from "@/app/component/DataTable";
import { toast } from "react-toastify";
import { copyContent, printContent } from "@/app/utils";

import BreadcrumbComp from "@/app/component/Breadcrumb";
import { createFacultyAttendance, getAllEmployee } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const MarkPresentPage = () => {
  const { hasSubmitAccess } = usePagePermission()

  const today = new Date().toISOString().split("T")[0];
  const [attendanceDate, setAttendanceDate] = useState(today);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await getAllEmployee();
        setStaffList(response?.data || []);
      } catch (err) {
        toast.error("Failed to fetch staff data.");
      }
    };
    fetchEmployeeData();
  }, []);

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    setSelectedStaffIds(checked ? staffList.map((s) => s._id) : []);
  };

  const handleSelectOne = (id) => {
    setSelectedStaffIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "70px",
    },
    {
      name: "Select",
      cell: (row) => (
        <Form.Check
          type="checkbox"
          checked={selectedStaffIds.includes(row._id)}
          onChange={() => handleSelectOne(row._id)}
        />
      ),
      width: "100px",
    },
    {
      name: "Faculty Name",
      selector: (row) => row.employee_name,
      sortable: true,
    },
    {
      name: "Designation",
      selector: (row) =>
        row.category === "teaching" ? "Teaching" : "Non-Teaching",
      sortable: true,
    },
    {
      name: "Mobile No",
      selector: (row) => row.mobile_no,
      sortable: true,
    },
  ];

  const handleSubmit = async () => {
    if (!attendanceDate) {
      toast.warning("Please select attendance date.");
      return;
    }

    if (selectedStaffIds.length === 0) {
      toast.warning("No staff selected.");
      return;
    }

    try {
      const payload = {
        attendance_date: attendanceDate,
        present_staff: selectedStaffIds,
      };

      const res = await createFacultyAttendance(payload)
      if (res.success) {
        toast.success("Attendance marked successfully!");
        setSelectedStaffIds([]);
        setSelectAll(false);
      } else {
        toast.error(res.message || "Failed to mark attendance.");
      }
    } catch (err) {
      toast.error(err?.response?.data.message || "Error while marking attendance.");
      console.error(err);
    }
  };
  const handlePrint = () => {
    const tableHeaders = [["#", "Faculty Name", "Designation", "Mobile No"]];
    const tableRows = staffList.map((row, index) => [
      index + 1,
      row.employee_name,
      row.category === "teaching" ? "Teaching" : "Non-Teaching",
      row.mobile_no,
    ]);
    printContent(tableHeaders, tableRows);
  }
  const handleCopy = () => {
    const headers = ["#", "Faculty Name", "Designation", "Mobile No"];
    const rows = staffList.map((row, index) =>
      `${index + 1}\t${row.employee_name}\t${row.category === "teaching" ? "Teaching" : "Non-Teaching"
      }\t${row.mobile_no}`
    );
    copyContent(headers, rows);
  }
  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row className="mt-1 mb-1">
            <Col>
              <BreadcrumbComp
                items={[
                  { label: "HRD", link: "/hrd/allModule" },
                  { label: "Mark Present", link: null },
                ]}
              />
            </Col>
          </Row>
        </Container>
      </div>
      <section>
        <Container>
          <div className="cover-sheet">
            <div className="studentHeading">
              <h2>Employee/Faculty Attendance</h2>
            </div>
            <Form className="formSheet">
              <Row className="mb-3">
                <Col lg={6}>
                  <FormLabel>
                    Attendance Date <span className="text-danger">*</span>
                  </FormLabel>
                  <FormControl
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                  />
                </Col>
              </Row>
              <Row>
                {hasSubmitAccess && (
                  <Col lg={2} className="d-flex align-items-end">
                    <Button variant="primary" onClick={handleSubmit}>
                      Submit
                    </Button>
                  </Col>
                )}
              </Row>
            </Form>
          </div>
          <div className="cover-sheet">
            <h5 className="text-bg-secondary p-2">
              Staff Details ({" "}
              <Form.Check
                inline
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />
              Select All Staff For Present )
            </h5>
            <div className="tableSheet">
              <Table
                columns={columns}
                data={staffList}
                handleCopy={handleCopy}
                handlePrint={handlePrint}
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};

export default MarkPresentPage;
