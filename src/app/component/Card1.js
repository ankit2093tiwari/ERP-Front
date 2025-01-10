"use client";
import React from "react";
import Image from "next/image";

const Card1 = (props) => {
  const imageSrc = props.user || "/assets/defaultImage.png";

  return (
    <div className="card">
      <div className="studentCard">
       
        <div className="studentData p-3">
        <div className="studentImg1">
          {imageSrc && (
            <Image
              src={imageSrc}
              alt={props?.name || "Image not found"}
              width={100}
              height={100}
              className="studImg"
            />
          )}
        </div>
        <div className="studentItemList">
        <div className="studentCardCount mb-3">
            <p>
              {props?.count} <span>{props?.label || ""} </span>
            </p>
          </div>
          <div className="studentCardTitle1">
            <h4>{props?.name}</h4>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card1;
