"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Form, Row, Col, Container, FormLabel, FormSelect, Button, Breadcrumb, Table, FormGroup, FormCheck } from "react-bootstrap";
import * as XLSX from "xlsx";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { BASE_URL, getCategories, getClasses, getReligions, getSections } from "@/Services";
import { toast } from "react-toastify";

//  Only these fields will be exported if defined in fieldPathMap below
const Catalogues = [
  { id: "01", name: "Student Name" },
  { id: "02", name: "First Name" },
  { id: "03", name: "Last Name" },
  { id: "04", name: "Father Name" },
  { id: "05", name: "Mother Name" },
  { id: "06", name: "Class" },
  { id: "07", name: "Section" },
  { id: "08", name: "Date of Birth" },
  { id: "09", name: "Gender" },
  { id: "10", name: "Religion" },
  { id: "11", name: "Social Category" },
  { id: "12", name: "Cast" },
  { id: "13", name: "Fee Book No" },
  { id: "14", name: "Aadhar Card No." },
  { id: "15", name: "Mobile No" },
  { id: "16", name: "Residence Address" },
  { id: "17", name: "Date Of Admission" },
  { id: "18", name: "Date of Joining" },
  { id: "19", name: "Roll No" },
  { id: "20", name: "Father Mobile No." },
  { id: "21", name: "Gender" },
  { id: "22", name: "Registration No." }
];

const fieldPathMap = {
  "Student Name": (s) => `${s.first_name || ""} ${s.last_name || ""}`.trim(),
  "First Name": (s) => s.first_name || "",
  "Last Name": (s) => s.last_name || "",
  "Father Name": (s) => s.father_name || "",
  "Mother Name": (s) => s.mother_name || "",
  "Class": (s) => s.class_name?.class_name || "",
  "Section": (s) => s.section_name?.section_name || "",
  "Date of Birth": (s) => s.date_of_birth?.split("T")[0] || "",
  "Religion": (s) => s.religion_name?.religion_name || "",
  "Social Category": (s) => s.category_name?.category_name || "",
  "Cast": (s) => s.caste_name?.caste_name || "",
  "Fee Book No": (s) => s.fee_book_no || "",
  "Aadhar Card No.": (s) => s.aadhar_card_no || "",
  "Mobile No": (s) => s.phone_no || "",
  "Residence Address": (s) => s.residence_address || "",
  "Date Of Admission": (s) => s.date_of_admission?.split("T")[0] || "",
  "Date of Joining": (s) => s.date_of_joining?.split("T")[0] || "",
  "Roll No": (s) => s.roll_no || "",
  "Father Mobile No.": (s) => s.father_mobile_no || "",
  "Gender": (s) => s.gender_name || "",
  "Registration No.": (s) => s.registration_id || ""
};

