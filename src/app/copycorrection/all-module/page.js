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
            href: "/copycorrection/copy-check",
            icon: <Image src="/module/copycorrection/copyCheck1.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Copy Check",
            description: "Check ClassWise Copies",
        },
        {
            href: "/copycorrection/copy-check-report",
            icon: <Image src="/module/copycorrection/copyCheck.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Copy Check Report",
            description: "Check report of checked copies"
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
                        <h2>Copy Correction</h2>
                        <small>Check copies of students..</small>
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
