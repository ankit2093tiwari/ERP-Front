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
      href: "/gallery/add-group",
      icon: <Image src="/module/gallery/group.png" className="studentIcon" width={100} height={100} alt=" " />,
      title: "Add Group",
      description: "Add Basic Details Of School",
    },
    {
      href: "/gallery/add-image",
      icon: <Image src="/module/gallery/addImage.png" className="studentIcon" width={100} height={100} alt=" " />,
      title: "Add Image",
      description: "Add Basic Details Of Class",
    },
    {
      href: "/gallery/image-record",
      icon: <Image src="/module/gallery/records.png" className="studentIcon" width={100} height={100} alt=" "  />,
      title: "Image Record",
      description: "Add Basic Details of City Master",
    },
  ];

  return (
    <div>
      <div className="studentHeading">
        <h2>Gallery Module</h2>
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
