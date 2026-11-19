import { assert, assertEquals } from "@std/assert";
import { canReachEnding, reachableProgression, RECIPES } from "./mod.ts";

// Test 1: Players can eventually craft an axe
Deno.test("the player can eventually craft an axe", () => {
  const result = reachableProgression();

  assert(result.items.has("stick"));
  assert(result.items.has("stone"));
  assert(result.items.has("axe"));
});

// Test 2: Crafting an axe unlocks the forest
Deno.test("crafting an axe makes forests reachable", () => {
  const result = reachableProgression();

  assert(result.terrains.has("forest"));
  assert(result.items.has("wood"));
  assert(result.items.has("leaf"));
});

// Test 3: Leaves can become wet leaves
Deno.test("leaves can become wet leaves", () => {
  const result = reachableProgression();

  assert(result.items.has("leaf"));
  assert(result.items.has("wet_leaf"));
});

// Test 4: Signal fire ingredients are obtainable
Deno.test("all winning recipe inputs are reachable", () => {
  const result = reachableProgression();
  const recipe = RECIPES["signal_fire"];

  for (const item of Object.keys(recipe.inputs)) {
    assert(
      result.items.has(item),
      `Missing source for ${item}`,
    );
  }

  assert(result.items.has("signal_fire"));
});

// Test 5: The game has a reachable ending
Deno.test("the game has a reachable ending", () => {
  assertEquals(canReachEnding(), true);
});

// Test 6: Impossible recipes stay locked
Deno.test("a recipe with an impossible input stays locked", () => {
  const result = reachableProgression({
    impossible_device: {
      inputs: { mystery_crystal: 1 },
      output: "impossible_device",
    },
  });

  assertEquals(
    result.items.has("impossible_device"),
    false,
  );
});
Deno.test("all real recipes are reachable", () => {
  const result = reachableProgression();

  assertEquals(result.unreachable, []);
});

Deno.test("a recipe requiring its own output is unreachable", () => {
  const result = reachableProgression({
    cursed_tool: {
      inputs: { cursed_tool: 1 },
      output: "cursed_tool",
    },
  });

  assertEquals(result.made.has("cursed_tool"), false);
  assertEquals(result.unreachable, ["cursed_tool"]);
});

Deno.test("a gatherable output does not make its recipe reachable", () => {
  const result = reachableProgression({
    special_stone: {
      inputs: { mystery_crystal: 1 },
      output: "stone",
    },
  });

  assert(result.items.has("stone"));
  assertEquals(result.made.has("special_stone"), false);
  assertEquals(result.unreachable, ["special_stone"]);
});
