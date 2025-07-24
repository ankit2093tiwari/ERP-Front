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
            href: "/sendsms/student",
            icon: <Image src="/module/sendsms/sms.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Send SMS to Students",
            description: "send bulk sms to students",
        },
        {
            href: "/sendsms/staff",
            icon: <Image src="/module/sendsms/sms2.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Send SMS to Staff",
            description: "send bulk sms to the staff"
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
                        <h2>Send Bulk SMS</h2>
                        <small>Send SMS in bulk</small>
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
