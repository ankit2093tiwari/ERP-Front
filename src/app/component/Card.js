"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const Card = ({
  name,
  user,
  link,
  action,
  action2,
  action3,
  icon,
  icon2,
  icon3,
  actionLink,
  action2Link,
  action3Link,
}) => {
  const imageSrc = user || "/assets/defaultImage.png"; // Fallback for missing image

  return (
    <div className="card">
      <div className="studentCard">
        {/* Title Section */}
        <div className="studentCardTitle">
          <h4>{name}</h4>
        </div>

        {/* Content Section */}
        <div className="studentData">
          {/* Image Section */}
          <div className="studentImg">
            <Link href={link}>
              <Image
                src={imageSrc}
                alt={name || "Image not found"}
                width={120}
                height={120}
                className="studImg"
              />
            </Link>
          </div>

          {/* Actions Section */}
          <div className="studentItemList">
            <div className="addNewStudent">
              {icon && <span className="actionIcon">{icon}</span>}
              <Link href={actionLink || "#"}>
                <h5>{action}</h5>
              </Link>
            </div>
            <div className="addNewStudent">
              {icon2 && <span className="actionIcon">{icon2}</span>}
              <Link href={action2Link || "#"}>
                <h5>{action2}</h5>
              </Link>
            </div>
            <div className="addNewStudent">
              {icon3 && <span className="actionIcon">{icon3}</span>}
              <Link href={action3Link || "#"}>
                <h5>{action3}</h5>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
