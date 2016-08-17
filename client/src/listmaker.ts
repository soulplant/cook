/// <reference path="../typings/tsd.d.ts" />

import { Ingredient, IngredientList, Quantity, Section, Recipe, ShoppingListRow } from './types';
import { parseSections, parseRecipes } from './parser';


export class ListMaker {
  recipes: Recipe[];
  aisleNames: string[];

  // What aisles ingredients are in.
  aisles: {[ingredient: string]: string};

  constructor(recipes: Recipe[], aislesText: string) {
    this.recipes = recipes;
    var sections = parseSections(aislesText);
    this.aisleNames = sections.map(function(section) { return section.header; });
    this.aisleNames.push('Other');
    this.aisles = {};

    var self = this;

    sections.forEach(function(section) {
      section.parts[0].forEach(function(ingredient) {
        self.aisles[ingredient] = section.header;
      });
    });
  }

  makeList(ingredients: IngredientList[]): ShoppingListRow[] {
    var byAisle: {[name: string]: IngredientList[]} = {};
    for (var i = 0; i < ingredients.length; i++) {
      var aisle = this.aisles[ingredients[i].name];
      if (!aisle) {
        aisle = 'Other';
      }
      if (!byAisle[aisle]) {
        byAisle[aisle] = [];
      }
      byAisle[aisle].push(ingredients[i]);
    }
    var results: ShoppingListRow[] = [];
    for (var i = 0; i < this.aisleNames.length; i++) {
      var aisle = this.aisleNames[i];
      var ingredientsInAisle = byAisle[aisle];
      if (!ingredientsInAisle) {
        continue;
      }
      ingredientsInAisle.sort(function(l, r) {
        if (l.name < r.name) {
          return 0;
        } else if (l.name == r.name) {
          return 0;
        } else {
          return 1;
        }
      });
      results.push({header: aisle});
      var self = this;
      var rows = ingredientsInAisle.map(function(i) {
        var shortNames = i.recipes.map(function(recipeId) {
          return getShortName(self.recipes[recipeId].name);
        });
        var note = '';
        if (shortNames.length > 0) {
          note = shortNames.join(', ');
        }
        return {note: note, ingredientList: i};
      });
      results.push.apply(results, rows);
    }
    return results;
  };
}

function allCaps(str: string): boolean {
  for (var i = 0; i < str.length; i++) {
    if ('A' > str.charAt(i) || str.charAt(i) > 'Z') {
      return false;
    }
  }
  return true;
}

function startsWithCap(str: string): boolean {
  return allCaps(str.charAt(0));
}

// Make a method on ListMaker.
export function getShortName(string: string): string {
  var words = string.split(' ');
  if (words.length == 1 && allCaps(words[0])) {
    return words[0];
  }
  return words.filter(function(word) {
    return startsWithCap(word);
  }).map(function(word) {
    return word.charAt(0);
  }).join('');
}
