import { assert, assertEquals } from "@std/assert";
import { apply, newGame, TERRAIN_RESOURCES, terrainAt } from "./mod.ts";

Deno.test("gathering adds resources and records only the changed cell", () => {
  const state = newGame(121);
  const terrain = terrainAt(state.seed, 0, 0);
  const resources = TERRAIN_RESOURCES[terrain];
  const expected: Record<string, number> = {};

  assert(resources.length > 0);

  expected[resources[0].item] = 1;

  const events = apply(state, { type: "gather" });

  assertEquals(state.inventory, expected);
  assertEquals(state.changedCells, { "0,0": true });
  assertEquals(events, [{
    type: "gathered",
    at: { x: 0, y: 0 },
    items: expected,
    inventory: expected,
  }]);
});

Deno.test("gathering twice fails without changing state", () => {
  const state = newGame(121);
  apply(state, { type: "gather" });
  const snapshot = JSON.parse(JSON.stringify(state));

  const events = apply(state, { type: "gather" });

  assertEquals(state, snapshot);
  assertEquals(events, [{
    type: "gather_failed",
    at: { x: 0, y: 0 },
    reason: "Already gathered",
  }]);
});

Deno.test("a gathered event keeps its inventory after another gather", () => {
  const state = newGame(121);
  const first = apply(state, { type: "gather" });
  assertEquals(first[0].type, "gathered");

  const snapshot = JSON.parse(JSON.stringify(first));

  const movement = apply(state, { type: "move", direction: "east" });
  assertEquals(movement[0].type, "moved");

  const second = apply(state, { type: "gather" });
  assertEquals(second[0].type, "gathered");

  assertEquals(first, snapshot);
});
