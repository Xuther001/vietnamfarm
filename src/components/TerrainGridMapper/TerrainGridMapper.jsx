import React, { useState } from "react";
import './TerrainGridMapper.css';

const CELL_SIZE = 1000; // 1 cell = 1,000 m²

const TYPES = [
  { key: "empty", label: "Unused", className: "type-empty" },
  { key: "corn", label: "Corn", className: "type-corn" },
  { key: "grass", label: "Grass", className: "type-grass" },
  { key: "soy", label: "Soy", className: "type-soy" },
  { key: "pig", label: "Pig Pen", className: "type-pig" },
];

export default function TerrainGridMapper() {
  const [totalArea, setTotalArea] = useState(200); // in 1,000 m² units
  const [cornArea, setCornArea] = useState(0);
  const [grassArea, setGrassArea] = useState(0);
  const [soyArea, setSoyArea] = useState(0);
  const [pigArea, setPigArea] = useState(0);
  const [cellsState, setCellsState] = useState([]);

  const generateGrid = () => {
    const totalCells = totalArea;
    let cells = Array(totalCells).fill(0); // start with unused

    let idx = 0;
    for (let i = 0; i < cornArea && idx < totalCells; i++, idx++) cells[idx] = 1;
    for (let i = 0; i < grassArea && idx < totalCells; i++, idx++) cells[idx] = 2;
    for (let i = 0; i < soyArea && idx < totalCells; i++, idx++) cells[idx] = 3;
    for (let i = 0; i < pigArea && idx < totalCells; i++, idx++) cells[idx] = 4;

    setCellsState(cells);
  };

  const unusedLand = Math.max(0, totalArea - (cornArea + grassArea + soyArea + pigArea));

  const cols = Math.ceil(Math.sqrt(totalArea));
  const rows = Math.ceil(totalArea / cols);

  const exportCSV = () => {
    const rowsOut = ["index,row,col,type,label"];
    for (let i = 0; i < totalArea; i++) {
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
    a.download = `terrain_map_${totalArea}000m2_cells.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mapper-container">
      <header>
        <h1>Dak Nong Farm</h1>
        <p>Each 1 cell = 1,000 m². Total area must equal sum of crop & pig areas.</p>
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
        </label>
        <label>
          Unused land (1,000 m²)
          <input type="number" value={unusedLand} readOnly />
        </label>

        <div className="buttons">
          <button
            onClick={generateGrid}
            disabled={(cornArea + grassArea + soyArea + pigArea) > totalArea}
          >
            Generate Grid ({totalArea} cells)
          </button>
          <button onClick={() => {
            setTotalArea(200);
            setCornArea(0);
            setGrassArea(0);
            setSoyArea(0);
            setPigArea(0);
            setCellsState([]);
          }}>Reset</button>
          <button onClick={exportCSV} disabled={cellsState.length === 0}>Export CSV</button>
        </div>

        <p className="grid-info">{rows} rows × {cols} cols</p>
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