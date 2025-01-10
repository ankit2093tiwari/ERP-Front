import React from "react";

const SubCard = ({ icon, title, description }) => {
  return (
    <div className="subCardProps">
      <div className="SubCard">
        {icon}
        {title}
        {description}
      </div>
    </div>
  );
};

export default SubCard;
