/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var script_1 = __webpack_require__(1);
	describe('importing', function () {
	    it('works', function () {
	        expect(script_1.Something).not.toBe(null);
	    });
	});
	describe('parseNumber', function () {
	    it('handles halves', function () {
	        expect(script_1.parseNumber('1/2')).toEqual(0.5);
	    });
	});
	describe('Parser', function () {
	    var measurements = [
	        'g',
	        'kg',
	    ];
	    var parser = new script_1.Parser(measurements);
	    it('parses ingredients', function () {
	        var cases = [
	            ['3 kg tomato', { quantity: [3, 'kg'], name: 'tomato' }],
	            ['15 g chili flakes', { quantity: [15, 'g'], name: 'chili flakes' }],
	            ['salt', { quantity: [], name: 'salt' }],
	        ];
	        cases.forEach(function (c) {
	            expect(parser.parseIngredient(c[0])).toEqual(c[1]);
	        });
	    });
	});
	describe('Formatting', function () {
	    it('figures out quarters for quantities', function () {
	        expect(script_1.formatQuantity([3.75, 'kg'])).toEqual('3 3/4 kg');
	        expect(script_1.formatQuantity([3.78, 'kg'])).toEqual('3 3/4 kg');
	        expect(script_1.formatQuantity([2.0, 'kg'])).toEqual('2 kg');
	        expect(script_1.formatQuantity([2.26, 'kg'])).toEqual('2 1/4 kg');
	        expect(script_1.formatQuantity([2.5, 'kg'])).toEqual('2 1/2 kg');
	        expect(script_1.formatQuantity([0.5, 'kg'])).toEqual('1/2 kg');
	    });
	});
	function getQuantity(name, ingredients) {
	    for (var i = 0; i < ingredients.length; i++) {
	        if (ingredients[i].name == name) {
	            return ingredients[i].quantities;
	        }
	    }
	    return null;
	}
	describe('Integration', function () {
	    var recipesText = [
	        '= Tomato Soup =',
	        'Simple tomato soup',
	        '',
	        '2 can tinned tomato',
	        '2 clove garlic',
	        'olive oil',
	        'salt',
	        '',
	        '',
	        '= Tinned Tomatoes =',
	        'Tinned tomatoes for dinner!',
	        '',
	        '4 can tinned tomato',
	        '1/2 clove garlic',
	        'salt',
	    ].join('\n');
	    var measurementsText = [
	        'can',
	        'clove',
	    ].join('\n');
	    var recipes = script_1.parseRecipes(recipesText, measurementsText);
	    it('Parses data from the server correctly', function () {
	        expect(recipes.length).toEqual(2);
	        expect(recipes[0].name).toEqual('Tomato Soup');
	        expect(recipes[1].name).toEqual('Tinned Tomatoes');
	    });
	    it('Compiles a list of ingredients correctly', function () {
	        var ingredients = script_1.getIngredientList(recipes);
	        expect(ingredients.length).toEqual(4);
	        expect(getQuantity('tinned tomato', ingredients)).toEqual([[6, 'can']]);
	        expect(getQuantity('garlic', ingredients)).toEqual([[2.5, 'clove']]);
	        expect(getQuantity('salt', ingredients)).toEqual([]);
	    });
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	var parser_1 = __webpack_require__(3);
	__export(__webpack_require__(3));
	var app = angular.module('app', []);
	function uniq(xs) {
	    var m = {};
	    for (var i = 0; i < xs.length; i++) {
	        m[xs[i]] = xs[i];
	    }
	    var result = [];
	    for (var key in m) {
	        result.push(m[key]);
	    }
	    result.sort();
	    return result;
	}
	function mergeIngredients(ingredients) {
	    var byName = {};
	    ingredients.forEach(function (i) {
	        var existing = byName[i.name];
	        if (byName[i.name] == undefined) {
	            byName[i.name] = [];
	        }
	        byName[i.name].push(i);
	    });
	    var result = [];
	    for (var name in byName) {
	        var ingredientList = byName[name];
	        var qs = ingredientList.map(function (i) {
	            return i.quantity;
	        });
	        var recipes = ingredientList.map(function (i) {
	            return i.recipe;
	        });
	        result.push({
	            name: name,
	            quantities: qs,
	            recipes: recipes,
	        });
	    }
	    return result.map(function (r) {
	        return {
	            name: r.name,
	            quantities: mergeQuantities(r.quantities),
	            recipes: uniq(r.recipes),
	        };
	    });
	}
	function mergeQuantities(quantitiesList) {
	    var m = {};
	    quantitiesList.forEach(function (q) {
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
	    var sections = parser_1.parseSections(aislesText);
	    this.aisleNames = sections.map(function (section) { return section.header; });
	    this.aisleNames.push('Other');
	    var self = this;
	    sections.forEach(function (section) {
	        section.parts[0].forEach(function (ingredient) {
	            self.aisles[ingredient] = section.header;
	        });
	    });
	}
	function allCaps(str) {
	    for (var i = 0; i < str.length; i++) {
	        if ('A' > str.charAt(i) || str.charAt(i) > 'Z') {
	            return false;
	        }
	    }
	    return true;
	}
	function startsWithCap(str) {
	    return allCaps(str.charAt(0));
	}
	function getShortName(string) {
	    var words = string.split(' ');
	    if (words.length == 1 && allCaps(words[0])) {
	        return words[0];
	    }
	    return words.filter(function (word) {
	        return startsWithCap(word);
	    }).map(function (word) {
	        return word.charAt(0);
	    }).join('');
	}
	ListMaker.prototype.makeList = function (ingredients) {
	    var byAisle = {};
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
	            ingredientsInAisle.sort(function (l, r) {
	                if (l.name < r.name) {
	                    return 0;
	                }
	                else if (l.name == r.name) {
	                    return 0;
	                }
	                else {
	                    return 1;
	                }
	            });
	            results.push({ name: aisle, header: true });
	            var self = this;
	            ingredientsInAisle.forEach(function (i) {
	                var shortNames = i.recipes.map(function (recipeId) {
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
	    return results;
	};
	app.controller('AppCtrl', function ($scope, $http, $q) {
	    function fetch(name) {
	        return $http.get('/data/' + name + '.txt').then(function (response) {
	            return response.data;
	        });
	    }
	    var listMaker = null;
	    var fetches = [
	        fetch('recipes'),
	        fetch('measurements'),
	        fetch('aisles')
	    ];
	    $q.all(fetches).then(function (responses) {
	        var recipeText = responses[0];
	        var measurementsText = responses[1];
	        var aisles = responses[2];
	        $scope.recipes = parser_1.parseRecipes(recipeText, measurementsText);
	        listMaker = new ListMaker($scope.recipes, aisles);
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
	        $scope.recipes.map(function (recipe) {
	            if ($scope.enabled[recipe.id]) {
	                $scope.selectedRecipes.push(recipe);
	            }
	        });
	        $scope.ingredients = listMaker.makeList(getIngredientList($scope.selectedRecipes));
	    }
	});
	function tagIngredientWithSource(ingredient, recipe) {
	    var copy = angular.copy(ingredient);
	    copy.recipe = recipe.id;
	    return copy;
	}
	function getIngredientList(recipes) {
	    var result = [];
	    recipes.forEach(function (recipe) {
	        recipe.ingredients.forEach(function (ingredient) {
	            result.push(tagIngredientWithSource(ingredient, recipe));
	        });
	    });
	    return mergeIngredients(result);
	}
	exports.getIngredientList = getIngredientList;
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
	            denom = '1/2';
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
	exports.formatQuantity = formatQuantity;
	function getQuarters(x) {
	    return Math.floor((x - Math.floor(x)) * 4);
	}
	app.filter('quantityList', function () {
	    return function (list) {
	        if (!list) {
	            return '';
	        }
	        return list.map(formatQuantity).join(', ');
	    };
	});
	app.filter('shortRecipeName', function () {
	    return function (recipe) {
	        return getShortName(recipe.name);
	    };
	});


/***/ },
/* 2 */,
/* 3 */
/***/ function(module, exports) {

	"use strict";
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
	exports.parseSections = parseSections;
	function parseRecipes(recipesText, measurementsText) {
	    var sections = parseSections(recipesText);
	    var parser = new Parser(measurementsText.split('\n'));
	    var recipes = [];
	    for (var i = 0; i < sections.length; i++) {
	        var parseIngredient = function (line) {
	            return parser.parseIngredient(line);
	        };
	        recipes.push({
	            id: i,
	            name: sections[i].header,
	            ingredients: sections[i].parts[1].map(parseIngredient),
	        });
	    }
	    return recipes;
	}
	exports.parseRecipes = parseRecipes;
	function Parser(measurements) {
	    this.measurements = measurements;
	}
	exports.Parser = Parser;
	Parser.prototype.isMeasurement = function (word) {
	    return this.measurements.indexOf(word) != -1;
	};
	Parser.prototype.parseIngredient = function (line) {
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
	exports.parseNumber = parseNumber;


/***/ }
/******/ ]);