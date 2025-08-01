"use client";
import React from "react";
import Link from "next/link";
import SubCard from "@/app/component/SubCard";
import Image from "next/image";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { Container,Row, Col } from "react-bootstrap";

const Page = () => {
  const cardData = [
    {
      href: "/hrd/departmentMaster",
      icon: <Image src="/module/hrd/designationMaster.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Department Master",
      description: "Add Basic Details Of Notice",
    },
    {
      href: "/hrd/designationMaster",
      icon: <Image src="/module/hrd/allowance.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Designation Master",
      description: "Check Basic Details Of Notice",
    },
    {
      href: "/hrd/allowanceMaster",
      icon: <Image src="/module/hrd/departmentMaster.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Allowance Master",
      description: "Check Basic Details Of Notice",
    },
    {
      href: "/hrd/loanMaster",
      icon: <Image src="/module/hrd/loan.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Loan Master",
      description: "Check Basic Details Of Notice",
    },
    {
      href: "/hrd/natureOfAppo",
      icon: <Image src="/module/hrd/appointment.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Nature of Appointment",
      description: "Check Basic Details Of Notice",
    },
   
    {
      href: "/hrd/gradeMaster",
      icon: <Image src="/module/hrd/grade.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Grade Master",
      description: "Check Basic Details Of Notice",
    },
    {
      href: "/hrd/categoryMaster",
      icon: <Image src="/module/hrd/categoryMaster.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Category Master",
      description: "Check Basic Details Of Notice",
    },
    {
      href: "/hrd/leaveMaster",
      icon: <Image src="/module/hrd/leave.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Leave Master",
      description: "Check Basic Details Of Notice",
    },
    {
      href: "/hrd/holidayMaster",
      icon: <Image src="/module/hrd/holiday.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Holiday Master",
      description: "Check Basic Details Of Notice",
    },
    {
      href: "/hrd/newEmployee",
      icon: <Image src="/module/hrd/newEmployee.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "New Employee",
      description: "Check Basic Details Of Notice",
    },
    {
      href: "/hrd/facultyAttendence/all-module",
      icon: <Image src="/module/hrd/attendance.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Faculty Attendance",
      description: "Check Basic Details Of Notice",
    },
    {
      href: "/hrd/notice-records",
      icon: <Image src="/module/hrd/issueloan.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Issue Loan",
      description: "Check Basic Details Of Notice",
    },
    {
      href: "/hrd/notice-records",
      icon: <Image src="/module/hrd/requestedleave.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Requested Leave",
      description: "Check Basic Details Of Notice",
    },
    {
      href: "/hrd/notice-records",
      icon: <Image src="/module/hrd/issueAdvance.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Issue Advance",
      description: "Check Basic Details Of Notice",
    },
    {
      href: "/hrd/notice-records",
      icon: <Image src="/module/hrd/assignvehicle.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Assign Transport",
      description: "Check Basic Details Of Notice",
    },
    {
      href: "/hrd/notice-records",
      icon: <Image src="/module/hrd/messFee.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Mess Fees Entry",
      description: "Check Basic Details Of Notice",
    },
    {
      href: "/hrd/notice-records",
      icon: <Image src="/module/hrd/salaryGeneration.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Salary Generation",
      description: "Check Basic Details Of Notice",
    },
    {
      href: "/hrd/notice-records",
      icon: <Image src="/module/hrd/paySlip.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Pay Slip",
      description: "Check Basic Details Of Notice",
    },
    {
      href: "/hrd/notice-records",
      icon: <Image src="/module/hrd/earningDeduction.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Earning and Deduction",
      description: "Check Basic Details Of Notice",
    },
    {
      href: "/hrd/notice-records",
      icon: <Image src="/module/hrd/increment.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Employee Increment",
      description: "Check Basic Details Of Notice",
    },
    {
      href: "/hrd/notice-records",
      icon: <Image src="/module/hrd/dayOFDeduction.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Days Of Pay Deduction",
      description: "Check Basic Details Of Notice",
    },
  ];

  const breadcrumbItems = [{ label: "All Module", link: null }]


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
          <div className="studentHeading">
            <h2>HRD Module</h2>
            <small>Manage your basic details....</small>
          </div>
          <div className="cardContainer">
            {cardData.map((card, index) => (
              <div className="subCard1" key={index}>
                <Link href={card.href} className="SubCardLink">
                  <SubCard
                    icon={<div className="iconBack"> {card.icon} </div>}
                    title={<h3>{card.title}</h3>}
                    description={<p>{card.description}</p>}
                  />
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
};

export default Page;
