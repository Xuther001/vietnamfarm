import React, { useState } from "react";
import "./TerrainGridMapper.css";
import Summary from "../Summary/Summary";
import PigPen from "../PigPen/PigPen";
import MessageLog from "../MessageLog/MessageLog";

import {
  TYPES,
  MANAGERS,
  CELL_SIZE,
  DAYS_PER_WEEK,
} from "../../utils/constants";

import {
  generateGrid,
  endTurnLogic,
  exportCSVLogic,
  resetFarmLogic,
} from "../../utils/farmLogic";

import ManagerSelector from "../Managers/ManagerSelector";
import Marketplace from "../Marketplace/Marketplace";

export default function TerrainGridMapper() {
  const [totalArea, setTotalArea] = useState(200);
  const [cornArea, setCornArea] = useState(0);
  const [grassArea, setGrassArea] = useState(0);
  const [soyArea, setSoyArea] = useState(0);
  const [cellsState, setCellsState] = useState([]);
  const [warning, setWarning] = useState("");
  const [selectedManager, setSelectedManager] = useState(MANAGERS[0]);

  const [week, setWeek] = useState(1);
  const [day, setDay] = useState(7);
  const [pigWeight, setPigWeight] = useState(20);
  const [cropGrowth, setCropGrowth] = useState(0);

  const [funds, setFunds] = useState(10000);
  const [feedStock, setFeedStock] = useState(0);
  const [feedPrice, setFeedPrice] = useState(5);

  const [pigPrice, setPigPrice] = useState(150);
  const [pigBatches, setPigBatches] = useState([]);
  const [purchaseCount, setPurchaseCount] = useState(0);

  const [messages, setMessages] = useState([]);
  const logMessage = (text) => setMessages((prev) => [...prev, text]);

  const totalPigs = pigBatches.reduce((sum, b) => sum + b.count, 0);
  const totalCells = totalArea;
  const cols = Math.ceil(Math.sqrt(totalCells));
  const unusedLand = totalCells - (cornArea + grassArea + soyArea);

  const handleGenerate = () => {
    const result = generateGrid(totalArea, cornArea, grassArea, soyArea, 0);
    if (result.warning) logMessage(result.warning);
    setCellsState(result.cells);
  };

  const handleBuyPigs = () => {
    const existingBatchIndex = pigBatches.findIndex(
      (b) => b.age === 0
    );

    if (purchaseCount === 0 && existingBatchIndex !== -1) {
      const previousBatch = pigBatches[existingBatchIndex];
      setFunds((prev) => prev + previousBatch.count * previousBatch.price);
      const updated = [...pigBatches];
      updated.splice(existingBatchIndex, 1);
      setPigBatches(updated);
      logMessage(`Refunded ${previousBatch.count} pigs for this turn.`);
      setPurchaseCount(0);
      return;
    }

    if (purchaseCount <= 0) {
      return logMessage("Enter how many pigs to buy.");
    }

    const totalCost = purchaseCount * pigPrice;

    if (existingBatchIndex !== -1) {
      const previousBatch = pigBatches[existingBatchIndex];
      const newFunds = funds + previousBatch.count * previousBatch.price;
      if (newFunds < totalCost) {
        return logMessage("Not enough funds to buy pigs.");
      }
      const updated = [...pigBatches];
      updated[existingBatchIndex] = {
        id: Math.random().toString(36).slice(2),
        count: purchaseCount,
        age: 0,
        price: pigPrice,
      };
      setPigBatches(updated);
      setFunds(newFunds - totalCost);
      logMessage(`Bought ${purchaseCount} pigs (replacing previous batch).`);
    } else {
      if (funds < totalCost) return logMessage("Not enough funds to buy pigs.");
      const newBatch = {
        id: Math.random().toString(36).slice(2),
        count: purchaseCount,
        age: 0,
        price: pigPrice,
      };
      setPigBatches((prev) => [...prev, newBatch]);
      setFunds((prev) => prev - totalCost);
      logMessage(`Bought ${purchaseCount} pigs.`);
    }

    setPurchaseCount(0);
  };

  const handleEndTurn = () => {
    const newPigPrice = Math.round(100 + Math.random() * 100);

    const agedBatches = pigBatches.map((b) => ({
      ...b,
      age: b.age + 7,
    }));

    const {
      nextWeek,
      nextDay,
      nextPigWeight,
      nextCropGrowth,
      nextFunds,
      nextFeed,
      warningMessage,
      newPrice: newFeedPrice,
    } = endTurnLogic({
      week,
      day,
      pigWeight,
      cropGrowth,
      selectedManager,
      totalPigs,
      feedStock,
      feedPrice,
      funds,
    });

    setWeek(nextWeek);
    setDay(nextDay);
    setPigWeight(nextPigWeight);
    setCropGrowth(nextCropGrowth);
    setFunds(nextFunds);
    setFeedStock(nextFeed);
    setFeedPrice(newFeedPrice);
    setPigPrice(newPigPrice);
    setPigBatches(agedBatches);

    if (warningMessage) logMessage(warningMessage);
  };

  const handleExport = () => exportCSVLogic(cellsState, TYPES, totalArea, cols);

  const handleReset = () => {
    const reset = resetFarmLogic();
    setTotalArea(reset.totalArea);
    setCornArea(reset.cornArea);
    setGrassArea(reset.grassArea);
    setSoyArea(reset.soyArea);
    setCellsState([]);
    setWeek(reset.week);
    setDay(reset.day);
    setPigWeight(reset.pigWeight);
    setCropGrowth(reset.cropGrowth);
    setFunds(reset.funds);
    setFeedStock(reset.feedStock);
    setFeedPrice(reset.feedPrice);
    setPigBatches([]);
    setPurchaseCount(0);
    setMessages([]);
  };

  return (
    <div className="mapper-container">
      <header>
        <h1>Dak Nong Farm</h1>
        <p>Each cell = 1,000 m². Manage your land, crops, and pigs week by week.</p>
      </header>

      <section className="controls">
        <label>
          Total area
          <input
            type="number"
            value={totalArea}
            onChange={(e) => setTotalArea(Number(e.target.value))}
          />
        </label>
        <label>
          Corn
          <input
            type="number"
            value={cornArea}
            onChange={(e) => setCornArea(Number(e.target.value))}
          />
        </label>
        <label>
          Grass
          <input
            type="number"
            value={grassArea}
            onChange={(e) => setGrassArea(Number(e.target.value))}
          />
        </label>
        <label>
          Soy
          <input
            type="number"
            value={soyArea}
            onChange={(e) => setSoyArea(Number(e.target.value))}
          />
        </label>

        <p><strong>Unused land:</strong> {unusedLand}</p>

        <div className="info-container">
          <Summary
            totalLand={totalArea * 1000}
            totalPigs={totalPigs}
            crops={{
              corn: Math.round(cornArea * 100 * cropGrowth),
              grass: Math.round(grassArea * 100 * cropGrowth),
              soy: Math.round(soyArea * 100 * cropGrowth),
            }}
            funds={funds}
          />

          <ManagerSelector
            selectedManager={selectedManager}
            onSelect={setSelectedManager}
          />

          <Marketplace
            funds={funds}
            feedStock={feedStock}
            feedPrice={feedPrice}
            setFunds={setFunds}
            setFeedStock={setFeedStock}
          />

          <div className="pig-purchase">
            <h4>Pig Market</h4>
            <p>
              Current Pig Price: <strong>${pigPrice} per pig</strong>
            </p>
            <input
              type="number"
              placeholder="Enter number of pigs"
              value={purchaseCount}
              onChange={(e) => setPurchaseCount(Number(e.target.value))}
            />
            <button onClick={handleBuyPigs}>Buy Pigs</button>
          </div>

          <MessageLog messages={messages} />
        </div>

        <div className="actions">
          <button onClick={handleGenerate}>Generate Grid</button>
          <button onClick={handleEndTurn}>End Turn</button>
          <button onClick={handleReset}>Reset</button>
          <button onClick={handleExport} disabled={!cellsState.length}>
            Export CSV
          </button>
        </div>

        <p className="grid-info">
          Week {week} | Day {day} | Crop Growth {(cropGrowth * 100).toFixed(0)}% |{" "}
          Pig Weight {pigWeight.toFixed(1)} kg | Total Pigs {totalPigs}
        </p>
      </section>

      <section className="grid-section">
        {cellsState.length === 0 ? (
          <p>No grid yet — press "Generate Grid".</p>
        ) : (
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${cols}, 25px)` }}
          >
            {cellsState.map((cell, i) => {
              const type = TYPES[cell ?? 0];
              return (
                <div
                  key={i}
                  className={`cell ${type.className}`}
                  title={type.label}
                >
                  <span>{i + 1}</span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: "40px", display: "flex", justifyContent: "center" }}>
          <PigPen totalPigs={totalPigs} />
        </div>

        <div className="pig-batch-info">
          <h4>Pig Batches</h4>
          {pigBatches.length === 0 ? (
            <p>No pigs yet.</p>
          ) : (
            <ul>
              {pigBatches.map((b) => (
                <li key={b.id}>
                  {b.count} pigs bought at {b.price} ₳ each — Age: {b.age} days
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}