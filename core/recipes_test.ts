import { assert, assertEquals } from "@std/assert";
import { apply, newGame, RECIPES, TERRAIN_RESOURCES, WETTING } from "./mod.ts";

Deno.test("every recipe input has a source", () => {
  const sources = new Set<string>();

  for (const resources of Object.values(TERRAIN_RESOURCES)) {
    for (const resource of resources) {
      sources.add(resource.item);
    }
  }

  for (const recipe of Object.values(RECIPES)) {
    sources.add(recipe.output);
  }

  for (const [name, recipe] of Object.entries(RECIPES)) {
    if (sources.has(WETTING.input)) {
      sources.add(WETTING.output);
    }
    for (const item of Object.keys(recipe.inputs)) {
      assert(
        sources.has(item),
        `${name} requires "${item}", but nothing provides it`,
      );
    }
  }
});

Deno.test("crafting spends ingredients and adds the output", () => {
  const state = newGame(121);
  const recipe = RECIPES["axe"];

  state.inventory = { ...recipe.inputs };

  const events = apply(state, { type: "craft", recipe: "axe" });

  for (const item of Object.keys(recipe.inputs)) {
    assertEquals(state.inventory[item], 0);
  }

  assertEquals(state.inventory[recipe.output], 1);
  assertEquals(events, [{
    type: "crafted",
    recipe: "axe",
    inventory: { ...state.inventory },
  }]);
});

Deno.test("crafting without enough materials changes nothing", () => {
  const state = newGame(121);
  const snapshot = JSON.parse(JSON.stringify(state));

  const events = apply(state, { type: "craft", recipe: "axe" });
  const event = events[0];

  assertEquals(state, snapshot);
  assert(event.type === "craft_failed");
  assert(event.reason.includes("stick"));
  assert(event.reason.includes("stone"));
});

Deno.test("crafting an owned item fails without spending materials", () => {
  const state = newGame(121);
  const recipe = RECIPES["axe"];

  state.inventory = {
    ...recipe.inputs,
    [recipe.output]: 1,
  };

  const snapshot = JSON.parse(JSON.stringify(state));
  const events = apply(state, { type: "craft", recipe: "axe" });

  assertEquals(state, snapshot);
  assertEquals(events[0].type, "craft_failed");
});
