/// <reference path="../../typings/tsd.d.ts" />

import { Ingredient, IngredientList, Quantity, Section, Recipe, ShoppingListRow } from '../types';
import { ListMaker, getShortName } from '../listmaker';
import { Parser } from '../parser';

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

export class AppCtrl {
  constructor($scope: AppScope, DataFetcher) {
    var listMaker: ListMaker = null;
    DataFetcher.fetchAll().then(function(data) {
      $scope.recipes = Parser.parseRecipes(data.recipesText, data.measurementsText);
      listMaker = new ListMaker(Parser.parseAisles(data.aislesText));
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
  }
}
