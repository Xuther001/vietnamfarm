import React, { useState } from "react";
import './TerrainGridMapper.css';

const CELL_SIZE = 1000;
const PIG_SPACE_PER_PIG = 10;
const WEEKS_PER_SEASON = 12;
const DAYS_PER_WEEK = 7;
const PIG_WEIGHT_GAIN = 10;
const CROP_GROWTH_RATE = 0.1;

const TYPES = [
  { key: "empty", label: "Unused", className: "type-empty" },
  { key: "corn", label: "Corn", className: "type-corn" },
  { key: "grass", label: "Grass", className: "type-grass" },
  { key: "soy", label: "Soy", className: "type-soy" },
  { key: "pig", label: "Pig Pen", className: "type-pig" },
];

const MANAGERS = [
  { key: "VM1", label: "VM1", img: "/images/VM1.jpg", cropMultiplier: 1.2, pigMultiplier: 1 },
  { key: "VM2", label: "VM2", img: "/images/VM2.jpg", cropMultiplier: 1, pigMultiplier: 1.5 },
  { key: "VFM1", label: "VFM1", img: "/images/VFM1.jpg", cropMultiplier: 1.5, pigMultiplier: 1.2 },
  { key: "VFM2", label: "VFM2", img: "/images/VFM2.jpg", cropMultiplier: 1, pigMultiplier: 1.2 },
];

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
  const [feedConsumptionPerPigPerWeek] = useState(7);

  const totalCells = totalArea;
  const cols = Math.ceil(Math.sqrt(totalCells));
  const rows = Math.ceil(totalCells / cols);

  const totalPigs = pigArea * Math.floor(CELL_SIZE / PIG_SPACE_PER_PIG);
  const unusedLand = totalCells - (cornArea + grassArea + soyArea + pigArea);

  const cropYieldPerCell = 100;
  const cornKg = (cornArea * cropYieldPerCell * cropGrowth).toFixed(0);
  const grassKg = (grassArea * cropYieldPerCell * cropGrowth).toFixed(0);
  const soyKg = (soyArea * cropYieldPerCell * cropGrowth).toFixed(0);

  const generateGrid = () => {
    const sumAreas = cornArea + grassArea + soyArea + pigArea;
    if (sumAreas > totalArea) {
      setWarning("⚠️ Total allocated area exceeds total land area!");
      setCellsState([]);
      return;
    } else setWarning("");

    let cells = Array(totalCells).fill(0);
    let idx = 0;

    for (let i = 0; i < cornArea && idx < totalCells; i++, idx++) cells[idx] = 1;
    for (let i = 0; i < grassArea && idx < totalCells; i++, idx++) cells[idx] = 2;
    for (let i = 0; i < soyArea && idx < totalCells; i++, idx++) cells[idx] = 3;
    for (let i = 0; i < pigArea && idx < totalCells; i++, idx++) cells[idx] = 4;

    setCellsState(cells);
  };

  const endTurn = () => {
    const pigs = totalPigs;
    const feedNeeded = pigs * feedConsumptionPerPigPerWeek;

    if (feedStock < feedNeeded) {
      setWarning("⚠️ Not enough feed! Pig growth reduced this week.");
      setPigWeight(prev => prev + (PIG_WEIGHT_GAIN * 0.5 * selectedManager.pigMultiplier));
      setFeedStock(0);
    } else {
      setWarning("");
      setFeedStock(prev => prev - feedNeeded);
      setPigWeight(prev => prev + PIG_WEIGHT_GAIN * selectedManager.pigMultiplier);
    }

    setCropGrowth(prev => Math.min(1, prev + CROP_GROWTH_RATE * selectedManager.cropMultiplier));
    setWeek(prev => prev + 1);
    setDay(prev => prev + DAYS_PER_WEEK);

    setFeedPrice(prev => {
      const newPrice = (prev * (0.9 + Math.random() * 0.2)).toFixed(2);
      return Math.max(2, Math.min(10, parseFloat(newPrice)));
    });
  };

  const resetFarm = () => {
    setTotalArea(200);
    setCornArea(0);
    setGrassArea(0);
    setSoyArea(0);
    setPigArea(0);
    setCellsState([]);
    setWarning("");
    setWeek(1);
    setDay(7);
    setPigWeight(20);
    setCropGrowth(0);
    setFunds(10000);
    setFeedStock(0);
    setFeedPrice(5);
  };

  const exportCSV = () => {
    const rowsOut = ["index,row,col,type,label"];
    for (let i = 0; i < totalCells; i++) {
      const r = Math.floor(i / cols) + 1;
      const c = (i % cols) + 1;
      const tIdx = cellsState[i] ?? 0;
      const typeKey = TYPES[tIdx].key;
      const label = TYPES[tIdx].label;
      rowsOut.push(`${i + 1},${r},${c},${typeKey},${label}`);
    }
    const blob = new Blob([rowsOut.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `terrain_map_${totalArea * 1000}m2_cells_${totalCells}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBuyFeed = () => {
    const input = document.getElementById("feedInput");
    const amount = Number(input.value);
    if (amount <= 0) return;
    const cost = amount * feedPrice;
    if (cost > funds) {
      alert("❌ Not enough funds to buy that much feed!");
      return;
    }
    setFunds(prev => prev - cost);
    setFeedStock(prev => prev + amount);
    input.value = "";
  };

  return (
    <div className="mapper-container">
      <header>
        <h1>Dak Nong Farm</h1>
        <p>Each cell = 1,000 m². Manage your land, crops, and livestock week by week.</p>
      </header>

      <section className="controls">
        <label>
          Total area (1,000 m²)
          <input type="number" value={totalArea} onChange={e => setTotalArea(Number(e.target.value))} />
        </label>
        <label>
          Corn area (1,000 m²)
          <input type="number" value={cornArea} onChange={e => setCornArea(Number(e.target.value))} />
        </label>
        <label>
          Grass area (1,000 m²)
          <input type="number" value={grassArea} onChange={e => setGrassArea(Number(e.target.value))} />
        </label>
        <label>
          Soy area (1,000 m²)
          <input type="number" value={soyArea} onChange={e => setSoyArea(Number(e.target.value))} />
        </label>
        <label>
          Pig area (1,000 m²)
          <input type="number" value={pigArea} onChange={e => setPigArea(Number(e.target.value))} />
          <small>Total pigs possible: {totalPigs}</small>
        </label>

        <p><strong>Unused land (1,000 m²):</strong> {unusedLand}</p>
        <p style={{ color: 'red', fontSize: '13px' }}>{warning}</p>

        <section className="manager-selection">
          <h3>Select Farm Manager:</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            {MANAGERS.map(manager => (
              <div key={manager.key} style={{ textAlign: 'center', cursor: 'pointer' }}
                onClick={() => setSelectedManager(manager)}>
                <img src={manager.img} alt={manager.label} width={80} style={{
                  border: selectedManager.key === manager.key ? '3px solid #f59e0b' : '1px solid #ccc',
                  borderRadius: '6px'
                }} />
                <div>{manager.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="summary-panel">
          <h3>Farm Summary</h3>
          <p><strong>Total Land:</strong> {totalArea * 1000} m²</p>
          <p><strong>Total Pigs:</strong> {totalPigs}</p>
          <p><strong>Corn:</strong> {cornKg} kg | <strong>Grass:</strong> {grassKg} kg | <strong>Soy:</strong> {soyKg} kg</p>
          <p><strong>Funds:</strong> ${funds.toLocaleString()}</p>
        </section>

        <section className="marketplace">
          <h3>Pig Feed Marketplace</h3>
          <p>Funds: ${funds.toLocaleString()} | Feed in Storage: {feedStock} kg | Price: ${feedPrice}/kg</p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label>
              Buy Feed (kg)
              <input
                type="number"
                min="0"
                id="feedInput"
                placeholder="Enter amount"
                style={{ marginLeft: '5px', width: '80px' }}
              />
            </label>
            <button onClick={handleBuyFeed}>Buy Feed</button>
          </div>
        </section>

        <div className="buttons">
          <button onClick={generateGrid}>Generate Grid ({totalCells} cells)</button>
          <button onClick={endTurn}>End Turn (1 Week)</button>
          <button onClick={resetFarm}>Reset</button>
          <button onClick={exportCSV} disabled={cellsState.length === 0}>Export CSV</button>
        </div>

        <p className="grid-info">
          Week: {week} | Days Passed: {day} | Crop Growth: {(cropGrowth * 100).toFixed(0)}% | 
          Avg Pig Weight: {pigWeight.toFixed(1)} kg
        </p>
      </section>

      <section className="grid-section">
        {cellsState.length === 0 ? (
          <p className="no-grid">No grid yet — press "Generate Grid".</p>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, 25px)` }}>
            {cellsState.map((cell, i) => {
              const type = TYPES[cell ?? 0];
              return (
                <div
                  key={i}
                  className={`cell ${type.className}`}
                  title={`Cell ${i + 1} — ${type.label}`}
                >
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