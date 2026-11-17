import { assertEquals } from "@std/assert";
import { apply, gatherRoll, newGame, type Terrain, terrainAt } from "./mod.ts";

function gameAt(terrain: Terrain, min: number, max: number) {
  const state = newGame(121);

  for (let y = -100; y <= 100; y++) {
    for (let x = -100; x <= 100; x++) {
      if (terrainAt(state.seed, x, y) !== terrain) continue;

      const roll = gatherRoll(state.seed, x, y);

      if (roll >= min && roll < max) {
        state.player = { x, y };
        return state;
      }
    }
  }

  throw new Error(`No suitable ${terrain} cell found`);
}

Deno.test("shore can provide wood", () => {
  const state = gameAt("shore", 0.8, 0.9);

  const events = apply(state, { type: "gather" });

  assertEquals(events[0].type, "gathered");
  assertEquals(state.inventory, { wood: 1 });
});

Deno.test("an empty gather depletes the cell and cannot be repeated", () => {
  const state = gameAt("shore", 0.9, 1);
  const { x, y } = state.player;

  const events = apply(state, { type: "gather" });

  assertEquals(events, [{
    type: "gathered",
    at: { x, y },
    items: {},
    inventory: {},
  }]);
  assertEquals(state.inventory, {});
  assertEquals(state.changedCells, { [`${x},${y}`]: true });

  const snapshot = JSON.parse(JSON.stringify(state));
  const second = apply(state, { type: "gather" });

  assertEquals(second[0].type, "gather_failed");
  assertEquals(state, snapshot);
});

Deno.test("a natural flint drop resets the pity counter", () => {
  const state = gameAt("rock", 0.7, 0.75);
  state.flintPity = 12;

  apply(state, { type: "gather" });

  assertEquals(state.inventory, { flint: 1 });
  assertEquals(state.flintPity, 0);
});

Deno.test("a rock gather without flint increases the pity counter", () => {
  const state = gameAt("rock", 0, 0.7);
  state.flintPity = 28;

  apply(state, { type: "gather" });

  assertEquals(state.inventory, { stone: 1 });
  assertEquals(state.flintPity, 29);
});

Deno.test("the 50th rock attempt guarantees flint even on an empty roll", () => {
  const state = gameAt("rock", 0.75, 1);
  state.flintPity = 29;
  const { x, y } = state.player;

  const events = apply(state, { type: "gather" });

  assertEquals(state.inventory, { flint: 1 });
  assertEquals(state.flintPity, 0);
  assertEquals(events, [{
    type: "gathered",
    at: { x, y },
    items: { flint: 1 },
    inventory: { flint: 1 },
  }]);
});
