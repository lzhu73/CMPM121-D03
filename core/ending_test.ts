import { assertEquals } from "@std/assert";
import { apply, type Command, newGame, RECIPES } from "./mod.ts";

Deno.test("crafting the signal fire wins and stops all commands", () => {
  const state = newGame(121);
  const recipe = RECIPES["signal_fire"];
  state.inventory = { ...recipe.inputs };

  const events = apply(state, {
    type: "craft",
    recipe: "signal_fire",
  });

  assertEquals(state.won, true);
  assertEquals(events, [
    {
      type: "crafted",
      recipe: "signal_fire",
      inventory: {
        campfire: 0,
        wet_leaf: 0,
        signal_fire: 1,
      },
    },
    { type: "won" },
  ]);

  const snapshot = JSON.parse(JSON.stringify(state));

  const commands: Command[] = [
    { type: "move", direction: "east" },
    { type: "gather" },
    { type: "craft", recipe: "axe" },
  ];

  for (const command of commands) {
    assertEquals(apply(state, command), []);
    assertEquals(state, snapshot);
  }
});
