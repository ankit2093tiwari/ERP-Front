"use client";
import React from "react";
import Link from "next/link";
import SubCard from "@/app/component/SubCard";
import Image from "next/image";
import { Container, Row, Col, Breadcrumb } from 'react-bootstrap';
import BreadcrumbComp from "@/app/component/Breadcrumb";

const Page = () => {
    const cardData = [
        {
            href: "/website-management/home-page-slider",
            icon: <Image src="/module/stock/storeMaster.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Home Page Slider",
            description: "Add slider for home page.",
        },
        {
            href: "/website-management/add-main-menu",
            icon: <Image src="/module/websitemanagement/mainmenu.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Add 1st Menu",
            description: "Add Meain Menu",
        },
        {
            href: "/website-management/add-sub-menu",
            icon: <Image src="/module/websitemanagement/submenu.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Add 2nd Sub Menu",
            description: "Add Sub menu",
        },
        {
            href: "/website-management/add-last-sub-menu",
            icon: <Image src="/module/websitemanagement/submenu2.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Add 3rd Sub Menu",
            description: "Add last Sub menu",
        },
        {
            href: "/website-management/add-pages",
            icon: <Image src="/module/websitemanagement/addpage.png" className="studentIcon" width={100} height={100} alt="" />,
            title: "Add Pages",
            description: "Add New pages",
        },
    ];
    const breadcrumbItems = [{ label: "All Module", link: "" }];


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
                        <h2>Website Management Module</h2>
                        <small>Manage website basic details....</small>
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
