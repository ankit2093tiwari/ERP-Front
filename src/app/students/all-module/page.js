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
      href: "/students/add-new-student",
      icon: <RiSchoolLine className="studentIcon" />,
      title: "New Student",
      description: "Add Basic Details Of New Student",
    },
    {
      href: "/students/update-student",
      icon: <SiGoogleclassroom className="studentIcon" />,
      title: "Update Student",
      description: "Update Basic Details Of Student",
    },
    {
      href: "/students/assign-roll-no",
      icon: <LiaCitySolid className="studentIcon" />,
      title: "Assign RollNo",
      description: "Assign Roll No To Student",
    },
    {
      href: "/students/promote-student",
      icon: <SlCalender className="studentIcon" />,
      title: "Promote Student",
      description: "Promote Student To Next Session",
    },
    {
      href: "/students/transfer-certificate",
      icon: <HiOutlineDocumentPlus className="studentIcon" />,
      title: "Transfer Certificate",
      description: "Generate TC Of Student",
    },
    {
      href: "/students/id-card",
      icon: <TbCategoryPlus className="studentIcon" />,
      title: "ID Card",
      description: "Generate Id Card Of Student",
    },
    // {
    //   href: "/students/religion-master",
    //   icon: <PiTreeStructureLight className="studentIcon" />,
    //   title: "Religion Master",
    //   description: "Add Basic Details of Religion",
    // },
    // {
    //   href: "/students/subject-master",
    //   icon: <MdOutlineSubject className="studentIcon" />,
    //   title: "Subject Master",
    //   description: "Add Basic Details of Subject",
    // },
    // {
    //   href: "/students/caste-master",
    //   icon: <FaChromecast className="studentIcon" />,
    //   title: "Caste Master",
    //   description: "Add Basic Details of Cast",
    // },
  ];

  return (
    <div>
      <div className="studentHeading">
        <h2>Student Module</h2>
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
