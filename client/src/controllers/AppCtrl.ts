/// <reference path="../../typings/tsd.d.ts" />

import { Ingredient, IngredientList, Quantity, Section, Recipe, ShoppingListRow } from '../types';
import { ListMaker, getShortName } from '../listmaker';
import { Parser } from '../parser';

export class AppCtrl {
  // The recipes listed in the main view.
  recipes: Recipe[] = [];

  // The ids of recipes that are enabled.
  enabled: number[] = [];

  // Whether each ingredient should show the recipes it is from.
  showSource: boolean = false;

  // Which recipes are marked for inclusion in the shopping list.
  selectedRecipes: Recipe[] = [];

  // The rows of a shopping list for the selected recipes.
  shoppingListRows: ShoppingListRow[] = [];

  constructor($scope: angular.IScope, DataFetcher) {
    var vm = this;
    $scope.$watch(() => { return vm.enabled; }, refreshList, true);

    var listMaker: ListMaker = null;
    DataFetcher.fetchAll().then(function(data) {
      vm.recipes = Parser.parseRecipes(data.recipesText, data.measurementsText);
      listMaker = new ListMaker(Parser.parseAisles(data.aislesText));
      refreshList();
    });

    function refreshList() {
      if (!listMaker) {
        return;
      }
      vm.selectedRecipes = [];
      vm.recipes.map(function(recipe) {
        if (vm.enabled[recipe.id]) {
          vm.selectedRecipes.push(recipe);
        }
      });
      vm.shoppingListRows = listMaker.makeList(vm.selectedRecipes);
    }
  }
}
