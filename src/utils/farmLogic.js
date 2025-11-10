import { CROP_GROWTH_RATE, PIG_WEIGHT_GAIN, DAYS_PER_WEEK } from "./constants";

export function generateGrid(totalArea, cornArea, grassArea, soyArea, pigArea) {
  const sum = cornArea + grassArea + soyArea + pigArea;
  if (sum > totalArea) {
    return { warning: "⚠️ Total allocated area exceeds total land area!", cells: [] };
  }

  const totalCells = totalArea;
  let cells = Array(totalCells).fill(0);
  let idx = 0;

  for (let i = 0; i < cornArea && idx < totalCells; i++, idx++) cells[idx] = 1;
  for (let i = 0; i < grassArea && idx < totalCells; i++, idx++) cells[idx] = 2;
  for (let i = 0; i < soyArea && idx < totalCells; i++, idx++) cells[idx] = 3;
  for (let i = 0; i < pigArea && idx < totalCells; i++, idx++) cells[idx] = 4;

  return { cells, warning: "" };
}

export function endTurnLogic({
  week,
  day,
  pigWeight,
  cropGrowth,
  selectedManager,
  totalPigs,
  feedStock,
  feedPrice,
  funds,
}) {
  const feedPerPig = 7;
  const feedNeeded = totalPigs * feedPerPig;
  let warningMessage = "";
  let nextFeed = feedStock;
  let nextFunds = funds;
  let nextPigWeight = pigWeight;
  let nextCropGrowth = cropGrowth;

  if (feedStock < feedNeeded) {
    warningMessage = "⚠️ Not enough feed! Pig growth reduced.";
    nextPigWeight += PIG_WEIGHT_GAIN * 0.5 * selectedManager.pigMultiplier;
    nextFeed = 0;
  } else {
    nextFeed -= feedNeeded;
    nextPigWeight += PIG_WEIGHT_GAIN * selectedManager.pigMultiplier;
  }

  nextCropGrowth = Math.min(1, nextCropGrowth + CROP_GROWTH_RATE * selectedManager.cropMultiplier);
  const newPrice = Math.max(2, Math.min(10, +(feedPrice * (0.9 + Math.random() * 0.2)).toFixed(2)));

  return {
    nextWeek: week + 1,
    nextDay: day + DAYS_PER_WEEK,
    nextPigWeight,
    nextCropGrowth,
    nextFunds,
    nextFeed,
    warningMessage,
    newPrice,
  };
}

export function exportCSVLogic(cellsState, TYPES, totalArea, cols) {
  const rows = ["index,row,col,type,label"];
  for (let i = 0; i < totalArea; i++) {
    const r = Math.floor(i / cols) + 1;
    const c = (i % cols) + 1;
    const tIdx = cellsState[i] ?? 0;
    const { key, label } = TYPES[tIdx];
    rows.push(`${i + 1},${r},${c},${key},${label}`);
  }

  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "terrain_map.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function resetFarmLogic() {
  return {
    totalArea: 200,
    cornArea: 0,
    grassArea: 0,
    soyArea: 0,
    pigArea: 0,
    week: 1,
    day: 7,
    pigWeight: 20,
    cropGrowth: 0,
    funds: 10000,
    feedStock: 0,
    feedPrice: 5,
  };
}