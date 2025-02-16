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
      href: "/notice/add-notice",
      icon: <Image src="/module/notice/notice.png" className="studentIcon" width={100} height={100} alt=""/>,
      title: "Add Notice",
      description: "Add Basic Details Of Notice",
    },
    {
      href: "/notice/notice-records",
      icon: <Image src="/module/notice/record.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Notice Records",
      description: "Check Basic Details Of Notice",
    },

  ];
  return (
    <div>
      <div className="studentHeading">
        <h2>Notice Module</h2>    
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
