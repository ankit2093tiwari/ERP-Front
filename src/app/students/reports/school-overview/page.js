"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { Button, Row } from "react-bootstrap";

const SchoolOverview = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [classOptions, setClassOptions] = useState([]);
  const [isFetchingClasses, setIsFetchingClasses] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      setIsFetchingClasses(true);
      try {
        const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-classes");
        const classes = response.data.data.map((cls) => ({
          value: cls._id,
          label: cls.class_name,
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

  const handleSearch = async () => {
    if (!selectedClass) {
      alert("Please select a class.");
      return;
    }
    setIsLoading(true);
    try {
      const requestData = { class_name: selectedClass.value };
      const response = await axios.post(
        "https://erp-backend-fy3n.onrender.com/api/students/searchByClass",
        requestData
      );
  
      const students = response.data.students;
      const groupedData = { ...tableData }; // Start with the existing data
  
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
  
        if (student.gender_name === "Male") groupedData[className][sectionName].totalBoys += 1;
        if (student.gender_name === "Female") groupedData[className][sectionName].totalGirls += 1;
        groupedData[className][sectionName].sectionTotal += 1;
        if (student.transfer_status === "Dropout") groupedData[className][sectionName].dropoutStudents += 1;
        if (new Date(student.date_of_admission) >= new Date(new Date().getFullYear(), 0, 1)) {
          groupedData[className][sectionName].newStudents += 1;
        }
      });
  
      setTableData(groupedData); // Update the state with the merged data
    } catch (error) {
      console.error("Error fetching data:", error.response?.data || error.message);
      alert("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleSearch = async () => {
  //   if (!selectedClass) {
  //     alert("Please select a class.");
  //     return;
  //   }
  //   setIsLoading(true);
  //   try {
  //     const requestData = { class_name: selectedClass.value };
  //     const response = await axios.post(
  //       "https://erp-backend-fy3n.onrender.com/api/students/searchByClass",
  //       requestData
  //     );

  //     const students = response.data.students;
  //     const groupedData = {};

  //     students.forEach((student) => {
  //       const className = student.class_name?.class_name;
  //       const sectionName = student.section_name?.section_name;

  //       if (!groupedData[className]) {
  //         groupedData[className] = {};
  //       }

  //       if (!groupedData[className][sectionName]) {
  //         groupedData[className][sectionName] = {
  //           totalBoys: 0,
  //           totalGirls: 0,
  //           sectionTotal: 0,
  //           dropoutStudents: 0,
  //           newStudents: 0,
  //         };
  //       }

  //       if (student.gender_name === "Male") groupedData[className][sectionName].totalBoys += 1;
  //       if (student.gender_name === "Female") groupedData[className][sectionName].totalGirls += 1;
  //       groupedData[className][sectionName].sectionTotal += 1;
  //       if (student.transfer_status === "Dropout") groupedData[className][sectionName].dropoutStudents += 1;
  //       if (new Date(student.date_of_admission) >= new Date(new Date().getFullYear(), 0, 1)) {
  //         groupedData[className][sectionName].newStudents += 1;
  //       }
  //     });

  //     setTableData(groupedData);
  //   } catch (error) {
  //     console.error("Error fetching data:", error.response?.data || error.message);
  //     alert("Failed to fetch data. Please try again.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <div className="cover-sheet">
      <div className="studentHeading">
        <h2>School Overview</h2>
      </div>
      <div style={{ marginBottom: "20px", padding: "20px" }}>
        <label>Select Class:</label>
        <Select
          options={classOptions}
          value={selectedClass}
          onChange={(selected) => setSelectedClass(selected)}
          placeholder={isFetchingClasses ? "Loading classes..." : "Select a class..."}
          isDisabled={isFetchingClasses}
        />
      </div>


      <Button
        className="btn btn-warning ms-4"
        onClick={handleSearch}
        disabled={isLoading || isFetchingClasses}
      >
        {isLoading ? "Searching..." : "Search"}
      </Button>

      <table
        style={{
          marginTop: "20px",
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid black",
          marginBottom: "40px",
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>Class</th>
            <th style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>Sections</th>
            <th style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>Total Boys</th>
            <th style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>Total Girls</th>
            <th style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>Total Students</th>
            <th style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>Dropout</th>
            <th style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>New Students</th>
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
                      style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}
                    >
                      {className}
                    </td>
                  )}
                  <td style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>
                    {sectionName}
                  </td>
                  <td style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>{data.totalBoys}</td>
                  <td style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>{data.totalGirls}</td>
                  <td style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>{data.sectionTotal}</td>
                  <td style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>{data.dropoutStudents}</td>
                  <td style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>{data.newStudents}</td>
                </tr>
              ))
            )
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "8px", border: "1px solid black" }}>
                No data to display. Please search for a class.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SchoolOverview;
