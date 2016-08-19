/// <reference path="../typings/tsd.d.ts" />

import { DataFetcher, Data } from './services/DataFetcher';
import { AppCtrl } from './controllers/AppCtrl';
import { RecipeBuilderCtrl } from './controllers/RecipeBuilderCtrl';
import { Parser } from './parser';
import { ListMaker, getShortName } from './listmaker';
import { Ingredient, IngredientList, Quantity, Section, Recipe, ShoppingListRow } from './types';

var app = angular.module('app', []);

app.service('DataFetcher', DataFetcher);
app.controller('AppCtrl', AppCtrl);

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
app.controller('RecipeBuilderCtrl', RecipeBuilderCtrl);
