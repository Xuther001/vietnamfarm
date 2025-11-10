import React, { useState } from "react";
import "./Marketplace.css";

export default function Marketplace({ funds, feedStock, feedPrice, setFunds, setFeedStock }) {
  const [amount, setAmount] = useState(0);

  const buyFeed = () => {
    const cost = amount * feedPrice;
    if (amount <= 0) return alert("Enter a valid amount.");
    if (cost > funds) return alert("Not enough funds!");
    setFunds((f) => f - cost);
    setFeedStock((s) => s + amount);
    setAmount(0);
  };

  return (
    <section className="marketplace">
      <h3>Marketplace</h3>
      <p>
        💰 Funds: ${funds.toLocaleString()} | 🧺 Feed: {feedStock} kg | Price: ${feedPrice}/kg
      </p>
      <div className="market-actions">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="kg"
        />
        <button onClick={buyFeed}>Buy Feed</button>
      </div>
    </section>
  );
}