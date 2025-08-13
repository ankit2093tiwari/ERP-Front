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
            href: "/Transport/reports/all-transportInfo",
            icon: <Image src="/module/student/report.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "All Transport Info",
            description: "Check All Details of Transport",
        },
        {
            href: "/Transport/reports/vehicleFeeInfo",
            icon: <Image src="/module/student/bulkStudent.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Vehicle Fee Info",
            description: "Check All Details of Transport",
        },
        {
            href: "/Transport/reports/transportUsers",
            icon: <Image src="/module/student/students.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Transport Users",
            description: "Check All Details of Transport",
        },
        {
            href: "/Transport/reports/all-fuelFilling",
            icon: <Image src="/module/student/idCard.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "All Fuel Filling",
            description: "Check All Details of Transport",
        },
        {
            href: "/Transport/reports/pickUpPointReport",
            icon: <Image src="/module/student/studentListwizard.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "PickUp Point Report",
            description: "Check All Details of Transport",
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
                        <h2>Transport Reports</h2>
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
