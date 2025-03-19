"use client";
import React from "react";
import Link from "next/link";
import SubCard from "@/app/component/SubCard";
import Image from "next/image";
import { Container,Row, Col, Breadcrumb } from 'react-bootstrap';
import BreadcrumbComp from "@/app/component/Breadcrumb";

const Page = () => {
  const cardData = [
    {
      href: "/accounts/stock-purchase",
      icon: <Image src="/module/account/stockPurchase.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Stock Purchase",
      description: "Add Basic Details Of School",
    },
    {
      href: "/accounts/hrd-salary",
      icon: <Image src="/module/account/hrdSalary.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "HRD Salary",
      description: "Add Basic Details Of Class",
    },
    {
      href: "/accounts/expense-entry",
      icon: <Image src="/module/account/expenseEntry.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Expense Entry",
      description: "Add Basic Details of City Master",
    },
    {
      href: "/accounts/bal-bank",
      icon: <Image src="/module/account/balBank.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Bal Bank",
      description: "Add Basic Details of Year",
    },
    {
      href: "/accounts/all-income",
      icon: <Image src="/module/account/allIncome.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "All Income",
      description: "Upload Basic Details of Document",
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
            <h2>Account Module</h2>
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
