import { TYPES } from "./constants.js";

export const generateGrid = (cornArea, grassArea, soyArea, pigArea, totalArea) => {
  const totalCells = totalArea;
  const sumAreas = cornArea + grassArea + soyArea + pigArea;
  if (sumAreas > totalArea) throw new Error("⚠️ Total allocated area exceeds total land area!");

  const cells = Array(totalCells).fill(0);
  let idx = 0;

  for (let i = 0; i < cornArea && idx < totalCells; i++, idx++) cells[idx] = 1;
  for (let i = 0; i < grassArea && idx < totalCells; i++, idx++) cells[idx] = 2;
  for (let i = 0; i < soyArea && idx < totalCells; i++, idx++) cells[idx] = 3;
  for (let i = 0; i < pigArea && idx < totalCells; i++, idx++) cells[idx] = 4;

  return cells;
};

export const exportCSV = (cellsState, cols, totalArea) => {
  const totalCells = totalArea;
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