import { assertEquals } from "@std/assert";
import {
  apply,
  gatherRoll,
  isPassable,
  newGame,
  RECIPES,
  terrainAt,
} from "./mod.ts";

function besideForest() {
  const state = newGame(121);

  for (let y = -100; y <= 100; y++) {
    for (let x = -100; x <= 100; x++) {
      const here = terrainAt(state.seed, x, y);
      const east = terrainAt(state.seed, x + 1, y);

      if (!isPassable(here)) continue;
      if (east !== "forest") continue;

      if (gatherRoll(state.seed, x + 1, y) >= 0.6) continue;

      state.player = { x, y };
      return state;
    }
  }

  throw new Error("No suitable forest entrance found");
}

Deno.test("crafting an axe opens forest and allows gathering inside", () => {
  const state = besideForest();
  const start = { ...state.player };
  const snapshot = JSON.parse(JSON.stringify(state));

  const blocked = apply(state, {
    type: "move",
    direction: "east",
  });

  assertEquals(blocked[0].type, "blocked");
  assertEquals(state, snapshot);

  state.inventory = { ...RECIPES["axe"].inputs };

  const crafted = apply(state, {
    type: "craft",
    recipe: "axe",
  });

  assertEquals(crafted[0].type, "crafted");

  const moved = apply(state, {
    type: "move",
    direction: "east",
  });

  assertEquals(moved[0].type, "moved");
  assertEquals(state.player, { x: start.x + 1, y: start.y });

  const gathered = apply(state, { type: "gather" });

  assertEquals(gathered[0].type, "gathered");
  assertEquals(state.inventory["wood"], 1);
  assertEquals(state.inventory["axe"], 1);
});
