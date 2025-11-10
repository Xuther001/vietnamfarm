import React, { useState } from "react";
import "./TerrainGridMapper.css";
import Summary from "../Summary/Summary";

import {
  TYPES,
  MANAGERS,
  CELL_SIZE,
  DAYS_PER_WEEK,
  PIG_SPACE_PER_PIG,
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
  const [pigArea, setPigArea] = useState(0);
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

  const totalCells = totalArea;
  const cols = Math.ceil(Math.sqrt(totalCells));
  const totalPigs = pigArea * Math.floor(CELL_SIZE / PIG_SPACE_PER_PIG);
  const unusedLand = totalCells - (cornArea + grassArea + soyArea + pigArea);

  const handleGenerate = () => {
    const result = generateGrid(totalArea, cornArea, grassArea, soyArea, pigArea);
    if (result.warning) setWarning(result.warning);
    setCellsState(result.cells);
  };

  const handleEndTurn = () => {
    const {
      nextWeek,
      nextDay,
      nextPigWeight,
      nextCropGrowth,
      nextFunds,
      nextFeed,
      warningMessage,
      newPrice,
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
    setFeedPrice(newPrice);
    setWarning(warningMessage);
  };

  const handleExport = () => exportCSVLogic(cellsState, TYPES, totalArea, cols);
  const handleReset = () => {
    const reset = resetFarmLogic();
    setTotalArea(reset.totalArea);
    setCornArea(reset.cornArea);
    setGrassArea(reset.grassArea);
    setSoyArea(reset.soyArea);
    setPigArea(reset.pigArea);
    setCellsState([]);
    setWarning("");
    setWeek(reset.week);
    setDay(reset.day);
    setPigWeight(reset.pigWeight);
    setCropGrowth(reset.cropGrowth);
    setFunds(reset.funds);
    setFeedStock(reset.feedStock);
    setFeedPrice(reset.feedPrice);
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
          <input type="number" value={totalArea} onChange={(e) => setTotalArea(Number(e.target.value))} />
        </label>
        <label>
          Corn
          <input type="number" value={cornArea} onChange={(e) => setCornArea(Number(e.target.value))} />
        </label>
        <label>
          Grass
          <input type="number" value={grassArea} onChange={(e) => setGrassArea(Number(e.target.value))} />
        </label>
        <label>
          Soy
          <input type="number" value={soyArea} onChange={(e) => setSoyArea(Number(e.target.value))} />
        </label>
        <label>
          Pig pens
          <input type="number" value={pigArea} onChange={(e) => setPigArea(Number(e.target.value))} />
        </label>

        <p><strong>Unused land:</strong> {unusedLand}</p>
        {warning && <p className="warning">{warning}</p>}

        <div className="info-container">
          <Summary
            totalLand={totalArea * 1000}
            totalPigs={totalPigs}
            crops={{
              corn: Math.round(cornArea * 100 * cropGrowth),
              grass: Math.round(grassArea * 100 * cropGrowth),
              soy: Math.round(soyArea * 100 * cropGrowth)
            }}
            funds={funds}
          />

          <ManagerSelector selectedManager={selectedManager} onSelect={setSelectedManager} />

          <Marketplace
            funds={funds}
            feedStock={feedStock}
            feedPrice={feedPrice}
            setFunds={setFunds}
            setFeedStock={setFeedStock}
          />
        </div>

        <div className="actions">
          <button onClick={handleGenerate}>Generate Grid</button>
          <button onClick={handleEndTurn}>End Turn</button>
          <button onClick={handleReset}>Reset</button>
          <button onClick={handleExport} disabled={!cellsState.length}>Export CSV</button>
        </div>

        <p className="grid-info">
          Week {week} | Day {day} | Crop Growth {(cropGrowth * 100).toFixed(0)}% | Pig Weight {pigWeight.toFixed(1)} kg
        </p>
      </section>

      <section className="grid-section">
        {cellsState.length === 0 ? (
          <p>No grid yet — press "Generate Grid".</p>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, 25px)` }}>
            {cellsState.map((cell, i) => {
              const type = TYPES[cell ?? 0];
              return (
                <div key={i} className={`cell ${type.className}`} title={type.label}>
                  <span>{i + 1}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}