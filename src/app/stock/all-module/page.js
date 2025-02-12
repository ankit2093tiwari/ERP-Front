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
      href: "/stock/store-master",
      icon: <Image src="/module/stock/storeMaster.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Store Master",
      description: "Add Basic Details Of Store",
    },
    {
      href: "/stock/item-category",
      icon: <Image src="/module/stock/Categoryitem.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Item Category",
      description: "Add Basic Details Of Category",
    },
    {
      href: "/stock/item-master",
      icon: <Image src="/module/stock/itemMaster.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Item Master",
      description: "Add Basic Details of Item Master",
    },
    {
      href: "/stock/vendor-master",
      icon: <Image src="/module/stock/vendor.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Vendor Master",
      description: "Add Basic Details of Vendor",
    },
    {
      href: "/stock/quotation-master",
      icon: <Image src="/module/stock/quotation.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Quotation Master",
      description: "Add Basic Details of Quotation",
    },
    {
      href: "/stock/purchase-order",
      icon: <Image src="/module/stock/purchaseOrder.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Purchase Order",
      description: "Add Basic Details of Purchase Order",
    },
    {
      href: "/stock/stock-available",
      icon: <Image src="/module/stock/ItemAvailable.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Stock Available",
      description: "Add Basic Details of Stock Available",
    },
    {
      href: "/stock/issue-item",
      icon: <Image src="/module/stock/issueItem.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Issue Item",
      description: "Add Basic Details of Issue Item",
    },
    {
      href: "/stock/return-item",
      icon: <Image src="/module/stock/returnItem.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Return Item",
      description: "Add Basic Details of Return Item",
    },
    {
        href: "/stock/write-off-entry",
        icon: <Image src="/module/stock/writeoff.png" className="studentIcon" width={100} height={100} alt="" />,
        title: "Write Off Entry",
        description: "Add Basic Details of Write Off Entry",
      },
      {
        href: "/stock/gate-pass",
        icon: <Image src="/module/stock/pass.png" className="studentIcon" width={100} height={100} alt="" />,
        title: "Gate Pass",
        description: "Add Basic Details of Gate Pass",
      },
      {
        href: "/stock/generate-gate-pass",
        icon: <Image src="/module/stock/generatepass.png" className="studentIcon" width={100} height={100} alt="" />,
        title: "Generate Gate Pass",
        description: "generate Slip  of Gate Pass",
      },
      {
        href: "/stock/generate-gate-pass",
        icon: <Image src="/module/stock/report.png" className="studentIcon" width={100} height={100} alt="" />,
        title: "Reports",
        description: "generate Slip  of Gate Pass",
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
