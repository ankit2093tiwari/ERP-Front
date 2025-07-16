"use client";
import React from "react";
import Link from "next/link"; // Import Link for navigation
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
import Card from "../component/Card";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { Container, Row, Col } from "react-bootstrap";

const breadcrumbItems = [{ label: "Home", link: "null" }]

const Dashboard = () => {
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
          <div className="dashboardCardCard">
            <h1>
              Dashboard <span>overview, analytics & report</span>
            </h1>

            <div className="studentCardDetails">
              <Card
                name="STUDENTS"
                user={studentImg}
                link="/students/all-module"
                action="Add New Student"
                action2="Transfer Certificate"
                action3="Students Details"
                actionLink="/students/add-new-student"
                action2Link="/students/transfer-certificate"
                action3Link="/students/reports/student-list-wizard"
              />
              <Card
                name="FEES"
                user={feeImg}
                link="/fees/all-module"
                action="Fee Entry"
                action2="Student Fee Details"
                action3="Daily Fee Collection"
                actionLink="/fees/fee-entry"
                action2Link="/fees/fee-entry"
                action3Link="/fees/dashboard"
              />
              <Card
                name="TRANSPORT"
                user={busImg}
                link="/transport/all-module"
                action="Add New Vehicle"
                action2="Student Vehicle Relation"
                action3="All Transport Info"
                actionLink="/Transport/vehicle-master"
                action2Link="/Transport/student-vehicle-relation"
                action3Link="/Transport/reports/all-transportInfo"
              />
              <Card
                name="STOCKS"
                user={stocksImg}
                link="/stock/all-module"
                action="Add New Item"
                action2="Stocks Details"
                action3="Issue Items"
                actionLink="/stock/item-master"
                action2Link="/stock/stock-available"
                action3Link="/stock/issue-item"
              />
              <Card
                name="HRD"
                user={payrollImg}
                link="/hrd/allModule"
                action="Add New Employee"
                action2="Salary Generation"
                action3="Pay Slip"
                actionLink="/hrd/newEmployee"
                action2Link="/hrd/salary-generation"
                action3Link="/hrd/pay-slip"
              />
              <Card
                name="LIBRARY"
                user={books}
                link="/library/all-module"
                action="Add New Book"
                action2="Issue Book"
                action3="return Book"
                actionLink="/library/newBookEntry"
                action2Link="/library/issueBook"
                action3Link="/library/returnBook"
              />
              <Card
                name="EXAM"
                user={Exam}
                link="/exam/all-module"
                action="Create Exam"
                action2="Marks Entry"
                action3="Student Wise Marksheet"
                actionLink="/exam/examMaster"
                action2Link="/exam/marksEntry"
                action3Link="/exam/reports/student-wise-marksheet"
              />
              <Card
                name="STUDENTS ATTENDANCE"
                user={Attendance}
                link="/attendance/all-module"
                action="Take Attendance"
                action2="Take Report"
                action3="Monthly Report"
                actionLink="/studentAttendence/TakeAttendence"
                action2Link="/studentAttendence/AttendenceReport"
                action3Link="/studentAttendence/MonthlyReport"
              />
              <Card
                name="TIME TABLE"
                user={timetable}
                link="/timetable/all-module"
                action="Regular Time Table"
                action2="Online Time Table"
                action3="Adjust Time Table"
                actionLink="/timetable/regular"
                action2Link="/timetable/online"
                action3Link="/timetable/adjust"
              />
              <Card
                name="USERS"
                user={User}
                link="/users/all-module"
                action="Add New User"
                action2="Existing Users"
                action3="All User List"
                actionLink="/userManagement/addUser"
                action2Link="/userManagement/exisitingUser"
                action3Link="/userManagement/exisitingUser"
              />
              <Card
                name="WEBSITE"
                user={Website}
                link="/website/all-module"
                action="Add New Page"
                action2="Contact Details"
                action3="Add Notice"
                actionLink="/website/add-page"
                action2Link="/website/contact"
                action3Link="/website/add-notice"
              />
              <Card
                name="HOME WORK"
                user={HomeWork}
                link="/homework/all-module"
                action="Add New Home Work"
                action2="Subject Wise Home Work"
                action3="All Home Work"
                actionLink="/homework/add"
                action2Link="/homework/subject-wise"
                action3Link="/homework/all"
              />
            </div>
          </div>
        </Container>
      </section>

    </>
  );
};

export default Dashboard;
