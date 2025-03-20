"use client";
import React from "react";
import Link from "next/link";
import SubCard from "@/app/component/SubCard";
import Image from "next/image";
import { Container, Row, Col } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";


const Page = () => {
  const cardData = [
    {
      href: "/students/reports/student-list-wizard",
      icon: <Image src="/module/student/studentListwizard.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Student List Wizard",
      description: "Check Student List Wizard Records",
    },
    {
      href: "/students/reports/school-overview",
      icon: <Image src="/module/student/schoolOverview.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "School Overview",
      description: "Check School Overview Records",
    },
    {
      href: "/students/reports/certificate-wizard",
      icon: <Image src="/module/student/certificateWizard.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Certificate Wizard",
      description: "Check Certificate Wizard Records",
    },
  ];

  const breadcrumbItems = [{ label: "All Reports", link: "null" }]

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
            <h2>Student Reports</h2>
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
