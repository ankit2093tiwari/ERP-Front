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
            href: "/timetable/regular-timetable",
            icon: <Image src="/module/timetable/regular.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Regular Time Table",
            description: "Add basic detail of Regular TimeTable",
        },
        {
            href: "/timetable/adjust-timetable",
            icon: <Image src="/module/timetable/adjust.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Adjust Time Table",
            description: "Adjust time table..",
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
                        <h2>Time Table</h2>
                        <small>Manage classes timetable.</small>
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
