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
            href: "/website-management/fit-india-images/add-group",
            icon: <Image src="/module/gallery/group.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Add Group",
            description: "Add New Image Group",
        },
        {
            href: "/website-management/fit-india-images/add-image",
            icon: <Image src="/module/gallery/addImage.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Add Image",
            description: "Add Images in Group",
        },
        {
            href: "/website-management/fit-india-images/image-records",
            icon: <Image src="/module/gallery/records.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Image Records",
            description: "Check All Reports of exisitng records",
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
                        <h2>Fit India Module</h2>
                        <small>Manage basic details....</small>
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
