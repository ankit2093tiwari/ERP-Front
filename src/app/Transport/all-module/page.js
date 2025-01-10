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
      href: "/Transport/vehicle-type-master",
      icon: <RiSchoolLine className="studentIcon" />,
      title: "Vehicle Type Master",
      description: "Add Basic Details Of Vehicle Type",
    },
    {
      href: "/Transport/vehicle-master",
      icon: <SiGoogleclassroom className="studentIcon" />,
      title: "Vehicle Master",
      description: "Add Basic Details Of Vehicle",
    },
    {
      href: "/Transport/route-master",
      icon: <LiaCitySolid className="studentIcon" />,
      title: "Route",
      description: "Add Basic Details Of Route",
    },
    {
      href: "/Transport/fuel-filling",
      icon: <SlCalender className="studentIcon" />,
      title: "Vehicle Fuel Filling",
      description: "Add Basic Details of FuelFilling",
    },
    {
      href: "/Transport/student-vehicle-relation",
      icon: <HiOutlineDocumentPlus className="studentIcon" />,
      title: "Assign To Student",
      description: "Assign Pickup Point to Students",
    },
  ];

  return (
    <div>
      <div className="studentHeading">
        <h2>Transport Module</h2>
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
