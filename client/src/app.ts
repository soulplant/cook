/// <reference path="../typings/tsd.d.ts" />

import { parseSections, parseRecipes } from './parser';
import { ListMaker, getShortName } from './listmaker';
import { Ingredient, IngredientList, Quantity, Section, Recipe } from './types';

var app = angular.module('app', []);

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

function tagIngredientWithSource(ingredient: Ingredient, recipe: Recipe): Ingredient {
  var copy = angular.copy(ingredient);
  copy.recipe = recipe.id;
  return copy;
}

// [[250, 'g'], [200, 'g'], [1, 'bunch'], [2, 'bunch'], [], []]
// ->
// [[450, 'g'], [3, 'bunch']]]
// Visible for testing.
export function mergeQuantities(quantities: Quantity[]): Quantity[] {
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

// Visibile for testing.
export function mergeIngredients(ingredients : Ingredient[]): IngredientList[] {
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
      quantities: mergeQuantities(r.quantities),
      recipes: uniq(r.recipes),
    };
  });
}

export function getIngredientList(recipes: Recipe[]): IngredientList[] {
  var result = [];
  recipes.forEach(function(recipe) {
    recipe.ingredients.forEach(function(ingredient) {
      result.push(tagIngredientWithSource(ingredient, recipe));
    });
  });
  return mergeIngredients(result);
}

interface AppScope extends angular.IScope {
  // The recipes listed in the main view.
  recipes: Recipe[];

  // The ids of recipes that are enabled.
  enabled: number[];

  // Whether each ingredient should show the recipes it is from.
  showSource: boolean;

  // Which recipes are marked for inclusion in the shopping list.
  selectedRecipes: Recipe[];

  // The list of ingredients in the shopping list.
  // TODO: Create a type to represent this. Currently it's either a header or
  // an ingredient.
  ingredients: any[];

  aisleLookup: any;
}

app.controller('AppCtrl', function($scope: AppScope, $http, $q) {
  function fetch(name) {
    return $http.get('/data/' + name + '.txt').then(function(response) {
      return response.data;
    });
  }

  var listMaker: ListMaker = null;

  var fetches = [
    fetch('recipes'),
    fetch('measurements'),
    fetch('aisles')
  ];
  $q.all(fetches).then(function(responses) {
    var recipeText = responses[0];
    var measurementsText = responses[1];
    var aislesText = responses[2];
    $scope.recipes = parseRecipes(recipeText, measurementsText);
    listMaker = new ListMaker($scope.recipes, aislesText);
    refreshList();
  });
  $scope.recipes = [];
  $scope.enabled = [];
  $scope.selectedRecipes = [];
  $scope.showSource = false;

  $scope.aisleLookup = {};

  // Array.<{name: string, quantities: Array.<{0: int, 1: string}>, recipe: int}>
  $scope.ingredients = [];
  $scope.$watch('enabled', refreshList, true);

  function refreshList() {
    if (!listMaker) {
      return;
    }
    $scope.selectedRecipes = [];
    $scope.recipes.map(function(recipe) {
      if ($scope.enabled[recipe.id]) {
        $scope.selectedRecipes.push(recipe);
      }
    });
    $scope.ingredients = listMaker.makeList(getIngredientList($scope.selectedRecipes));
  }
});

export function formatQuantity(q) {
  if (q.length == 0) {
    return "";
  }
  var num = Math.floor(q[0]);
  var quarters = getQuarters(q[0]);
  var denom = null;
  switch (quarters) {
    case 0:
      break;
    case 1:
    case 3:
      denom = quarters + '/4';
      break;
    case 2:
      denom = '1/2'
      break;
  }
  var parts = [];
  if (num != 0) {
    parts.push(num);
  }
  if (denom != null) {
    parts.push(denom);
  }
  if (q[1]) {
    parts.push(q[1]);
  }
  return parts.join(' ');
}

function getQuarters(x) {
  return Math.floor((x - Math.floor(x)) * 4);
}

app.filter('quantityList', function() {
  return function(list) {
    if (!list) {
      return '';
    }
    return list.map(formatQuantity).join(', ');
  };
});

app.filter('shortRecipeName', function() {
  return function(recipe) {
    return getShortName(recipe.name);
  };
});
