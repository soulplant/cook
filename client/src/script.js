var app = angular.module('app', []);

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

// [[250, 'g'], [200, 'g'], [1, 'bunch'], [2, 'bunch'], [], []]
// ->
// [[450, 'g'], [3, 'bunch']]]
function mergeQuantities(quantitiesList) {
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

function trimHeader(str) {
  return str.substring(1, str.length - 1).trim();
}

function parseSections(text) {
  if (!text) {
    return;
  }
  var lines = text.split('\n');
  var sections = [];
  var i = 0;
  while (true) {
    while (i < lines.length && lines[i].charAt(0) != '=') {
      i++;
    }
    if (i >= lines.length) {
      break;
    }
    var section = {
      header: trimHeader(lines[i]),
      parts: [],
    };
    i++;

    while (true) {
      var buf = [];
      while (i < lines.length && lines[i] != '') {
        buf.push(lines[i]);
        i++;
      }
      section.parts.push(buf);
      if (i >= lines.length) {
        break;
      }
      i++;
      if (i >= lines.length) {
        break;
      }
      if (lines[i] == '') {
        break;
      }
    }
    sections.push(section);
  }
  return sections;
}

function parseRecipes(recipesText, measurementsText) {
  var sections = parseSections(recipesText);
  var parser = new Parser(measurementsText.split('\n'));

  var recipes = [];
  for (var i = 0; i < sections.length; i++) {
    recipes.push({
      id: i,
      name: sections[i].header,
      ingredients: sections[i].parts[1].map(parser.parseIngredient.bind(parser)),
    });
  }

  return recipes;
}

function ListMaker(aislesText) {
  var sections = parseSections(aislesText);
  this.aisles = {};
  this.aisleNames = sections.map(function(section) { return section.header; });

  var self = this;

  sections.forEach(function(section) {
    section.parts[0].forEach(function(ingredient) {
      self.aisles[ingredient] = section.header;
    });
  });
}

ListMaker.prototype.makeList = function(ingredients) {
  var byAisle = {};
  for (var i = 0; i < ingredients.length; i++) {
    var aisle = this.aisles[ingredients[i].name];
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
      results.push({name: '= ' + aisle + ' =', quantities: []});
      results.push.apply(results, ingredientsInAisle);
    }
  }
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
    listMaker = new ListMaker(aisles);
    refreshList();
  });
  $scope.recipes = [];
  $scope.enabled = $scope.recipes.map(function() { return false; });

  $scope.aisleLookup = {};

  // Array.<{name: string, quantities: Array.<{0: int, 1: string}>}>
  $scope.ingredients = [];
  $scope.$watch('enabled', refreshList, true);

  function refreshList() {
    if (!listMaker) {
      return;
    }
    var selectedRecipes = [];
    $scope.recipes.map(function(recipe) {
      if ($scope.enabled[recipe.id]) {
        selectedRecipes.push(recipe);
      }
    });
    $scope.ingredients = listMaker.makeList(getIngredientList(selectedRecipes));
  }
});

function getIngredientList(recipes) {
  var ingredients = [];
  recipes.forEach(function(recipe) {
    ingredients.push.apply(ingredients, recipe.ingredients);
  });
  return mergeIngredients(ingredients);
}

function formatQuantity(q) {
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
  return parts.join(' ') + ' ' + q[1];
}

function getQuarters(x) {
  return Math.floor((x - Math.floor(x)) * 4);
}

app.filter('quantityList', function() {
  return function(list) {
    return list.map(formatQuantity).join(', ');
  };
});

function Parser(measurements) {
  this.measurements = measurements;
}

Parser.prototype.isMeasurement = function(word) {
  return this.measurements.indexOf(word) != -1;
};

Parser.prototype.parseIngredient = function(line) {
  if (line == '') {
    return null;
  }
  var words = line.split(' ');
  if (words.length == 0) {
    return null;
  }
  var number = undefined;
  var measurement = undefined;
  if (/^[0-9\/]+$/.test(words[0])) {
    number = parseNumber(words[0]);
    words = words.slice(1);
    if (words.length == 0) {
      return null;
    }
  }
  if (this.isMeasurement(words[0])) {
    measurement = words[0];
    words = words.slice(1);
    if (words.length == 0) {
      return null;
    }
  }
  var name = words.join(' ');
  var quantity = [number];
  if (measurement) {
    quantity.push(measurement);
  }
  if (number === undefined) {
    quantity = [];
  }
  return {
    quantity: quantity,
    name: name,
  };
};

function parseNumber(str) {
  if (str.indexOf('/') != -1) {
    return eval(str);
  }
  return parseInt(str);
}
