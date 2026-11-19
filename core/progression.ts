import {
  type Terrain,
  TERRAIN_ACCESS,
  TERRAIN_RESOURCES,
  WETTING,
} from "./terrain.ts";

import { type Recipe, RECIPES } from "./recipes.ts";

export type Progression = {
  items: Set<string>;
  terrains: Set<Terrain>;
  made: Set<string>;
  unreachable: string[];
};

// Fixpoint:
// Keep discovering accessible terrain, resources,
// and recipes until nothing new can be unlocked.

export function reachableProgression(
  recipes: Record<string, Recipe> = RECIPES,
): Progression {
  const items = new Set<string>();
  const terrains = new Set<Terrain>();
  const made = new Set<string>();

  let changed = true;

  while (changed) {
    changed = false;

    // Step 1: Find accessible terrain
    for (
      const terrain of Object.keys(TERRAIN_ACCESS) as Terrain[]
    ) {
      const access = TERRAIN_ACCESS[terrain];

      // Water cannot be entered
      if (access === false) continue;

      // Forest requires an axe
      if (
        typeof access === "string" &&
        !items.has(access)
      ) {
        continue;
      }

      if (!terrains.has(terrain)) {
        terrains.add(terrain);
        changed = true;
      }

      // Step 2: Discover resources
      for (const resource of TERRAIN_RESOURCES[terrain]) {
        if (
          resource.chance > 0 &&
          !items.has(resource.item)
        ) {
          items.add(resource.item);
          changed = true;
        }
      }
    }

    // Step 3: Leaves can become wet near water
    if (
      items.has(WETTING.input) &&
      !items.has(WETTING.output)
    ) {
      items.add(WETTING.output);
      changed = true;
    }

    // Step 4: Discover craftable recipes
    for (const [name, recipe] of Object.entries(recipes)) {
      if (made.has(name)) continue;

      const canCraft = Object.keys(recipe.inputs).every(
        (item) => items.has(item),
      );

      if (canCraft) {
        made.add(name);
        items.add(recipe.output);
        changed = true;
      }
    }
  }

  return {
    items,
    terrains,
    made,
    unreachable: Object.keys(recipes).filter(
      (name) => !made.has(name),
    ),
  };
}

// Check whether the winning recipe is reachable
export function canReachEnding(): boolean {
  const progression = reachableProgression();

  return Object.entries(RECIPES).some(
    ([name, recipe]) =>
      recipe.wins === true &&
      progression.made.has(name),
  );
}