const StudentListWizard = () => {
  const [student, setStudent] = useState({ class_name: "", section_name: "", category_name: "", religion_name: "" });
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [religionList, setReligionList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);
  const [list] = useState(Catalogues);

  useEffect(() => {
    fetchClasses();
    fetchReligion();
    fetchCategory();
  }, []);

  const fetchClasses = async () => {
    const res = await getClasses();
    setClassList(res?.data || []);
  };

  const fetchSections = async (classId) => {
    const res = await getSections(classId);
    setSectionList(res?.data || []);
  };

  const fetchReligion = async () => {
    const res = await getReligions();
    setReligionList(res?.data || []);
  };

  const fetchCategory = async () => {
    const res = await getCategories();
    setCategoryList(res?.data || []);
  };

  const handleClassChange = (e) => {
    const value = e.target.value;
    setStudent((prev) => ({ ...prev, class_name: value }));
    fetchSections(value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectAll = () => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(isCheckAll ? [] : list.map((li) => li.id));
  };

  const handleClick = (e) => {
    const { id, checked } = e.target;
    setIsCheck((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/students/search`, {
        params: {
          class_name: student.class_name,
          section_name: student.section_name,
          religion_name: student.religion_name,
        },
      });

      const filteredData = response.data?.data || [];

      const selectedColumns = list
        .filter((item) => isCheck.includes(item.id) && fieldPathMap[item.name])
        .map((item) => item.name);

      const excelData = filteredData.map((s) => {
        const row = {};
        selectedColumns.forEach((col) => {
          const getter = fieldPathMap[col];
          row[col] = getter ? getter(s) : "";
        });
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Students");
      XLSX.writeFile(wb, "filtered_students.xlsx");

      toast.success("Download successful!");
    } catch (err) {
      console.error("Download error", err);
      toast.error("Failed to download data.");
    } finally {
      setLoading(false);
    }
  };


  const breadcrumbItems = [
    { label: "students", link: "/students/reports/all-reports" },
    { label: "student-list-wizard", link: "null" },
  ];

  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row>
            <Col>
              <BreadcrumbComp items={breadcrumbItems} />
            </Col>
          </Row>
        </Container>
      </div>
      <section>
        <Container>
          <div className="cover-sheet">
            <div className="studentHeading">
              <h2>Please Select the Check Box to Download the Excel File</h2>
            </div>
            <Form className="formSheet">
              <Row>
                <Form.Group as={Col} md="6">
                  <FormLabel>Class</FormLabel>
                  <FormSelect value={student.class_name} onChange={handleClassChange}>
                    <option value="">Select Class</option>
                    {classList.map((cls) => (
                      <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                    ))}
                  </FormSelect>
                </Form.Group>
                <Form.Group as={Col} md="6">
                  <FormLabel>Section</FormLabel>
                  <FormSelect value={student.section_name} onChange={(e) => setStudent({ ...student, section_name: e.target.value })}>
                    <option value="">Select Section</option>
                    {sectionList.map((sec) => (
                      <option key={sec._id} value={sec._id}>{sec.section_name}</option>
                    ))}
                  </FormSelect>
                </Form.Group>
              </Row>

              <Row className="mt-2">
                <FormGroup as={Col} md="6">
                  <FormLabel>Social Category</FormLabel>
                  <FormSelect name="category_name" value={student.category_name} onChange={handleChange}>
                    <option value="">Select Category</option>
                    {categoryList.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.category_name}</option>
                    ))}
                  </FormSelect>
                </FormGroup>
                <FormGroup as={Col} md="6">
                  <FormLabel>Religion</FormLabel>
                  <FormSelect name="religion_name" value={student.religion_name} onChange={handleChange}>
                    <option value="">Select Religion</option>
                    {religionList.map((rel) => (
                      <option key={rel._id} value={rel._id}>{rel.religion_name}</option>
                    ))}
                  </FormSelect>
                </FormGroup>
              </Row>

              <Button
                className="mt-4"
                onClick={handleDownload}
                disabled={
                  loading ||
                  isCheck.length === 0
                }
              >
                {loading ? "Downloading..." : "Download"}
              </Button>

            </Form>

            <div className="p-2">
              <FormCheck
                type="checkbox"
                label="Select All"
                id="selectAll"
                onChange={handleSelectAll}
                checked={isCheckAll}
              />
            </div>

            <Table bordered className="TableWizard">
              <tbody>
                {list.reduce((rows, { id, name }, index) => {
                  if (index % 4 === 0) rows.push([]);
                  rows[rows.length - 1].push(
                    <td key={id}>
                      <FormCheck
                        type="checkbox"
                        label={name}
                        id={id}
                        onChange={handleClick}
                        checked={isCheck.includes(id)}
                      />
                    </td>
                  );
                  return rows;
                }, []).map((row, idx) => <tr key={idx}>{row}</tr>)}
              </tbody>
            </Table>
          </div>
        </Container>
      </section>
    </>
  );
};

export default StudentListWizard;
