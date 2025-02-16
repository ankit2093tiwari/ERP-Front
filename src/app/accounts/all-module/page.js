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

const Page = () => {
  const cardData = [
    {
      href: "/accounts/stock-purchase",
      icon: <Image src="/module/account/stockPurchase.png" className="studentIcon" width={100} height={100} alt=""  />,
      title: "Stock Purchase",
      description: "Add Basic Details Of School",
    },
    {
      href: "/accounts/hrd-salary",
      icon: <Image src="/module/account/hrdSalary.png" className="studentIcon" width={100} height={100} alt=""  />,
      title: "HRD Sallary",
      description: "Add Basic Details Of Class",
    },
    {
      href: "/accounts/expense-entry",
      icon: <Image src="/module/account/expenseEntry.png" className="studentIcon" width={100} height={100} alt=""   />,
      title: "Expense Entry",
      description: "Add Basic Details of City Master",
    },
    {
      href: "/accounts/bal-bank",
      icon: <Image src="/module/account/balBank.png" className="studentIcon" width={100} height={100} alt=""  />,
      title: "Bal Bank",
      description: "Add Basic Details of Year",
    },
    {
      href: "/accounts/all-income",
      icon: <Image src="/module/account/allIncome.png" className="studentIcon" width={100} height={100} alt=""  />,
      title: "All Income",
      description: "Upload Basic Details of Document",
    },
  ];

  return (
    <div>
      <div className="studentHeading">
        <h2>Account Module</h2>
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
