/// <reference path="../../typings/tsd.d.ts" />

import { DataFetcher, Data } from '../services/DataFetcher';
import { Parser } from '../parser';

export class RecipeBuilderCtrl {
  constructor($scope, DataFetcher: DataFetcher) {
    $scope.debug = '<nothing to debug>';
    $scope.recipeText = '';
    DataFetcher.fetchAll().then(function(data: Data) {
      $scope.$watch('recipesText', function(recipesText) {
        if (!recipesText) {
          return;
        }
        var recipes = Parser.parseRecipes(recipesText, data.measurementsText);
        $scope.debug = JSON.stringify(recipes[0].ingredients);
        $scope.ingredients = recipes[0].ingredients;
      });
    });
  }
}
