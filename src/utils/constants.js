export const CELL_SIZE = 1000;
export const PIG_SPACE_PER_PIG = 10;
export const DAYS_PER_WEEK = 7;
export const PIG_WEIGHT_GAIN = 10;
export const CROP_GROWTH_RATE = 0.1;

export const TYPES = [
  { key: "empty", label: "Unused", className: "type-empty" },
  { key: "corn", label: "Corn", className: "type-corn" },
  { key: "grass", label: "Grass", className: "type-grass" },
  { key: "soy", label: "Soy", className: "type-soy" },
  { key: "pig", label: "Pig Pen", className: "type-pig" },
];

export const MANAGERS = [
  { key: "VM1", label: "VM1", cropMultiplier: 1.2, pigMultiplier: 1 },
  { key: "VM2", label: "VM2", cropMultiplier: 1, pigMultiplier: 1.5 },
  { key: "VFM1", label: "VFM1", cropMultiplier: 1.5, pigMultiplier: 1.2 },
  { key: "VFM2", label: "VFM2", cropMultiplier: 1, pigMultiplier: 1.2 },
];