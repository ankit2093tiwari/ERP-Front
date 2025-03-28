"use client";
import React from "react";
import Link from "next/link";
import SubCard from "@/app/component/SubCard";
import Image from "next/image";
import { Container, Row, Col, } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const Page = () => {
  const cardData = [
    {
      href: "/library/groupMaster",
      icon: <Image src="/module/library/groupMaster.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Group Master",
      description: "Add Basic Details Of Group",
    },
    {
      href: "/library/publisher",
      icon: <Image src="/module/library/publish.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Publisher Master",
      description: "Add Basic Details Of Publisher",
    },
    {
      href: "/library/rackMaster",
      icon: <Image src="/module/library/rack.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Rack Master",
      description: "Add Basic Details of Rack",
    },
    {
      href: "/library/vendorMaster",
      icon: <Image src="/module/library/vendor.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Vendor Master",
      description: "Add Basic Details of Vendor",
    },
    {
      href: "/library/categoryMaster",
      icon: <Image src="/module/library/categoryMaster.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Category Master",
      description: "Add Basic Details of Category",
    },
    {
      href: "/library/fineMaster",
      icon: <Image src="/module/library/fine.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Fine Master",
      description: "Add Basic Details of Fine",
    },
    {
      href: "/library/newBookEntry",
      icon: <Image src="/module/library/newBook.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "New Book Entry",
      description: "Add Basic Details of New Book",
    },
    {
      href: "/library/newBookSuggestion",
      icon: <Image src="/module/library/suggestion.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "New Book Suggestion",
      description: "Add Details of Book Suggestion",
    },
    {
      href: "/library/issueBook",
      icon: <Image src="/module/library/issueBook.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Issue Book",
      description: "Add Basic Details of Cast",
    },
    {
      href: "/library/returnBook",
      icon: <Image src="/module/library/returnBook.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Return Book",
      description: "Add Basic Details of Return Book",
    },
    {
      href: "/library/publisher",
      icon: <Image src="/module/library/repairbook.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Book Under Repair",
      description: "Add Basic Details of Under Repair",
    },
    {
      href: "/master-entry/caste-master",
      icon: <Image src="/module/library/barCode.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Generate Bar Code",
      description: "Generate All Books Bar Codes",
    },
    {
      href: "/master-entry/caste-master",
      icon: <Image src="/module/library/report.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Reports",
      description: "Check all Reports",
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
            <h2>Library Module</h2>
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
