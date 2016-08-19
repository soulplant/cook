/// <reference path="../typings/tsd.d.ts" />

import { formatQuantity } from '../src/app';
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
