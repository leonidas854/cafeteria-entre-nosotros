import React from "react";

const MenuItem = ({ text, icon, onClick, isActive }) => {
  return (
    <li
      className={`menu-item ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      <span className="menu-icon">{icon}</span>
      {text}
    </li>
  );
};

export default MenuItem;