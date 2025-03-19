"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
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
import { Container, Row, Col, } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const Page = () => {
  const cardData = [
    {
      href: "/master-entry/school-info",
      icon: <Image src="/module/masterEntry/school.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "School Information",
      description: "Add Basic Details Of School",
    },
    {
      href: "/master-entry/class-master",
      icon: <Image src="/module/masterEntry/classmaster.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Class Master",
      description: "Add Basic Details Of Class",
    },
    {
      href: "/master-entry/city-master",
      icon: <Image src="/module/masterEntry/citymaster.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "City Master",
      description: "Add Basic Details of City Master",
    },
    {
      href: "/master-entry/year-master",
      icon: <Image src="/module/masterEntry/year.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Year Master",
      description: "Add Basic Details of Year",
    },
    {
      href: "/master-entry/document-upload",
      icon: <Image src="/module/masterEntry/upload.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Document Upload",
      description: "Upload Basic Details of Document",
    },
    {
      href: "/master-entry/category-master",
      icon: <Image src="/module/masterEntry/categoryMaster.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Category Master",
      description: "Add Basic Details of Category",
    },
    {
      href: "/master-entry/religion-master",
      icon: <Image src="/module/masterEntry/religion.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Religion Master",
      description: "Add Basic Details of Religion",
    },
    {
      href: "/master-entry/subject-master",
      icon: <Image src="/module/masterEntry/subject.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Subject Master",
      description: "Add Basic Details of Subject",
    },
    {
      href: "/master-entry/caste-master",
      icon: <Image src="/module/masterEntry/caste.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Caste Master",
      description: "Add Basic Details of Cast",
    },
  ];
  const breadcrumbItems = [{ label: "All Module", link: "null" }]

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
            <h2>Master Module</h2>
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
