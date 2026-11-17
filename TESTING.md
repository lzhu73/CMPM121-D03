# Manual test script

For a person, or an agent driving a browser. Run `deno task dev` and open the local URL with `?seed=121`. Before each section, reload. To read logical state, use `game.state` in the console. To read what has played, use the panel beside the grid, including the `#live` text, or look at the marker.

**Promotion rule:** a bug found by hand or by an agent becomes a permanent test in `core/` before it is fixed, unless it truly lives in `game/`, in which case add a step here.

| #  | Action                                                    | Expected observation                                                                                                                                     |
| -- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | Load the page                                             | One canvas. A pale marker at the center of a green map. No console errors.                                                                               |
| 2  | Tap the right arrow                                       | The marker slides one cell east. `#live` says `moved to 1, 0`. `player` is `{ x: 1, y: 0 }`.                                                             |
| 3  | Walk toward water or forest without an axe                | The player is blocked. Water displays "Cannot enter water!" and forest displays "Need axe". The player's position does not change.                       |
| 4  | Tap an arrow during a walk                                | The tap waits. The marker finishes the walk, then takes that step. It never skips a cell.                                                                |
| 5  | Mash arrows quickly, then stop                            | The marker settles on the cell `player` reports.                                                                                                         |
| 6  | Hold an arrow down                                        | The marker keeps walking. Holding into a wall repeats the bump.                                                                                          |
| 7  | Load `?seed=7`                                            | A different map.                                                                                                                                         |
| 8  | Run `game.state` in the console                           | Plain data containing seed, player, inventory, changedCells, flintPity, leafPity, and won. No stored terrain map.                                        |
| 9  | Press an arrow several times                              | Position and Terrain update when each movement event starts. After movement stops, the marker and panel match game.state.player.                         |
| 10 | Make the window short, then press the down arrow          | The page does not scroll. The marker moves.                                                                                                              |
| 11 | Click the sound button, then press an arrow               | The button reads `Sound: off`, and the arrow still moves the marker.                                                                                     |
| 12 | Click the sound button again                              | The button reads `Sound: on`, and you hear a two-note chime.                                                                                             |
| 13 | Tab to the sound button and press Space                   | It toggles. Arrow keys still move the marker.                                                                                                            |
| 14 | Listen while walking and bumping (headphones or speakers) | A soft tick on each step, and a low buzz on each bump. **This is the only check that a person can hear them.**                                           |
| 15 | On a high-resolution display, or at browser zoom 200%     | Grid edges stay sharp. The marker stays centered. Run `document.querySelector("canvas").width`: it is the canvas `clientWidth` times `devicePixelRatio`. |

## Gathering and Crafting

| #  | Action                                                     | Expected observation                                                                                                   |
| -- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 16 | Load the game                                              | Instructions tell the player to press G to gather materials.                                                           |
| 17 | Stand on shore terrain and press G                         | The player may collect a stick or wood. Inventory updates when a resource is found.                                    |
| 18 | Press G twice on the same cell                             | The second attempt displays "Already gathered". Inventory does not change.                                             |
| 19 | Stand on rock terrain and press G                          | The player may collect stone or flint.                                                                                 |
| 20 | Click Craft Axe without enough materials                   | A message displays the missing materials, such as "Missing stick: 2, stone: 1".                                        |
| 21 | Check crafting buttons                                     | Recipe names and any displayed ingredient requirements match core/recipes.ts.                                          |
| 22 | Collect the ingredients listed for the axe, then craft it  | The axe is added and exactly the recipe's ingredient amounts are deducted.                                             |
| 23 | Try crafting an axe that is already owned                  | The button remains keyboard-accessible. Clicking it reports that the axe is already owned, without changing inventory. |
| 24 | Walk into forest with an axe                               | The player enters the forest successfully.                                                                             |
| 25 | Stand in the forest and press G                            | The player may collect wood or leaves.                                                                                 |
| 26 | Carry leaves and move onto a cell next to water            | The leaves automatically become wet leaves.                                                                            |
| 27 | Try walking into water                                     | The player is blocked and a message explains that water cannot be entered.                                             |
| 28 | Collect the required materials and craft a campfire        | Materials are deducted and a campfire is added to inventory.                                                           |
| 29 | Click Build Rescue Signal without enough materials         | The message displays which materials are missing.                                                                      |
| 30 | Craft Build Rescue Signal with 1 campfire and 5 wet leaves | The game displays "Your signal was spotted. You are rescued!" and the player wins.                                     |

## After Winning

| #  | Action                      | Expected observation                                         |
| -- | --------------------------- | ------------------------------------------------------------ |
| 31 | Try moving after winning    | The player cannot move and the game state does not change.   |
| 32 | Try gathering after winning | No resources are added and the game state does not change.   |
| 33 | Try crafting after winning  | No new items are crafted and the game state does not change. |

## Final Checks

| #  | Action                              | Expected observation                                                              |
| -- | ----------------------------------- | --------------------------------------------------------------------------------- |
| 34 | Reload the game with the same seed  | The terrain layout is identical.                                                  |
| 35 | Run `deno task ci`                  | All formatting, linting, type-checking, boundary, testing, and build checks pass. |
| 36 | Open the deployed GitHub Pages game | Movement, gathering, crafting, and the rescue ending work correctly.              |
