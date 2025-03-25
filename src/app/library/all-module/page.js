"use client";
import React from "react";
import Link from "next/link";
import { RiSchoolLine } from "react-icons/ri";
import { SiGoogleclassroom } from "react-icons/si";
import { LiaCitySolid } from "react-icons/lia";
import { SlCalender } from "react-icons/sl";
import { HiOutlineDocumentPlus } from "react-icons/hi2";
import { TbCategoryPlus } from "react-icons/tb";
import { PiTreeStructureLight } from "react-icons/pi";
import { MdOutlineSubject } from "react-icons/md";
import { FaChromecast } from "react-icons/fa6";
import SubCard from "@/app/component/SubCard";
import Image from "next/image";
import { Container, Row, Col, } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const Page = () => {
  const cardData = [
    {
      href: "/library/group",
      icon: <Image src="/module/library/groupMaster.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Group Master",
      description: "Add Basic Details Of Group",
    },
    {
      href: "/master-entry/class-master",
      icon: <Image src="/module/library/publish.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Publisher Master",
      description: "Add Basic Details Of Publisher",
    },
    {
      href: "/master-entry/city-master",
      icon: <Image src="/module/library/rack.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Rack Master",
      description: "Add Basic Details of Rack",
    },
    {
      href: "/master-entry/year-master",
      icon: <Image src="/module/library/vendor.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Vendor Master",
      description: "Add Basic Details of Vendor",
    },
    {
      href: "/master-entry/document-upload",
      icon: <Image src="/module/library/categoryMaster.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Category Master",
      description: "Add Basic Details of Category",
    },
    {
      href: "/master-entry/category-master",
      icon: <Image src="/module/library/fine.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Fine Master",
      description: "Add Basic Details of Fine",
    },
    {
      href: "/master-entry/religion-master",
      icon: <Image src="/module/library/newBook.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "New Book Entry",
      description: "Add Basic Details of New Book",
    },
    {
      href: "/master-entry/subject-master",
      icon: <Image src="/module/library/suggestion.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "New Book Suggestion",
      description: "Add Details of Book Suggestion",
    },
    {
      href: "/master-entry/caste-master",
      icon: <Image src="/module/library/issueBook.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Issue Book",
      description: "Add Basic Details of Cast",
    },
    {
      href: "/master-entry/caste-master",
      icon: <Image src="/module/library/returnBook.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Return Book",
      description: "Add Basic Details of Return Book",
    },
    {
      href: "/master-entry/caste-master",
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
