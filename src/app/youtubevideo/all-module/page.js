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
            href: "/youtubevideo/add-group",
            icon: <Image src="/module/youtubevideo/addgroup.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Add Group",
            description: "Add New Group for Youtube Videos",
        },
        {
            href: "/youtubevideo/add-video",
            icon: <Image src="/module/youtubevideo/addvideo.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Add Video",
            description: "Add Videos to the group",
        },
        {
            href: "/youtubevideo/video-records",
            icon: <Image src="/module/youtubevideo/videorecords.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Videos Records",
            description: "Check records of existing youtube videos",
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
                        <h2>Youtube Videos</h2>
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
