"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Row } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { Col, Container, FormLabel, Breadcrumb, FormSelect, Table, FormCheck } from "react-bootstrap";

const SchoolOverview = () => {
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [classOptions, setClassOptions] = useState([]);
  const [isFetchingClasses, setIsFetchingClasses] = useState(false);
  const [totalBoys, setTotalBoys] = useState(0);
  const [totalGirls, setTotalGirls] = useState(0);

  useEffect(() => {
    const fetchClasses = async () => {
      setIsFetchingClasses(true);
      try {
        const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-classes");
        const classes = response.data.data.map((cls) => ({
          id: cls._id,
          name: cls.class_name,
        }));
        setClassOptions(classes);
      } catch (error) {
        console.error("Error fetching classes:", error);
        alert("Failed to fetch classes. Please try again.");
      } finally {
        setIsFetchingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const handleClassToggle = (classId) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSelectAll = () => {
    setSelectedClasses(classOptions.map(cls => cls.id));
  };

  const handleDeselectAll = () => {
    setSelectedClasses([]);
  };

  const handleSearch = async () => {
    if (selectedClasses.length === 0) {
      alert("Please select at least one class.");
      return;
    }

    setIsLoading(true);
    try {
      // Clear previous data
      setTableData([]);
      setTotalBoys(0);
      setTotalGirls(0);

      // Fetch data for each selected class
      for (const classId of selectedClasses) {
        const requestData = { class_name: classId };
        const response = await axios.post(
          "https://erp-backend-fy3n.onrender.com/api/students/searchByClass",
          requestData
        );

        const students = response.data.students;
        const groupedData = {};
        let boysCount = 0;
        let girlsCount = 0;

        students.forEach((student) => {
          const className = student.class_name?.class_name;
          const sectionName = student.section_name?.section_name;

          if (!groupedData[className]) {
            groupedData[className] = {};
          }

          if (!groupedData[className][sectionName]) {
            groupedData[className][sectionName] = {
              totalBoys: 0,
              totalGirls: 0,
              sectionTotal: 0,
              dropoutStudents: 0,
              newStudents: 0,
            };
          }

          if (student.gender_name === "Male") {
            groupedData[className][sectionName].totalBoys += 1;
            boysCount += 1;
          }
          if (student.gender_name === "Female") {
            groupedData[className][sectionName].totalGirls += 1;
            girlsCount += 1;
          }
          groupedData[className][sectionName].sectionTotal += 1;
          if (student.transfer_status === "Dropout") groupedData[className][sectionName].dropoutStudents += 1;
          if (new Date(student.date_of_admission) >= new Date(new Date().getFullYear(), 0, 1)) {
            groupedData[className][sectionName].newStudents += 1;
          }
        });

        setTableData(prevTableData => ({
          ...prevTableData,
          ...groupedData,
        }));

        setTotalBoys(prevBoys => prevBoys + boysCount);
        setTotalGirls(prevGirls => prevGirls + girlsCount);
      }
    } catch (error) {
      console.error("Error fetching data:", error.response?.data || error.message);
      alert("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const breadcrumbItems = [{ label: "students", link: "/students/reports/all-reports" }, { label: "school-overview", link: "null" }]

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
          <div className="cover-sheet">
            <div className="studentHeading">
              <h2>School Overview</h2>
            </div>

            <div style={{ marginBottom: "20px", padding: "20px" }}>
              <h4>Select Class</h4>
              <div style={{ marginBottom: "10px" }}>
                <span style={{ fontStyle: "italic" }}>
                  {selectedClasses.length === 0 ? "Nothing selected" : `${selectedClasses.length} selected`}
                </span>
              </div>

              <div className="d-flex mb-3">
                <Button
                  // variant="link" 
                  className="btn-add"
                  onClick={handleSelectAll}
                  disabled={isFetchingClasses}
                >
                  Select All
                </Button>
                <Button
                  // variant="link" 
                  className="btn-add"
                  onClick={handleDeselectAll}
                  disabled={isFetchingClasses}
                >
                  Deselect All
                </Button>
              </div>

              <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ddd", padding: "10px" }}>
                {isFetchingClasses ? (
                  <div>Loading classes...</div>
                ) : (
                  classOptions.map((cls) => (
                    <div key={cls.id} className="d-flex align-items-center mb-2">
                      <FormCheck
                        type="checkbox"
                        id={`class-${cls.id}`}
                        checked={selectedClasses.includes(cls.id)}
                        onChange={() => handleClassToggle(cls.id)}
                        label={cls.name}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            <Button
              className="btn btn-warning ms-4"
              onClick={handleSearch}
              disabled={isLoading || isFetchingClasses || selectedClasses.length === 0}
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>

            <Table
              striped
              bordered
              hover
              responsive
              style={{
                marginTop: "20px",
                width: "100%",
                marginBottom: "40px",
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "center" }}>Class</th>
                  <th style={{ textAlign: "center" }}>Section</th>
                  <th style={{ textAlign: "center" }}>Boys</th>
                  <th style={{ textAlign: "center" }}>Girls</th>
                  <th style={{ textAlign: "center" }}>Section Total</th>
                  <th style={{ textAlign: "center" }}>TC</th>
                  <th style={{ textAlign: "center" }}>Dropout</th>
                  <th style={{ textAlign: "center" }}>New</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(tableData).length > 0 ? (
                  Object.entries(tableData).map(([className, sections], index) =>
                    Object.entries(sections).map(([sectionName, data], secIndex) => (
                      <tr key={`${index}-${secIndex}`}>
                        {secIndex === 0 && (
                          <td
                            rowSpan={Object.keys(sections).length}
                            style={{ textAlign: "center" }}
                          >
                            {className}
                          </td>
                        )}
                        <td style={{ textAlign: "center" }}>
                          {sectionName}
                        </td>
                        <td style={{ textAlign: "center" }}>{data.totalBoys}</td>
                        <td style={{ textAlign: "center" }}>{data.totalGirls}</td>
                        <td style={{ textAlign: "center" }}>{data.sectionTotal}</td>
                        <td style={{ textAlign: "center" }}>0</td>
                        <td style={{ textAlign: "center" }}>{data.dropoutStudents}</td>
                        <td style={{ textAlign: "center" }}>{data.newStudents}</td>
                      </tr>
                    ))
                  )
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center" }}>
                      No data to display. Please select classes and click Search.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2" style={{ textAlign: "center" }}>Total</td>
                  <td style={{ textAlign: "center" }}>{totalBoys}</td>
                  <td style={{ textAlign: "center" }}>{totalGirls}</td>
                  <td colSpan="5" style={{ textAlign: "center" }}></td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </Container>
      </section>
    </>
  );
};

export default SchoolOverview;