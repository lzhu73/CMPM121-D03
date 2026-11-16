import { type Command, type GameState, RECIPES } from "../core/mod.ts";

export class Craft {
  private readonly state: GameState;
  private readonly buttons: {
    name: string;
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
        send({ type: "craft", recipe: name });

        if (event.detail > 0) button.blur();
      });

      li.appendChild(button);
      list.appendChild(li);
      this.buttons.push({ name, button });
    }
  }

  update() {
    for (const { name, button } of this.buttons) {
      const recipe = RECIPES[name];
      const owned = (this.state.inventory[recipe.output] ?? 0) > 0;

      button.textContent = owned
        ? `${recipe.output} (Owned)`
        : `Craft ${recipe.output}`;
    }
  }
}
