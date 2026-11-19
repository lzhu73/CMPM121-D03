import { assert, assertEquals } from "@std/assert";
import { apply, type Command, type GameEvent, newGame } from "./mod.ts";
import run from "./run.json" with { type: "json" };

function replay() {
  const state = newGame(run.seed);
  const events: GameEvent[] = [];

  for (const command of run.commands as Command[]) {
    events.push(...apply(state, command));
  }

  return { state, events };
}

Deno.test("the recorded run wins and repeats identically", () => {
  const first = replay();

  assertEquals(first.state.won, true);
  assert(first.events.some((event) => event.type === "crafted"));
  assert(first.events.some((event) => event.type === "won"));

  // find time dependency
  const start = Date.now();
  while (Date.now() === start);

  const second = replay();

  assertEquals(second, first);
});
