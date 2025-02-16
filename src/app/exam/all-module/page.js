"use client";
import React from "react";
import Link from "next/link";
import { RiSchoolLine } from "react-icons/ri";
import { SiGoogleclassroom } from "react-icons/si";
import { LiaCitySolid } from "react-icons/lia";
import { SlCalender } from "react-icons/sl";
import { HiOutlineDocumentPlus } from "react-icons/hi2";
import { TbCategoryPlus } from "react-icons/tb";
import { PiTreeStructureLight, PiExam  } from "react-icons/pi";
import { MdOutlineSubject } from "react-icons/md";
import { FaChromecast, FaListCheck  } from "react-icons/fa6";
import SubCard from "@/app/component/SubCard";
import Image from "next/image";

const Page = () => {

   const cardData = [
      {
        href: "/exam/examGradeMaster",
        icon: <Image src="/module/exam/examGrade.png" className="studentIcon" width={100} height={100} alt="" />,
        title: "Exam Grade Master",
        description: "Add Basic Details Of Grade",
      },
      {
        href: "/exam/examTypeMaster",
        icon: <Image src="/module/exam/examType.png" className="studentIcon" width={100} height={100} alt="" />,
        title: "Exam Type Master",
        description: "Add Basic Details Of Type",
      },
      {
        href: "/exam/examMaster",
        icon: <Image src="/module/exam/examMaster.png" className="studentIcon" width={100} height={100} alt="" />,
        title: "Exam Master",
        description: "Add Basic Details of Exams",
      },
      {
        href: "/exam/marksEntry",
        icon: <Image src="/module/exam/marks.png" className="studentIcon" width={100} height={100} alt="" />,
        title: "Marks Entry",
        description: "Add Basic Details of Marks",
      },
      {
        href: "/exam/examTimeTable",
        icon: <Image src="/module/exam/timeTable.png" className="studentIcon" width={100} height={100} alt=""/>,
        title: "Exam Time table",
        description: "Check Exam Time Table",
      },
      {
        href: "/exam/allotClassTeacher",
        icon: <Image src="/module/exam/classTeacher.png" className="studentIcon" width={100} height={100} alt="" />,
        title: "Allot Class Teacher",
        description: "Add Basic Details of Class Teacher",
      },
      {
        href: "/exam/subjectCategory",
        icon: <Image src="/module/exam/subject.png" className="studentIcon" width={100} height={100} alt="" />,
        title: "Subject Category",
        description: "Add Basic Details of Subject Category",
      },
      {
        href: "/exam/subjectSubCategory",
        icon: <Image src="/module/exam/subSubject.png" className="studentIcon" width={100} height={100} alt="" />,
        title: "Subject Sub-Category",
        description: "Add Basic Details of Subject Sub-Category",
      },
      {
        href: "/exam/remarksEntry",
        icon: <Image src="/module/exam/remarks.png" className="studentIcon" width={100} height={100} alt="" />,
        title: "Remarks Master",
        description: "Add Basic Details of Remarks",
      },
      {
        href: "/exam/all-module",
        icon: <Image src="/module/exam/report.png" className="studentIcon" width={100} height={100} alt="" />,
        title: "Reports",
        description: "Check all Reports",
      },
      
    ];

  return (
    <div>
    <div className="studentHeading">
      <h2>Exam Module</h2>
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
  )
}

export default Page;