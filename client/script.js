var app = angular.module('app', []);

var testRecipes = [
  {
    id: 0,
    name: 'Tomato Soup',
    ingredients: [
      {
        quantity: [2, 'tbsp'],
        name: 'olive oil',
      },
      {
        quantity: [4],
        name: 'tomato',
      },
      {
        quantity: [1, 'bunch'],
        name: 'basil',
      },
    ],
  },
  {
    id: 1,
    name: 'Comfort Pasta',
    ingredients: [
      {
        quantity: [250, 'g'],
        name: 'pasta',
      },
      {
        quantity: [150, 'g'],
        name: 'pasta',
      },
      {
        quantity: [3, 'bunch'],
        name: 'basil',
      },
      {
        quantity: [2],
        name: 'tomato',
      },
    ],
  },
];

function mergeIngredients(ingredients) {
  var m = {};
  ingredients.forEach(function(i) {
    var existing = m[i.name];
    if (m[i.name] == undefined) {
      m[i.name] = [];
    }
    m[i.name].push(i);
  });
  var result = [];
  for (var k in m) {
    var ingredientList = m[k];
    var qs = ingredientList.map(function(i) {
      return i.quantity;
    });
    result.push({
      name: k,
      quantities: qs,
    });
  }
  return result.map(function(r) {
    return {
      name: r.name,
      quantities: mergeQuantities(r.quantities),
    };
  });
}

// [[250, 'g'], [200, 'g'], [1, 'bunch'], [2, 'bunch']]
// ->
// [[450, 'g'], [3, 'bunch']]
function mergeQuantities(quantitiesList) {
  var m = {};
  quantitiesList.forEach(function(q) {
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

app.controller('AppCtrl', function($scope) {
  $scope.recipes = testRecipes;
  $scope.enabled = $scope.recipes.map(function() { return false; });

  // Array.<{name: string, quantities: Array.<{0: int, 1: string}>}>
  $scope.ingredients = [];
  $scope.$watch('enabled', function(enabled) {
    var ingredients = [];
    $scope.recipes.map(function(recipe) {
      if (enabled[recipe.id]) {
        ingredients.push.apply(ingredients, recipe.ingredients);
      }
    });
    $scope.ingredients = mergeIngredients(ingredients);
  }, true);
});

function formatQuantity(q) {
  return q[0] + " " + q[1];
}

app.filter('quantityList', function() {
  return function(list) {
    return list.map(formatQuantity).join(', ');
  };
});
