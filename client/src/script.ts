/// <reference path="typings/angularjs/angular.d.ts" />

import { Ingredient, IngredientList, Quantity, Section, Recipe } from './types';
import { parseSections, parseRecipes } from './parser';

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

function mergeIngredients(ingredients : Ingredient[]): IngredientList[] {
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

// [[250, 'g'], [200, 'g'], [1, 'bunch'], [2, 'bunch'], [], []]
// ->
// [[450, 'g'], [3, 'bunch']]]
function mergeQuantities(quantitiesList: Quantity[]): Quantity[] {
  var m = {};
  quantitiesList.forEach(function(q) {
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


function ListMaker(recipes, aislesText) {
  this.recipes = recipes;
  this.aisles = {};
  var sections = parseSections(aislesText);
  this.aisleNames = sections.map(function(section) { return section.header; });
  this.aisleNames.push('Other');

  var self = this;

  sections.forEach(function(section) {
    section.parts[0].forEach(function(ingredient) {
      self.aisles[ingredient] = section.header;
    });
  });
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

function getShortName(string: string): string {
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

ListMaker.prototype.makeList = function(ingredients: any[]) {
  var byAisle: {[name: string]: any[]} = {};
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
  var results = [];
  for (var i = 0; i < this.aisleNames.length; i++) {
    var aisle = this.aisleNames[i];
    var ingredientsInAisle = byAisle[aisle];
    if (ingredientsInAisle) {
      ingredientsInAisle.sort(function(l, r) {
        if (l.name < r.name) {
          return 0;
        } else if (l.name == r.name) {
          return 0;
        } else {
          return 1;
        }
      });
      results.push({name: aisle, header: true});
      var self = this;
      ingredientsInAisle.forEach(function(i) {
        var shortNames = i.recipes.map(function(recipeId) {
          return getShortName(self.recipes[recipeId].name);
        });
        i.note = '';
        if (shortNames.length > 0) {
          i.note = shortNames.join(', ');
        }
      });
      results.push.apply(results, ingredientsInAisle);
    }
  }
  // Array.<{name: string, header: ?bool, quantities: ?Array<{0: int, 1: string}>}>
  return results;
};

app.controller('AppCtrl', function($scope, $http, $q) {
  function fetch(name) {
    return $http.get('/data/' + name + '.txt').then(function(response) {
      return response.data;
    });
  }

  var listMaker = null;

  var fetches = [
    fetch('recipes'),
    fetch('measurements'),
    fetch('aisles')
  ];
  $q.all(fetches).then(function(responses) {
    var recipeText = responses[0];
    var measurementsText = responses[1];
    var aisles = responses[2];
    $scope.recipes = parseRecipes(recipeText, measurementsText);
    listMaker = new ListMaker($scope.recipes, aisles);
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

function tagIngredientWithSource(ingredient: Ingredient, recipe: Recipe): Ingredient {
  var copy = angular.copy(ingredient);
  copy.recipe = recipe.id;
  return copy;
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
