"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Form, Row, Col, Container, FormLabel, FormSelect, Button, Breadcrumb, Table, FormGroup, FormCheck } from "react-bootstrap";
import * as XLSX from "xlsx";

const Catalogues = [
  { id: "01", name: "Adm.No." },
  { id: "02", name: "Fee Id." },
  { id: "03", name: "Parent ID" },
  { id: "04", name: "Student Name" },
  { id: "05", name: "Father Name" },
  { id: "06", name: "Mother Name" },
  { id: "07", name: "Class" },
  { id: "08", name: "Section" },
  { id: "09", name: "Student Roll No" },
  { id: "10", name: "Fee Group" },
  { id: "11", name: "Fee Apply. From" },
  { id: "12", name: "Mobile No" },
  { id: "13", name: "Date of Birth" },
  { id: "14", name: "Admitted Class" },
  { id: "15", name: "Gender" },
  { id: "16", name: "Religion" },
  { id: "17", name: "Cast" },
  { id: "18", name: "Social Catogary." },
  { id: "19", name: "House" },
  { id: "20", name: "Date Of Admission" },
  { id: "21", name: "Date of Join" },
  { id: "22", name: "Mother Tongue" },
  { id: "23", name: "Nationality" },
  { id: "24", name: "Name of School Last Attended" },
  { id: "25", name: "Reason for leaving the school" },
  { id: "26", name: "Boarding Category" },
  { id: "27", name: "Board" },
  { id: "28", name: "Unique ID" },
  { id: "29", name: "Residence Address" },
  { id: "30", name: "City/ District" },
  { id: "31", name: "State" },
  { id: "32", name: "Country & Pin No" },
  { id: "33", name: "Permanent Address" },
  { id: "34", name: "City/ District" },
  { id: "35", name: "State" },
  { id: "36", name: "Country & Pin No" },
  { id: "37", name: "Hobbies" },
  { id: "38", name: "Health" },
  { id: "39", name: "Blood Group" },
  { id: "40", name: "Samagra ID." },
  { id: "41", name: "Bank A/C No." },
  { id: "42", name: "A/C Name" },
  { id: "43", name: "Bank" },
  { id: "44", name: "IFSC Code" },
  { id: "45", name: "Aadhar Card No." },
  { id: "46", name: "Language 1" },
  { id: "47", name: "Language 2" },
  { id: "48", name: "Language 3" },
  { id: "49", name: "Parent Or Guardian Phone No" },
  { id: "50", name: "Father Birth date" },
  { id: "51", name: "Father Occupation" },
  { id: "52", name: "Father Income" },
  { id: "53", name: "Father Office Address" },
  { id: "54", name: "Father Mobile No." },
  { id: "55", name: "Father Aadhar" },
  { id: "56", name: "Father Email" },
  { id: "57", name: "Father Qualification" },
  { id: "58", name: "Mother Birth date" },
  { id: "59", name: "Mother Occupation" },
  { id: "60", name: "Mother Income" },
  { id: "61", name: "Mother Office Address" },
  { id: "62", name: "Mother Mobile No." },
  { id: "63", name: "Mother Aadhar" },
  { id: "64", name: "Mother Email" },
  { id: "65", name: "Userlogin" },
  { id: "66", name: "Userpass" },
  { id: "67", name: "Scholar No" },
  { id: "68", name: "Fee Book No" },
  { id: "69", name: "Guardian Name" },
  { id: "70", name: "Guardian MobileNo" }
];

