import React, { useState, useMemo } from "react";
import './TerrainGridMapper.css';

const CELL_SIZE = 1000;

const TYPES = [
  { key: "empty", label: "Empty", className: "type-empty" },
  { key: "corn", label: "Corn", className: "type-corn" },
  { key: "grass", label: "Grass", className: "type-grass" },
  { key: "soy", label: "Soy", className: "type-soy" },
];

export default function TerrainGridMapper() {
  const [totalArea, setTotalArea] = useState(200000);
  const [cornArea, setCornArea] = useState(0);
  const [grassArea, setGrassArea] = useState(0);
  const [soyArea, setSoyArea] = useState(0);
  const [cellsState, setCellsState] = useState([]);

  const totalCells = Math.floor(totalArea / CELL_SIZE);

  const generateGrid = () => {
    const cornCells = Math.floor(cornArea / CELL_SIZE);
    const grassCells = Math.floor(grassArea / CELL_SIZE);
    const soyCells = Math.floor(soyArea / CELL_SIZE);

    let cells = Array(totalCells).fill(0);
    let idx = 0;

    for (let i = 0; i < cornCells && idx < totalCells; i++, idx++) cells[idx] = 1;
    for (let i = 0; i < grassCells && idx < totalCells; i++, idx++) cells[idx] = 2;
    for (let i = 0; i < soyCells && idx < totalCells; i++, idx++) cells[idx] = 3;

    setCellsState(cells);
  };

  const cols = Math.ceil(Math.sqrt(totalCells));
  const rows = Math.ceil(totalCells / cols);

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
    a.download = `terrain_map_${totalArea}m2_cells_${totalCells}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mapper-container">
      <header>
        <h1>Dak Nong Farm</h1>
        <p>Enter total area and crop areas. Each 1,000 m² = 1 square cell.</p>
      </header>

      <section className="controls">
        <label>
          Total area (m²)
          <input type="number" value={totalArea} onChange={e => setTotalArea(Number(e.target.value))} />
        </label>
        <label>
          Corn area (m²)
          <input type="number" value={cornArea} onChange={e => setCornArea(Number(e.target.value))} />
        </label>
        <label>
          Grass area (m²)
          <input type="number" value={grassArea} onChange={e => setGrassArea(Number(e.target.value))} />
        </label>
        <label>
          Soy area (m²)
          <input type="number" value={soyArea} onChange={e => setSoyArea(Number(e.target.value))} />
        </label>

        <div className="buttons">
          <button onClick={generateGrid}>Generate Grid ({totalCells} cells)</button>
          <button onClick={() => {
            setTotalArea(200000);
            setCornArea(0);
            setGrassArea(0);
            setSoyArea(0);
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