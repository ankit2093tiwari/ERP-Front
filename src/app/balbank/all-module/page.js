"use client";
import React from "react";
import Link from "next/link";
import SubCard from "@/app/component/SubCard";
import Image from "next/image";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { Container, Row, Col } from "react-bootstrap";

const Page = () => {
    const cardData = [
        {
            href: "/balbank/deposite-amount",
            icon: <Image src="/module/balbank/bankMaster.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Deposit Amount",
            description: "Deposit Amount",
        },
        {
            href: "/balbank/daily-transaction-entry",
            icon: <Image src="/module/attendance/AttendanceReport.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Daily Transaction Entry",
            description: "Check Basic Details Of balbank",
        },
        {
            href: "/balbank/report",
            icon: <Image src="/module/attendance/monthlyreport.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Report",
            description: "Check Basic Details Of balbank",
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
                        <h2>Bal Bank Module</h2>
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
