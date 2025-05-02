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
            href: "/stock/reports/all-itemDetails",
            icon: <Image src="/module/student/studentListwizard.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "All Item Details",
            description: "Check All Details Of Item",
        },
        {
            href: "/stock/reports/vendorDatabase",
            icon: <Image src="/module/student/studentListwizard.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Vendor Details",
            description: "Check All Details Of Vendor",
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
                        <h2>Stock Reports</h2>
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
