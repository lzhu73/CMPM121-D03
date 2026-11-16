// The world is a pure function of a seed and coordinates. Nothing here is stored,
// so the world can be effectively unbounded while saved state stays small.

export type Terrain = "shore" | "forest" | "water" | "rock";
export type ResourceDrop = {
  item: string;
  chance: number;
};

export const TERRAIN_RESOURCES: Record<Terrain, ResourceDrop[]> = {
  shore: [
    { item: "stick", chance: 0.8 },
    { item: "wood", chance: 0.1 },
  ],
  rock: [
    { item: "stone", chance: 0.7 },
    { item: "flint", chance: 0.05 },
  ],
  forest: [
    { item: "wood", chance: 0.6 },
    { item: "leaf", chance: 0.15 },
  ],
  water: [],
};

export function terrainAt(seed: number, x: number, y: number): Terrain {
  const raw = 0.65 * noise(seed, x, y, 9) + 0.35 * noise(seed + 1, x, y, 3);
  // Every game starts at the origin, so flatten the land there. Otherwise some
  // seeds would start inside a lake or walled into a pocket.
  const height = 0.5 + (raw - 0.5) * Math.min(1, Math.hypot(x, y) / 10);
  if (height < 0.3) return "water";
  if (height > 0.7) return "forest";
  return noise(seed + 2, x, y, 6) < 0.45 ? "rock" : "shore";
}

export const TERRAIN_ACCESS: Record<Terrain, boolean | string> = {
  shore: true,
  rock: true,
  forest: "axe",
  water: false,
};

export function isPassable(
  terrain: Terrain,
  inventory: Record<string, number> = {},
): boolean {
  const access = TERRAIN_ACCESS[terrain];

  if (typeof access === "boolean") return access;

  return (inventory[access] ?? 0) > 0;
}

// Value noise: random numbers at coarse grid points, blended between them, so
// that terrain forms regions instead of static.
function noise(seed: number, x: number, y: number, scale: number): number {
  const left = Math.floor(x / scale);
  const top = Math.floor(y / scale);
  const blendX = smooth(x / scale - left);
  const blendY = smooth(y / scale - top);
  return mix(
    mix(gridValue(seed, left, top), gridValue(seed, left + 1, top), blendX),
    mix(
      gridValue(seed, left, top + 1),
      gridValue(seed, left + 1, top + 1),
      blendX,
    ),
    blendY,
  );
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// A hash, not a generator: the same inputs give the same number in [0, 1), with
// no memory of earlier calls.
function gridValue(seed: number, x: number, y: number): number {
  let hash = Math.imul(seed, 0x9e3779b1) ^ Math.imul(x, 0x85ebca6b) ^
    Math.imul(y, 0xc2b2ae35);
  hash = Math.imul(hash ^ (hash >>> 15), 0x2c1b3c6d);
  hash = Math.imul(hash ^ (hash >>> 12), 0x297a2d39);
  return ((hash ^ (hash >>> 15)) >>> 0) / 2 ** 32;
}

export function gatherRoll(seed: number, x: number, y: number): number {
  return gridValue(seed + 3, x, y);
}
