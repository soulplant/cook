/// <reference path="../typings/tsd.d.ts" />

import { getIngredientList, formatQuantity } from '../src/app';
import { parseRecipes, IngredientParser } from '../src/parser';

describe('Formatting', function() {
  it('figures out quarters for quantities', function() {
    expect(formatQuantity([3.75, 'kg'])).toEqual('3 3/4 kg');
    expect(formatQuantity([3.78, 'kg'])).toEqual('3 3/4 kg');
    expect(formatQuantity([2.0, 'kg'])).toEqual('2 kg');
    expect(formatQuantity([2.26, 'kg'])).toEqual('2 1/4 kg');
    expect(formatQuantity([2.5, 'kg'])).toEqual('2 1/2 kg');
    expect(formatQuantity([0.5, 'kg'])).toEqual('1/2 kg');
  });
});

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
  '2 tomato',
  '4 can tinned tomato',
  '1/2 clove garlic',
  'salt',
].join('\n');

var measurementsText = [
  'can',
  'clove',
].join('\n');

function getQuantity(name, ingredients) {
  for (var i = 0; i < ingredients.length; i++) {
    if (ingredients[i].name == name) {
      return ingredients[i].quantities;
    }
  }
  return null;
}

describe('List Construction', function() {
  var recipes = parseRecipes(recipesText, measurementsText);
  it('Compiles a list of ingredients correctly', function() {
    var ingredients = getIngredientList(recipes);
    expect(ingredients.length).toEqual(5);
    expect(getQuantity('tomato', ingredients)).toEqual([[2, '']]);
    expect(getQuantity('tinned tomato', ingredients)).toEqual([[6, 'can']]);
    expect(getQuantity('garlic', ingredients)).toEqual([[2.5, 'clove']]);
    expect(getQuantity('salt', ingredients)).toEqual([]);
  });
});

describe('Ingredient Parser', function() {
  it('parses ingredients without a measurement correctly', function() {
    function test(line: string, expected: any[]) {
      var parser = new IngredientParser(['g']);
      var ingredient = parser.parseIngredient(line);
      expect(ingredient.quantity).toEqual(expected);
    }
    test('2 tomato', [2, '']);
    test('200 g flour', [200, 'g']);
  })
})
