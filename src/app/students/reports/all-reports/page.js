"use client";
import React from "react";
import Link from "next/link";
import SubCard from "@/app/component/SubCard";
import Image from "next/image";

const Page = () => {
  const cardData = [
    {
      href: "/students/student/student-list-wizard",
      icon: <Image src="/module/student/studentListwizard.png" className="studentIcon" width={100} height={100} alt=""  />,
      title: "Student List Wizard",
      description: "Check Student List Wizard Records",
    },
    {
      href: "/students/student/school-overview",
      icon: <Image src="/module/student/schoolOverview.png" className="studentIcon" width={100} height={100} alt=""  />,
      title: "School Overview",
      description: "Check School Overview Records",
    },
    {
      href: "/students/student/certificate-wizard",
      icon: <Image src="/module/student/certificateWizard.png" className="studentIcon" width={100} height={100} alt=""  />,
      title: "Certificate Wizard",
      description: "Check Certificate Wizard Records",
    }, 
  ];

  return (
    <div>
      <div className="studentHeading">
        <h2>Student Reports</h2>
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
