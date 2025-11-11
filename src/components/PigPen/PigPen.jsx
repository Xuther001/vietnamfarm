import React, { useEffect, useState } from "react";
import "./PigPen.css";

export default function PigPen({ totalPigs = 0 }) {
  const [pigs, setPigs] = useState([]);

  useEffect(() => {
    // Create pigs with random positions
    const newPigs = Array.from({ length: totalPigs }).map(() => ({
      id: Math.random().toString(36).slice(2),
      top: Math.random() * 80,
      left: Math.random() * 80,
      speed: 4 + Math.random() * 4, // seconds per movement
      delay: Math.random() * 3,
    }));
    setPigs(newPigs);
  }, [totalPigs]);

  return (
    <div className="pig-pen">
      {pigs.map((pig) => (
        <img
          key={pig.id}
          src="/gifs/pig1.gif"
          alt="Pig"
          className="pig-gif"
          style={{
            top: `${pig.top}%`,
            left: `${pig.left}%`,
            animationDuration: `${pig.speed}s`,
            animationDelay: `${pig.delay}s`,
          }}
        />
      ))}
    </div>
  );
}