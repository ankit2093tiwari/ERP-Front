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
      href: "/library/group",
      icon: <RiSchoolLine className="studentIcon" />,
      title: "Group Master",
      description: "Add Basic Details Of Group",
    },
    {
      href: "/master-entry/class-master",
      icon: <SiGoogleclassroom className="studentIcon" />,
      title: "Publisher Master",
      description: "Add Basic Details Of Publisher",
    },
    {
      href: "/master-entry/city-master",
      icon: <LiaCitySolid className="studentIcon" />,
      title: "Rack Master",
      description: "Add Basic Details of Rack",
    },
    {
      href: "/master-entry/year-master",
      icon: <SlCalender className="studentIcon" />,
      title: "Vendor Master",
      description: "Add Basic Details of Vendor",
    },
    {
      href: "/master-entry/document-upload",
      icon: <HiOutlineDocumentPlus className="studentIcon" />,
      title: "Category Master",
      description: "Add Basic Details of Category",
    },
    {
      href: "/master-entry/category-master",
      icon: <TbCategoryPlus className="studentIcon" />,
      title: "Fine Master",
      description: "Add Basic Details of Fine",
    },
    {
      href: "/master-entry/religion-master",
      icon: <PiTreeStructureLight className="studentIcon" />,
      title: "New Book Entry",
      description: "Add Basic Details of New Book",
    },
    {
      href: "/master-entry/subject-master",
      icon: <MdOutlineSubject className="studentIcon" />,
      title: "New Book Suggestion",
      description: "Add Details of Book Suggestion",
    },
    {
      href: "/master-entry/caste-master",
      icon: <FaChromecast className="studentIcon" />,
      title: "Issue Book",
      description: "Add Basic Details of Cast",
    },
    {
      href: "/master-entry/caste-master",
      icon: <FaChromecast className="studentIcon" />,
      title: "Return Book",
      description: "Add Basic Details of Return Book",
    },
    {
      href: "/master-entry/caste-master",
      icon: <FaChromecast className="studentIcon" />,
      title: "Book Under Repair",
      description: "Add Basic Details of Under Repair",
    },
    {
      href: "/master-entry/caste-master",
      icon: <FaChromecast className="studentIcon" />,
      title: "Generate Bar Code",
      description: "Generate All Books Bar Codes",
    },
    {
      href: "/master-entry/caste-master",
      icon: <FaChromecast className="studentIcon" />,
      title: "Reports",
      description: "Check all Reports",
    },
  ];
  return (
    <div>
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
    </div>
  );
};

export default Page;
