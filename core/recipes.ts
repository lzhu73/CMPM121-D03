export type Recipe = {
  inputs: Record<string, number>;
  output: string;
  wins?: boolean;
};

export const RECIPES: Record<string, Recipe> = {
  axe: {
    inputs: { stick: 10, stone: 10 },
    output: "axe",
  },
  campfire: {
    inputs: { wood: 10, stone: 20, stick: 10, flint: 1 },
    output: "campfire",
  },
  signal_fire: {
    inputs: { campfire: 1, wet_leaf: 5 },
    output: "signal_fire",
    wins: true,
  },
};
