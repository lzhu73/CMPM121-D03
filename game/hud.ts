import { type GameEvent, type GameState, terrainAt } from "../core/mod.ts";

function element(id: string): HTMLElement {
  return document.getElementById(id)!;
}

function describe(event: GameEvent): string {
  switch (event.type) {
    case "moved":
      return `moved to ${event.to.x}, ${event.to.y}`;
    case "blocked":
      return `blocked by ${event.terrain} at ${event.toward.x}, ${event.toward.y}`;
    case "gathered":
      return `gathered at ${event.at.x}, ${event.at.y}`;
    case "gather_failed":
      return event.reason;
  }
}

// The readout, as ordinary page elements that CSS can style and that assistive
// tools can read. It changes only as events play.
export class Hud {
  private readonly seed: number;
  private gatheredCells = new Set<string>();

  constructor(state: GameState) {
    this.seed = state.seed;
    this.showPosition(state.player.x, state.player.y);
  }

  show(event: GameEvent) {
    element("live").textContent = describe(event);

    if (event.type === "moved") {
      this.showPosition(event.to.x, event.to.y);
    }

    if (event.type === "gathered") {
      this.gatheredCells.add(`${event.at.x},${event.at.y}`);
      this.showPosition(event.at.x, event.at.y);

      const inventory = element("inventory");
      inventory.replaceChildren();

      for (const [item, count] of Object.entries(event.inventory)) {
        const li = document.createElement("li");
        li.textContent = `${item}: ${count}`;
        inventory.appendChild(li);
      }
    }
  }

  private showPosition(x: number, y: number) {
    element("position").textContent = `${x}, ${y}`;
    const terrain = terrainAt(this.seed, x, y);
    const gathered = this.gatheredCells.has(`${x},${y}`);

    element("terrain").textContent = gathered
      ? `${terrain} (depleted)`
      : terrain;
  }
}