const StudentListWizard = () => {
  const [student, setStudent] = useState({ class_name: "", section_name: "", category_name: "", religion_name: "" });
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [religionList, setReligionList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);
  const [list] = useState(Catalogues);



  useEffect(() => {
    fetchClasses();
    fetchReligion();
    fetchCategory();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/api/all-classes`);
      setClassList(response.data?.data || []);
    } catch {
      console.error("Failed to fetch classes.");
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/api/sections/class/${classId}`);
      setSectionList(response.data?.data || []);
    } catch {
      console.error("Failed to fetch sections.");
    }
  };

  const fetchReligion = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/api/religions`);
      const resp = response.data;
      setReligionList(resp.data || []);
    } catch (err) {
      setError("Failed to fetch religions.");
    }
  };

  const fetchCategory = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/api/categories`);
      const resp = response.data;
      setCategoryList(resp.data || []);
    } catch (err) {
      setError("Failed to fetch Categories.");
    }
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
    setIsCheck(isCheckAll ? [] : list.map(li => li.id));
  };

  const handleClick = (e) => {
    const { id, checked } = e.target;
    setIsCheck(prevState =>
      checked ? [...prevState, id] : prevState.filter(item => item !== id)
    );
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      // Fetch filtered data based on the selected criteria
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/api/students/search`, {
        params: {
          class_name: student.class_name,
          section_name: student.section_name,
          religion_name: student.religion_name,
        },
      });

      const filteredData = response.data?.data || [];

      // Prepare the data for the Excel sheet
      const selectedColumns = list.filter(item => isCheck.includes(item.id)).map(item => item.name);
      const excelData = filteredData.map(student => {
        const row = {};
        selectedColumns.forEach(column => {
          row[column] = student[column.toLowerCase().replace(/ /g, '_')] || '';
        });
        return row;
      });

      // Generate Excel sheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Students");
      XLSX.writeFile(wb, "filtered_students.xlsx");

      setResponseMessage("Download successful!");
    } catch (error) {
      console.error("Failed to download data:", error);
      setResponseMessage("Failed to download data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/master-entry/school-info">Master Entry</Breadcrumb.Item>
        <Breadcrumb.Item active>Student List Wizard</Breadcrumb.Item>
      </Breadcrumb>
      <div className="cover-sheet">
        <div className="studentHeading">
          <h2>Please Select the Check Box to Download the Excel File</h2>
        </div>
        <Form className="formSheet">
          <Row>
            <Form.Group as={Col} md="6">
              <FormLabel className="labelForm">Class</FormLabel>
              <FormSelect value={student.class_name} onChange={handleClassChange}>
                <option value="">Select Class</option>
                {classList.map((item) => (
                  <option key={item._id} value={item._id}>{item.class_name}</option>
                ))}
              </FormSelect>
            </Form.Group>
            <Form.Group as={Col} md="6">
              <FormLabel className="labelForm">Section</FormLabel>
              <FormSelect value={student.section_name} onChange={(e) => setStudent({ ...student, section_name: e.target.value })}>
                <option value="">Select Section</option>
                {sectionList.map((item) => (
                  <option key={item._id} value={item._id}>{item.section_name}</option>
                ))}
              </FormSelect>
            </Form.Group>
          </Row>
          <Row>
            <FormGroup as={Col} md="6">
              <FormLabel className="labelForm">Select Social Category</FormLabel>
              <FormSelect
                value={student?.category_name}
                onChange={handleChange}
                name="category_name"
              >
                <option value="">Select Category</option>
                {categoryList?.map((categoryItem) => (
                  <option key={categoryItem?._id} value={categoryItem?._id}>
                    {categoryItem?.category_name}
                  </option>
                ))}
              </FormSelect>
            </FormGroup>
            <Form.Group as={Col} md="6">
              <FormLabel className="labelForm">Select Religion</FormLabel>
              <FormSelect
                value={student?.religion_name}
                onChange={handleChange}
                name="religion_name"
              >
                <option value="">Select Religion</option>
                {religionList?.map((religionItem) => (
                  <option key={religionItem?._id} value={religionItem?._id}>
                    {religionItem?.religion_name}
                  </option>
                ))}
              </FormSelect>
            </Form.Group>
          </Row>
          <Row>
            <Form.Group as={Col} md="6">
              <FormLabel className="labelForm">Select Active/Inactive Status</FormLabel>
              <FormSelect name="class_name" >
                <option value="">Active</option>
                <option value="">Inactive</option>

              </FormSelect>
            </Form.Group>
            <Form.Group as={Col} md="6">
              <FormLabel className="labelForm">  Select Student Type</FormLabel>
              <FormSelect name="class_name" >
                <option value="">All</option>
                <option value="">Day Scholar</option>
                <option value="">PG</option>
                <option value="">BUS</option>
                <option value="">Hostle</option>

              </FormSelect>
            </Form.Group>
          </Row>
          <Row>
            <Form.Group as={Col} md="6">
              <FormLabel className="labelForm">Select OrderBy</FormLabel>
              <FormSelect name="class_name" >
                <option value="">First Name</option>
                <option value="">RollNO</option>
                <option value="">Section</option>

              </FormSelect>
            </Form.Group>
            <Form.Group as={Col} md="6">
              <FormLabel className="labelForm">Select Student Gender</FormLabel>
              <FormSelect name="class_name" >
                <option value="">All</option>
                <option value="">Boy</option>
                <option value="">Girl</option>

              </FormSelect>
            </Form.Group>
          </Row>
          <Row>
            <Form.Group as={Col} md="6">
              <FormLabel className="labelForm">Select TC Submitted</FormLabel>
              <FormSelect name="class_name" >
                <option value="">Both</option>
                <option value="">Yes</option>
                <option value="">No</option>

              </FormSelect>
            </Form.Group>
            <Form.Group as={Col} md="6">
              <FormLabel className="labelForm">Cast</FormLabel>
              <FormSelect name="class_name" >
                <option value="">Select</option>
              </FormSelect>
            </Form.Group>
          </Row>
          <Button className="mt-4" onClick={handleDownload} disabled={loading}>
            {loading ? "Downloading..." : "Download"}
          </Button>
          {responseMessage && <p className="mt-3">{responseMessage}</p>}
        </Form>

        <div className="p-2">
          <FormGroup>
            <FormCheck
              type="checkbox"
              label="Select All"
              id="selectAll"
              onChange={handleSelectAll}
              checked={isCheckAll}
            />
          </FormGroup>
        </div>
        <Table bordered className="TableWizard">
          <tbody>
            {list.reduce((rows, { id, name }, index) => {
              if (index % 4 === 0) rows.push([]);
              rows[rows.length - 1].push(
                <td key={id} width="25%">
                  <FormGroup>
                    <FormCheck
                      type="checkbox"
                      label={name}
                      id={id}
                      onChange={handleClick}
                      checked={isCheck.includes(id)}
                    />
                  </FormGroup>
                </td>
              );
              return rows;
            }, []).map((row, i) => (
              <tr key={i}>{row}</tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default StudentListWizard;