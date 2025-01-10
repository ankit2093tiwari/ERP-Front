"use client";
import React from "react";
import Link from "next/link";
import { RiSchoolLine } from "react-icons/ri";
import { SiGoogleclassroom } from "react-icons/si";
import SubCard from "@/app/component/SubCard";
const Page = () => {
  const cardData = [
    {
        href: "/advertisingManagement/create-type",
        icon: <SiGoogleclassroom className="studentIcon" />,
        title: "create Type",
        description: "Add Basic Details Of Advertising Type",
      },
    {
      href: "/advertisingManagement/enter-data",
      icon: <RiSchoolLine className="studentIcon" />,
      title: "Enter Data",
      description: "Add Basic Details Of Advertising",
    },
    

  ];
  return (
    <div>
      <div className="studentHeading">
        <h2>Advertising Management</h2>    
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
