/// <reference path="../typings/tsd.d.ts" />

import { Parser } from './parser';
import { ListMaker, getShortName } from './listmaker';
import { Ingredient, IngredientList, Quantity, Section, Recipe, ShoppingListRow } from './types';

var app = angular.module('app', []);

// The scope that AppCtrl exists within.
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
  ingredients: ShoppingListRow[];

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
    $scope.recipes = Parser.parseRecipes(recipeText, measurementsText);
    listMaker = new ListMaker(Parser.parseAisles(aislesText));
    refreshList();
  });
  $scope.recipes = [];
  $scope.enabled = [];
  $scope.selectedRecipes = [];
  $scope.showSource = false;

  $scope.aisleLookup = {};
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
    $scope.ingredients = listMaker.makeList($scope.selectedRecipes);
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
