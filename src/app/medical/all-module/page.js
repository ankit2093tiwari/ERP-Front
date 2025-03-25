"use client";
import React from "react";
import Link from "next/link";
import SubCard from "@/app/component/SubCard";
import Image from "next/image";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { Container, Row, Col, } from "react-bootstrap";

const Page = () => {
  const cardData = [
    {
      href: "/medical/add-check-up-type",
      icon: <Image src="/module/medical/addCheckup.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Add Check Up Type",
      description: "Add Basic Details Of School",
    },
    {
      href: "/medical/add-doctor-profile",
      icon: <Image src="/module/medical/doctor.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Add Doctor Profile",
      description: "Add Basic Details Of Class",
    },
    {
      href: "/medical/routine-check-up",
      icon: <Image src="/module/medical/routineCheckup.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Routine Check Up",
      description: "Add Basic Details of City Master",
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
        <div>
          <div className="studentHeading">
            <h2>Medical Module</h2>
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
        </div>
      </section>
    </>
  );
};

export default Page;
