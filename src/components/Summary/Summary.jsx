import React from "react";
import "./Summary.css";

export default function Summary({ totalLand, totalPigs, crops, funds }) {
  return (
    <div className="summary-panel">
      <h3>Farm Summary</h3>
      <p><strong>Total Land:</strong> {totalLand.toLocaleString()} m²</p>
      <p><strong>Total Pigs:</strong> {totalPigs}</p>
      <p>
        <strong>Corn:</strong> {crops.corn} kg | 
        <strong>Grass:</strong> {crops.grass} kg | 
        <strong>Soy:</strong> {crops.soy} kg
      </p>
      <p><strong>Funds:</strong> ${funds.toLocaleString()}</p>
    </div>
  );
}