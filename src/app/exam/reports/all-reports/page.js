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
            href: "/exam/reports/subjectwise-students-report",
            icon: <Image src="/module/student/studentListwizard.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Mark SubjectWise",
            description: "Check repoorts of marks",
        },
        {
            href: "/exam/reports/student-wise-marksheet",
            icon: <Image src="/module/student/studentListwizard.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Stu. wise Marksheet",
            description: "Check reports of marks",
        },
        {
            href: "/exam/reports/section-wise-marksheet",
            icon: <Image src="/module/student/studentListwizard.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Sec. wise Marksheet",
            description: "Check reports of marks",
        },
        {
            href: "/exam/reports/download_students_list",
            icon: <Image src="/module/student/studentListwizard.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Download Stu. list",
            description: "Download all students list",
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
                        <h2>Exam Reports</h2>
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
