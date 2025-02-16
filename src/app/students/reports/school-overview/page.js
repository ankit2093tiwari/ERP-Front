"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

const SchoolOverview = () => {
  const [selectedClasses, setSelectedClasses] = useState([]); // Selected classes from dropdown
  const [tableData, setTableData] = useState([]); // Data to display in the table
  const [isLoading, setIsLoading] = useState(false); // Loading state for search
  const [classOptions, setClassOptions] = useState([]); // Dynamically fetched class options
  const [isFetchingClasses, setIsFetchingClasses] = useState(false); // Loading state for fetching classes

  // Fetch classes dynamically when the component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      setIsFetchingClasses(true);
      try {
        // Fetch classes from the API
        const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-classes");
        const classes = response.data.data.map((cls) => ({
          value: cls._id, // Use class ID as the value
          label: cls.class_name, // Use class name as the label
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

  // Handle search button click
  const handleSearch = async () => {
    if (selectedClasses.length === 0) {
      alert("Please select at least one class.");
      return;
    }

    setIsLoading(true);

    try {
      // ✅ FIX: Ensure correct data format
      const requestData = {
        class_ids: selectedClasses.map((cls) => cls.value), // Array of class IDs
        
        // If API needs class names instead, use: class_name: selectedClasses.map((cls) => cls.label)
      };
      // console.log('class_ids', class_ids);

      console.log("Sending data:", requestData); // Debugging log

      // Call the backend API to fetch student data
      const response = await axios.post(
        "https://erp-backend-fy3n.onrender.com/api/students/searchByClass",
        requestData
      );
      // console.log('response', response);

      // Update table data with API response
      setTableData(response.data.students);
    } catch (error) {
      console.error("Error fetching data:", error.response?.data || error.message);
      alert("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>School Overview</h1>

      {/* Multi-select dropdown for classes */}
      <div style={{ marginBottom: "20px" }}>
        <label>Select Classes:</label>
        <Select
          isMulti
          options={classOptions}
          value={selectedClasses}
          onChange={(selected) => setSelectedClasses(selected)}
          placeholder={isFetchingClasses ? "Loading classes..." : "Select classes..."}
          isDisabled={isFetchingClasses} // Disable dropdown while fetching classes
        />
      </div>

      {/* Search button */}
      <button onClick={handleSearch} disabled={isLoading || isFetchingClasses}>
        {isLoading ? "Searching..." : "Search"}
      </button>

      {/* Table to display results */}
      {tableData.length > 0 && (
        <table style={{ marginTop: "20px", width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Class</th>
              <th>Section</th>
              <th>Boys</th>
              <th>Girls</th>
              <th>Total</th>
              <th>TC</th>
              <th>Dropout</th>
              <th>New</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((student, index) => (
              <tr key={index}>
                <td>{student.class_name?.class_name}</td>
                <td>{student.section_name?.section_name}</td>
                <td>{student.gender_name === "Male" ? 1 : 0}</td>
                <td>{student.gender_name === "Female" ? 1 : 0}</td>
                <td>{student.gender_name === "Male" || student.gender_name === "Female" ? 1 : 0}</td>
                <td>{student.transfer_status === "TC" ? 1 : 0}</td>
                <td>{student.transfer_status === "Dropout" ? 1 : 0}</td>
                <td>{new Date(student.date_of_admission) >= new Date(new Date().getFullYear(), 0, 1) ? 1 : 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SchoolOverview;