"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Row, Col, Container, FormCheck } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { BASE_URL, getClasses } from "@/Services";
import { toast } from "react-toastify";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";



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
        const response = await getClasses();
        const classes = response.data.map((cls) => ({
          id: cls._id,
          name: cls.class_name,
        }));
        setClassOptions(classes);
      } catch (error) {
        console.error("Error fetching classes:", error);
        toast.error("Failed to fetch classes. Please try again.");
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
      toast.warn("Please select at least one class.");
      return;
    }

    setIsLoading(true);
    try {
      setTableData([]);
      setTotalBoys(0);
      setTotalGirls(0);

      const tempData = {};
      let totalBoysCount = 0;
      let totalGirlsCount = 0;

      for (const classId of selectedClasses) {
        try {
          const requestData = { class_name: classId };
          const response = await axios.post(`${BASE_URL}/api/students/searchByClass`, requestData);
          const students = response.data.students || [];

          const className = classOptions.find(c => c.id === classId)?.name || "Unknown Class";

          if (students.length === 0) {
            toast.info(`No students found in ${className}`);
            continue;
          }

          students.forEach((student) => {
            const cName = student.class_name?.class_name;
            const sName = student.section_name?.section_name;

            if (!tempData[cName]) tempData[cName] = {};
            if (!tempData[cName][sName]) {
              tempData[cName][sName] = {
                totalBoys: 0,
                totalGirls: 0,
                sectionTotal: 0,
                dropoutStudents: 0,
                newStudents: 0,
              };
            }

            if (student.gender_name === "Male") {
              tempData[cName][sName].totalBoys += 1;
              totalBoysCount++;
            }
            if (student.gender_name === "Female") {
              tempData[cName][sName].totalGirls += 1;
              totalGirlsCount++;
            }

            tempData[cName][sName].sectionTotal += 1;

            if (student.transfer_status === "Dropout") {
              tempData[cName][sName].dropoutStudents += 1;
            }

            if (new Date(student.date_of_admission) >= new Date(new Date().getFullYear(), 0, 1)) {
              tempData[cName][sName].newStudents += 1;
            }
          });

        } catch (err) {
          const className = classOptions.find(c => c.id === classId)?.name || "Unknown Class";
          console.error(`Error fetching data for ${className}:`, err);
          toast.error(`No Students found for ${className}`);
        }
      }

      setTableData(tempData);
      setTotalBoys(totalBoysCount);
      setTotalGirls(totalGirlsCount);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { name: "Class", selector: row => row.className, sortable: true },
    { name: "Section", selector: row => row.sectionName },
    { name: "Boys", selector: row => row.totalBoys },
    { name: "Girls", selector: row => row.totalGirls },
    { name: "Section Total", selector: row => row.sectionTotal },
    { name: "TC", selector: row => row.tc || 0 },
    { name: "Dropout", selector: row => row.dropoutStudents },
    { name: "New", selector: row => row.newStudents },
  ];

  const handlePrint = () => {
    const headers = [["#", "Class", "Section", "Boys", "Girls", "Total", "Dropout", "New"]];
    const rows = [];

    let index = 1;
    Object.entries(tableData).forEach(([className, sections]) => {
      Object.entries(sections).forEach(([sectionName, data]) => {
        rows.push([
          index++,
          className || "N/A",
          sectionName || "N/A",
          data.totalBoys || 0,
          data.totalGirls || 0,
          data.sectionTotal || 0,
          data.dropoutStudents || 0,
          data.newStudents || 0,
        ]);
      });
    });

    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Class", "Section", "Boys", "Girls", "Total", "Dropout", "New"];
    const rows = [];

    let index = 1;
    Object.entries(tableData).forEach(([className, sections]) => {
      Object.entries(sections).forEach(([sectionName, data]) => {
        rows.push(
          `${index++}\t${className || "N/A"}\t${sectionName || "N/A"}\t${data.totalBoys || 0}\t${data.totalGirls || 0}\t${data.sectionTotal || 0}\t${data.dropoutStudents || 0}\t${data.newStudents || 0}`
        );
      });
    });

    copyContent(headers, rows);
  };
  const tableRows = Object.entries(tableData).flatMap(([className, sections]) =>
    Object.entries(sections).map(([sectionName, stats]) => ({
      className,
      sectionName,
      ...stats,
    }))
  );

  const breadcrumbItems = [
    { label: "students", link: "/students/reports/all-reports" },
    { label: "school-overview", link: "null" },
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
          <div className="cover-sheet">
            <h2 className="studentHeading">School Overview</h2>

            <div style={{ marginBottom: "20px", padding: "20px" }}>
              <h4>Select Class</h4>
              <div className="mb-2">
                <em>{selectedClasses.length === 0 ? "Nothing selected" : `${selectedClasses.length} selected`}</em>
              </div>

              <div className="d-flex gap-2 mb-3">
                <Button className="btn-add" onClick={handleSelectAll} disabled={isFetchingClasses}>Select All</Button>
                <Button className="btn-add" onClick={handleDeselectAll} disabled={isFetchingClasses}>Deselect All</Button>
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
              className="ms-4"
              onClick={handleSearch}
              disabled={isLoading || isFetchingClasses || selectedClasses.length === 0}
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>

            {tableRows.length > 0 && (
              <div className="tableSheet">
                <Table
                  columns={columns}
                  data={tableRows}
                  handleCopy={handleCopy}
                  handlePrint={handlePrint}
                />
                <div className="mt-3 text-center">
                  <strong>Total Boys: {totalBoys} | Total Girls: {totalGirls}</strong>
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default SchoolOverview;
