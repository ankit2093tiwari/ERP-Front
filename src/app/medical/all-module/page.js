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
      href: "/medical/add-check-up-type",
      icon: <RiSchoolLine className="studentIcon" />,
      title: "Add Check Up Type",
      description: "Add Basic Details Of School",
    },
    {
      href: "/medical/add-doctor-profile",
      icon: <SiGoogleclassroom className="studentIcon" />,
      title: "Add Doctor Profile",
      description: "Add Basic Details Of Class",
    },
    {
      href: "/medical/routine-check-up",
      icon: <LiaCitySolid className="studentIcon" />,
      title: "Routine Check Up",
      description: "Add Basic Details of City Master",
    },
  ];

  return (
    <div>
      <div className="studentHeading">
        <h2>Medical Module</h2>
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
