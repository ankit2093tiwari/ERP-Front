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

const Page = () => {
  const cardData = [
    {
      href: "/stock/store-master",
      icon: <RiSchoolLine className="studentIcon" />,
      title: "Store Master",
      description: "Add Basic Details Of School",
    },
    {
      href: "/stock/item-category",
      icon: <SiGoogleclassroom className="studentIcon" />,
      title: "Item Category",
      description: "Add Basic Details Of Class",
    },
    {
      href: "/stock/item-master",
      icon: <LiaCitySolid className="studentIcon" />,
      title: "Item Master",
      description: "Add Basic Details of City Master",
    },
    {
      href: "/stock/vendor-master",
      icon: <SlCalender className="studentIcon" />,
      title: "Vendor Master",
      description: "Add Basic Details of Year",
    },
    {
      href: "/stock/quotation-master",
      icon: <HiOutlineDocumentPlus className="studentIcon" />,
      title: "Quotation Master",
      description: "Upload Basic Details of Document",
    },
    {
      href: "/stock/purchase-order",
      icon: <TbCategoryPlus className="studentIcon" />,
      title: "Purchase Order",
      description: "Add Basic Details of Category",
    },
    {
      href: "/stock/stock-available",
      icon: <PiTreeStructureLight className="studentIcon" />,
      title: "Stock Available",
      description: "Add Basic Details of Religion",
    },
    {
      href: "/stock/issue-item",
      icon: <MdOutlineSubject className="studentIcon" />,
      title: "Issue Item",
      description: "Add Basic Details of Subject",
    },
    {
      href: "/stock/return-item",
      icon: <FaChromecast className="studentIcon" />,
      title: "Return Item",
      description: "Add Basic Details of Cast",
    },
    {
        href: "/stock/write-off-entry",
        icon: <FaChromecast className="studentIcon" />,
        title: "Write Off Entry",
        description: "Add Basic Details of Cast",
      },
      {
        href: "/stock/gate-pass",
        icon: <FaChromecast className="studentIcon" />,
        title: "Gate Pass",
        description: "Add Basic Details of Cast",
      },
      {
        href: "/stock/generate-gate-pass",
        icon: <FaChromecast className="studentIcon" />,
        title: "Generate Gate Pass",
        description: "Add Basic Details of Cast",
      },
  ];

  return (
    <div>
      <div className="studentHeading">
        <h2>Stock Module</h2>
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
    </div>
  );
};

export default Page;
