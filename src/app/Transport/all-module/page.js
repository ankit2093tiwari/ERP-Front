"use client";
import React from "react";
import Link from "next/link";
import SubCard from "@/app/component/SubCard";
import Image from "next/image";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { Container, Row , Col } from "react-bootstrap";

const Page = () => {
  const cardData = [
    {
      href: "/Transport/vehicle-type-master",
      icon: <Image src="/module/transport/vehicleType.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Vehicle Type Master",
      description: "Add Basic Details Of Vehicle Type",
    },
    {
      href: "/Transport/vehicle-master",
      icon: <Image src="/module/transport/vehicleMaster.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Vehicle Master",
      description: "Add Basic Details Of Vehicle",
    },
    {
      href: "/Transport/route-master",
      icon: <Image src="/module/transport/route.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Route",
      description: "Add Basic Details Of Route",
    },
    {
      href: "/Transport/fuel-filling",
      icon: <Image src="/module/transport/fuelFilling.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Vehicle Fuel Filling",
      description: "Add Basic Details of FuelFilling",
    },
    {
      href: "/Transport/student-vehicle-relation",
      icon: <Image src="/module/transport/assignvehicle.png" className="studentIcon" width={100} height={100} alt="" />,
      title: "Assign To Student",
      description: "Assign Pickup Point to Students",
    },
  ];

  const breadcrumbItems = [{ label: "All Module", link: null }]

  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row>
            <Col>
              <BreadcrumbComp items={breadcrumbItems} />
            </Col>
          </Row>
        </Container>
      </div>
      <section>
        <Container>
          <div className="studentHeading">
            <h2>Transport Module</h2>
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
        </Container>
      </section>
    </>
  );
};

export default Page;
