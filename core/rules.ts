// The rules of the game. There is no clock here: a command updates the state at
// once, and the events it returns are a record of what happened. Whoever called
// apply() decides how, or whether, to show them over time.

import {
  gatherRoll,
  isPassable,
  type Terrain,
  TERRAIN_RESOURCES,
  terrainAt,
  WETTING,
} from "./terrain.ts";
import { type Recipe, RECIPES } from "./recipes.ts";

export type Cell = { x: number; y: number };

export type Direction = "north" | "south" | "east" | "west";

// Plain data that survives JSON. Terrain is absent because the seed can recompute
// it: besides the seed, only what the player has caused belongs here.
export type GameState = {
  seed: number;
  player: Cell;
  inventory: Record<string, number>;
  changedCells: Record<string, boolean>;
  flintPity: number;
  leafPity: number;
  won: boolean;
};

// Command: https://gameprogrammingpatterns.com/command.html
export type Command =
  | { type: "move"; direction: Direction }
  | { type: "gather" }
  | { type: "craft"; recipe: string };

// Domain Event: https://martinfowler.com/eaaDev/DomainEvent.html
export type GameEvent =
  | { type: "moved"; from: Cell; to: Cell }
  | { type: "blocked"; at: Cell; toward: Cell; terrain: Terrain }
  | {
    type: "gathered";
    at: Cell;
    items: Record<string, number>;
    inventory: Record<string, number>;
  }
  | { type: "gather_failed"; at: Cell; reason: string }
  | {
    type: "crafted";
    recipe: string;
    inventory: Record<string, number>;
  }
  | { type: "craft_failed"; reason: string }
  | {
    type: "leaves_wetted";
    count: number;
    inventory: Record<string, number>;
  }
  | { type: "won" };

const STEPS: Record<Direction, Cell> = {
  north: { x: 0, y: -1 },
  south: { x: 0, y: 1 },
  east: { x: 1, y: 0 },
  west: { x: -1, y: 0 },
};

// Singleton, avoided on purpose: tests make as many games as they need. https://gameprogrammingpatterns.com/singleton.html
export function newGame(seed: number): GameState {
  return {
    seed,
    player: { x: 0, y: 0 },
    inventory: {},
    changedCells: {},
    flintPity: 0,
    leafPity: 0,
    won: false,
  };
}

// The single way in. It updates the state it is given and returns the events.
export function apply(state: GameState, command: Command): GameEvent[] {
  if (state.won) return [];
  switch (command.type) {
    case "move":
      return move(state, command.direction);
    case "gather":
      return gather(state);
    case "craft":
      return craft(state, command.recipe);
  }
}

function move(state: GameState, direction: Direction): GameEvent[] {
  const step = STEPS[direction];
  // Events are retained and played back later, while state keeps changing. So an
  // event gets cells of its own, never an object that state still holds.
  // Aliasing Bug: https://martinfowler.com/bliki/AliasingBug.html
  // Cells in events act as a Value Object: https://martinfowler.com/bliki/ValueObject.html
  const from = { ...state.player };
  const to = { x: from.x + step.x, y: from.y + step.y };
  const terrain = terrainAt(state.seed, to.x, to.y);
  if (!isPassable(terrain, state.inventory)) {
    return [{ type: "blocked", at: from, toward: to, terrain }];
  }
  state.player.x = to.x;
  state.player.y = to.y;
  return [
    { type: "moved", from, to },
    ...wetLeaves(state),
  ];
}

function gather(state: GameState): GameEvent[] {
  const at = { ...state.player };
  const key = `${at.x},${at.y}`;

  if (state.changedCells[key]) {
    return [{ type: "gather_failed", at, reason: "Already gathered" }];
  }

  const terrain = terrainAt(state.seed, at.x, at.y);
  const resources = TERRAIN_RESOURCES[terrain];

  if (resources.length === 0) {
    return [{ type: "gather_failed", at, reason: "Nothing to gather" }];
  }

  const items: Record<string, number> = {};
  const roll = gatherRoll(state.seed, at.x, at.y);
  let totalChance = 0;

  for (const resource of resources) {
    totalChance += resource.chance;

    if (roll < totalChance) {
      items[resource.item] = 1;
      break;
    }
  }

  if (terrain === "rock") {
    if ((items["flint"] ?? 0) > 0) {
      state.flintPity = 0;
    } else {
      state.flintPity += 1;

      if (state.flintPity >= 50) {
        items["flint"] = 1;
        state.flintPity = 0;
      }
    }
  }

  if (terrain === "forest") {
    if ((items["leaf"] ?? 0) > 0) {
      state.leafPity = 0;
    } else {
      state.leafPity += 1;

      if (state.leafPity >= 10) {
        items["leaf"] = 1;
        state.leafPity = 0;
      }
    }
  }

  for (const [item, count] of Object.entries(items)) {
    state.inventory[item] = (state.inventory[item] ?? 0) + count;
  }

  state.changedCells[key] = true;

  return [{
    type: "gathered",
    at,
    items,
    inventory: { ...state.inventory },
  }];
}

export function missingIngredients(
  state: GameState,
  recipe: Recipe,
): Record<string, number> {
  const missing: Record<string, number> = {};

  for (const [item, needed] of Object.entries(recipe.inputs)) {
    const held = state.inventory[item] ?? 0;

    if (held < needed) {
      missing[item] = needed - held;
    }
  }

  return missing;
}

function craft(state: GameState, name: string): GameEvent[] {
  const recipe = RECIPES[name];

  if (!recipe) {
    return [{ type: "craft_failed", reason: `Unknown recipe: ${name}` }];
  }

  if ((state.inventory[recipe.output] ?? 0) > 0) {
    return [{
      type: "craft_failed",
      reason: `Already own ${recipe.output}`,
    }];
  }
  const missing = missingIngredients(state, recipe);

  if (Object.keys(missing).length > 0) {
    const details = Object.entries(missing)
      .map(([item, count]) => `${item}: ${count}`)
      .join(", ");

    return [{ type: "craft_failed", reason: `Missing ${details}` }];
  }

  for (const [item, count] of Object.entries(recipe.inputs)) {
    state.inventory[item] -= count;
  }

  state.inventory[recipe.output] = (state.inventory[recipe.output] ?? 0) + 1;

  const events: GameEvent[] = [{
    type: "crafted",
    recipe: name,
    inventory: { ...state.inventory },
  }];

  if (recipe.wins) {
    state.won = true;
    events.push({ type: "won" });
  }

  return events;
}

function wetLeaves(state: GameState): GameEvent[] {
  const count = state.inventory[WETTING.input] ?? 0;
  if (count === 0) return [];

  const besideWater = Object.values(STEPS).some((step) =>
    terrainAt(
      state.seed,
      state.player.x + step.x,
      state.player.y + step.y,
    ) === "water"
  );

  if (!besideWater) return [];

  state.inventory[WETTING.input] = 0;
  state.inventory[WETTING.output] = (state.inventory[WETTING.output] ?? 0) +
    count;

  return [{
    type: "leaves_wetted",
    count,
    inventory: { ...state.inventory },
  }];
}
