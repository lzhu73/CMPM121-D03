import { type Command, type GameState, RECIPES } from "../core/mod.ts";

const RECIPE_NAMES: Record<string, string> = {
  axe: "🪓 Craft Axe",
  campfire: "🔥 Build Campfire",
  signal_fire: "🚨 Build Rescue Signal",
};

export class Craft {
  private readonly state: GameState;

  private readonly buttons: {
    name: string;
    li: HTMLLIElement;
    button: HTMLButtonElement;
  }[] = [];

  constructor(
    list: HTMLElement,
    state: GameState,
    send: (command: Command) => void,
  ) {
    this.state = state;

    for (const name of Object.keys(RECIPES)) {
      const li = document.createElement("li");
      const button = document.createElement("button");

      button.type = "button";

      button.addEventListener("click", (event) => {
        send({
          type: "craft",
          recipe: name,
        });

        if (event.detail > 0) {
          button.blur();
        }
      });

      li.appendChild(button);
      list.appendChild(li);

      this.buttons.push({
        name,
        li,
        button,
      });
    }
  }

  update(): void {
    for (const { name, li, button } of this.buttons) {
      const recipe = RECIPES[name];
      const displayName = RECIPE_NAMES[name] ?? name;

      const owned = (this.state.inventory[recipe.output] ?? 0) > 0;

      // Only show total materials needed
      const requirements = Object.entries(recipe.inputs)
        .map(([item, needed]) => {
          const itemName = item.replaceAll("_", " ");

          const plural = needed === 1 ? "" : "s";

          return `${needed} ${itemName}${plural}`;
        })
        .join(" | ");

      button.style.whiteSpace = "pre-line";

      if (owned) {
        button.textContent = `${displayName} ✓ Owned`;
      } else {
        button.textContent = `${displayName}\n${requirements}`;
      }

      li.classList.toggle("recipe-owned", owned);
    }
  }
}
