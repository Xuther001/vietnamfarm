import React from "react";
import "./Managers.css";
import { ManagersList } from "./ManagersList";

export default function ManagerSelector({ selectedManager, onSelect }) {
  return (
    <div className="manager-section">
      <h3>Farm Managers</h3>
      <div className="manager-list">
        {ManagersList.map((m) => (
          <div
            key={m.key}
            className={`manager-card ${selectedManager.key === m.key ? "active" : ""}`}
            onClick={() => onSelect(m)}
          >
            <img src={m.img} alt={m.label} />
            <p>{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}