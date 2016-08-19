/// <reference path="../typings/tsd.d.ts" />

import { Ingredient, IngredientList, Quantity, Section, Recipe, ShoppingListRow } from './types';
import { parseSections } from './parser';

// Makes shopping lists out of lists of recipes.
export class ListMaker {
  aisleNames: string[];

  // What aisles ingredients are in.
  aisles: {[ingredient: string]: string};

  constructor(aislesText: string) {
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

  makeList(recipes: Recipe[]): ShoppingListRow[] {
    return this.makeListFromIngredients(recipes, ListMaker.getIngredientList(recipes));
  }

  makeListFromIngredients(recipes: Recipe[], ingredients: IngredientList[]): ShoppingListRow[] {
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
          return getShortName(recipes[recipeId].name);
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

  static getIngredientList(recipes: Recipe[]): IngredientList[] {
    var result = [];
    recipes.forEach(function(recipe) {
      recipe.ingredients.forEach(function(ingredient) {
        result.push(tagIngredientWithSource(ingredient, recipe));
      });
    });
    return ListMaker.mergeIngredients(result);
  }

  // Visibile for testing.
  static mergeIngredients(ingredients : Ingredient[]): IngredientList[] {
    var byName: {[name: string]: Ingredient[]} = {};
    ingredients.forEach(function(i) {
      var existing = byName[i.name];
      if (byName[i.name] == undefined) {
        byName[i.name] = [];
      }
      byName[i.name].push(i);
    });
    var result: IngredientList[] = [];
    for (var name in byName) {
      var ingredientList = byName[name];
      var qs = ingredientList.map(function(i) {
        return i.quantity;
      });
      var recipes = ingredientList.map(function(i) {
        return i.recipe;
      });
      result.push({
        name: name,
        quantities: qs,
        recipes: recipes,
      });
    }
    return result.map(function(r) {
      return {
        name: r.name,
        quantities: ListMaker.mergeQuantities(r.quantities),
        recipes: uniq(r.recipes),
      };
    });
  }

  // [[250, 'g'], [200, 'g'], [1, 'bunch'], [2, 'bunch'], [], []]
  // ->
  // [[450, 'g'], [3, 'bunch']]]
  // Visible for testing.
  static mergeQuantities(quantities: Quantity[]): Quantity[] {
    var m = {};
    quantities.forEach(function(q) {
      if (q.length == 0) {
        return;
      }
      var name = q[1] || '';
      var count = q[0];
      if (m[name] === undefined) {
        m[name] = [0, name];
      }
      m[name][0] += q[0];
    });
    var result = [];
    for (var k in m) {
      result.push([m[k][0], k]);
    }
    return result;
  }
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

function tagIngredientWithSource(ingredient: Ingredient, recipe: Recipe): Ingredient {
  var copy = angular.copy(ingredient);
  copy.recipe = recipe.id;
  return copy;
}

function uniq(xs : number[]): number[] {
  var m: {[word: number]: number} = {};
  for (var i = 0; i < xs.length; i++) {
    m[xs[i]] = xs[i];
  }
  var result: number[] = [];
  for (var key in m) {
    result.push(m[key]);
  }
  result.sort();
  return result;
}
