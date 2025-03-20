"use client";
import React from "react";
import Link from "next/link";
import { RiSchoolLine } from "react-icons/ri";
import { SiGoogleclassroom } from "react-icons/si";
import { LiaCitySolid } from "react-icons/lia";
import { SlCalender } from "react-icons/sl";
import { HiOutlineDocumentPlus } from "react-icons/hi2";
import { TbCategoryPlus } from "react-icons/tb";
import { PiTreeStructureLight } from "react-icons/pi";
import { MdOutlineSubject } from "react-icons/md";
import { FaChromecast } from "react-icons/fa6";
import SubCard from "@/app/component/SubCard";
import Image from "next/image";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { Container, Row , Col } from "react-bootstrap";

const Page = () => {
  const cardData = [
    {
      href: "/studentAttendence/TakeAttendence",
      icon: <Image src="/module/attendance/takeAttendance.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Take Attendence",
      description: "Add Basic Details Of Attendance",
    },
    {
      href: "/studentAttendence/AttendenceReport",
      icon: <Image src="/module/attendance/AttendanceReport.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Attendence Report",
      description: "Check Basic Details Of Attendance",
    },
    {
      href: "/studentAttendence/MonthlyReport",
      icon: <Image src="/module/attendance/monthlyreport.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Monthly Report",
      description: "Check Basic Details Of Attendance",
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
            <h2>Student Attendance Module</h2>
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
