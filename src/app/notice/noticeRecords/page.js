"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import axios from "axios";

const NoticeRecord = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const columns = [
    { name: "#", selector: (row, index) => index + 1, sortable: false, width: "80px" },
    { name: "Image", selector: (row) => row.image || "N/A", sortable: false },
    { name: "Short Text", selector: (row) => row.short_text || "N/A", sortable: false },
    { name: "Date", selector: (row) => row.date || "N/A", sortable: false },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button>
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/notices");
      const notices = Array.isArray(response.data.data) ? response.data.data : [];
      setData(notices);
    } catch (error) {
      console.error("Error fetching notices:", error);
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    const notice = data.find((row) => row._id === id);
    const updatedImage = prompt("Enter new image URL:", notice?.image || "");
    const updatedShortText = prompt("Enter new short text:", notice?.short_text || "");
    const updatedDate = prompt("Enter new date (YYYY-MM-DD):", notice?.date || "");

    if (updatedImage && updatedShortText && updatedDate) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/notices/${id}`, {
          image: updatedImage,
          short_text: updatedShortText,
          date: updatedDate,
        });
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, image: updatedImage, short_text: updatedShortText, date: updatedDate } : row
          )
        );
        fetchData();
      } catch (error) {
        console.error("Error updating notice:", error);
        setError("Failed to update notice.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this notice?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/notices/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (error) {
        console.error("Error deleting notice:", error);
        setError("Failed to delete notice.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className={styles.formContainer}>
      <h2>Notice Records</h2>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && <Table columns={columns} data={data || []} />}
    </div>
  );
};

export default dynamic(() => Promise.resolve(NoticeRecord), { ssr: false });
