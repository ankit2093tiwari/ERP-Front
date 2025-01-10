"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import feeImg from "@/app/Assets/fee.webp";
import studentImg from "@/app/Assets/contactImg.webp";
import busImg from "@/app/Assets/bus.webp";
import stocksImg from "@/app/Assets/stocks.webp";
import payrollImg from "@/app/Assets/payroll.webp";
import books from "@/app/Assets/books.webp";
import Exam from "@/app/Assets/exam.webp";
import Attendance from "@/app/Assets/attendance.webp";
import timetable from "@/app/Assets/timetable.webp";
import User from "@/app/Assets/user.webp";
import Website from "@/app/Assets/website.webp";
import HomeWork from "@/app/Assets/homeWork.webp";
import Card1 from "./component/Card1";

const Dashboard = () => {
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState([]);

  // Simulated API Data
  const fetchDashboardData = async () => {
    const mockData = [
      { name: "STUDENTS", icon: studentImg, count: 1500, label: "Count" },
      { name: "FEES", icon: feeImg, count: 750000, label: "Amount" },
      { name: "TRANSPORT", icon: busImg, count: 100, label: "Vehicles" },
      { name: "STOCKS", icon: stocksImg, count: 200, label: "Items" },
      { name: "PAYROLL", icon: payrollImg, count: 300, label: "Employees" },
      { name: "LIBRARY", icon: books, count: 5000, label: "Books" },
      { name: "EXAM", icon: Exam, count: 50, label: "Exams" },
      { name: "ATTENDANCE", icon: Attendance, count: 95, label: "Percent" },
      { name: "TIME TABLE", icon: timetable, count: 12, label: "Schedules" },
      { name: "USERS", icon: User, count: 500, label: "Active" },
      { name: "WEBSITE", icon: Website, count: 1, label: "Online" },
      { name: "HOME WORK", icon: HomeWork, count: 150, label: "Tasks" },
    ];
    setDashboardData(mockData);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Function to update data dynamically (for demonstration)
  // const updateData = () => {
  //   setDashboardData((prevData) =>
  //     prevData.map((item) => ({
  //       ...item,
  //       count: Math.floor(Math.random() * 1000) + 1, // Randomize counts
  //     }))
  //   );
  // };

  return (
    <div className="dashboardCardCard">
      <h1>
        Dashboard <span>overview, analytics & report</span>
      </h1>

      <div className="studentCardDetails">
        {dashboardData.map((card, index) => (
          <Card1
            key={index}
            user={card.icon}
            name={card.name}
            count={card.count}
            label={card.label}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
