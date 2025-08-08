"use client";

import React, { useEffect, useState } from "react";
import { CgAddR } from "react-icons/cg";
import Select from "react-select";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
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
import { addNewFeeGroup, deleteFeeGroupById, getAllSections, getClasses, getFeeGroups, updateFeeGroupById } from "@/Services";
import useSessionId from "@/hooks/useSessionId";
import usePagePermission from "@/hooks/usePagePermission";
const breadcrumbItems = [
  { label: "Fee", link: "/fees/all-module" },
  { label: "fee-Group", link: "null" },
];
const FeeGroup = () => {
  const { hasSubmitAccess, hasEditAccess } = usePagePermission()

  const selectedSessionId = useSessionId()
  const [loading, setLoading] = useState(false);
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [newFeeGroup, setNewFeeGroup] = useState({
    group_name: "",
    section_name: [],
    late_fine_per_day: "",
  });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [data, setData] = useState([]);

  const fetchClasses = async () => {
    try {
      const response = await getClasses()
      setClassList(response.data || []);
    } catch {
      console.log("Failed to fetch classes.");
    }
  };

  const fetchAllSections = async () => {
    try {
      const response = await getAllSections()
      setSectionList(response.data || []);
    } catch {
      console.log("Failed to fetch all sections.");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getFeeGroups();

      if (response?.success) {
        const transformedData = response.data.map((item) => ({
          _id: item._id,
          group_name: item.group_name || "N/A",
          late_fine_per_day: item.late_fine_per_day || "N/A",
          section_name: Array.isArray(item.section_name)
            ? item.section_name
              .map(
                (sec) =>
                  `${sec.class?.class_name || "N/A"}#${sec.section_name || "N/A"}`
              )
              .join(", ")
            : "N/A",
          raw_section_ids: item.section_name?.map((sec) => sec._id) || [],
        }));
        setData(transformedData);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Failed to fetch fee groups:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchAllSections();
    fetchData();
  }, [selectedSessionId]);

  const validateForm = () => {
    let newErrors = {};

    if (!newFeeGroup.group_name.trim()) {
      newErrors.group_name = "Group name is required!";
    }

    if (!newFeeGroup.section_name || newFeeGroup.section_name.length === 0) {
      newErrors.section_name = "Please select at least one section";
    }

    if (!newFeeGroup.late_fine_per_day || isNaN(newFeeGroup.late_fine_per_day)) {
      newErrors.late_fine_per_day = "Please enter a valid fine amount";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleAdd = async () => {
    if (!validateForm()) {
      toast.warning("Please fill required fields.");
      return;
    }
    try {
      const response = await addNewFeeGroup(newFeeGroup);
      if (response?.success) {
        toast.success(response?.message || "Fee group added successfully.");
        fetchData();
        setIsPopoverOpen(false);
        setNewFeeGroup({
          group_name: "",
          section_name: [],
          late_fine_per_day: "",
        });
      } else {
        toast.error(response.message || "Failed to add fee group.");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to add fee group. Please try again.";
      toast.error(errorMessage);
      console.error("Error adding fee group:", error);
    }
  };

  const handleEdit = async (row) => {
    await fetchAllSections(); // Ensure fresh data
    setEditId(row._id);
    setEditData({
      group_name: row.group_name,
      section_name: row.raw_section_ids || [],
      late_fine_per_day: row.late_fine_per_day,
    });
    // console.log("Fetched Sections:", sectionList);
    // console.log("Editing Row:", row);

  };

  const handleSave = async (id) => {
    try {
      const response = await updateFeeGroupById(id, editData)
      if (response?.success) {
        toast.success(response.message || "Fee group updated successfully.");
        setEditId(null);
        fetchData();
      } else {
        console.log("Failed to update fee group.");
        toast.error(response.message || "Failed to update fee group.");
      }
    } catch (err) {
      toast.error("Failed to update fee group. Please try again.");
      console.log("Failed to update fee group.", err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this fee group?")) {
      try {
        const response = await deleteFeeGroupById(id);
        if (response?.success) {
          toast.success(response.message || "Fee group deleted successfully.");
          fetchData();
        } else {
          toast.error(response.message || "Failed to delete fee group.");
          console.log("Failed to delete fee group.");
        }
      } catch (err) {
        toast.error("Failed to delete fee group. Please try again.");
        console.log("Failed to delete fee group.", err);
      }
    }
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Group Name",
      selector: (row) =>
        editId === row._id ? (
          <FormControl
            type="text"
            value={editData.group_name}
            onChange={(e) =>
              setEditData({ ...editData, group_name: e.target.value })
            }
          />
        ) : (
          row.group_name
        ),

      width: '150px',
      sortable: true
    },
    {
      name: "Section",
      selector: (row) => {
        const isEditing = editId === row._id;

        const options = sectionList.map((s) => ({
          value: s._id,
          label: `${s.class?.class_name || "N/A"}#${s.section_name || "N/A"}`
        }));

        const selectedOptions = options.filter((opt) =>
          (editData.section_name || []).includes(opt.value)
        );

        return isEditing ? (
          <Select
            isMulti
            options={options}
            value={selectedOptions}
            onChange={(selected) =>
              setEditData({
                ...editData,
                section_name: selected.map((opt) => opt.value),
              })
            }
            menuPortalTarget={typeof window !== "undefined" ? document.body : null}
            menuPosition="fixed"
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
          />

        ) : (
          row.section_name
        );
     
      },
       width:'350px'
    }
    ,
    {
      name: "Late Fine Per Day",
      selector: (row) =>
        editId === row._id ? (
          <FormControl
            type="text"
            value={editData.late_fine_per_day}
            onChange={(e) =>
              setEditData({ ...editData, late_fine_per_day: e.target.value })
            }
          />
        ) : (
          `₹${row.late_fine_per_day}`
        ),

    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          {editId === row._id ? (
            <Button size="sm" variant="success" onClick={() => handleSave(row._id)}>
              <FaSave />
            </Button>
          ) : (
            <Button size="sm" variant="success" onClick={() => handleEdit(row)}>
              <FaEdit />
            </Button>
          )}
          <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </Button>
        </div>
      ),

      width: '100px'
    },
  ];

  const handlePrint = () => {
    const tableHeaders = [["#", "Group Name", "Late Fine Per Day"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.group_name,
      row.late_fine_per_day,
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Group Name", "Late Fine Per Day"];
    const rows = data.map(
      (row, index) =>
        `${index + 1}\t${row.group_name}\t${row.late_fine_per_day}`
    );
    copyContent(headers, rows);
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

      <section>
        <Container>
          {hasSubmitAccess && (
            <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
              <CgAddR /> Add Fee Group
            </Button>
          )}

          {isPopoverOpen && (
            <div className="cover-sheet bg-light">
              <div className="studentHeading">
                <h2>Add New Fee Group</h2>
                <button className="closeForm" onClick={() => setIsPopoverOpen(false)}>X</button>
              </div>
              <Form className="formSheet">
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Group Name <span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Group Name"
                      value={newFeeGroup.group_name}
                      onChange={(e) => {
                        setNewFeeGroup({ ...newFeeGroup, group_name: e.target.value });
                        // Clear error for group_name on change
                        if (formErrors.group_name) {
                          setFormErrors((prevErrors) => ({ ...prevErrors, group_name: "" }));
                        }
                      }}
                      isInvalid={!!formErrors.group_name}
                    />
                    <Form.Control.Feedback type="invalid">{formErrors.group_name}</Form.Control.Feedback>
                  </Col>

                  <Col lg={6}>
                    <FormLabel className="labelForm">Class & Section<span className="text-danger">*</span></FormLabel>
                    <Select
                      isMulti
                      options={sectionList.map((sectionItem) => ({
                        value: sectionItem._id,
                        label: `${sectionItem.class?.class_name}#${sectionItem.section_name}`,
                      }))}
                      value={sectionList
                        .filter((s) => newFeeGroup.section_name.includes(s._id))
                        .map((s) => ({
                          value: s._id,
                          label: `${s.class?.class_name}#${s.section_name}`,
                        }))}
                      onChange={(selectedOptions) => {
                        setNewFeeGroup({
                          ...newFeeGroup,
                          section_name: selectedOptions.map((opt) => opt.value),
                        })
                        if (formErrors.section_name) {
                          setFormErrors((prev) => ({ ...prev, section_name: "" }));
                        }
                      }
                      }
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                    {formErrors.section_name && (
                      <div className="text-danger mt-1">{formErrors.section_name}</div>
                    )}

                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Late Fine Per Day<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Late Fine"
                      value={newFeeGroup.late_fine_per_day}
                      onChange={(e) => {
                        setNewFeeGroup({
                          ...newFeeGroup,
                          late_fine_per_day: e.target.value,
                        })
                        if (formErrors.late_fine_per_day) {
                          setFormErrors((prevErrors) => ({ ...prevErrors, late_fine_per_day: "" }));
                        }
                      }}
                      isInvalid={!!formErrors.late_fine_per_day}
                    />
                    <Form.Control.Feedback type="invalid">{formErrors.late_fine_per_day}</Form.Control.Feedback>
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary mt-3">
                  Add Fee Group
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Fee Group Records</h2>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <Table
                columns={columns}
                data={data}
                handlePrint={handlePrint}
                handleCopy={handleCopy}
              />
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default FeeGroup;
// export default dynamic(() => Promise.resolve(FeeGroup), { ssr: false });