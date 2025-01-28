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
      href: "/fees/dashboard",
      icon: <RiSchoolLine className="studentIcon" />,
      title: "Dashboard",
      description: "Add Basic Details Of dashboard",
    },
    {
      href: "/fees/school-account",
      icon: <SiGoogleclassroom className="studentIcon" />,
      title: "School Accounts",
      description: "Add Basic Details Of school Account",
    },
    {
      href: "/fees/installmentMaster",
      icon: <LiaCitySolid className="studentIcon" />,
      title: "Installment Master",
      description: "Add Basic Details of Installment Master",
    },
    {
      href: "/fees/headMaster",
      icon: <SlCalender className="studentIcon" />,
      title: "Head Master",
      description: "Add Basic Details of Head Master",
    },
    {
      href: "/fees/fee-group",
      icon: <HiOutlineDocumentPlus className="studentIcon" />,
      title: "Fee Group",
      description: "Add Basic Details of Fee Group",
    },
    {
      href: "/fees/feeSetting",
      icon: <TbCategoryPlus className="studentIcon" />,
      title: "Fee Setting",
      description: "Add Basic Details of Fee Setting",
    },
    {
      href: "/fees/bank-master",
      icon: <PiTreeStructureLight className="studentIcon" />,
      title: "Bank Master",
      description: "Add Basic Details of Bank Master",
    },
    {
      href: "/fees/pettyHeadMaster",
      icon: <MdOutlineSubject className="studentIcon" />,
      title: "Petty Head",
      description: "Add Basic Details of Petty Head Master",
    },
    {
      href: "/fees/fee-structure",
      icon: <FaChromecast className="studentIcon" />,
      title: "Fee Structure",
      description: "Add Basic Details of Fee Structure",
    },
    {
      href: "/fees/fixed-amount",
      icon: <FaChromecast className="studentIcon" />,
      title: "Fixed Amount",
      description: "Add Basic Details of Fixed Amount",
    },
    {
      href: "/fees/fee-entry",
      icon: <FaChromecast className="studentIcon" />,
      title: "Fee Entry",
      description: "Add Basic Details of Fee Entry",
    },
    {
      href: "/fees/concession-entry",
      icon: <FaChromecast className="studentIcon" />,
      title: "Concession Entry",
      description: "Add Basic Details of Concession Entry",
    },
    {
      href: "/fees/cheque-bounce",
      icon: <FaChromecast className="studentIcon" />,
      title: "Cheque Bounce Entry",
      description: "Add Basic Details of Cheque Bounce",
    },
  ];

  return (
    <div>
      <div className="studentHeading">
        <h2>Fee Module</h2>
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
