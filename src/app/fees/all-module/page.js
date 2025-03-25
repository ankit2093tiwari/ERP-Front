"use client";
import React from "react";
import Link from "next/link";
import SubCard from "@/app/component/SubCard";
import Image from "next/image";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { Container, Row , Col } from "react-bootstrap";

const Page = () => {
  const cardData = [
    {
      href: "/fees/dashboard",
      icon: <Image src="/module/fees/dashboard.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Dashboard",
      description: "Add Basic Details Of dashboard",
    },
    {
      href: "/fees/school-account",
      icon: <Image src="/module/fees/schoolAccount.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "School Accounts",
      description: "Add Basic Details Of school Account",
    },
    {
      href: "/fees/installmentMaster",
      icon: <Image src="/module/fees/installmentMaster.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Installment Master",
      description: "Add Basic Details of Installment Master",
    },
    {
      href: "/fees/headMaster",
      icon: <Image src="/module/fees/headMaster.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Head Master",
      description: "Add Basic Details of Head Master",
    },
    {
      href: "/fees/feeGroup",
      icon: <Image src="/module/fees/feeGroup.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Fee Group",
      description: "Add Basic Details of Fee Group",
    },
    {
      href: "/fees/feeSetting",
      icon: <Image src="/module/fees/feeSetting.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Fee Setting",
      description: "Add Basic Details of Fee Setting",
    },
    {
      href: "/fees/bank-master",
      icon: <Image src="/module/fees/bankMaster.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Bank Master",
      description: "Add Basic Details of Bank Master",
    },
    {
      href: "/fees/pettyHeadMaster",
      icon: <Image src="/module/fees/petty.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Petty Head",
      description: "Add Basic Details of Petty Head Master",
    },
    {
      href: "/fees/fee-structure",
      icon: <Image src="/module/fees/feeStructure.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Fee Structure",
      description: "Add Basic Details of Fee Structure",
    },
    {
      href: "/fees/fixed-amount",
      icon: <Image src="/module/fees/fixedAmount.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Fixed Amount",
      description: "Add Basic Details of Fixed Amount",
    },
    {
      href: "/fees/fee-entry",
      icon: <Image src="/module/fees/depositEntry.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Fee Entry",
      description: "Add Basic Details of Fee Entry",
    },
    {
      href: "/fees/concession-entry",
      icon: <Image src="/module/fees/concessionEntry.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Concession Entry",
      description: "Add Basic Details of Concession Entry",
    },
    {
      href: "/fees/cheque-bounce",
      icon: <Image src="/module/fees/bounceCheque.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Cheque Bounce Entry",
      description: "Add Basic Details of Cheque Bounce",
    },
    {
      href: "/fees/cheque-bounce",
      icon: <Image src="/module/fees/transferYear.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Transfer to Next Year",
      description: "Add Basic Details of Cheque Bounce",
    },
    {
      href: "/fees/cheque-bounce",
      icon: <Image src="/module/fees/report.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Reports",
      description: "Add Basic Details of Cheque Bounce",
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
            <h2>Fee Module</h2>
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
