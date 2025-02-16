"use client";
import React from "react";
import Link from "next/link";
import { RiSchoolLine } from "react-icons/ri";
import { SiGoogleclassroom } from "react-icons/si";
import SubCard from "@/app/component/SubCard";
import Image from "next/image";
const Page = () => {
  const cardData = [
    {
        href: "/advertisingManagement/create-type",
        icon: <Image src="/module/advertisement/createType.png" className="studentIcon" width={100} height={100} alt="" />,
        title: "Create Type",
        description: "Add Basic Details Of Advertising Type",
      },
    {
      href: "/advertisingManagement/enter-data",
      icon: <Image src="/module/advertisement/enterData.png" className="studentIcon" width={100} height={100} alt="" />,
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
