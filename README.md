# Island Survival

A small island survival game. Gather materials, craft an axe to enter the forest, and turn a campfire and wet leaves into a rescue signal. The goal is to escape the island by crafting a signal fire.

Deployed Page:
[Island Survival](https://lzhu73.github.io/CMPM121-D03/)

## User Documentation

### Features

- A seeded world with shore, rock, forest, and water terrain
- Resource gathering with seed-based drops and guarantees for flint and leaves
- An inventory panel and keyboard-accessible crafting buttons
- An axe that unlocks forest terrain
- Leaves that become wet when carried beside water
- A rescue ending, gathering animations, and sound effects

### How to Play

- Move: Use the arrow keys or WASD.
- Gather: Press G on the cell you are standing on. Each cell can be gathered once, even if nothing is found. Gathered cells become darker.
- Craft: Click a crafting button, or use Tab to select it and Enter to activate it. Missing materials are shown in the message panel.
- Sound: Click the Sound button to mute or unmute.
- Restart: Reload the page. Progress is not saved between reloads.

### Getting Rescued

1. Gather sticks on shore and stones on rock terrain.
2. Craft an axe to enter the forest.
3. Gather wood, leaves, and the other materials needed for a campfire. Flint can be found on rock terrain.
4. Carry leaves onto a cell directly beside water. All dry leaves become wet leaves. Diagonal neighbors do not count, and water itself cannot be entered.
5. Craft a campfire, then craft a signal fire using one campfire and five wet leaves.
6. When the rescue message appears, the game is finished. Movement, gathering, and crafting no longer change the game state.

Add `?seed=7` to the game URL to try another world. The same seed and commands produce the same terrain and gathering results.

### Run Locally

Requirements:

- Deno
- Git
- Internet access for the initial setup and dependency downloads

1. Clone the repository and open its folder:

```shell
git clone https://github.com/lzhu73/CMPM121-D03.git
cd CMPM121-D03
```

2. Install dependencies and enable the commit hook:

```shell
deno task setup
```

3. Start the development server and open the local URL printed in the terminal:

```shell
deno task dev
```

4. Run all checks and build the game, then preview the build:

```shell
deno task ci
deno task preview
```

## Developer Documentation

- [`core/terrain.ts`](core/terrain.ts): Seeded terrain, resource drop tables, terrain access requirements, and the leaf-wetting conversion data.
- [`core/recipes.ts`](core/recipes.ts): Recipe inputs, outputs, and the final recipe's `wins` flag.
- [`core/rules.ts`](core/rules.ts): Game state and commands. `apply()` handles movement, gathering, crafting, leaf wetting, and winning. `missingIngredients()` reports what a recipe lacks.
- [`core/mod.ts`](core/mod.ts): Exports the core's public interface for the client.
- [`game/controller.ts`](game/controller.ts): Converts keyboard and button input into commands and waits for presentation to finish.
- [`game/presenter.ts`](game/presenter.ts): Plays events in order and sends each event to the grid, HUD, and sound outputs.
- [`game/grid/grid_view.ts`](game/grid/grid_view.ts): Draws terrain and the player using Phaser, animates movement and gathering, and remembers displayed depleted cells.
- [`game/hud.ts`](game/hud.ts): Updates position, terrain, inventory, event messages, and the ending from played events.
- [`game/craft.ts`](game/craft.ts): Builds crafting buttons from the recipe table and refreshes them when the controller settles.
- [`game/sounds.ts`](game/sounds.ts): Maps events to sound effects using the Web Audio API.
- [`game/main.ts`](game/main.ts): Connects the core, controller, presenter, and page outputs.
- [`index.html`](index.html) and [`game/style.css`](game/style.css): Page structure and styling.

Game rules stay in `core/`, without browser APIs or Phaser. The client imports the core through `core/mod.ts`, and only `game/grid/` imports Phaser. Inventory events contain copies so later commands cannot rewrite previously recorded results.

### Adding a Recipe

1. Add a row to `RECIPES` in `core/recipes.ts`, with an `inputs` object and an `output` item name. Each successful craft produces one output item.
2. Make sure every input has a source: gathering, another recipe, or the leaf-wetting conversion. Do not create a dependency on the recipe's own output.
3. The generic crafting rule and button list already read the table. An ordinary recipe needs no new command or crafting branch. `RECIPE_NAMES` in `game/craft.ts` can optionally provide a custom button label.
4. To make an item unlock terrain, update `TERRAIN_ACCESS` in `core/terrain.ts`. Keep the opener reusable: other recipes should not consume it.
5. Use `wins: true` only for a recipe that should finish the game.
6. Run `deno task ci` and update [`TESTING.md`](TESTING.md) when the new recipe adds behavior that needs manual checking.

The current crafting rule prevents crafting an output already held. Recipes for stackable consumables would need this restriction adjusted.

### Testing

- `deno task test`: Run the core's `*_test.ts` files without a browser.
- `deno task check`: Type-check the core and client.
- `deno task ci`: Run formatting, linting, type checking, core tests, boundary checks, and the build.
- Follow [`TESTING.md`](TESTING.md) for manual gameplay, keyboard, animation, sound, and deployment checks.
- In the browser console, `game.state` shows logical state. The page's `#live` element shows the latest played event message.

## Credits

Tooling adapted from the [CMPM 121 Fall 2026 D2 starter](https://github.com/ucsc-cmpm-121-f26/d2-starter), with the Phaser setup following the instructor's E4 starter. Those repositories have no explicit repository license; no new license is assigned to that material. The D3 scaffold was instructor-directed and authored with Anthropic Claude agent assistance. Dependencies retain their respective licenses.

## Review bot

On every push to `main`, a review bot can comment on your commit. It's optional practice feedback, and it can be wrong, so weigh what it says. Until you set it up or opt out, the Review Bot workflow shows a red X and comments on every push. That X is about the bot: check the Deploy workflow separately to see whether your own checks passed.

[The workflow](.github/workflows/review-bot.yml) is the whole bot, and the top of that file explains how to set it up or opt out. [`REVIEWBOT.md`](REVIEWBOT.md) tells it what to look for, and it's yours to change.

Its comments are public if your repository is. It runs on a throwaway machine with your code, can browse the web, and spends your own BayLeaf allowance.
