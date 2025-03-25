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
      href: "/students/add-new-student",
      icon: <Image src="/module/student/students.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "New Student",
      description: "Add Basic Details Of New Student",
    },
    {
      href: "/students/update-student",
      icon: <Image src="/module/student/updateStudent.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Update Student",
      description: "Update Basic Details Of Student",
    },
    {
      href: "/students/assign-roll-no",
      icon: <Image src="/module/student/assignroll.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Assign RollNo",
      description: "Assign Roll No To Student",
    },
    {
      href: "/students/promote-student",
      icon: <Image src="/module/student/promoteStudent.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Promote Student",
      description: "Promote Student To Next Session",
    },
    {
      href: "/students/transfer-certificate",
      icon: <Image src="/module/student/transferCertificate.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Transfer Certificate",
      description: "Generate TC Of Student",
    },
    {
      href: "/students/id-card",
      icon: <Image src="/module/student/report.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "ID Card",
      description: "Generate Id Card Of Student",
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
            <h2>Student Module</h2>
            <small>Manage your basic details....</small>
          </div>
          <div className="cardContainer">
            {cardData.map((card, index) => (
              <div className="subCard1" key={index}>
                <Link href={card.href} className="SubCardLink">
                  <SubCard
                    icon={card.icon}
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
